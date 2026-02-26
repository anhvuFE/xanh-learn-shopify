// Async hook for managing asynchronous operations

import { useState, useCallback, useRef, useEffect } from 'react';

interface AsyncState<T> {
  status: 'idle' | 'pending' | 'success' | 'error';
  data: T | null;
  error: Error | null;
}

interface UseAsyncReturn<T> {
  execute: (...args: any[]) => Promise<T | void>;
  status: AsyncState<T>['status'];
  data: T | null;
  error: Error | null;
  isIdle: boolean;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  reset: () => void;
}

export function useAsync<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  immediate = false
): UseAsyncReturn<T> {
  const [state, setState] = useState<AsyncState<T>>({
    status: 'idle',
    data: null,
    error: null,
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: any[]) => {
      setState({ status: 'pending', data: null, error: null });

      try {
        const response = await asyncFunction(...args);

        if (isMountedRef.current) {
          setState({ status: 'success', data: response, error: null });
        }

        return response;
      } catch (error) {
        if (isMountedRef.current) {
          setState({
            status: 'error',
            data: null,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
        throw error;
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setState({ status: 'idle', data: null, error: null });
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    execute,
    status: state.status,
    data: state.data,
    error: state.error,
    isIdle: state.status === 'idle',
    isPending: state.status === 'pending',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
    reset,
  };
}