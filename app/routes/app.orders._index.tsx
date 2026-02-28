// Orders listing page with status filtering, fulfillment tracking

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
  Link,
} from "@shopify/polaris";
import type {
  BadgeProps,
  SortButtonChoice,
  IndexTableProps,
} from "@shopify/polaris";
import { PlusIcon } from "@shopify/polaris-icons";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useCallback, useMemo } from "react";
import { useLoaderData, useNavigate } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

// Loader to fetch orders data
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // Mock data - replace with real API calls
  const orders = [
    {
      id: "1001",
      name: "#1001",
      email: "john.doe@example.com",
      customer: {
        firstName: "John",
        lastName: "Doe",
      },
      totalPrice: 125.5,
      currency: "USD",
      financialStatus: "paid" as const,
      fulfillmentStatus: "fulfilled" as const,
      tags: ["priority"],
      lineItemsCount: 2,
      createdAt: "2024-01-25T10:30:00Z",
      processedAt: "2024-01-25T10:30:00Z",
      shippingAddress: {
        city: "New York",
        province: "NY",
        country: "United States",
      },
    },
    {
      id: "1002",
      name: "#1002",
      email: "jane.smith@example.com",
      customer: {
        firstName: "Jane",
        lastName: "Smith",
      },
      totalPrice: 89.99,
      currency: "USD",
      financialStatus: "pending" as const,
      fulfillmentStatus: "unfulfilled" as const,
      tags: [],
      lineItemsCount: 1,
      createdAt: "2024-01-25T08:15:00Z",
      processedAt: "2024-01-25T08:15:00Z",
      shippingAddress: {
        city: "Los Angeles",
        province: "CA",
        country: "United States",
      },
    },
    {
      id: "1003",
      name: "#1003",
      email: "bob.johnson@example.com",
      customer: {
        firstName: "Bob",
        lastName: "Johnson",
      },
      totalPrice: 256.0,
      currency: "USD",
      financialStatus: "paid" as const,
      fulfillmentStatus: "partial" as const,
      tags: ["wholesale"],
      lineItemsCount: 5,
      createdAt: "2024-01-24T16:45:00Z",
      processedAt: "2024-01-24T16:45:00Z",
      shippingAddress: {
        city: "Chicago",
        province: "IL",
        country: "United States",
      },
    },
    {
      id: "1004",
      name: "#1004",
      email: "alice.brown@example.com",
      customer: {
        firstName: "Alice",
        lastName: "Brown",
      },
      totalPrice: 178.25,
      currency: "USD",
      financialStatus: "refunded" as const,
      fulfillmentStatus: "fulfilled" as const,
      tags: ["return"],
      lineItemsCount: 3,
      createdAt: "2024-01-24T14:20:00Z",
      processedAt: "2024-01-24T14:20:00Z",
      shippingAddress: {
        city: "Miami",
        province: "FL",
        country: "United States",
      },
    },
  ];

  return json({ orders });
};

type Order = {
  id: string;
  name: string;
  email: string;
  customer: {
    firstName: string;
    lastName: string;
  };
  totalPrice: number;
  currency: string;
  financialStatus:
    | "authorized"
    | "paid"
    | "partially_paid"
    | "partially_refunded"
    | "pending"
    | "refunded"
    | "voided";
  fulfillmentStatus: "fulfilled" | "unfulfilled" | "partial" | "restocked";
  tags: string[];
  lineItemsCount: number;
  createdAt: string;
  processedAt: string;
  shippingAddress: {
    city: string;
    province: string;
    country: string;
  };
};

