import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Sparkles, Wallet, Users, Shield, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Play,
    title: "Watch & Engage",
    description: "Scroll through engaging content and earn money for every video you watch. The more you engage, the more you earn.",
  },
  {
    icon: Sparkles,
    title: "Create Content",
    description: "Upload your own videos and posts. Earn ₦50+ for every upload, plus bonuses based on how viral your content goes.",
  },
  {
    icon: Users,
    title: "Complete Challenges",
    description: "Participate in sponsored challenges and community tasks to unlock extra earning opportunities.",
  },
  {
    icon: Wallet,
    title: "Withdraw Anytime",
    description: "Cash out your earnings directly to your Nigerian bank account. Fast, secure, and hassle-free.",
  },
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "Your data and earnings are protected. We never share your information with third parties.",
  },
];

export default function HowItWorks() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background px-6 py-8 max-w-[480px] mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          How <span className="text-gradient-gold">Dream$</span> Works
        </h1>
        <p className="text-muted-foreground">
          Turn your screen time into real income in 4 simple steps.
        </p>
      </motion.div>

      {/* Steps */}
      <div className="flex-1 space-y-4 mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="flex gap-4"
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                {index < steps.length - 1 && (
                  <div className="w-0.5 flex-1 bg-border mt-2" />
                )}
              </div>
              <div className="pb-6">
                <h3 className="font-display font-bold text-foreground mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button
          variant="gold"
          size="xl"
          className="w-full"
          onClick={() => navigate("/auth")}
        >
          Start Earning Now
          <ArrowRight className="w-5 h-5" />
        </Button>
      </motion.div>
    </div>
  );
}
