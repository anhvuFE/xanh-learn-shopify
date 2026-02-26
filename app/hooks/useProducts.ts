// Custom hook for product management

import { useCallback, useEffect, useState } from 'react';
import { useProductStore } from '~/stores';
import { useNotificationStore } from '~/stores';
import type { Product, ProductFilter, ProductVariant } from '~/types';

interface UseProductsOptions {
  autoLoad?: boolean;
  filters?: ProductFilter;
  pageSize?: number;
}

export const useProducts = (options: UseProductsOptions = {}) => {
  const { autoLoad = true, filters: initialFilters = {}, pageSize = 20 } = options;

  const {
    products,
    selectedProduct,
    filters,
    currentPage,
    totalProducts,
    isLoading,
    error,
    setProducts,
    setFilters,
    setPage,
    setPageSize,
    selectProduct,
    setLoading,
    setError,
  } = useProductStore();

  const notify = useNotificationStore();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize filters and page size
  useEffect(() => {
    if (!isInitialized) {
      setFilters(initialFilters);
      setPageSize(pageSize);
      setIsInitialized(true);
    }
  }, [initialFilters, pageSize, setFilters, setPageSize, isInitialized]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>),
      });

      const response = await fetch(`/api/products?${queryParams}`);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.items);

      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load products';
      setError(message);
      notify.error('Error', message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters, setProducts, setLoading, setError, notify]);

  // Auto-load products on mount if enabled
  useEffect(() => {
    if (autoLoad && isInitialized) {
      fetchProducts();
    }
  }, [autoLoad, isInitialized, fetchProducts]);

  // Create product
  const createProduct = useCallback(
    async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });

        if (!response.ok) {
          throw new Error('Failed to create product');
        }

        const newProduct = await response.json();
        useProductStore.getState().addProduct(newProduct);

        notify.success('Success', 'Product created successfully');
        return { success: true, product: newProduct };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create product';
        setError(message);
        notify.error('Error', message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, notify]
  );

  // Update product
  const updateProduct = useCallback(
    async (id: string, updates: Partial<Product>) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error('Failed to update product');
        }

        const updatedProduct = await response.json();
        useProductStore.getState().updateProduct(id, updatedProduct);

        notify.success('Success', 'Product updated successfully');
        return { success: true, product: updatedProduct };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update product';
        setError(message);
        notify.error('Error', message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, notify]
  );

  // Delete product
  const deleteProduct = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete product');
        }

        useProductStore.getState().deleteProduct(id);

        notify.success('Success', 'Product deleted successfully');
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete product';
        setError(message);
        notify.error('Error', message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, notify]
  );

  // Bulk delete products
  const bulkDelete = useCallback(
    async (ids: string[]) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/products/bulk-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids }),
        });

        if (!response.ok) {
          throw new Error('Failed to delete products');
        }

        ids.forEach(id => useProductStore.getState().deleteProduct(id));

        notify.success('Success', `${ids.length} products deleted successfully`);
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete products';
        setError(message);
        notify.error('Error', message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, notify]
  );

  // Add product variant
  const addVariant = useCallback(
    async (productId: string, variant: Omit<ProductVariant, 'id' | 'createdAt' | 'updatedAt'>) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/products/${productId}/variants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(variant),
        });

        if (!response.ok) {
          throw new Error('Failed to add variant');
        }

        const newVariant = await response.json();
        useProductStore.getState().addVariant(productId, newVariant);

        notify.success('Success', 'Variant added successfully');
        return { success: true, variant: newVariant };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to add variant';
        setError(message);
        notify.error('Error', message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, notify]
  );

  // Search products
  const searchProducts = useCallback(
    async (query: string) => {
      setFilters({ ...filters, query });
      return fetchProducts();
    },
    [filters, setFilters, fetchProducts]
  );

  // Filter by status
  const filterByStatus = useCallback(
    (status: Product['status'] | undefined) => {
      setFilters({ ...filters, status });
      setPage(1);
    },
    [filters, setFilters, setPage]
  );

  // Get filtered products
  const getFilteredProducts = useCallback(() => {
    let filtered = [...products];

    // Apply filters
    if (filters.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }
    if (filters.vendor) {
      filtered = filtered.filter(p => p.vendor === filters.vendor);
    }
    if (filters.productType) {
      filtered = filtered.filter(p => p.productType === filters.productType);
    }
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(p =>
        filters.tags!.some(tag => p.tags.includes(tag))
      );
    }
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(p =>
        p.variants.some(v => v.price >= filters.minPrice!)
      );
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(p =>
        p.variants.some(v => v.price <= filters.maxPrice!)
      );
    }
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.vendor.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [products, filters]);

  return {
    // State
    products,
    selectedProduct,
    filters,
    currentPage,
    totalProducts,
    isLoading,
    error,

    // Actions
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkDelete,
    addVariant,
    selectProduct,

    // Filters & Search
    searchProducts,
    filterByStatus,
    setFilters,
    setPage,

    // Helpers
    getFilteredProducts,
    refresh: fetchProducts,
  };
};