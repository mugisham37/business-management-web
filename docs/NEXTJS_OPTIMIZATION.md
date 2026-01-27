# Next.js 16 Optimization & Provider Architecture

> **Complete guide for providers, state management, and Next.js 16 optimizations**

---

## Table of Contents
1. [Provider Architecture](#provider-architecture)
2. [State Management Strategy](#state-management-strategy)
3. [Next.js 16 Optimizations](#nextjs-16-optimizations)
4. [Performance Best Practices](#performance-best-practices)
5. [Caching Strategies](#caching-strategies)
6. [Real-time Architecture](#real-time-architecture)
7. [Code Organization](#code-organization)

---

## Provider Architecture

### Complete Provider Hierarchy

```typescript
// app/providers.tsx
'use client';

import React from 'react';
import { ApolloProvider } from '@/lib/apollo';
import { AuthProvider } from '@/components/auth/auth-provider';
import { TenantProvider } from '@/components/tenant/tenant-provider';
import { StoreProvider } from '@/lib/stores';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { NotificationProvider } from '@/components/providers/notification-provider';
import { RealtimeProvider } from '@/components/providers/realtime-provider';
import { PermissionProvider } from '@/components/providers/permission-provider';
import { LayoutProvider } from '@/components/providers/layout-provider';
import { DevToolsProvider } from '@/lib/dev-tools';
import { setupErrorBoundaryHierarchy } from '@/lib/error-handling';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Complete provider hierarchy for the application
 * Order matters! Providers are nested from outermost to innermost
 */
export function Providers({ children }: ProvidersProps) {
  const ErrorBoundaries = setupErrorBoundaryHierarchy();

  return (
    // Error Boundary (Outermost - catches all errors)
    <ErrorBoundaries.App>
      {/* Theme Provider (Dark/Light mode) */}
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {/* Apollo Client (GraphQL) */}
        <ApolloProvider>
          {/* Global State (Zustand) */}
          <StoreProvider enableDebug={process.env.NODE_ENV === 'development'}>
            {/* Authentication */}
            <AuthProvider>
              {/* Multi-tenancy */}
              <TenantProvider>
                {/* Permissions & RBAC */}
                <PermissionProvider>
                  {/* Real-time WebSocket */}
                  <RealtimeProvider>
                    {/* Layout & Responsive State */}
                    <LayoutProvider>
                      {/* Notifications (Toast) */}
                      <NotificationProvider>
                        {/* Dev Tools (development only) */}
                        <DevToolsProvider>
                          {/* Page-level Error Boundary */}
                          <ErrorBoundaries.Page>
                            {children}
                          </ErrorBoundaries.Page>
                        </DevToolsProvider>
                      </NotificationProvider>
                    </LayoutProvider>
                  </RealtimeProvider>
                </PermissionProvider>
              </TenantProvider>
            </AuthProvider>
          </StoreProvider>
        </ApolloProvider>
      </ThemeProvider>
    </ErrorBoundaries.App>
  );
}

export default Providers;
```

---

## Individual Provider Implementations

### 1. ThemeProvider

```typescript
// components/providers/theme-provider.tsx
'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

/**
 * Theme provider using next-themes
 * Handles dark/light mode with system preference support
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

// Hook for using theme
export function useTheme() {
  const { theme, setTheme, systemTheme } = useNextTheme();
  
  return {
    theme: theme === 'system' ? systemTheme : theme,
    setTheme,
    isDark: (theme === 'system' ? systemTheme : theme) === 'dark',
    toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
  };
}
```

---

### 2. NotificationProvider

```typescript
// components/providers/notification-provider.tsx
'use client';

import React, { createContext, useContext } from 'react';
import { Toaster, toast } from 'sonner';

interface NotificationContextValue {
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  promise: <T>(
    promise: Promise<T>,
    options: PromiseToastOptions<T>
  ) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const value: NotificationContextValue = {
    success: (message, options) => toast.success(message, options),
    error: (message, options) => toast.error(message, options),
    info: (message, options) => toast.info(message, options),
    warning: (message, options) => toast.warning(message, options),
    promise: (promise, options) => toast.promise(promise, options),
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Toaster
        position="top-right"
        expand={false}
        richColors
        closeButton
        duration={4000}
      />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

// Convenience hook for toast
export { toast };
```

**Usage Example:**
```typescript
import { useNotification } from '@/components/providers/notification-provider';

function MyComponent() {
  const notification = useNotification();
  
  const handleSave = async () => {
    notification.promise(
      saveData(),
      {
        loading: 'Saving...',
        success: 'Data saved successfully!',
        error: 'Failed to save data',
      }
    );
  };
  
  return <button onClick={handleSave}>Save</button>;
}
```

---

### 3. RealtimeProvider

```typescript
// components/providers/realtime-provider.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { useAuth } from '@/hooks/useAuth';

interface RealtimeContextValue {
  isConnected: boolean;
  subscribe: (channel: string, callback: (data: any) => void) => () => void;
  unsubscribe: (channel: string) => void;
  emit: (channel: string, data: any) => void;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Map<string, Set<Function>>>(new Map());
  const client = useApolloClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // WebSocket connection is handled by Apollo Client
    // This provider manages subscription state and provides convenience methods
    setIsConnected(true);

    return () => {
      setIsConnected(false);
      subscriptions.clear();
    };
  }, [user]);

  const subscribe = (channel: string, callback: (data: any) => void) => {
    setSubscriptions(prev => {
      const newSubs = new Map(prev);
      if (!newSubs.has(channel)) {
        newSubs.set(channel, new Set());
      }
      newSubs.get(channel)!.add(callback);
      return newSubs;
    });

    // Return unsubscribe function
    return () => {
      setSubscriptions(prev => {
        const newSubs = new Map(prev);
        const channelSubs = newSubs.get(channel);
        if (channelSubs) {
          channelSubs.delete(callback);
          if (channelSubs.size === 0) {
            newSubs.delete(channel);
          }
        }
        return newSubs;
      });
    };
  };

  const unsubscribe = (channel: string) => {
    setSubscriptions(prev => {
      const newSubs = new Map(prev);
      newSubs.delete(channel);
      return newSubs;
    });
  };

  const emit = (channel: string, data: any) => {
    const channelSubs = subscriptions.get(channel);
    if (channelSubs) {
      channelSubs.forEach(callback => callback(data));
    }
  };

  const value: RealtimeContextValue = {
    isConnected,
    subscribe,
    unsubscribe,
    emit,
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within RealtimeProvider');
  }
  return context;
}

// Convenience hook for subscribing to a channel
export function useRealtimeChannel(
  channel: string,
  callback: (data: any) => void,
  deps: React.DependencyList = []
) {
  const { subscribe } = useRealtime();

  useEffect(() => {
    return subscribe(channel, callback);
  }, [channel, ...deps]);
}
```

**Usage Example:**
```typescript
import { useRealtimeChannel } from '@/components/providers/realtime-provider';

function InventoryMonitor() {
  useRealtimeChannel('inventory:stockUpdated', (data) => {
    console.log('Stock updated:', data);
    // Refetch or update cache
  });

  return <div>Monitoring inventory...</div>;
}
```

---

### 4. PermissionProvider

```typescript
// components/providers/permission-provider.tsx
'use client';

import React, { createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface PermissionContextValue {
  hasPermission: (permission: string | string[]) => boolean;
  hasRole: (role: string | string[]) => boolean;
  can: (action: string, resource: string) => boolean;
}

const PermissionContext = createContext<PermissionContextValue | null>(null);

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const { user, permissions, roles } = useAuth();

  const hasPermission = (permission: string | string[]): boolean => {
    if (!user) return false;
    
    const perms = Array.isArray(permission) ? permission : [permission];
    return perms.some(p => permissions?.includes(p));
  };

  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;
    
    const roleList = Array.isArray(role) ? role : [role];
    return roleList.some(r => roles?.includes(r));
  };

  const can = (action: string, resource: string): boolean => {
    return hasPermission(`${resource}:${action}`);
  };

  const value: PermissionContextValue = {
    hasPermission,
    hasRole,
    can,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermission() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermission must be used within PermissionProvider');
  }
  return context;
}

// Component for conditional rendering based on permissions
export function Protected({
  permission,
  role,
  fallback = null,
  children,
}: {
  permission?: string | string[];
  role?: string | string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { hasPermission, hasRole } = usePermission();

  let hasAccess = true;

  if (permission) {
    hasAccess = hasAccess && hasPermission(permission);
  }

  if (role) {
    hasAccess = hasAccess && hasRole(role);
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

**Usage Example:**
```typescript
import { Protected, usePermission } from '@/components/providers/permission-provider';

function ProductsPage() {
  const { can } = usePermission();

  return (
    <div>
      <h1>Products</h1>
      
      {/* Conditional rendering */}
      <Protected permission="inventory:create">
        <CreateProductButton />
      </Protected>

      {/* Programmatic check */}
      {can('delete', 'inventory') && (
        <DeleteButton />
      )}
    </div>
  );
}
```

---

### 5. LayoutProvider

```typescript
// components/providers/layout-provider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface LayoutContextValue {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);

      // Auto-collapse sidebar on mobile
      if (width < 768) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const value: LayoutContextValue = {
    sidebarCollapsed,
    toggleSidebar,
    setSidebarCollapsed,
    isMobile,
    isTablet,
    isDesktop,
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within LayoutProvider');
  }
  return context;
}
```

**Usage Example:**
```typescript
import { useLayout } from '@/components/providers/layout-provider';

function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, isMobile } = useLayout();

  return (
    <aside className={sidebarCollapsed ? 'w-16' : 'w-64'}>
      {!isMobile && (
        <button onClick={toggleSidebar}>
          Toggle
        </button>
      )}
    </aside>
  );
}
```

---

## State Management Strategy

### Zustand Store Architecture

```typescript
// lib/stores/index.tsx
'use client';

import React, { createContext, useContext, useRef } from 'react';
import { createStore, useStore as useZustandStore } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// UI Store - Application UI state
interface UIStore {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Active module
  activeModule: string;
  setActiveModule: (module: string) => void;
  
  // Breadcrumbs
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
}

const createUIStore = () =>
  createStore<UIStore>()(
    devtools(
      persist(
        (set) => ({
          sidebarCollapsed: false,
          toggleSidebar: () =>
            set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
          
          theme: 'dark',
          setTheme: (theme) => set({ theme }),
          
          activeModule: 'dashboard',
          setActiveModule: (module) => set({ activeModule: module }),
          
          breadcrumbs: [],
          setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
        }),
        {
          name: 'ui-store',
          partialize: (state) => ({
            sidebarCollapsed: state.sidebarCollapsed,
            theme: state.theme,
          }),
        }
      ),
      { name: 'UI Store' }
    )
  );

// User Preferences Store
interface PreferencesStore {
  language: string;
  setLanguage: (language: string) => void;
  
  dateFormat: string;
  setDateFormat: (format: string) => void;
  
  currency: string;
  setCurrency: (currency: string) => void;
  
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  setNotificationPreference: (
    type: keyof PreferencesStore['notifications'],
    enabled: boolean
  ) => void;
}

const createPreferencesStore = () =>
  createStore<PreferencesStore>()(
    devtools(
      persist(
        (set) => ({
          language: 'en',
          setLanguage: (language) => set({ language }),
          
          dateFormat: 'MM/DD/YYYY',
          setDateFormat: (dateFormat) => set({ dateFormat }),
          
          currency: 'USD',
          setCurrency: (currency) => set({ currency }),
          
          notifications: {
            email: true,
            sms: false,
            push: true,
          },
          setNotificationPreference: (type, enabled) =>
            set((state) => ({
              notifications: {
                ...state.notifications,
                [type]: enabled,
              },
            })),
        }),
        {
          name: 'preferences-store',
        }
      ),
      { name: 'Preferences Store' }
    )
  );

// Store Provider
type StoreContextValue = {
  uiStore: ReturnType<typeof createUIStore>;
  preferencesStore: ReturnType<typeof createPreferencesStore>;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({
  children,
  enableDebug = false,
}: {
  children: React.ReactNode;
  enableDebug?: boolean;
}) {
  const uiStoreRef = useRef(createUIStore());
  const preferencesStoreRef = useRef(createPreferencesStore());

  return (
    <StoreContext.Provider
      value={{
        uiStore: uiStoreRef.current,
        preferencesStore: preferencesStoreRef.current,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

// Hooks for using stores
export function useUIStore<T>(selector: (state: UIStore) => T): T {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useUIStore must be used within StoreProvider');
  }
  return useZustandStore(context.uiStore, selector);
}

export function usePreferencesStore<T>(
  selector: (state: PreferencesStore) => T
): T {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('usePreferencesStore must be used within StoreProvider');
  }
  return useZustandStore(context.preferencesStore, selector);
}
```

**Usage Example:**
```typescript
import { useUIStore, usePreferencesStore } from '@/lib/stores';

function MyComponent() {
  // Select only what you need (prevents unnecessary re-renders)
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  
  const currency = usePreferencesStore((state) => state.currency);
  
  return (
    <div>
      <button onClick={toggleSidebar}>
        {sidebarCollapsed ? 'Expand' : 'Collapse'}
      </button>
      <div>Currency: {currency}</div>
    </div>
  );
}
```

---

## Next.js 16 Optimizations

### 1. App Router Structure

```
app/
├── (auth)/                        # Route group for auth pages
│   ├── layout.tsx                 # Auth-specific layout
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── (dashboard)/                   # Route group for dashboard
│   ├── layout.tsx                 # Dashboard layout (with sidebar)
│   ├── page.tsx                   # Main dashboard
│   ├── inventory/
│   │   ├── @modal/                # Parallel route for modals
│   │   │   └── (..)products/
│   │   │       └── [id]/
│   │   │           └── page.tsx   # Intercepted modal
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── products/
│   │       ├── page.tsx
│   │       ├── [id]/
│   │       │   └── page.tsx
│   │       └── new/
│   │           └── page.tsx
│   ├── financial/
│   ├── warehouse/
│   └── ...
├── api/                           # API routes
│   └── graphql/
│       └── route.ts
├── layout.tsx                     # Root layout
├── page.tsx                       # Landing page
├── providers.tsx
└── globals.css
```

---

### 2. Server Components Strategy

```typescript
// app/(dashboard)/inventory/products/page.tsx
// This is a Server Component by default

import { ProductsClient } from './products-client';
import { getProducts } from '@/lib/api/products';

export default async function ProductsPage() {
  // Fetch data on the server
  const initialProducts = await getProducts();

  return (
    <div>
      <h1>Products</h1>
      {/* Pass data to Client Component */}
      <ProductsClient initialData={initialProducts} />
    </div>
  );
}

// products-client.tsx
'use client';

import { useProducts } from '@/hooks/useProducts';

export function ProductsClient({ initialData }) {
  // Use initial data and enable real-time updates
  const { products, loading } = useProducts(initialData);

  return (
    <div>
      {/* Interactive UI here */}
    </div>
  );
}
```

---

### 3. Streaming with Suspense

```typescript
// app/(dashboard)/page.tsx
import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Metrics load immediately */}
      <Suspense fallback={<MetricsSkeleton />}>
        <Metrics />
      </Suspense>

      {/* Charts stream in when ready */}
      <Suspense fallback={<ChartsSkeleton />}>
        <Charts />
      </Suspense>

      {/* Heavy data loads last */}
      <Suspense fallback={<TableSkeleton />}>
        <RecentOrders />
      </Suspense>
    </div>
  );
}

// Each component fetches its own data
async function Metrics() {
  const metrics = await fetchMetrics();
  return <MetricsDisplay data={metrics} />;
}

async function Charts() {
  const chartData = await fetchChartData();
  return <ChartsDisplay data={chartData} />;
}

async function RecentOrders() {
  const orders = await fetchRecentOrders();
  return <OrdersTable data={orders} />;
}
```

---

### 4. Parallel Routes for Complex Layouts

```typescript
// app/(dashboard)/financial/dashboard/layout.tsx
export default function FinancialDashboardLayout({
  children,
  metrics,
  charts,
  transactions,
}: {
  children: React.ReactNode;
  metrics: React.ReactNode;
  charts: React.ReactNode;
  transactions: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Main content */}
      <div className="col-span-12">
        {children}
      </div>

      {/* Metrics slot */}
      <div className="col-span-12 lg:col-span-4">
        {metrics}
      </div>

      {/* Charts slot */}
      <div className="col-span-12 lg:col-span-8">
        {charts}
      </div>

      {/* Transactions slot */}
      <div className="col-span-12">
        {transactions}
      </div>
    </div>
  );
}

// Each slot has its own page
// app/(dashboard)/financial/dashboard/@metrics/page.tsx
// app/(dashboard)/financial/dashboard/@charts/page.tsx
// app/(dashboard)/financial/dashboard/@transactions/page.tsx
```

---

### 5. Intercepting Routes for Modals

```typescript
// app/(dashboard)/inventory/products/page.tsx
export default function ProductsPage() {
  return (
    <div>
      <ProductsList />
    </div>
  );
}

// app/(dashboard)/inventory/products/[id]/page.tsx
export default function ProductDetailPage({ params }) {
  return (
    <div>
      <ProductDetail id={params.id} />
    </div>
  );
}

// app/(dashboard)/inventory/@modal/(..)products/[id]/page.tsx
// This intercepts navigation and shows a modal instead
'use client';

import { useRouter } from 'next/navigation';
import { Dialog } from '@/components/ui/dialog';
import { ProductDetail } from '@/components/inventory/product-detail';

export default function ProductDetailModal({ params }) {
  const router = useRouter();

  return (
    <Dialog open onOpenChange={() => router.back()}>
      <ProductDetail id={params.id} />
    </Dialog>
  );
}
```

---

### 6. Loading UI & Skeletons

```typescript
// app/(dashboard)/inventory/products/loading.tsx
export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    </div>
  );
}
```

---

### 7. Error Handling

```typescript
// app/(dashboard)/inventory/products/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-primary text-primary-foreground rounded"
      >
        Try again
      </button>
    </div>
  );
}
```

---

## Performance Best Practices

### 1. Code Splitting

```typescript
import dynamic from 'next/dynamic';

