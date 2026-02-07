import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowLeft, User, Lock, LogOut, ChevronRight, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usernameSchema, bioSchema } from "@/lib/validation";
import { z } from "zod";

type SettingsView = 'main' | 'edit-profile' | 'change-password';

export default function Settings() {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [view, setView] = useState<SettingsView>('main');
  
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    // Validate inputs with zod
    try {
      usernameSchema.parse(username);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }

    try {
      bioSchema.parse(bio);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }
    
    const { error } = await supabase
      .from('profiles')
      .update({ username: username.trim(), bio: bio.trim() })
      .eq('user_id', user.id);
    
    if (error) {
      if (error.message?.includes('duplicate') || error.code === '23505') {
        toast.error("Username is already taken");
      } else {
        toast.error("Failed to update profile");
      }
      return;
    }
    
    await refreshProfile();
    toast.success("Profile updated!");
    setView('main');
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) {
      toast.error(error.message || "Failed to update password");
      return;
    }
    
    toast.success("Password changed successfully!");
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setView('main');
  };

  if (view === 'edit-profile') {
    return (
      <MobileLayout hideNav>
        <div className="px-4 py-6 safe-top">
          <button onClick={() => setView('main')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-5 h-5" /><span>Back</span>
          </button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-2xl font-bold text-foreground mb-6">Edit Profile</h1>
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Username</label>
                <Input value={username} onChange={(e) => setUsername(e.target.value.replace(/\s/g, '_'))} placeholder="Enter username" className="h-12" maxLength={30} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Bio</label>
                <Input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself" className="h-12" maxLength={500} />
              </div>
            </div>
            <Button variant="gold" size="xl" className="w-full" onClick={handleSaveProfile}>
              <Save className="w-5 h-5" /> Save Changes
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
          <button onClick={() => setView('main')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-5 h-5" /><span>Back</span>
          </button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-2xl font-bold text-foreground mb-6">Change Password</h1>
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">New Password</label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className="h-12" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Confirm New Password</label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="h-12" />
              </div>
            </div>
            <Button variant="gold" size="xl" className="w-full" onClick={handleChangePassword} disabled={!newPassword || !confirmPassword}>
              <Lock className="w-5 h-5" /> Update Password
            </Button>
          </motion.div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="px-4 py-6 safe-top">
        <button onClick={() => navigate("/profile")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" /><span>Back</span>
        </button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
            <p className="text-sm text-primary font-medium">🧪 Beta Version</p>
            <p className="text-xs text-muted-foreground mt-1">Demo content • Manual payouts • Economy subject to change</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
          <Card variant="gradient">
            <CardContent className="p-0">
              <button onClick={() => setView('edit-profile')} className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">Edit Profile</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
              <button onClick={() => setView('change-password')} className="w-full flex items-center justify-between p-4 border-t border-border hover:bg-secondary/50 transition-colors">
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
              <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 text-destructive hover:bg-destructive/10 transition-colors">
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Log Out</span>
                </div>
                <ChevronRight className="w-5 h-5" />
              </button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 text-center">
          <p className="text-gradient-gold font-display font-bold text-lg mb-1">Dream$</p>
          <p className="text-xs text-muted-foreground">Version 2.0.0 (Beta)</p>
          <p className="text-xs text-muted-foreground mt-2">Made with ❤️ in Nigeria</p>
        </motion.div>
      </div>
    </MobileLayout>
  );
}
