// Customers listing page with search, filtering, and customer management

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
  Avatar,
  InlineStack,
  Box,
  EmptyState,
  useBreakpoints,
} from '@shopify/polaris';
import { PlusIcon } from '@shopify/polaris-icons';
import { TitleBar } from '@shopify/app-bridge-react';
import { useState, useCallback, useMemo } from 'react';
import { useLoaderData, useNavigate } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { authenticate } from '../shopify.server';

// Loader to fetch customers data
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // Mock data - replace with real API calls
  const customers = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      acceptsMarketing: true,
      ordersCount: 12,
      totalSpent: 1245.67,
      state: 'enabled' as const,
      tags: ['vip', 'repeat-customer'],
      defaultAddress: {
        city: 'New York',
        country: 'United States',
      },
      createdAt: '2023-08-15',
      lastOrderAt: '2024-01-20',
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-0456',
      acceptsMarketing: false,
      ordersCount: 3,
      totalSpent: 289.99,
      state: 'enabled' as const,
      tags: ['new-customer'],
      defaultAddress: {
        city: 'Los Angeles',
        country: 'United States',
      },
      createdAt: '2024-01-05',
      lastOrderAt: '2024-01-18',
    },
    {
      id: '3',
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob.johnson@example.com',
      phone: null,
      acceptsMarketing: true,
      ordersCount: 0,
      totalSpent: 0,
      state: 'invited' as const,
      tags: [],
      defaultAddress: {
        city: 'Chicago',
        country: 'United States',
      },
      createdAt: '2024-01-25',
      lastOrderAt: null,
    },
    {
      id: '4',
      firstName: 'Alice',
      lastName: 'Brown',
      email: 'alice.brown@example.com',
      phone: '+1-555-0789',
      acceptsMarketing: true,
      ordersCount: 8,
      totalSpent: 567.89,
      state: 'disabled' as const,
      tags: ['problematic'],
      defaultAddress: {
        city: 'Miami',
        country: 'United States',
      },
      createdAt: '2023-11-12',
      lastOrderAt: '2023-12-30',
    },
  ];

  return json({ customers });
};

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  acceptsMarketing: boolean;
  ordersCount: number;
  totalSpent: number;
  state: 'enabled' | 'disabled' | 'invited' | 'declined';
  tags: string[];
  defaultAddress: {
    city: string;
    country: string;
  };
  createdAt: string;
  lastOrderAt: string | null;
};

