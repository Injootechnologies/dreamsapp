import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useDreamStore } from "@/lib/store";

export default function Signup() {
  const navigate = useNavigate();
  const login = useDreamStore((state) => state.login);
  const resetToZeroState = useDreamStore((state) => state.resetToZeroState);
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    university: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create mock user with full profile - ZERO STATE
    login({
      id: Math.random().toString(36).substr(2, 9),
      username: formData.username,
      email: formData.email,
      university: formData.university,
      createdAt: new Date(),
      followers: 0,
      following: 0,
      totalViews: 0,
    });
    
    // Ensure zero state for new users
    resetToZeroState();
    
    navigate("/onboarding");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background px-6 py-8">
      {/* Beta Badge */}
      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary/20 border border-primary/50">
        <span className="text-xs font-medium text-primary">Beta</span>
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Join <span className="text-gradient-gold">Dream$</span>
        </h1>
        <p className="text-muted-foreground">
          Start earning from your screen time today.
        </p>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col"
      >
        <div className="space-y-4 mb-8">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Email or Phone
            </label>
            <Input
              type="text"
              placeholder="Enter your email or phone number"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Username
            </label>
            <Input
              type="text"
              placeholder="Choose a username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              University <span className="text-muted-foreground">(optional)</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. University of Lagos"
              value={formData.university}
              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-auto space-y-4">
          <Button type="submit" variant="gold" size="xl" className="w-full">
            Create Account
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Log in
            </Link>
          </p>
        </div>
      </motion.form>
    </div>
  );
}
