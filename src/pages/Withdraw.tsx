import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronDown, CheckCircle2, AlertCircle } from "lucide-react";
import { useDreamStore, nigerianBanks } from "@/lib/store";

type Step = "amount" | "bank" | "account" | "confirm" | "success";

export default function Withdraw() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [showBankList, setShowBankList] = useState(false);
  
  const availableBalance = useDreamStore((state) => state.availableBalance);
  const requestWithdrawal = useDreamStore((state) => state.requestWithdrawal);

  const amountNum = parseInt(amount) || 0;
  const isValidAmount = amountNum >= 100 && amountNum <= availableBalance;

  const handleConfirm = () => {
    requestWithdrawal(amountNum, bank, accountNumber);
    setStep("success");
  };

  const renderStep = () => {
    switch (step) {
      case "amount":
        return (
          <motion.div
            key="amount"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col"
          >
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Enter Amount
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Available: <span className="text-primary font-semibold">₦{availableBalance.toLocaleString()}</span>
            </p>

            <div className="mb-6">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">₦</span>
                <Input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-16 text-3xl font-bold pl-10 text-center"
                />
              </div>
              {amount && !isValidAmount && (
                <p className="text-destructive text-sm mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {amountNum < 100 ? "Minimum withdrawal is ₦100" : "Insufficient balance"}
                </p>
              )}
            </div>

            {/* Quick amounts */}
            <div className="grid grid-cols-3 gap-2 mb-8">
              {[500, 1000, "Max"].map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => setAmount(quickAmount === "Max" ? availableBalance.toString() : quickAmount.toString())}
                  className="py-3 rounded-xl bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors"
                >
                  {quickAmount === "Max" ? "Max" : `₦${quickAmount}`}
                </button>
              ))}
            </div>

            <div className="mt-auto">
              <Button
                variant="gold"
                size="xl"
                className="w-full"
                onClick={() => setStep("bank")}
                disabled={!isValidAmount}
              >
                Continue
              </Button>
            </div>
          </motion.div>
        );

      case "bank":
        return (
          <motion.div
            key="bank"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col"
          >
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Select Bank
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Choose your Nigerian bank
            </p>

            <div className="relative mb-6">
              <button
                onClick={() => setShowBankList(!showBankList)}
                className="w-full h-14 px-4 rounded-xl bg-secondary border border-border flex items-center justify-between text-foreground"
              >
                <span className={bank ? "text-foreground" : "text-muted-foreground"}>
                  {bank || "Select a bank"}
                </span>
                <ChevronDown className={`w-5 h-5 transition-transform ${showBankList ? "rotate-180" : ""}`} />
              </button>

              {showBankList && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-elevated max-h-64 overflow-y-auto z-50"
                >
                  {nigerianBanks.map((bankName) => (
                    <button
                      key={bankName}
                      onClick={() => {
                        setBank(bankName);
                        setShowBankList(false);
                      }}
                      className="w-full px-4 py-3 text-left text-foreground hover:bg-secondary transition-colors first:rounded-t-xl last:rounded-b-xl"
                    >
                      {bankName}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            <div className="mt-auto">
              <Button
                variant="gold"
                size="xl"
                className="w-full"
                onClick={() => setStep("account")}
                disabled={!bank}
              >
                Continue
              </Button>
            </div>
          </motion.div>
        );

      case "account":
        return (
          <motion.div
            key="account"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col"
          >
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Account Number
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Enter your 10-digit account number
            </p>

            <Input
              type="text"
              placeholder="0000000000"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className="h-16 text-2xl font-mono tracking-wider text-center mb-6"
            />

            <div className="mt-auto">
              <Button
                variant="gold"
                size="xl"
                className="w-full"
                onClick={() => setStep("confirm")}
                disabled={accountNumber.length !== 10}
              >
                Continue
              </Button>
            </div>
          </motion.div>
        );

      case "confirm":
        return (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col"
          >
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Confirm Withdrawal
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Please review your details
            </p>

            <Card variant="gradient" className="mb-6">
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-border">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="text-2xl font-bold text-gradient-gold">₦{amountNum.toLocaleString()}</span>
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

            <p className="text-xs text-muted-foreground text-center mb-6">
              Funds will arrive within 24-48 hours
            </p>

            <div className="mt-auto">
              <Button
                variant="gold"
                size="xl"
                className="w-full"
                onClick={handleConfirm}
              >
                Confirm Withdrawal
              </Button>
            </div>
          </motion.div>
        );

      case "success":
        return (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mb-6"
            >
              <CheckCircle2 className="w-12 h-12 text-success" />
            </motion.div>

            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Request Received!
            </h2>
            <p className="text-muted-foreground text-center mb-2">
              Your withdrawal of{" "}
              <span className="text-primary font-semibold">₦{amountNum.toLocaleString()}</span>{" "}
              is being processed.
            </p>
            <p className="text-sm text-muted-foreground text-center mb-8">
              Funds will arrive within 24-48 hours.
            </p>

            <Button
              variant="gold"
              size="lg"
              onClick={() => navigate("/wallet")}
            >
              Back to Wallet
            </Button>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background px-6 py-8 max-w-[480px] mx-auto">
      {/* Back button */}
      {step !== "success" && (
        <button
          onClick={() => {
            if (step === "amount") navigate("/wallet");
            else if (step === "bank") setStep("amount");
            else if (step === "account") setStep("bank");
            else if (step === "confirm") setStep("account");
          }}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      )}

      {/* Step indicator */}
      {step !== "success" && (
        <div className="flex gap-2 mb-8">
          {["amount", "bank", "account", "confirm"].map((s, index) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                ["amount", "bank", "account", "confirm"].indexOf(step) >= index
                  ? "bg-primary"
                  : "bg-secondary"
              }`}
            />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </div>
  );
}