export default function CustomersIndexPage() {
  const { customers } = useLoaderData<{ customers: Customer[] }>();
  const navigate = useNavigate();
  const { smUp } = useBreakpoints();

  const [queryValue, setQueryValue] = useState('');
  const [sortValue, setSortValue] = useState('name-asc');
  const [selected, setSelected] = useState(0);

  const resourceName = {
    singular: 'customer',
    plural: 'customers',
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(customers);

  // Filter customers based on query
  const filteredCustomers = useMemo(() => {
    if (!queryValue) return customers;

    return customers.filter((customer) =>
      `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(queryValue.toLowerCase()) ||
      customer.email.toLowerCase().includes(queryValue.toLowerCase()) ||
      customer.tags.some(tag => tag.toLowerCase().includes(queryValue.toLowerCase()))
    );
  }, [customers, queryValue]);

  // Sort customers
  const sortedCustomers = useMemo(() => {
    const [field, direction] = sortValue.split('-');

    return [...filteredCustomers].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (field) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'email':
          aValue = a.email;
          bValue = b.email;
          break;
        case 'location':
          aValue = a.defaultAddress.city;
          bValue = b.defaultAddress.city;
          break;
        case 'orders':
          aValue = a.ordersCount;
          bValue = b.ordersCount;
          break;
        case 'spent':
          aValue = a.totalSpent;
          bValue = b.totalSpent;
          break;
        case 'created':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
      }

      if (direction === 'desc') {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });
  }, [filteredCustomers, sortValue]);

  const handleFiltersQueryChange = useCallback(
    (value: string) => setQueryValue(value),
    []
  );

  const handleQueryValueRemove = useCallback(() => setQueryValue(''), []);
  const handleFiltersClearAll = useCallback(() => setQueryValue(''), []);

  const handleSortChange = useCallback((value: string) => setSortValue(value), []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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

  // Sort options
  const sortOptions = [
    { label: 'Customer name A-Z', value: 'name-asc' },
    { label: 'Customer name Z-A', value: 'name-desc' },
    { label: 'Email A-Z', value: 'email-asc' },
    { label: 'Email Z-A', value: 'email-desc' },
    { label: 'Location A-Z', value: 'location-asc' },
    { label: 'Location Z-A', value: 'location-desc' },
    { label: 'Orders (Low to High)', value: 'orders-asc' },
    { label: 'Orders (High to Low)', value: 'orders-desc' },
    { label: 'Amount spent (Low to High)', value: 'spent-asc' },
    { label: 'Amount spent (High to Low)', value: 'spent-desc' },
    { label: 'Date created (Newest first)', value: 'created-desc' },
    { label: 'Date created (Oldest first)', value: 'created-asc' },
  ];

  // Bulk actions
  const promotedBulkActions = [
    {
      content: 'Send email',
      onAction: () => console.log('Send email to:', selectedResources),
    },
    {
      content: 'Export customers',
      onAction: () => console.log('Export:', selectedResources),
    },
  ];

  const bulkActions = [
    {
      content: 'Enable customers',
      onAction: () => console.log('Enable:', selectedResources),
    },
    {
      content: 'Disable customers',
      onAction: () => console.log('Disable:', selectedResources),
    },
    {
      content: 'Delete customers',
      onAction: () => console.log('Delete:', selectedResources),
      destructive: true,
    },
  ];

  // Table headers
  const headings = [
    { title: 'Customer' },
    { title: 'Location' },
    { title: 'Orders', alignment: 'end' as const },
    { title: 'Amount spent', alignment: 'end' as const },
    { title: 'Status' },
  ];

  // Row markup
  const rowMarkup = sortedCustomers.map((customer, index) => (
    <IndexTable.Row
      id={customer.id}
      key={customer.id}
      selected={selectedResources.includes(customer.id)}
      position={index}
      onClick={() => navigate(`/app/customers/${customer.id}`)}
    >
      <IndexTable.Cell>
        <InlineStack gap="300" blockAlign="center">
          <Avatar
            customer
            name={`${customer.firstName} ${customer.lastName}`}
            size="small"
          />
          <Box minWidth="200">
            <Text as="div" variant="bodyMd" fontWeight="semibold">
              {customer.firstName} {customer.lastName}
            </Text>
            <Text as="div" variant="bodyMd" tone="subdued">
              {customer.email}
            </Text>
          </Box>
        </InlineStack>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Text as="span" variant="bodyMd">
          {customer.defaultAddress.city}, {customer.defaultAddress.country}
        </Text>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Text as="span" alignment="end" numeric>
          {customer.ordersCount}
        </Text>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Text as="span" alignment="end" numeric>
          {formatCurrency(customer.totalSpent)}
        </Text>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Badge tone={getStatusBadge(customer.state)?.tone}>
          {getStatusBadge(customer.state)?.text}
        </Badge>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  // Empty state
  const emptyStateMarkup = (
    <EmptyState
      heading="Create your first customer"
      action={{
        content: 'Add customer',
        onAction: () => navigate('/app/customers/new'),
      }}
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    >
      <p>
        Import your existing customer list or add customers as they place orders.
        Customers who create accounts will appear here.
      </p>
    </EmptyState>
  );

  return (
    <Page
      title="Customers"
      primaryAction={{
        content: 'Add customer',
        icon: PlusIcon,
        onAction: () => navigate('/app/customers/new'),
      }}
    >
      <Layout>
        <Layout.Section>
          <Card padding="0">
            <IndexFilters
              sortOptions={sortOptions}
              sortSelected={sortValue}
              onSortChange={handleSortChange}
              queryValue={queryValue}
              queryPlaceholder="Search customers"
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

            {sortedCustomers.length === 0 && queryValue === '' ? (
              emptyStateMarkup
            ) : (
              <IndexTable
                condensed={!smUp}
                resourceName={resourceName}
                itemCount={sortedCustomers.length}
                selectedItemsCount={
                  allResourcesSelected ? 'All' : selectedResources.length
                }
                onSelectionChange={handleSelectionChange}
                promotedBulkActions={promotedBulkActions}
                bulkActions={bulkActions}
                headings={headings}
                sortable={[true, true, true, true, false]}
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