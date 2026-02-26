// Custom hook for authentication logic

import { useCallback, useEffect } from 'react';
import { useNavigate } from '@remix-run/react';
import { useAuthStore } from '~/stores';
import type { User } from '~/types';

export const useAuth = () => {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setTokens,
    logout: storeLogout,
    checkAuthStatus,
    setLoading,
    setError,
  } = useAuthStore();

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Login function
  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);

      try {
        // TODO: Replace with actual API call
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          throw new Error('Invalid credentials');
        }

        const data = await response.json();

        setUser(data.user);
        setTokens(
          data.accessToken,
          data.refreshToken,
          new Date(data.expiresAt)
        );

        navigate('/app');
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Login failed';
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [navigate, setUser, setTokens, setLoading, setError]
  );

  // Logout function
  const logout = useCallback(async () => {
    try {
      // TODO: Call logout API to invalidate tokens
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      storeLogout();
      navigate('/auth/login');
    }
  }, [storeLogout, navigate]);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    const refreshToken = useAuthStore.getState().refreshToken;

    if (!refreshToken) {
      logout();
      return null;
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();

      setTokens(
        data.accessToken,
        data.refreshToken,
        new Date(data.expiresAt)
      );

      return data.accessToken;
    } catch (error) {
      logout();
      return null;
    }
  }, [setTokens, logout]);

  // Update user profile
  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/users/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error('Failed to update profile');
        }

        const updatedUser = await response.json();
        setUser(updatedUser);

        return { success: true, user: updatedUser };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Update failed';
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [setUser, setLoading, setError]
  );

  // Check if user has specific permission
  const hasPermission = useCallback(
    (resource: string, action: string): boolean => {
      if (!user) return false;

      return user.permissions.some(
        (perm) =>
          perm.resource === resource &&
          (perm.actions.includes(action as any) || perm.actions.includes('manage'))
      );
    },
    [user]
  );

  // Check if user has specific role
  const hasRole = useCallback(
    (role: string): boolean => {
      return user?.role === role;
    },
    [user]
  );

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login,
    logout,
    refreshToken,
    updateProfile,

    // Helpers
    hasPermission,
    hasRole,
    checkAuthStatus,
  };
};