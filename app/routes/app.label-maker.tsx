// Label Maker - Product label and barcode printing system

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
  TextField,
  Checkbox,
  RadioButton,
  Thumbnail,
  EmptyState,
  Icon,
  Modal,
  FormLayout,
  DropZone,
  Banner,
  Collapsible,
  Link,
  DataTable,
  Tabs,
} from '@shopify/polaris';
import {
  PrintIcon,
  ProductIcon,
  SettingsIcon,
  ImageIcon,
  PlusIcon,
  DeleteIcon,
  EditIcon,
  DuplicateIcon,
  ViewIcon,
  ExportIcon,
} from '@shopify/polaris-icons';
import { TitleBar } from '@shopify/app-bridge-react';
import { useLoaderData, useNavigate } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { authenticate } from '../shopify.server';
import { useState, useCallback } from 'react';

// Loader to fetch products and label templates
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // Mock data - replace with real API calls
  const data = {
    products: [
      {
        id: '1',
        title: 'Premium Cotton T-Shirt',
        sku: 'PCT-M-BLK',
        variant: 'Medium / Black',
        image: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png',
        price: 29.99,
        barcode: '123456789012',
        vendor: 'Fashion Co.',
        inventory: 150,
      },
      {
        id: '2',
        title: 'Wireless Bluetooth Headphones',
        sku: 'WBH-BLK',
        variant: 'Black',
        image: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-2_large.png',
        price: 99.99,
        barcode: '987654321098',
        vendor: 'TechSound',
        inventory: 75,
      },
      {
        id: '3',
        title: 'Organic Coffee Blend',
        sku: 'OCB-250G',
        variant: '250g',
        image: null,
        price: 14.99,
        barcode: '456789123456',
        vendor: 'Coffee Masters',
        inventory: 200,
      },
    ],
    templates: [
      {
        id: 'default',
        name: 'Default Product Label',
        size: '2.25" x 1.25"',
        type: 'product',
        preview: '📦 Standard product label with barcode',
      },
      {
        id: 'price-tag',
        name: 'Price Tag',
        size: '2" x 1"',
        type: 'price',
        preview: '🏷️ Simple price tag with product name',
      },
      {
        id: 'shipping',
        name: 'Shipping Label',
        size: '4" x 6"',
        type: 'shipping',
        preview: '📮 Shipping label with address',
      },
      {
        id: 'barcode-only',
        name: 'Barcode Only',
        size: '1.5" x 0.75"',
        type: 'barcode',
        preview: '||||| Barcode only label',
      },
      {
        id: 'custom',
        name: 'Custom Template',
        size: 'Variable',
        type: 'custom',
        preview: '✏️ Create your own label design',
      },
    ],
    recentJobs: [
      {
        id: '1',
        date: '2024-01-25',
        template: 'Default Product Label',
        products: 5,
        quantity: 100,
        status: 'completed',
      },
      {
        id: '2',
        date: '2024-01-24',
        template: 'Price Tag',
        products: 3,
        quantity: 50,
        status: 'completed',
      },
      {
        id: '3',
        date: '2024-01-23',
        template: 'Shipping Label',
        products: 10,
        quantity: 10,
        status: 'completed',
      },
    ],
  };

  return json(data);
};

type Product = {
  id: string;
  title: string;
  sku: string;
  variant: string;
  image: string | null;
  price: number;
  barcode: string;
  vendor: string;
  inventory: number;
};

type Template = {
  id: string;
  name: string;
  size: string;
  type: string;
  preview: string;
};

type PrintJob = {
  id: string;
  date: string;
  template: string;
  products: number;
  quantity: number;
  status: string;
};

