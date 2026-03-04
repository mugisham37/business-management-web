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
import { PasswordResetContainer } from "@/components/auth/password-reset-container";
import { Chrome, Apple, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/useAuth";
import { useOnboardingForm } from "@/lib/hooks/useOnboardingForm";
import { apolloClient } from "@/lib/api/apollo-client";
import { REGISTER_FOUNDER_MUTATION } from "@/graphql/mutations/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";

type AuthMode = "signin" | "signup" | "forgot-password";

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
    validateAll,
  } = useOnboardingForm();

  const [mode, setMode] = React.useState<AuthMode>("signin");
  const [onboardingStep, setOnboardingStep] = React.useState(0);
  const [isLoadingSignIn, setIsLoadingSignIn] = React.useState(false);
  const [isLoadingSignUp, setIsLoadingSignUp] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isMobile, setIsMobile] = React.useState(false);
  const [showMobileSignup, setShowMobileSignup] = React.useState(false);

  // Detect mobile screen size
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check if current step is valid
  const isCurrentStepValid = React.useMemo(() => {
    switch (onboardingStep) {
      case 0:
        return validateStep1();
      case 1:
        return validateStep2();
      case 2:
        return validateStep3();
      default:
        return false;
    }
  }, [onboardingStep, validateStep1, validateStep2, validateStep3]);

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
      setShowMobileSignup(false);
    }
  }, [mode]);

  /**
   * Handle forgot password navigation
   */
  const handleForgotPassword = () => {
    setMode("forgot-password");
    setError(null);
  };

  /**
   * Handle back to sign in from forgot password
   */
  const handleBackToSignIn = () => {
    setMode("signin");
    setError(null);
  };

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
        
        // Business operations (auto-set role as owner)
        role: 'owner',
        businessType: formData.businessType,
        primaryActivities: formData.primaryActivities,
        businessStage: formData.businessStage,
        
        // Business goals
        businessGoals: formData.selectedGoals,
        timeline: formData.timeline,
        
        // Auto-detected preferences
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
    let errorMsg = "";
    
    switch (onboardingStep) {
      case 0:
        isValid = validateStep1();
        if (!isValid) {
          const missing = [];
          if (!formData.companyName) missing.push("Company Name");
          if (!formData.industry) missing.push("Industry");
          if (!formData.companySize) missing.push("Company Size");
          errorMsg = `Please complete: ${missing.join(", ")}`;
        }
        break;
      case 1:
        isValid = validateStep2();
        if (!isValid) {
          const missing = [];
          if (!formData.businessType) missing.push("Business Type");
          if (!formData.primaryActivities || formData.primaryActivities.length === 0) missing.push("Primary Activities");
          if (!formData.businessStage) missing.push("Business Stage");
          errorMsg = `Please complete: ${missing.join(", ")}`;
        }
        break;
      case 2:
        isValid = validateStep3();
        if (!isValid) {
          const missing = [];
          if (!formData.selectedGoals || formData.selectedGoals.length === 0) missing.push("Business Goals");
          if (!formData.timeline) missing.push("Timeline");
          errorMsg = `Please complete: ${missing.join(", ")}`;
        }
        break;
    }

    if (isValid) {
      setError(null);
      // On step 2 (last step), show mobile signup or trigger desktop signup
      if (onboardingStep === 2) {
        if (isMobile) {
          setShowMobileSignup(true);
        }
        // Desktop signup is handled by the SignUpForm component
      } else if (onboardingStep < 2) {
        setOnboardingStep((prev) => prev + 1);
      }
    } else {
      setError(errorMsg);
    }
  };

  const handleOnboardingPrev = () => {
    if (onboardingStep > 0) {
      setError(null);
      setOnboardingStep((prev) => prev - 1);
    }
  };

  const handleOnboardingStepChange = (step: number) => {
    // Only allow going to completed steps or current step
    if (step <= onboardingStep) {
      setError(null);
      setOnboardingStep(step);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-background p-4">
      {mode === "forgot-password" ? (
        <PasswordResetContainer onBackToSignIn={handleBackToSignIn} />
      ) : (
        <motion.div
          className="w-full max-w-6xl min-h-[700px] grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden shadow-xl border border-border"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {mode === "signin" ? (
            <>
              {/* Sign In: Form on mobile/tablet, both on desktop */}
              <div className="w-full min-h-[700px] bg-card flex flex-col items-center justify-center p-8 md:p-12">
                <RoleBasedSignIn
                  onSignUp={() => {
                    setMode("signup");
                    setError(null);
                  }}
                  onSignIn={handleSignIn}
                  onPinSignIn={handlePinSignIn}
                  onForgotPassword={handleForgotPassword}
                  isLoading={isLoadingSignIn}
                  error={error}
                />
              </div>
              {/* Preview: Hidden on mobile/tablet, visible on desktop */}
              <div className="hidden lg:block min-h-[700px]">
                <OnboardingSteps 
                  currentStep={onboardingStep}
                  isPreview={true}
                />
              </div>
            </>
          ) : (
          <>
            {/* Mobile: Show either onboarding OR signup form */}
            <div className="md:hidden w-full min-h-[700px]">
              {!showMobileSignup ? (
                <OnboardingForm
                  currentStep={onboardingStep}
                  onNext={handleOnboardingNext}
                  onPrev={handleOnboardingPrev}
                  onStepChange={handleOnboardingStepChange}
                  formData={formData}
                  onUpdateField={updateField}
                  isStepValid={isCurrentStepValid}
                  isMobile={isMobile}
                />
              ) : (
                <div className="bg-card flex flex-col items-center justify-center p-8 min-h-[700px]">
                  <MobileSignUpForm
                    onBack={() => setShowMobileSignup(false)}
                    onSignIn={() => {
                      setMode("signin");
                      setOnboardingStep(0);
                      setShowMobileSignup(false);
                      setError(null);
                      resetForm();
                    }}
                    onSubmit={handleSignUp}
                    isLoading={isLoadingSignUp}
                    formData={formData}
                    onUpdateField={updateField}
                    error={error}
                  />
                </div>
              )}
            </div>

            {/* Desktop: Show onboarding form on left */}
            <div className="hidden md:block w-full min-h-[700px]">
              <OnboardingForm
                currentStep={onboardingStep}
                onNext={handleOnboardingNext}
                onPrev={handleOnboardingPrev}
                onStepChange={handleOnboardingStepChange}
                formData={formData}
                onUpdateField={updateField}
                isStepValid={isCurrentStepValid}
                isMobile={isMobile}
              />
            </div>

            {/* Desktop: Show signup form on right */}
            <div className="hidden md:flex w-full min-h-[700px] bg-card flex-col items-center justify-center p-8 md:p-12">
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
                isStepValid={isCurrentStepValid}
                isOnboardingComplete={onboardingStep === 2 && isCurrentStepValid}
              />
            </div>
          </>
          )}
        </motion.div>
      )}
    </div>
  );
}

