// Order detail page for viewing and managing individual orders

import {
  Page,
  Layout,
  Card,
  Button,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  Box,
  Divider,
  InlineGrid,
  DataTable,
  Thumbnail,
  Link,
  Icon,
  Select,
  TextField,
} from '@shopify/polaris';
import {
  EditIcon,
  EmailIcon,
  PhoneIcon,
  PrintIcon,
  DuplicateIcon,
  XIcon,
  PackageIcon,
  CashDollarFilledIcon,
  LocationIcon,
  ClockIcon,
  NoteIcon,
  ImageIcon,
} from '@shopify/polaris-icons';
import { TitleBar } from '@shopify/app-bridge-react';
import { useLoaderData, useParams, useNavigate } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { authenticate } from '../shopify.server';
import { useState } from 'react';

// Loader to fetch order data by ID
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const orderId = params.id;

  // Mock data - replace with real API call
  const order = {
    id: orderId,
    name: `#${orderId}`,
    email: 'john.doe@example.com',
    customer: {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      totalOrders: 12,
      totalSpent: 1245.67,
    },
    createdAt: '2024-01-25T10:30:00Z',
    updatedAt: '2024-01-25T14:45:00Z',
    processedAt: '2024-01-25T10:30:00Z',
    financialStatus: 'paid' as const,
    fulfillmentStatus: 'fulfilled' as const,
    currency: 'USD',
    subtotalPrice: 110.00,
    totalShipping: 10.00,
    totalTax: 5.50,
    totalPrice: 125.50,
    totalDiscounts: 0,
    refundedAmount: 0,
    tags: ['priority', 'vip-customer'],
    note: 'Customer requested gift wrapping. Handle with care.',
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      company: 'Doe Enterprises',
      address1: '123 Main St',
      address2: 'Suite 456',
      city: 'New York',
      province: 'NY',
      country: 'United States',
      zip: '10001',
      phone: '+1-555-0123',
    },
    billingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      company: 'Doe Enterprises',
      address1: '123 Main St',
      address2: 'Suite 456',
      city: 'New York',
      province: 'NY',
      country: 'United States',
      zip: '10001',
      phone: '+1-555-0123',
    },
    lineItems: [
      {
        id: '1',
        title: 'Premium Cotton T-Shirt',
        variantTitle: 'Medium / Black',
        sku: 'PCT-M-BLK',
        quantity: 1,
        price: 29.99,
        totalPrice: 29.99,
        image: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png',
        requiresShipping: true,
        taxable: true,
        fulfillmentStatus: 'fulfilled',
      },
      {
        id: '2',
        title: 'Wireless Bluetooth Headphones',
        variantTitle: 'Black',
        sku: 'WBH-BLK',
        quantity: 1,
        price: 80.01,
        totalPrice: 80.01,
        image: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-2_large.png',
        requiresShipping: true,
        taxable: true,
        fulfillmentStatus: 'fulfilled',
      },
    ],
    fulfillments: [
      {
        id: '1',
        status: 'success',
        createdAt: '2024-01-26T09:00:00Z',
        trackingCompany: 'FedEx',
        trackingNumber: '123456789',
        trackingUrl: 'https://www.fedex.com/track?123456789',
        lineItems: ['1', '2'],
      },
    ],
    transactions: [
      {
        id: '1',
        kind: 'sale',
        status: 'success',
        amount: 125.50,
        currency: 'USD',
        gateway: 'Shopify Payments',
        createdAt: '2024-01-25T10:31:00Z',
      },
    ],
    timeline: [
      {
        id: '1',
        event: 'Order created',
        createdAt: '2024-01-25T10:30:00Z',
        message: 'Order was created',
      },
      {
        id: '2',
        event: 'Payment received',
        createdAt: '2024-01-25T10:31:00Z',
        message: 'Payment of $125.50 was successfully processed',
      },
      {
        id: '3',
        event: 'Order fulfilled',
        createdAt: '2024-01-26T09:00:00Z',
        message: 'All items have been fulfilled and shipped',
      },
    ],
  };

  return json({ order });
};

