import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface EarningBadgeProps {
  amount: number;
  className?: string;
  animate?: boolean;
}

export function EarningBadge({ amount, className, animate = true }: EarningBadgeProps) {
  return (
    <motion.div
      initial={animate ? { scale: 0.8, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 500,
        damping: 30
      }}
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-sm",
        className
      )}
    >
      <span className="text-primary font-bold text-sm">+₦{amount}</span>
      <span className="text-xs text-primary/80">earned</span>
    </motion.div>
  );
}
