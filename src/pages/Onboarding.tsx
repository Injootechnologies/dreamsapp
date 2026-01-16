import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Play, Wallet, ArrowRight } from "lucide-react";
import { useDreamStore } from "@/lib/store";

const onboardingSteps = [
  {
    icon: Sparkles,
    title: "Welcome to Dream$",
    description: "Earn money from your digital engagement. Your screen time is about to become valuable.",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    icon: Play,
    title: "How You Earn",
    description: "Watch videos, create content, and participate in challenges. Every interaction counts!",
    gradient: "from-success/20 to-success/5",
  },
  {
    icon: Wallet,
    title: "Withdraw to Your Bank",
    description: "Get paid directly to your Nigerian bank account. Fast, secure, and hassle-free.",
    gradient: "from-primary/20 to-primary/5",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const completeOnboarding = useDreamStore((state) => state.completeOnboarding);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
      navigate("/home");
    }
  };

  const step = onboardingSteps[currentStep];
  const Icon = step.icon;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background px-6 py-8">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-12">
        {onboardingSteps.map((_, index) => (
          <motion.div
            key={index}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentStep
                ? "w-8 bg-primary"
                : index < currentStep
                ? "w-2 bg-primary/50"
                : "w-2 bg-secondary"
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center"
          >
            {/* Icon container */}
            <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-8`}>
              <Icon className="w-16 h-16 text-primary" />
            </div>

            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              {step.title}
            </h2>

            <p className="text-muted-foreground text-lg max-w-xs">
              {step.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          variant="gold"
          size="xl"
          className="w-full"
          onClick={handleNext}
        >
          {currentStep === onboardingSteps.length - 1 ? (
            "Enter Dream$"
          ) : (
            <>
              Next
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>

        {currentStep < onboardingSteps.length - 1 && (
          <button
            onClick={() => {
              completeOnboarding();
              navigate("/home");
            }}
            className="w-full mt-4 text-center text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            Skip
          </button>
        )}
      </motion.div>
    </div>
  );
}
