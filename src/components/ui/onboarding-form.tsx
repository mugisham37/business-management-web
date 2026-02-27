"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Users, Target, Briefcase, ArrowRight, ArrowLeft } from "lucide-react";

interface OnboardingFormProps {
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onStepChange: (step: number) => void;
  className?: string;
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
}: OnboardingFormProps) {
  const progress = ((currentStep + 1) / 4) * 100;

  return (
    <div className={cn("w-full h-full bg-card p-8 md:p-12 flex flex-col", className)}>
      {/* Header with Progress */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold text-foreground">Complete Your Profile</h2>
          <span className="text-sm text-muted-foreground font-medium">
            Step {currentStep + 1}/4
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
          {[0, 1, 2, 3].map((step) => (
            <button
              key={step}
              onClick={() => onStepChange(step)}
              className={cn(
                "flex-1 h-1 rounded-full transition-all duration-300",
                step === currentStep
                  ? "bg-primary"
                  : step < currentStep
                  ? "bg-primary/50"
                  : "bg-border"
              )}
              aria-label={`Go to step ${step + 1}`}
            />
          ))}
        </div>
      </motion.div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {currentStep === 0 && <Step1 key="step1" />}
          {currentStep === 1 && <Step2 key="step2" />}
          {currentStep === 2 && <Step3 key="step3" />}
          {currentStep === 3 && <Step4 key="step4" />}
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
          className="flex-1"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onNext} className="flex-1">
          {currentStep === 3 ? "Complete" : "Continue"}
          {currentStep !== 3 && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </motion.div>
    </div>
  );
}

// Step 1: Company Information
function Step1() {
  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Company Details</h3>
          <p className="text-sm text-muted-foreground">Tell us about your business</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            type="text"
            placeholder="Acme Corporation"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <select
            id="industry"
            className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="companySize">Company Size</Label>
          <select
            id="companySize"
            className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-500">201-500 employees</option>
            <option value="500+">500+ employees</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website (Optional)</Label>
          <Input
            id="website"
            type="url"
            placeholder="https://example.com"
          />
        </div>
      </div>
    </motion.div>
  );
}

// Step 2: Team Setup
function Step2() {
  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Users className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Team Setup</h3>
          <p className="text-sm text-muted-foreground">Configure your team structure</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="role">Your Role</Label>
          <select
            id="role"
            className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select your role</option>
            <option value="owner">Owner/Founder</option>
            <option value="ceo">CEO</option>
            <option value="manager">Manager</option>
            <option value="director">Director</option>
            <option value="team-lead">Team Lead</option>
            <option value="employee">Employee</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <select
            id="department"
            className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select department</option>
            <option value="executive">Executive</option>
            <option value="operations">Operations</option>
            <option value="sales">Sales</option>
            <option value="marketing">Marketing</option>
            <option value="finance">Finance</option>
            <option value="hr">Human Resources</option>
            <option value="it">IT</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">
                Invite Team Members
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                You can invite team members after completing setup
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="colleague@example.com"
                  className="text-sm h-8"
                />
                <Button size="sm" variant="outline" className="h-8">
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Step 3: Business Goals
function Step3() {
  const [selectedGoals, setSelectedGoals] = React.useState<string[]>([]);

  const goals = [
    { id: "revenue", label: "Increase Revenue", icon: "💰" },
    { id: "efficiency", label: "Improve Efficiency", icon: "⚡" },
    { id: "team", label: "Grow Team", icon: "👥" },
    { id: "customers", label: "Expand Customer Base", icon: "🎯" },
    { id: "automation", label: "Automate Processes", icon: "🤖" },
    { id: "analytics", label: "Better Analytics", icon: "📊" },
  ];

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    );
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Target className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Business Goals</h3>
          <p className="text-sm text-muted-foreground">What do you want to achieve?</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="mb-3 block">Select your primary goals (choose multiple)</Label>
          <div className="grid grid-cols-2 gap-3">
            {goals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all text-left",
                  selectedGoals.includes(goal.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="text-2xl mb-2">{goal.icon}</div>
                <div className="text-sm font-medium text-foreground">
                  {goal.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeline">Expected Timeline</Label>
          <select
            id="timeline"
            className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select timeline</option>
            <option value="1-3">1-3 months</option>
            <option value="3-6">3-6 months</option>
            <option value="6-12">6-12 months</option>
            <option value="12+">12+ months</option>
          </select>
        </div>
      </div>
    </motion.div>
  );
}

// Step 4: Preferences
function Step4() {
  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Briefcase className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Preferences</h3>
          <p className="text-sm text-muted-foreground">Customize your experience</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <select
            id="currency"
            className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="JPY">JPY - Japanese Yen</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="AUD">AUD - Australian Dollar</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <select
            id="timezone"
            className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Europe/Paris">Paris (CET)</option>
            <option value="Asia/Tokyo">Tokyo (JST)</option>
          </select>
        </div>

        <div className="space-y-3 pt-2">
          <Label>Notifications</Label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring"
              />
              <span className="text-sm text-foreground">Email notifications</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring"
              />
              <span className="text-sm text-foreground">Weekly reports</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring"
              />
              <span className="text-sm text-foreground">Marketing updates</span>
            </label>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 mt-6">
          <p className="text-sm text-foreground font-medium mb-1">
            🎉 Almost there!
          </p>
          <p className="text-xs text-muted-foreground">
            Click Complete to finish setup and start managing your business
          </p>
        </div>
      </div>
    </motion.div>
  );
}
