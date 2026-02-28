// Payment reconciliation with transaction tracking and payout management

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
  Banner,
  DataTable,
  Divider,
  Icon,
  Link,
  Tabs,
} from "@shopify/polaris";
import type { BadgeProps, IndexTableProps } from "@shopify/polaris";
import {
  CashDollarFilledIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  RefreshIcon,
  ExportIcon,
} from "@shopify/polaris-icons";
import { useState, useCallback, useMemo } from "react";
import { useLoaderData, useNavigate } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

// Loader to fetch payment data
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // Mock data - replace with real API calls
  const transactions = [
    {
      id: "TXN001",
      transactionId: "ch_1MqLiJLkdIwHu7ix",
      orderId: "#1001",
      customerName: "John Doe",
      paymentMethod: "Credit Card",
      cardLast4: "4242",
      amount: 125.50,
      fee: 3.64,
      netAmount: 121.86,
      status: "completed" as const,
      gateway: "Stripe",
      createdAt: "2024-01-25T10:30:00Z",
      settledAt: "2024-01-27T00:00:00Z",
      currency: "USD",
    },
    {
      id: "TXN002",
      transactionId: "pi_1MqLiKLkdIwHu7ix",
      orderId: "#1002",
      customerName: "Jane Smith",
      paymentMethod: "PayPal",
      cardLast4: "",
      amount: 89.99,
      fee: 2.61,
      netAmount: 87.38,
      status: "pending" as const,
      gateway: "PayPal",
      createdAt: "2024-01-25T08:15:00Z",
      settledAt: null,
      currency: "USD",
    },
    {
      id: "TXN003",
      transactionId: "ch_1MqLiLLkdIwHu7ix",
      orderId: "#1003",
      customerName: "Bob Johnson",
      paymentMethod: "Credit Card",
      cardLast4: "5555",
      amount: 256.00,
      fee: 7.42,
      netAmount: 248.58,
      status: "completed" as const,
      gateway: "Stripe",
      createdAt: "2024-01-24T16:45:00Z",
      settledAt: "2024-01-26T00:00:00Z",
      currency: "USD",
    },
    {
      id: "TXN004",
      transactionId: "ref_1MqLiMLkdIwHu7ix",
      orderId: "#1004",
      customerName: "Alice Brown",
      paymentMethod: "Credit Card",
      cardLast4: "1234",
      amount: -178.25,
      fee: -5.17,
      netAmount: -173.08,
      status: "refunded" as const,
      gateway: "Stripe",
      createdAt: "2024-01-24T14:20:00Z",
      settledAt: "2024-01-24T14:20:00Z",
      currency: "USD",
    },
    {
      id: "TXN005",
      transactionId: "ch_1MqLiNLkdIwHu7ix",
      orderId: "#1005",
      customerName: "Charlie Wilson",
      paymentMethod: "Debit Card",
      cardLast4: "9876",
      amount: 349.99,
      fee: 10.15,
      netAmount: 339.84,
      status: "failed" as const,
      gateway: "Stripe",
      createdAt: "2024-01-23T11:30:00Z",
      settledAt: null,
      currency: "USD",
    },
    {
      id: "TXN006",
      transactionId: "ch_1MqLiOLkdIwHu7ix",
      orderId: "#1006",
      customerName: "Diana Prince",
      paymentMethod: "Apple Pay",
      cardLast4: "3333",
      amount: 567.89,
      fee: 16.47,
      netAmount: 551.42,
      status: "disputed" as const,
      gateway: "Stripe",
      createdAt: "2024-01-22T09:15:00Z",
      settledAt: null,
      currency: "USD",
    },
  ];

  const payouts = [
    {
      id: "PO001",
      payoutId: "po_1MqLiPLkdIwHu7ix",
      bankAccount: "****1234",
      amount: 2456.78,
      transactionCount: 15,
      status: "paid" as const,
      scheduledDate: "2024-01-25",
      paidDate: "2024-01-25",
      gateway: "Stripe",
    },
    {
      id: "PO002",
      payoutId: "po_1MqLiQLkdIwHu7ix",
      bankAccount: "****5678",
      amount: 1823.45,
      transactionCount: 12,
      status: "in_transit" as const,
      scheduledDate: "2024-01-28",
      paidDate: null,
      gateway: "Stripe",
    },
    {
      id: "PO003",
      payoutId: "po_1MqLiRLkdIwHu7ix",
      bankAccount: "****1234",
      amount: 3567.90,
      transactionCount: 23,
      status: "scheduled" as const,
      scheduledDate: "2024-02-01",
      paidDate: null,
      gateway: "Stripe",
    },
  ];

  const stats = {
    totalRevenue: transactions.filter(t => t.status === "completed").reduce((sum, t) => sum + Math.max(0, t.amount), 0),
    pendingAmount: transactions.filter(t => t.status === "pending").reduce((sum, t) => sum + t.amount, 0),
    totalFees: transactions.filter(t => t.status === "completed").reduce((sum, t) => sum + Math.abs(t.fee), 0),
    disputedAmount: transactions.filter(t => t.status === "disputed").reduce((sum, t) => sum + t.amount, 0),
    nextPayout: payouts.find(p => p.status === "scheduled"),
    recentPayouts: payouts.filter(p => p.status === "paid").slice(0, 3),
  };

  return json({ transactions, payouts, stats });
};

