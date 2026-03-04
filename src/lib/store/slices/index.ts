// Export all slice actions and selectors with explicit naming to avoid conflicts
export { default as usersReducer } from './usersSlice';
export { default as permissionsReducer } from './permissionsSlice';
export { default as organizationsReducer } from './organizationsSlice';
export { default as uiReducer } from './uiSlice';

// Export slice-specific actions with prefixes to avoid naming conflicts
export * as usersActions from './usersSlice';
export * as permissionsActions from './permissionsSlice';
export * as organizationsActions from './organizationsSlice';
export * as uiActions from './uiSlice';

// Note: Import actions with specific names when needed:
// import { usersActions, permissionsActions } from '@/lib/store/slices';
// usersActions.clearError();
// permissionsActions.clearError();


