// Shop store for managing shop settings and configuration

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Shop, ShopSettings } from '~/types';

interface ShopState {
  // Shop Data
  shop: Shop | null;
  settings: ShopSettings | null;

  // Billing & Plan
  currentPlan: PlanInfo | null;
  billingHistory: BillingRecord[];

  // Analytics
  analytics: ShopAnalytics;

  // Loading & Error
  isLoading: boolean;
  error: string | null;

  // Actions - Shop
  setShop: (shop: Shop) => void;
  updateShop: (updates: Partial<Shop>) => void;
  setSettings: (settings: ShopSettings) => void;
  updateSettings: (updates: Partial<ShopSettings>) => void;

  // Actions - Billing
  setPlan: (plan: PlanInfo) => void;
  addBillingRecord: (record: BillingRecord) => void;

  // Actions - Analytics
  updateAnalytics: (analytics: Partial<ShopAnalytics>) => void;

  // Actions - Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

interface PlanInfo {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  limits: {
    products?: number;
    orders?: number;
    staff?: number;
    storage?: number; // in GB
    bandwidth?: number; // in GB
  };
  currentUsage: {
    products: number;
    orders: number;
    staff: number;
    storage: number;
    bandwidth: number;
  };
  nextBillingDate: Date;
  trialEndsAt?: Date;
}

interface BillingRecord {
  id: string;
  date: Date;
  amount: number;
  currency: string;
  description: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  invoiceUrl?: string;
}

interface ShopAnalytics {
  // Overview
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;

  // Today's Stats
  todayRevenue: number;
  todayOrders: number;
  todayVisitors: number;
  todayConversion: number;

  // Trends (percentage change)
  revenueGrowth: number;
  orderGrowth: number;
  customerGrowth: number;
  conversionGrowth: number;

  // Top Items
  topProducts: Array<{ id: string; name: string; sales: number }>;
  topCategories: Array<{ name: string; revenue: number }>;

  // Period
  periodStart: Date;
  periodEnd: Date;
}

const initialAnalytics: ShopAnalytics = {
  totalRevenue: 0,
  totalOrders: 0,
  totalCustomers: 0,
  totalProducts: 0,
  todayRevenue: 0,
  todayOrders: 0,
  todayVisitors: 0,
  todayConversion: 0,
  revenueGrowth: 0,
  orderGrowth: 0,
  customerGrowth: 0,
  conversionGrowth: 0,
  topProducts: [],
  topCategories: [],
  periodStart: new Date(),
  periodEnd: new Date(),
};

const initialState = {
  shop: null,
  settings: null,
  currentPlan: null,
  billingHistory: [],
  analytics: initialAnalytics,
  isLoading: false,
  error: null,
};

export const useShopStore = create<ShopState>()(
  devtools(
    persist(
      immer((set) => ({
        ...initialState,

        // Shop Actions
        setShop: (shop) =>
          set((state) => {
            state.shop = shop;
          }),

        updateShop: (updates) =>
          set((state) => {
            if (state.shop) {
              Object.assign(state.shop, updates);
            }
          }),

        setSettings: (settings) =>
          set((state) => {
            state.settings = settings;
          }),

        updateSettings: (updates) =>
          set((state) => {
            if (state.settings) {
              Object.assign(state.settings, updates);
            }
          }),

        // Billing Actions
        setPlan: (plan) =>
          set((state) => {
            state.currentPlan = plan;
          }),

        addBillingRecord: (record) =>
          set((state) => {
            state.billingHistory.unshift(record);
            // Keep only last 100 records
            if (state.billingHistory.length > 100) {
              state.billingHistory = state.billingHistory.slice(0, 100);
            }
          }),

        // Analytics Actions
        updateAnalytics: (analytics) =>
          set((state) => {
            Object.assign(state.analytics, analytics);
          }),

        // Utility Actions
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
        name: 'shop-store',
        partialize: (state) => ({
          shop: state.shop,
          settings: state.settings,
          currentPlan: state.currentPlan,
        }),
      }
    ),
    {
      name: 'ShopStore',
    }
  )
);