type Transaction = {
  id: string;
  transactionId: string;
  orderId: string;
  customerName: string;
  paymentMethod: string;
  cardLast4: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: "completed" | "pending" | "failed" | "refunded" | "disputed";
  gateway: string;
  createdAt: string;
  settledAt: string | null;
  currency: string;
};

type Payout = {
  id: string;
  payoutId: string;
  bankAccount: string;
  amount: number;
  transactionCount: number;
  status: "paid" | "in_transit" | "scheduled" | "failed";
  scheduledDate: string;
  paidDate: string | null;
  gateway: string;
};

type StatusBadge = {
  tone?: BadgeProps["tone"];
  text: string;
};

export default function PaymentsPage() {
  const { transactions, payouts, stats } = useLoaderData<{
    transactions: Transaction[];
    payouts: Payout[];
    stats: any;
  }>();

  const navigate = useNavigate();
  const { smUp } = useBreakpoints();

  const [selectedTab, setSelectedTab] = useState(0);
  const [queryValue, setQueryValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sortValue, setSortValue] = useState("created desc");
  const [reconcileModalActive, setReconcileModalActive] = useState(false);
  const [exportModalActive, setExportModalActive] = useState(false);

  const tabs = [
    {
      id: "transactions",
      content: "Transactions",
      badge: transactions.length.toString(),
      panelID: "transactions-panel",
    },
    {
      id: "payouts",
      content: "Payouts",
      badge: payouts.length.toString(),
      panelID: "payouts-panel",
    },
    {
      id: "reconciliation",
      content: "Reconciliation",
      panelID: "reconciliation-panel",
    },
  ];

  const resourceName = {
    singular: "transaction",
    plural: "transactions",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(transactions);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (queryValue) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.transactionId.toLowerCase().includes(queryValue.toLowerCase()) ||
          transaction.orderId.toLowerCase().includes(queryValue.toLowerCase()) ||
          transaction.customerName.toLowerCase().includes(queryValue.toLowerCase())
      );
    }

    if (statusFilter.length > 0) {
      filtered = filtered.filter((transaction) =>
        statusFilter.includes(transaction.status)
      );
    }

    return filtered;
  }, [transactions, queryValue, statusFilter]);

  // Sort transactions
  const sortedTransactions = useMemo(() => {
    const [field, direction] = sortValue.split(" ");

    return [...filteredTransactions].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (field) {
        case "amount":
          aValue = a.amount;
          bValue = b.amount;
          break;
        case "net":
          aValue = a.netAmount;
          bValue = b.netAmount;
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
  }, [filteredTransactions, sortValue]);

  const handleTabChange = useCallback((selectedTabIndex: number) => {
    setSelectedTab(selectedTabIndex);
  }, []);

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

  const toggleReconcileModal = useCallback(() => {
    setReconcileModalActive(!reconcileModalActive);
  }, [reconcileModalActive]);

  const toggleExportModal = useCallback(() => {
    setExportModalActive(!exportModalActive);
  }, [exportModalActive]);

  // Format currency
  const formatCurrency = (amount: number) => {
    const isNegative = amount < 0;
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(amount));

    return isNegative ? `-${formatted}` : formatted;
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get transaction status badge
  const getTransactionStatusBadge = (status: string): StatusBadge => {
    const statusMap = {
      completed: { tone: "success", text: "Completed" },
      pending: { tone: "warning", text: "Pending" },
      failed: { tone: "critical", text: "Failed" },
      refunded: { tone: "info", text: "Refunded" },
      disputed: { tone: "critical", text: "Disputed" },
    } satisfies Record<string, StatusBadge>;

    return statusMap[status as keyof typeof statusMap] || { text: status };
  };

  // Get payout status badge
  const getPayoutStatusBadge = (status: string): StatusBadge => {
    const statusMap = {
      paid: { tone: "success", text: "Paid" },
      in_transit: { tone: "info", text: "In Transit" },
      scheduled: { tone: "warning", text: "Scheduled" },
      failed: { tone: "critical", text: "Failed" },
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
            { label: "Completed", value: "completed" },
            { label: "Pending", value: "pending" },
            { label: "Failed", value: "failed" },
            { label: "Refunded", value: "refunded" },
            { label: "Disputed", value: "disputed" },
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
    { label: "Amount (High to Low)", value: "amount desc" },
    { label: "Amount (Low to High)", value: "amount asc" },
    { label: "Net amount (High to Low)", value: "net desc" },
  ];

  // Bulk actions
  const bulkActions = [
    {
      content: "Export transactions",
      onAction: () => console.log("Export:", selectedResources),
    },
    {
      content: "Mark as reconciled",
      onAction: () => console.log("Reconcile:", selectedResources),
    },
  ];

  // Transaction table headers
  const transactionHeadings: IndexTableProps["headings"] = [
    { title: "Transaction" },
    { title: "Order" },
    { title: "Customer" },
    { title: "Method" },
    { title: "Status" },
    { title: "Fee", alignment: "end" as const },
    { title: "Net", alignment: "end" as const },
    { title: "Amount", alignment: "end" as const },
  ];

  // Transaction row markup
  const transactionRowMarkup = sortedTransactions.map((transaction, index) => (
    <IndexTable.Row
      id={transaction.id}
      key={transaction.id}
      selected={selectedResources.includes(transaction.id)}
      position={index}
    >
      <IndexTable.Cell>
        <BlockStack gap="050">
          <Text as="span" variant="bodyMd" fontWeight="semibold">
            {transaction.transactionId}
          </Text>
          <Text as="span" variant="bodySm" tone="subdued">
            {formatDate(transaction.createdAt)}
          </Text>
        </BlockStack>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Link url={`/app/orders/${transaction.orderId.replace("#", "")}`} removeUnderline>
          <Text as="span" variant="bodyMd">
            {transaction.orderId}
          </Text>
        </Link>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Text as="span" variant="bodyMd">
          {transaction.customerName}
        </Text>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <BlockStack gap="050">
          <Text as="span" variant="bodyMd">
            {transaction.paymentMethod}
          </Text>
          {transaction.cardLast4 && (
            <Text as="span" variant="bodySm" tone="subdued">
              •••• {transaction.cardLast4}
            </Text>
          )}
        </BlockStack>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Badge tone={getTransactionStatusBadge(transaction.status).tone}>
          {getTransactionStatusBadge(transaction.status).text}
        </Badge>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Text as="span" variant="bodyMd" alignment="end" tone="critical">
          {formatCurrency(Math.abs(transaction.fee))}
        </Text>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Text
          as="span"
          variant="bodyMd"
          alignment="end"
          tone={transaction.netAmount < 0 ? "critical" : undefined}
        >
          {formatCurrency(transaction.netAmount)}
        </Text>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Text
          as="span"
          variant="bodyMd"
          alignment="end"
          fontWeight="semibold"
          tone={transaction.amount < 0 ? "critical" : undefined}
        >
          {formatCurrency(transaction.amount)}
        </Text>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  // Payout table data
  const payoutRows = payouts.map((payout) => [
    <Text key="id" as="span" variant="bodyMd" fontWeight="semibold">
      {payout.payoutId}
    </Text>,
    <Text key="bank" as="span" variant="bodyMd">
      {payout.bankAccount}
    </Text>,
    <Text key="amount" as="span" variant="bodyMd" fontWeight="semibold">
      {formatCurrency(payout.amount)}
    </Text>,
    <Text key="count" as="span" variant="bodyMd">
      {payout.transactionCount}
    </Text>,
    <Badge key="status" tone={getPayoutStatusBadge(payout.status).tone}>
      {getPayoutStatusBadge(payout.status).text}
    </Badge>,
    <Text key="date" as="span" variant="bodyMd">
      {formatDate(payout.paidDate || payout.scheduledDate)}
    </Text>,
  ]);

  // Empty state
  const emptyStateMarkup = (
    <EmptyState
      heading="No payment data yet"
      action={{
        content: "Configure payment gateway",
        onAction: () => navigate("/app/settings/payments"),
      }}
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    >
      <p>
        Once you start accepting payments, transaction data and reconciliation
        information will appear here.
      </p>
    </EmptyState>
  );

  return (
    <Page
      title="Payment Reconciliation"
      secondaryActions={[
        {
          content: "Export",
          icon: ExportIcon,
          onAction: toggleExportModal,
        },
        {
          content: "Reconcile",
          icon: RefreshIcon,
          onAction: toggleReconcileModal,
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="600">
            {/* Stats cards */}
            <InlineStack gap="400" align="space-between" blockAlign="stretch">
              <Card>
                <Box padding="400">
                  <BlockStack gap="200">
                    <InlineStack align="space-between">
                      <Text as="h3" variant="headingMd" tone="subdued">
                        Total Revenue
                      </Text>
                      <Icon source={ArrowUpIcon} tone="success" />
                    </InlineStack>
                    <Text as="p" variant="heading2xl" fontWeight="bold">
                      {formatCurrency(stats.totalRevenue)}
                    </Text>
                    <Text as="p" variant="bodySm" tone="success">
                      +12.5% from last month
                    </Text>
                  </BlockStack>
                </Box>
              </Card>

              <Card>
                <Box padding="400">
                  <BlockStack gap="200">
                    <InlineStack align="space-between">
                      <Text as="h3" variant="headingMd" tone="subdued">
                        Pending
                      </Text>
                      <Icon source={AlertTriangleIcon} tone="warning" />
                    </InlineStack>
                    <Text as="p" variant="heading2xl" fontWeight="bold" tone="warning">
                      {formatCurrency(stats.pendingAmount)}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {transactions.filter(t => t.status === "pending").length} transactions
                    </Text>
                  </BlockStack>
                </Box>
              </Card>

              <Card>
                <Box padding="400">
                  <BlockStack gap="200">
                    <InlineStack align="space-between">
                      <Text as="h3" variant="headingMd" tone="subdued">
                        Processing Fees
                      </Text>
                      <Icon source={ArrowDownIcon} tone="critical" />
                    </InlineStack>
                    <Text as="p" variant="heading2xl" fontWeight="bold" tone="critical">
                      {formatCurrency(stats.totalFees)}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      2.9% average rate
                    </Text>
                  </BlockStack>
                </Box>
              </Card>

              <Card>
                <Box padding="400">
                  <BlockStack gap="200">
                    <InlineStack align="space-between">
                      <Text as="h3" variant="headingMd" tone="subdued">
                        Next Payout
                      </Text>
                      <Icon source={CashDollarFilledIcon} tone="success" />
                    </InlineStack>
                    {stats.nextPayout ? (
                      <>
                        <Text as="p" variant="heading2xl" fontWeight="bold">
                          {formatCurrency(stats.nextPayout.amount)}
                        </Text>
                        <Text as="p" variant="bodySm" tone="subdued">
                          {formatDate(stats.nextPayout.scheduledDate)}
                        </Text>
                      </>
                    ) : (
                      <Text as="p" variant="bodyMd">
                        No scheduled payouts
                      </Text>
                    )}
                  </BlockStack>
                </Box>
              </Card>
            </InlineStack>

            {/* Disputed transactions warning */}
            {stats.disputedAmount > 0 && (
              <Banner tone="critical" icon={AlertTriangleIcon}>
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    Disputed transactions require attention
                  </Text>
                  <Text as="p" variant="bodyMd">
                    You have {formatCurrency(stats.disputedAmount)} in disputed transactions.
                    Review and respond to disputes to avoid chargebacks.
                  </Text>
                  <Button size="slim">Review disputes</Button>
                </BlockStack>
              </Banner>
            )}

            {/* Tabs */}
            <Card>
              <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
                {/* Transactions Tab */}
                {selectedTab === 0 && (
                  <Box padding="0">
                    <IndexFilters
                      sortOptions={sortOptions}
                      sortSelected={[sortValue]}
                      onSortChange={handleSortChange}
                      queryValue={queryValue}
                      queryPlaceholder="Search transactions"
                      onQueryChange={handleFiltersQueryChange}
                      onQueryClear={() => setQueryValue("")}
                      onClearAll={handleFiltersClearAll}
                      filters={filters}
                      tabs={[]}
                      selected={0}
                      onSelect={() => {}}
                      canCreateNewView={false}
                      loading={false}
                    />

                    {sortedTransactions.length === 0 ? (
                      emptyStateMarkup
                    ) : (
                      <IndexTable
                        condensed={!smUp}
                        resourceName={resourceName}
                        itemCount={sortedTransactions.length}
                        selectedItemsCount={
                          allResourcesSelected ? "All" : selectedResources.length
                        }
                        onSelectionChange={handleSelectionChange}
                        bulkActions={bulkActions}
                        headings={transactionHeadings}
                        sortable={[false, false, false, false, false, false, true, true]}
                      >
                        {transactionRowMarkup}
                      </IndexTable>
                    )}
                  </Box>
                )}

                {/* Payouts Tab */}
                {selectedTab === 1 && (
                  <Box padding="400">
                    <BlockStack gap="400">
                      <DataTable
                        columnContentTypes={["text", "text", "numeric", "numeric", "text", "text"]}
                        headings={["Payout ID", "Bank Account", "Amount", "Transactions", "Status", "Date"]}
                        rows={payoutRows}
                      />
                    </BlockStack>
                  </Box>
                )}

                {/* Reconciliation Tab */}
                {selectedTab === 2 && (
                  <Box padding="400">
                    <BlockStack gap="400">
                      <Banner tone="info">
                        <Text as="p" variant="bodyMd">
                          Reconciliation helps you match your Shopify payouts with your bank statements.
                        </Text>
                      </Banner>

                      <Card>
                        <BlockStack gap="400">
                          <Text as="h3" variant="headingMd">
                            Recent Reconciliations
                          </Text>
                          <Divider />

                          <InlineStack align="space-between">
                            <BlockStack gap="100">
                              <Text as="p" variant="bodyMd" fontWeight="semibold">
                                January 2024
                              </Text>
                              <Text as="p" variant="bodySm" tone="subdued">
                                Reconciled on Jan 31, 2024
                              </Text>
                            </BlockStack>
                            <InlineStack gap="200">
                              <Badge tone="success">Matched</Badge>
                              <Button size="slim" variant="plain">View details</Button>
                            </InlineStack>
                          </InlineStack>

                          <Divider />

                          <InlineStack align="space-between">
                            <BlockStack gap="100">
                              <Text as="p" variant="bodyMd" fontWeight="semibold">
                                December 2023
                              </Text>
                              <Text as="p" variant="bodySm" tone="subdued">
                                Reconciled on Dec 31, 2023
                              </Text>
                            </BlockStack>
                            <InlineStack gap="200">
                              <Badge tone="success">Matched</Badge>
                              <Button size="slim" variant="plain">View details</Button>
                            </InlineStack>
                          </InlineStack>
                        </BlockStack>
                      </Card>

                      <Card>
                        <BlockStack gap="400">
                          <Text as="h3" variant="headingMd">
                            Unreconciled Transactions
                          </Text>
                          <Text as="p" variant="bodyMd" tone="subdued">
                            3 transactions totaling {formatCurrency(468.32)} need reconciliation
                          </Text>
                          <Button onClick={toggleReconcileModal}>Start reconciliation</Button>
                        </BlockStack>
                      </Card>
                    </BlockStack>
                  </Box>
                )}
              </Tabs>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>

      {/* Reconcile Modal */}
      <Modal
        open={reconcileModalActive}
        onClose={toggleReconcileModal}
        title="Reconcile transactions"
        primaryAction={{
          content: "Reconcile",
          onAction: toggleReconcileModal,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: toggleReconcileModal,
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <Select
              label="Bank account"
              options={[
                { label: "Select account", value: "" },
                { label: "Business Checking ****1234", value: "1234" },
                { label: "Business Savings ****5678", value: "5678" },
              ]}
              onChange={() => {}}
              value=""
            />
            <TextField
              label="Statement period"
              type="date"
              value=""
              onChange={() => {}}
              autoComplete="off"
            />
            <TextField
              label="Starting balance"
              type="number"
              value=""
              onChange={() => {}}
              prefix="$"
              autoComplete="off"
            />
            <TextField
              label="Ending balance"
              type="number"
              value=""
              onChange={() => {}}
              prefix="$"
              autoComplete="off"
            />
          </BlockStack>
        </Modal.Section>
      </Modal>

      {/* Export Modal */}
      <Modal
        open={exportModalActive}
        onClose={toggleExportModal}
        title="Export payment data"
        primaryAction={{
          content: "Export",
          onAction: toggleExportModal,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: toggleExportModal,
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <Select
              label="Export type"
              options={[
                { label: "Transactions", value: "transactions" },
                { label: "Payouts", value: "payouts" },
                { label: "Full reconciliation report", value: "full" },
              ]}
              onChange={() => {}}
              value="transactions"
            />
            <Select
              label="Date range"
              options={[
                { label: "Last 7 days", value: "7" },
                { label: "Last 30 days", value: "30" },
                { label: "Last quarter", value: "90" },
                { label: "Custom range", value: "custom" },
              ]}
              onChange={() => {}}
              value="30"
            />
            <Select
              label="Format"
              options={[
                { label: "CSV", value: "csv" },
                { label: "Excel", value: "xlsx" },
                { label: "PDF", value: "pdf" },
              ]}
              onChange={() => {}}
              value="csv"
            />
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Page>
  );
}