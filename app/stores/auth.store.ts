// Authentication store for managing user authentication state

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { User, Session } from '~/types';

interface AuthState {
  // User & Session
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;

  // Loading & Error
  isLoading: boolean;
  error: string | null;

  // Token Management
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setTokens: (accessToken: string, refreshToken?: string, expiresAt?: Date) => void;
  clearTokens: () => void;
  updateUser: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  checkAuthStatus: () => boolean;
}

const initialState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  accessToken: null,
  refreshToken: null,
  tokenExpiresAt: null,
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        setUser: (user) =>
          set((state) => {
            state.user = user;
            state.isAuthenticated = !!user;
          }),

        setSession: (session) =>
          set((state) => {
            state.session = session;
            if (session) {
              state.isAuthenticated = true;
            }
          }),

        setTokens: (accessToken, refreshToken, expiresAt) =>
          set((state) => {
            state.accessToken = accessToken;
            if (refreshToken) state.refreshToken = refreshToken;
            if (expiresAt) state.tokenExpiresAt = expiresAt;
            state.isAuthenticated = true;
          }),

        clearTokens: () =>
          set((state) => {
            state.accessToken = null;
            state.refreshToken = null;
            state.tokenExpiresAt = null;
          }),

        updateUser: (updates) =>
          set((state) => {
            if (state.user) {
              Object.assign(state.user, updates);
            }
          }),

        setLoading: (loading) =>
          set((state) => {
            state.isLoading = loading;
          }),

        setError: (error) =>
          set((state) => {
            state.error = error;
          }),

        logout: () =>
          set((state) => {
            Object.assign(state, initialState);
          }),

        checkAuthStatus: () => {
          const state = get();
          if (!state.accessToken || !state.tokenExpiresAt) {
            return false;
          }
          const now = new Date();
          const isTokenValid = new Date(state.tokenExpiresAt) > now;

          if (!isTokenValid) {
            get().logout();
            return false;
          }

          return true;
        },
      })),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          tokenExpiresAt: state.tokenExpiresAt,
        }),
      }
    ),
    {
      name: 'AuthStore',
    }
  )
);