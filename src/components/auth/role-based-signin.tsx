"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  onSignIn: (email: string, password: string, organizationId: string) => Promise<void>;
  onPinSignIn: (email: string, pin: string, organizationId: string) => Promise<void>;
  onForgotPassword: () => void;
  isLoading: boolean;
  error: string | null;
}

export function RoleBasedSignIn({ onSignUp, onSignIn, onPinSignIn, onForgotPassword, isLoading, error }: RoleBasedSignInProps) {
  const [selectedRole, setSelectedRole] = React.useState<UserRole>(null);
  const [authMethod, setAuthMethod] = React.useState<"password" | "pin">("password");

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleBack = () => {
    setSelectedRole(null);
    setAuthMethod("password");
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
            error={error}
          />
        ) : selectedRole === "founder" ? (
          <FounderSignIn
            key="founder-signin"
            onBack={handleBack}
            onSubmit={onSignIn}
            onForgotPassword={onForgotPassword}
            isLoading={isLoading}
            error={error}
          />
        ) : selectedRole === "manager" ? (
          <ManagerSignIn
            key="manager-signin"
            onBack={handleBack}
            onSubmit={authMethod === "password" ? onSignIn : onPinSignIn}
            isLoading={isLoading}
            authMethod={authMethod}
            onAuthMethodChange={setAuthMethod}
            error={error}
          />
        ) : (
          <WorkerSignIn
            key="worker-signin"
            onBack={handleBack}
            onSubmit={authMethod === "password" ? onSignIn : onPinSignIn}
            isLoading={isLoading}
            authMethod={authMethod}
            onAuthMethodChange={setAuthMethod}
            error={error}
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
  error,
}: {
  onRoleSelect: (role: UserRole) => void;
  onSignUp: () => void;
  error: string | null;
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

      {error && (
        <motion.div variants={itemVariants} className="mb-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

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
  onForgotPassword,
  isLoading,
  error,
}: {
  onBack: () => void;
  onSubmit: (email: string, password: string, organizationId: string) => Promise<void>;
  onForgotPassword: () => void;
  isLoading: boolean;
  error: string | null;
}) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [organizationId, setOrganizationId] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email, password, organizationId);
  };

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

      <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="org-id">Organization ID</Label>
          <Input
            id="org-id"
            type="text"
            placeholder="Enter your organization ID"
            value={organizationId}
            onChange={(e) => setOrganizationId(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            This was provided when you created your organization
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="founder-email">Email</Label>
          <Input
            id="founder-email"
            type="email"
            placeholder="founder@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="founder-password">Password</Label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm font-medium text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <Input
            id="founder-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" isLoading={isLoading} disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In as Founder"}
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
  error,
}: {
  onBack: () => void;
  onSubmit: (email: string, credential: string, organizationId: string) => Promise<void>;
  isLoading: boolean;
  authMethod: "password" | "pin";
  onAuthMethodChange: (method: "password" | "pin") => void;
  error: string | null;
}) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pin, setPin] = React.useState('');
  const [organizationId, setOrganizationId] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const credential = authMethod === "password" ? password : pin;
    await onSubmit(email, credential, organizationId);
  };

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

      {error && (
        <motion.div variants={itemVariants} className="mb-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="org-id">Organization ID</Label>
          <Input
            id="org-id"
            type="text"
            placeholder="ORG-12345"
            value={organizationId}
            onChange={(e) => setOrganizationId(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            Contact your founder if you don't have this
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="manager-email">Email</Label>
          <Input
            id="manager-email"
            type="email"
            placeholder="manager@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          ) : (
            <Input
              id="manager-pin"
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
            />
          )}
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading} disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In as Manager"}
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
  error,
}: {
  onBack: () => void;
  onSubmit: (email: string, credential: string, organizationId: string) => Promise<void>;
  isLoading: boolean;
  authMethod: "password" | "pin";
  onAuthMethodChange: (method: "password" | "pin") => void;
  error: string | null;
}) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pin, setPin] = React.useState('');
  const [organizationId, setOrganizationId] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const credential = authMethod === "password" ? password : pin;
    await onSubmit(email, credential, organizationId);
  };

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

      {error && (
        <motion.div variants={itemVariants} className="mb-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="worker-org-id">Organization ID</Label>
          <Input
            id="worker-org-id"
            type="text"
            placeholder="ORG-12345"
            value={organizationId}
            onChange={(e) => setOrganizationId(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            Ask your manager for this ID
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="worker-email">Email</Label>
          <Input
            id="worker-email"
            type="email"
            placeholder="worker@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
              id="worker-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          ) : (
            <Input
              id="worker-pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="Enter 4-digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
            />
          )}
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading} disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In as Worker"}
        </Button>
      </motion.form>
    </motion.div>
  );
}
