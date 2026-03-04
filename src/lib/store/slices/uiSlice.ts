import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
  timestamp: number;
}

export interface Modal {
  id: string;
  isOpen: boolean;
  data?: any;
}

export interface UIState {
  // Modal management
  modals: Record<string, Modal>;
  // Notification management
  notifications: Notification[];
  // Global loading states
  globalLoading: boolean;
  loadingMessage?: string;
  // Sidebar state
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  // Theme
  theme: 'light' | 'dark' | 'system';
}

const initialState: UIState = {
  modals: {},
  notifications: [],
  globalLoading: false,
  loadingMessage: undefined,
  sidebarOpen: true,
  sidebarCollapsed: false,
  theme: 'system',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Modal actions
    openModal: (state, action: PayloadAction<{ id: string; data?: any }>) => {
      state.modals[action.payload.id] = {
        id: action.payload.id,
        isOpen: true,
        data: action.payload.data,
      };
    },
    closeModal: (state, action: PayloadAction<string>) => {
      if (state.modals[action.payload]) {
        state.modals[action.payload].isOpen = false;
      }
    },
    removeModal: (state, action: PayloadAction<string>) => {
      delete state.modals[action.payload];
    },
    updateModalData: (
      state,
      action: PayloadAction<{ id: string; data: any }>
    ) => {
      if (state.modals[action.payload.id]) {
        state.modals[action.payload.id].data = action.payload.data;
      }
    },
    // Notification actions
    showNotification: (
      state,
      action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>
    ) => {
      const notification: Notification = {
        ...action.payload,
        id: `notification-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    // Global loading actions
    setGlobalLoading: (
      state,
      action: PayloadAction<{ loading: boolean; message?: string }>
    ) => {
      state.globalLoading = action.payload.loading;
      state.loadingMessage = action.payload.message;
    },
    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    // Theme actions
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
  },
});

export const {
  openModal,
  closeModal,
  removeModal,
  updateModalData,
  showNotification,
  removeNotification,
  clearNotifications,
  setGlobalLoading,
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapsed,
  setSidebarCollapsed,
  setTheme,
} = uiSlice.actions;

// Selectors
export const selectModal = (state: RootState, modalId: string) =>
  state.ui.modals[modalId];

export const selectIsModalOpen = (state: RootState, modalId: string) =>
  state.ui.modals[modalId]?.isOpen ?? false;

export const selectModalData = (state: RootState, modalId: string) =>
  state.ui.modals[modalId]?.data;

export const selectNotifications = (state: RootState) => state.ui.notifications;

export const selectGlobalLoading = (state: RootState) => state.ui.globalLoading;

export const selectLoadingMessage = (state: RootState) => state.ui.loadingMessage;

export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen;

export const selectSidebarCollapsed = (state: RootState) => state.ui.sidebarCollapsed;

export const selectTheme = (state: RootState) => state.ui.theme;

// Derived selectors
export const selectActiveNotifications = (state: RootState) =>
  state.ui.notifications.filter((n: any) => {
    if (!n.duration) return true;
    return Date.now() - n.timestamp < n.duration;
  });

export const selectNotificationsByType = (
  state: RootState,
  type: NotificationType
) => state.ui.notifications.filter((n: any) => n.type === type);

export default uiSlice.reducer;
