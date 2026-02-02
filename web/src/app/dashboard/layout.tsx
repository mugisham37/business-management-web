import { RouteGuard } from '@/components/auth/RouteGuard';

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
        <RouteGuard 
            requireAuth={true}
            requiredPermissions={['dashboard:read']}
            fallbackPath="/auth"
            showError={true}
        >
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {children}
            </div>
        </RouteGuard>
    );
}