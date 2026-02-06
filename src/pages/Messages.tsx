import { MobileLayout } from "@/components/layout/MobileLayout";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export default function Messages() {
  return (
    <MobileLayout>
      <div className="px-4 py-6 safe-top">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-display text-2xl font-bold text-foreground">
            Messages
          </h1>
        </motion.div>

        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
            <MessageCircle className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground mb-2">
            Coming Soon
          </h2>
          <p className="text-muted-foreground text-center text-sm max-w-[250px]">
            Messaging coming soon. Stay tuned for direct messaging with other creators!
          </p>
          <div className="mt-4 px-3 py-1 rounded-full bg-primary/20 border border-primary/50">
            <span className="text-xs font-medium text-primary">Beta</span>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