// Password strength calculator
function calculatePasswordStrength(password: string): {
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number;
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
} {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  let strength: 'weak' | 'medium' | 'strong' | 'very-strong' = 'weak';
  if (score >= 5) strength = 'very-strong';
  else if (score >= 4) strength = 'strong';
  else if (score >= 3) strength = 'medium';

  return { strength, score, checks };
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
  isStepValid,
  isOnboardingComplete,
}: {
  onSignIn: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  currentStep: number;
  formData: any;
  onUpdateField: (field: string, value: any) => void;
  error: string | null;
  isStepValid: boolean;
  isOnboardingComplete: boolean;
}) {
  const [touchedFields, setTouchedFields] = React.useState<Set<string>>(new Set());
  const [showPassword, setShowPassword] = React.useState(false);
  
  const passwordStrength = formData.password ? calculatePasswordStrength(formData.password) : null;
  
  const markFieldTouched = (field: string) => {
    setTouchedFields(prev => new Set(prev).add(field));
  };

  const isFieldInvalid = (field: string, value: any) => {
    if (!isOnboardingComplete) return false; // Don't show errors until onboarding is complete
    if (field === 'email') {
      return touchedFields.has(field) && (!value || !value.includes('@'));
    }
    if (field === 'password') {
      return touchedFields.has(field) && (!value || value.length < 8);
    }
    return touchedFields.has(field) && !value;
  };

  const isPersonalInfoComplete = !!(
    formData.firstName &&
    formData.lastName &&
    formData.email &&
    formData.email.includes('@') &&
    formData.password &&
    formData.password.length >= 8
  );

  const canSubmit = isOnboardingComplete && isPersonalInfoComplete;
  const fieldsDisabled = !isOnboardingComplete;

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
        {fieldsDisabled ? "Complete the onboarding steps first" : "Fill in your details to get started"}
      </motion.p>

      {error && (
        <motion.div variants={itemVariants} className="mb-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 mb-6">
        <Button variant="outline" type="button" disabled={fieldsDisabled}>
          <Chrome className="mr-2 h-4 w-4" />
          Google
        </Button>
        <Button variant="outline" type="button" disabled={fieldsDisabled}>
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
            <Label htmlFor="firstName" className="flex items-center gap-2">
              First Name
              {formData.firstName && isOnboardingComplete && <CheckCircle2 className="h-3 w-3 text-green-500" />}
            </Label>
            <Input
              id="firstName"
              type="text"
              placeholder="John"
              value={formData.firstName || ''}
              onChange={(e) => onUpdateField('firstName', e.target.value)}
              onBlur={() => markFieldTouched('firstName')}
              disabled={fieldsDisabled}
              className={cn(
                isFieldInvalid('firstName', formData.firstName) && "border-destructive focus-visible:ring-destructive",
                fieldsDisabled && "cursor-not-allowed opacity-60"
              )}
              required
            />
            {isFieldInvalid('firstName', formData.firstName) && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Required
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="flex items-center gap-2">
              Last Name
              {formData.lastName && isOnboardingComplete && <CheckCircle2 className="h-3 w-3 text-green-500" />}
            </Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              value={formData.lastName || ''}
              onChange={(e) => onUpdateField('lastName', e.target.value)}
              onBlur={() => markFieldTouched('lastName')}
              disabled={fieldsDisabled}
              className={cn(
                isFieldInvalid('lastName', formData.lastName) && "border-destructive focus-visible:ring-destructive",
                fieldsDisabled && "cursor-not-allowed opacity-60"
              )}
              required
            />
            {isFieldInvalid('lastName', formData.lastName) && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Required
              </p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-email" className="flex items-center gap-2">
            Email
            {formData.email && formData.email.includes('@') && isOnboardingComplete && <CheckCircle2 className="h-3 w-3 text-green-500" />}
          </Label>
          <Input
            id="signup-email"
            type="email"
            placeholder="john@company.com"
            value={formData.email || ''}
            onChange={(e) => onUpdateField('email', e.target.value)}
            onBlur={() => markFieldTouched('email')}
            disabled={fieldsDisabled}
            className={cn(
              isFieldInvalid('email', formData.email) && "border-destructive focus-visible:ring-destructive",
              fieldsDisabled && "cursor-not-allowed opacity-60"
            )}
            required
          />
          {!fieldsDisabled && !formData.email && (
            <p className="text-xs text-muted-foreground">
              e.g., john@company.com
            </p>
          )}
          {isFieldInvalid('email', formData.email) && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Please enter a valid email
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-password" className="flex items-center gap-2">
            Password
            {passwordStrength?.strength === 'very-strong' && isOnboardingComplete && <CheckCircle2 className="h-3 w-3 text-green-500" />}
          </Label>
          <div className="relative">
            <Input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              value={formData.password || ''}
              onChange={(e) => onUpdateField('password', e.target.value)}
              onBlur={() => markFieldTouched('password')}
              disabled={fieldsDisabled}
              className={cn(
                isFieldInvalid('password', formData.password) && "border-destructive focus-visible:ring-destructive",
                fieldsDisabled && "cursor-not-allowed opacity-60",
                "pr-10"
              )}
              required
              minLength={8}
            />
            {!fieldsDisabled && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            )}
          </div>
          
          {/* Password Strength Indicator */}
          {formData.password && isOnboardingComplete && passwordStrength && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    className={cn(
                      "h-full transition-colors",
                      passwordStrength.strength === 'weak' && "bg-red-500",
                      passwordStrength.strength === 'medium' && "bg-amber-500",
                      passwordStrength.strength === 'strong' && "bg-blue-500",
                      passwordStrength.strength === 'very-strong' && "bg-green-500"
                    )}
                  />
                </div>
                <span className={cn(
                  "text-xs font-medium capitalize",
                  passwordStrength.strength === 'weak' && "text-red-500",
                  passwordStrength.strength === 'medium' && "text-amber-500",
                  passwordStrength.strength === 'strong' && "text-blue-500",
                  passwordStrength.strength === 'very-strong' && "text-green-500"
                )}>
                  {passwordStrength.strength.replace('-', ' ')}
                </span>
              </div>
              
              {/* Password Requirements Checklist */}
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className={cn(
                  "flex items-center gap-1",
                  passwordStrength.checks.length ? "text-green-600" : "text-muted-foreground"
                )}>
                  {passwordStrength.checks.length ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-current" />
                  )}
                  <span>8+ characters</span>
                </div>
                <div className={cn(
                  "flex items-center gap-1",
                  passwordStrength.checks.uppercase ? "text-green-600" : "text-muted-foreground"
                )}>
                  {passwordStrength.checks.uppercase ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-current" />
                  )}
                  <span>Uppercase</span>
                </div>
                <div className={cn(
                  "flex items-center gap-1",
                  passwordStrength.checks.lowercase ? "text-green-600" : "text-muted-foreground"
                )}>
                  {passwordStrength.checks.lowercase ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-current" />
                  )}
                  <span>Lowercase</span>
                </div>
                <div className={cn(
                  "flex items-center gap-1",
                  passwordStrength.checks.number ? "text-green-600" : "text-muted-foreground"
                )}>
                  {passwordStrength.checks.number ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-current" />
                  )}
                  <span>Number</span>
                </div>
                <div className={cn(
                  "flex items-center gap-1 col-span-2",
                  passwordStrength.checks.special ? "text-green-600" : "text-muted-foreground"
                )}>
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
          
          {isFieldInvalid('password', formData.password) && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Password must be at least 8 characters
            </p>
          )}
        </div>
        
        <motion.div 
          variants={itemVariants}
          className={cn(
            "pt-2 pb-2 px-4 rounded-lg border transition-all",
            !isOnboardingComplete
              ? "bg-muted/30 border-muted" 
              : !isPersonalInfoComplete
              ? "bg-amber-500/5 border-amber-500/20"
              : "bg-green-500/5 border-green-500/20"
          )}
        >
          <p className="text-xs text-center flex items-center justify-center gap-2">
            {!isOnboardingComplete ? (
              <>
                <AlertCircle className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Complete steps 1-3 on the left first</span>
              </>
            ) : !isPersonalInfoComplete ? (
              <>
                <AlertCircle className="h-3 w-3 text-amber-600" />
                <span className="text-amber-600">Fill in all fields above</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                <span className="text-green-600">Ready to create your account!</span>
              </>
            )}
          </p>
        </motion.div>

        <Button 
          type="submit" 
          className="w-full" 
          isLoading={isLoading}
          disabled={!canSubmit || isLoading}
        >
          {isLoading ? "Creating Account..." : "Sign Up Now"}
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

// Mobile Sign Up Form Component
function MobileSignUpForm({
  onBack,
  onSignIn,
  onSubmit,
  isLoading,
  formData,
  onUpdateField,
  error,
}: {
  onBack: () => void;
  onSignIn: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  formData: any;
  onUpdateField: (field: string, value: any) => void;
  error: string | null;
}) {
  const [touchedFields, setTouchedFields] = React.useState<Set<string>>(new Set());
  const [showPassword, setShowPassword] = React.useState(false);
  
  const passwordStrength = formData.password ? calculatePasswordStrength(formData.password) : null;
  
  const markFieldTouched = (field: string) => {
    setTouchedFields(prev => new Set(prev).add(field));
  };

  const isFieldInvalid = (field: string, value: any) => {
    if (field === 'email') {
      return touchedFields.has(field) && (!value || !value.includes('@'));
    }
    if (field === 'password') {
      return touchedFields.has(field) && (!value || value.length < 8);
    }
    return touchedFields.has(field) && !value;
  };

  const isPersonalInfoComplete = !!(
    formData.firstName &&
    formData.lastName &&
    formData.email &&
    formData.email.includes('@') &&
    formData.password &&
    formData.password.length >= 8
  );

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
        Back to onboarding
      </motion.button>

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
        Fill in your details to get started
      </motion.p>

      {error && (
        <motion.div variants={itemVariants} className="mb-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
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
            <Label htmlFor="mobile-firstName" className="flex items-center gap-2">
              First Name
              {formData.firstName && <CheckCircle2 className="h-3 w-3 text-green-500" />}
            </Label>
            <Input
              id="mobile-firstName"
              type="text"
              placeholder="John"
              value={formData.firstName || ''}
              onChange={(e) => onUpdateField('firstName', e.target.value)}
              onBlur={() => markFieldTouched('firstName')}
              className={cn(
                isFieldInvalid('firstName', formData.firstName) && "border-destructive focus-visible:ring-destructive"
              )}
              required
            />
            {isFieldInvalid('firstName', formData.firstName) && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Required
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobile-lastName" className="flex items-center gap-2">
              Last Name
              {formData.lastName && <CheckCircle2 className="h-3 w-3 text-green-500" />}
            </Label>
            <Input
              id="mobile-lastName"
              type="text"
              placeholder="Doe"
              value={formData.lastName || ''}
              onChange={(e) => onUpdateField('lastName', e.target.value)}
              onBlur={() => markFieldTouched('lastName')}
              className={cn(
                isFieldInvalid('lastName', formData.lastName) && "border-destructive focus-visible:ring-destructive"
              )}
              required
            />
            {isFieldInvalid('lastName', formData.lastName) && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Required
              </p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="mobile-email" className="flex items-center gap-2">
            Email
            {formData.email && formData.email.includes('@') && <CheckCircle2 className="h-3 w-3 text-green-500" />}
          </Label>
          <Input
            id="mobile-email"
            type="email"
            placeholder="john@company.com"
            value={formData.email || ''}
            onChange={(e) => onUpdateField('email', e.target.value)}
            onBlur={() => markFieldTouched('email')}
            className={cn(
              isFieldInvalid('email', formData.email) && "border-destructive focus-visible:ring-destructive"
            )}
            required
          />
          {!formData.email && (
            <p className="text-xs text-muted-foreground">
              e.g., john@company.com
            </p>
          )}
          {isFieldInvalid('email', formData.email) && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Please enter a valid email
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="mobile-password" className="flex items-center gap-2">
            Password
            {passwordStrength?.strength === 'very-strong' && <CheckCircle2 className="h-3 w-3 text-green-500" />}
          </Label>
          <div className="relative">
            <Input
              id="mobile-password"
              type={showPassword ? "text" : "password"}
              value={formData.password || ''}
              onChange={(e) => onUpdateField('password', e.target.value)}
              onBlur={() => markFieldTouched('password')}
              className={cn(
                isFieldInvalid('password', formData.password) && "border-destructive focus-visible:ring-destructive",
                "pr-10"
              )}
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {formData.password && passwordStrength && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    className={cn(
                      "h-full transition-colors",
                      passwordStrength.strength === 'weak' && "bg-red-500",
                      passwordStrength.strength === 'medium' && "bg-amber-500",
                      passwordStrength.strength === 'strong' && "bg-blue-500",
                      passwordStrength.strength === 'very-strong' && "bg-green-500"
                    )}
                  />
                </div>
                <span className={cn(
                  "text-xs font-medium capitalize",
                  passwordStrength.strength === 'weak' && "text-red-500",
                  passwordStrength.strength === 'medium' && "text-amber-500",
                  passwordStrength.strength === 'strong' && "text-blue-500",
                  passwordStrength.strength === 'very-strong' && "text-green-500"
                )}>
                  {passwordStrength.strength.replace('-', ' ')}
                </span>
              </div>
              
              {/* Password Requirements Checklist */}
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className={cn(
                  "flex items-center gap-1",
                  passwordStrength.checks.length ? "text-green-600" : "text-muted-foreground"
                )}>
                  {passwordStrength.checks.length ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-current" />
                  )}
                  <span>8+ characters</span>
                </div>
                <div className={cn(
                  "flex items-center gap-1",
                  passwordStrength.checks.uppercase ? "text-green-600" : "text-muted-foreground"
                )}>
                  {passwordStrength.checks.uppercase ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-current" />
                  )}
                  <span>Uppercase</span>
                </div>
                <div className={cn(
                  "flex items-center gap-1",
                  passwordStrength.checks.lowercase ? "text-green-600" : "text-muted-foreground"
                )}>
                  {passwordStrength.checks.lowercase ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-current" />
                  )}
                  <span>Lowercase</span>
                </div>
                <div className={cn(
                  "flex items-center gap-1",
                  passwordStrength.checks.number ? "text-green-600" : "text-muted-foreground"
                )}>
                  {passwordStrength.checks.number ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-current" />
                  )}
                  <span>Number</span>
                </div>
                <div className={cn(
                  "flex items-center gap-1 col-span-2",
                  passwordStrength.checks.special ? "text-green-600" : "text-muted-foreground"
                )}>
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
          
          {isFieldInvalid('password', formData.password) && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Password must be at least 8 characters
            </p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          isLoading={isLoading}
          disabled={!isPersonalInfoComplete || isLoading}
        >
          {isLoading ? "Creating Account..." : "Sign Up Now"}
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
