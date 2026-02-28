// Returns and refunds management with RMA processing

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
  Select,
  Checkbox,
  Banner,
  Avatar,
  Thumbnail,
  Link,
  Divider,
  RadioButton,
  InlineGrid,
} from "@shopify/polaris";
import type { BadgeProps, IndexTableProps } from "@shopify/polaris";
import {
  ReturnIcon,
  PackageIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  XIcon,
  PrintIcon,
  EmailIcon,
} from "@shopify/polaris-icons";
import { useState, useCallback, useMemo } from "react";
import { useLoaderData, useNavigate } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

// Loader to fetch returns data
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // Mock data - replace with real API calls
  const returns = [
    {
      id: "RMA001",
      rmaNumber: "#RMA-001",
      orderId: "#1001",
      customer: {
        id: "cust_1",
        name: "John Doe",
        email: "john.doe@example.com",
        avatar: "JD",
      },
      items: [
        {
          id: "item_1",
          title: "Wireless Headphones",
          variant: "Black",
          quantity: 1,
          reason: "Defective",
          image: "https://burst.shopifycdn.com/photos/black-leather-choker-necklace_373x@2x.jpg",
        },
      ],
      reason: "Defective product",
      status: "pending" as const,
      refundStatus: "pending" as const,
      refundAmount: 125.50,
      shippingLabel: false,
      createdAt: "2024-01-25T10:30:00Z",
      notes: "Customer reports audio cutting out intermittently",
      restockable: false,
    },
    {
      id: "RMA002",
      rmaNumber: "#RMA-002",
      orderId: "#1002",
      customer: {
        id: "cust_2",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        avatar: "JS",
      },
      items: [
        {
          id: "item_2",
          title: "Running Shoes",
          variant: "Size 9 / Blue",
          quantity: 1,
          reason: "Wrong size",
          image: "https://burst.shopifycdn.com/photos/wrist-watches_373x@2x.jpg",
        },
      ],
      reason: "Wrong size",
      status: "approved" as const,
      refundStatus: "pending" as const,
      refundAmount: 89.99,
      shippingLabel: true,
      createdAt: "2024-01-24T08:15:00Z",
      notes: "Customer needs size 10 instead",
      restockable: true,
    },
    {
      id: "RMA003",
      rmaNumber: "#RMA-003",
      orderId: "#1003",
      customer: {
        id: "cust_3",
        name: "Bob Johnson",
        email: "bob.johnson@example.com",
        avatar: "BJ",
      },
      items: [
        {
          id: "item_3",
          title: "Smart Watch",
          variant: "Silver",
          quantity: 1,
          reason: "Not as described",
          image: "https://burst.shopifycdn.com/photos/business-woman-smiling-in-office_373x@2x.jpg",
        },
        {
          id: "item_4",
          title: "Watch Band",
          variant: "Leather / Brown",
          quantity: 2,
          reason: "Not as described",
          image: "https://burst.shopifycdn.com/photos/flatlay-iron-skillet-with-meat-and-other-food_373x@2x.jpg",
        },
      ],
      reason: "Not as described",
      status: "received" as const,
      refundStatus: "processing" as const,
      refundAmount: 256.00,
      shippingLabel: true,
      createdAt: "2024-01-23T16:45:00Z",
      notes: "Items received at warehouse, inspection in progress",
      restockable: true,
    },
    {
      id: "RMA004",
      rmaNumber: "#RMA-004",
      orderId: "#1004",
      customer: {
        id: "cust_4",
        name: "Alice Brown",
        email: "alice.brown@example.com",
        avatar: "AB",
      },
      items: [
        {
          id: "item_5",
          title: "Laptop Bag",
          variant: "Black",
          quantity: 1,
          reason: "Changed mind",
          image: "https://burst.shopifycdn.com/photos/turmeric-bowl-and-wooden-spoon_373x@2x.jpg",
        },
      ],
      reason: "Changed mind",
      status: "completed" as const,
      refundStatus: "refunded" as const,
      refundAmount: 178.25,
      shippingLabel: true,
      createdAt: "2024-01-20T14:20:00Z",
      notes: "Return completed, refund issued",
      restockable: true,
    },
    {
      id: "RMA005",
      rmaNumber: "#RMA-005",
      orderId: "#1005",
      customer: {
        id: "cust_5",
        name: "Charlie Wilson",
        email: "charlie.wilson@example.com",
        avatar: "CW",
      },
      items: [
        {
          id: "item_6",
          title: "Coffee Maker",
          variant: "Stainless Steel",
          quantity: 1,
          reason: "Damaged in transit",
          image: "https://burst.shopifycdn.com/photos/flatlay-iron-skillet-with-meat-and-other-food_373x@2x.jpg",
        },
      ],
      reason: "Damaged in transit",
      status: "rejected" as const,
      refundStatus: "not_applicable" as const,
      refundAmount: 0,
      shippingLabel: false,
      createdAt: "2024-01-19T11:30:00Z",
      notes: "Return rejected - outside return window",
      restockable: false,
    },
  ];

  const stats = {
    totalReturns: returns.length,
    pendingApproval: returns.filter(r => r.status === "pending").length,
    awaitingReturn: returns.filter(r => r.status === "approved").length,
    totalRefunds: returns.filter(r => r.refundStatus === "refunded").reduce((sum, r) => sum + r.refundAmount, 0),
    returnRate: 3.2, // percentage
  };

  return json({ returns, stats });
};

