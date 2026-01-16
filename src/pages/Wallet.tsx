import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Wallet as WalletIcon, ArrowUpRight, Clock, TrendingUp, ChevronRight } from "lucide-react";
import { useDreamStore } from "@/lib/store";

export default function Wallet() {
  const navigate = useNavigate();
  const availableBalance = useDreamStore((state) => state.availableBalance);
  const pendingEarnings = useDreamStore((state) => state.pendingEarnings);
  const totalEarned = useDreamStore((state) => state.totalEarned);
  const withdrawalHistory = useDreamStore((state) => state.withdrawalHistory);

  return (
    <MobileLayout>
      <div className="px-4 py-6 safe-top">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-display text-2xl font-bold text-foreground">
            Wallet
          </h1>
        </motion.div>

        {/* Main Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="earning" className="mb-6 overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                    <motion.p
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className="text-4xl font-bold text-gradient-gold"
                    >
                      ₦{availableBalance.toLocaleString()}
                    </motion.p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <WalletIcon className="w-7 h-7 text-primary" />
                  </div>
                </div>
                
                <Button
                  variant="gold"
                  size="lg"
                  className="w-full"
                  onClick={() => navigate("/withdraw")}
                >
                  <ArrowUpRight className="w-5 h-5" />
                  Withdraw Funds
                </Button>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 divide-x divide-border border-t border-border bg-secondary/30">
                <div className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">Pending</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">₦{pendingEarnings.toLocaleString()}</p>
                </div>
                <div className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs">Total Earned</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">₦{totalEarned.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          <Card variant="gradient">
            <CardContent className="p-4">
              <button
                onClick={() => navigate("/earn")}
                className="w-full text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <p className="font-semibold text-foreground text-sm">Earn More</p>
                <p className="text-xs text-muted-foreground">Complete tasks</p>
              </button>
            </CardContent>
          </Card>
          
          <Card variant="gradient">
            <CardContent className="p-4">
              <button
                onClick={() => navigate("/home")}
                className="w-full text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-3">
                  <WalletIcon className="w-5 h-5 text-primary" />
                </div>
                <p className="font-semibold text-foreground text-sm">Watch & Earn</p>
                <p className="text-xs text-muted-foreground">Browse content</p>
              </button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Withdrawal History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">
            Recent Withdrawals
          </h2>
          
          {withdrawalHistory.length === 0 ? (
            <Card variant="gradient">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground text-sm">
                  No withdrawals yet. Start earning and cash out!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {withdrawalHistory.slice(0, 5).map((withdrawal, index) => (
                <motion.div
                  key={withdrawal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Card variant="default">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            withdrawal.status === "completed" 
                              ? "bg-success/20" 
                              : "bg-primary/20"
                          }`}>
                            <ArrowUpRight className={`w-5 h-5 ${
                              withdrawal.status === "completed"
                                ? "text-success"
                                : "text-primary"
                            }`} />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              ₦{withdrawal.amount.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {withdrawal.bank}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            withdrawal.status === "completed"
                              ? "bg-success/20 text-success"
                              : "bg-primary/20 text-primary"
                          }`}>
                            {withdrawal.status}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 rounded-xl bg-secondary/50 border border-border"
        >
          <p className="text-xs text-muted-foreground text-center">
            🇳🇬 Withdrawals are processed to Nigerian bank accounts within 24-48 hours.
            <br />
            <span className="text-primary">Foreign payouts coming soon!</span>
          </p>
        </motion.div>
      </div>
    </MobileLayout>
  );
}
