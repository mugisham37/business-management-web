"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OnboardingSteps } from "@/components/auth/onboarding-steps";
import { OnboardingForm } from "@/components/auth/onboarding-form";
import { RoleBasedSignIn } from "@/components/auth/role-based-signin";
import { Chrome, Apple } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useOnboardingForm } from "@/lib/hooks/useOnboardingForm";
import { apolloClient } from "@/lib/api/apollo-client";
import { REGISTER_FOUNDER_MUTATION } from "@/graphql/mutations/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const router = useRouter();
  const { login, loginWithPin } = useAuth();
  const {
    formData,
    updateField,
    updateFields,
    resetForm,
    validateStep1,
    validateStep2,
    validateStep3,
    validateStep4,
    validateAll,
  } = useOnboardingForm();

  const [mode, setMode] = React.useState<AuthMode>("signin");
  const [onboardingStep, setOnboardingStep] = React.useState(0);
  const [isLoadingSignIn, setIsLoadingSignIn] = React.useState(false);
  const [isLoadingSignUp, setIsLoadingSignUp] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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

  /**
   * Handle sign-in with email and password
   */
  const handleSignIn = async (
    email: string,
    password: string,
    organizationId: string
  ) => {
    try {
      setIsLoadingSignIn(true);
      setError(null);
      
      await login(email, password, organizationId);
      
      // Redirect to dashboard on success
      router.push("/dashboard");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Sign in failed";
      setError(errorMessage);
      console.error("Sign in error:", err);
    } finally {
      setIsLoadingSignIn(false);
    }
  };

  /**
   * Handle sign-in with PIN
   */
  const handlePinSignIn = async (
    email: string,
    pin: string,
    organizationId: string
  ) => {
    try {
      setIsLoadingSignIn(true);
      setError(null);
      
      await loginWithPin(email, pin, organizationId);
      
      // Redirect to dashboard on success
      router.push("/dashboard");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "PIN sign in failed";
      setError(errorMessage);
      console.error("PIN sign in error:", err);
    } finally {
      setIsLoadingSignIn(false);
    }
  };

  /**
   * Handle sign-up (founder registration with organization creation)
   */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all steps are complete
    if (!validateAll()) {
      setError("Please complete all onboarding steps");
      return;
    }

    // Validate personal info
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setIsLoadingSignUp(true);
      setError(null);

      // Prepare registration input
      const input = {
        // Personal information
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        
        // Company information
        companyName: formData.companyName,
        industry: formData.industry,
        companySize: formData.companySize,
        website: formData.website || null,
        
        // Role and department
        role: formData.role,
        department: formData.department,
        
        // Business goals
        businessGoals: formData.selectedGoals,
        timeline: formData.timeline,
        
        // Preferences
        currency: formData.currency,
        timezone: formData.timezone,
        emailNotifications: formData.emailNotifications,
        weeklyReports: formData.weeklyReports,
        marketingUpdates: formData.marketingUpdates,
      };

      // Call registration mutation
      const { data } = await apolloClient.mutate<{
        registerFounder: {
          accessToken: string;
          refreshToken: string;
          user: any;
          organization: {
            id: string;
            name: string;
          };
        };
      }>({
        mutation: REGISTER_FOUNDER_MUTATION,
        variables: { input },
      });

      if (data?.registerFounder) {
        // Registration successful - tokens are automatically stored by useAuth
        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        throw new Error("Registration failed - no data returned");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed";
      setError(errorMessage);
      console.error("Sign up error:", err);
    } finally {
      setIsLoadingSignUp(false);
    }
  };

  const handleOnboardingNext = () => {
    // Validate current step before advancing
    let isValid = true;
    
    switch (onboardingStep) {
      case 0:
        isValid = validateStep1();
        if (!isValid) setError("Please complete all company details");
        break;
      case 1:
        isValid = validateStep2();
        if (!isValid) setError("Please select your role and department");
        break;
      case 2:
        isValid = validateStep3();
        if (!isValid) setError("Please select at least one goal and timeline");
        break;
      case 3:
        isValid = validateStep4();
        break;
    }

    if (isValid) {
      setError(null);
      if (onboardingStep < 3) {
        setOnboardingStep((prev) => prev + 1);
      }
    }
  };

  const handleOnboardingPrev = () => {
    if (onboardingStep > 0) {
      setError(null);
      setOnboardingStep((prev) => prev - 1);
    }
  };

  const handleOnboardingStepChange = (step: number) => {
    setError(null);
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
                onSignUp={() => {
                  setMode("signup");
                  setError(null);
                }}
                onSignIn={handleSignIn}
                onPinSignIn={handlePinSignIn}
                isLoading={isLoadingSignIn}
                error={error}
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
                formData={formData}
                onUpdateField={updateField}
              />
            </div>
            <div className="w-full h-full bg-card flex flex-col items-center justify-center p-8 md:p-12 order-1 lg:order-2">
              <SignUpForm
                onSignIn={() => {
                  setMode("signin");
                  setOnboardingStep(0);
                  setError(null);
                  resetForm();
                }}
                onSubmit={handleSignUp}
                isLoading={isLoadingSignUp}
                currentStep={onboardingStep}
                formData={formData}
                onUpdateField={updateField}
                error={error}
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
  formData,
  onUpdateField,
  error,
}: {
  onSignIn: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  currentStep: number;
  formData: any;
  onUpdateField: (field: string, value: any) => void;
  error: string | null;
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

      {error && (
        <motion.div variants={itemVariants} className="mb-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

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
            <Input
              id="firstName"
              type="text"
              value={formData.firstName || ''}
              onChange={(e) => onUpdateField('firstName', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              value={formData.lastName || ''}
              onChange={(e) => onUpdateField('lastName', e.target.value)}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            type="email"
            placeholder="name@example.com"
            value={formData.email || ''}
            onChange={(e) => onUpdateField('email', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <Input
            id="signup-password"
            type="password"
            value={formData.password || ''}
            onChange={(e) => onUpdateField('password', e.target.value)}
            required
            minLength={8}
          />
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
          disabled={currentStep < 3 || isLoading}
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
