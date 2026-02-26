// Customer store for managing customer-related state

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Customer, CustomerAddress } from '~/types';

interface CustomerState {
  // Data
  customers: Customer[];
  selectedCustomer: Customer | null;
  recentCustomers: Customer[];

  // Search & Filter
  searchQuery: string;
  filters: CustomerFilters;
  currentPage: number;
  pageSize: number;
  totalCustomers: number;

  // Loading & Error
  isLoading: boolean;
  error: string | null;

  // Statistics
  stats: CustomerStats;

  // Actions - Customers
  setCustomers: (customers: Customer[]) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  selectCustomer: (customer: Customer | null) => void;

  // Actions - Addresses
  addAddress: (customerId: string, address: CustomerAddress) => void;
  updateAddress: (customerId: string, addressId: string, updates: Partial<CustomerAddress>) => void;
  deleteAddress: (customerId: string, addressId: string) => void;
  setDefaultAddress: (customerId: string, addressId: string) => void;

  // Actions - Search & Filter
  setSearchQuery: (query: string) => void;
  setFilters: (filters: CustomerFilters) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Actions - Statistics
  updateStats: (stats: Partial<CustomerStats>) => void;

  // Actions - Utility
  addToRecent: (customer: Customer) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

interface CustomerFilters {
  acceptsMarketing?: boolean;
  verifiedEmail?: boolean;
  taxExempt?: boolean;
  tags?: string[];
  minOrdersCount?: number;
  maxOrdersCount?: number;
  minTotalSpent?: number;
  maxTotalSpent?: number;
  state?: 'enabled' | 'disabled' | 'invited' | 'declined';
  dateRange?: {
    from: Date;
    to: Date;
  };
}

interface CustomerStats {
  totalCustomers: number;
  newCustomersToday: number;
  newCustomersThisWeek: number;
  newCustomersThisMonth: number;
  acceptingMarketing: number;
  repeatCustomers: number;
  averageOrderValue: number;
  lifetimeValue: number;
}

const initialFilters: CustomerFilters = {};

const initialStats: CustomerStats = {
  totalCustomers: 0,
  newCustomersToday: 0,
  newCustomersThisWeek: 0,
  newCustomersThisMonth: 0,
  acceptingMarketing: 0,
  repeatCustomers: 0,
  averageOrderValue: 0,
  lifetimeValue: 0,
};

const initialState = {
  customers: [],
  selectedCustomer: null,
  recentCustomers: [],
  searchQuery: '',
  filters: initialFilters,
  currentPage: 1,
  pageSize: 20,
  totalCustomers: 0,
  isLoading: false,
  error: null,
  stats: initialStats,
};

export const useCustomerStore = create<CustomerState>()(
  devtools(
    immer((set) => ({
      ...initialState,

      // Customer Actions
      setCustomers: (customers) =>
        set((state) => {
          state.customers = customers;
          state.totalCustomers = customers.length;
        }),

      addCustomer: (customer) =>
        set((state) => {
          state.customers.unshift(customer);
          state.totalCustomers += 1;
          state.stats.totalCustomers += 1;
        }),

      updateCustomer: (id, updates) =>
        set((state) => {
          const index = state.customers.findIndex((c) => c.id === id);
          if (index !== -1) {
            Object.assign(state.customers[index], updates);
            if (state.selectedCustomer?.id === id) {
              Object.assign(state.selectedCustomer, updates);
            }
          }
        }),

      deleteCustomer: (id) =>
        set((state) => {
          state.customers = state.customers.filter((c) => c.id !== id);
          state.totalCustomers -= 1;
          state.stats.totalCustomers -= 1;
          if (state.selectedCustomer?.id === id) {
            state.selectedCustomer = null;
          }
          state.recentCustomers = state.recentCustomers.filter((c) => c.id !== id);
        }),

      selectCustomer: (customer) =>
        set((state) => {
          state.selectedCustomer = customer;
          if (customer) {
            state.addToRecent(customer);
          }
        }),

      // Address Actions
      addAddress: (customerId, address) =>
        set((state) => {
          const customer = state.customers.find((c) => c.id === customerId);
          if (customer) {
            customer.addresses.push(address);
            if (state.selectedCustomer?.id === customerId) {
              state.selectedCustomer.addresses.push(address);
            }
          }
        }),

      updateAddress: (customerId, addressId, updates) =>
        set((state) => {
          const customer = state.customers.find((c) => c.id === customerId);
          if (customer) {
            const addressIndex = customer.addresses.findIndex((a) => a.id === addressId);
            if (addressIndex !== -1) {
              Object.assign(customer.addresses[addressIndex], updates);
              if (state.selectedCustomer?.id === customerId) {
                const selectedAddressIndex = state.selectedCustomer.addresses.findIndex(
                  (a) => a.id === addressId
                );
                if (selectedAddressIndex !== -1) {
                  Object.assign(state.selectedCustomer.addresses[selectedAddressIndex], updates);
                }
              }
            }
          }
        }),

      deleteAddress: (customerId, addressId) =>
        set((state) => {
          const customer = state.customers.find((c) => c.id === customerId);
          if (customer) {
            customer.addresses = customer.addresses.filter((a) => a.id !== addressId);
            if (state.selectedCustomer?.id === customerId) {
              state.selectedCustomer.addresses = state.selectedCustomer.addresses.filter(
                (a) => a.id !== addressId
              );
            }
          }
        }),

      setDefaultAddress: (customerId, addressId) =>
        set((state) => {
          const customer = state.customers.find((c) => c.id === customerId);
          if (customer) {
            customer.addresses.forEach((address) => {
              address.isDefault = address.id === addressId;
            });
            if (address.isDefault) {
              customer.defaultAddress = address;
            }
            if (state.selectedCustomer?.id === customerId) {
              state.selectedCustomer.addresses.forEach((address) => {
                address.isDefault = address.id === addressId;
              });
              if (address.isDefault) {
                state.selectedCustomer.defaultAddress = address;
              }
            }
          }
        }),

      // Search & Filter Actions
      setSearchQuery: (query) =>
        set((state) => {
          state.searchQuery = query;
          state.currentPage = 1;
        }),

      setFilters: (filters) =>
        set((state) => {
          state.filters = filters;
          state.currentPage = 1;
        }),

      clearFilters: () =>
        set((state) => {
          state.filters = initialFilters;
          state.searchQuery = '';
          state.currentPage = 1;
        }),

      setPage: (page) =>
        set((state) => {
          state.currentPage = page;
        }),

      setPageSize: (size) =>
        set((state) => {
          state.pageSize = size;
          state.currentPage = 1;
        }),

      // Statistics Actions
      updateStats: (stats) =>
        set((state) => {
          Object.assign(state.stats, stats);
        }),

      // Utility Actions
      addToRecent: (customer) =>
        set((state) => {
          const filtered = state.recentCustomers.filter((c) => c.id !== customer.id);
          state.recentCustomers = [customer, ...filtered].slice(0, 10);
        }),

      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading;
        }),

      setError: (error) =>
        set((state) => {
          state.error = error;
        }),

      reset: () => set(() => initialState),
    })),
    {
      name: 'CustomerStore',
    }
  )
);