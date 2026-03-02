// Pre-order management system with tracking and fulfillment

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
  InlineStack,
  Box,
  EmptyState,
  useBreakpoints,
  BlockStack,
  Modal,
  TextField,
  DatePicker,
  Select,
  Banner,
  ProgressBar,
  Avatar,
  Thumbnail,
  Link,
} from "@shopify/polaris";
import type { BadgeProps, IndexTableProps } from "@shopify/polaris";
import {
  PlusIcon,
  CalendarIcon,
  PackageIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from "@shopify/polaris-icons";
import { useState, useCallback, useMemo } from "react";
import { useLoaderData, useNavigate } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

// Loader to fetch pre-orders data
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // Mock data - replace with real API calls
  const preorders = [
    {
      id: "PRE001",
      orderNumber: "#PRE-001",
      product: {
        id: "prod_1",
        title: "Limited Edition Sneakers",
        variant: "Size 10 / Black",
        image: "https://burst.shopifycdn.com/photos/black-leather-choker-necklace_373x@2x.jpg",
      },
      customer: {
        id: "cust_1",
        name: "John Doe",
        email: "john.doe@example.com",
        avatar: "JD",
      },
      quantity: 2,
      price: 299.99,
      depositPaid: 59.99,
      remainingBalance: 539.99,
      expectedDate: "2024-03-15",
      releaseDate: "2024-03-01",
      status: "pending" as const,
      paymentStatus: "partial" as const,
      createdAt: "2024-01-20T10:30:00Z",
      notes: "Customer requested express shipping",
    },
    {
      id: "PRE002",
      orderNumber: "#PRE-002",
      product: {
        id: "prod_2",
        title: "Gaming Console Pro",
        variant: "512GB / White",
        image: "https://burst.shopifycdn.com/photos/wrist-watches_373x@2x.jpg",
      },
      customer: {
        id: "cust_2",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        avatar: "JS",
      },
      quantity: 1,
      price: 599.99,
      depositPaid: 599.99,
      remainingBalance: 0,
      expectedDate: "2024-02-28",
      releaseDate: "2024-02-25",
      status: "ready" as const,
      paymentStatus: "paid" as const,
      createdAt: "2024-01-15T14:20:00Z",
      notes: "",
    },
    {
      id: "PRE003",
      orderNumber: "#PRE-003",
      product: {
        id: "prod_3",
        title: "Collector's Edition Book Set",
        variant: "Hardcover / Complete Series",
        image: "https://burst.shopifycdn.com/photos/business-woman-smiling-in-office_373x@2x.jpg",
      },
      customer: {
        id: "cust_3",
        name: "Bob Johnson",
        email: "bob.johnson@example.com",
        avatar: "BJ",
      },
      quantity: 1,
      price: 199.99,
      depositPaid: 49.99,
      remainingBalance: 150.00,
      expectedDate: "2024-04-01",
      releaseDate: "2024-03-25",
      status: "confirmed" as const,
      paymentStatus: "partial" as const,
      createdAt: "2024-01-18T09:15:00Z",
      notes: "Gift wrapping requested",
    },
    {
      id: "PRE004",
      orderNumber: "#PRE-004",
      product: {
        id: "prod_4",
        title: "Smart Watch Ultra",
        variant: "45mm / Titanium",
        image: "https://burst.shopifycdn.com/photos/turmeric-bowl-and-wooden-spoon_373x@2x.jpg",
      },
      customer: {
        id: "cust_4",
        name: "Alice Brown",
        email: "alice.brown@example.com",
        avatar: "AB",
      },
      quantity: 1,
      price: 899.99,
      depositPaid: 899.99,
      remainingBalance: 0,
      expectedDate: "2024-02-20",
      releaseDate: "2024-02-15",
      status: "fulfilled" as const,
      paymentStatus: "paid" as const,
      createdAt: "2024-01-10T11:45:00Z",
      notes: "Delivered successfully",
    },
    {
      id: "PRE005",
      orderNumber: "#PRE-005",
      product: {
        id: "prod_5",
        title: "Vinyl Record Collection",
        variant: "Limited Edition / Box Set",
        image: "https://burst.shopifycdn.com/photos/flatlay-iron-skillet-with-meat-and-other-food_373x@2x.jpg",
      },
      customer: {
        id: "cust_5",
        name: "Charlie Wilson",
        email: "charlie.wilson@example.com",
        avatar: "CW",
      },
      quantity: 1,
      price: 349.99,
      depositPaid: 0,
      remainingBalance: 349.99,
      expectedDate: "2024-05-01",
      releaseDate: "2024-04-30",
      status: "cancelled" as const,
      paymentStatus: "pending" as const,
      createdAt: "2024-01-22T16:30:00Z",
      notes: "Customer cancelled due to budget constraints",
    },
  ];

  const stats = {
    totalPreorders: preorders.length,
    pendingFulfillment: preorders.filter(p => p.status === "ready").length,
    totalRevenue: preorders.reduce((sum, p) => sum + (p.depositPaid), 0),
    upcomingReleases: preorders.filter(p =>
      p.status === "pending" || p.status === "confirmed" || p.status === "ready"
    ).length,
  };

  return json({ preorders, stats });
};

