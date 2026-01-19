import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useDreamStore } from "@/lib/store";

export default function Login() {
  const navigate = useNavigate();
  const login = useDreamStore((state) => state.login);
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create mock user with full profile
    login({
      id: Math.random().toString(36).substr(2, 9),
      username: formData.email.split("@")[0] || "dreamer",
      email: formData.email,
      createdAt: new Date(),
      followers: 0,
      following: 0,
    });
    
    navigate("/home");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background px-6 py-8">
      {/* Demo Badge */}
      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary/20 border border-primary/50">
        <span className="text-xs font-medium text-primary">Demo</span>
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
          Welcome Back
        </h1>
        <p className="text-muted-foreground">
          Log in to continue exploring.
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
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
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

          <button type="button" className="text-sm text-primary hover:underline">
            Forgot password?
          </button>
        </div>

        <div className="mt-auto space-y-4">
          <Button type="submit" variant="gold" size="xl" className="w-full">
            Log In
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </motion.form>
    </div>
  );
}
