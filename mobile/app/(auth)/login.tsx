/**
 * Login Screen
 *
 * Email/password login form.
 */
import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeScreen, Header } from "@/components/layout";
import { Button, Input } from "@/components/core";
import { useAuth } from "@/hooks/auth";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
    const router = useRouter();
    const { login, isLoading, error, clearError } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const validateForm = (): boolean => {
        let isValid = true;
        clearError();
        setEmailError("");
        setPasswordError("");

        // Email validation
        if (!email.trim()) {
            setEmailError("Email is required");
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError("Please enter a valid email");
            isValid = false;
        }

        // Password validation
        if (!password) {
            setPasswordError("Password is required");
            isValid = false;
        } else if (password.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            isValid = false;
        }

        return isValid;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        const result = await login({ email, password });

        if (!result.success) {
            // Error is handled by useAuth and shown in error state
        }
    };

    return (
        <SafeScreen hasHeader={true} bgColor="bg-background">
            <Header
                title="Welcome Back"
                subtitle="Sign in to your account"
                largeTitle
                showBack
                onBack={() => router.back()}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1"
                    contentContainerClassName="px-6 py-6"
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Error Message */}
                    {error && (
                        <View className="bg-error/10 rounded-xl p-4 mb-6 flex-row items-center">
                            <Ionicons name="warning-outline" size={20} color="#EF4444" />
                            <Text className="text-error text-sm ml-2 flex-1">{error}</Text>
                        </View>
                    )}

                    {/* Login Form */}
                    <View className="mb-6">
                        <Input
                            label="Email Address"
                            placeholder="you@company.com"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (emailError) setEmailError("");
                            }}
                            error={emailError}
                            leftIcon="mail-outline"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            textContentType="emailAddress"
                            editable={!isLoading}
                        />

                        <Input
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (passwordError) setPasswordError("");
                            }}
                            error={passwordError}
                            leftIcon="lock-closed-outline"
                            isPassword
                            autoComplete="password"
                            textContentType="password"
                            editable={!isLoading}
                        />
                    </View>

                    {/* Forgot Password */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => {
                            // TODO: Navigate to forgot password
                        }}
                        className="self-end mb-6"
                    >
                        Forgot Password?
                    </Button>

                    {/* Login Button */}
                    <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={isLoading}
                        onPress={handleLogin}
                    >
                        Sign In
                    </Button>

                    {/* Divider */}
                    <View className="flex-row items-center my-8">
                        <View className="flex-1 h-px bg-border" />
                        <Text className="text-text-tertiary text-sm mx-4">or</Text>
                        <View className="flex-1 h-px bg-border" />
                    </View>

                    {/* SSO Options (placeholder) */}
                    <Button
                        variant="secondary"
                        size="lg"
                        fullWidth
                        leftIcon="business-outline"
                        onPress={() => {
                            // TODO: SSO login
                        }}
                        className="mb-3"
                    >
                        Continue with SSO
                    </Button>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Footer */}
            <View className="px-6 pb-6">
                <Text className="text-text-tertiary text-xs text-center">
                    By signing in, you agree to our Terms of Service{"\n"}and Privacy Policy
                </Text>
            </View>
        </SafeScreen>
    );
}
