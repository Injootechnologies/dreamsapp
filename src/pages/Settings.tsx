import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowLeft, User, Lock, LogOut, ChevronRight, Save } from "lucide-react";
import { useDreamStore } from "@/lib/store";
import { toast } from "sonner";

type SettingsView = 'main' | 'edit-profile' | 'change-password';

export default function Settings() {
  const navigate = useNavigate();
  const [view, setView] = useState<SettingsView>('main');
  
  const user = useDreamStore((state) => state.user);
  const updateProfile = useDreamStore((state) => state.updateProfile);
  const logout = useDreamStore((state) => state.logout);
  
  // Edit profile state
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Change password state (UI only)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSaveProfile = () => {
    updateProfile({ username, bio, email });
    toast.success("Profile updated!");
    setView('main');
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    toast.success("Password changed! (simulated)");
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setView('main');
  };

  if (view === 'edit-profile') {
    return (
      <MobileLayout hideNav>
        <div className="px-4 py-6 safe-top">
          <button
            onClick={() => setView('main')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display text-2xl font-bold text-foreground mb-6">
              Edit Profile
            </h1>

            <div className="space-y-4 mb-8">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Username
                </label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="h-12"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Bio
                </label>
                <Input
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself"
                  className="h-12"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="h-12"
                />
              </div>
            </div>

            <Button
              variant="gold"
              size="xl"
              className="w-full"
              onClick={handleSaveProfile}
            >
              <Save className="w-5 h-5" />
              Save Changes
            </Button>
          </motion.div>
        </div>
      </MobileLayout>
    );
  }

  if (view === 'change-password') {
    return (
      <MobileLayout hideNav>
        <div className="px-4 py-6 safe-top">
          <button
            onClick={() => setView('main')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display text-2xl font-bold text-foreground mb-6">
              Change Password
            </h1>

            <div className="space-y-4 mb-8">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Current Password
                </label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="h-12"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  New Password
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="h-12"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="h-12"
                />
              </div>
            </div>

            <Button
              variant="gold"
              size="xl"
              className="w-full"
              onClick={handleChangePassword}
              disabled={!currentPassword || !newPassword || !confirmPassword}
            >
              <Lock className="w-5 h-5" />
              Update Password
            </Button>
            
            <p className="text-xs text-muted-foreground text-center mt-4">
              Password changes are simulated in beta
            </p>
          </motion.div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="px-4 py-6 safe-top">
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-display text-2xl font-bold text-foreground">
            Settings
          </h1>
        </motion.div>

        {/* Beta badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
            <p className="text-sm text-primary font-medium">🧪 Beta Version</p>
            <p className="text-xs text-muted-foreground mt-1">
              Demo content • Simulated payouts • Economy subject to change
            </p>
          </div>
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
              <button
                onClick={() => setView('edit-profile')}
                className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">Edit Profile</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
              
              <button
                onClick={() => setView('change-password')}
                className="w-full flex items-center justify-between p-4 border-t border-border hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">Change Password</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
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
          <p className="text-xs text-muted-foreground">Version 1.0.0 (Beta)</p>
          <p className="text-xs text-muted-foreground mt-2">
            Made with ❤️ in Nigeria
          </p>
        </motion.div>
      </div>
    </MobileLayout>
  );
}
