// Shopify-specific hooks for app bridge and API interactions

import { useEffect, useCallback, useState } from 'react';
import { useAppBridge } from '@shopify/app-bridge-react';
import { Redirect } from '@shopify/app-bridge/actions';
import { authenticatedFetch } from '@shopify/app-bridge/utilities';
import type { ClientApplication } from '@shopify/app-bridge';

interface ShopifyFetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
}

export function useShopify() {
  const app = useAppBridge();
  const [shop, setShop] = useState<string | null>(null);

  // Get authenticated fetch function
  const authFetch = authenticatedFetch(app);

  // Enhanced fetch with retry logic
  const shopifyFetch = useCallback(
    async (url: string, options: ShopifyFetchOptions = {}) => {
      const { retries = 3, retryDelay = 1000, ...fetchOptions } = options;

      let lastError: Error | null = null;

      for (let i = 0; i < retries; i++) {
        try {
          const response = await authFetch(url, fetchOptions);

          // Handle rate limiting
          if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            const delay = retryAfter ? parseInt(retryAfter) * 1000 : retryDelay * (i + 1);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }

          // Throw for other errors
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          return response;
        } catch (error) {
          lastError = error as Error;

          // Don't retry on certain errors
          if (error instanceof Error && error.message.includes('401')) {
            throw error; // Authentication error, don't retry
          }

          // Wait before retrying
          if (i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
          }
        }
      }

      throw lastError || new Error('Failed after retries');
    },
    [authFetch]
  );

  // GraphQL query helper
  const graphql = useCallback(
    async <T = any>(query: string, variables?: Record<string, any>): Promise<T> => {
      const response = await shopifyFetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'GraphQL error');
      }

      return data.data;
    },
    [shopifyFetch]
  );

  // Navigate to a URL
  const navigate = useCallback(
    (url: string, options?: { newTab?: boolean; external?: boolean }) => {
      const redirect = Redirect.create(app);

      if (options?.external || options?.newTab) {
        redirect.dispatch(Redirect.Action.REMOTE, {
          url,
          newContext: options.newTab,
        });
      } else {
        redirect.dispatch(Redirect.Action.APP, url);
      }
    },
    [app]
  );

  // Toast notification helper
  const toast = useCallback(
    (message: string, options?: { duration?: number; isError?: boolean }) => {
      const toastOptions = {
        message,
        duration: options?.duration || 5000,
        isError: options?.isError || false,
      };

      app.dispatch({
        type: 'APP::TOAST::SHOW',
        payload: toastOptions,
      });
    },
    [app]
  );

  // Get shop domain
  useEffect(() => {
    const getShop = async () => {
      try {
        const response = await shopifyFetch('/api/shop');
        const data = await response.json();
        setShop(data.shop);
      } catch (error) {
        console.error('Failed to get shop domain:', error);
      }
    };

    getShop();
  }, [shopifyFetch]);

  // Open resource picker
  const openResourcePicker = useCallback(
    (options: {
      resourceType: 'Product' | 'ProductVariant' | 'Collection';
      selectMultiple?: boolean;
      onSelection?: (resources: any[]) => void;
    }) => {
      const { resourceType, selectMultiple = false, onSelection } = options;

      app.dispatch({
        type: 'APP::RESOURCE_PICKER::SELECT',
        payload: {
          resourceType,
          options: {
            selectMultiple,
          },
        },
      });

      // Listen for selection
      if (onSelection) {
        const handleSelection = (event: any) => {
          if (event.type === 'APP::RESOURCE_PICKER::SELECT::DONE') {
            onSelection(event.payload.selection);
          }
        };

        app.subscribe(handleSelection);

        return () => {
          app.unsubscribe(handleSelection);
        };
      }
    },
    [app]
  );

  // Create app modal
  const modal = useCallback(
    (options: {
      title: string;
      message?: string;
      primaryAction?: { content: string; onAction: () => void };
      secondaryActions?: Array<{ content: string; onAction: () => void }>;
    }) => {
      app.dispatch({
        type: 'APP::MODAL::OPEN',
        payload: options,
      });
    },
    [app]
  );

  return {
    app,
    shop,
    shopifyFetch,
    graphql,
    navigate,
    toast,
    openResourcePicker,
    modal,
  };
}