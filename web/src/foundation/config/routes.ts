/**
 * Route Configuration
 * 
 * Defines public routes and permission requirements for protected routes.
 * Used by middleware for route protection and by the permission system
 * for client-side access control.
 * 
 * Features:
 * - Public routes array (login, register, forgot-password, reset-password)
 * - Route permissions map with permission requirements for each route
 * - Type-safe route generation functions for dynamic routes
 * - Type-safe query parameter handling
 * - Route matching utilities for middleware and components
 * - Parameter extraction from dynamic routes
 * - Pattern matching for Next.js dynamic route syntax
 * 
 * @example
 * ```typescript
 * // Check if route is public
 * isPublicRoute('/login') // true
 * 
 * // Get route permissions
 * getRoutePermissions('/users') // ['users.read']
 * 
 * // Generate route with parameters
 * generateRoute('/users/[id]', { id: '123' }) // '/users/123'
 * 
 * // Generate route with query parameters
 * generateRouteWithQuery('/users', { page: 2, search: 'john' })
 * // '/users?page=2&search=john'
 * 
 * // Match routes
 * routeUtils.matches('/users/123', '/users/[id]') // true
 * 
 * // Extract parameters
 * routeUtils.extractParams('/users/123', '/users/[id]') // { id: '123' }
 * ```
 * 
 * Requirements validated: 25.1, 25.2, 25.3, 25.5, 25.6, 25.7
 */

/**
 * Public routes that don't require authentication
 */
export const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
] as const;

/**
 * Route permission requirements
 * Maps route paths to required permissions
 * 
 * - Empty array means authenticated users can access (no specific permission required)
 * - Non-empty array means user must have at least one of the listed permissions
 */
export const routePermissions: Record<string, string[]> = {
  // Dashboard - accessible to all authenticated users
  '/dashboard': [],
  
  // User Management
  '/users': ['users.read'],
  '/users/create': ['users.create'],
  '/users/[id]': ['users.read'],
  '/users/[id]/edit': ['users.update'],
  
  // Permission Management
  '/permissions': ['permissions.read'],
  '/permissions/assign': ['permissions.assign'],
  
  // Branch Management
  '/branches': ['branches.read'],
  '/branches/create': ['branches.create'],
  '/branches/[id]': ['branches.read'],
  '/branches/[id]/edit': ['branches.update'],
  
  // Department Management
  '/departments': ['departments.read'],
  '/departments/create': ['departments.create'],
  '/departments/[id]': ['departments.read'],
  '/departments/[id]/edit': ['departments.update'],
  
  // Audit Logs
  '/audit-logs': ['audit.read'],
  
  // Settings - accessible to all authenticated users
  '/settings': [],
  '/settings/profile': [],
  '/settings/security': [],
  '/settings/mfa': [],
};

/**
 * Check if a route is public (doesn't require authentication)
 */
export function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname === route || pathname.startsWith(route));
}

/**
 * Get permission requirements for a route
 * Returns empty array if route has no specific permission requirements
 * Returns undefined if route is not defined in routePermissions
 */
export function getRoutePermissions(pathname: string): string[] | undefined {
  // Try exact match first
  if (pathname in routePermissions) {
    return routePermissions[pathname];
  }

  // Try pattern matching for dynamic routes
  // Example: /users/123 matches /users/[id]
  for (const [route, permissions] of Object.entries(routePermissions)) {
    if (matchRoute(pathname, route)) {
      return permissions;
    }
  }

  return undefined;
}

/**
 * Match a pathname against a route pattern
 * Supports Next.js dynamic route syntax: [id], [slug], etc.
 */
function matchRoute(pathname: string, pattern: string): boolean {
  const patternParts = pattern.split('/');
  const pathnameParts = pathname.split('/');

  if (patternParts.length !== pathnameParts.length) {
    return false;
  }

  return patternParts.every((part, index) => {
    // Dynamic segment matches any value
    if (part.startsWith('[') && part.endsWith(']')) {
      return true;
    }
    // Static segment must match exactly
    return part === pathnameParts[index];
  });
}

/**
 * Type-safe route paths
 */
export type PublicRoute = (typeof publicRoutes)[number];
export type ProtectedRoute = keyof typeof routePermissions;
export type AppRoute = PublicRoute | ProtectedRoute;

/**
 * Route parameter types for dynamic routes
 */
export interface RouteParams {
  '/users/[id]': { id: string };
  '/users/[id]/edit': { id: string };
  '/branches/[id]': { id: string };
  '/branches/[id]/edit': { id: string };
  '/departments/[id]': { id: string };
  '/departments/[id]/edit': { id: string };
}

/**
 * Query parameter types for routes
 */
export interface QueryParams {
  '/login': { redirect?: string };
  '/users': { page?: number; search?: string; role?: string };
  '/audit-logs': { page?: number; startDate?: string; endDate?: string; action?: string };
  '/branches': { page?: number; search?: string };
  '/departments': { page?: number; search?: string };
}

/**
 * Type-safe route generation function for routes with parameters
 */
export function generateRoute<T extends keyof RouteParams>(
  route: T,
  params: RouteParams[T]
): string {
  let path = route as string;
  
  // Replace dynamic segments with actual values
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`[${key}]`, String(value));
  });
  
  return path;
}

/**
 * Type-safe route generation function with query parameters
 */
export function generateRouteWithQuery<T extends string>(
  route: T,
  query?: T extends keyof QueryParams ? QueryParams[T] : Record<string, string | number | boolean | undefined>
): string {
  if (!query || Object.keys(query).length === 0) {
    return route;
  }

  const searchParams = new URLSearchParams();
  
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${route}?${queryString}` : route;
}

/**
 * Combined route generation function for routes with both params and query
 */
export function generateFullRoute<T extends keyof RouteParams>(
  route: T,
  params: RouteParams[T],
  query?: T extends keyof QueryParams ? QueryParams[T] : Record<string, string | number | boolean | undefined>
): string {
  const pathWithParams = generateRoute(route, params);
  return generateRouteWithQuery(pathWithParams, query);
}

/**
 * Route matching utilities
 */
export const routeUtils = {
  /**
   * Check if current pathname matches a route pattern
   */
  matches: (pathname: string, pattern: string): boolean => {
    return matchRoute(pathname, pattern);
  },

  /**
   * Extract parameters from a pathname based on a route pattern
   */
  extractParams: (pathname: string, pattern: string): Record<string, string> | null => {
    const patternParts = pattern.split('/');
    const pathnameParts = pathname.split('/');

    if (patternParts.length !== pathnameParts.length) {
      return null;
    }

    const params: Record<string, string> = {};
    let matches = true;

    patternParts.forEach((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        // Extract parameter name and value
        const paramName = part.slice(1, -1);
        params[paramName] = pathnameParts[index];
      } else if (part !== pathnameParts[index]) {
        matches = false;
      }
    });

    return matches ? params : null;
  },

  /**
   * Get the base route pattern for a pathname
   */
  getPattern: (pathname: string): string | null => {
    for (const route of Object.keys(routePermissions)) {
      if (matchRoute(pathname, route)) {
        return route;
      }
    }
    return null;
  },
};
