// Product detail page for viewing and editing individual products

import {
  Page,
  Layout,
  Card,
  Button,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  Thumbnail,
  Box,
  Divider,
  InlineGrid,
  EmptyState,
} from '@shopify/polaris';
import { EditIcon, DeleteIcon, ImageIcon } from '@shopify/polaris-icons';
import { TitleBar } from '@shopify/app-bridge-react';
import { useLoaderData, useParams, useNavigate } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { authenticate } from '../shopify.server';

// Loader to fetch product data by ID
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const productId = params.id;

  // Mock data - replace with real API call
  const product = {
    id: productId,
    title: 'Premium Cotton T-Shirt',
    handle: 'premium-cotton-t-shirt',
    description: 'Made from 100% organic cotton, this premium t-shirt offers exceptional comfort and durability. Perfect for everyday wear with a modern fit that flatters all body types.',
    status: 'active' as const,
    vendor: 'Fashion Co.',
    productType: 'T-Shirts',
    tags: ['cotton', 'premium', 'unisex', 'organic'],
    images: [
      {
        id: '1',
        src: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png',
        alt: 'Premium Cotton T-Shirt - Front View',
      },
      {
        id: '2',
        src: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-2_large.png',
        alt: 'Premium Cotton T-Shirt - Back View',
      },
    ],
    variants: [
      {
        id: '1',
        title: 'Small / Black',
        price: 29.99,
        compareAtPrice: 39.99,
        inventoryQuantity: 150,
        sku: 'PCT-S-BLK',
        weight: 0.2,
        weightUnit: 'kg',
        requiresShipping: true,
        taxable: true,
        options: [
          { name: 'Size', value: 'Small' },
          { name: 'Color', value: 'Black' },
        ],
      },
      {
        id: '2',
        title: 'Medium / Black',
        price: 29.99,
        compareAtPrice: 39.99,
        inventoryQuantity: 200,
        sku: 'PCT-M-BLK',
        weight: 0.2,
        weightUnit: 'kg',
        requiresShipping: true,
        taxable: true,
        options: [
          { name: 'Size', value: 'Medium' },
          { name: 'Color', value: 'Black' },
        ],
      },
      {
        id: '3',
        title: 'Large / White',
        price: 29.99,
        compareAtPrice: 39.99,
        inventoryQuantity: 100,
        sku: 'PCT-L-WHT',
        weight: 0.2,
        weightUnit: 'kg',
        requiresShipping: true,
        taxable: true,
        options: [
          { name: 'Size', value: 'Large' },
          { name: 'Color', value: 'White' },
        ],
      },
    ],
    options: [
      {
        id: '1',
        name: 'Size',
        position: 1,
        values: ['Small', 'Medium', 'Large'],
      },
      {
        id: '2',
        name: 'Color',
        position: 2,
        values: ['Black', 'White'],
      },
    ],
    seo: {
      title: 'Premium Cotton T-Shirt | Comfortable & Sustainable',
      description: 'Shop our premium cotton t-shirt made from 100% organic cotton. Available in multiple sizes and colors.',
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
  };

  return json({ product });
};

type Product = {
  id: string;
  title: string;
  handle: string;
  description: string;
  status: 'active' | 'draft' | 'archived';
  vendor: string;
  productType: string;
  tags: string[];
  images: Array<{ id: string; src: string; alt: string }>;
  variants: Array<{
    id: string;
    title: string;
    price: number;
    compareAtPrice: number;
    inventoryQuantity: number;
    sku: string;
    weight: number;
    weightUnit: string;
    requiresShipping: boolean;
    taxable: boolean;
    options: Array<{ name: string; value: string }>;
  }>;
  options: Array<{
    id: string;
    name: string;
    position: number;
    values: string[];
  }>;
  seo: {
    title: string;
    description: string;
  };
  createdAt: string;
  updatedAt: string;
};

