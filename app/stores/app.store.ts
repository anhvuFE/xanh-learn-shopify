// Main application store for global state management

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface AppState {
  // UI State
  isSidebarOpen: boolean;
  isDarkMode: boolean;
  currentRoute: string;
  breadcrumbs: Breadcrumb[];

  // Loading States
  isAppLoading: boolean;
  loadingMessage: string;

  // Global Settings
  locale: string;
  currency: string;
  timezone: string;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleDarkMode: () => void;
  setCurrentRoute: (route: string) => void;
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void;
  setAppLoading: (loading: boolean, message?: string) => void;
  updateSettings: (settings: Partial<GlobalSettings>) => void;
  resetApp: () => void;
}

interface Breadcrumb {
  label: string;
  path: string;
  icon?: string;
}

interface GlobalSettings {
  locale: string;
  currency: string;
  timezone: string;
}

const initialState = {
  isSidebarOpen: true,
  isDarkMode: false,
  currentRoute: '/',
  breadcrumbs: [],
  isAppLoading: false,
  loadingMessage: '',
  locale: 'en-US',
  currency: 'USD',
  timezone: 'America/New_York',
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      immer((set) => ({
        ...initialState,

        toggleSidebar: () =>
          set((state) => {
            state.isSidebarOpen = !state.isSidebarOpen;
          }),

        setSidebarOpen: (isOpen) =>
          set((state) => {
            state.isSidebarOpen = isOpen;
          }),

        toggleDarkMode: () =>
          set((state) => {
            state.isDarkMode = !state.isDarkMode;
          }),

        setCurrentRoute: (route) =>
          set((state) => {
            state.currentRoute = route;
          }),

        setBreadcrumbs: (breadcrumbs) =>
          set((state) => {
            state.breadcrumbs = breadcrumbs;
          }),

        setAppLoading: (loading, message = '') =>
          set((state) => {
            state.isAppLoading = loading;
            state.loadingMessage = message;
          }),

        updateSettings: (settings) =>
          set((state) => {
            Object.assign(state, settings);
          }),

        resetApp: () => set(() => initialState),
      })),
      {
        name: 'app-store',
        partialize: (state) => ({
          isDarkMode: state.isDarkMode,
          locale: state.locale,
          currency: state.currency,
          timezone: state.timezone,
        }),
      }
    ),
    {
      name: 'AppStore',
    }
  )
);