// Notification store for managing in-app notifications and toasts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // in milliseconds, 0 = no auto-dismiss
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  createdAt: Date;
  icon?: string;
  position?: NotificationPosition;
}

interface NotificationState {
  // Notifications
  notifications: Notification[];
  maxNotifications: number;
  defaultDuration: number;
  defaultPosition: NotificationPosition;

  // History
  history: Notification[];
  maxHistorySize: number;

  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  clearHistory: () => void;

  // Utility methods
  success: (title: string, message?: string, options?: Partial<Notification>) => string;
  error: (title: string, message?: string, options?: Partial<Notification>) => string;
  warning: (title: string, message?: string, options?: Partial<Notification>) => string;
  info: (title: string, message?: string, options?: Partial<Notification>) => string;

  // Settings
  updateSettings: (settings: NotificationSettings) => void;
}

interface NotificationSettings {
  maxNotifications?: number;
  defaultDuration?: number;
  defaultPosition?: NotificationPosition;
  maxHistorySize?: number;
}

const initialState = {
  notifications: [],
  maxNotifications: 5,
  defaultDuration: 5000,
  defaultPosition: 'top-right' as NotificationPosition,
  history: [],
  maxHistorySize: 50,
};

export const useNotificationStore = create<NotificationState>()(
  devtools(
    immer((set, get) => ({
      ...initialState,

      addNotification: (notification) => {
        const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newNotification: Notification = {
          ...notification,
          id,
          createdAt: new Date(),
          duration: notification.duration ?? get().defaultDuration,
          position: notification.position ?? get().defaultPosition,
          dismissible: notification.dismissible ?? true,
        };

        set((state) => {
          // Add to notifications
          state.notifications.unshift(newNotification);

          // Limit notifications
          if (state.notifications.length > state.maxNotifications) {
            state.notifications = state.notifications.slice(0, state.maxNotifications);
          }

          // Add to history
          state.history.unshift(newNotification);
          if (state.history.length > state.maxHistorySize) {
            state.history = state.history.slice(0, state.maxHistorySize);
          }
        });

        // Auto-dismiss if duration is set
        if (newNotification.duration && newNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, newNotification.duration);
        }

        return id;
      },

      removeNotification: (id) =>
        set((state) => {
          state.notifications = state.notifications.filter((n) => n.id !== id);
        }),

      clearNotifications: () =>
        set((state) => {
          state.notifications = [];
        }),

      clearHistory: () =>
        set((state) => {
          state.history = [];
        }),

      // Helper methods for different notification types
      success: (title, message, options = {}) =>
        get().addNotification({
          type: 'success',
          title,
          message,
          ...options,
        }),

      error: (title, message, options = {}) =>
        get().addNotification({
          type: 'error',
          title,
          message,
          duration: 0, // Errors don't auto-dismiss by default
          ...options,
        }),

      warning: (title, message, options = {}) =>
        get().addNotification({
          type: 'warning',
          title,
          message,
          ...options,
        }),

      info: (title, message, options = {}) =>
        get().addNotification({
          type: 'info',
          title,
          message,
          ...options,
        }),

      updateSettings: (settings) =>
        set((state) => {
          if (settings.maxNotifications !== undefined) {
            state.maxNotifications = settings.maxNotifications;
          }
          if (settings.defaultDuration !== undefined) {
            state.defaultDuration = settings.defaultDuration;
          }
          if (settings.defaultPosition !== undefined) {
            state.defaultPosition = settings.defaultPosition;
          }
          if (settings.maxHistorySize !== undefined) {
            state.maxHistorySize = settings.maxHistorySize;
          }
        }),
    })),
    {
      name: 'NotificationStore',
    }
  )
);