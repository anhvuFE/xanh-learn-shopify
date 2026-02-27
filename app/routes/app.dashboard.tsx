// Dashboard overview page with analytics and quick actions

import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineGrid,
  Button,
  Box,
  ProgressBar,
  List,
  InlineStack,
  Divider,
  Badge,
  Icon,
} from '@shopify/polaris';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  StarFilledIcon,
  CartIcon,
  PersonIcon,
  ChartVerticalFilledIcon,
} from '@shopify/polaris-icons';
import { TitleBar } from '@shopify/app-bridge-react';
import { useLoaderData } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { authenticate } from '../shopify.server';

// Loader to fetch dashboard data
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // Mock data - replace with real API calls
  const dashboardData = {
    metrics: {
      totalRevenue: { value: 45280, change: 12.5, period: 'vs last month' },
      totalOrders: { value: 324, change: -3.2, period: 'vs last month' },
      totalCustomers: { value: 1205, change: 8.7, period: 'vs last month' },
      conversionRate: { value: 2.4, change: 1.1, period: 'vs last month' },
    },
    recentOrders: [
      { id: '#1001', customer: 'John Doe', amount: 125.50, status: 'paid' },
      { id: '#1002', customer: 'Jane Smith', amount: 89.99, status: 'pending' },
      { id: '#1003', customer: 'Bob Johnson', amount: 256.00, status: 'paid' },
      { id: '#1004', customer: 'Alice Brown', amount: 178.25, status: 'shipped' },
    ],
    topProducts: [
      { name: 'Premium T-Shirt', sales: 156, revenue: 4680 },
      { name: 'Wireless Headphones', sales: 89, revenue: 8900 },
      { name: 'Coffee Mug Set', sales: 234, revenue: 3276 },
      { name: 'Yoga Mat', sales: 67, revenue: 2010 },
    ],
    goals: {
      monthlyRevenue: { current: 45280, target: 50000 },
      newCustomers: { current: 89, target: 100 },
    },
  };

  return json(dashboardData);
};

type DashboardData = {
  metrics: {
    totalRevenue: { value: number; change: number; period: string };
    totalOrders: { value: number; change: number; period: string };
    totalCustomers: { value: number; change: number; period: string };
    conversionRate: { value: number; change: number; period: string };
  };
  recentOrders: Array<{
    id: string;
    customer: string;
    amount: number;
    status: string;
  }>;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  goals: {
    monthlyRevenue: { current: number; target: number };
    newCustomers: { current: number; target: number };
  };
};

