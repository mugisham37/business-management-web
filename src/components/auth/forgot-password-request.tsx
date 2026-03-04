"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Mail, AlertCircle } from "lucide-react";
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

interface ForgotPasswordRequestProps {
  onBack: () => void;
  onSubmit: (email: string, organizationId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function ForgotPasswordRequest({
  onBack,
  onSubmit,
  isLoading,
  error,
}: ForgotPasswordRequestProps) {
  const [email, setEmail] = React.useState("");
  const [organizationId, setOrganizationId] = React.useState("");
  const [touchedFields, setTouchedFields] = React.useState<Set<string>>(new Set());

  const markFieldTouched = (field: string) => {
    setTouchedFields((prev) => new Set(prev).add(field));
  };

  const isEmailValid = email.includes("@") && email.includes(".");
  const isFormValid = isEmailValid && organizationId.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    await onSubmit(email, organizationId);
  };

  return (
    <motion.div
      className="w-full max-w-sm"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.button
        variants={itemVariants}
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to sign in
      </motion.button>

      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="w-6 h-6 text-primary" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Forgot Password?
        </h2>
        <p className="text-sm text-muted-foreground">
          No worries! Enter your email and organization ID, and we'll send you
          instructions to reset your password.
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
          <Label htmlFor="reset-org-id">Organization ID</Label>
          <Input
            id="reset-org-id"
            type="text"
            placeholder="ORG-12345"
            value={organizationId}
            onChange={(e) => setOrganizationId(e.target.value)}
            onBlur={() => markFieldTouched("organizationId")}
            className={cn(
              touchedFields.has("organizationId") &&
                !organizationId &&
                "border-destructive focus-visible:ring-destructive"
            )}
            required
            disabled={isLoading}
          />
          {touchedFields.has("organizationId") && !organizationId && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Organization ID is required
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reset-email">Email Address</Label>
          <Input
            id="reset-email"
            type="email"
            placeholder="founder@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => markFieldTouched("email")}
            className={cn(
              touchedFields.has("email") &&
                !isEmailValid &&
                "border-destructive focus-visible:ring-destructive"
            )}
            required
            disabled={isLoading}
          />
          {touchedFields.has("email") && !isEmailValid && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Please enter a valid email address
            </p>
          )}
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </div>
      </motion.form>

      <motion.div
        variants={itemVariants}
        className="mt-6 p-4 rounded-lg bg-muted/50 border border-border"
      >
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Security Note:</strong> For your
          protection, we'll only send reset instructions if this email is
          registered with the provided organization.
        </p>
      </motion.div>
    </motion.div>
  );
}
