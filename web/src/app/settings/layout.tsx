import { RouteGuard } from '@/components/auth/RouteGuard';

export const metadata = {
    title: 'Settings | Fizz Database',
    description: 'Manage your account settings, security, and preferences.',
};

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RouteGuard 
            requireAuth={true}
            requiredPermissions={['settings:read']}
            fallbackPath="/auth"
            showError={true}
        >
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto p-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage your account settings and preferences
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </RouteGuard>
    );
}