"use client";

import { useState } from "react";

interface SecuritySetting {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    defaultEnabled: boolean;
}

export default function OnboardingModal() {
    const [settings, setSettings] = useState({
        twoFactor: true,
        strongPassword: true,
        loginNotifications: false,
    });

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="bg-neutral-950 min-h-screen flex items-center justify-center p-4">
            {/* Modal Backdrop */}
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-10"></div>

            {/* Onboarding Modal */}
            <div className="modal-card max-w-2xl w-full z-20">
                <div className="modal-content shadow-xl">
                    {/* Modal Header */}
                    <div className="p-6 border-b border-neutral-800">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-white">
                                Complete Your Account Setup
                            </h2>
                            <button className="text-neutral-400 hover:text-white transition">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="px-6 pt-6">
                        <div className="flex items-center justify-between mb-6">
                            {/* Step 1 - Completed */}
                            <div className="flex flex-col items-center">
                                <div className="step-indicator step-completed">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <span className="text-xs text-neutral-400 mt-2">Account</span>
                            </div>

                            <div className="w-full mx-2 h-0.5 bg-neutral-800">
                                <div className="w-1/3 h-0.5 bg-blue-500"></div>
                            </div>

                            {/* Step 2 - Active */}
                            <div className="flex flex-col items-center">
                                <div className="step-indicator step-active">2</div>
                                <span className="text-xs text-white mt-2">Security</span>
                            </div>

                            <div className="w-full mx-2 h-0.5 bg-neutral-800"></div>

                            {/* Step 3 - Inactive */}
                            <div className="flex flex-col items-center">
                                <div className="step-indicator step-inactive">3</div>
                                <span className="text-xs text-neutral-500 mt-2">Preferences</span>
                            </div>

                            <div className="w-full mx-2 h-0.5 bg-neutral-800"></div>

                            {/* Step 4 - Inactive */}
                            <div className="flex flex-col items-center">
                                <div className="step-indicator step-inactive">4</div>
                                <span className="text-xs text-neutral-500 mt-2">Complete</span>
                            </div>
                        </div>
                    </div>

                    {/* Modal Content */}
                    <div className="px-6 pb-6">
                        <h3 className="text-lg font-medium text-white mb-4">
                            Set Up Your Security Preferences
                        </h3>
                        <p className="text-neutral-400 mb-6">
                            Enhance your account security by configuring these important
                            settings.
                        </p>

                        {/* Two-Factor Authentication */}
                        <div className="bg-neutral-800/40 rounded-lg p-4 mb-5">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 mt-1">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-blue-500"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-3 flex-1">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-white font-medium">
                                            Two-Factor Authentication
                                        </h4>
                                        <button
                                            onClick={() => toggleSetting("twoFactor")}
                                            className={`toggle-switch ${settings.twoFactor ? "active" : ""}`}
                                            aria-label="Toggle two-factor authentication"
                                        />
                                    </div>
                                    <p className="text-neutral-400 text-sm mt-1">
                                        Add an extra layer of security to your account by requiring
                                        a verification code in addition to your password.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Strong Password Requirements */}
                        <div className="bg-neutral-800/40 rounded-lg p-4 mb-5">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 mt-1">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-blue-500"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-3 flex-1">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-white font-medium">
                                            Strong Password Requirements
                                        </h4>
                                        <button
                                            onClick={() => toggleSetting("strongPassword")}
                                            className={`toggle-switch ${settings.strongPassword ? "active" : ""}`}
                                            aria-label="Toggle strong password requirements"
                                        />
                                    </div>
                                    <p className="text-neutral-400 text-sm mt-1">
                                        Enforce strong password policies including minimum length,
                                        special characters, and regular password changes.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Login Notifications */}
                        <div className="bg-neutral-800/40 rounded-lg p-4 mb-6">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 mt-1">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-blue-500"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                    </svg>
                                </div>
                                <div className="ml-3 flex-1">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-white font-medium">
                                            Login Notifications
                                        </h4>
                                        <button
                                            onClick={() => toggleSetting("loginNotifications")}
                                            className={`toggle-switch ${settings.loginNotifications ? "active" : ""}`}
                                            aria-label="Toggle login notifications"
                                        />
                                    </div>
                                    <p className="text-neutral-400 text-sm mt-1">
                                        Receive email notifications when there are new login
                                        attempts from unrecognized devices.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between">
                            <button className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition">
                                Back
                            </button>
                            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium">
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
