/**
 * Welcome Screen
 *
 * Entry point for unauthenticated users.
 * Shows branding and login options with mobile-optimized OAuth flows.
 */
import React, { useState } from "react";
import { View, Text, Alert, Linking } from "react-native";
import { useRouter } from "expo-router";
import { SafeScreen } from "@/components/layout";
import { Button } from "@/components/core";
import { useBiometric } from "@/hooks/auth";
import { useSocialAuth } from "@/hooks/useSocialAuth";
import { Ionicons } from "@expo/vector-icons";

export default function WelcomeScreen() {
    const router = useRouter();
    const { isEnabled, biometricLogin, getBiometricName, biometricType } = useBiometric();
    const { googleLogin, facebookLogin, isLoading, error } = useSocialAuth();
    const [retryCount, setRetryCount] = useState(0);

    const handleBiometricLogin = async () => {
        const result = await biometricLogin();
        if (result.success) {
            // Biometric verified, proceed to validate cached session
            router.push("/(tabs)");
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'facebook') => {
        try {
            let result;
            if (provider === 'google') {
                result = await googleLogin();
            } else {
                result = await facebookLogin();
            }

            if (result.success) {
                router.push("/(tabs)");
            } else {
                throw new Error(result.error || 'Authentication failed');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
            setRetryCount(prev => prev + 1);
            
            Alert.alert(
                "Authentication Error",
                errorMessage,
                [
                    {
                        text: "Retry",
                        onPress: () => handleSocialLogin(provider)
                    },
                    {
                        text: "Cancel",
                        style: "cancel"
                    },
                    ...(retryCount > 2 ? [{
                        text: "Get Help",
                        onPress: () => Linking.openURL('mailto:support@example.com')
                    }] : [])
                ]
            );
        }
    };

    const getBiometricIcon = () => {
        switch (biometricType) {
            case "facial":
                return "scan-outline";
            case "fingerprint":
                return "finger-print-outline";
            default:
                return "shield-checkmark-outline";
        }
    };

    return (
        <SafeScreen hasHeader={false} bgColor="bg-background">
            <View className="flex-1 px-6">
                {/* Logo and Branding */}
                <View className="flex-1 items-center justify-center">
                    {/* App Icon */}
                    <View className="w-24 h-24 rounded-3xl bg-primary items-center justify-center mb-6 shadow-lg">
                        <Ionicons name="business-outline" size={48} color="#FFFFFF" />
                    </View>

                    {/* App Name */}
                    <Text className="text-text-primary text-3xl font-bold mb-2">
                        Enterprise BMS
                    </Text>
                    <Text className="text-text-secondary text-base text-center">
                        Complete Business Management{"\n"}at Your Fingertips
                    </Text>
                </View>

                {/* Features */}
                <View className="mb-8">
                    <FeatureItem
                        icon="analytics-outline"
                        title="Real-time Dashboard"
                        description="Monitor your business metrics instantly"
                    />
                    <FeatureItem
                        icon="cart-outline"
                        title="Mobile POS"
                        description="Process sales anywhere, anytime"
                    />
                    <FeatureItem
                        icon="cube-outline"
                        title="Inventory Control"
                        description="Track stock with barcode scanning"
                    />
                </View>

                {/* Action Buttons */}
                <View className="pb-8">
                    {/* Error Display */}
                    {error && (
                        <View className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                            <Text className="text-red-600 text-sm text-center">{error}</Text>
                            {retryCount > 2 && (
                                <Text className="text-red-500 text-xs text-center mt-1">
                                    Having trouble? Check your internet connection or contact support.
                                </Text>
                            )}
                        </View>
                    )}

                    {/* Biometric Login (if enabled) */}
                    {isEnabled && (
                        <Button
                            variant="secondary"
                            size="lg"
                            fullWidth
                            leftIcon={getBiometricIcon()}
                            onPress={handleBiometricLogin}
                            className="mb-3"
                            disabled={isLoading}
                        >
                            Login with {getBiometricName()}
                        </Button>
                    )}

                    {/* Social Login Buttons */}
                    <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        leftIcon="logo-google"
                        onPress={() => handleSocialLogin('google')}
                        className="mb-3"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Continue with Google'}
                    </Button>

                    <Button
                        variant="secondary"
                        size="lg"
                        fullWidth
                        leftIcon="logo-facebook"
                        onPress={() => handleSocialLogin('facebook')}
                        className="mb-3"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Continue with Facebook'}
                    </Button>

                    {/* Email Login */}
                    <Button
                        variant="ghost"
                        size="lg"
                        fullWidth
                        leftIcon="mail-outline"
                        onPress={() => router.push("/(auth)/login")}
                        className="mb-3"
                        disabled={isLoading}
                    >
                        Login with Email
                    </Button>

                    {/* Help / Support */}
                    <Button
                        variant="ghost"
                        size="md"
                        fullWidth
                        onPress={() => Linking.openURL('mailto:support@example.com')}
                        disabled={isLoading}
                    >
                        Need Help?
                    </Button>
                </View>
            </View>
        </SafeScreen>
    );
}

interface FeatureItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
    return (
        <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 rounded-xl bg-primary/10 items-center justify-center mr-4">
                <Ionicons name={icon} size={24} color="#3B82F6" />
            </View>
            <View className="flex-1">
                <Text className="text-text-primary text-base font-semibold">
                    {title}
                </Text>
                <Text className="text-text-secondary text-sm">{description}</Text>
            </View>
        </View>
    );
}
