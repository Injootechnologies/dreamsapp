import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-6xl font-bold text-gradient-gold mb-4">404</h1>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mb-8">
          This page doesn't exist or has been moved.
        </p>
        <Button variant="gold" onClick={() => navigate("/")}>
          <Home className="w-5 h-5" />
          Back to Home
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
