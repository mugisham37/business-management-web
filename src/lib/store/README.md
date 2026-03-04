# State Management

This directory contains the Redux Toolkit state management implementation for the application.

## Overview

The state management system uses Redux Toolkit with the following features:
- Type-safe Redux slices for users, permissions, organizations, and UI state
- Automatic synchronization with Apollo Client cache
- Optimistic updates with automatic rollback on failure
- Derived selectors for computed state
- Middleware for cache synchronization

## Architecture

```
store/
├── index.ts                    # Store configuration
├── hooks.ts                    # Typed Redux hooks
├── slices/                     # Redux slices
│   ├── usersSlice.ts          # User management state
│   ├── permissionsSlice.ts    # Permission management state
│   ├── organizationsSlice.ts  # Organization/branch/department state
│   └── uiSlice.ts             # UI state (modals, notifications)
├── middleware/                 # Custom middleware
│   └── apollo-sync.middleware.ts  # Apollo cache sync
├── sync/                       # Cache synchronization utilities
│   └── cache-to-state.ts      # Sync Apollo cache to Redux
└── utils/                      # Utility functions
    └── optimistic-updates.ts  # Optimistic update helpers
```

## Usage

### Setup

Wrap your app with the Redux Provider:

```typescript
import { Provider } from 'react-redux';
import { store } from '@/lib/store';

function App() {
  return (
    <Provider store={store}>
      {/* Your app */}
    </Provider>
  );
}
```

### Using State in Components

Use the typed hooks instead of plain `useSelector` and `useDispatch`:

```typescript
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { selectUsers, addUser } from '@/lib/store/slices/usersSlice';

function UserList() {
  const users = useAppSelector(selectUsers);
  const dispatch = useAppDispatch();

  const handleAddUser = (user) => {
    dispatch(addUser(user));
  };

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.firstName} {user.lastName}</div>
      ))}
    </div>
  );
}
```

### Optimistic Updates

Use the optimistic update utilities for immediate UI feedback:

