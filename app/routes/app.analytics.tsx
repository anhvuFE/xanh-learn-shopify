// Analytics Dashboard - Comprehensive sales and business analytics

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
  Select,
  DatePicker,
  Tabs,
  ProgressBar,
  DataTable,
  Icon,
  Popover,
  ActionList,
  RangeSlider,
  EmptyState,
  Banner,
  Thumbnail,
  RadioButton,
  Filters,
  ChoiceList,
} from '@shopify/polaris';
import {
  ChartVerticalFilledIcon,
  CalendarIcon,
  ExportIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CashDollarFilledIcon,
  CartIcon,
  PersonIcon,
  ProductIcon,
  LocationIcon,
  RefreshIcon,
  FilterIcon,
  ClockIcon,
  StarFilledIcon,
  ImageIcon,
} from '@shopify/polaris-icons';
import { TitleBar } from '@shopify/app-bridge-react';
import { useLoaderData, useNavigate } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { authenticate } from '../shopify.server';
import { useState, useCallback } from 'react';

// Loader to fetch analytics data
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // Mock analytics data - replace with real API calls
  const analyticsData = {
    overview: {
      revenue: {
        current: 125650.45,
        previous: 98420.30,
        change: 27.7,
      },
      orders: {
        current: 856,
        previous: 742,
        change: 15.4,
      },
      customers: {
        current: 2341,
        previous: 1982,
        change: 18.1,
      },
      averageOrderValue: {
        current: 146.85,
        previous: 132.64,
        change: 10.7,
      },
      conversionRate: {
        current: 3.24,
        previous: 2.87,
        change: 12.9,
      },
      cartAbandonment: {
        current: 68.5,
        previous: 72.3,
        change: -5.3,
      },
    },
    salesByPeriod: [
      { date: '2024-01-19', revenue: 15420, orders: 98 },
      { date: '2024-01-20', revenue: 18960, orders: 112 },
      { date: '2024-01-21', revenue: 12340, orders: 78 },
      { date: '2024-01-22', revenue: 22100, orders: 134 },
      { date: '2024-01-23', revenue: 19800, orders: 121 },
      { date: '2024-01-24', revenue: 16540, orders: 102 },
      { date: '2024-01-25', revenue: 20490, orders: 125 },
    ],
    topProducts: [
      {
        id: '1',
        title: 'Premium Cotton T-Shirt',
        image: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png',
        revenue: 24580,
        unitsSold: 820,
        growth: 15.2,
      },
      {
        id: '2',
        title: 'Wireless Bluetooth Headphones',
        image: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-2_large.png',
        revenue: 18990,
        unitsSold: 190,
        growth: 28.4,
      },
      {
        id: '3',
        title: 'Organic Coffee Blend',
        image: null,
        revenue: 14250,
        unitsSold: 950,
        growth: -5.8,
      },
      {
        id: '4',
        title: 'Yoga Mat',
        image: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-3_large.png',
        revenue: 11340,
        unitsSold: 378,
        growth: 42.1,
      },
      {
        id: '5',
        title: 'Stainless Steel Water Bottle',
        image: null,
        revenue: 9870,
        unitsSold: 493,
        growth: 8.9,
      },
    ],
    customerSegments: [
      { segment: 'New Customers', count: 845, revenue: 42300, percentage: 36 },
      { segment: 'Returning Customers', count: 623, revenue: 68900, percentage: 27 },
      { segment: 'VIP Customers', count: 156, revenue: 98450, percentage: 7 },
      { segment: 'At Risk', count: 289, revenue: 12500, percentage: 12 },
      { segment: 'Dormant', count: 428, revenue: 3500, percentage: 18 },
    ],
    salesByChannel: [
      { channel: 'Online Store', revenue: 89450, percentage: 71.2 },
      { channel: 'POS', revenue: 23100, percentage: 18.4 },
      { channel: 'Social Media', revenue: 8950, percentage: 7.1 },
      { channel: 'Marketplace', revenue: 4150, percentage: 3.3 },
    ],
    geographicData: [
      { region: 'North America', revenue: 68900, orders: 412, topCountry: 'United States' },
      { region: 'Europe', revenue: 34500, orders: 231, topCountry: 'United Kingdom' },
      { region: 'Asia Pacific', revenue: 15600, orders: 142, topCountry: 'Japan' },
      { region: 'Other', revenue: 6650, orders: 71, topCountry: 'Brazil' },
    ],
    trafficSources: [
      { source: 'Direct', sessions: 12450, conversionRate: 4.2 },
      { source: 'Organic Search', sessions: 8960, conversionRate: 3.8 },
      { source: 'Paid Search', sessions: 6230, conversionRate: 5.1 },
      { source: 'Social Media', sessions: 4890, conversionRate: 2.9 },
      { source: 'Email', sessions: 3120, conversionRate: 6.3 },
      { source: 'Referral', sessions: 1890, conversionRate: 3.5 },
    ],
  };

  return json(analyticsData);
};

