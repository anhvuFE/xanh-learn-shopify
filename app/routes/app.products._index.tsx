// Products listing page with filtering, sorting, and bulk actions

import {
  Page,
  Layout,
  Card,
  Button,
  IndexTable,
  IndexFilters,
  useIndexResourceState,
  Text,
  Badge,
  Thumbnail,
  InlineStack,
  Box,
  EmptyState,
  useBreakpoints,
} from '@shopify/polaris';
import { PlusIcon, ImageIcon } from '@shopify/polaris-icons';
import { TitleBar } from '@shopify/app-bridge-react';
import { useState, useCallback, useMemo } from 'react';
import { useLoaderData, useNavigate } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { authenticate } from '../shopify.server';

// Loader to fetch products data
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // Mock data - replace with real API calls
  const products = [
    {
      id: '1',
      title: 'Premium Cotton T-Shirt',
      handle: 'premium-cotton-t-shirt',
      status: 'active' as const,
      vendor: 'Fashion Co.',
      productType: 'T-Shirts',
      tags: ['cotton', 'premium', 'unisex'],
      images: [
        {
          id: '1',
          src: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png',
          alt: 'Premium Cotton T-Shirt',
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
        },
        {
          id: '2',
          title: 'Medium / Black',
          price: 29.99,
          compareAtPrice: 39.99,
          inventoryQuantity: 200,
          sku: 'PCT-M-BLK',
        },
      ],
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      title: 'Wireless Bluetooth Headphones',
      handle: 'wireless-bluetooth-headphones',
      status: 'active' as const,
      vendor: 'TechSound',
      productType: 'Electronics',
      tags: ['wireless', 'bluetooth', 'audio'],
      images: [
        {
          id: '2',
          src: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-2_large.png',
          alt: 'Wireless Bluetooth Headphones',
        },
      ],
      variants: [
        {
          id: '3',
          title: 'Black',
          price: 99.99,
          compareAtPrice: 129.99,
          inventoryQuantity: 75,
          sku: 'WBH-BLK',
        },
      ],
      createdAt: '2024-01-10',
    },
    {
      id: '3',
      title: 'Organic Coffee Blend',
      handle: 'organic-coffee-blend',
      status: 'draft' as const,
      vendor: 'Coffee Masters',
      productType: 'Beverages',
      tags: ['organic', 'coffee', 'fair-trade'],
      images: [],
      variants: [
        {
          id: '4',
          title: '250g',
          price: 14.99,
          compareAtPrice: null,
          inventoryQuantity: 0,
          sku: 'OCB-250G',
        },
      ],
      createdAt: '2024-01-08',
    },
  ];

  return json({ products });
};

type Product = {
  id: string;
  title: string;
  handle: string;
  status: 'active' | 'draft' | 'archived';
  vendor: string;
  productType: string;
  tags: string[];
  images: Array<{ id: string; src: string; alt: string }>;
  variants: Array<{
    id: string;
    title: string;
    price: number;
    compareAtPrice: number | null;
    inventoryQuantity: number;
    sku: string;
  }>;
  createdAt: string;
};