```typescript
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { optimisticAddUser, rollbackUsers, selectUsers } from '@/lib/store/slices/usersSlice';
import { withOptimisticUpdate } from '@/lib/store/utils/optimistic-updates';
import { userService } from '@/lib/services';

function CreateUserForm() {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);

  const handleSubmit = async (input) => {
    await withOptimisticUpdate(
      dispatch,
      () => ({ users: { list: users } }),
      {
        optimisticUpdate: (dispatch) => {
          dispatch(optimisticAddUser({
            id: 'temp-' + Date.now(),
            ...input,
            createdAt: new Date().toISOString(),
          }));
        },
        rollback: (dispatch, previousState) => {
          dispatch(rollbackUsers(previousState.users.list));
        },
        getStateSnapshot: (state) => state.users.list,
      },
      async () => {
        return await userService.createManager(input);
      }
    );
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## State Slices

### Users Slice

Manages user list, selected user, and loading states.

**State:**
```typescript
{
  list: UserManagementType[];
  selectedUser: UserManagementType | null;
  loading: boolean;
  error: string | null;
}
```

**Actions:**
- `setUsers(users)` - Set the entire user list
- `addUser(user)` - Add a single user
- `updateUser(user)` - Update a user
- `removeUser(userId)` - Remove a user
- `setSelectedUser(user)` - Set the selected user
- `optimisticAddUser(user)` - Optimistically add a user
- `optimisticUpdateUser(user)` - Optimistically update a user
- `rollbackUsers(previousList)` - Rollback to previous state

**Selectors:**
- `selectUsers(state)` - Get all users
- `selectSelectedUser(state)` - Get selected user
- `selectUserById(state, userId)` - Get user by ID
- `selectUsersByBranch(state, branchId)` - Get users by branch
- `selectActiveUsers(state)` - Get active users only

### Permissions Slice

Manages user permissions and permission history.

**State:**
```typescript
{
  userPermissions: Record<string, UserPermissionsResponse>;
  permissionHistory: Record<string, PermissionHistoryResponse>;
  selectedUserId: string | null;
  loading: boolean;
  error: string | null;
}
```

**Actions:**
- `setUserPermissions({ userId, permissions })` - Set user permissions
- `updateUserPermissions({ userId, permissions, fingerprint })` - Update permissions
- `grantPermissionsOptimistic({ userId, newPermissions })` - Optimistically grant
- `revokePermissionsOptimistic({ userId, modules })` - Optimistically revoke
- `rollbackUserPermissions({ userId, permissions })` - Rollback permissions

**Selectors:**
- `selectUserPermissions(state, userId)` - Get user permissions
- `selectUserHasModule(state, userId, module)` - Check if user has module
- `selectUserHasAction(state, userId, module, action)` - Check if user has action

### Organizations Slice

Manages organization, branches, and departments.

**State:**
```typescript
{
  organization: OrganizationType | null;
  branches: BranchType[];
  departments: DepartmentType[];
  selectedBranch: BranchType | null;
  selectedDepartment: DepartmentType | null;
  loading: boolean;
  error: string | null;
}
```

**Actions:**
- `setOrganization(org)` - Set organization
- `setBranches(branches)` - Set branches list
- `addBranch(branch)` - Add a branch
- `updateBranch(branch)` - Update a branch
- `setDepartments(departments)` - Set departments list
- `addDepartment(department)` - Add a department
- `optimisticAddBranch(branch)` - Optimistically add branch
- `rollbackBranches(previousList)` - Rollback branches

**Selectors:**
- `selectOrganization(state)` - Get organization
- `selectBranches(state)` - Get all branches
- `selectDepartments(state)` - Get all departments
- `selectBranchById(state, branchId)` - Get branch by ID
- `selectDepartmentsByBranch(state, branchId)` - Get departments by branch

### UI Slice

Manages global UI state including modals and notifications.

**State:**
```typescript
{
  modals: Record<string, Modal>;
  notifications: Notification[];
  globalLoading: boolean;
  loadingMessage?: string;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'system';
}
```

**Actions:**
- `openModal({ id, data })` - Open a modal
- `closeModal(id)` - Close a modal
- `showNotification({ type, message, title })` - Show notification
- `removeNotification(id)` - Remove notification
- `setGlobalLoading({ loading, message })` - Set global loading state
- `toggleSidebar()` - Toggle sidebar
- `setTheme(theme)` - Set theme

**Selectors:**
- `selectModal(state, modalId)` - Get modal state
- `selectNotifications(state)` - Get all notifications
- `selectGlobalLoading(state)` - Get global loading state
- `selectTheme(state)` - Get current theme

## Apollo Cache Synchronization

The state management system automatically synchronizes with Apollo Client cache:

### State → Cache (Middleware)

When Redux state changes, the `apollo-sync.middleware` automatically updates the Apollo cache:

```typescript
// Middleware automatically syncs on state changes
dispatch(addUser(newUser));
// Apollo cache is automatically updated with the new user
```

### Cache → State (Manual Sync)

After GraphQL queries, sync cache data to Redux state:

```typescript
import { syncUsersFromCache } from '@/lib/store/sync/cache-to-state';
import { apolloClient } from '@/lib/api/apollo-client';

// After a query completes
const { data } = await apolloClient.query({ query: GET_USERS });
syncUsersFromCache(apolloClient, dispatch);
```

## Best Practices

1. **Use Typed Hooks**: Always use `useAppSelector` and `useAppDispatch` instead of plain Redux hooks
2. **Optimistic Updates**: Use optimistic updates for better UX, but always handle rollback
3. **Selectors**: Use selectors for derived state instead of computing in components
4. **Error Handling**: Always set error state when operations fail
5. **Loading States**: Set loading states before async operations
6. **Cache Sync**: Sync cache to state after queries to keep both in sync

## Testing

Test Redux slices using Redux Toolkit's testing utilities:

```typescript
import { configureStore } from '@reduxjs/toolkit';
import usersReducer, { addUser } from './usersSlice';

describe('usersSlice', () => {
  it('should add a user', () => {
    const store = configureStore({ reducer: { users: usersReducer } });
    
    const user = { id: '1', firstName: 'John', lastName: 'Doe' };
    store.dispatch(addUser(user));
    
    expect(store.getState().users.list).toContainEqual(user);
  });
});
```

## Requirements

This implementation satisfies the following requirements:
- **5.1**: Redux Toolkit state management solution
- **5.2**: Users state slice with list, selectedUser, loading states
- **5.3**: Permissions state slice with permission data
- **5.4**: Organizations state slice with organization, branches, departments
- **5.5**: UI state slice with modals and notifications
- **5.6, 5.7**: State synchronization with Apollo cache
- **5.8**: Selectors for derived state
- **5.9, 5.10**: Optimistic updates with rollback
