/**
 * Permission Query Hooks
 * 
 * React hooks for fetching permission data from the backend.
 * These hooks wrap the generated GraphQL queries and provide
 * formatted data and error handling.
 */

'use client';

import {
  useAvailablePermissionsQuery,
  useModulesQuery,
  usePermissionsByModuleQuery,
} from '../../types/generated/graphql';
import { formatError } from '../../utils/errors';

/**
 * Hook to fetch all available permissions
 * 
 * Returns a list of all permissions that can be assigned to users.
 * Useful for permission assignment interfaces.
 * 
 * @returns Object with permissions array, loading state, error, and refetch function
 * 
 * @example
 * ```tsx
 * function PermissionSelector() {
 *   const { permissions, loading, error } = useAvailablePermissions();
 *   
 *   if (loading) return <Spinner />;
 *   if (error) return <ErrorMessage error={error} />;
 *   
 *   return (
 *     <select>
 *       {permissions.map(p => (
 *         <option key={p.key} value={p.key}>
 *           {p.description}
 *         </option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export function useAvailablePermissions() {
  const { data, loading, error, refetch } = useAvailablePermissionsQuery({
    fetchPolicy: 'cache-and-network',
  });

  return {
    permissions: data?.availablePermissions ?? [],
    loading,
    error: error ? formatError(error) : null,
    refetch,
  };
}

/**
 * Hook to fetch all permission modules
 * 
 * Returns a list of modules with their associated permissions.
 * Useful for displaying permissions grouped by module.
 * 
 * @returns Object with modules array, loading state, error, and refetch function
 * 
 * @example
 * ```tsx
 * function ModulePermissions() {
 *   const { modules, loading, error } = useModules();
 *   
 *   if (loading) return <Spinner />;
 *   if (error) return <ErrorMessage error={error} />;
 *   
 *   return (
 *     <div>
 *       {modules.map(module => (
 *         <div key={module.name}>
 *           <h3>{module.name}</h3>
 *           <ul>
 *             {module.permissions.map(p => (
 *               <li key={p.key}>{p.description}</li>
 *             ))}
 *           </ul>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useModules() {
  const { data, loading, error, refetch } = useModulesQuery({
    fetchPolicy: 'cache-and-network',
  });

  return {
    modules: data?.modules ?? [],
    loading,
    error: error ? formatError(error) : null,
    refetch,
  };
}

/**
 * Hook to fetch permissions grouped by module
 * 
 * Returns permissions organized by module name.
 * Useful for permission management interfaces that need module grouping.
 * 
 * @returns Object with permissionsByModule array, loading state, error, and refetch function
 * 
 * @example
 * ```tsx
 * function PermissionsByModule() {
 *   const { permissionsByModule, loading, error } = usePermissionsByModule();
 *   
 *   if (loading) return <Spinner />;
 *   if (error) return <ErrorMessage error={error} />;
 *   
 *   return (
 *     <div>
 *       {permissionsByModule.map(group => (
 *         <div key={group.module}>
 *           <h3>{group.module}</h3>
 *           <ul>
 *             {group.permissions.map(p => (
 *               <li key={p.key}>{p.description}</li>
 *             ))}
 *           </ul>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePermissionsByModule() {
  const { data, loading, error, refetch } = usePermissionsByModuleQuery({
    fetchPolicy: 'cache-and-network',
  });

  return {
    permissionsByModule: data?.permissionsByModule ?? [],
    loading,
    error: error ? formatError(error) : null,
    refetch,
  };
}
