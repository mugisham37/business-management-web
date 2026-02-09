import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-email',
  '/auth/reset-password',
  '/auth/team',
  '/auth/signup',
  '/',
  '/about',
  '/pricing',
  '/changelog',
  '/legal',
];

// Auth-only routes that authenticated users should not access
const AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/signup'];

// Protected routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/settings', '/users', '/roles'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get refresh token from cookies to check authentication status
  const refreshToken = request.cookies.get('refresh_token')?.value;

  // Check if user is authenticated
  const isAuthenticated = !!refreshToken;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route))) {
    // Redirect authenticated users away from auth pages to dashboard
    if (isAuthenticated && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protect authenticated routes
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      // Redirect to login and preserve the intended destination
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public|images|fonts|changelog).*)',
  ],
};
