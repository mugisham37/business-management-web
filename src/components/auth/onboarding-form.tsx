"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

interface OnboardingFormProps {
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onStepChange: (step: number) => void;
  className?: string;
  formData: any;
  onUpdateField: (field: string, value: any) => void;
  isStepValid?: boolean;
  isMobile?: boolean;
}

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

export function OnboardingForm({
  currentStep,
  onNext,
  onPrev,
  onStepChange,
  className,
  formData,
  onUpdateField,
  isStepValid = true,
  isMobile = false,
}: OnboardingFormProps) {
  const totalSteps = 3; // Always 3 steps now
  const progress = ((currentStep + 1) / totalSteps) * 100;
  
  // Track field errors for visual feedback
  const [touchedFields, setTouchedFields] = React.useState<Set<string>>(new Set());
  
  const markFieldTouched = (field: string) => {
    setTouchedFields(prev => new Set(prev).add(field));
  };

  return (
    <div className={cn("w-full h-full bg-card p-8 md:p-12 flex flex-col", className)}>
      {/* Header with Progress */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold text-foreground">
            Complete Your Profile
          </h2>
          <span className="text-sm text-muted-foreground font-medium">
            Step {currentStep + 1}/{totalSteps}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>

        {/* Step Indicators */}
        <div className="flex gap-2 mt-4">
          {Array.from({ length: totalSteps }).map((_, step) => (
            <button
              key={step}
              onClick={() => step <= currentStep && onStepChange(step)}
              disabled={step > currentStep}
              className={cn(
                "flex-1 h-1 rounded-full transition-all duration-300",
                step === currentStep
                  ? "bg-primary"
                  : step < currentStep
                  ? "bg-primary/50 cursor-pointer hover:bg-primary/70"
                  : "bg-border cursor-not-allowed"
              )}
              aria-label={`Go to step ${step + 1}`}
            />
          ))}
        </div>
      </motion.div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <Step1 
              key="step1" 
              formData={formData} 
              onUpdateField={onUpdateField}
              touchedFields={touchedFields}
              markFieldTouched={markFieldTouched}
            />
          )}
          {currentStep === 1 && (
            <Step2 
              key="step2" 
              formData={formData} 
              onUpdateField={onUpdateField}
              touchedFields={touchedFields}
              markFieldTouched={markFieldTouched}
            />
          )}
          {currentStep === 2 && (
            <Step3 
              key="step3" 
              formData={formData} 
              onUpdateField={onUpdateField}
              touchedFields={touchedFields}
              markFieldTouched={markFieldTouched}
              isMobile={isMobile}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3 mt-6"
      >
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={currentStep === 0}
          className={cn(
            currentStep === 2 && !isMobile ? "w-full" : "flex-1"
          )}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        {/* Only show Continue button on steps 1-2, or on mobile for step 3 */}
        {(currentStep < 2 || isMobile) && (
          <Button 
            onClick={onNext} 
            className="flex-1"
            disabled={!isStepValid}
          >
            {currentStep === 2 ? "Continue to Sign Up" : "Continue"}
            {currentStep !== 2 && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        )}
      </motion.div>
    </div>
  );
}

// Step 1: Company Information
function Step1({ 
  formData, 
  onUpdateField,
  touchedFields,
  markFieldTouched 
}: { 
  formData: any; 
  onUpdateField: (field: string, value: any) => void;
  touchedFields: Set<string>;
  markFieldTouched: (field: string) => void;
}) {
  const isFieldInvalid = (field: string, value: any) => {
    return touchedFields.has(field) && !value;
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="space-y-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-1">Company Details</h3>
        <p className="text-sm text-muted-foreground">Tell us about your business</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="companyName" className="flex items-center gap-2">
            Company Name
            {formData.companyName && <CheckCircle2 className="h-3 w-3 text-green-500" />}
          </Label>
          <Input
            id="companyName"
            type="text"
            placeholder="Acme Corporation"
            value={formData.companyName || ''}
            onChange={(e) => onUpdateField('companyName', e.target.value)}
            onBlur={() => markFieldTouched('companyName')}
            className={cn(
              isFieldInvalid('companyName', formData.companyName) && "border-destructive focus-visible:ring-destructive"
            )}
            required
          />
          {isFieldInvalid('companyName', formData.companyName) && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Company name is required
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry" className="flex items-center gap-2">
            Industry
            {formData.industry && <CheckCircle2 className="h-3 w-3 text-green-500" />}
          </Label>
          <select
            id="industry"
            value={formData.industry || ''}
            onChange={(e) => onUpdateField('industry', e.target.value)}
            onBlur={() => markFieldTouched('industry')}
            className={cn(
              "flex h-9 w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50",
              isFieldInvalid('industry', formData.industry) && "border-destructive focus-visible:ring-destructive"
            )}
          >
            <option value="">Select industry</option>
            <option value="technology">Technology</option>
            <option value="retail">Retail</option>
            <option value="healthcare">Healthcare</option>
            <option value="finance">Finance</option>
            <option value="education">Education</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="other">Other</option>
          </select>
          {isFieldInvalid('industry', formData.industry) && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Please select an industry
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="companySize" className="flex items-center gap-2">
            Company Size
            {formData.companySize && <CheckCircle2 className="h-3 w-3 text-green-500" />}
          </Label>
          <select
            id="companySize"
            value={formData.companySize || ''}
            onChange={(e) => onUpdateField('companySize', e.target.value)}
            onBlur={() => markFieldTouched('companySize')}
            className={cn(
              "flex h-9 w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50",
              isFieldInvalid('companySize', formData.companySize) && "border-destructive focus-visible:ring-destructive"
            )}
          >
            <option value="">Select size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-500">201-500 employees</option>
            <option value="500+">500+ employees</option>
          </select>
          {isFieldInvalid('companySize', formData.companySize) && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Please select company size
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website (Optional)</Label>
          <Input
            id="website"
            type="url"
            placeholder="https://example.com"
            value={formData.website || ''}
            onChange={(e) => onUpdateField('website', e.target.value)}
          />
        </div>
      </div>
    </motion.div>
  );
}

// Step 2: Business Operations
function Step2({ 
  formData, 
  onUpdateField,
  touchedFields,
  markFieldTouched 
}: { 
  formData: any; 
  onUpdateField: (field: string, value: any) => void;
  touchedFields: Set<string>;
  markFieldTouched: (field: string) => void;
}) {
  const businessTypes = [
    { id: "product", title: "Product", subtitle: "Physical goods" },
    { id: "service", title: "Service", subtitle: "Consulting & Agency" },
    { id: "retail", title: "Retail", subtitle: "E-commerce & Stores" },
    { id: "saas", title: "SaaS", subtitle: "Software & Tech" },
    { id: "manufacturing", title: "Manufacturing", subtitle: "Production & Supply" },
    { id: "hybrid", title: "Hybrid", subtitle: "Mixed Business" },
  ];

  const activities = [
    { id: "sales", label: "Sales" },
    { id: "clients", label: "Clients" },
    { id: "projects", label: "Projects" },
    { id: "invoicing", label: "Invoicing" },
    { id: "inventory", label: "Inventory" },
    { id: "reports", label: "Reports" },
    { id: "tasks", label: "Tasks" },
    { id: "scheduling", label: "Scheduling" },
  ];

  const stages = [
    { id: "starting", label: "Starting", sublabel: "0-6mo" },
    { id: "early", label: "Early", sublabel: "6mo-2yr" },
    { id: "growing", label: "Growing", sublabel: "2-5yr" },
    { id: "established", label: "Established", sublabel: "5yr+" },
  ];

  const selectedActivities = formData.primaryActivities || [];

  const toggleActivity = (activityId: string) => {
    const newActivities = selectedActivities.includes(activityId)
      ? selectedActivities.filter((id: string) => id !== activityId)
      : selectedActivities.length < 3
      ? [...selectedActivities, activityId]
      : selectedActivities;
    onUpdateField('primaryActivities', newActivities);
    markFieldTouched('primaryActivities');
  };

  const isFieldInvalid = (field: string, value: any) => {
    if (field === 'primaryActivities') {
      return touchedFields.has(field) && (!value || value.length === 0);
    }
    return touchedFields.has(field) && !value;
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="space-y-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-1">Business Operations</h3>
        <p className="text-sm text-muted-foreground">Tell us how your business operates</p>
      </div>

      <div className="space-y-5">
        {/* Business Type */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            Business Type
            {formData.businessType && <CheckCircle2 className="h-3 w-3 text-green-500" />}
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {businessTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  onUpdateField('businessType', type.id);
                  markFieldTouched('businessType');
                }}
                className={cn(
                  "p-3 rounded-lg border-2 transition-all text-left",
                  formData.businessType === type.id
                    ? "border-primary bg-primary/5"
                    : isFieldInvalid('businessType', formData.businessType)
                    ? "border-destructive hover:border-destructive/70"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="text-sm font-medium text-foreground mb-0.5">
                  {type.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  {type.subtitle}
                </div>
              </button>
            ))}
          </div>
          {isFieldInvalid('businessType', formData.businessType) && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Please select a business type
            </p>
          )}
        </div>

        {/* Primary Activities */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            What will you manage? (Select up to 3)
            {selectedActivities.length > 0 && <CheckCircle2 className="h-3 w-3 text-green-500" />}
          </Label>
          <div className="flex flex-wrap gap-2">
            {activities.map((activity) => (
              <button
                key={activity.id}
                type="button"
                onClick={() => toggleActivity(activity.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  selectedActivities.includes(activity.id)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {activity.label}
              </button>
            ))}
          </div>
          {isFieldInvalid('primaryActivities', selectedActivities) && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Please select at least one activity
            </p>
          )}
        </div>

        {/* Business Stage */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            Where are you in your journey?
            {formData.businessStage && <CheckCircle2 className="h-3 w-3 text-green-500" />}
          </Label>
          <div className="grid grid-cols-4 gap-2">
            {stages.map((stage) => (
              <button
                key={stage.id}
                type="button"
                onClick={() => {
                  onUpdateField('businessStage', stage.id);
                  markFieldTouched('businessStage');
                }}
                className={cn(
                  "p-3 rounded-lg border-2 transition-all text-center",
                  formData.businessStage === stage.id
                    ? "border-primary bg-primary/5"
                    : isFieldInvalid('businessStage', formData.businessStage)
                    ? "border-destructive hover:border-destructive/70"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="text-xs font-medium text-foreground mb-0.5">
                  {stage.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stage.sublabel}
                </div>
              </button>
            ))}
          </div>
          {isFieldInvalid('businessStage', formData.businessStage) && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Please select your business stage
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Step 3: Business Goals
function Step3({ 
  formData, 
  onUpdateField,
  touchedFields,
  markFieldTouched,
  isMobile = false
}: { 
  formData: any; 
  onUpdateField: (field: string, value: any) => void;
  touchedFields: Set<string>;
  markFieldTouched: (field: string) => void;
  isMobile?: boolean;
}) {
  const selectedGoals = formData.selectedGoals || [];

  const goals = [
    { id: "revenue", label: "Increase Revenue" },
    { id: "efficiency", label: "Improve Efficiency" },
    { id: "team", label: "Grow Team" },
    { id: "customers", label: "Expand Customer Base" },
    { id: "automation", label: "Automate Processes" },
    { id: "analytics", label: "Better Analytics" },
  ];

  const toggleGoal = (goalId: string) => {
    const newGoals = selectedGoals.includes(goalId)
      ? selectedGoals.filter((id: string) => id !== goalId)
      : [...selectedGoals, goalId];
    onUpdateField('selectedGoals', newGoals);
    markFieldTouched('selectedGoals');
  };

  const isFieldInvalid = (field: string, value: any) => {
    if (field === 'selectedGoals') {
      return touchedFields.has(field) && (!value || value.length === 0);
    }
    return touchedFields.has(field) && !value;
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="space-y-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-1">Business Goals</h3>
        <p className="text-sm text-muted-foreground">What do you want to achieve?</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="mb-3 block flex items-center gap-2">
            Select your primary goals (choose multiple)
            {selectedGoals.length > 0 && <CheckCircle2 className="h-3 w-3 text-green-500" />}
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {goals.map((goal) => (
              <button
                key={goal.id}
                type="button"
                onClick={() => toggleGoal(goal.id)}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all text-center",
                  selectedGoals.includes(goal.id)
                    ? "border-primary bg-primary/5"
                    : isFieldInvalid('selectedGoals', selectedGoals)
                    ? "border-destructive hover:border-destructive/70"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="text-sm font-medium text-foreground">
                  {goal.label}
                </div>
              </button>
            ))}
          </div>
          {isFieldInvalid('selectedGoals', selectedGoals) && (
            <p className="text-xs text-destructive flex items-center gap-1 mt-2">
              <AlertCircle className="h-3 w-3" />
              Please select at least one goal
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeline" className="flex items-center gap-2">
            Expected Timeline
            {formData.timeline && <CheckCircle2 className="h-3 w-3 text-green-500" />}
          </Label>
          <select
            id="timeline"
            value={formData.timeline || ''}
            onChange={(e) => onUpdateField('timeline', e.target.value)}
            onBlur={() => markFieldTouched('timeline')}
            className={cn(
              "flex h-9 w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50",
              isFieldInvalid('timeline', formData.timeline) && "border-destructive focus-visible:ring-destructive"
            )}
          >
            <option value="">Select timeline</option>
            <option value="1-3">1-3 months</option>
            <option value="3-6">3-6 months</option>
            <option value="6-12">6-12 months</option>
            <option value="12+">12+ months</option>
          </select>
          {isFieldInvalid('timeline', formData.timeline) && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Please select a timeline
            </p>
          )}
        </div>

        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 mt-6">
          <p className="text-sm text-foreground font-medium mb-1">
            🎉 Onboarding Complete!
          </p>
          <p className="text-xs text-muted-foreground">
            {isMobile ? "Click Continue to create your account" : "Now fill in your personal details on the right to sign up"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
