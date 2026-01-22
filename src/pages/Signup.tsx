import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, User, AtSign, Phone, Lock } from "lucide-react";
import { useDreamStore } from "@/lib/store";

export default function Signup() {
  const navigate = useNavigate();
  const login = useDreamStore((state) => state.login);
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Full name validation (required, must have at least first and last name)
    const nameParts = formData.fullName.trim().split(/\s+/);
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (nameParts.length < 2) {
      newErrors.fullName = "Please enter your first and last name";
    }

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    // Email/Phone validation
    if (!formData.email.trim()) {
      newErrors.email = "Email or phone is required";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Create user with ZERO STATE and fullName for withdrawals
    login({
      id: Math.random().toString(36).substr(2, 9),
      fullName: formData.fullName.trim(),
      username: formData.username.trim().toLowerCase().replace(/\s+/g, '_'),
      email: formData.email.trim(),
      createdAt: new Date(),
      followers: 0,
      following: 0,
    });
    
    navigate("/onboarding");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background px-6 py-8">
      {/* Demo Badge */}
      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary/20 border border-primary/50">
        <span className="text-xs font-medium text-primary">Beta</span>
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Join <span className="text-gradient-gold">DREAMS</span>
        </h1>
        <p className="text-muted-foreground">
          Create your account to get started.
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
        <div className="space-y-4 mb-6">
          {/* Full Name */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Full Name (Legal Name)
              <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              placeholder="First Middle Last"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className={errors.fullName ? "border-destructive" : ""}
            />
            {errors.fullName && (
              <p className="text-xs text-destructive mt-1">{errors.fullName}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              This name will be used for withdrawal verification
            </p>
          </div>

          {/* Username */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
              <AtSign className="w-4 h-4 text-muted-foreground" />
              Username
              <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              placeholder="Choose a unique username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value.replace(/\s/g, '_') })}
              className={errors.username ? "border-destructive" : ""}
            />
            {errors.username && (
              <p className="text-xs text-destructive mt-1">{errors.username}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              This is your public display name
            </p>
          </div>

          {/* Email or Phone */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              Email or Phone
              <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              placeholder="Enter your email or phone number"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-xs text-destructive mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              Password
              <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`pr-12 ${errors.password ? "border-destructive" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive mt-1">{errors.password}</p>
            )}
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
