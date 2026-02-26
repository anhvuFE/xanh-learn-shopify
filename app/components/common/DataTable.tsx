// Reusable data table component with sorting, filtering, and pagination

import React, { useState, useMemo, useCallback } from 'react';
import {
  IndexTable,
  IndexFilters,
  useIndexResourceState,
  Text,
  Badge,
  Button,
  Filters,
  Select,
  TextField,
  Card,
  EmptyState,
} from '@shopify/polaris';
import type { IndexTableSortDirection } from '@shopify/polaris';

export interface Column<T> {
  id: string;
  title: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  sortable?: boolean;
  width?: string;
  align?: 'start' | 'center' | 'end';
  render?: (value: any, item: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  sortable?: boolean;
  onSort?: (column: string, direction: 'ascending' | 'descending') => void;
  filters?: FilterConfig[];
  onFilter?: (filters: Record<string, any>) => void;
  actions?: ActionConfig<T>[];
  bulkActions?: BulkActionConfig[];
  emptyState?: EmptyStateConfig;
  pagination?: PaginationConfig;
  onPageChange?: (page: number) => void;
}

interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: { label: string; value: string }[];
  placeholder?: string;
}

interface ActionConfig<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (item: T) => void;
  destructive?: boolean;
  disabled?: (item: T) => boolean;
}

interface BulkActionConfig {
  label: string;
  onClick: (selectedIds: string[]) => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface EmptyStateConfig {
  heading: string;
  content: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  image?: string;
}

interface PaginationConfig {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  total: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  loading = false,
  selectable = true,
  onSelectionChange,
  sortable = true,
  onSort,
  filters = [],
  onFilter,
  actions = [],
  bulkActions = [],
  emptyState,
  pagination,
  onPageChange,
}: DataTableProps<T>) {
  const [sortedColumn, setSortedColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<IndexTableSortDirection>('descending');
  const [queryValue, setQueryValue] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  const resourceIds = useMemo(() => data.map((item) => item.id), [data]);

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(data);

  // Handle sorting
  const handleSort = useCallback(
    (columnId: string) => {
      const newDirection =
        sortedColumn === columnId && sortDirection === 'descending'
          ? 'ascending'
          : 'descending';

      setSortedColumn(columnId);
      setSortDirection(newDirection);

      if (onSort) {
        onSort(columnId, newDirection);
      }
    },
    [sortedColumn, sortDirection, onSort]
  );

  // Handle filter changes
  const handleFilterChange = useCallback(
    (key: string, value: any) => {
      const newFilters = { ...activeFilters, [key]: value };
      setActiveFilters(newFilters);

      if (onFilter) {
        onFilter(newFilters);
      }
    },
    [activeFilters, onFilter]
  );

  // Build table headings
  const headings = columns.map((column) => ({
    title: column.title,
    id: column.id,
    ...(column.align && { alignment: column.align }),
  }));

  // Render cell content
  const renderCell = (item: T, column: Column<T>, index: number) => {
    let value;

    if (typeof column.accessor === 'function') {
      value = column.accessor(item);
    } else {
      value = item[column.accessor];
    }

    if (column.render) {
      return column.render(value, item, index);
    }

    return <Text as="span" variant="bodyMd">{value as React.ReactNode}</Text>;
  };

  // Build row markup
  const rowMarkup = data.map((item, index) => (
    <IndexTable.Row
      id={item.id}
      key={item.id}
      selected={selectedResources.includes(item.id)}
      position={index}
    >
      {columns.map((column) => (
        <IndexTable.Cell key={column.id}>
          {renderCell(item, column, index)}
        </IndexTable.Cell>
      ))}
      {actions.length > 0 && (
        <IndexTable.Cell>
          {actions.map((action, actionIndex) => (
            <Button
              key={actionIndex}
              size="slim"
              onClick={() => action.onClick(item)}
              destructive={action.destructive}
              disabled={action.disabled?.(item)}
            >
              {action.label}
            </Button>
          ))}
        </IndexTable.Cell>
      )}
    </IndexTable.Row>
  ));

  // Build bulk actions
  const promotedBulkActions = bulkActions.map((action) => ({
    content: action.label,
    onAction: () => action.onClick(selectedResources),
    destructive: action.destructive,
    disabled: action.disabled,
  }));

  // Empty state
  if (!loading && data.length === 0 && emptyState) {
    return (
      <Card>
        <EmptyState
          heading={emptyState.heading}
          image={emptyState.image}
          action={emptyState.action ? {
            content: emptyState.action.label,
            onAction: emptyState.action.onClick,
          } : undefined}
        >
          <p>{emptyState.content}</p>
        </EmptyState>
      </Card>
    );
  }

  return (
    <Card padding="0">
      <IndexFilters
        queryValue={queryValue}
        queryPlaceholder="Search..."
        onQueryChange={setQueryValue}
        onQueryClear={() => setQueryValue('')}
        filters={filters.map((filter) => ({
          key: filter.key,
          label: filter.label,
          filter: (
            filter.type === 'select' ? (
              <Select
                label={filter.label}
                options={filter.options || []}
                value={activeFilters[filter.key] || ''}
                onChange={(value) => handleFilterChange(filter.key, value)}
              />
            ) : (
              <TextField
                label={filter.label}
                value={activeFilters[filter.key] || ''}
                onChange={(value) => handleFilterChange(filter.key, value)}
                placeholder={filter.placeholder}
                autoComplete="off"
              />
            )
          ),
        }))}
        tabs={[]}
        selected={0}
        canCreateNewView={false}
        onClearAll={() => setActiveFilters({})}
      />

      <IndexTable
        resourceName={{
          singular: 'item',
          plural: 'items',
        }}
        itemCount={data.length}
        selectedItemsCount={
          allResourcesSelected ? 'All' : selectedResources.length
        }
        onSelectionChange={handleSelectionChange}
        headings={headings}
        promotedBulkActions={promotedBulkActions}
        loading={loading}
        sortable={sortable ? columns.map((col) => col.sortable !== false) : undefined}
        sortDirection={sortDirection}
        sortColumnIndex={columns.findIndex((col) => col.id === sortedColumn)}
        onSort={(columnIndex) => handleSort(columns[columnIndex].id)}
        hasZebraStriping
        selectable={selectable}
      >
        {rowMarkup}
      </IndexTable>

      {pagination && (
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Button
            disabled={!pagination.hasPrevious}
            onClick={() => onPageChange?.(pagination.currentPage - 1)}
          >
            Previous
          </Button>
          <Text as="span" variant="bodyMd">
            {` Page ${pagination.currentPage} of ${pagination.totalPages} `}
          </Text>
          <Button
            disabled={!pagination.hasNext}
            onClick={() => onPageChange?.(pagination.currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </Card>
  );
}