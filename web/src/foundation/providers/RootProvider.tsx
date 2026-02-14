/**
 * Root Provider
 * 
 * Composes all foundation layer providers into a single root provider.
 * This simplifies application setup by providing a single component
 * that wraps the entire application with all necessary context providers.
 * 
 * Provider Order:
 * 1. GraphQLProvider - Provides Apollo Client for GraphQL operations
 * 2. AuthProvider - Provides authentication state and functions
 * 3. PermissionProvider - Provides permission checking functions
 * 
 * The order is important because:
 * - AuthProvider depends on Apollo Client (from GraphQLProvider)
 * - PermissionProvider depends on user state (from AuthProvider)
 * 
 * Requirements: 6.1, 6.2
 */

'use client';

import React from 'react';
import { GraphQLProvider } from './GraphQLProvider';
import { AuthProvider } from './AuthProvider';
import { PermissionProvider } from './PermissionProvider';

/**
 * Props for RootProvider
 */
export interface RootProviderProps {
  children: React.ReactNode;
}

/**
 * Root Provider Component
 * 
 * Wraps the application with all foundation layer providers in the correct order.
 * This is the single entry point for setting up the foundation layer.
 * 
 * Usage in Next.js app/layout.tsx:
 * ```tsx
 * import { RootProvider } from '@/foundation/providers';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <RootProvider>
 *           {children}
 *         </RootProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 * 
 * @example
 * ```tsx
 * <RootProvider>
 *   <App />
 * </RootProvider>
 * ```
 */
export function RootProvider({ children }: RootProviderProps) {
  return (
    <GraphQLProvider>
      <AuthProvider>
        <PermissionProvider>
          {children}
        </PermissionProvider>
      </AuthProvider>
    </GraphQLProvider>
  );
}
