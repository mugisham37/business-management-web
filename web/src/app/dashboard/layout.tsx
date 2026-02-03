import { ClientRouteGuard } from '@/components/auth/ClientRouteGuard';

export const metadata = {
    title: 'Dashboard | Fizz Database',
    description: 'Your business dashboard with comprehensive analytics and management tools.',
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClientRouteGuard 
            requireAuth={true}
            requiredPermissions={['dashboard:read']}
            fallbackPath="/auth"
            showError={true}
        >
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {children}
            </div>
        </ClientRouteGuard>
    );
}