type PreOrder = {
  id: string;
  orderNumber: string;
  product: {
    id: string;
    title: string;
    variant: string;
    image: string;
  };
  customer: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  quantity: number;
  price: number;
  depositPaid: number;
  remainingBalance: number;
  expectedDate: string;
  releaseDate: string;
  status: "pending" | "confirmed" | "ready" | "fulfilled" | "cancelled";
  paymentStatus: "pending" | "partial" | "paid" | "refunded";
  createdAt: string;
  notes: string;
};

type StatusBadge = {
  tone?: BadgeProps["tone"];
  text: string;
  icon?: typeof AlertCircleIcon;
};

export default function PreordersPage() {
  const { preorders, stats } = useLoaderData<{
    preorders: PreOrder[];
    stats: {
      totalPreorders: number;
      pendingFulfillment: number;
      totalRevenue: number;
      upcomingReleases: number;
    };
  }>();

  const navigate = useNavigate();
  const { smUp } = useBreakpoints();

  const [queryValue, setQueryValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sortValue, setSortValue] = useState("created desc");
  const [selected, setSelected] = useState(0);
  const [newPreorderModalActive, setNewPreorderModalActive] = useState(false);

  const resourceName = {
    singular: "pre-order",
    plural: "pre-orders",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(preorders);

  // Filter pre-orders
  const filteredPreorders = useMemo(() => {
    let filtered = [...preorders];

    if (queryValue) {
      filtered = filtered.filter(
        (preorder) =>
          preorder.orderNumber.toLowerCase().includes(queryValue.toLowerCase()) ||
          preorder.product.title.toLowerCase().includes(queryValue.toLowerCase()) ||
          preorder.customer.name.toLowerCase().includes(queryValue.toLowerCase()) ||
          preorder.customer.email.toLowerCase().includes(queryValue.toLowerCase())
      );
    }

    if (statusFilter.length > 0) {
      filtered = filtered.filter((preorder) =>
        statusFilter.includes(preorder.status)
      );
    }

    return filtered;
  }, [preorders, queryValue, statusFilter]);

  // Sort pre-orders
  const sortedPreorders = useMemo(() => {
    const [field, direction] = sortValue.split(" ");

    return [...filteredPreorders].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (field) {
        case "order":
          aValue = a.orderNumber;
          bValue = b.orderNumber;
          break;
        case "customer":
          aValue = a.customer.name.toLowerCase();
          bValue = b.customer.name.toLowerCase();
          break;
        case "total":
          aValue = a.price * a.quantity;
          bValue = b.price * b.quantity;
          break;
        case "deposit":
          aValue = a.depositPaid;
          bValue = b.depositPaid;
          break;
        case "release":
          aValue = new Date(a.releaseDate);
          bValue = new Date(b.releaseDate);
          break;
        case "created":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (direction === "desc") {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });
  }, [filteredPreorders, sortValue]);

  const handleFiltersQueryChange = useCallback(
    (value: string) => setQueryValue(value),
    []
  );

  const handleStatusChange = useCallback(
    (value: string[]) => setStatusFilter(value),
    []
  );

  const handleFiltersClearAll = useCallback(() => {
    setQueryValue("");
    setStatusFilter([]);
  }, []);

  const handleSortChange = useCallback((value: string[]) => {
    setSortValue(value[0] || "created desc");
  }, []);

  const toggleNewPreorderModal = useCallback(() => {
    setNewPreorderModalActive(!newPreorderModalActive);
  }, [newPreorderModalActive]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get status badge
  const getStatusBadge = (status: string): StatusBadge => {
    const statusMap = {
      pending: { tone: "warning", text: "Pending", icon: CalendarIcon },
      confirmed: { tone: "info", text: "Confirmed" },
      ready: { tone: "success", text: "Ready to Ship", icon: PackageIcon },
      fulfilled: { tone: "success", text: "Fulfilled", icon: CheckCircleIcon },
      cancelled: { tone: "critical", text: "Cancelled" },
    } satisfies Record<string, StatusBadge>;

    return statusMap[status as keyof typeof statusMap] || { text: status };
  };

  // Get payment status badge
  const getPaymentBadge = (status: string): StatusBadge => {
    const statusMap = {
      pending: { text: "No deposit" },
      partial: { tone: "warning", text: "Partial payment" },
      paid: { tone: "success", text: "Fully paid" },
      refunded: { tone: "critical", text: "Refunded" },
    } satisfies Record<string, StatusBadge>;

    return statusMap[status as keyof typeof statusMap] || { text: status };
  };

  // Calculate progress percentage
  const getPaymentProgress = (depositPaid: number, total: number) => {
    return Math.round((depositPaid / total) * 100);
  };

  // Filter options
  const filters = [
    {
      key: "status",
      label: "Status",
      filter: (
        <Select
          label="Status"
          options={[
            { label: "All", value: "" },
            { label: "Pending", value: "pending" },
            { label: "Confirmed", value: "confirmed" },
            { label: "Ready to Ship", value: "ready" },
            { label: "Fulfilled", value: "fulfilled" },
            { label: "Cancelled", value: "cancelled" },
          ]}
          onChange={(value) => setStatusFilter(value ? [value] : [])}
          value={statusFilter[0] || ""}
        />
      ),
    },
  ];

  // Sort options
  const sortOptions = [
    { label: "Newest first", value: "created desc" },
    { label: "Oldest first", value: "created asc" },
    { label: "Order number", value: "order asc" },
    { label: "Customer name", value: "customer asc" },
    { label: "Total amount (High to Low)", value: "total desc" },
    { label: "Deposit amount (High to Low)", value: "deposit desc" },
    { label: "Release date (Upcoming)", value: "release asc" },
  ];

  // Bulk actions
  const promotedBulkActions = [
    {
      content: "Send reminders",
      onAction: () => console.log("Send reminders to:", selectedResources),
    },
    {
      content: "Mark as ready",
      onAction: () => console.log("Mark as ready:", selectedResources),
    },
  ];

  const bulkActions = [
    {
      content: "Export pre-orders",
      onAction: () => console.log("Export:", selectedResources),
    },
    {
      content: "Update status",
      onAction: () => console.log("Update status for:", selectedResources),
    },
    {
      content: "Cancel pre-orders",
      onAction: () => console.log("Cancel:", selectedResources),
      destructive: true,
    },
  ];

  // Table headers
  const headings: IndexTableProps["headings"] = [
    { title: "Order" },
    { title: "Product" },
    { title: "Customer" },
    { title: "Payment" },
    { title: "Release Date" },
    { title: "Status" },
    { title: "Total", alignment: "end" as const },
  ];

  // Row markup
  const rowMarkup = sortedPreorders.map((preorder, index) => (
    <IndexTable.Row
      id={preorder.id}
      key={preorder.id}
      selected={selectedResources.includes(preorder.id)}
      position={index}
      onClick={() => navigate(`/app/preorders/${preorder.id}`)}
    >
      <IndexTable.Cell>
        <Link url={`/app/preorders/${preorder.id}`} removeUnderline>
          <Text as="span" variant="bodyMd" fontWeight="semibold">
            {preorder.orderNumber}
          </Text>
        </Link>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <InlineStack gap="300" blockAlign="center">
          <Thumbnail
            source={preorder.product.image}
            alt={preorder.product.title}
            size="small"
          />
          <BlockStack gap="050">
            <Text as="p" variant="bodyMd" fontWeight="medium">
              {preorder.product.title}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              {preorder.product.variant}
            </Text>
          </BlockStack>
        </InlineStack>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <InlineStack gap="200" blockAlign="center">
          <Avatar size="sm" initials={preorder.customer.avatar} />
          <BlockStack gap="050">
            <Text as="p" variant="bodyMd">
              {preorder.customer.name}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              {preorder.customer.email}
            </Text>
          </BlockStack>
        </InlineStack>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <BlockStack gap="200">
          <Badge tone={getPaymentBadge(preorder.paymentStatus).tone}>
            {getPaymentBadge(preorder.paymentStatus).text}
          </Badge>
          {preorder.paymentStatus === "partial" && (
            <Box paddingInlineEnd="800">
              <ProgressBar
                progress={getPaymentProgress(preorder.depositPaid, preorder.price * preorder.quantity)}
                size="small"
                tone="success"
              />
              <Text as="p" variant="bodySm" tone="subdued">
                {formatCurrency(preorder.depositPaid)} of {formatCurrency(preorder.price * preorder.quantity)}
              </Text>
            </Box>
          )}
        </BlockStack>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <BlockStack gap="050">
          <Text as="p" variant="bodyMd">
            {formatDate(preorder.releaseDate)}
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            Expected: {formatDate(preorder.expectedDate)}
          </Text>
        </BlockStack>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Badge tone={getStatusBadge(preorder.status).tone}>
          {getStatusBadge(preorder.status).text}
        </Badge>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Text as="span" alignment="end" numeric fontWeight="semibold">
          {formatCurrency(preorder.price * preorder.quantity)}
        </Text>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  // Empty state
  const emptyStateMarkup = (
    <EmptyState
      heading="Start accepting pre-orders"
      action={{
        content: "Create pre-order",
        onAction: toggleNewPreorderModal,
      }}
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    >
      <p>
        Accept pre-orders for upcoming products and manage customer expectations
        with release dates and deposit tracking.
      </p>
    </EmptyState>
  );

  return (
    <Page
      title="Pre-orders"
      primaryAction={{
        content: "New pre-order",
        icon: PlusIcon,
        onAction: toggleNewPreorderModal,
      }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="600">
            {/* Stats cards - Improved design */}
            <Box background="bg-surface-secondary" padding="600" borderRadius="300">
              <InlineStack gap="600" wrap={false}>
                <Box width="100%">
                  <Card>
                    <BlockStack gap="200">
                      <InlineStack gap="200" blockAlign="center">
                        <Box>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
                              <path d="M3 3h14v14H3V3zm2 2v10h10V5H5z"/>
                            </svg>
                          </div>
                        </Box>
                        <BlockStack gap="050">
                          <Text as="p" variant="bodySm" tone="subdued">
                            Active Pre-orders
                          </Text>
                          <Text as="p" variant="headingLg" fontWeight="bold">
                            {stats.totalPreorders}
                          </Text>
                        </BlockStack>
                      </InlineStack>
                    </BlockStack>
                  </Card>
                </Box>

                <Box width="100%">
                  <Card>
                    <BlockStack gap="200">
                      <InlineStack gap="200" blockAlign="center">
                        <Box>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #56CCB7 0%, #2FB344 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
                              <path d="M4 6h12l-1 10H5L4 6zm6-4h0v2h4V2h-4zm-2 0H6v2h2V2zm8 2v2H4V4h2V2a2 2 0 012-2h4a2 2 0 012 2v2h2z"/>
                            </svg>
                          </div>
                        </Box>
                        <BlockStack gap="050">
                          <Text as="p" variant="bodySm" tone="subdued">
                            Ready to Ship
                          </Text>
                          <InlineStack gap="200" blockAlign="center">
                            <Text as="p" variant="headingLg" fontWeight="bold" tone="success">
                              {stats.pendingFulfillment}
                            </Text>
                            {stats.pendingFulfillment > 0 && (
                              <Badge tone="success" size="small">Action needed</Badge>
                            )}
                          </InlineStack>
                        </BlockStack>
                      </InlineStack>
                    </BlockStack>
                  </Card>
                </Box>

                <Box width="100%">
                  <Card>
                    <BlockStack gap="200">
                      <InlineStack gap="200" blockAlign="center">
                        <Box>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #667EEA 0%, #4A90E2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
                              <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm1 13h-2v-2h2v2zm0-4h-2V7h2v4z"/>
                            </svg>
                          </div>
                        </Box>
                        <BlockStack gap="050">
                          <Text as="p" variant="bodySm" tone="subdued">
                            Deposits Collected
                          </Text>
                          <Text as="p" variant="headingLg" fontWeight="bold">
                            {formatCurrency(stats.totalRevenue)}
                          </Text>
                        </BlockStack>
                      </InlineStack>
                    </BlockStack>
                  </Card>
                </Box>

                <Box width="100%">
                  <Card>
                    <BlockStack gap="200">
                      <InlineStack gap="200" blockAlign="center">
                        <Box>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
                              <path d="M17 3h-1V1h-2v2H6V1H4v2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H3V8h14v9z"/>
                            </svg>
                          </div>
                        </Box>
                        <BlockStack gap="050">
                          <Text as="p" variant="bodySm" tone="subdued">
                            Upcoming Releases
                          </Text>
                          <Text as="p" variant="headingLg" fontWeight="bold">
                            {stats.upcomingReleases}
                          </Text>
                        </BlockStack>
                      </InlineStack>
                    </BlockStack>
                  </Card>
                </Box>
              </InlineStack>
            </Box>

            {/* Pre-orders with ready status */}
            {preorders.filter(p => p.status === "ready").length > 0 && (
              <Banner tone="info" icon={PackageIcon}>
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    {preorders.filter(p => p.status === "ready").length} pre-orders ready to ship
                  </Text>
                  <Text as="p" variant="bodyMd">
                    These pre-orders have reached their release date and are ready for fulfillment.
                  </Text>
                </BlockStack>
              </Banner>
            )}

            {/* Table */}
            <Card padding="0">
              <IndexFilters
                sortOptions={sortOptions}
                sortSelected={[sortValue]}
                onSortChange={handleSortChange}
                queryValue={queryValue}
                queryPlaceholder="Search pre-orders"
                onQueryChange={handleFiltersQueryChange}
                onQueryClear={() => setQueryValue("")}
                onClearAll={handleFiltersClearAll}
                filters={filters}
                tabs={[]}
                selected={selected}
                onSelect={setSelected}
                canCreateNewView={false}
                loading={false}
              />

              {sortedPreorders.length === 0 && queryValue === "" && statusFilter.length === 0 ? (
                emptyStateMarkup
              ) : (
                <IndexTable
                  condensed={!smUp}
                  resourceName={resourceName}
                  itemCount={sortedPreorders.length}
                  selectedItemsCount={
                    allResourcesSelected ? "All" : selectedResources.length
                  }
                  onSelectionChange={handleSelectionChange}
                  promotedBulkActions={promotedBulkActions}
                  bulkActions={bulkActions}
                  headings={headings}
                  sortable={[true, true, true, false, true, false, true]}
                >
                  {rowMarkup}
                </IndexTable>
              )}
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>

      {/* New Pre-order Modal */}
      <Modal
        open={newPreorderModalActive}
        onClose={toggleNewPreorderModal}
        title="Create new pre-order"
        primaryAction={{
          content: "Create",
          onAction: toggleNewPreorderModal,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: toggleNewPreorderModal,
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <TextField
              label="Product"
              value=""
              onChange={() => {}}
              placeholder="Search or select product"
              autoComplete="off"
            />
            <TextField
              label="Customer"
              value=""
              onChange={() => {}}
              placeholder="Search or select customer"
              autoComplete="off"
            />
            <TextField
              label="Quantity"
              type="number"
              value=""
              onChange={() => {}}
              autoComplete="off"
            />
            <TextField
              label="Deposit amount"
              type="number"
              value=""
              onChange={() => {}}
              prefix="$"
              autoComplete="off"
            />
            <TextField
              label="Expected release date"
              type="date"
              value=""
              onChange={() => {}}
              autoComplete="off"
            />
            <TextField
              label="Notes"
              value=""
              onChange={() => {}}
              multiline={3}
              autoComplete="off"
            />
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Page>
  );
}