export default function OrdersIndexPage() {
  const { orders } = useLoaderData<{ orders: Order[] }>();
  const navigate = useNavigate();
  const { smUp } = useBreakpoints();

  const [queryValue, setQueryValue] = useState("");
  const [sortValue, setSortValue] = useState("created desc");
  const [selected, setSelected] = useState(0);

  type StatusBadge = { tone?: BadgeProps["tone"]; text: string };

  const resourceName = {
    singular: "order",
    plural: "orders",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(orders);

  // Filter orders based on query
  const filteredOrders = useMemo(() => {
    if (!queryValue) return orders;

    return orders.filter(
      (order) =>
        order.name.toLowerCase().includes(queryValue.toLowerCase()) ||
        order.email.toLowerCase().includes(queryValue.toLowerCase()) ||
        `${order.customer.firstName} ${order.customer.lastName}`
          .toLowerCase()
          .includes(queryValue.toLowerCase()) ||
        order.tags.some((tag) =>
          tag.toLowerCase().includes(queryValue.toLowerCase()),
        ),
    );
  }, [orders, queryValue]);

  // Sort orders
  const sortedOrders = useMemo(() => {
    const [field, direction] = sortValue.split(" ");

    return [...filteredOrders].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (field) {
        case "order":
          aValue = parseInt(a.name.replace("#", ""));
          bValue = parseInt(b.name.replace("#", ""));
          break;
        case "customer":
          aValue =
            `${a.customer.firstName} ${a.customer.lastName}`.toLowerCase();
          bValue =
            `${b.customer.firstName} ${b.customer.lastName}`.toLowerCase();
          break;
        case "total":
          aValue = a.totalPrice;
          bValue = b.totalPrice;
          break;
        case "payment":
          aValue = a.financialStatus;
          bValue = b.financialStatus;
          break;
        case "fulfillment":
          aValue = a.fulfillmentStatus;
          bValue = b.fulfillmentStatus;
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
  }, [filteredOrders, sortValue]);

  const handleFiltersQueryChange = useCallback(
    (value: string) => setQueryValue(value),
    [],
  );

  const handleQueryValueRemove = useCallback(() => setQueryValue(""), []);
  const handleFiltersClearAll = useCallback(() => setQueryValue(""), []);

  const handleSortChange = useCallback((value: string[]) => {
    setSortValue(value[0] ?? "created-desc");
  }, []);

  // Format currency
  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
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

  // Get financial status badge
  const getFinancialStatusBadge = (status: string): StatusBadge | undefined => {
    const statusMap = {
      authorized: { tone: "info", text: "Authorized" },
      paid: { tone: "success", text: "Paid" },
      partially_paid: { tone: "warning", text: "Partially paid" },
      partially_refunded: {
        tone: "warning",
        text: "Partially refunded",
      },
      pending: { tone: "warning", text: "Pending" },
      refunded: { tone: "critical", text: "Refunded" },
      voided: { text: "Voided" },
    } satisfies Record<string, StatusBadge>;

    if (status in statusMap) return statusMap[status as keyof typeof statusMap];
    return undefined;
  };

  // Get fulfillment status badge
  const getFulfillmentStatusBadge = (status: string): StatusBadge | undefined => {
    const statusMap = {
      fulfilled: { tone: "success", text: "Fulfilled" },
      unfulfilled: { text: "Unfulfilled" },
      partial: { tone: "warning", text: "Partially fulfilled" },
      restocked: { tone: "info", text: "Restocked" },
    } satisfies Record<string, StatusBadge>;

    if (status in statusMap) return statusMap[status as keyof typeof statusMap];
    return undefined;
  };

  // Sort options
  const sortOptions: SortButtonChoice[] = [
    {
      label: "Order number (High to Low)",
      value: "order desc",
      directionLabel: "Order number high to low",
    },
    {
      label: "Order number (Low to High)",
      value: "order asc",
      directionLabel: "Order number low to high",
    },
    {
      label: "Customer name A-Z",
      value: "customer asc",
      directionLabel: "Customer name A-Z",
    },
    {
      label: "Customer name Z-A",
      value: "customer desc",
      directionLabel: "Customer name Z-A",
    },
    {
      label: "Total (High to Low)",
      value: "total desc",
      directionLabel: "Total high to low",
    },
    {
      label: "Total (Low to High)",
      value: "total asc",
      directionLabel: "Total low to high",
    },
    {
      label: "Date created (Newest first)",
      value: "created desc",
      directionLabel: "Newest first",
    },
    {
      label: "Date created (Oldest first)",
      value: "created asc",
      directionLabel: "Oldest first",
    },
    {
      label: "Payment status",
      value: "payment asc",
      directionLabel: "Payment status",
    },
    {
      label: "Fulfillment status",
      value: "fulfillment asc",
      directionLabel: "Fulfillment status",
    },
  ];

  // Bulk actions
  const promotedBulkActions = [
    {
      content: "Capture payment",
      onAction: () => console.log("Capture payment for:", selectedResources),
    },
    {
      content: "Fulfill orders",
      onAction: () => console.log("Fulfill:", selectedResources),
    },
  ];

  const bulkActions = [
    {
      content: "Mark as paid",
      onAction: () => console.log("Mark as paid:", selectedResources),
    },
    {
      content: "Add tags",
      onAction: () => console.log("Add tags to:", selectedResources),
    },
    {
      content: "Export orders",
      onAction: () => console.log("Export:", selectedResources),
    },
    {
      content: "Cancel orders",
      onAction: () => console.log("Cancel:", selectedResources),
      destructive: true,
    },
  ];

  // Table headers
  const headings: IndexTableProps["headings"] = [
    { title: "Order" },
    { title: "Date" },
    { title: "Customer" },
    { title: "Payment status" },
    { title: "Fulfillment status" },
    { title: "Items", alignment: "center" as const },
    { title: "Total", alignment: "end" as const },
  ];

  // Row markup
  const rowMarkup = sortedOrders.map((order, index) => (
    <IndexTable.Row
      id={order.id}
      key={order.id}
      selected={selectedResources.includes(order.id)}
      position={index}
      onClick={() => navigate(`/app/orders/${order.id}`)}
    >
      <IndexTable.Cell>
        <Link url={`/app/orders/${order.id}`} removeUnderline>
          <Text as="span" variant="bodyMd" fontWeight="semibold">
            {order.name}
          </Text>
        </Link>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Text as="span" variant="bodyMd">
          {formatDate(order.createdAt)}
        </Text>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Box minWidth="150">
          <Text as="p" variant="bodyMd" fontWeight="medium">
            {order.customer.firstName} {order.customer.lastName}
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            {order.shippingAddress.city}, {order.shippingAddress.province}
          </Text>
        </Box>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Badge tone={getFinancialStatusBadge(order.financialStatus)?.tone}>
          {getFinancialStatusBadge(order.financialStatus)?.text}
        </Badge>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Badge tone={getFulfillmentStatusBadge(order.fulfillmentStatus)?.tone}>
          {getFulfillmentStatusBadge(order.fulfillmentStatus)?.text}
        </Badge>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Text as="span" alignment="center" numeric>
          {order.lineItemsCount}
        </Text>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Text as="span" alignment="end" numeric fontWeight="semibold">
          {formatCurrency(order.totalPrice, order.currency)}
        </Text>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  // Empty state
  const emptyStateMarkup = (
    <EmptyState
      heading="Start taking orders"
      action={{
        content: "Create order",
        onAction: () => navigate("/app/orders/new"),
      }}
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    >
      <p>
        When customers place orders in your store, they'll appear here. You can
        also create orders manually for phone or in-person sales.
      </p>
    </EmptyState>
  );

  return (
    <Page
      title="Orders"
      primaryAction={{
        content: "Create order",
        icon: PlusIcon,
        onAction: () => navigate("/app/orders/new"),
      }}
    >
      <Layout>
        <Layout.Section>
          <Card padding="0">
            <IndexFilters
              sortOptions={sortOptions}
              sortSelected={[sortValue]}
              onSortChange={handleSortChange}
              queryValue={queryValue}
              queryPlaceholder="Search orders"
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

            {sortedOrders.length === 0 && queryValue === "" ? (
              emptyStateMarkup
            ) : (
              <IndexTable
                condensed={!smUp}
                resourceName={resourceName}
                itemCount={sortedOrders.length}
                selectedItemsCount={
                  allResourcesSelected ? "All" : selectedResources.length
                }
                onSelectionChange={handleSelectionChange}
                promotedBulkActions={promotedBulkActions}
                bulkActions={bulkActions}
                headings={headings}
                sortable={[true, true, true, false, false, false, true]}
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
