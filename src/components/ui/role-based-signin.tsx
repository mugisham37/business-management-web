"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Chrome, Apple, Building2, Users, Briefcase, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type UserRole = "founder" | "manager" | "worker" | null;

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

interface RoleBasedSignInProps {
  onSignUp: () => void;
  isLoading: boolean;
}

export function RoleBasedSignIn({ onSignUp, isLoading }: RoleBasedSignInProps) {
  const [selectedRole, setSelectedRole] = React.useState<UserRole>(null);
  const [authMethod, setAuthMethod] = React.useState<"password" | "pin">("password");

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleBack = () => {
    setSelectedRole(null);
    setAuthMethod("password");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle authentication based on role
    console.log(`Signing in as ${selectedRole}`);
  };

  return (
    <motion.div
      className="w-full max-w-sm"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="wait">
        {!selectedRole ? (
          <RoleSelection
            key="role-selection"
            onRoleSelect={handleRoleSelect}
            onSignUp={onSignUp}
          />
        ) : selectedRole === "founder" ? (
          <FounderSignIn
            key="founder-signin"
            onBack={handleBack}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        ) : selectedRole === "manager" ? (
          <ManagerSignIn
            key="manager-signin"
            onBack={handleBack}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            authMethod={authMethod}
            onAuthMethodChange={setAuthMethod}
          />
        ) : (
          <WorkerSignIn
            key="worker-signin"
            onBack={handleBack}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            authMethod={authMethod}
            onAuthMethodChange={setAuthMethod}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Role Selection Component
function RoleSelection({
  onRoleSelect,
  onSignUp,
}: {
  onRoleSelect: (role: UserRole) => void;
  onSignUp: () => void;
}) {
  const roles = [
    {
      id: "founder" as UserRole,
      title: "Founder/Owner",
      description: "Full access to all features",
      icon: <Building2 className="w-6 h-6" />,
      color: "primary",
    },
    {
      id: "manager" as UserRole,
      title: "Manager",
      description: "Manage team and operations",
      icon: <Briefcase className="w-6 h-6" />,
      color: "secondary",
    },
    {
      id: "worker" as UserRole,
      title: "Worker",
      description: "Access assigned tasks",
      icon: <Users className="w-6 h-6" />,
      color: "accent",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.h1
        variants={itemVariants}
        className="text-3xl font-bold tracking-tight mb-2 text-foreground"
      >
        Welcome Back
      </motion.h1>
      <motion.p
        variants={itemVariants}
        className="text-muted-foreground mb-8"
      >
        Sign in to your account
      </motion.p>

      <motion.div variants={itemVariants} className="mb-6">
        <Label className="mb-3 block text-base">Signing in as:</Label>
        <div className="space-y-3">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => onRoleSelect(role.id)}
              className={cn(
                "w-full p-4 rounded-lg border-2 transition-all text-left",
                "hover:border-primary hover:bg-primary/5",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "border-border bg-card"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  "bg-primary/10 text-primary"
                )}>
                  {role.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    {role.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {role.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.p
        variants={itemVariants}
        className="text-center text-sm text-muted-foreground mt-8"
      >
        Don't have an account?{" "}
        <button
          onClick={onSignUp}
          className="font-medium text-primary hover:underline"
        >
          Sign up
        </button>
      </motion.p>
    </motion.div>
  );
}

// Founder Sign In Component
function FounderSignIn({
  onBack,
  onSubmit,
  isLoading,
}: {
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.button
        variants={itemVariants}
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to role selection
      </motion.button>

      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Founder Sign In</h2>
            <p className="text-sm text-muted-foreground">Full access to your organization</p>
          </div>
        </div>
      </motion.div>

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
        <div className="space-y-2">
          <Label htmlFor="founder-email">Email</Label>
          <Input
            id="founder-email"
            type="email"
            placeholder="founder@company.com"
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="founder-password">Password</Label>
            <button
              type="button"
              className="text-sm font-medium text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <Input id="founder-password" type="password" required />
        </div>
        <Button type="submit" className="w-full" isLoading={isLoading}>
          Sign In as Founder
        </Button>
      </motion.form>
    </motion.div>
  );
}

// Manager Sign In Component
function ManagerSignIn({
  onBack,
  onSubmit,
  isLoading,
  authMethod,
  onAuthMethodChange,
}: {
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  authMethod: "password" | "pin";
  onAuthMethodChange: (method: "password" | "pin") => void;
}) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.button
        variants={itemVariants}
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to role selection
      </motion.button>

      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Manager Sign In</h2>
            <p className="text-sm text-muted-foreground">Access your management portal</p>
          </div>
        </div>
      </motion.div>

      <motion.form variants={itemVariants} onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="org-id">Organization ID</Label>
          <Input
            id="org-id"
            type="text"
            placeholder="ORG-12345"
            required
          />
          <p className="text-xs text-muted-foreground">
            Contact your founder if you don't have this
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="manager-branch">Branch/Department</Label>
          <select
            id="manager-branch"
            className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="">Select branch/department</option>
            <option value="headquarters">Headquarters</option>
            <option value="sales">Sales Department</option>
            <option value="operations">Operations</option>
            <option value="finance">Finance</option>
            <option value="hr">Human Resources</option>
            <option value="it">IT Department</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="manager-name">Full Name</Label>
          <Input
            id="manager-name"
            type="text"
            placeholder="John Doe"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="manager-email">Email</Label>
          <Input
            id="manager-email"
            type="email"
            placeholder="manager@company.com"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <Label>Authentication Method</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onAuthMethodChange("password")}
                className={cn(
                  "px-3 py-1 text-xs rounded-md transition-colors",
                  authMethod === "password"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => onAuthMethodChange("pin")}
                className={cn(
                  "px-3 py-1 text-xs rounded-md transition-colors",
                  authMethod === "pin"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                PIN
              </button>
            </div>
          </div>
          
          {authMethod === "password" ? (
            <Input
              id="manager-password"
              type="password"
              placeholder="Enter your password"
              required
            />
          ) : (
            <Input
              id="manager-pin"
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit PIN"
              required
            />
          )}
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Sign In as Manager
        </Button>
      </motion.form>
    </motion.div>
  );
}

// Worker Sign In Component
function WorkerSignIn({
  onBack,
  onSubmit,
  isLoading,
  authMethod,
  onAuthMethodChange,
}: {
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  authMethod: "password" | "pin";
  onAuthMethodChange: (method: "password" | "pin") => void;
}) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.button
        variants={itemVariants}
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to role selection
      </motion.button>

      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Worker Sign In</h2>
            <p className="text-sm text-muted-foreground">Access your workspace</p>
          </div>
        </div>
      </motion.div>

      <motion.form variants={itemVariants} onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="worker-branch">Branch/Department</Label>
          <select
            id="worker-branch"
            className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="">Select your branch/department</option>
            <option value="headquarters">Headquarters</option>
            <option value="sales">Sales Department</option>
            <option value="operations">Operations</option>
            <option value="finance">Finance</option>
            <option value="warehouse">Warehouse</option>
            <option value="customer-service">Customer Service</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="worker-manager">Manager/Supervisor</Label>
          <select
            id="worker-manager"
            className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="">Select your manager</option>
            <option value="john-doe">John Doe - Sales Manager</option>
            <option value="jane-smith">Jane Smith - Operations Manager</option>
            <option value="mike-johnson">Mike Johnson - Finance Manager</option>
            <option value="sarah-williams">Sarah Williams - HR Manager</option>
          </select>
          <p className="text-xs text-muted-foreground">
            Select the manager you report to
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="worker-email">Email (Optional)</Label>
          <Input
            id="worker-email"
            type="email"
            placeholder="worker@company.com"
          />
          <p className="text-xs text-muted-foreground">
            Or use PIN if you don't have an email
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <Label>Authentication Method</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onAuthMethodChange("password")}
                className={cn(
                  "px-3 py-1 text-xs rounded-md transition-colors",
                  authMethod === "password"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => onAuthMethodChange("pin")}
                className={cn(
                  "px-3 py-1 text-xs rounded-md transition-colors",
                  authMethod === "pin"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                PIN
              </button>
            </div>
          </div>
          
          {authMethod === "password" ? (
            <Input
              id="worker-password"
              type="password"
              placeholder="Enter your password"
              required
            />
          ) : (
            <Input
              id="worker-pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="Enter 4-digit PIN"
              required
            />
          )}
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Sign In as Worker
        </Button>
      </motion.form>
    </motion.div>
  );
}
