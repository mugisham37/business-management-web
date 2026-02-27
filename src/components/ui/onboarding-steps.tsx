import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Building2, Users, Target, Rocket } from "lucide-react";

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  image: string;
}

const steps: OnboardingStep[] = [
  {
    title: "Welcome to Your Business Hub",
    description:
      "Streamline your operations, manage your team, and grow your business all in one place.",
    icon: <Building2 className="w-12 h-12" />,
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&auto=format&fit=crop&q=80",
  },
  {
    title: "Collaborate with Your Team",
    description:
      "Invite team members, assign roles, and work together seamlessly with real-time updates.",
    icon: <Users className="w-12 h-12" />,
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&auto=format&fit=crop&q=80",
  },
  {
    title: "Track Your Goals",
    description:
      "Set objectives, monitor progress, and achieve your business milestones with data-driven insights.",
    icon: <Target className="w-12 h-12" />,
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&auto=format&fit=crop&q=80",
  },
  {
    title: "Ready to Launch",
    description:
      "You're all set! Start managing your business efficiently and watch it grow.",
    icon: <Rocket className="w-12 h-12" />,
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&auto=format&fit=crop&q=80",
  },
];

interface OnboardingStepsProps {
  currentStep: number;
  isPreview?: boolean;
  className?: string;
}

export function OnboardingSteps({
  currentStep,
  isPreview = false,
  className,
}: OnboardingStepsProps) {
  const step = steps[currentStep];

  return (
    <div
      className={cn(
        "relative w-full h-full overflow-hidden bg-card",
        className
      )}
    >
      {/* Background Image */}
      <motion.div
        key={`bg-${currentStep}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0"
      >
        <img
          src={step.image}
          alt=""
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Preview Badge */}
      {isPreview && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-6 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20">
            <p className="text-sm font-medium text-primary">
              Discover what's inside
            </p>
          </div>
        </motion.div>
      )}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 md:p-12">
        <motion.div
          key={`content-${currentStep}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center max-w-md"
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            {step.icon}
          </motion.div>

          <h2 className="text-3xl font-bold mb-4 text-foreground">
            {step.title}
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {step.description}
          </p>
        </motion.div>

        {/* Step Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentStep
                  ? "w-8 bg-primary"
                  : "w-2 bg-border"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