export default function AnalyticsDashboardPage() {
  const data = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const [selectedTab, setSelectedTab] = useState(0);
  const [dateRange, setDateRange] = useState('last7days');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState(['all']);
  const [selectedRegions, setSelectedRegions] = useState(['all']);

  // Date range selector
  const [datePickerActive, setDatePickerActive] = useState(false);
  const [selectedDates, setSelectedDates] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date(),
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format number
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Format percentage
  const formatPercentage = (value: number, showSign = true) => {
    const sign = showSign && value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  // Get trend icon
  const getTrendIcon = (change: number) => {
    return change > 0 ? ArrowUpIcon : ArrowDownIcon;
  };

  // Get trend tone
  const getTrendTone = (change: number, inverse = false) => {
    if (inverse) {
      return change > 0 ? 'critical' : 'success';
    }
    return change > 0 ? 'success' : 'critical';
  };

  // Metric card component
  const MetricCard = ({ title, value, previousValue, change, format = 'currency', inverse = false }: any) => (
    <Card>
      <Box padding="500">
        <BlockStack gap="400">
          <Text as="h3" variant="headingMd" tone="subdued">
            {title}
          </Text>
          <Text as="h2" variant="heading3xl" fontWeight="bold">
            {format === 'currency' ? formatCurrency(value) :
             format === 'percentage' ? `${value}%` :
             formatNumber(value)}
          </Text>
          <InlineStack gap="300" blockAlign="center">
            <Box>
              <Icon source={getTrendIcon(change)} tone={getTrendTone(change, inverse)} />
            </Box>
            <InlineStack gap="200" blockAlign="baseline">
              <Text as="span" variant="bodyLg" tone={getTrendTone(change, inverse)} fontWeight="semibold">
                {formatPercentage(change)}
              </Text>
              <Text as="span" variant="bodyMd" tone="subdued">
                vs previous period
              </Text>
            </InlineStack>
          </InlineStack>
        </BlockStack>
      </Box>
    </Card>
  );

  // Tabs configuration
  const tabs = [
    {
      id: 'overview',
      content: 'Overview',
      accessibilityLabel: 'Overview tab',
      panelID: 'overview-panel',
    },
    {
      id: 'sales',
      content: 'Sales',
      accessibilityLabel: 'Sales tab',
      panelID: 'sales-panel',
    },
    {
      id: 'products',
      content: 'Products',
      accessibilityLabel: 'Products tab',
      panelID: 'products-panel',
    },
    {
      id: 'customers',
      content: 'Customers',
      accessibilityLabel: 'Customers tab',
      panelID: 'customers-panel',
    },
    {
      id: 'traffic',
      content: 'Traffic',
      accessibilityLabel: 'Traffic tab',
      panelID: 'traffic-panel',
    },
  ];

  // Top products table rows
  const topProductRows = data.topProducts.map((product) => [
    <InlineStack gap="300" blockAlign="center">
      <Thumbnail
        source={product.image || ImageIcon}
        alt={product.title}
        size="small"
      />
      <Text as="span" variant="bodyMd" fontWeight="semibold">
        {product.title}
      </Text>
    </InlineStack>,
    formatCurrency(product.revenue),
    formatNumber(product.unitsSold),
    <InlineStack gap="100" blockAlign="center">
      <Icon source={getTrendIcon(product.growth)} tone={getTrendTone(product.growth)} />
      <Text as="span" variant="bodyMd" tone={getTrendTone(product.growth)}>
        {formatPercentage(product.growth)}
      </Text>
    </InlineStack>,
  ]);

  // Customer segments table rows
  const customerSegmentRows = data.customerSegments.map((segment) => [
    segment.segment,
    formatNumber(segment.count),
    formatCurrency(segment.revenue),
    <Box>
      <Text as="p" variant="bodyMd">
        {segment.percentage}%
      </Text>
      <Box paddingBlockStart="100">
        <ProgressBar progress={segment.percentage} size="small" />
      </Box>
    </Box>,
  ]);

  // Traffic sources table rows
  const trafficSourceRows = data.trafficSources.map((source) => [
    source.source,
    formatNumber(source.sessions),
    `${source.conversionRate}%`,
    <ProgressBar progress={source.conversionRate * 10} size="small" tone="success" />,
  ]);

  return (
    <Page
      title="Analytics Dashboard"
      titleMetadata={
        <Badge tone="info">
          Live Data
        </Badge>
      }
      primaryAction={{
        content: 'Export Report',
        icon: ExportIcon,
        onAction: () => console.log('Export analytics report'),
      }}
      secondaryActions={[
        {
          content: 'Refresh',
          icon: RefreshIcon,
          onAction: () => console.log('Refresh data'),
        },
        {
          content: compareMode ? 'Disable Compare' : 'Enable Compare',
          onAction: () => setCompareMode(!compareMode),
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            {/* Date Range Selector */}
            <Card>
              <Box padding="400">
                <InlineStack align="space-between">
                  <InlineStack gap="300">
                    <Select
                      label=""
                      options={[
                        { label: 'Today', value: 'today' },
                        { label: 'Yesterday', value: 'yesterday' },
                        { label: 'Last 7 days', value: 'last7days' },
                        { label: 'Last 30 days', value: 'last30days' },
                        { label: 'Last 90 days', value: 'last90days' },
                        { label: 'Custom', value: 'custom' },
                      ]}
                      value={dateRange}
                      onChange={setDateRange}
                    />
                    {dateRange === 'custom' && (
                      <Popover
                        active={datePickerActive}
                        activator={
                          <Button
                            onClick={() => setDatePickerActive(!datePickerActive)}
                            icon={CalendarIcon}
                          >
                            Select dates
                          </Button>
                        }
                        onClose={() => setDatePickerActive(false)}
                      >
                        <DatePicker
                          month={selectedDates.start.getMonth()}
                          year={selectedDates.start.getFullYear()}
                          onChange={setSelectedDates}
                          onMonthChange={() => {}}
                          selected={selectedDates}
                          allowRange
                        />
                      </Popover>
                    )}
                  </InlineStack>

                  <Button
                    variant="plain"
                    icon={FilterIcon}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    Filters
                  </Button>
                </InlineStack>
              </Box>
            </Card>

            {/* Filters Section */}
            {showFilters && (
              <Card>
                <Box padding="400">
                  <BlockStack gap="400">
                    <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
                      <ChoiceList
                        title="Sales Channels"
                        choices={[
                          { label: 'All Channels', value: 'all' },
                          { label: 'Online Store', value: 'online' },
                          { label: 'POS', value: 'pos' },
                          { label: 'Social Media', value: 'social' },
                        ]}
                        selected={selectedChannels}
                        onChange={setSelectedChannels}
                      />

                      <ChoiceList
                        title="Regions"
                        choices={[
                          { label: 'All Regions', value: 'all' },
                          { label: 'North America', value: 'na' },
                          { label: 'Europe', value: 'eu' },
                          { label: 'Asia Pacific', value: 'apac' },
                        ]}
                        selected={selectedRegions}
                        onChange={setSelectedRegions}
                      />

                      <ChoiceList
                        title="Product Categories"
                        choices={[
                          { label: 'All Categories', value: 'all' },
                          { label: 'Clothing', value: 'clothing' },
                          { label: 'Electronics', value: 'electronics' },
                          { label: 'Food & Beverage', value: 'food' },
                        ]}
                        selected={['all']}
                        onChange={() => {}}
                      />
                    </InlineGrid>
                  </BlockStack>
                </Box>
              </Card>
            )}

            {/* Main Metrics */}
            <InlineGrid columns={{ xs: 1, sm: 2, md: 3 }} gap="400">
              <MetricCard
                title="Total Revenue"
                value={data.overview.revenue.current}
                previousValue={data.overview.revenue.previous}
                change={data.overview.revenue.change}
                format="currency"
              />
              <MetricCard
                title="Total Orders"
                value={data.overview.orders.current}
                previousValue={data.overview.orders.previous}
                change={data.overview.orders.change}
                format="number"
              />
              <MetricCard
                title="New Customers"
                value={data.overview.customers.current}
                previousValue={data.overview.customers.previous}
                change={data.overview.customers.change}
                format="number"
              />
              <MetricCard
                title="Avg Order Value"
                value={data.overview.averageOrderValue.current}
                previousValue={data.overview.averageOrderValue.previous}
                change={data.overview.averageOrderValue.change}
                format="currency"
              />
              <MetricCard
                title="Conversion Rate"
                value={data.overview.conversionRate.current}
                previousValue={data.overview.conversionRate.previous}
                change={data.overview.conversionRate.change}
                format="percentage"
              />
              <MetricCard
                title="Cart Abandonment"
                value={data.overview.cartAbandonment.current}
                previousValue={data.overview.cartAbandonment.previous}
                change={data.overview.cartAbandonment.change}
                format="percentage"
                inverse={true}
              />
            </InlineGrid>

            {/* Tabs Content */}
            <Card>
              <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
                {/* Overview Tab */}
                {selectedTab === 0 && (
                  <Box padding="400">
                    <BlockStack gap="400">
                      {/* Sales Trend Chart */}
                      <BlockStack gap="300">
                        <Text as="h2" variant="headingMd">
                          Sales Trend
                        </Text>
                        <Box padding="400" background="bg-surface-secondary" borderRadius="200">
                          <BlockStack gap="300">
                            {data.salesByPeriod.map((day, index) => (
                              <Box key={day.date}>
                                <InlineGrid columns="150px 1fr 100px" gap="400" alignItems="center">
                                  <Text as="p" variant="bodyMd">
                                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                  </Text>
                                  <Box>
                                    <ProgressBar
                                      progress={(day.revenue / 25000) * 100}
                                      size="medium"
                                      tone={index === data.salesByPeriod.length - 1 ? 'success' : 'primary'}
                                    />
                                  </Box>
                                  <Text as="p" variant="bodyMd" fontWeight="semibold" alignment="end">
                                    {formatCurrency(day.revenue)}
                                  </Text>
                                </InlineGrid>
                              </Box>
                            ))}
                          </BlockStack>
                        </Box>
                      </BlockStack>

                      {/* Sales by Channel */}
                      <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
                        <BlockStack gap="300">
                          <Text as="h3" variant="headingMd">
                            Sales by Channel
                          </Text>
                          <Box padding="400" background="bg-surface-secondary" borderRadius="200">
                            <BlockStack gap="300">
                              {data.salesByChannel.map((channel) => (
                                <BlockStack key={channel.channel} gap="100">
                                  <InlineStack align="space-between">
                                    <Text as="p" variant="bodyMd" fontWeight="medium">
                                      {channel.channel}
                                    </Text>
                                    <Text as="p" variant="bodyMd" fontWeight="semibold">
                                      {formatCurrency(channel.revenue)}
                                    </Text>
                                  </InlineStack>
                                  <ProgressBar
                                    progress={channel.percentage}
                                    size="small"
                                    tone="success"
                                  />
                                  <Text as="p" variant="bodySm" tone="subdued">
                                    {channel.percentage}% of total
                                  </Text>
                                </BlockStack>
                              ))}
                            </BlockStack>
                          </Box>
                        </BlockStack>

                        {/* Geographic Performance */}
                        <BlockStack gap="300">
                          <Text as="h3" variant="headingMd">
                            Geographic Performance
                          </Text>
                          <Box padding="400" background="bg-surface-secondary" borderRadius="200">
                            <BlockStack gap="300">
                              {data.geographicData.map((region) => (
                                <Box key={region.region}>
                                  <InlineStack align="space-between">
                                    <BlockStack gap="100">
                                      <Text as="p" variant="bodyMd" fontWeight="medium">
                                        {region.region}
                                      </Text>
                                      <Text as="p" variant="bodySm" tone="subdued">
                                        Top: {region.topCountry}
                                      </Text>
                                    </BlockStack>
                                    <BlockStack gap="100" align="end">
                                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                                        {formatCurrency(region.revenue)}
                                      </Text>
                                      <Text as="p" variant="bodySm" tone="subdued">
                                        {region.orders} orders
                                      </Text>
                                    </BlockStack>
                                  </InlineStack>
                                </Box>
                              ))}
                            </BlockStack>
                          </Box>
                        </BlockStack>
                      </InlineGrid>
                    </BlockStack>
                  </Box>
                )}

                {/* Sales Tab */}
                {selectedTab === 1 && (
                  <Box padding="400">
                    <BlockStack gap="400">
                      <Banner tone="info">
                        <p>Sales data is updated in real-time. Export reports for detailed analysis.</p>
                      </Banner>

                      <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
                        <Card>
                          <BlockStack gap="300">
                            <Text as="h3" variant="headingMd">
                              Sales Metrics
                            </Text>
                            <BlockStack gap="200">
                              <InlineStack align="space-between">
                                <Text as="p" variant="bodyMd">
                                  Gross Sales
                                </Text>
                                <Text as="p" variant="bodyMd" fontWeight="semibold">
                                  {formatCurrency(125650)}
                                </Text>
                              </InlineStack>
                              <InlineStack align="space-between">
                                <Text as="p" variant="bodyMd">
                                  Discounts
                                </Text>
                                <Text as="p" variant="bodyMd" tone="critical">
                                  -{formatCurrency(8450)}
                                </Text>
                              </InlineStack>
                              <InlineStack align="space-between">
                                <Text as="p" variant="bodyMd">
                                  Returns
                                </Text>
                                <Text as="p" variant="bodyMd" tone="critical">
                                  -{formatCurrency(3200)}
                                </Text>
                              </InlineStack>
                              <InlineStack align="space-between">
                                <Text as="p" variant="bodyMd">
                                  Taxes
                                </Text>
                                <Text as="p" variant="bodyMd">
                                  {formatCurrency(11500)}
                                </Text>
                              </InlineStack>
                              <Divider />
                              <InlineStack align="space-between">
                                <Text as="p" variant="headingSm" fontWeight="semibold">
                                  Net Sales
                                </Text>
                                <Text as="p" variant="headingSm" fontWeight="bold">
                                  {formatCurrency(114000)}
                                </Text>
                              </InlineStack>
                            </BlockStack>
                          </BlockStack>
                        </Card>

                        <Card>
                          <BlockStack gap="300">
                            <Text as="h3" variant="headingMd">
                              Payment Methods
                            </Text>
                            <BlockStack gap="200">
                              {[
                                { method: 'Credit Card', amount: 78900, percentage: 62.8 },
                                { method: 'PayPal', amount: 28500, percentage: 22.7 },
                                { method: 'Shop Pay', amount: 12650, percentage: 10.1 },
                                { method: 'Other', amount: 5600, percentage: 4.4 },
                              ].map((payment) => (
                                <BlockStack key={payment.method} gap="100">
                                  <InlineStack align="space-between">
                                    <Text as="p" variant="bodyMd">
                                      {payment.method}
                                    </Text>
                                    <Text as="p" variant="bodyMd" fontWeight="semibold">
                                      {formatCurrency(payment.amount)}
                                    </Text>
                                  </InlineStack>
                                  <ProgressBar progress={payment.percentage} size="small" />
                                </BlockStack>
                              ))}
                            </BlockStack>
                          </BlockStack>
                        </Card>
                      </InlineGrid>
                    </BlockStack>
                  </Box>
                )}

                {/* Products Tab */}
                {selectedTab === 2 && (
                  <Box padding="400">
                    <BlockStack gap="400">
                      <InlineStack align="space-between">
                        <Text as="h2" variant="headingMd">
                          Top Performing Products
                        </Text>
                        <Button variant="plain" onClick={() => navigate('/app/products')}>
                          View all products
                        </Button>
                      </InlineStack>

                      <DataTable
                        columnContentTypes={['text', 'numeric', 'numeric', 'text']}
                        headings={['Product', 'Revenue', 'Units Sold', 'Growth']}
                        rows={topProductRows}
                      />

                      <Card>
                        <BlockStack gap="300">
                          <Text as="h3" variant="headingMd">
                            Product Categories Performance
                          </Text>
                          <InlineGrid columns={{ xs: 1, md: 3 }} gap="300">
                            {[
                              { category: 'Clothing', revenue: 45600, growth: 12.3 },
                              { category: 'Electronics', revenue: 38900, growth: -5.2 },
                              { category: 'Food & Beverage', revenue: 28500, growth: 18.7 },
                            ].map((category) => (
                              <Box
                                key={category.category}
                                padding="300"
                                background="bg-surface-secondary"
                                borderRadius="200"
                              >
                                <BlockStack gap="200">
                                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                                    {category.category}
                                  </Text>
                                  <Text as="p" variant="headingMd">
                                    {formatCurrency(category.revenue)}
                                  </Text>
                                  <InlineStack gap="100" blockAlign="center">
                                    <Icon
                                      source={getTrendIcon(category.growth)}
                                      tone={getTrendTone(category.growth)}
                                    />
                                    <Text as="span" variant="bodyMd" tone={getTrendTone(category.growth)}>
                                      {formatPercentage(category.growth)}
                                    </Text>
                                  </InlineStack>
                                </BlockStack>
                              </Box>
                            ))}
                          </InlineGrid>
                        </BlockStack>
                      </Card>
                    </BlockStack>
                  </Box>
                )}

                {/* Customers Tab */}
                {selectedTab === 3 && (
                  <Box padding="400">
                    <BlockStack gap="400">
                      <Text as="h2" variant="headingMd">
                        Customer Segments
                      </Text>

                      <DataTable
                        columnContentTypes={['text', 'numeric', 'numeric', 'text']}
                        headings={['Segment', 'Customers', 'Revenue', 'Distribution']}
                        rows={customerSegmentRows}
                      />

                      <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
                        <Card>
                          <BlockStack gap="300">
                            <Text as="h3" variant="headingSm">
                              Customer Lifetime Value
                            </Text>
                            <Text as="p" variant="heading2xl" fontWeight="bold">
                              {formatCurrency(487.50)}
                            </Text>
                            <Text as="p" variant="bodyMd" tone="subdued">
                              Average across all customers
                            </Text>
                          </BlockStack>
                        </Card>

                        <Card>
                          <BlockStack gap="300">
                            <Text as="h3" variant="headingSm">
                              Customer Retention Rate
                            </Text>
                            <Text as="p" variant="heading2xl" fontWeight="bold">
                              68.5%
                            </Text>
                            <Text as="p" variant="bodyMd" tone="subdued">
                              Month over month retention
                            </Text>
                          </BlockStack>
                        </Card>
                      </InlineGrid>
                    </BlockStack>
                  </Box>
                )}

                {/* Traffic Tab */}
                {selectedTab === 4 && (
                  <Box padding="400">
                    <BlockStack gap="400">
                      <Text as="h2" variant="headingMd">
                        Traffic Sources
                      </Text>

                      <DataTable
                        columnContentTypes={['text', 'numeric', 'numeric', 'text']}
                        headings={['Source', 'Sessions', 'Conversion Rate', 'Performance']}
                        rows={trafficSourceRows}
                      />

                      <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
                        <Card>
                          <BlockStack gap="300">
                            <Text as="h3" variant="headingSm">
                              Page Views
                            </Text>
                            <Text as="p" variant="heading2xl" fontWeight="bold">
                              {formatNumber(125840)}
                            </Text>
                            <InlineStack gap="100" blockAlign="center">
                              <Icon source={ArrowUpIcon} tone="success" />
                              <Text as="span" variant="bodyMd" tone="success">
                                +15.2%
                              </Text>
                            </InlineStack>
                          </BlockStack>
                        </Card>

                        <Card>
                          <BlockStack gap="300">
                            <Text as="h3" variant="headingSm">
                              Avg Session Duration
                            </Text>
                            <Text as="p" variant="heading2xl" fontWeight="bold">
                              3:42
                            </Text>
                            <InlineStack gap="100" blockAlign="center">
                              <Icon source={ArrowUpIcon} tone="success" />
                              <Text as="span" variant="bodyMd" tone="success">
                                +8.3%
                              </Text>
                            </InlineStack>
                          </BlockStack>
                        </Card>

                        <Card>
                          <BlockStack gap="300">
                            <Text as="h3" variant="headingSm">
                              Bounce Rate
                            </Text>
                            <Text as="p" variant="heading2xl" fontWeight="bold">
                              42.3%
                            </Text>
                            <InlineStack gap="100" blockAlign="center">
                              <Icon source={ArrowDownIcon} tone="success" />
                              <Text as="span" variant="bodyMd" tone="success">
                                -3.8%
                              </Text>
                            </InlineStack>
                          </BlockStack>
                        </Card>
                      </InlineGrid>
                    </BlockStack>
                  </Box>
                )}
              </Tabs>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}