// Heavy components - load on demand
const WarehouseMap = dynamic(
  () => import('@/components/warehouse/warehouse-map'),
  {
    loading: () => <MapSkeleton />,
    ssr: false, // Don't render on server
  }
);

const AdvancedChartBuilder = dynamic(
  () => import('@/components/analytics/chart-builder'),
  {
    loading: () => <ChartBuilderSkeleton />,
  }
);

// Module-specific heavy dependencies
const PDFViewer = dynamic(
  () => import('@/components/common/pdf-viewer'),
  { ssr: false }
);
```

---

### 2. Image Optimization

```typescript
import Image from 'next/image';

// Product images
<Image
  src={product.imageUrl}
  alt={product.name}
  width={300}
  height={300}
  placeholder="blur"
  blurDataURL={product.blurHash}
  loading="lazy"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>

// Use next/image for all images
// Automatic optimization, lazy loading, blur placeholders
```

---

### 3. Font Optimization

```typescript
// app/layout.tsx
import { Inter, Fira_Code } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${firaCode.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

---

### 4. Prefetching

```typescript
import Link from 'next/link';

// Next.js automatically prefetches Link components
<Link href="/inventory/products" prefetch>
  Products
</Link>

// Programmatic prefetch
import { useRouter } from 'next/navigation';

function MyComponent() {
  const router = useRouter();
  
  useEffect(() => {
    // Prefetch likely next page
    router.prefetch('/financial/dashboard');
  }, [router]);
}
```

---

### 5. Virtualization for Large Lists

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function ProductList({ products }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <ProductCard product={products[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Caching Strategies

### Apollo Cache Configuration

```typescript
// lib/apollo/cache.ts
import { InMemoryCache } from '@apollo/client';

export const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        products: {
          keyArgs: ['filters', 'sort'],
          merge(existing, incoming, { args }) {
            // Pagination merge strategy
            if (args?.pagination?.offset === 0) {
              return incoming;
            }
            return existing ? [...existing, ...incoming] : incoming;
          },
        },
        customers: {
          keyArgs: ['filters'],
          merge(existing = [], incoming) {
            return incoming;
          },
        },
      },
    },
    Product: {
      fields: {
        stockLevel: {
          read(stockLevel, { readField }) {
            // Custom read logic
            return stockLevel;
          },
        },
      },
    },
  },
});
```

---

## Summary

This guide provides:

✅ **Complete provider architecture** with all necessary providers  
✅ **State management patterns** using Zustand and Apollo Cache  
✅ **Next.js 16 optimization techniques** for maximum performance  
✅ **Real-world examples** for each pattern  
✅ **Best practices** for scalable applications  
✅ **Performance monitoring** strategies  

Use these patterns throughout your dashboard implementation!