export default function LabelMakerPage() {
  const { products, templates, recentJobs } = useLoaderData<{
    products: Product[];
    templates: Template[];
    recentJobs: PrintJob[];
  }>();
  const navigate = useNavigate();

  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('default');
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomTemplate, setShowCustomTemplate] = useState(false);

  // Label settings
  const [labelQuantity, setLabelQuantity] = useState('1');
  const [printerType, setPrinterType] = useState('thermal');
  const [paperSize, setPaperSize] = useState('letter');
  const [includePrice, setIncludePrice] = useState(true);
  const [includeSku, setIncludeSku] = useState(true);
  const [includeVendor, setIncludeVendor] = useState(false);
  const [barcodeType, setBarcodeType] = useState('code128');
  const [customText, setCustomText] = useState('');

  // Custom template settings
  const [customWidth, setCustomWidth] = useState('2.25');
  const [customHeight, setCustomHeight] = useState('1.25');
  const [customFields, setCustomFields] = useState<string[]>(['title', 'price', 'barcode']);

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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Handle product selection
  const handleProductSelect = useCallback((productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  }, []);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  }, [selectedProducts, products]);

  // Handle print
  const handlePrint = useCallback(() => {
    console.log('Printing labels:', {
      products: selectedProducts,
      template: selectedTemplate,
      quantity: labelQuantity,
      settings: {
        printerType,
        paperSize,
        includePrice,
        includeSku,
        includeVendor,
        barcodeType,
      },
    });
    // Show success message or redirect to print queue
  }, [selectedProducts, selectedTemplate, labelQuantity, printerType, paperSize, includePrice, includeSku, includeVendor, barcodeType]);

  // Get selected template
  const currentTemplate = templates.find(t => t.id === selectedTemplate);

  // Tabs
  const tabs = [
    {
      id: 'create',
      content: 'Create Labels',
      accessibilityLabel: 'Create labels tab',
      panelID: 'create-panel',
    },
    {
      id: 'templates',
      content: 'Templates',
      badge: templates.length.toString(),
      accessibilityLabel: 'Templates tab',
      panelID: 'templates-panel',
    },
    {
      id: 'history',
      content: 'Print History',
      accessibilityLabel: 'Print history tab',
      panelID: 'history-panel',
    },
  ];

  // Product rows for selection
  const productRows = products.map((product) => [
    <Checkbox
      label=""
      checked={selectedProducts.includes(product.id)}
      onChange={() => handleProductSelect(product.id)}
    />,
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
          {product.variant}
        </Text>
      </BlockStack>
    </InlineStack>,
    product.sku,
    product.barcode,
    formatCurrency(product.price),
    `${product.inventory} units`,
  ]);

  // History rows
  const historyRows = recentJobs.map((job) => [
    formatDate(job.date),
    job.template,
    `${job.products} products`,
    `${job.quantity} labels`,
    <Badge tone={job.status === 'completed' ? 'success' : 'info'}>
      {job.status}
    </Badge>,
    <InlineStack gap="200">
      <Button size="slim" onClick={() => console.log('Reprint', job.id)}>
        Reprint
      </Button>
      <Button variant="plain" size="slim" onClick={() => console.log('Download', job.id)}>
        Download
      </Button>
    </InlineStack>,
  ]);

  return (
    <Page
      title="Label Maker"
      titleMetadata={
        <Badge tone="info">
          {selectedProducts.length} products selected
        </Badge>
      }
      primaryAction={{
        content: 'Print Labels',
        icon: PrintIcon,
        disabled: selectedProducts.length === 0,
        onAction: handlePrint,
      }}
      secondaryActions={[
        {
          content: 'Preview',
          icon: ViewIcon,
          disabled: selectedProducts.length === 0,
          onAction: () => setShowPreview(true),
        },
        {
          content: 'Settings',
          icon: SettingsIcon,
          onAction: () => setShowSettings(true),
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
              {/* Create Labels Tab */}
              {selectedTab === 0 && (
                <Box padding="400">
                  <BlockStack gap="400">
                    <InlineGrid columns={{ xs: 1, md: '2fr 1fr' }} gap="400">
                      {/* Product Selection */}
                      <Card>
                        <BlockStack gap="400">
                          <InlineStack align="space-between">
                            <Text as="h2" variant="headingMd">
                              Select Products
                            </Text>
                            <Button
                              variant="plain"
                              onClick={handleSelectAll}
                            >
                              {selectedProducts.length === products.length ? 'Deselect All' : 'Select All'}
                            </Button>
                          </InlineStack>

                          <TextField
                            label=""
                            placeholder="Search products..."
                            autoComplete="off"
                            clearButton
                            onClearButtonClick={() => {}}
                          />

                          <DataTable
                            columnContentTypes={['text', 'text', 'text', 'text', 'numeric', 'numeric']}
                            headings={[
                              '',
                              'Product',
                              'SKU',
                              'Barcode',
                              'Price',
                              'Inventory',
                            ]}
                            rows={productRows}
                          />
                        </BlockStack>
                      </Card>

                      {/* Label Settings */}
                      <BlockStack gap="400">
                        <Card>
                          <BlockStack gap="400">
                            <Text as="h2" variant="headingMd">
                              Label Template
                            </Text>

                            <Select
                              label="Template"
                              options={templates.map(t => ({
                                label: t.name,
                                value: t.id,
                              }))}
                              value={selectedTemplate}
                              onChange={setSelectedTemplate}
                            />

                            {currentTemplate && (
                              <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                                <BlockStack gap="200">
                                  <Text as="p" variant="bodySm" fontWeight="semibold">
                                    Size: {currentTemplate.size}
                                  </Text>
                                  <Text as="p" variant="bodySm">
                                    {currentTemplate.preview}
                                  </Text>
                                </BlockStack>
                              </Box>
                            )}

                            {selectedTemplate === 'custom' && (
                              <Button onClick={() => setShowCustomTemplate(true)}>
                                Customize Template
                              </Button>
                            )}
                          </BlockStack>
                        </Card>

                        <Card>
                          <BlockStack gap="400">
                            <Text as="h2" variant="headingMd">
                              Print Options
                            </Text>

                            <TextField
                              label="Quantity per product"
                              type="number"
                              value={labelQuantity}
                              onChange={setLabelQuantity}
                              min="1"
                              autoComplete="off"
                            />

                            <Select
                              label="Printer type"
                              options={[
                                { label: 'Thermal Printer', value: 'thermal' },
                                { label: 'Laser/Inkjet', value: 'standard' },
                                { label: 'PDF (Download)', value: 'pdf' },
                              ]}
                              value={printerType}
                              onChange={setPrinterType}
                            />

                            {printerType === 'standard' && (
                              <Select
                                label="Paper size"
                                options={[
                                  { label: 'Letter (8.5" x 11")', value: 'letter' },
                                  { label: 'A4', value: 'a4' },
                                  { label: 'Custom', value: 'custom' },
                                ]}
                                value={paperSize}
                                onChange={setPaperSize}
                              />
                            )}

                            <BlockStack gap="200">
                              <Text as="p" variant="bodySm" fontWeight="semibold">
                                Include on label:
                              </Text>
                              <Checkbox
                                label="Price"
                                checked={includePrice}
                                onChange={setIncludePrice}
                              />
                              <Checkbox
                                label="SKU"
                                checked={includeSku}
                                onChange={setIncludeSku}
                              />
                              <Checkbox
                                label="Vendor"
                                checked={includeVendor}
                                onChange={setIncludeVendor}
                              />
                            </BlockStack>
                          </BlockStack>
                        </Card>

                        <Card>
                          <BlockStack gap="300">
                            <Text as="h3" variant="headingSm">
                              Barcode Settings
                            </Text>

                            <Select
                              label="Barcode type"
                              options={[
                                { label: 'Code 128', value: 'code128' },
                                { label: 'EAN-13', value: 'ean13' },
                                { label: 'UPC-A', value: 'upca' },
                                { label: 'QR Code', value: 'qr' },
                              ]}
                              value={barcodeType}
                              onChange={setBarcodeType}
                            />
                          </BlockStack>
                        </Card>
                      </BlockStack>
                    </InlineGrid>
                  </BlockStack>
                </Box>
              )}

              {/* Templates Tab */}
              {selectedTab === 1 && (
                <Box padding="400">
                  <BlockStack gap="400">
                    <InlineStack align="space-between">
                      <Text as="h2" variant="headingMd">
                        Available Templates
                      </Text>
                      <Button icon={PlusIcon} onClick={() => setShowCustomTemplate(true)}>
                        Create Template
                      </Button>
                    </InlineStack>

                    <InlineGrid columns={{ xs: 1, sm: 2, lg: 3 }} gap="400">
                      {templates.map((template) => (
                        <Card key={template.id}>
                          <BlockStack gap="300">
                            <InlineStack align="space-between">
                              <Text as="h3" variant="headingSm" fontWeight="semibold">
                                {template.name}
                              </Text>
                              {template.id === 'custom' && (
                                <Badge>Custom</Badge>
                              )}
                            </InlineStack>

                            <Box padding="400" background="bg-surface-secondary" borderRadius="200" minHeight="100px">
                              <BlockStack gap="200" align="center">
                                <Text as="p" variant="heading2xl">
                                  {template.preview.split(' ')[0]}
                                </Text>
                                <Text as="p" variant="bodySm" alignment="center">
                                  {template.preview.split(' ').slice(1).join(' ')}
                                </Text>
                              </BlockStack>
                            </Box>

                            <BlockStack gap="200">
                              <InlineStack gap="200">
                                <Badge tone="info">
                                  {template.size}
                                </Badge>
                                <Badge>
                                  {template.type}
                                </Badge>
                              </InlineStack>

                              <InlineStack gap="200">
                                <Button size="slim" onClick={() => setSelectedTemplate(template.id)}>
                                  Use Template
                                </Button>
                                {template.id === 'custom' && (
                                  <>
                                    <Button variant="plain" size="slim" icon={EditIcon}>
                                      Edit
                                    </Button>
                                    <Button variant="plain" size="slim" icon={DeleteIcon} tone="critical">
                                      Delete
                                    </Button>
                                  </>
                                )}
                              </InlineStack>
                            </BlockStack>
                          </BlockStack>
                        </Card>
                      ))}
                    </InlineGrid>
                  </BlockStack>
                </Box>
              )}

              {/* History Tab */}
              {selectedTab === 2 && (
                <Box padding="400">
                  <BlockStack gap="400">
                    <InlineStack align="space-between">
                      <Text as="h2" variant="headingMd">
                        Print History
                      </Text>
                      <Button variant="plain" onClick={() => console.log('Clear history')}>
                        Clear History
                      </Button>
                    </InlineStack>

                    {recentJobs.length > 0 ? (
                      <DataTable
                        columnContentTypes={['text', 'text', 'text', 'text', 'text', 'text']}
                        headings={[
                          'Date',
                          'Template',
                          'Products',
                          'Quantity',
                          'Status',
                          'Actions',
                        ]}
                        rows={historyRows}
                      />
                    ) : (
                      <EmptyState
                        heading="No print history"
                        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                      >
                        <p>Your print history will appear here after you print labels.</p>
                      </EmptyState>
                    )}
                  </BlockStack>
                </Box>
              )}
            </Tabs>
          </Card>
        </Layout.Section>
      </Layout>

      {/* Preview Modal */}
      <Modal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title="Label Preview"
        primaryAction={{
          content: 'Print',
          onAction: handlePrint,
        }}
        secondaryActions={[
          {
            content: 'Close',
            onAction: () => setShowPreview(false),
          },
        ]}
        large
      >
        <Modal.Section>
          <BlockStack gap="400">
            <Banner tone="info">
              <p>Preview shows the first selected product. All {selectedProducts.length} selected products will be printed.</p>
            </Banner>

            <Box padding="400" background="bg-surface-secondary" borderRadius="200">
              <BlockStack gap="300" align="center">
                <Box padding="400" background="bg-surface" borderRadius="200" borderColor="border" borderWidth="025">
                  <BlockStack gap="200" align="center">
                    <Text as="h3" variant="headingMd" fontWeight="bold">
                      Premium Cotton T-Shirt
                    </Text>
                    {includeSku && (
                      <Text as="p" variant="bodySm" tone="subdued">
                        SKU: PCT-M-BLK
                      </Text>
                    )}
                    {includePrice && (
                      <Text as="p" variant="headingLg" fontWeight="bold">
                        $29.99
                      </Text>
                    )}
                    <Box padding="200">
                      <Text as="p" variant="heading2xl" fontWeight="bold" fontFamily="monospace">
                        ||| |||| | |||| |||
                      </Text>
                      <Text as="p" variant="bodySm" alignment="center">
                        123456789012
                      </Text>
                    </Box>
                    {includeVendor && (
                      <Text as="p" variant="bodySm" tone="subdued">
                        Fashion Co.
                      </Text>
                    )}
                  </BlockStack>
                </Box>
              </BlockStack>
            </Box>
          </BlockStack>
        </Modal.Section>
      </Modal>

      {/* Settings Modal */}
      <Modal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        title="Label Printer Settings"
        primaryAction={{
          content: 'Save Settings',
          onAction: () => setShowSettings(false),
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setShowSettings(false),
          },
        ]}
      >
        <Modal.Section>
          <FormLayout>
            <Select
              label="Default printer"
              options={[
                { label: 'DYMO LabelWriter 450', value: 'dymo450' },
                { label: 'Brother QL-800', value: 'brother800' },
                { label: 'System Default', value: 'default' },
              ]}
              value="dymo450"
              onChange={() => {}}
            />

            <Select
              label="Default template"
              options={templates.map(t => ({
                label: t.name,
                value: t.id,
              }))}
              value={selectedTemplate}
              onChange={() => {}}
            />

            <TextField
              label="Default quantity"
              type="number"
              value="1"
              onChange={() => {}}
              autoComplete="off"
            />

            <Checkbox
              label="Auto-print after selection"
              checked={false}
              onChange={() => {}}
            />

            <Checkbox
              label="Save print history"
              checked={true}
              onChange={() => {}}
            />
          </FormLayout>
        </Modal.Section>
      </Modal>

      {/* Custom Template Modal */}
      <Modal
        open={showCustomTemplate}
        onClose={() => setShowCustomTemplate(false)}
        title="Create Custom Template"
        primaryAction={{
          content: 'Create Template',
          onAction: () => setShowCustomTemplate(false),
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setShowCustomTemplate(false),
          },
        ]}
        large
      >
        <Modal.Section>
          <FormLayout>
            <TextField
              label="Template name"
              value="Custom Product Label"
              onChange={() => {}}
              autoComplete="off"
            />

            <InlineStack gap="300">
              <TextField
                label="Width (inches)"
                type="number"
                value={customWidth}
                onChange={setCustomWidth}
                step="0.25"
                autoComplete="off"
              />
              <TextField
                label="Height (inches)"
                type="number"
                value={customHeight}
                onChange={setCustomHeight}
                step="0.25"
                autoComplete="off"
              />
            </InlineStack>

            <BlockStack gap="300">
              <Text as="p" variant="bodySm" fontWeight="semibold">
                Include fields:
              </Text>
              <Checkbox
                label="Product title"
                checked={customFields.includes('title')}
                onChange={() => {}}
              />
              <Checkbox
                label="Price"
                checked={customFields.includes('price')}
                onChange={() => {}}
              />
              <Checkbox
                label="SKU"
                checked={customFields.includes('sku')}
                onChange={() => {}}
              />
              <Checkbox
                label="Barcode"
                checked={customFields.includes('barcode')}
                onChange={() => {}}
              />
              <Checkbox
                label="Vendor"
                checked={customFields.includes('vendor')}
                onChange={() => {}}
              />
              <Checkbox
                label="Custom text"
                checked={customFields.includes('custom')}
                onChange={() => {}}
              />
            </BlockStack>

            {customFields.includes('custom') && (
              <TextField
                label="Custom text"
                value={customText}
                onChange={setCustomText}
                multiline={2}
                autoComplete="off"
              />
            )}
          </FormLayout>
        </Modal.Section>
      </Modal>
    </Page>
  );
}