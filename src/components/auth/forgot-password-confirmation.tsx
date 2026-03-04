"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, CheckCircle2, AlertCircle, Clock } from "lucide-react";
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

interface ForgotPasswordConfirmationProps {
  email: string;
  onResend: () => Promise<void>;
  onBackToSignIn: () => void;
  isResending: boolean;
  error: string | null;
}

export function ForgotPasswordConfirmation({
  email,
  onResend,
  onBackToSignIn,
  isResending,
  error,
}: ForgotPasswordConfirmationProps) {
  const [countdown, setCountdown] = React.useState(60);
  const [canResend, setCanResend] = React.useState(false);

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResend = async () => {
    setCanResend(false);
    setCountdown(60);
    await onResend();
  };

  return (
    <motion.div
      className="w-full max-w-sm"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="mb-6 text-center">
        <motion.div
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 text-green-500 mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <Mail className="w-10 h-10" />
        </motion.div>

        <h2 className="text-3xl font-bold text-foreground mb-2">
          Check Your Email
        </h2>
        <p className="text-sm text-muted-foreground">
          We've sent password reset instructions to
        </p>
        <p className="text-sm font-medium text-foreground mt-1">{email}</p>
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="mb-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="space-y-4 mb-6">
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm">
              <p className="text-foreground font-medium">What to do next:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Check your inbox for an email from us</li>
                <li>• Click the reset link in the email</li>
                <li>• The link expires in 15 minutes</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="space-y-1 text-sm">
              <p className="text-foreground font-medium">Didn't receive it?</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Check your spam or junk folder</li>
                <li>• Make sure the email address is correct</li>
                <li>• Wait a few minutes for delivery</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-3">
        <Button
          onClick={handleResend}
          variant="outline"
          className="w-full"
          disabled={!canResend || isResending}
          isLoading={isResending}
        >
          {isResending ? (
            "Resending..."
          ) : canResend ? (
            "Resend Email"
          ) : (
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Resend in {countdown}s
            </span>
          )}
        </Button>

        <Button onClick={onBackToSignIn} variant="ghost" className="w-full">
          Back to Sign In
        </Button>
      </motion.div>
    </motion.div>
  );
}
