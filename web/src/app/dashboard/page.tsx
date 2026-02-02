'use client';

import { useAuth, usePermissions, useTier, useSecurity } from '@/components/auth';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Users, Settings, BarChart3, Lock } from 'lucide-react';

export default function DashboardPage() {
    const { user, hasPermission, hasFeature, logout } = useAuth();
    const { userPermissions } = usePermissions();
    const { currentTier, hasFeature: hasTierFeature } = useTier();
    const { riskScore, riskLevel, isDeviceTrusted } = useSecurity();

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Welcome back, {user?.displayName || user?.firstName}!
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Here's what's happening with your business today.
                    </p>
                </div>
                <Button onClick={logout} variant="outline">
                    Sign Out
                </Button>
            </div>

            {/* User Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* User Role & Tier */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">{user?.role}</Badge>
                                <Badge variant="outline">{currentTier}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {userPermissions.length} permissions active
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Status */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Security Status</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Badge 
                                    variant={riskLevel === 'low' ? 'default' : riskLevel === 'medium' ? 'secondary' : 'destructive'}
                                >
                                    {riskLevel} risk
                                </Badge>
                                {isDeviceTrusted && <Badge variant="outline">Trusted Device</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Risk Score: {riskScore}/100
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Business Info */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Business</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">{user?.businessName || 'Not Set'}</p>
                            <p className="text-xs text-muted-foreground">
                                Tenant: {user?.tenantId}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Last Login */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last Login</CardTitle>
                        <Lock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">
                                {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleTimeString() : ''}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Feature Access Examples */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Admin Panel - Permission Gated */}
                <PermissionGuard 
                    requiredPermissions={['admin:read']}
                    showUpgradePrompt={false}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Admin Panel
                            </CardTitle>
                            <CardDescription>
                                Administrative functions and system management
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                You have admin access to manage users, permissions, and system settings.
                            </p>
                            <Button>Open Admin Panel</Button>
                        </CardContent>
                    </Card>
                </PermissionGuard>

                {/* Analytics - Tier Gated */}
                {hasTierFeature('advanced_analytics') ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Advanced Analytics
                            </CardTitle>
                            <CardDescription>
                                Detailed business insights and reporting
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Access comprehensive analytics and custom reports.
                            </p>
                            <Button>View Analytics</Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="opacity-60">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Advanced Analytics
                                <Badge variant="outline">Premium</Badge>
                            </CardTitle>
                            <CardDescription>
                                Upgrade to access advanced analytics
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Unlock detailed business insights with a premium plan.
                            </p>
                            <Button variant="outline">Upgrade Plan</Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Permissions List */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Permissions</CardTitle>
                    <CardDescription>
                        Current permissions assigned to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {userPermissions.map((permission) => (
                            <Badge key={permission} variant="secondary">
                                {permission}
                            </Badge>
                        ))}
                        {userPermissions.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                No specific permissions assigned
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Feature Flags */}
            {user?.featureFlags && user.featureFlags.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Feature Flags</CardTitle>
                        <CardDescription>
                            Experimental features enabled for your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {user.featureFlags.map((flag) => (
                                <Badge key={flag} variant="outline">
                                    {flag}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}