export default function ProductDetailPage() {
  const { product } = useLoaderData<{ product: Product }>();
  const params = useParams();
  const navigate = useNavigate();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { tone: 'success' as const, text: 'Active' },
      draft: { tone: 'subdued' as const, text: 'Draft' },
      archived: { tone: 'warning' as const, text: 'Archived' },
    };
    return statusMap[status as keyof typeof statusMap];
  };

  // Calculate total inventory
  const totalInventory = product.variants.reduce(
    (sum, variant) => sum + variant.inventoryQuantity,
    0
  );

  // Get price range
  const prices = product.variants.map(v => v.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = minPrice === maxPrice
    ? formatCurrency(minPrice)
    : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;

  return (
    <Page
      backAction={{ content: 'Products', onAction: () => navigate('/app/products') }}
      title={product.title}
      titleMetadata={
        <Badge tone={getStatusBadge(product.status)?.tone}>
          {getStatusBadge(product.status)?.text}
        </Badge>
      }
      primaryAction={{
        content: 'Edit product',
        icon: EditIcon,
        onAction: () => navigate(`/app/products/${product.id}/edit`),
      }}
      secondaryActions={[
        {
          content: 'Duplicate',
          onAction: () => console.log('Duplicate product'),
        },
        {
          content: 'View in store',
          onAction: () => window.open(`https://example.myshopify.com/products/${product.handle}`, '_blank'),
        },
        {
          content: 'Delete',
          icon: DeleteIcon,
          destructive: true,
          onAction: () => console.log('Delete product'),
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
            {/* Product Images */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Product Images
                </Text>
                {product.images.length > 0 ? (
                  <BlockStack gap="300">
                    {product.images.map((image) => (
                      <Box key={image.id} padding="200" background="bg-surface-secondary" borderRadius="200">
                        <InlineStack gap="300" blockAlign="center">
                          <Thumbnail
                            source={image.src}
                            alt={image.alt}
                            size="large"
                          />
                          <Box>
                            <Text as="p" variant="bodyMd" fontWeight="semibold">
                              {image.alt}
                            </Text>
                            <Text as="p" variant="bodyMd" tone="subdued">
                              Image ID: {image.id}
                            </Text>
                          </Box>
                        </InlineStack>
                      </Box>
                    ))}
                  </BlockStack>
                ) : (
                  <EmptyState
                    heading="No images added"
                    image={ImageIcon}
                  >
                    <p>Add images to help customers understand your product better</p>
                  </EmptyState>
                )}
              </BlockStack>
            </Card>

            {/* Product Details */}
            <BlockStack gap="400">
              {/* Basic Information */}
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Product Information
                  </Text>

                  <BlockStack gap="300">
                    <Box>
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        Price Range
                      </Text>
                      <Text as="p" variant="headingMd">
                        {priceRange}
                      </Text>
                    </Box>

                    <Box>
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        Inventory
                      </Text>
                      <Text as="p" variant="bodyMd">
                        {totalInventory} in stock across {product.variants.length} variants
                      </Text>
                    </Box>

                    <Box>
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        Vendor
                      </Text>
                      <Text as="p" variant="bodyMd">
                        {product.vendor}
                      </Text>
                    </Box>

                    <Box>
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        Product Type
                      </Text>
                      <Text as="p" variant="bodyMd">
                        {product.productType}
                      </Text>
                    </Box>

                    <Box>
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        Tags
                      </Text>
                      <InlineStack gap="200" wrap={true}>
                        {product.tags.map((tag) => (
                          <Badge key={tag} tone="info">
                            {tag}
                          </Badge>
                        ))}
                      </InlineStack>
                    </Box>
                  </BlockStack>
                </BlockStack>
              </Card>

              {/* SEO Information */}
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Search Engine Optimization
                  </Text>

                  <BlockStack gap="300">
                    <Box>
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        Page Title
                      </Text>
                      <Text as="p" variant="bodyMd">
                        {product.seo.title}
                      </Text>
                    </Box>

                    <Box>
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        Meta Description
                      </Text>
                      <Text as="p" variant="bodyMd">
                        {product.seo.description}
                      </Text>
                    </Box>

                    <Box>
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        URL Handle
                      </Text>
                      <Text as="p" variant="bodyMd">
                        {product.handle}
                      </Text>
                    </Box>
                  </BlockStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </InlineGrid>
        </Layout.Section>

        <Layout.Section>
          {/* Product Description */}
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Product Description
              </Text>
              <Text as="p" variant="bodyMd">
                {product.description}
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          {/* Product Variants */}
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h2" variant="headingMd">
                  Variants ({product.variants.length})
                </Text>
                <Button>Add variant</Button>
              </InlineStack>

              <BlockStack gap="300">
                {product.variants.map((variant, index) => (
                  <Box key={variant.id} padding="400" background="bg-surface-secondary" borderRadius="200">
                    <InlineGrid columns={{ xs: 1, sm: 2, lg: 4 }} gap="300">
                      <Box>
                        <Text as="p" variant="bodyMd" fontWeight="semibold">
                          {variant.title}
                        </Text>
                        <Text as="p" variant="bodyMd" tone="subdued">
                          SKU: {variant.sku}
                        </Text>
                      </Box>

                      <Box>
                        <Text as="p" variant="bodyMd" fontWeight="semibold">
                          Price
                        </Text>
                        <InlineStack gap="100">
                          <Text as="p" variant="bodyMd">
                            {formatCurrency(variant.price)}
                          </Text>
                          {variant.compareAtPrice && (
                            <Text as="p" variant="bodyMd" tone="subdued">
                              <s>{formatCurrency(variant.compareAtPrice)}</s>
                            </Text>
                          )}
                        </InlineStack>
                      </Box>

                      <Box>
                        <Text as="p" variant="bodyMd" fontWeight="semibold">
                          Inventory
                        </Text>
                        <Text as="p" variant="bodyMd">
                          {variant.inventoryQuantity} in stock
                        </Text>
                      </Box>

                      <Box>
                        <Text as="p" variant="bodyMd" fontWeight="semibold">
                          Weight
                        </Text>
                        <Text as="p" variant="bodyMd">
                          {variant.weight} {variant.weightUnit}
                        </Text>
                      </Box>
                    </InlineGrid>
                  </Box>
                ))}
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          {/* Metadata */}
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">
                Product History
              </Text>
              <InlineGrid columns={{ xs: 1, sm: 2 }} gap="400">
                <Box>
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    Created
                  </Text>
                  <Text as="p" variant="bodyMd">
                    {formatDate(product.createdAt)}
                  </Text>
                </Box>
                <Box>
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    Last Updated
                  </Text>
                  <Text as="p" variant="bodyMd">
                    {formatDate(product.updatedAt)}
                  </Text>
                </Box>
              </InlineGrid>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}