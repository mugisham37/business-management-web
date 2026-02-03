'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Loading fallback component
function DashboardLoading() {
    return (
        <div className="container mx-auto p-6 flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
        </div>
    );
}

// Dynamically import the dashboard content with SSR disabled
// This is required because the dashboard uses Apollo hooks which need client-side context
const DashboardContent = dynamic(
    () => import('./DashboardContent').then(mod => mod.DashboardContent),
    { 
        ssr: false,
        loading: () => <DashboardLoading />
    }
);

// Main export 
export default function DashboardPage() {
    return (
        <Suspense fallback={<DashboardLoading />}>
            <DashboardContent />
        </Suspense>
    );
}
