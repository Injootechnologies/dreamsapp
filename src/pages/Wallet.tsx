import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Wallet as WalletIcon, ArrowUpRight, AlertCircle, TrendingUp, Coins, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEarningsHistory, useWithdrawalHistory } from "@/hooks/useWallet";

export default function Wallet() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: earningsHistory = [] } = useEarningsHistory();
  const { data: withdrawalHistory = [] } = useWithdrawalHistory();

  const availableBalance = profile?.wallet_balance || 0;
  const totalEarned = profile?.total_earned || 0;

  return (
    <MobileLayout>
      <div className="px-4 py-6 safe-top">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">Wallet</h1>
          <p className="text-xs text-muted-foreground mt-1">Beta wallet • Demo MVP</p>
        </motion.div>

        {/* Main Balance Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card variant="earning" className="mb-4 overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                    <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, type: "spring" }}
                      className="text-4xl font-bold text-gradient-gold">₦{availableBalance.toLocaleString()}</motion.p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <WalletIcon className="w-7 h-7 text-primary" />
                  </div>
                </div>
                <Button variant="gold" size="lg" className="w-full" onClick={() => navigate("/withdraw")} disabled={availableBalance === 0}>
                  <ArrowUpRight className="w-5 h-5" /> Request Withdrawal
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Earnings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-6">
          <Card variant="gradient">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Earnings</p>
                    <p className="font-bold text-lg text-foreground">₦{totalEarned.toLocaleString()}</p>
                  </div>
                </div>
                <div className="px-2 py-1 rounded-full bg-primary/20">
                  <span className="text-xs text-primary font-medium">Beta</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Earnings History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">Earnings History</h2>
          {earningsHistory.length === 0 ? (
            <Card variant="gradient">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                  <Coins className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-foreground font-medium mb-1">No earnings yet</p>
                <p className="text-muted-foreground text-sm">View eligible posts to earn!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {earningsHistory.map((earning: any) => (
                <Card key={earning.id} variant="default">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Coins className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">+₦{earning.amount}</p>
                          <p className="text-xs text-muted-foreground">{earning.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(earning.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>

        {/* Withdrawal History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">Withdrawal History</h2>
          {withdrawalHistory.length === 0 ? (
            <Card variant="gradient">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground text-sm">No withdrawals yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {withdrawalHistory.map((w: any) => (
                <Card key={w.id} variant="default">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                          <ArrowUpRight className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">₦{w.amount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{w.bank_name}</p>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full capitalize bg-primary/20 text-primary">
                        {w.status === 'pending' ? 'Pending' : w.status}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>

        {/* Disclaimer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-primary font-medium">Demo MVP</p>
              <p className="text-xs text-muted-foreground mt-1">
                This is a demo MVP. Not all users will be paid during testing.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </MobileLayout>
  );
}
