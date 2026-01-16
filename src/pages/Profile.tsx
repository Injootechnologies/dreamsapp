import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { User, Video, Coins, Settings, LogOut, ChevronRight, Crown } from "lucide-react";
import { useDreamStore } from "@/lib/store";

export default function Profile() {
  const navigate = useNavigate();
  const user = useDreamStore((state) => state.user);
  const totalEarned = useDreamStore((state) => state.totalEarned);
  const contentCount = useDreamStore((state) => state.contentCount);
  const logout = useDreamStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <MobileLayout>
      <div className="px-4 py-6 safe-top">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-gold flex items-center justify-center">
              <span className="text-4xl font-bold text-primary-foreground">
                {user?.username?.charAt(0).toUpperCase() || "D"}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center border-4 border-background">
              <Crown className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>

          <h1 className="font-display text-2xl font-bold text-foreground mb-1">
            @{user?.username || "dreamer"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {user?.university || "Dream$ Creator"}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          <Card variant="earning">
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gradient-gold">₦{totalEarned.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Earned</p>
            </CardContent>
          </Card>
          
          <Card variant="gradient">
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                  <Video className="w-5 h-5 text-success" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{contentCount}</p>
              <p className="text-xs text-muted-foreground">Posts Created</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <Card variant="gradient">
            <CardContent className="p-0">
              {[
                { icon: User, label: "Edit Profile", onClick: () => {} },
                { icon: Coins, label: "Earning History", onClick: () => navigate("/wallet") },
                { icon: Settings, label: "Settings", onClick: () => {} },
              ].map((item, index) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={`w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors ${
                    index > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium text-foreground">{item.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              ))}
            </CardContent>
          </Card>

          <Card variant="default">
            <CardContent className="p-0">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-4 text-destructive hover:bg-destructive/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Log Out</span>
                </div>
                <ChevronRight className="w-5 h-5" />
              </button>
            </CardContent>
          </Card>
        </motion.div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-gradient-gold font-display font-bold text-lg mb-1">Dream$</p>
          <p className="text-xs text-muted-foreground">Version 1.0.0 (MVP)</p>
          <p className="text-xs text-muted-foreground mt-2">
            Made with ❤️ in Nigeria
          </p>
        </motion.div>
      </div>
    </MobileLayout>
  );
}
