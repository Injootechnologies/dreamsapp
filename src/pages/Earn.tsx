import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ImageIcon, Coins, Sparkles, Info } from "lucide-react";
import { useDreamStore } from "@/lib/store";
import { useNavigate } from "react-router-dom";

export default function Earn() {
  const navigate = useNavigate();
  const totalEarned = useDreamStore((state) => state.totalEarned);
  const availableBalance = useDreamStore((state) => state.availableBalance);

  return (
    <MobileLayout>
      <div className="px-4 py-6 safe-top">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="font-display text-2xl font-bold text-foreground mb-1">
              Earn Dream$
            </h1>
            <p className="text-muted-foreground text-sm">
              Feature coming soon
            </p>
          </motion.div>
          <div className="px-3 py-1 rounded-full bg-primary/20 border border-primary/50">
            <span className="text-xs font-medium text-primary">Beta</span>
          </div>
        </div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                  <p className="text-3xl font-bold text-foreground">₦{availableBalance.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-primary/20">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Earned</span>
                  <span className="text-foreground font-medium">₦{totalEarned.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Coming Soon Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-secondary/50 border-muted mb-6">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Info className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Coming Soon</h3>
                  <p className="text-sm text-muted-foreground">
                    Earning features will be enabled in future versions. This is currently a concept demo to test the platform experience.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* How It Will Work */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">
            How Earning Will Work
          </h2>
          
          <div className="space-y-3">
            <Card className="bg-secondary/30 border-muted">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Content Rewards</p>
                    <p className="text-xs text-muted-foreground">Earn from sponsored content</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-secondary/30 border-muted">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Creator Program</p>
                    <p className="text-xs text-muted-foreground">Monetize your content</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="gold"
            size="lg"
            className="w-full"
            onClick={() => navigate("/home")}
          >
            <ImageIcon className="w-5 h-5" />
            Explore Content
          </Button>
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-muted-foreground text-center mt-6"
        >
          Demo version • Earnings disabled
        </motion.p>
      </div>
    </MobileLayout>
  );
}
