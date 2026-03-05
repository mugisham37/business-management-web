import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './slices/usersSlice';
import permissionsReducer from './slices/permissionsSlice';
import organizationsReducer from './slices/organizationsSlice';
import uiReducer from './slices/uiSlice';
import { createApolloSyncMiddleware } from './middleware/apollo-sync.middleware';
import { apolloClient } from '@/lib/api/apollo-client';

// Define root reducer type first
const rootReducer = {
  users: usersReducer,
  permissions: permissionsReducer,
  organizations: organizationsReducer,
  ui: uiReducer,
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: ['ui/showNotification'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['ui.notifications'],
      },
    }).concat(createApolloSyncMiddleware(apolloClient)),
});

// Infer types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
