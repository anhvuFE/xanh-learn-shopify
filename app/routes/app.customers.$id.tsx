// Customer detail page for viewing and editing individual customers

import {
  Page,
  Layout,
  Card,
  Button,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  Avatar,
  Box,
  Divider,
  InlineGrid,
  EmptyState,
  DataTable,
  Link,
  Icon,
} from '@shopify/polaris';
import { EditIcon, DeleteIcon, EmailIcon, PhoneIcon } from '@shopify/polaris-icons';
import { TitleBar } from '@shopify/app-bridge-react';
import { useLoaderData, useParams, useNavigate } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { authenticate } from '../shopify.server';

// Loader to fetch customer data by ID
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const customerId = params.id;

  // Mock data - replace with real API call
  const customer = {
    id: customerId,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    acceptsMarketing: true,
    acceptsMarketingUpdatedAt: '2024-01-15T10:30:00Z',
    taxExempt: false,
    verifiedEmail: true,
    createdAt: '2023-08-15T14:30:00Z',
    updatedAt: '2024-01-25T09:45:00Z',
    state: 'enabled' as const,
    tags: ['vip', 'repeat-customer', 'high-value'],
    note: 'Preferred customer - offers free shipping on all orders. Interested in new product launches.',
    defaultAddress: {
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
    addresses: [
      {
        id: '1',
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
        default: true,
      },
      {
        id: '2',
        firstName: 'John',
        lastName: 'Doe',
        company: '',
        address1: '789 Oak Ave',
        address2: '',
        city: 'Brooklyn',
        province: 'NY',
        country: 'United States',
        zip: '11201',
        phone: '+1-555-0456',
        default: false,
      },
    ],
    orders: [
      {
        id: '#1001',
        date: '2024-01-25',
        total: 125.50,
        status: 'fulfilled',
        items: 2,
      },
      {
        id: '#998',
        date: '2024-01-15',
        total: 89.99,
        status: 'fulfilled',
        items: 1,
      },
      {
        id: '#987',
        date: '2024-01-05',
        total: 256.00,
        status: 'fulfilled',
        items: 5,
      },
      {
        id: '#965',
        date: '2023-12-20',
        total: 178.25,
        status: 'cancelled',
        items: 3,
      },
      {
        id: '#943',
        date: '2023-12-10',
        total: 345.00,
        status: 'fulfilled',
        items: 4,
      },
    ],
    statistics: {
      totalOrders: 12,
      totalSpent: 1245.67,
      averageOrderValue: 103.81,
      lastOrderDate: '2024-01-25',
      firstOrderDate: '2023-08-20',
    },
  };

  return json({ customer });
};

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  acceptsMarketing: boolean;
  acceptsMarketingUpdatedAt: string;
  taxExempt: boolean;
  verifiedEmail: boolean;
  createdAt: string;
  updatedAt: string;
  state: 'enabled' | 'disabled' | 'invited' | 'declined';
  tags: string[];
  note: string;
  defaultAddress: {
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
  addresses: Array<{
    id: string;
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
    default: boolean;
  }>;
  orders: Array<{
    id: string;
    date: string;
    total: number;
    status: string;
    items: number;
  }>;
  statistics: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate: string;
    firstOrderDate: string;
  };
};