type Return = {
  id: string;
  rmaNumber: string;
  orderId: string;
  customer: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  items: Array<{
    id: string;
    title: string;
    variant: string;
    quantity: number;
    reason: string;
    image: string;
  }>;
  reason: string;
  status: "pending" | "approved" | "received" | "completed" | "rejected";
  refundStatus: "pending" | "processing" | "refunded" | "not_applicable";
  refundAmount: number;
  shippingLabel: boolean;
  createdAt: string;
  notes: string;
  restockable: boolean;
};

type StatusBadge = {
  tone?: BadgeProps["tone"];
  text: string;
  icon?: typeof AlertCircleIcon;
};

export default function ReturnsPage() {
  const { returns, stats } = useLoaderData<{
    returns: Return[];
    stats: {
      totalReturns: number;
      pendingApproval: number;
      awaitingReturn: number;
      totalRefunds: number;
      returnRate: number;
    };
  }>();

  const navigate = useNavigate();
  const { smUp } = useBreakpoints();

  const [queryValue, setQueryValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sortValue, setSortValue] = useState("created desc");
  const [selected, setSelected] = useState(0);
  const [processReturnModalActive, setProcessReturnModalActive] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);

  const resourceName = {
    singular: "return",
    plural: "returns",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(returns);

  // Filter returns
  const filteredReturns = useMemo(() => {
    let filtered = [...returns];

    if (queryValue) {
      filtered = filtered.filter(
        (returnItem) =>
          returnItem.rmaNumber.toLowerCase().includes(queryValue.toLowerCase()) ||
          returnItem.orderId.toLowerCase().includes(queryValue.toLowerCase()) ||
          returnItem.customer.name.toLowerCase().includes(queryValue.toLowerCase()) ||
          returnItem.customer.email.toLowerCase().includes(queryValue.toLowerCase())
      );
    }

    if (statusFilter.length > 0) {
      filtered = filtered.filter((returnItem) =>
        statusFilter.includes(returnItem.status)
      );
    }

    return filtered;
  }, [returns, queryValue, statusFilter]);

  // Sort returns
  const sortedReturns = useMemo(() => {
    const [field, direction] = sortValue.split(" ");

    return [...filteredReturns].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (field) {
        case "rma":
          aValue = a.rmaNumber;
          bValue = b.rmaNumber;
          break;
        case "customer":
          aValue = a.customer.name.toLowerCase();
          bValue = b.customer.name.toLowerCase();
          break;
        case "amount":
          aValue = a.refundAmount;
          bValue = b.refundAmount;
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
  }, [filteredReturns, sortValue]);

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

  const handleProcessReturn = useCallback((returnItem: Return) => {
    setSelectedReturn(returnItem);
    setProcessReturnModalActive(true);
  }, []);

  const toggleProcessReturnModal = useCallback(() => {
    setProcessReturnModalActive(!processReturnModalActive);
    if (!processReturnModalActive) {
      setSelectedReturn(null);
    }
  }, [processReturnModalActive]);

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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get return status badge
  const getReturnStatusBadge = (status: string): StatusBadge => {
    const statusMap = {
      pending: { tone: "warning", text: "Pending Approval", icon: AlertCircleIcon },
      approved: { tone: "info", text: "Approved", icon: CheckCircleIcon },
      received: { tone: "info", text: "Received", icon: PackageIcon },
      completed: { tone: "success", text: "Completed", icon: CheckCircleIcon },
      rejected: { tone: "critical", text: "Rejected", icon: XIcon },
    } satisfies Record<string, StatusBadge>;

    return statusMap[status as keyof typeof statusMap] || { text: status };
  };

  // Get refund status badge
  const getRefundStatusBadge = (status: string): StatusBadge => {
    const statusMap = {
      pending: { text: "Pending" },
      processing: { tone: "warning", text: "Processing" },
      refunded: { tone: "success", text: "Refunded" },
      not_applicable: { text: "N/A" },
    } satisfies Record<string, StatusBadge>;

    return statusMap[status as keyof typeof statusMap] || { text: status };
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
            { label: "Pending Approval", value: "pending" },
            { label: "Approved", value: "approved" },
            { label: "Received", value: "received" },
            { label: "Completed", value: "completed" },
            { label: "Rejected", value: "rejected" },
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
    { label: "RMA number", value: "rma asc" },
    { label: "Customer name", value: "customer asc" },
    { label: "Refund amount (High to Low)", value: "amount desc" },
  ];

  // Bulk actions
  const promotedBulkActions = [
    {
      content: "Approve returns",
      onAction: () => console.log("Approve:", selectedResources),
    },
    {
      content: "Send labels",
      onAction: () => console.log("Send labels to:", selectedResources),
    },
  ];

  const bulkActions = [
    {
      content: "Export returns",
      onAction: () => console.log("Export:", selectedResources),
    },
    {
      content: "Update status",
      onAction: () => console.log("Update status for:", selectedResources),
    },
    {
      content: "Reject returns",
      onAction: () => console.log("Reject:", selectedResources),
      destructive: true,
    },
  ];

  // Table headers
  const headings: IndexTableProps["headings"] = [
    { title: "RMA" },
    { title: "Order" },
    { title: "Customer" },
    { title: "Items" },
    { title: "Reason" },
    { title: "Status" },
    { title: "Refund", alignment: "end" as const },
    { title: "Actions" },
  ];

  // Row markup
  const rowMarkup = sortedReturns.map((returnItem, index) => (
    <IndexTable.Row
      id={returnItem.id}
      key={returnItem.id}
      selected={selectedResources.includes(returnItem.id)}
      position={index}
    >
      <IndexTable.Cell>
        <BlockStack gap="050">
          <Text as="span" variant="bodyMd" fontWeight="semibold">
            {returnItem.rmaNumber}
          </Text>
          <Text as="span" variant="bodySm" tone="subdued">
            {formatDate(returnItem.createdAt)}
          </Text>
        </BlockStack>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Link url={`/app/orders/${returnItem.orderId.replace("#", "")}`} removeUnderline>
          <Text as="span" variant="bodyMd">
            {returnItem.orderId}
          </Text>
        </Link>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <InlineStack gap="200" blockAlign="center">
          <Avatar size="sm" initials={returnItem.customer.avatar} />
          <BlockStack gap="050">
            <Text as="p" variant="bodyMd">
              {returnItem.customer.name}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              {returnItem.customer.email}
            </Text>
          </BlockStack>
        </InlineStack>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <BlockStack gap="200">
          {returnItem.items.map((item, idx) => (
            <InlineStack key={idx} gap="200" blockAlign="center">
              <Thumbnail
                source={item.image}
                alt={item.title}
                size="extraSmall"
              />
              <BlockStack gap="050">
                <Text as="p" variant="bodySm">
                  {item.title}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  {item.variant} × {item.quantity}
                </Text>
              </BlockStack>
            </InlineStack>
          ))}
        </BlockStack>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Text as="span" variant="bodyMd">
          {returnItem.reason}
        </Text>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <BlockStack gap="100">
          <Badge tone={getReturnStatusBadge(returnItem.status).tone}>
            {getReturnStatusBadge(returnItem.status).text}
          </Badge>
          <Badge tone={getRefundStatusBadge(returnItem.refundStatus).tone}>
            {getRefundStatusBadge(returnItem.refundStatus).text}
          </Badge>
        </BlockStack>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Text as="span" variant="bodyMd" alignment="end" fontWeight="semibold">
          {formatCurrency(returnItem.refundAmount)}
        </Text>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <InlineStack gap="100">
          {returnItem.status === "pending" && (
            <Button size="slim" onClick={() => handleProcessReturn(returnItem)}>
              Process
            </Button>
          )}
          {returnItem.status === "approved" && !returnItem.shippingLabel && (
            <Button size="slim" icon={PrintIcon}>
              Label
            </Button>
          )}
          {returnItem.shippingLabel && returnItem.status === "approved" && (
            <Button size="slim" icon={EmailIcon}>
              Resend
            </Button>
          )}
          <Button variant="plain" size="slim">
            View
          </Button>
        </InlineStack>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  // Empty state
  const emptyStateMarkup = (
    <EmptyState
      heading="No returns yet"
      action={{
        content: "Learn about returns",
        onAction: () => console.log("Learn more"),
      }}
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    >
      <p>
        When customers request returns, they'll appear here for your review and
        processing.
      </p>
    </EmptyState>
  );

  return (
    <Page
      title="Returns & Refunds"
      primaryAction={{
        content: "Create return",
        icon: ReturnIcon,
        onAction: () => navigate("/app/returns/new"),
      }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="600">
            {/* Stats cards */}
            <InlineGrid columns={{ xs: 1, sm: 2, md: 5 }} gap="400">
              <Card>
                <Box padding="400">
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd" tone="subdued">
                      Total Returns
                    </Text>
                    <Text as="p" variant="heading2xl" fontWeight="bold">
                      {stats.totalReturns}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      This month
                    </Text>
                  </BlockStack>
                </Box>
              </Card>

              <Card>
                <Box padding="400">
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd" tone="subdued">
                      Pending Approval
                    </Text>
                    <Text as="p" variant="heading2xl" fontWeight="bold" tone="warning">
                      {stats.pendingApproval}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Needs review
                    </Text>
                  </BlockStack>
                </Box>
              </Card>

              <Card>
                <Box padding="400">
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd" tone="subdued">
                      Awaiting Return
                    </Text>
                    <Text as="p" variant="heading2xl" fontWeight="bold" tone="info">
                      {stats.awaitingReturn}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      In transit
                    </Text>
                  </BlockStack>
                </Box>
              </Card>

              <Card>
                <Box padding="400">
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd" tone="subdued">
                      Total Refunded
                    </Text>
                    <Text as="p" variant="heading2xl" fontWeight="bold">
                      {formatCurrency(stats.totalRefunds)}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      This month
                    </Text>
                  </BlockStack>
                </Box>
              </Card>

              <Card>
                <Box padding="400">
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd" tone="subdued">
                      Return Rate
                    </Text>
                    <Text as="p" variant="heading2xl" fontWeight="bold">
                      {stats.returnRate}%
                    </Text>
                    <Text as="p" variant="bodySm" tone={stats.returnRate > 5 ? "critical" : "success"}>
                      {stats.returnRate > 5 ? "Above average" : "Below average"}
                    </Text>
                  </BlockStack>
                </Box>
              </Card>
            </InlineGrid>

            {/* Pending returns alert */}
            {stats.pendingApproval > 0 && (
              <Banner tone="warning" icon={AlertCircleIcon}>
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    {stats.pendingApproval} returns pending approval
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Review and approve return requests to maintain customer satisfaction.
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
                queryPlaceholder="Search returns"
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

              {sortedReturns.length === 0 && queryValue === "" && statusFilter.length === 0 ? (
                emptyStateMarkup
              ) : (
                <IndexTable
                  condensed={!smUp}
                  resourceName={resourceName}
                  itemCount={sortedReturns.length}
                  selectedItemsCount={
                    allResourcesSelected ? "All" : selectedResources.length
                  }
                  onSelectionChange={handleSelectionChange}
                  promotedBulkActions={promotedBulkActions}
                  bulkActions={bulkActions}
                  headings={headings}
                  sortable={[true, false, true, false, false, false, true, false]}
                >
                  {rowMarkup}
                </IndexTable>
              )}
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>

      {/* Process Return Modal */}
      <Modal
        open={processReturnModalActive}
        onClose={toggleProcessReturnModal}
        title="Process return request"
        primaryAction={{
          content: "Approve return",
          onAction: toggleProcessReturnModal,
        }}
        secondaryActions={[
          {
            content: "Reject",
            destructive: true,
            onAction: toggleProcessReturnModal,
          },
          {
            content: "Cancel",
            onAction: toggleProcessReturnModal,
          },
        ]}
      >
        {selectedReturn && (
          <Modal.Section>
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="300">
                  <Text as="h3" variant="headingMd">
                    Return Details
                  </Text>
                  <InlineGrid columns={2} gap="400">
                    <BlockStack gap="100">
                      <Text as="p" variant="bodySm" tone="subdued">
                        RMA Number
                      </Text>
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        {selectedReturn.rmaNumber}
                      </Text>
                    </BlockStack>
                    <BlockStack gap="100">
                      <Text as="p" variant="bodySm" tone="subdued">
                        Order
                      </Text>
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        {selectedReturn.orderId}
                      </Text>
                    </BlockStack>
                    <BlockStack gap="100">
                      <Text as="p" variant="bodySm" tone="subdued">
                        Customer
                      </Text>
                      <Text as="p" variant="bodyMd">
                        {selectedReturn.customer.name}
                      </Text>
                    </BlockStack>
                    <BlockStack gap="100">
                      <Text as="p" variant="bodySm" tone="subdued">
                        Reason
                      </Text>
                      <Text as="p" variant="bodyMd">
                        {selectedReturn.reason}
                      </Text>
                    </BlockStack>
                  </InlineGrid>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <Text as="h3" variant="headingMd">
                    Items to Return
                  </Text>
                  {selectedReturn.items.map((item, idx) => (
                    <InlineStack key={idx} gap="300" blockAlign="center">
                      <Thumbnail source={item.image} alt={item.title} size="small" />
                      <BlockStack gap="050" fill>
                        <Text as="p" variant="bodyMd" fontWeight="medium">
                          {item.title}
                        </Text>
                        <Text as="p" variant="bodySm" tone="subdued">
                          {item.variant} × {item.quantity}
                        </Text>
                        <Text as="p" variant="bodySm">
                          Reason: {item.reason}
                        </Text>
                      </BlockStack>
                      <Checkbox
                        label="Restockable"
                        checked={selectedReturn.restockable}
                        onChange={() => {}}
                      />
                    </InlineStack>
                  ))}
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <Text as="h3" variant="headingMd">
                    Refund Details
                  </Text>
                  <TextField
                    label="Refund amount"
                    type="number"
                    value={selectedReturn.refundAmount.toString()}
                    onChange={() => {}}
                    prefix="$"
                    autoComplete="off"
                  />
                  <Select
                    label="Refund method"
                    options={[
                      { label: "Original payment method", value: "original" },
                      { label: "Store credit", value: "credit" },
                      { label: "Manual refund", value: "manual" },
                    ]}
                    onChange={() => {}}
                    value="original"
                  />
                  <Checkbox
                    label="Generate return shipping label"
                    checked={true}
                    onChange={() => {}}
                  />
                  <TextField
                    label="Internal notes"
                    value={selectedReturn.notes}
                    onChange={() => {}}
                    multiline={3}
                    autoComplete="off"
                  />
                </BlockStack>
              </Card>
            </BlockStack>
          </Modal.Section>
        )}
      </Modal>
    </Page>
  );
}