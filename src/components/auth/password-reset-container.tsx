"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ForgotPasswordRequest } from "./forgot-password-request";
import { ForgotPasswordConfirmation } from "./forgot-password-confirmation";
import { ResetPasswordForm } from "./reset-password-form";
import { ResetPasswordSuccess } from "./reset-password-success";
import { OnboardingSteps } from "./onboarding-steps";

type ResetStep = "request" | "confirmation" | "reset-form" | "success";

interface PasswordResetContainerProps {
  onBackToSignIn: () => void;
  resetToken?: string | null;
}

export function PasswordResetContainer({
  onBackToSignIn,
  resetToken = null,
}: PasswordResetContainerProps) {
  const [currentStep, setCurrentStep] = React.useState<ResetStep>(
    resetToken ? "reset-form" : "request"
  );
  const [email, setEmail] = React.useState("");
  const [organizationId, setOrganizationId] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [tokenValid, setTokenValid] = React.useState(true);
  const [previewStep, setPreviewStep] = React.useState(0);

  // Auto-cycle preview steps
  React.useEffect(() => {
    const timer = setInterval(() => {
      setPreviewStep((prev) => (prev === 3 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Validate token on mount if provided
  React.useEffect(() => {
    if (resetToken) {
      validateResetToken(resetToken);
    }
  }, [resetToken]);

  /**
   * Validate the reset token
   * TODO: Replace with actual API call
   */
  const validateResetToken = async (token: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      // const response = await fetch(`/api/auth/validate-reset-token?token=${token}`);
      // const data = await response.json();
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Mock validation - in production, check actual token validity
      const isValid = token.length > 10; // Simple mock check
      
      setTokenValid(isValid);
      
      if (!isValid) {
        setError("Invalid or expired reset token");
      }
    } catch (err) {
      console.error("Token validation error:", err);
      setTokenValid(false);
      setError("Failed to validate reset token");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle forgot password request
   * TODO: Replace with actual API call
   */
  const handleForgotPasswordRequest = async (
    emailAddress: string,
    orgId: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email: emailAddress, organizationId: orgId }),
      // });
      // const data = await response.json();

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Store email and org ID for confirmation screen
      setEmail(emailAddress);
      setOrganizationId(orgId);

      // Move to confirmation step
      setCurrentStep("confirmation");
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle resend email
   * TODO: Replace with actual API call
   */
  const handleResendEmail = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, organizationId }),
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Success - no need to change state, just show success feedback
    } catch (err) {
      console.error("Resend email error:", err);
      setError("Failed to resend email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle password reset submission
   * TODO: Replace with actual API call
   */
  const handleResetPassword = async (newPassword: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      // const response = await fetch('/api/auth/reset-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token: resetToken, password: newPassword }),
      // });
      // const data = await response.json();

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Move to success step
      setCurrentStep("success");
    } catch (err) {
      console.error("Reset password error:", err);
      setError("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle request new link from expired token screen
   */
  const handleRequestNewLink = () => {
    setCurrentStep("request");
    setTokenValid(true);
    setError(null);
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        className="w-full max-w-6xl min-h-[700px] grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden shadow-xl border border-border"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Left side: Form */}
        <div className="w-full min-h-[700px] bg-card flex flex-col items-center justify-center p-8 md:p-12">
          {currentStep === "request" && (
            <ForgotPasswordRequest
              onBack={onBackToSignIn}
              onSubmit={handleForgotPasswordRequest}
              isLoading={isLoading}
              error={error}
            />
          )}

          {currentStep === "confirmation" && (
            <ForgotPasswordConfirmation
              email={email}
              onResend={handleResendEmail}
              onBackToSignIn={onBackToSignIn}
              isResending={isLoading}
              error={error}
            />
          )}

          {currentStep === "reset-form" && (
            <ResetPasswordForm
              onSubmit={handleResetPassword}
              isLoading={isLoading}
              error={error}
              tokenValid={tokenValid}
              onRequestNewLink={handleRequestNewLink}
            />
          )}

          {currentStep === "success" && (
            <ResetPasswordSuccess onContinue={onBackToSignIn} />
          )}
        </div>

        {/* Right side: Preview - Hidden on mobile */}
        <div className="hidden lg:block min-h-[700px]">
          <OnboardingSteps currentStep={previewStep} isPreview={true} />
        </div>
      </motion.div>
    </div>
  );
}
