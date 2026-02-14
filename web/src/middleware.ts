/**
 * Next.js Middleware Entry Point
 * 
 * Configures and exports the authentication middleware for route protection.
 * The matcher configuration excludes static files, API routes, and Next.js internals.
 * 
 * Requirements: 11.1
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isPublicRoute, getRoutePermissions } from './foundation/config/routes';

// Edge runtime configuration
export const runtime = 'experimental-edge';

/**
 * Decode JWT payload without verification
 * Edge-compatible implementation using atob
 */
function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Validate JWT token format
 */
function validateTokenFormat(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const parts = token.split('.');
  return parts.length === 3;
}

/**
 * Check if token is expired
 */
function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  const now = Math.floor(Date.now() / 1000);
  return now >= payload.exp;
}

/**
 * Check if token expires soon (within 60 seconds)
 */
function isTokenExpiringSoon(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = payload.exp - now;
  return timeUntilExpiry < 60;
}

/**
 * Attempt to refresh tokens using the refresh token cookie
 */
async function refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const graphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3000/graphql';
    
    const response = await fetch(graphqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `refreshToken=${refreshToken}`,
      },
      body: JSON.stringify({
        query: `
          mutation RefreshTokens($refreshToken: String!) {
            refreshTokens(refreshToken: $refreshToken) {
              accessToken
              refreshToken
            }
          }
        `,
        variables: { refreshToken },
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data.errors || !data.data?.refreshTokens) {
      return null;
    }

    return data.data.refreshTokens;
  } catch (error) {
    console.error('Token refresh failed in middleware:', error);
    return null;
  }
}

/**
 * Get user permissions from access token
 */
function getUserPermissions(token: string): string[] {
  const payload = decodeJWT(token);
  if (!payload || !payload.permissions) {
    return [];
  }
  return Array.isArray(payload.permissions) ? payload.permissions : [];
}

/**
 * Get user role from access token
 */
function getUserRole(token: string): string | null {
  const payload = decodeJWT(token);
  return payload?.role || null;
}

/**
 * Get user ID from access token
 */
function getUserId(token: string): string | null {
  const payload = decodeJWT(token);
  return payload?.sub || payload?.userId || null;
}

/**
 * Check if user has required permissions
 * Implements the same logic as PermissionChecker
 */
function checkPermissions(userPermissions: string[], userRole: string | null, requiredPermissions: string[]): boolean {
  // No permissions required means access granted
  if (requiredPermissions.length === 0) {
    return true;
  }

  // OWNER role bypasses all permission checks
  if (userRole === 'OWNER') {
    return true;
  }

  // Check if user has any of the required permissions
  for (const required of requiredPermissions) {
    // Check exact match
    if (userPermissions.includes(required)) {
      return true;
    }

    // Check wildcard match
    const parts = required.split('.');
    for (let i = parts.length - 1; i >= 0; i--) {
      const wildcardPermission = [...parts.slice(0, i), '*'].join('.');
      if (userPermissions.includes(wildcardPermission)) {
        return true;
      }
    }

    // Check super admin wildcard
    if (userPermissions.includes('*')) {
      return true;
    }
  }

  return false;
}

/**
 * Log authentication event
 */
function logAuthEvent(
  event: 'auth_success' | 'auth_failed' | 'permission_denied' | 'token_refresh' | 'token_expired',
  details: {
    pathname: string;
    userId?: string | null;
    reason?: string;
    timestamp: string;
  }
): void {
  // In production, this would send to a logging service
  // For now, we log to console
  console.log(`[Auth Middleware] ${event}:`, details);
}

/**
 * Authentication middleware
 * 
 * Flow:
 * 1. Check if route is public -> allow access
 * 2. Check for access token in cookies
 * 3. Validate token format and expiration
 * 4. Attempt token refresh if expired
 * 5. Check route permissions
 * 6. Redirect to login if not authenticated
 * 7. Redirect to unauthorized if insufficient permissions
 */
export default async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const timestamp = new Date().toISOString();

  // Allow public routes without authentication checks
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Get access token from cookie
  const accessToken = request.cookies.get('accessToken')?.value;

  // No access token -> redirect to login
  if (!accessToken) {
    logAuthEvent('auth_failed', {
      pathname,
      reason: 'No access token',
      timestamp,
    });

    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate token format
  if (!validateTokenFormat(accessToken)) {
    logAuthEvent('auth_failed', {
      pathname,
      reason: 'Invalid token format',
      timestamp,
    });

    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if token is expired or expiring soon
  if (isTokenExpired(accessToken) || isTokenExpiringSoon(accessToken)) {
    // Attempt token refresh
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (refreshToken) {
      const newTokens = await refreshTokens(refreshToken);

      if (newTokens) {
        // Token refresh successful
        logAuthEvent('token_refresh', {
          pathname,
          userId: getUserId(newTokens.accessToken),
          timestamp,
        });

        // Create response with new tokens
        const response = NextResponse.next();
        
        // Set new access token cookie
        response.cookies.set('accessToken', newTokens.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 15 * 60, // 15 minutes
          path: '/',
        });

        // Set new refresh token cookie
        response.cookies.set('refreshToken', newTokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60, // 7 days
          path: '/',
        });

        // Continue with permission check using new token
        const requiredPermissions = getRoutePermissions(pathname);
        
        if (requiredPermissions && requiredPermissions.length > 0) {
          const userPermissions = getUserPermissions(newTokens.accessToken);
          const userRole = getUserRole(newTokens.accessToken);
          const hasPermission = checkPermissions(userPermissions, userRole, requiredPermissions);

          if (!hasPermission) {
            logAuthEvent('permission_denied', {
              pathname,
              userId: getUserId(newTokens.accessToken),
              reason: `Required permissions: ${requiredPermissions.join(', ')}`,
              timestamp,
            });

            return NextResponse.redirect(new URL('/unauthorized', request.url));
          }
        }

        logAuthEvent('auth_success', {
          pathname,
          userId: getUserId(newTokens.accessToken),
          timestamp,
        });

        return response;
      }
    }

    // Token refresh failed -> redirect to login
    logAuthEvent('token_expired', {
      pathname,
      reason: 'Token expired and refresh failed',
      timestamp,
    });

    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token is valid, check route permissions
  const requiredPermissions = getRoutePermissions(pathname);

  if (requiredPermissions && requiredPermissions.length > 0) {
    const userPermissions = getUserPermissions(accessToken);
    const userRole = getUserRole(accessToken);
    const hasPermission = checkPermissions(userPermissions, userRole, requiredPermissions);

    if (!hasPermission) {
      logAuthEvent('permission_denied', {
        pathname,
        userId: getUserId(accessToken),
        reason: `Required permissions: ${requiredPermissions.join(', ')}`,
        timestamp,
      });

      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Authentication and authorization successful
  logAuthEvent('auth_success', {
    pathname,
    userId: getUserId(accessToken),
    timestamp,
  });

  return NextResponse.next();
}

/**
 * Middleware matcher configuration
 * 
 * Excludes:
 * - API routes (/api/*)
 * - Next.js static files (/_next/static/*)
 * - Next.js image optimization (/_next/image/*)
 * - Favicon and other static assets in public folder
 * - Static files with extensions (.ico, .png, .jpg, .svg, etc.)
 * 
 * Includes:
 * - All other routes (protected and public routes)
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
