'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Loading fallback component
function SecuritySettingsLoading() {
    return (
        <div className="space-y-6">
            <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
        </div>
    );
}

// Dynamically import the security settings content with SSR disabled
// This is required because it uses Apollo hooks which need client-side context
const SecuritySettingsContent = dynamic(
    () => import('./SecuritySettingsContent').then(mod => mod.SecuritySettingsContent),
    { 
        ssr: false,
        loading: () => <SecuritySettingsLoading />
    }
);

// Main export 
export default function SecuritySettingsPage() {
    return (
        <Suspense fallback={<SecuritySettingsLoading />}>
            <SecuritySettingsContent />
        </Suspense>
    );
}
