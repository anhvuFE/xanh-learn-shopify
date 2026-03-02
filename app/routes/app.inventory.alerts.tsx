// Stock Alerts - Inventory monitoring and alert management system

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
  EmptyState,
  Icon,
  TextField,
  Select,
  Checkbox,
  RangeSlider,
  Banner,
  ProgressBar,
  Tabs,
  Modal,
  FormLayout,
  RadioButton,
  Toast,
  Frame,
} from '@shopify/polaris';
import {
  AlertCircleIcon,
  EmailIcon,
  SettingsIcon,
  NotificationIcon,
  ChartVerticalFilledIcon,
  ExportIcon,
  ImageIcon,
  CheckIcon,
  XIcon,
  ClockIcon,
} from '@shopify/polaris-icons';
import { TitleBar } from '@shopify/app-bridge-react';
import { useLoaderData, useNavigate } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { authenticate } from '../shopify.server';
import { useState, useCallback } from 'react';

// Loader to fetch inventory alerts data
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // Mock data - replace with real API calls
  const alertsData = {
    stats: {
      criticalItems: 8,
      lowStockItems: 15,
      outOfStock: 3,
      totalAlerts: 26,
    },
    products: [
      {
        id: '1',
        title: 'Premium Cotton T-Shirt',
        sku: 'PCT-M-BLK',
        variant: 'Medium / Black',
        image: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png',
        currentStock: 5,
        minStock: 20,
        reorderPoint: 50,
        dailySales: 3.5,
        daysUntilStockout: 1.4,
        status: 'critical' as const,
        lastRestocked: '2024-01-15',
        supplier: 'Fashion Co.',
      },
      {
        id: '2',
        title: 'Wireless Bluetooth Headphones',
        sku: 'WBH-BLK',
        variant: 'Black',
        image: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-2_large.png',
        currentStock: 0,
        minStock: 10,
        reorderPoint: 30,
        dailySales: 2.1,
        daysUntilStockout: 0,
        status: 'out_of_stock' as const,
        lastRestocked: '2024-01-10',
        supplier: 'TechSound',
      },
      {
        id: '3',
        title: 'Organic Coffee Blend',
        sku: 'OCB-250G',
        variant: '250g',
        image: null,
        currentStock: 35,
        minStock: 30,
        reorderPoint: 60,
        dailySales: 5.2,
        daysUntilStockout: 6.7,
        status: 'low' as const,
        lastRestocked: '2024-01-20',
        supplier: 'Coffee Masters',
      },
      {
        id: '4',
        title: 'Yoga Mat',
        sku: 'YM-PRP',
        variant: 'Purple',
        image: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-3_large.png',
        currentStock: 125,
        minStock: 20,
        reorderPoint: 40,
        dailySales: 1.8,
        daysUntilStockout: 69.4,
        status: 'healthy' as const,
        lastRestocked: '2024-01-05',
        supplier: 'Wellness Inc.',
      },
    ],
    alerts: [
      {
        id: '1',
        product: 'Premium Cotton T-Shirt',
        type: 'critical',
        message: 'Stock critically low - only 5 units remaining',
        timestamp: '2024-01-25T14:30:00Z',
        acknowledged: false,
      },
      {
        id: '2',
        product: 'Wireless Bluetooth Headphones',
        type: 'out_of_stock',
        message: 'Product is out of stock',
        timestamp: '2024-01-25T10:00:00Z',
        acknowledged: false,
      },
      {
        id: '3',
        product: 'Organic Coffee Blend',
        type: 'low',
        message: 'Stock below reorder point',
        timestamp: '2024-01-24T16:45:00Z',
        acknowledged: true,
      },
    ],
    settings: {
      emailNotifications: true,
      webhookEnabled: false,
      notificationEmail: 'inventory@example.com',
      webhookUrl: '',
      alertThresholds: {
        critical: 10,
        low: 25,
        reorderPoint: 50,
      },
    },
  };

  return json(alertsData);
};

type Product = {
  id: string;
  title: string;
  sku: string;
  variant: string;
  image: string | null;
  currentStock: number;
  minStock: number;
  reorderPoint: number;
  dailySales: number;
  daysUntilStockout: number;
  status: 'critical' | 'out_of_stock' | 'low' | 'healthy';
  lastRestocked: string;
  supplier: string;
};

type Alert = {
  id: string;
  product: string;
  type: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
};

