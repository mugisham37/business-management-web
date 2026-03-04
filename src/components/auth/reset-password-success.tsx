"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

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

interface ResetPasswordSuccessProps {
  onContinue: () => void;
  autoRedirectSeconds?: number;
}

export function ResetPasswordSuccess({
  onContinue,
  autoRedirectSeconds = 5,
}: ResetPasswordSuccessProps) {
  const [countdown, setCountdown] = React.useState(autoRedirectSeconds);

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onContinue();
    }
  }, [countdown, onContinue]);

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
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>

        <h2 className="text-3xl font-bold text-foreground mb-2">
          Password Reset Successful!
        </h2>
        <p className="text-sm text-muted-foreground">
          Your password has been successfully updated.
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-4 mb-6">
        <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
          <p className="text-sm text-center text-muted-foreground">
            You can now sign in with your new password
          </p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-3">
        <Button onClick={onContinue} className="w-full">
          Continue to Sign In
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}...
        </p>
      </motion.div>
    </motion.div>
  );
}
