'use client';

import { Suspense, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import type { RouteGuardProps } from '@/components/auth/RouteGuard';

// Loading fallback
function RouteGuardLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Loading...
                </p>
            </div>
        </div>
    );
}

// Dynamically import RouteGuard with SSR disabled
const RouteGuardDynamic = dynamic(
    () => import('@/components/auth/RouteGuard').then(mod => mod.RouteGuard),
    { 
        ssr: false,
        loading: () => <RouteGuardLoading />
    }
);

interface ClientRouteGuardProps extends RouteGuardProps {
    children: ReactNode;
}

/**
 * Client-side only RouteGuard wrapper
 * Use this in layouts instead of RouteGuard directly to prevent SSR issues
 */
export function ClientRouteGuard({ children, ...props }: ClientRouteGuardProps) {
    return (
        <Suspense fallback={<RouteGuardLoading />}>
            <RouteGuardDynamic {...props}>
                {children}
            </RouteGuardDynamic>
        </Suspense>
    );
}
