/**
 * Route Configuration
 * 
 * Defines public routes and permission requirements for protected routes.
 * Used by middleware for route protection and by the permission system
 * for client-side access control.
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
