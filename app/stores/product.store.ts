// Product store for managing product-related state

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Product, ProductFilter, Collection, ProductVariant } from '~/types';

interface ProductState {
  // Data
  products: Product[];
  collections: Collection[];
  selectedProduct: Product | null;
  selectedCollection: Collection | null;

  // Filters & Pagination
  filters: ProductFilter;
  currentPage: number;
  pageSize: number;
  totalProducts: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';

  // Loading & Error States
  isLoading: boolean;
  error: string | null;

  // Actions - Products
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  selectProduct: (product: Product | null) => void;

  // Actions - Collections
  setCollections: (collections: Collection[]) => void;
  addCollection: (collection: Collection) => void;
  updateCollection: (id: string, updates: Partial<Collection>) => void;
  deleteCollection: (id: string) => void;
  selectCollection: (collection: Collection | null) => void;

  // Actions - Filters & Pagination
  setFilters: (filters: ProductFilter) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void;

  // Actions - Variants
  addVariant: (productId: string, variant: ProductVariant) => void;
  updateVariant: (productId: string, variantId: string, updates: Partial<ProductVariant>) => void;
  deleteVariant: (productId: string, variantId: string) => void;

  // Actions - Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialFilters: ProductFilter = {
  status: undefined,
  vendor: undefined,
  productType: undefined,
  tags: [],
  collections: [],
  minPrice: undefined,
  maxPrice: undefined,
  query: undefined,
};

const initialState = {
  products: [],
  collections: [],
  selectedProduct: null,
  selectedCollection: null,
  filters: initialFilters,
  currentPage: 1,
  pageSize: 20,
  totalProducts: 0,
  sortBy: 'title',
  sortOrder: 'asc' as const,
  isLoading: false,
  error: null,
};

export const useProductStore = create<ProductState>()(
  devtools(
    immer((set) => ({
      ...initialState,

      // Product Actions
      setProducts: (products) =>
        set((state) => {
          state.products = products;
          state.totalProducts = products.length;
        }),

      addProduct: (product) =>
        set((state) => {
          state.products.push(product);
          state.totalProducts += 1;
        }),

      updateProduct: (id, updates) =>
        set((state) => {
          const index = state.products.findIndex((p) => p.id === id);
          if (index !== -1) {
            Object.assign(state.products[index], updates);
            if (state.selectedProduct?.id === id) {
              Object.assign(state.selectedProduct, updates);
            }
          }
        }),

      deleteProduct: (id) =>
        set((state) => {
          state.products = state.products.filter((p) => p.id !== id);
          state.totalProducts -= 1;
          if (state.selectedProduct?.id === id) {
            state.selectedProduct = null;
          }
        }),

      selectProduct: (product) =>
        set((state) => {
          state.selectedProduct = product;
        }),

      // Collection Actions
      setCollections: (collections) =>
        set((state) => {
          state.collections = collections;
        }),

      addCollection: (collection) =>
        set((state) => {
          state.collections.push(collection);
        }),

      updateCollection: (id, updates) =>
        set((state) => {
          const index = state.collections.findIndex((c) => c.id === id);
          if (index !== -1) {
            Object.assign(state.collections[index], updates);
            if (state.selectedCollection?.id === id) {
              Object.assign(state.selectedCollection, updates);
            }
          }
        }),

      deleteCollection: (id) =>
        set((state) => {
          state.collections = state.collections.filter((c) => c.id !== id);
          if (state.selectedCollection?.id === id) {
            state.selectedCollection = null;
          }
        }),

      selectCollection: (collection) =>
        set((state) => {
          state.selectedCollection = collection;
        }),

      // Filter & Pagination Actions
      setFilters: (filters) =>
        set((state) => {
          state.filters = filters;
          state.currentPage = 1; // Reset to first page when filters change
        }),

      clearFilters: () =>
        set((state) => {
          state.filters = initialFilters;
          state.currentPage = 1;
        }),

      setPage: (page) =>
        set((state) => {
          state.currentPage = page;
        }),

      setPageSize: (size) =>
        set((state) => {
          state.pageSize = size;
          state.currentPage = 1; // Reset to first page when page size changes
        }),

      setSorting: (sortBy, sortOrder) =>
        set((state) => {
          state.sortBy = sortBy;
          state.sortOrder = sortOrder;
        }),

      // Variant Actions
      addVariant: (productId, variant) =>
        set((state) => {
          const product = state.products.find((p) => p.id === productId);
          if (product) {
            product.variants.push(variant);
            if (state.selectedProduct?.id === productId) {
              state.selectedProduct.variants.push(variant);
            }
          }
        }),

      updateVariant: (productId, variantId, updates) =>
        set((state) => {
          const product = state.products.find((p) => p.id === productId);
          if (product) {
            const variantIndex = product.variants.findIndex((v) => v.id === variantId);
            if (variantIndex !== -1) {
              Object.assign(product.variants[variantIndex], updates);
              if (state.selectedProduct?.id === productId) {
                const selectedVariantIndex = state.selectedProduct.variants.findIndex(
                  (v) => v.id === variantId
                );
                if (selectedVariantIndex !== -1) {
                  Object.assign(state.selectedProduct.variants[selectedVariantIndex], updates);
                }
              }
            }
          }
        }),

      deleteVariant: (productId, variantId) =>
        set((state) => {
          const product = state.products.find((p) => p.id === productId);
          if (product) {
            product.variants = product.variants.filter((v) => v.id !== variantId);
            if (state.selectedProduct?.id === productId) {
              state.selectedProduct.variants = state.selectedProduct.variants.filter(
                (v) => v.id !== variantId
              );
            }
          }
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
      name: 'ProductStore',
    }
  )
);