import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronDown, AlertCircle, Clock, Search, AlertTriangle, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProcessWithdrawal } from "@/hooks/useWallet";
import { nigerianBanks } from "@/lib/store";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

type Step = "amount" | "bank" | "account" | "confirm" | "success";

export default function Withdraw() {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const processWithdrawal = useProcessWithdrawal();
  
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [showBankList, setShowBankList] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const [showDemoModal, setShowDemoModal] = useState(false);

  const availableBalance = profile?.wallet_balance || 0;
  const amountNum = parseInt(amount) || 0;
  const isValidAmount = amountNum >= 100 && amountNum <= availableBalance;

  const handleConfirmClick = () => setShowDemoModal(true);

  const handleFinalConfirm = async () => {
    processWithdrawal.mutate({
      amount: amountNum,
      fullName: fullName.trim(),
      bankName: bank,
      accountNumber,
    }, {
      onSuccess: () => {
        setShowDemoModal(false);
        setStep("success");
        refreshProfile();
        toast.success("Withdrawal request submitted. Processing (manual review).");
      },
      onError: () => {
        setShowDemoModal(false);
      },
    });
  };

  const filteredBanks = nigerianBanks.filter(b => 
    b.toLowerCase().includes(bankSearch.toLowerCase())
  );

  const renderStep = () => {
    switch (step) {
      case "amount":
        return (
          <motion.div key="amount" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="flex-1 flex flex-col">
            {/* Demo notice */}
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 mb-6">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">This is a demo MVP. Not all users will be paid during testing.</p>
              </div>
            </div>

            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Enter Amount</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Available: <span className="text-primary font-semibold">₦{availableBalance.toLocaleString()}</span>
            </p>
            <div className="mb-6">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">₦</span>
                <Input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)}
                  className="h-16 text-3xl font-bold pl-10 text-center" />
              </div>
              {amount && !isValidAmount && (
                <p className="text-destructive text-sm mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {amountNum < 100 ? "Minimum withdrawal is ₦100" : "Insufficient balance"}
                </p>
              )}
            </div>
            <div className="mt-auto">
              <Button variant="gold" size="xl" className="w-full" onClick={() => setStep("bank")} disabled={!isValidAmount}>Continue</Button>
            </div>
          </motion.div>
        );

      case "bank":
        return (
          <motion.div key="bank" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="flex-1 flex flex-col">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Select Bank</h2>
            <p className="text-muted-foreground text-sm mb-6">Choose your Nigerian bank</p>
            <div className="relative mb-6">
              <button onClick={() => setShowBankList(!showBankList)}
                className="w-full h-14 px-4 rounded-xl bg-secondary border border-border flex items-center justify-between text-foreground">
                <span className={bank ? "text-foreground" : "text-muted-foreground"}>{bank || "Select a bank"}</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${showBankList ? "rotate-180" : ""}`} />
              </button>
              {showBankList && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-elevated z-50">
                  <div className="p-3 border-b border-border">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="text" placeholder="Search banks..." value={bankSearch} onChange={(e) => setBankSearch(e.target.value)} className="pl-10 h-10" />
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {filteredBanks.map((bankName) => (
                      <button key={bankName} onClick={() => { setBank(bankName); setShowBankList(false); setBankSearch(""); }}
                        className="w-full px-4 py-3 text-left text-foreground hover:bg-secondary transition-colors">{bankName}</button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
            <div className="mt-auto">
              <Button variant="gold" size="xl" className="w-full" onClick={() => setStep("account")} disabled={!bank}>Continue</Button>
            </div>
          </motion.div>
        );

      case "account":
        return (
          <motion.div key="account" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="flex-1 flex flex-col">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Account Details</h2>
            <p className="text-muted-foreground text-sm mb-6">Enter your account info</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" /> Full Name
                </label>
                <Input type="text" placeholder="Full name on bank account" value={fullName}
                  onChange={(e) => setFullName(e.target.value)} className="h-12" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Account Number</label>
                <Input type="text" placeholder="0000000000" value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="h-16 text-2xl font-mono tracking-wider text-center" />
              </div>
            </div>

            <div className="mt-auto">
              <Button variant="gold" size="xl" className="w-full" onClick={() => setStep("confirm")}
                disabled={accountNumber.length !== 10 || !fullName.trim()}>Continue</Button>
            </div>
          </motion.div>
        );

      case "confirm":
        return (
          <motion.div key="confirm" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="flex-1 flex flex-col">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Confirm Withdrawal</h2>
            <p className="text-muted-foreground text-sm mb-6">Review your details</p>
            <Card variant="gradient" className="mb-6">
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-border">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="text-2xl font-bold text-gradient-gold">₦{amountNum.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Full Name</span>
                  <span className="font-medium text-foreground">{fullName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Bank</span>
                  <span className="font-medium text-foreground">{bank}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Account</span>
                  <span className="font-mono text-foreground">{accountNumber}</span>
                </div>
              </CardContent>
            </Card>
            <div className="mt-auto">
              <Button variant="gold" size="xl" className="w-full" onClick={handleConfirmClick}
                disabled={processWithdrawal.isPending}>
                {processWithdrawal.isPending ? "Processing..." : "Confirm Withdrawal"}
              </Button>
            </div>
          </motion.div>
        );

      case "success":
        return (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-6">
              <Clock className="w-12 h-12 text-primary" />
            </motion.div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Request Submitted!</h2>
            <p className="text-muted-foreground text-center mb-2">
              Withdrawal request submitted. Processing (manual review).
            </p>
            <div className="px-4 py-2 rounded-full bg-primary/20 border border-primary/50 mb-4">
              <span className="text-sm font-medium text-primary">Pending</span>
            </div>
            <p className="text-xs text-muted-foreground text-center mb-8 max-w-[280px]">
              This is a demo MVP. Not all users will be paid during testing.
            </p>
            <Button variant="gold" size="lg" onClick={() => navigate("/wallet")}>Back to Wallet</Button>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background px-6 py-8 max-w-[480px] mx-auto">
      {step !== "success" && (
        <button onClick={() => {
          if (step === "amount") navigate("/wallet");
          else if (step === "bank") setStep("amount");
          else if (step === "account") setStep("bank");
          else if (step === "confirm") setStep("account");
        }} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-5 h-5" /><span>Back</span>
        </button>
      )}

      {step !== "success" && (
        <div className="flex gap-2 mb-8">
          {["amount", "bank", "account", "confirm"].map((s, index) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${
              ["amount", "bank", "account", "confirm"].indexOf(step) >= index ? "bg-primary" : "bg-secondary"}`} />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>

      <Dialog open={showDemoModal} onOpenChange={setShowDemoModal}>
        <DialogContent className="max-w-[340px] rounded-2xl">
          <DialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold">Demo Notice</DialogTitle>
            <DialogDescription className="text-center space-y-3 pt-2">
              <p>This is a test environment.</p>
              <p className="font-medium text-foreground">No real money will be sent to your bank account.</p>
              <p>This withdrawal is recorded for testing purposes only.</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 mt-4">
            <Button variant="gold" className="w-full" onClick={handleFinalConfirm} disabled={processWithdrawal.isPending}>
              {processWithdrawal.isPending ? "Processing..." : "I Understand, Continue"}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setShowDemoModal(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
