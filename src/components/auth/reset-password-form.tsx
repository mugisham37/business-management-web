"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
    },
  },
};

interface PasswordStrength {
  strength: "weak" | "medium" | "strong" | "very-strong";
  score: number;
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

function calculatePasswordStrength(password: string): PasswordStrength {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  let strength: "weak" | "medium" | "strong" | "very-strong" = "weak";
  if (score >= 5) strength = "very-strong";
  else if (score >= 4) strength = "strong";
  else if (score >= 3) strength = "medium";

  return { strength, score, checks };
}

interface ResetPasswordFormProps {
  onSubmit: (password: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  tokenValid: boolean;
  onRequestNewLink: () => void;
}

export function ResetPasswordForm({
  onSubmit,
  isLoading,
  error,
  tokenValid,
  onRequestNewLink,
}: ResetPasswordFormProps) {
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [touchedFields, setTouchedFields] = React.useState<Set<string>>(new Set());

  const passwordStrength = password ? calculatePasswordStrength(password) : null;
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const isFormValid =
    passwordStrength?.strength === "very-strong" ||
    passwordStrength?.strength === "strong";

  const markFieldTouched = (field: string) => {
    setTouchedFields((prev) => new Set(prev).add(field));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !passwordsMatch) return;
    await onSubmit(password);
  };

  // If token is invalid, show error state
  if (!tokenValid) {
    return (
      <motion.div
        className="w-full max-w-sm"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-6 text-center">
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 text-destructive mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <AlertCircle className="w-10 h-10" />
          </motion.div>

          <h2 className="text-3xl font-bold text-foreground mb-2">
            Link Expired
          </h2>
          <p className="text-sm text-muted-foreground">
            This password reset link has expired or is invalid. Please request a
            new one.
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button onClick={onRequestNewLink} className="w-full">
            Request New Reset Link
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full max-w-sm"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Set New Password
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose a strong password to secure your account.
        </p>
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="mb-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-password">New Password</Label>
          <div className="relative">
            <Input
              id="new-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => markFieldTouched("password")}
              className={cn(
                touchedFields.has("password") &&
                  password.length > 0 &&
                  !isFormValid &&
                  "border-destructive focus-visible:ring-destructive",
                "pr-10"
              )}
              required
              disabled={isLoading}
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {password && passwordStrength && (
            <div className="space-y-2 mt-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    className={cn(
                      "h-full transition-colors",
                      passwordStrength.strength === "weak" && "bg-red-500",
                      passwordStrength.strength === "medium" && "bg-amber-500",
                      passwordStrength.strength === "strong" && "bg-blue-500",
                      passwordStrength.strength === "very-strong" && "bg-green-500"
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "text-xs font-medium capitalize",
                    passwordStrength.strength === "weak" && "text-red-500",
                    passwordStrength.strength === "medium" && "text-amber-500",
                    passwordStrength.strength === "strong" && "text-blue-500",
                    passwordStrength.strength === "very-strong" && "text-green-500"
                  )}
                >
                  {passwordStrength.strength.replace("-", " ")}
                </span>
              </div>

              {/* Password Requirements Checklist */}
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div
                  className={cn(
                    "flex items-center gap-1",
                    passwordStrength.checks.length
                      ? "text-green-600"
                      : "text-muted-foreground"
                  )}
                >
                  {passwordStrength.checks.length ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-current" />
                  )}
                  <span>8+ characters</span>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1",
                    passwordStrength.checks.uppercase
                      ? "text-green-600"
                      : "text-muted-foreground"
                  )}
                >
                  {passwordStrength.checks.uppercase ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-current" />
                  )}
                  <span>Uppercase</span>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1",
                    passwordStrength.checks.lowercase
                      ? "text-green-600"
                      : "text-muted-foreground"
                  )}
                >
                  {passwordStrength.checks.lowercase ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-current" />
                  )}
                  <span>Lowercase</span>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1",
                    passwordStrength.checks.number
                      ? "text-green-600"
                      : "text-muted-foreground"
                  )}
                >
                  {passwordStrength.checks.number ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-current" />
                  )}
                  <span>Number</span>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 col-span-2",
                    passwordStrength.checks.special
                      ? "text-green-600"
                      : "text-muted-foreground"
                  )}
                >
                  {passwordStrength.checks.special ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-current" />
                  )}
                  <span>Special character (!@#$%^&*)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => markFieldTouched("confirmPassword")}
              className={cn(
                touchedFields.has("confirmPassword") &&
                  confirmPassword.length > 0 &&
                  !passwordsMatch &&
                  "border-destructive focus-visible:ring-destructive",
                passwordsMatch && "border-green-500 focus-visible:ring-green-500",
                "pr-10"
              )}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {touchedFields.has("confirmPassword") &&
            confirmPassword.length > 0 &&
            !passwordsMatch && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Passwords do not match
              </p>
            )}
          {passwordsMatch && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Passwords match
            </p>
          )}
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={!isFormValid || !passwordsMatch || isLoading}
          >
            {isLoading ? "Resetting Password..." : "Reset Password"}
          </Button>
        </div>
      </motion.form>

      <motion.div
        variants={itemVariants}
        className="mt-6 p-4 rounded-lg bg-muted/50 border border-border"
      >
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Security Note:</strong> After
          resetting your password, you'll be signed out of all devices and will
          need to sign in again with your new password.
        </p>
      </motion.div>
    </motion.div>
  );
}