export default function CustomerDetailPage() {
  const { customer } = useLoaderData<{ customer: Customer }>();
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

  // Get status badge
  const getStatusBadge = (state: string) => {
    const statusMap = {
      enabled: { tone: 'success' as const, text: 'Enabled' },
      disabled: { tone: 'critical' as const, text: 'Disabled' },
      invited: { tone: 'warning' as const, text: 'Invited' },
      declined: { tone: 'subdued' as const, text: 'Declined' },
    };
    return statusMap[state as keyof typeof statusMap];
  };

  // Get order status badge
  const getOrderStatusBadge = (status: string) => {
    const statusMap = {
      fulfilled: { tone: 'success' as const, text: 'Fulfilled' },
      pending: { tone: 'warning' as const, text: 'Pending' },
      cancelled: { tone: 'critical' as const, text: 'Cancelled' },
      refunded: { tone: 'subdued' as const, text: 'Refunded' },
    };
    return statusMap[status as keyof typeof statusMap] || { tone: 'subdued' as const, text: status };
  };

  // Format address
  const formatAddress = (address: Customer['defaultAddress']) => {
    const parts = [
      address.address1,
      address.address2,
      `${address.city}, ${address.province} ${address.zip}`,
      address.country,
    ].filter(Boolean);
    return parts.join(', ');
  };

  // Order table rows
  const orderRows = customer.orders.map((order) => [
    <Link url={`/app/orders/${order.id.replace('#', '')}`} removeUnderline>
      {order.id}
    </Link>,
    formatDate(order.date),
    <Badge tone={getOrderStatusBadge(order.status).tone}>
      {getOrderStatusBadge(order.status).text}
    </Badge>,
    `${order.items} ${order.items === 1 ? 'item' : 'items'}`,
    formatCurrency(order.total),
  ]);

  return (
    <Page
      backAction={{ content: 'Customers', onAction: () => navigate('/app/customers') }}
      title={`${customer.firstName} ${customer.lastName}`}
      titleMetadata={
        <Badge tone={getStatusBadge(customer.state)?.tone}>
          {getStatusBadge(customer.state)?.text}
        </Badge>
      }
      primaryAction={{
        content: 'Edit customer',
        icon: EditIcon,
        onAction: () => navigate(`/app/customers/${customer.id}/edit`),
      }}
      secondaryActions={[
        {
          content: 'Send email',
          icon: EmailIcon,
          onAction: () => window.location.href = `mailto:${customer.email}`,
        },
        {
          content: 'View in admin',
          onAction: () => window.open(`https://admin.shopify.com/store/customers/${customer.id}`, '_blank'),
        },
        {
          content: 'Delete',
          icon: DeleteIcon,
          destructive: true,
          onAction: () => console.log('Delete customer'),
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
            {/* Customer Overview */}
            <Card>
              <BlockStack gap="500">
                {/* Header Section */}
                <Box padding="200" background="bg-surface-secondary" borderRadius="300">
                  <InlineStack gap="400" blockAlign="center">
                    <Avatar
                      customer
                      name={`${customer.firstName} ${customer.lastName}`}
                      size="large"
                    />
                    <BlockStack gap="200">
                      <Text as="h2" variant="headingXl" fontWeight="bold">
                        {customer.firstName} {customer.lastName}
                      </Text>
                      <InlineStack gap="200" wrap>
                        {customer.verifiedEmail && (
                          <Badge tone="success" size="large">
                            Verified Email
                          </Badge>
                        )}
                        {customer.acceptsMarketing && (
                          <Badge tone="info" size="large">
                            Marketing Subscribed
                          </Badge>
                        )}
                        {customer.taxExempt && (
                          <Badge size="large">
                            Tax Exempt
                          </Badge>
                        )}
                      </InlineStack>
                    </BlockStack>
                  </InlineStack>
                </Box>

                <Divider />

                {/* Contact Information Section */}
                <BlockStack gap="400">
                  <Box>
                    <Text as="h3" variant="headingMd" fontWeight="semibold">
                      Contact Information
                    </Text>
                    <Box paddingBlockStart="300">
                      <BlockStack gap="300">
                        <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                          <InlineStack gap="300" blockAlign="center">
                            <Box>
                              <Icon source={EmailIcon} tone="subdued" />
                            </Box>
                            <BlockStack gap="100">
                              <Text as="p" variant="bodySm" tone="subdued">
                                Email
                              </Text>
                              <Link url={`mailto:${customer.email}`} removeUnderline>
                                <Text as="span" variant="bodyMd" fontWeight="medium">
                                  {customer.email}
                                </Text>
                              </Link>
                            </BlockStack>
                          </InlineStack>
                        </Box>

                        {customer.phone && (
                          <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                            <InlineStack gap="300" blockAlign="center">
                              <Box>
                                <Icon source={PhoneIcon} tone="subdued" />
                              </Box>
                              <BlockStack gap="100">
                                <Text as="p" variant="bodySm" tone="subdued">
                                  Phone
                                </Text>
                                <Link url={`tel:${customer.phone}`} removeUnderline>
                                  <Text as="span" variant="bodyMd" fontWeight="medium">
                                    {customer.phone}
                                  </Text>
                                </Link>
                              </BlockStack>
                            </InlineStack>
                          </Box>
                        )}
                      </BlockStack>
                    </Box>
                  </Box>

                  {/* Default Address Section */}
                  <Box>
                    <Text as="h3" variant="headingMd" fontWeight="semibold">
                      Default Address
                    </Text>
                    <Box paddingBlockStart="300">
                      <Box padding="400" background="bg-surface-secondary" borderRadius="200">
                        <BlockStack gap="200">
                          <Text as="p" variant="bodyMd" fontWeight="semibold">
                            {customer.defaultAddress.firstName} {customer.defaultAddress.lastName}
                          </Text>
                          {customer.defaultAddress.company && (
                            <Text as="p" variant="bodyMd" tone="subdued">
                              {customer.defaultAddress.company}
                            </Text>
                          )}
                          <Divider />
                          <BlockStack gap="100">
                            <Text as="p" variant="bodyMd">
                              {customer.defaultAddress.address1}
                            </Text>
                            {customer.defaultAddress.address2 && (
                              <Text as="p" variant="bodyMd">
                                {customer.defaultAddress.address2}
                              </Text>
                            )}
                            <Text as="p" variant="bodyMd">
                              {customer.defaultAddress.city}, {customer.defaultAddress.province} {customer.defaultAddress.zip}
                            </Text>
                            <Text as="p" variant="bodyMd">
                              {customer.defaultAddress.country}
                            </Text>
                          </BlockStack>
                        </BlockStack>
                      </Box>
                    </Box>
                  </Box>

                  {/* Tags Section */}
                  <Box>
                    <Text as="h3" variant="headingMd" fontWeight="semibold">
                      Customer Tags
                    </Text>
                    <Box paddingBlockStart="300">
                      <InlineStack gap="200" wrap>
                        {customer.tags.map((tag) => (
                          <Badge key={tag} tone="info" size="large">
                            {tag}
                          </Badge>
                        ))}
                      </InlineStack>
                    </Box>
                  </Box>
                </BlockStack>
              </BlockStack>
            </Card>

            {/* Customer Statistics */}
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Customer Statistics
                  </Text>

                  <InlineGrid columns={2} gap="400">
                    <Box>
                      <Text as="p" variant="bodyMd" tone="subdued">
                        Total spent
                      </Text>
                      <Text as="p" variant="headingLg">
                        {formatCurrency(customer.statistics.totalSpent)}
                      </Text>
                    </Box>

                    <Box>
                      <Text as="p" variant="bodyMd" tone="subdued">
                        Total orders
                      </Text>
                      <Text as="p" variant="headingLg">
                        {customer.statistics.totalOrders}
                      </Text>
                    </Box>

                    <Box>
                      <Text as="p" variant="bodyMd" tone="subdued">
                        Average order value
                      </Text>
                      <Text as="p" variant="headingLg">
                        {formatCurrency(customer.statistics.averageOrderValue)}
                      </Text>
                    </Box>

                    <Box>
                      <Text as="p" variant="bodyMd" tone="subdued">
                        Customer since
                      </Text>
                      <Text as="p" variant="headingLg">
                        {formatDate(customer.statistics.firstOrderDate)}
                      </Text>
                    </Box>
                  </InlineGrid>

                  <Divider />

                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd" fontWeight="semibold">
                      Last order
                    </Text>
                    <Text as="p" variant="bodyMd">
                      {formatDate(customer.statistics.lastOrderDate)}
                    </Text>
                  </BlockStack>
                </BlockStack>
              </Card>

              {/* Marketing Preferences */}
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    Marketing
                  </Text>

                  <InlineStack align="space-between">
                    <Text as="p" variant="bodyMd">
                      Email marketing
                    </Text>
                    <Badge tone={customer.acceptsMarketing ? 'success' : 'subdued'}>
                      {customer.acceptsMarketing ? 'Subscribed' : 'Not subscribed'}
                    </Badge>
                  </InlineStack>

                  {customer.acceptsMarketing && (
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Subscribed on {formatDateTime(customer.acceptsMarketingUpdatedAt)}
                    </Text>
                  )}
                </BlockStack>
              </Card>

              {/* Customer Note */}
              {customer.note && (
                <Card>
                  <BlockStack gap="300">
                    <Text as="h2" variant="headingMd">
                      Customer Note
                    </Text>
                    <Text as="p" variant="bodyMd">
                      {customer.note}
                    </Text>
                  </BlockStack>
                </Card>
              )}
            </BlockStack>
          </InlineGrid>
        </Layout.Section>

        {/* Addresses Section */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h2" variant="headingMd">
                  Addresses ({customer.addresses.length})
                </Text>
                <Button>Add address</Button>
              </InlineStack>

              <InlineGrid columns={{ xs: 1, sm: 2, lg: 3 }} gap="400">
                {customer.addresses.map((address) => (
                  <Box
                    key={address.id}
                    padding="400"
                    background="bg-surface-secondary"
                    borderRadius="200"
                  >
                    <BlockStack gap="200">
                      <InlineStack align="space-between">
                        <Text as="p" variant="bodyMd" fontWeight="semibold">
                          {address.firstName} {address.lastName}
                        </Text>
                        {address.default && (
                          <Badge tone="success">Default</Badge>
                        )}
                      </InlineStack>
                      {address.company && (
                        <Text as="p" variant="bodyMd">
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
                      <InlineStack gap="200">
                        <Button variant="plain" size="slim">
                          Edit
                        </Button>
                        <Button variant="plain" size="slim" tone="critical">
                          Delete
                        </Button>
                      </InlineStack>
                    </BlockStack>
                  </Box>
                ))}
              </InlineGrid>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Orders Section */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h2" variant="headingMd">
                  Recent Orders
                </Text>
                <Button variant="plain">View all orders</Button>
              </InlineStack>

              {customer.orders.length > 0 ? (
                <DataTable
                  columnContentTypes={['text', 'text', 'text', 'text', 'numeric']}
                  headings={['Order', 'Date', 'Status', 'Items', 'Total']}
                  rows={orderRows}
                />
              ) : (
                <EmptyState
                  heading="No orders yet"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>This customer hasn't placed any orders yet.</p>
                </EmptyState>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Timeline Section */}
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">
                Timeline
              </Text>

              <InlineGrid columns={2} gap="400">
                <Box>
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    Created
                  </Text>
                  <Text as="p" variant="bodyMd">
                    {formatDateTime(customer.createdAt)}
                  </Text>
                </Box>
                <Box>
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    Last Updated
                  </Text>
                  <Text as="p" variant="bodyMd">
                    {formatDateTime(customer.updatedAt)}
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