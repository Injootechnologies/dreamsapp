import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, Play, TrendingUp, Wallet } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="font-display text-4xl font-bold">
            <span className="text-gradient-gold">Dream$</span>
          </h1>
        </motion.div>

        {/* Hero Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
            Turn Your Screen Time
            <br />
            <span className="text-gradient-gold">Into Income.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-sm mx-auto">
            Earn money by watching videos, creating content, and completing simple digital tasks.
          </p>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {[
            { icon: Play, label: "Watch & Earn" },
            { icon: Sparkles, label: "Create Content" },
            { icon: TrendingUp, label: "Complete Tasks" },
            { icon: Wallet, label: "Get Paid" },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border"
            >
              <item.icon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{item.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col gap-3 w-full max-w-xs"
        >
          <Button
            variant="gold"
            size="xl"
            className="w-full"
            onClick={() => navigate("/auth")}
          >
            Get Started
          </Button>
          <Button
            variant="gold-outline"
            size="lg"
            className="w-full"
            onClick={() => navigate("/how-it-works")}
          >
            See How It Works
          </Button>
        </motion.div>
      </div>

      {/* Bottom stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="px-6 pb-8"
      >
        <div className="flex justify-center gap-8 text-center">
          <div>
            <p className="text-2xl font-bold text-gradient-gold">10K+</p>
            <p className="text-xs text-muted-foreground">Active Users</p>
          </div>
          <div className="w-px bg-border" />
          <div>
            <p className="text-2xl font-bold text-gradient-gold">₦5M+</p>
            <p className="text-xs text-muted-foreground">Paid Out</p>
          </div>
          <div className="w-px bg-border" />
          <div>
            <p className="text-2xl font-bold text-gradient-gold">50K+</p>
            <p className="text-xs text-muted-foreground">Videos</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
