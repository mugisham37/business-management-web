'use client';

import { useState } from 'react';
import { useAuth, useMFA, useSecurity, useSocialAuth } from '@/components/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
    Shield, 
    Smartphone, 
    Key, 
    AlertTriangle, 
    CheckCircle, 
    XCircle,
    ExternalLink,
    Trash2
} from 'lucide-react';
import { toast } from 'sonner';

export function SecuritySettingsContent() {
    const { user } = useAuth();
    const { 
        isEnabled: mfaEnabled, 
        generateSetup, 
        disableMfa, 
        generateBackupCodes,
    } = useMFA();
    const { 
        riskScore, 
        riskLevel, 
        isDeviceTrusted, 
        recommendations,
        refreshRiskScore,
    } = useSecurity();
    const { 
        connectedProviders, 
        supportedProviders,
        linkProvider,
        unlinkProvider
    } = useSocialAuth();

    const [isLoading, setIsLoading] = useState(false);

    const handleMfaToggle = async (enabled: boolean) => {
        setIsLoading(true);
        try {
            if (enabled) {
                await generateSetup();
                // MFA setup flow would be handled by a modal or separate page
                toast.success('MFA setup initiated');
            } else {
                const success = await disableMfa();
                if (success) {
                    toast.success('Multi-factor authentication disabled');
                }
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update MFA settings';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateBackupCodes = async () => {
        try {
            const codes = await generateBackupCodes('');
            if (codes) {
                toast.success('Backup codes generated successfully');
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to generate backup codes';
            toast.error(errorMessage);
        }
    };

    const handleSocialProviderLink = async (provider: string) => {
        try {
            const success = await linkProvider(provider);
            if (success) {
                toast.success(`${provider} account linked successfully`);
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : `Failed to link ${provider} account`;
            toast.error(errorMessage);
        }
    };

    const handleSocialProviderUnlink = async (provider: string) => {
        try {
            const success = await unlinkProvider(provider);
            if (success) {
                toast.success(`${provider} account unlinked`);
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : `Failed to unlink ${provider} account`;
            toast.error(errorMessage);
        }
    };

    const getRiskLevelColor = (level: string) => {
        switch (level) {
            case 'low': return 'text-green-600 bg-green-50 border-green-200';
            case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'critical': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Security Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Security Overview
                    </CardTitle>
                    <CardDescription>
                        Your current security status and recommendations
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRiskLevelColor(riskLevel)}`}>
                                {riskLevel.toUpperCase()} RISK
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                                Score: {riskScore}/100
                            </p>
                        </div>
                        <div className="text-center">
                            {isDeviceTrusted ? (
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-green-600 bg-green-50 border border-green-200">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    TRUSTED DEVICE
                                </div>
                            ) : (
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200">
                                    <AlertTriangle className="w-4 h-4 mr-1" />
                                    UNVERIFIED DEVICE
                                </div>
                            )}
                        </div>
                        <div className="text-center">
                            {mfaEnabled ? (
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-green-600 bg-green-50 border border-green-200">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    MFA ENABLED
                                </div>
                            ) : (
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-red-600 bg-red-50 border border-red-200">
                                    <XCircle className="w-4 h-4 mr-1" />
                                    MFA DISABLED
                                </div>
                            )}
                        </div>
                    </div>

                    {recommendations.length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Security Recommendations</h4>
                            <ul className="space-y-1">
                                {recommendations.map((rec, index) => (
                                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={refreshRiskScore}
                        >
                            Refresh Risk Score
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Multi-Factor Authentication */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5" />
                        Multi-Factor Authentication
                    </CardTitle>
                    <CardDescription>
                        Add an extra layer of security to your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="mfa-toggle" className="text-sm font-medium">
                                Enable MFA
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Require a verification code from your phone when signing in
                            </p>
                        </div>
                        <Switch
                            id="mfa-toggle"
                            checked={mfaEnabled}
                            onCheckedChange={handleMfaToggle}
                            disabled={isLoading}
                        />
                    </div>

                    {mfaEnabled && (
                        <>
                            <Separator />
                            <div className="space-y-3">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={handleGenerateBackupCodes}
                                >
                                    Generate Backup Codes
                                </Button>
                                <p className="text-xs text-muted-foreground">
                                    Backup codes can be used to access your account if you lose your phone
                                </p>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Connected Accounts */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        Connected Accounts
                    </CardTitle>
                    <CardDescription>
                        Manage your social login providers
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {supportedProviders.map((provider: string) => {
                        const isConnected = connectedProviders.some((cp: { provider: string }) => cp.provider === provider);
                        
                        return (
                            <div key={provider} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                        {provider === 'google' && '🔍'}
                                        {provider === 'facebook' && '📘'}
                                        {provider === 'github' && '🐙'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium capitalize">{provider}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {isConnected ? 'Connected' : 'Not connected'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isConnected && (
                                        <Badge variant="secondary">Connected</Badge>
                                    )}
                                    <Button
                                        variant={isConnected ? "destructive" : "outline"}
                                        size="sm"
                                        onClick={() => isConnected 
                                            ? handleSocialProviderUnlink(provider)
                                            : handleSocialProviderLink(provider)
                                        }
                                    >
                                        {isConnected ? (
                                            <>
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                Disconnect
                                            </>
                                        ) : (
                                            <>
                                                <ExternalLink className="w-4 h-4 mr-1" />
                                                Connect
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                        Basic account details and security information
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <Label className="text-muted-foreground">Email</Label>
                            <p className="font-medium">{user?.email}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Role</Label>
                            <p className="font-medium">{user?.role}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Last Login</Label>
                            <p className="font-medium">
                                {user?.lastLoginAt 
                                    ? new Date(user.lastLoginAt).toLocaleString()
                                    : 'Never'
                                }
                            </p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Account Created</Label>
                            <p className="font-medium">
                                {user?.createdAt 
                                    ? new Date(user.createdAt).toLocaleDateString()
                                    : 'Unknown'
                                }
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
