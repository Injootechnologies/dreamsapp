import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Wallet as WalletIcon, ArrowUpRight, AlertCircle, Clock } from "lucide-react";
import { useDreamStore } from "@/lib/store";

export default function Wallet() {
  const navigate = useNavigate();
  const availableBalance = useDreamStore((state) => state.availableBalance);
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
          <p className="text-xs text-muted-foreground mt-1">
            Demo wallet • No real transactions
          </p>
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
                  Request Withdrawal
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Future Version Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <Card variant="gradient">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">Coming Soon</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Earnings & withdrawals will be enabled in future versions.
                    This is a concept demo.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Earnings History Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">
            Earnings History
          </h2>
          
          <Card variant="gradient">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                <WalletIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium mb-1">No earnings yet</p>
              <p className="text-muted-foreground text-sm">
                Earnings will appear here in future versions
              </p>
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
            Withdrawal History
          </h2>
          
          {withdrawalHistory.length === 0 ? (
            <Card variant="gradient">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground text-sm">
                  No withdrawals yet
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {withdrawalHistory.slice(0, 5).map((withdrawal, index) => (
                <motion.div
                  key={withdrawal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Card variant="default">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            withdrawal.status === "approved"
                              ? "bg-success/20" 
                              : withdrawal.status === "rejected"
                              ? "bg-destructive/20"
                              : "bg-primary/20"
                          }`}>
                            <ArrowUpRight className={`w-4 h-4 ${
                              withdrawal.status === "approved"
                                ? "text-success"
                                : withdrawal.status === "rejected"
                                ? "text-destructive"
                                : "text-primary"
                            }`} />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm">
                              ₦{withdrawal.amount.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {withdrawal.bank}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                          withdrawal.status === "approved"
                            ? "bg-success/20 text-success"
                            : withdrawal.status === "rejected"
                            ? "bg-destructive/20 text-destructive"
                            : "bg-primary/20 text-primary"
                        }`}>
                          {withdrawal.status}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Demo disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/30"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-primary font-medium">Concept Demo</p>
              <p className="text-xs text-muted-foreground mt-1">
                This is a concept demo. No real money or transactions are involved.
                All data is simulated for demonstration purposes.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </MobileLayout>
  );
}