type Order = {
  id: string;
  name: string;
  email: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    totalOrders: number;
    totalSpent: number;
  };
  createdAt: string;
  updatedAt: string;
  processedAt: string;
  financialStatus: 'authorized' | 'paid' | 'partially_paid' | 'partially_refunded' | 'pending' | 'refunded' | 'voided';
  fulfillmentStatus: 'fulfilled' | 'unfulfilled' | 'partial' | 'restocked';
  currency: string;
  subtotalPrice: number;
  totalShipping: number;
  totalTax: number;
  totalPrice: number;
  totalDiscounts: number;
  refundedAmount: number;
  tags: string[];
  note: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    company: string;
    address1: string;
    address2: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone: string;
  };
  billingAddress: {
    firstName: string;
    lastName: string;
    company: string;
    address1: string;
    address2: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone: string;
  };
  lineItems: Array<{
    id: string;
    title: string;
    variantTitle: string;
    sku: string;
    quantity: number;
    price: number;
    totalPrice: number;
    image: string;
    requiresShipping: boolean;
    taxable: boolean;
    fulfillmentStatus: string;
  }>;
  fulfillments: Array<{
    id: string;
    status: string;
    createdAt: string;
    trackingCompany: string;
    trackingNumber: string;
    trackingUrl: string;
    lineItems: string[];
  }>;
  transactions: Array<{
    id: string;
    kind: string;
    status: string;
    amount: number;
    currency: string;
    gateway: string;
    createdAt: string;
  }>;
  timeline: Array<{
    id: string;
    event: string;
    createdAt: string;
    message: string;
  }>;
};

