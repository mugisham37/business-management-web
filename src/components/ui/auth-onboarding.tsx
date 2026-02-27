"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OnboardingSteps } from "@/components/ui/onboarding-steps";
import { OnboardingForm } from "@/components/ui/onboarding-form";
import { RoleBasedSignIn } from "@/components/ui/role-based-signin";
import { Chrome, Apple } from "lucide-react";

type AuthMode = "signin" | "signup";

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

export function AuthOnboarding() {
  const [mode, setMode] = React.useState<AuthMode>("signin");
  const [onboardingStep, setOnboardingStep] = React.useState(0);
  const [isLoadingSignIn, setIsLoadingSignIn] = React.useState(false);
  const [isLoadingSignUp, setIsLoadingSignUp] = React.useState(false);

  // Auto-advance preview steps during sign in
  React.useEffect(() => {
    if (mode === "signin") {
      const timer = setInterval(() => {
        setOnboardingStep((prev) => (prev === 3 ? 0 : prev + 1));
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [mode]);

  // Reset step when switching to signup
  React.useEffect(() => {
    if (mode === "signup") {
      setOnboardingStep(0);
    }
  }, [mode]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingSignIn(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoadingSignIn(false);
    // Handle sign in logic
    console.log("Sign in successful - redirect to dashboard");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingSignUp(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoadingSignUp(false);
    // Handle sign up logic
    console.log("Account created successfully - redirect to dashboard");
  };

  const handleOnboardingNext = () => {
    if (onboardingStep < 3) {
      setOnboardingStep((prev) => prev + 1);
    } else {
      // Complete onboarding and create account
      console.log("Onboarding complete - creating account");
      // This would trigger the sign up form submission
    }
  };

  const handleOnboardingPrev = () => {
    if (onboardingStep > 0) {
      setOnboardingStep((prev) => prev - 1);
    }
  };

  const handleOnboardingStepChange = (step: number) => {
    setOnboardingStep(step);
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        className="w-full max-w-6xl h-[700px] grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden shadow-xl border border-border"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {mode === "signin" ? (
          <>
            {/* Sign In: Form Left, Onboarding Steps Preview Right */}
            <div className="w-full h-full bg-card flex flex-col items-center justify-center p-8 md:p-12 order-2 lg:order-1">
              <RoleBasedSignIn
                onSignUp={() => setMode("signup")}
                isLoading={isLoadingSignIn}
              />
            </div>
            <div className="hidden lg:block order-1 lg:order-2">
              <OnboardingSteps 
                currentStep={onboardingStep}
                isPreview={true}
              />
            </div>
          </>
        ) : (
          <>
            {/* Sign Up: Onboarding Form Left, Create Account Right */}
            <div className="w-full h-full order-2 lg:order-1">
              <OnboardingForm
                currentStep={onboardingStep}
                onNext={handleOnboardingNext}
                onPrev={handleOnboardingPrev}
                onStepChange={handleOnboardingStepChange}
              />
            </div>
            <div className="w-full h-full bg-card flex flex-col items-center justify-center p-8 md:p-12 order-1 lg:order-2">
              <SignUpForm
                onSignIn={() => {
                  setMode("signin");
                  setOnboardingStep(0);
                }}
                onSubmit={handleSignUp}
                isLoading={isLoadingSignUp}
                currentStep={onboardingStep}
              />
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

// Sign Up Form Component
function SignUpForm({
  onSignIn,
  onSubmit,
  isLoading,
  currentStep,
}: {
  onSignIn: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  currentStep: number;
}) {
  return (
    <motion.div
      className="w-full max-w-sm"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1
        variants={itemVariants}
        className="text-3xl font-bold tracking-tight mb-2 text-foreground"
      >
        Create Account
      </motion.h1>
      <motion.p
        variants={itemVariants}
        className="text-muted-foreground mb-8"
      >
        Complete the onboarding to get started
      </motion.p>

      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 mb-6">
        <Button variant="outline" type="button">
          <Chrome className="mr-2 h-4 w-4" />
          Google
        </Button>
        <Button variant="outline" type="button">
          <Apple className="mr-2 h-4 w-4" />
          Apple
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </motion.div>

      <motion.form variants={itemVariants} onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" type="text" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" type="text" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            type="email"
            placeholder="name@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <Input id="signup-password" type="password" required />
        </div>
        
        <motion.div 
          variants={itemVariants}
          className="pt-2 pb-2 px-4 rounded-lg bg-primary/5 border border-primary/10"
        >
          <p className="text-xs text-muted-foreground text-center">
            {currentStep === 3 
              ? "Complete the form to create your account"
              : "Fill in the onboarding steps on the left"}
          </p>
        </motion.div>

        <Button 
          type="submit" 
          className="w-full" 
          isLoading={isLoading}
          disabled={currentStep < 3}
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>
      </motion.form>

      <motion.p
        variants={itemVariants}
        className="text-center text-sm text-muted-foreground mt-6"
      >
        Already have an account?{" "}
        <button
          onClick={onSignIn}
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </button>
      </motion.p>
    </motion.div>
  );
}