export default function InventoryAlertsPage() {
  const { stats, products, alerts, settings } = useLoaderData<{
    stats: any;
    products: Product[];
    alerts: Alert[];
    settings: any;
  }>();
  const navigate = useNavigate();

  const [selectedTab, setSelectedTab] = useState(0);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showToast, setShowToast] = useState(false);

  // Alert settings state
  const [emailNotifications, setEmailNotifications] = useState(settings.emailNotifications);
  const [webhookEnabled, setWebhookEnabled] = useState(settings.webhookEnabled);
  const [notificationEmail, setNotificationEmail] = useState(settings.notificationEmail);
  const [webhookUrl, setWebhookUrl] = useState(settings.webhookUrl);
  const [criticalThreshold, setCriticalThreshold] = useState(settings.alertThresholds.critical);
  const [lowThreshold, setLowThreshold] = useState(settings.alertThresholds.low);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format date time
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusMap = {
      critical: { tone: 'critical' as const, text: 'Critical', icon: AlertCircleIcon },
      out_of_stock: { tone: 'critical' as const, text: 'Out of Stock', icon: XIcon },
      low: { tone: 'warning' as const, text: 'Low Stock', icon: AlertCircleIcon },
      healthy: { tone: 'success' as const, text: 'Healthy', icon: CheckIcon },
    };
    return statusMap[status as keyof typeof statusMap];
  };

  // Get alert type badge
  const getAlertTypeBadge = (type: string) => {
    const typeMap = {
      critical: { tone: 'critical' as const, text: 'Critical' },
      out_of_stock: { tone: 'critical' as const, text: 'Out of Stock' },
      low: { tone: 'warning' as const, text: 'Low Stock' },
    };
    return typeMap[type as keyof typeof typeMap];
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchValue.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchValue.toLowerCase());
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Tabs content
  const tabs = [
    {
      id: 'overview',
      content: 'Overview',
      accessibilityLabel: 'Overview tab',
      panelID: 'overview-panel',
    },
    {
      id: 'products',
      content: 'Products',
      badge: filteredProducts.length.toString(),
      accessibilityLabel: 'Products tab',
      panelID: 'products-panel',
    },
    {
      id: 'alerts',
      content: 'Alerts',
      badge: alerts.filter(a => !a.acknowledged).length.toString(),
      accessibilityLabel: 'Alerts tab',
      panelID: 'alerts-panel',
    },
  ];

  // Handle edit product thresholds
  const handleEditProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  }, []);

  // Handle save settings
  const handleSaveSettings = useCallback(() => {
    // Save settings logic here
    setShowSettingsModal(false);
    setShowToast(true);
  }, []);

  // Product table rows
  const productRows = filteredProducts.map((product) => [
    <InlineStack gap="300" blockAlign="center">
      <Thumbnail
        source={product.image || ImageIcon}
        alt={product.title}
        size="small"
      />
      <BlockStack gap="100">
        <Text as="span" variant="bodyMd" fontWeight="semibold">
          {product.title}
        </Text>
        <Text as="p" variant="bodySm" tone="subdued">
          {product.variant} • SKU: {product.sku}
        </Text>
      </BlockStack>
    </InlineStack>,
    <BlockStack gap="100">
      <Text as="span" variant="bodyMd" fontWeight="semibold">
        {product.currentStock}
      </Text>
      <ProgressBar
        progress={(product.currentStock / product.reorderPoint) * 100}
        tone={product.status === 'critical' || product.status === 'out_of_stock' ? 'critical' :
              product.status === 'low' ? 'warning' : 'success'}
        size="small"
      />
    </BlockStack>,
    `${product.minStock} / ${product.reorderPoint}`,
    product.dailySales.toFixed(1),
    product.daysUntilStockout > 0
      ? `${product.daysUntilStockout.toFixed(1)} days`
      : <Badge tone="critical">Stockout</Badge>,
    <Badge
      tone={getStatusBadge(product.status)?.tone}
      icon={getStatusBadge(product.status)?.icon}
    >
      {getStatusBadge(product.status)?.text}
    </Badge>,
    <Button variant="plain" onClick={() => handleEditProduct(product)}>
      Edit
    </Button>,
  ]);

  // Alert table rows
  const alertRows = alerts.map((alert) => [
    alert.product,
    <Badge tone={getAlertTypeBadge(alert.type)?.tone}>
      {getAlertTypeBadge(alert.type)?.text}
    </Badge>,
    alert.message,
    formatDateTime(alert.timestamp),
    alert.acknowledged
      ? <Badge tone="success">Acknowledged</Badge>
      : <Badge>Pending</Badge>,
    <InlineStack gap="200">
      {!alert.acknowledged && (
        <Button size="slim" onClick={() => console.log('Acknowledge', alert.id)}>
          Acknowledge
        </Button>
      )}
      <Button variant="plain" size="slim" tone="critical" onClick={() => console.log('Dismiss', alert.id)}>
        Dismiss
      </Button>
    </InlineStack>,
  ]);

  return (
    <Frame>
      <Page
        title="Inventory Alerts"
        titleMetadata={
          <Badge tone="info">Beta</Badge>
        }
        primaryAction={{
          content: 'Export Report',
          icon: ExportIcon,
          onAction: () => console.log('Export inventory report'),
        }}
        secondaryActions={[
          {
            content: 'Settings',
            icon: SettingsIcon,
            onAction: () => setShowSettingsModal(true),
          },
        ]}
      >
        <Layout>
          <Layout.Section>
            <BlockStack gap="400">
              {/* Alert Banner for Critical Items */}
              {stats.criticalItems > 0 && (
                <Banner
                  tone="critical"
                  title={`${stats.criticalItems} products have critically low stock`}
                  icon={AlertCircleIcon}
                  action={{ content: 'View Products', onAction: () => setSelectedTab(1) }}
                  onDismiss={() => {}}
                >
                  <p>Immediate action required to avoid stockouts.</p>
                </Banner>
              )}

              {/* Stats Overview - Improved design */}
              <Box background="bg-surface-secondary" padding="600" borderRadius="300">
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '16px'
                }}>
                  <Card>
                    <Box padding="400">
                      <InlineStack gap="300" blockAlign="center">
                        <Box>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Icon source={AlertCircleIcon} tone="base" />
                          </div>
                        </Box>
                        <BlockStack gap="050">
                          <Text as="p" variant="bodySm" tone="subdued">
                            Critical Items
                          </Text>
                          <Text as="p" variant="headingMd" fontWeight="bold" tone="critical">
                            {stats.criticalItems}
                          </Text>
                          <Text as="p" variant="bodySm" tone="subdued">
                            Need immediate restock
                          </Text>
                        </BlockStack>
                      </InlineStack>
                    </Box>
                  </Card>

                  <Card>
                    <Box padding="400">
                      <InlineStack gap="300" blockAlign="center">
                        <Box>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Icon source={AlertCircleIcon} tone="base" />
                          </div>
                        </Box>
                        <BlockStack gap="050">
                          <Text as="p" variant="bodySm" tone="subdued">
                            Low Stock
                          </Text>
                          <Text as="p" variant="headingMd" fontWeight="bold" tone="warning">
                            {stats.lowStockItems}
                          </Text>
                          <Text as="p" variant="bodySm" tone="subdued">
                            Below reorder point
                          </Text>
                        </BlockStack>
                      </InlineStack>
                    </Box>
                  </Card>

                  <Card>
                    <Box padding="400">
                      <InlineStack gap="300" blockAlign="center">
                        <Box>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Icon source={XIcon} tone="base" />
                          </div>
                        </Box>
                        <BlockStack gap="050">
                          <Text as="p" variant="bodySm" tone="subdued">
                            Out of Stock
                          </Text>
                          <Text as="p" variant="headingMd" fontWeight="bold">
                            {stats.outOfStock}
                          </Text>
                          <Text as="p" variant="bodySm" tone="subdued">
                            Currently unavailable
                          </Text>
                        </BlockStack>
                      </InlineStack>
                    </Box>
                  </Card>

                  <Card>
                    <Box padding="400">
                      <InlineStack gap="300" blockAlign="center">
                        <Box>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Icon source={NotificationIcon} tone="base" />
                          </div>
                        </Box>
                        <BlockStack gap="050">
                          <Text as="p" variant="bodySm" tone="subdued">
                            Total Alerts
                          </Text>
                          <Text as="p" variant="headingMd" fontWeight="bold">
                            {stats.totalAlerts}
                          </Text>
                          <Text as="p" variant="bodySm" tone="subdued">
                            Active notifications
                          </Text>
                        </BlockStack>
                      </InlineStack>
                    </Box>
                  </Card>
                </div>
              </Box>

              {/* Tabs Content */}
              <Card>
                <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
                  {/* Overview Tab */}
                  {selectedTab === 0 && (
                    <Box padding="400">
                      <BlockStack gap="400">
                        <Text as="h2" variant="headingMd">
                          Stock Health Overview
                        </Text>

                        {/* Stock Distribution Chart */}
                        <Box padding="400" background="bg-surface-secondary" borderRadius="200">
                          <BlockStack gap="300">
                            <Text as="h3" variant="headingSm">
                              Stock Distribution
                            </Text>
                            <BlockStack gap="200">
                              <InlineStack align="space-between">
                                <Text as="p" variant="bodyMd">
                                  Healthy Stock
                                </Text>
                                <Text as="p" variant="bodyMd" fontWeight="semibold">
                                  65%
                                </Text>
                              </InlineStack>
                              <ProgressBar progress={65} tone="success" />

                              <InlineStack align="space-between">
                                <Text as="p" variant="bodyMd">
                                  Low Stock
                                </Text>
                                <Text as="p" variant="bodyMd" fontWeight="semibold">
                                  25%
                                </Text>
                              </InlineStack>
                              <ProgressBar progress={25} tone="warning" />

                              <InlineStack align="space-between">
                                <Text as="p" variant="bodyMd">
                                  Critical/Out
                                </Text>
                                <Text as="p" variant="bodyMd" fontWeight="semibold">
                                  10%
                                </Text>
                              </InlineStack>
                              <ProgressBar progress={10} tone="critical" />
                            </BlockStack>
                          </BlockStack>
                        </Box>

                        {/* Quick Actions */}
                        <BlockStack gap="300">
                          <Text as="h3" variant="headingSm">
                            Quick Actions
                          </Text>
                          <InlineStack gap="200">
                            <Button onClick={() => setSelectedTab(1)}>
                              View All Products
                            </Button>
                            <Button onClick={() => console.log('Generate PO')}>
                              Generate Purchase Order
                            </Button>
                            <Button variant="plain" onClick={() => console.log('Export')}>
                              Export Inventory Report
                            </Button>
                          </InlineStack>
                        </BlockStack>
                      </BlockStack>
                    </Box>
                  )}

                  {/* Products Tab */}
                  {selectedTab === 1 && (
                    <Box padding="400">
                      <BlockStack gap="400">
                        {/* Filters */}
                        <InlineStack gap="300">
                          <Box minWidth="250px">
                            <TextField
                              label=""
                              value={searchValue}
                              onChange={setSearchValue}
                              placeholder="Search products..."
                              clearButton
                              onClearButtonClick={() => setSearchValue('')}
                              autoComplete="off"
                            />
                          </Box>
                          <Select
                            label=""
                            options={[
                              { label: 'All Status', value: 'all' },
                              { label: 'Critical', value: 'critical' },
                              { label: 'Out of Stock', value: 'out_of_stock' },
                              { label: 'Low Stock', value: 'low' },
                              { label: 'Healthy', value: 'healthy' },
                            ]}
                            value={filterStatus}
                            onChange={setFilterStatus}
                          />
                        </InlineStack>

                        {/* Products Table */}
                        {filteredProducts.length > 0 ? (
                          <DataTable
                            columnContentTypes={['text', 'text', 'text', 'numeric', 'text', 'text', 'text']}
                            headings={[
                              'Product',
                              'Current Stock',
                              'Min/Reorder',
                              'Daily Sales',
                              'Days Until Stockout',
                              'Status',
                              'Actions',
                            ]}
                            rows={productRows}
                          />
                        ) : (
                          <EmptyState
                            heading="No products found"
                            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                          >
                            <p>Try adjusting your search or filter criteria.</p>
                          </EmptyState>
                        )}
                      </BlockStack>
                    </Box>
                  )}

                  {/* Alerts Tab */}
                  {selectedTab === 2 && (
                    <Box padding="400">
                      <BlockStack gap="400">
                        <InlineStack align="space-between">
                          <Text as="h2" variant="headingMd">
                            Recent Alerts
                          </Text>
                          <Button variant="plain" onClick={() => console.log('Clear all')}>
                            Clear All
                          </Button>
                        </InlineStack>

                        {alerts.length > 0 ? (
                          <DataTable
                            columnContentTypes={['text', 'text', 'text', 'text', 'text', 'text']}
                            headings={[
                              'Product',
                              'Type',
                              'Message',
                              'Time',
                              'Status',
                              'Actions',
                            ]}
                            rows={alertRows}
                          />
                        ) : (
                          <EmptyState
                            heading="No active alerts"
                            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                          >
                            <p>You'll see inventory alerts here when stock levels require attention.</p>
                          </EmptyState>
                        )}
                      </BlockStack>
                    </Box>
                  )}
                </Tabs>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>

        {/* Settings Modal */}
        <Modal
          open={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          title="Alert Settings"
          primaryAction={{
            content: 'Save',
            onAction: handleSaveSettings,
          }}
          secondaryActions={[
            {
              content: 'Cancel',
              onAction: () => setShowSettingsModal(false),
            },
          ]}
        >
          <Modal.Section>
            <FormLayout>
              <BlockStack gap="400">
                <Text as="h3" variant="headingSm">
                  Notification Settings
                </Text>

                <Checkbox
                  label="Email notifications"
                  checked={emailNotifications}
                  onChange={setEmailNotifications}
                  helpText="Receive email alerts when stock levels are low"
                />

                {emailNotifications && (
                  <TextField
                    label="Notification email"
                    value={notificationEmail}
                    onChange={setNotificationEmail}
                    type="email"
                    autoComplete="email"
                  />
                )}

                <Checkbox
                  label="Webhook notifications"
                  checked={webhookEnabled}
                  onChange={setWebhookEnabled}
                  helpText="Send alerts to external systems via webhook"
                />

                {webhookEnabled && (
                  <TextField
                    label="Webhook URL"
                    value={webhookUrl}
                    onChange={setWebhookUrl}
                    type="url"
                    placeholder="https://example.com/webhook"
                    autoComplete="off"
                  />
                )}

                <Divider />

                <Text as="h3" variant="headingSm">
                  Alert Thresholds
                </Text>

                <Box>
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    Critical threshold: {criticalThreshold} units
                  </Text>
                  <Box paddingBlockStart="200">
                    <RangeSlider
                      min={1}
                      max={50}
                      value={criticalThreshold}
                      onChange={setCriticalThreshold}
                      output
                    />
                  </Box>
                </Box>

                <Box>
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    Low stock threshold: {lowThreshold} units
                  </Text>
                  <Box paddingBlockStart="200">
                    <RangeSlider
                      min={10}
                      max={100}
                      value={lowThreshold}
                      onChange={setLowThreshold}
                      output
                    />
                  </Box>
                </Box>
              </BlockStack>
            </FormLayout>
          </Modal.Section>
        </Modal>

        {/* Edit Product Modal */}
        <Modal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          title={`Edit Alert Settings: ${selectedProduct?.title}`}
          primaryAction={{
            content: 'Save',
            onAction: () => {
              setShowEditModal(false);
              setShowToast(true);
            },
          }}
          secondaryActions={[
            {
              content: 'Cancel',
              onAction: () => setShowEditModal(false),
            },
          ]}
        >
          <Modal.Section>
            {selectedProduct && (
              <FormLayout>
                <TextField
                  label="Minimum stock level"
                  type="number"
                  value={selectedProduct.minStock.toString()}
                  onChange={() => {}}
                  helpText="Alert when stock falls below this level"
                  autoComplete="off"
                />

                <TextField
                  label="Reorder point"
                  type="number"
                  value={selectedProduct.reorderPoint.toString()}
                  onChange={() => {}}
                  helpText="Suggested reorder quantity"
                  autoComplete="off"
                />

                <Select
                  label="Supplier"
                  options={[
                    { label: 'Fashion Co.', value: 'fashion-co' },
                    { label: 'TechSound', value: 'techsound' },
                    { label: 'Coffee Masters', value: 'coffee-masters' },
                    { label: 'Wellness Inc.', value: 'wellness-inc' },
                  ]}
                  value={selectedProduct.supplier}
                  onChange={() => {}}
                />

                <Checkbox
                  label="Enable automatic reordering"
                  checked={false}
                  onChange={() => {}}
                  helpText="Automatically create purchase orders when stock is low"
                />
              </FormLayout>
            )}
          </Modal.Section>
        </Modal>

        {/* Toast Notification */}
        {showToast && (
          <Toast
            content="Settings saved successfully"
            onDismiss={() => setShowToast(false)}
          />
        )}
      </Page>
    </Frame>
  );
}