export default function ProductsIndexPage() {
  const { products } = useLoaderData<{ products: Product[] }>();
  const navigate = useNavigate();
  const { smUp } = useBreakpoints();

  const [queryValue, setQueryValue] = useState('');
  const [sortValue, setSortValue] = useState('title-asc');
  const [selected, setSelected] = useState(0);

  const resourceName = {
    singular: 'product',
    plural: 'products',
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(products);

  // Filter products based on query
  const filteredProducts = useMemo(() => {
    if (!queryValue) return products;

    return products.filter((product) =>
      product.title.toLowerCase().includes(queryValue.toLowerCase()) ||
      product.vendor.toLowerCase().includes(queryValue.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(queryValue.toLowerCase()))
    );
  }, [products, queryValue]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const [field, direction] = sortValue.split('-');

    return [...filteredProducts].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (field) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'vendor':
          aValue = a.vendor;
          bValue = b.vendor;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'inventory':
          aValue = a.variants.reduce((sum, v) => sum + v.inventoryQuantity, 0);
          bValue = b.variants.reduce((sum, v) => sum + v.inventoryQuantity, 0);
          break;
        case 'created':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          aValue = a.title;
          bValue = b.title;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (direction === 'desc') {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });
  }, [filteredProducts, sortValue]);

  const handleFiltersQueryChange = useCallback(
    (value: string) => setQueryValue(value),
    []
  );

  const handleQueryValueRemove = useCallback(() => setQueryValue(''), []);
  const handleFiltersClearAll = useCallback(() => setQueryValue(''), []);

  const handleSortChange = useCallback((value: string) => setSortValue(value), []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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

  // Get total inventory
  const getTotalInventory = (variants: Product['variants']) => {
    return variants.reduce((sum, variant) => sum + variant.inventoryQuantity, 0);
  };

  // Sort options
  const sortOptions = [
    { label: 'Product title A-Z', value: 'title-asc' },
    { label: 'Product title Z-A', value: 'title-desc' },
    { label: 'Vendor A-Z', value: 'vendor-asc' },
    { label: 'Vendor Z-A', value: 'vendor-desc' },
    { label: 'Status', value: 'status-asc' },
    { label: 'Inventory (Low to High)', value: 'inventory-asc' },
    { label: 'Inventory (High to Low)', value: 'inventory-desc' },
    { label: 'Date created (Newest first)', value: 'created-desc' },
    { label: 'Date created (Oldest first)', value: 'created-asc' },
  ];

  // Bulk actions
  const promotedBulkActions = [
    {
      content: 'Set as active',
      onAction: () => console.log('Set as active:', selectedResources),
    },
    {
      content: 'Set as draft',
      onAction: () => console.log('Set as draft:', selectedResources),
    },
  ];

  const bulkActions = [
    {
      content: 'Archive products',
      onAction: () => console.log('Archive:', selectedResources),
    },
    {
      content: 'Delete products',
      onAction: () => console.log('Delete:', selectedResources),
      destructive: true,
    },
  ];

  // Table headers
  const headings = [
    { title: 'Product' },
    { title: 'Status' },
    { title: 'Inventory', alignment: 'end' as const },
    { title: 'Type' },
    { title: 'Vendor' },
  ];

  // Row markup
  const rowMarkup = sortedProducts.map((product, index) => (
    <IndexTable.Row
      id={product.id}
      key={product.id}
      selected={selectedResources.includes(product.id)}
      position={index}
      onClick={() => navigate(`/app/products/${product.id}`)}
    >
      <IndexTable.Cell>
        <InlineStack gap="300" blockAlign="center">
          <Thumbnail
            source={product.images[0]?.src || ImageIcon}
            alt={product.images[0]?.alt || product.title}
            size="small"
          />
          <Box minWidth="200">
            <Text as="span" variant="bodyMd" fontWeight="semibold">
              {product.title}
            </Text>
          </Box>
        </InlineStack>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Badge tone={getStatusBadge(product.status)?.tone}>
          {getStatusBadge(product.status)?.text}
        </Badge>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Text as="span" alignment="end" numeric>
          {getTotalInventory(product.variants)} in stock
        </Text>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Text as="span" variant="bodyMd">
          {product.productType}
        </Text>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Text as="span" variant="bodyMd">
          {product.vendor}
        </Text>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  // Empty state
  const emptyStateMarkup = (
    <EmptyState
      heading="Create your first product"
      action={{
        content: 'Add product',
        onAction: () => navigate('/app/products/new'),
      }}
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    >
      <p>
        Start by adding a product to your store. You can add images,
        set prices, manage inventory, and more.
      </p>
    </EmptyState>
  );

  return (
    <Page
      title="Products"
      primaryAction={{
        content: 'Add product',
        icon: PlusIcon,
        onAction: () => navigate('/app/products/new'),
      }}
    >
      <Layout>
        <Layout.Section>
          <Card padding="0">
            <IndexFilters
              sortOptions={sortOptions}
              sortSelected={sortValue}
              onSortChange={handleSortChange}
              queryValue={queryValue}
              queryPlaceholder="Search products"
              onQueryChange={handleFiltersQueryChange}
              onQueryClear={handleQueryValueRemove}
              onClearAll={handleFiltersClearAll}
              filters={[]}
              tabs={[]}
              selected={selected}
              onSelect={setSelected}
              canCreateNewView={false}
              loading={false}
            />

            {sortedProducts.length === 0 && queryValue === '' ? (
              emptyStateMarkup
            ) : (
              <IndexTable
                condensed={!smUp}
                resourceName={resourceName}
                itemCount={sortedProducts.length}
                selectedItemsCount={
                  allResourcesSelected ? 'All' : selectedResources.length
                }
                onSelectionChange={handleSelectionChange}
                promotedBulkActions={promotedBulkActions}
                bulkActions={bulkActions}
                headings={headings}
                sortable={[true, false, true, false, false]}
              >
                {rowMarkup}
              </IndexTable>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}