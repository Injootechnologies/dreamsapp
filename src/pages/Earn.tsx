import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Play, Coins, Sparkles, Eye } from "lucide-react";
import { useDreamStore } from "@/lib/store";
import { useNavigate } from "react-router-dom";

export default function Earn() {
  const navigate = useNavigate();
  const totalEarned = useDreamStore((state) => state.totalEarned);
  const availableBalance = useDreamStore((state) => state.availableBalance);
  const watchedVideos = useDreamStore((state) => state.watchedVideos);

  return (
    <MobileLayout>
      <div className="px-4 py-6 safe-top">
        {/* Beta Badge */}
        <div className="flex justify-between items-center mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display text-2xl font-bold text-foreground mb-1">
              Earn Dream$
            </h1>
            <p className="text-muted-foreground text-sm">
              Watch monetized videos to earn rewards
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
          <Card variant="earning" className="mb-6">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <Coins className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Available Balance</p>
                    <p className="text-2xl font-bold text-gradient-gold">₦{availableBalance.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total Earned</p>
                  <p className="text-lg font-semibold text-foreground">₦{totalEarned.toLocaleString()}</p>
                </div>
              </div>
              
              {/* Beta note */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-success/10 border border-success/20">
                <Sparkles className="w-4 h-4 text-success" />
                <p className="text-xs text-success">
                  Beta rewards active! Watch monetized videos to earn.
                </p>
              </div>
              
              <p className="text-xs text-muted-foreground mt-3">
                {watchedVideos.size} videos watched
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* How to Earn */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">
            How to Earn
          </h2>
          
          <Card variant="gradient">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Watch Monetized Videos</h3>
                  <p className="text-sm text-muted-foreground">
                    Watch 100% of videos marked with 🎯 to earn rewards
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-lg font-bold text-gradient-gold">
                    ₦20-50
                  </span>
                  <span className="text-xs text-muted-foreground">per video</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                  <Play className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Regular Videos</h3>
                  <p className="text-sm text-muted-foreground">
                    Enjoy content - no earning for non-monetized videos
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-lg font-bold text-muted-foreground">
                    ₦0
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <Button 
            variant="gold" 
            className="w-full"
            onClick={() => navigate('/home')}
          >
            Start Watching
          </Button>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 rounded-xl bg-secondary/50 border border-border"
        >
          <p className="text-xs text-muted-foreground text-center">
            ⚠️ Beta version - Earning structure may change
          </p>
          <p className="text-xs text-muted-foreground text-center mt-1">
            Only monetized videos generate rewards
          </p>
        </motion.div>
      </div>
    </MobileLayout>
  );
}