export default function DashboardPage() {
  const data = useLoaderData<DashboardData>();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      paid: { tone: 'success' as const, text: 'Paid' },
      pending: { tone: 'warning' as const, text: 'Pending' },
      shipped: { tone: 'info' as const, text: 'Shipped' },
    };
    return statusMap[status as keyof typeof statusMap] || { tone: 'subdued' as const, text: status };
  };

  const renderMetricCard = (
    title: string,
    value: string,
    change: number,
    period: string,
    icon: React.ReactNode
  ) => (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between">
          <Text as="h3" variant="headingMd" tone="subdued">
            {title}
          </Text>
          <Box background="bg-surface-secondary" padding="200" borderRadius="200">
            {icon}
          </Box>
        </InlineStack>

        <BlockStack gap="100">
          <Text as="h2" variant="heading2xl" fontWeight="bold">
            {value}
          </Text>
          <InlineStack gap="100" blockAlign="center">
            <Icon
              source={change >= 0 ? ArrowUpIcon : ArrowDownIcon}
              tone={change >= 0 ? 'success' : 'critical'}
            />
            <Text
              as="span"
              variant="bodyMd"
              tone={change >= 0 ? 'success' : 'critical'}
              fontWeight="semibold"
            >
              {Math.abs(change)}%
            </Text>
            <Text as="span" variant="bodyMd" tone="subdued">
              {period}
            </Text>
          </InlineStack>
        </BlockStack>
      </BlockStack>
    </Card>
  );

  return (
    <Page>
      <TitleBar title="Dashboard" />

      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Quick Actions */}
            <Card>
              <InlineStack align="space-between">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Quick Actions
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Manage your store efficiently
                  </Text>
                </BlockStack>
                <InlineStack gap="200">
                  <Button>Add Product</Button>
                  <Button variant="primary">Create Order</Button>
                </InlineStack>
              </InlineStack>
            </Card>

            {/* Metrics Grid */}
            <InlineGrid columns={{ xs: 1, sm: 2, lg: 4 }} gap="400">
              {renderMetricCard(
                'Total Revenue',
                formatCurrency(data.metrics.totalRevenue.value),
                data.metrics.totalRevenue.change,
                data.metrics.totalRevenue.period,
                <Icon source={ChartVerticalFilledIcon} />
              )}
              {renderMetricCard(
                'Total Orders',
                formatNumber(data.metrics.totalOrders.value),
                data.metrics.totalOrders.change,
                data.metrics.totalOrders.period,
                <Icon source={CartIcon} />
              )}
              {renderMetricCard(
                'Total Customers',
                formatNumber(data.metrics.totalCustomers.value),
                data.metrics.totalCustomers.change,
                data.metrics.totalCustomers.period,
                <Icon source={PersonIcon} />
              )}
              {renderMetricCard(
                'Conversion Rate',
                `${data.metrics.conversionRate.value}%`,
                data.metrics.conversionRate.change,
                data.metrics.conversionRate.period,
                <Icon source={StarFilledIcon} />
              )}
            </InlineGrid>

            {/* Goals Progress */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Monthly Goals
                </Text>

                <InlineGrid columns={{ xs: 1, sm: 2 }} gap="400">
                  <BlockStack gap="200">
                    <InlineStack align="space-between">
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        Monthly Revenue
                      </Text>
                      <Text as="p" variant="bodyMd" tone="subdued">
                        {formatCurrency(data.goals.monthlyRevenue.current)} / {formatCurrency(data.goals.monthlyRevenue.target)}
                      </Text>
                    </InlineStack>
                    <ProgressBar
                      progress={(data.goals.monthlyRevenue.current / data.goals.monthlyRevenue.target) * 100}
                      size="medium"
                    />
                  </BlockStack>

                  <BlockStack gap="200">
                    <InlineStack align="space-between">
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        New Customers
                      </Text>
                      <Text as="p" variant="bodyMd" tone="subdued">
                        {data.goals.newCustomers.current} / {data.goals.newCustomers.target}
                      </Text>
                    </InlineStack>
                    <ProgressBar
                      progress={(data.goals.newCustomers.current / data.goals.newCustomers.target) * 100}
                      size="medium"
                    />
                  </BlockStack>
                </InlineGrid>
              </BlockStack>
            </Card>

            {/* Recent Orders & Top Products */}
            <InlineGrid columns={{ xs: 1, lg: 2 }} gap="400">
              {/* Recent Orders */}
              <Card>
                <BlockStack gap="400">
                  <InlineStack align="space-between">
                    <Text as="h2" variant="headingMd">
                      Recent Orders
                    </Text>
                    <Button variant="plain">View all</Button>
                  </InlineStack>

                  <BlockStack gap="300">
                    {data.recentOrders.map((order) => (
                      <Box key={order.id} padding="300" background="bg-surface-secondary" borderRadius="200">
                        <InlineStack align="space-between" blockAlign="center">
                          <BlockStack gap="100">
                            <Text as="p" variant="bodyMd" fontWeight="semibold">
                              {order.id}
                            </Text>
                            <Text as="p" variant="bodyMd" tone="subdued">
                              {order.customer}
                            </Text>
                          </BlockStack>
                          <InlineStack gap="200" blockAlign="center">
                            <Text as="p" variant="bodyMd" fontWeight="semibold">
                              {formatCurrency(order.amount)}
                            </Text>
                            <Badge tone={getStatusBadge(order.status).tone}>
                              {getStatusBadge(order.status).text}
                            </Badge>
                          </InlineStack>
                        </InlineStack>
                      </Box>
                    ))}
                  </BlockStack>
                </BlockStack>
              </Card>

              {/* Top Products */}
              <Card>
                <BlockStack gap="400">
                  <InlineStack align="space-between">
                    <Text as="h2" variant="headingMd">
                      Top Products
                    </Text>
                    <Button variant="plain">View all</Button>
                  </InlineStack>

                  <BlockStack gap="300">
                    {data.topProducts.map((product, index) => (
                      <Box key={product.name} padding="300" background="bg-surface-secondary" borderRadius="200">
                        <InlineStack align="space-between" blockAlign="center">
                          <InlineStack gap="200" blockAlign="center">
                            <Text as="p" variant="bodyMd" tone="subdued">
                              #{index + 1}
                            </Text>
                            <BlockStack gap="100">
                              <Text as="p" variant="bodyMd" fontWeight="semibold">
                                {product.name}
                              </Text>
                              <Text as="p" variant="bodyMd" tone="subdued">
                                {product.sales} sales
                              </Text>
                            </BlockStack>
                          </InlineStack>
                          <Text as="p" variant="bodyMd" fontWeight="semibold">
                            {formatCurrency(product.revenue)}
                          </Text>
                        </InlineStack>
                      </Box>
                    ))}
                  </BlockStack>
                </BlockStack>
              </Card>
            </InlineGrid>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}