export default function OrderDetailPage() {
  const { order } = useLoaderData<{ order: Order }>();
  const params = useParams();
  const navigate = useNavigate();
  const [internalNote, setInternalNote] = useState('');

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  // Format date time
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get financial status badge
  const getFinancialStatusBadge = (status: string) => {
    const statusMap = {
      authorized: { tone: 'info' as const, text: 'Authorized' },
      paid: { tone: 'success' as const, text: 'Paid' },
      partially_paid: { tone: 'warning' as const, text: 'Partially paid' },
      partially_refunded: { tone: 'warning' as const, text: 'Partially refunded' },
      pending: { tone: 'warning' as const, text: 'Pending' },
      refunded: { tone: 'critical' as const, text: 'Refunded' },
      voided: { tone: 'subdued' as const, text: 'Voided' },
    };
    return statusMap[status as keyof typeof statusMap];
  };

  // Get fulfillment status badge
  const getFulfillmentStatusBadge = (status: string) => {
    const statusMap = {
      fulfilled: { tone: 'success' as const, text: 'Fulfilled' },
      unfulfilled: { tone: 'subdued' as const, text: 'Unfulfilled' },
      partial: { tone: 'warning' as const, text: 'Partially fulfilled' },
      restocked: { tone: 'info' as const, text: 'Restocked' },
    };
    return statusMap[status as keyof typeof statusMap];
  };

  // Format address
  const formatAddress = (address: Order['shippingAddress']) => {
    return (
      <>
        <Text as="p" variant="bodyMd" fontWeight="semibold">
          {address.firstName} {address.lastName}
        </Text>
        {address.company && (
          <Text as="p" variant="bodyMd" tone="subdued">
            {address.company}
          </Text>
        )}
        <Text as="p" variant="bodyMd">
          {address.address1}
        </Text>
        {address.address2 && (
          <Text as="p" variant="bodyMd">
            {address.address2}
          </Text>
        )}
        <Text as="p" variant="bodyMd">
          {address.city}, {address.province} {address.zip}
        </Text>
        <Text as="p" variant="bodyMd">
          {address.country}
        </Text>
        {address.phone && (
          <Text as="p" variant="bodyMd">
            {address.phone}
          </Text>
        )}
      </>
    );
  };

  // Line items table
  const lineItemRows = order.lineItems.map((item) => [
    <InlineStack gap="300" blockAlign="center">
      <Thumbnail
        source={item.image || ImageIcon}
        alt={item.title}
        size="small"
      />
      <BlockStack gap="100">
        <Link url={`/app/products/${item.id}`} removeUnderline>
          <Text as="span" variant="bodyMd" fontWeight="semibold">
            {item.title}
          </Text>
        </Link>
        <Text as="p" variant="bodySm" tone="subdued">
          {item.variantTitle} • SKU: {item.sku}
        </Text>
      </BlockStack>
    </InlineStack>,
    formatCurrency(item.price),
    item.quantity,
    formatCurrency(item.totalPrice),
  ]);

  return (
    <Page
      backAction={{ content: 'Orders', onAction: () => navigate('/app/orders') }}
      title={order.name}
      titleMetadata={
        <InlineStack gap="200">
          <Badge tone={getFinancialStatusBadge(order.financialStatus)?.tone}>
            {getFinancialStatusBadge(order.financialStatus)?.text}
          </Badge>
          <Badge tone={getFulfillmentStatusBadge(order.fulfillmentStatus)?.tone}>
            {getFulfillmentStatusBadge(order.fulfillmentStatus)?.text}
          </Badge>
        </InlineStack>
      }
      primaryAction={{
        content: 'Fulfill order',
        disabled: order.fulfillmentStatus === 'fulfilled',
        onAction: () => console.log('Fulfill order'),
      }}
      secondaryActions={[
        {
          content: 'Print',
          icon: PrintIcon,
          onAction: () => window.print(),
        },
        {
          content: 'Duplicate',
          icon: DuplicateIcon,
          onAction: () => console.log('Duplicate order'),
        },
        {
          content: 'Cancel order',
          icon: XIcon,
          destructive: true,
          onAction: () => console.log('Cancel order'),
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            {/* Order Summary Header */}
            <Card>
              <Box padding="400" background="bg-surface-secondary" borderRadius="300">
                <InlineGrid columns={{ xs: 1, sm: 2, md: 4 }} gap="400">
                  <BlockStack gap="300">
                    <Box>
                      <InlineStack gap="300" blockAlign="center">
                        <Box>
                          <Icon source={ClockIcon} tone="subdued" />
                        </Box>
                        <BlockStack gap="100">
                          <Text as="p" variant="bodySm" tone="subdued">
                            Order placed
                          </Text>
                          <Text as="p" variant="bodyMd" fontWeight="semibold">
                            {formatDateTime(order.createdAt)}
                          </Text>
                        </BlockStack>
                      </InlineStack>
                    </Box>
                  </BlockStack>

                  <BlockStack gap="300">
                    <Box>
                      <InlineStack gap="300" blockAlign="center">
                        <Box>
                          <Icon source={CashDollarFilledIcon} tone="subdued" />
                        </Box>
                        <BlockStack gap="100">
                          <Text as="p" variant="bodySm" tone="subdued">
                            Total amount
                          </Text>
                          <Text as="p" variant="headingMd" fontWeight="semibold">
                            {formatCurrency(order.totalPrice, order.currency)}
                          </Text>
                        </BlockStack>
                      </InlineStack>
                    </Box>
                  </BlockStack>

                  <BlockStack gap="300">
                    <Box>
                      <InlineStack gap="300" blockAlign="center">
                        <Box>
                          <Icon source={PackageIcon} tone="subdued" />
                        </Box>
                        <BlockStack gap="100">
                          <Text as="p" variant="bodySm" tone="subdued">
                            Items
                          </Text>
                          <Text as="p" variant="bodyMd" fontWeight="semibold">
                            {order.lineItems.length} items
                          </Text>
                        </BlockStack>
                      </InlineStack>
                    </Box>
                  </BlockStack>

                  <BlockStack gap="300">
                    <Box>
                      <InlineStack gap="300" blockAlign="center">
                        <Box>
                          <Icon source={LocationIcon} tone="subdued" />
                        </Box>
                        <BlockStack gap="100">
                          <Text as="p" variant="bodySm" tone="subdued">
                            Ship to
                          </Text>
                          <Text as="p" variant="bodyMd" fontWeight="semibold">
                            {order.shippingAddress.city}, {order.shippingAddress.province}
                          </Text>
                        </BlockStack>
                      </InlineStack>
                    </Box>
                  </BlockStack>
                </InlineGrid>
              </Box>
            </Card>

            {/* Order Items */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Order Items
                </Text>

                <DataTable
                  columnContentTypes={['text', 'numeric', 'numeric', 'numeric']}
                  headings={['Product', 'Price', 'Quantity', 'Total']}
                  rows={lineItemRows}
                />

                <Divider />

                {/* Price Summary */}
                <Box paddingBlockStart="400">
                  <InlineStack align="end">
                    <Box minWidth="300px">
                      <BlockStack gap="300">
                        <InlineStack align="space-between">
                          <Text as="p" variant="bodyMd">
                            Subtotal
                          </Text>
                          <Text as="p" variant="bodyMd">
                            {formatCurrency(order.subtotalPrice, order.currency)}
                          </Text>
                        </InlineStack>

                        {order.totalDiscounts > 0 && (
                          <InlineStack align="space-between">
                            <Text as="p" variant="bodyMd">
                              Discount
                            </Text>
                            <Text as="p" variant="bodyMd" tone="success">
                              -{formatCurrency(order.totalDiscounts, order.currency)}
                            </Text>
                          </InlineStack>
                        )}

                        <InlineStack align="space-between">
                          <Text as="p" variant="bodyMd">
                            Shipping
                          </Text>
                          <Text as="p" variant="bodyMd">
                            {formatCurrency(order.totalShipping, order.currency)}
                          </Text>
                        </InlineStack>

                        <InlineStack align="space-between">
                          <Text as="p" variant="bodyMd">
                            Tax
                          </Text>
                          <Text as="p" variant="bodyMd">
                            {formatCurrency(order.totalTax, order.currency)}
                          </Text>
                        </InlineStack>

                        <Divider />

                        <InlineStack align="space-between">
                          <Text as="p" variant="headingMd" fontWeight="semibold">
                            Total
                          </Text>
                          <Text as="p" variant="headingMd" fontWeight="semibold">
                            {formatCurrency(order.totalPrice, order.currency)}
                          </Text>
                        </InlineStack>

                        {order.refundedAmount > 0 && (
                          <InlineStack align="space-between">
                            <Text as="p" variant="bodyMd" tone="critical">
                              Refunded
                            </Text>
                            <Text as="p" variant="bodyMd" tone="critical">
                              -{formatCurrency(order.refundedAmount, order.currency)}
                            </Text>
                          </InlineStack>
                        )}
                      </BlockStack>
                    </Box>
                  </InlineStack>
                </Box>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <BlockStack gap="400">
            {/* Customer Information */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Customer
                </Text>

                <Box padding="400" background="bg-surface-secondary" borderRadius="200">
                  <BlockStack gap="300">
                    <Link url={`/app/customers/${order.customer.id}`} removeUnderline>
                      <Text as="span" variant="bodyMd" fontWeight="semibold">
                        {order.customer.firstName} {order.customer.lastName}
                      </Text>
                    </Link>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {order.customer.totalOrders} orders • {formatCurrency(order.customer.totalSpent)}
                    </Text>
                    <Divider />
                    <BlockStack gap="200">
                      <InlineStack gap="300" blockAlign="center">
                        <Box>
                          <Icon source={EmailIcon} tone="subdued" />
                        </Box>
                        <Link url={`mailto:${order.customer.email}`} removeUnderline>
                          <Text as="span" variant="bodySm">
                            {order.customer.email}
                          </Text>
                        </Link>
                      </InlineStack>
                      {order.customer.phone && (
                        <InlineStack gap="300" blockAlign="center">
                          <Box>
                            <Icon source={PhoneIcon} tone="subdued" />
                          </Box>
                          <Text as="p" variant="bodySm">
                            {order.customer.phone}
                          </Text>
                        </InlineStack>
                      )}
                    </BlockStack>
                  </BlockStack>
                </Box>
              </BlockStack>
            </Card>

            {/* Shipping Address */}
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text as="h2" variant="headingMd">
                    Shipping Address
                  </Text>
                  <Button variant="plain" size="slim">
                    Edit
                  </Button>
                </InlineStack>

                <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                  <BlockStack gap="100">
                    {formatAddress(order.shippingAddress)}
                  </BlockStack>
                </Box>
              </BlockStack>
            </Card>

            {/* Billing Address */}
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text as="h2" variant="headingMd">
                    Billing Address
                  </Text>
                  <Button variant="plain" size="slim">
                    Edit
                  </Button>
                </InlineStack>

                <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                  <BlockStack gap="100">
                    {formatAddress(order.billingAddress)}
                  </BlockStack>
                </Box>
              </BlockStack>
            </Card>

            {/* Order Notes */}
            {order.note && (
              <Card>
                <BlockStack gap="400">
                  <InlineStack gap="300" blockAlign="center">
                    <Box>
                      <Icon source={NoteIcon} tone="subdued" />
                    </Box>
                    <Text as="h2" variant="headingMd">
                      Order Note
                    </Text>
                  </InlineStack>
                  <Text as="p" variant="bodyMd">
                    {order.note}
                  </Text>
                </BlockStack>
              </Card>
            )}

            {/* Tags */}
            {order.tags.length > 0 && (
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Tags
                  </Text>
                  <InlineStack gap="200" wrap>
                    {order.tags.map((tag) => (
                      <Badge key={tag} tone="info">
                        {tag}
                      </Badge>
                    ))}
                  </InlineStack>
                </BlockStack>
              </Card>
            )}

            {/* Fulfillment Information */}
            {order.fulfillments.length > 0 && (
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Fulfillment
                  </Text>

                  {order.fulfillments.map((fulfillment) => (
                    <Box
                      key={fulfillment.id}
                      padding="300"
                      background="bg-surface-secondary"
                      borderRadius="200"
                    >
                      <BlockStack gap="200">
                        <Badge tone="success">Fulfilled</Badge>
                        <Text as="p" variant="bodySm" tone="subdued">
                          {formatDateTime(fulfillment.createdAt)}
                        </Text>
                        {fulfillment.trackingNumber && (
                          <>
                            <Divider />
                            <Text as="p" variant="bodySm" fontWeight="semibold">
                              {fulfillment.trackingCompany}
                            </Text>
                            <Link url={fulfillment.trackingUrl} external removeUnderline>
                              <Text as="span" variant="bodySm">
                                {fulfillment.trackingNumber}
                              </Text>
                            </Link>
                          </>
                        )}
                      </BlockStack>
                    </Box>
                  ))}
                </BlockStack>
              </Card>
            )}

            {/* Payment Information */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Payment
                </Text>

                {order.transactions.map((transaction) => (
                  <Box
                    key={transaction.id}
                    padding="300"
                    background="bg-surface-secondary"
                    borderRadius="200"
                  >
                    <BlockStack gap="200">
                      <InlineStack align="space-between">
                        <Badge tone="success">
                          {transaction.status === 'success' ? 'Paid' : transaction.status}
                        </Badge>
                        <Text as="p" variant="bodyMd" fontWeight="semibold">
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </Text>
                      </InlineStack>
                      <Text as="p" variant="bodySm" tone="subdued">
                        {transaction.gateway}
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        {formatDateTime(transaction.createdAt)}
                      </Text>
                    </BlockStack>
                  </Box>
                ))}
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}