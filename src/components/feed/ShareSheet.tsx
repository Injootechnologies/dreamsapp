import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, MessageCircle, Twitter } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  postId?: string;
  profileUsername?: string;
  type?: 'post' | 'profile';
}

const APP_URL = "https://dreamsapp.lovable.app";

export function ShareSheet({ isOpen, onClose, postId, profileUsername, type = 'post' }: ShareSheetProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = type === 'profile'
    ? `${APP_URL}/creator/${profileUsername}`
    : `${APP_URL}/p/${postId}`;

  const shareText = type === 'profile'
    ? `Check out @${profileUsername} on DREAM$ 🔥`
    : `Check out this post on DREAM$ 🔥`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 1200);
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`, '_blank');
    onClose();
  };

  const handleTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    onClose();
  };

  const handleInstagram = () => {
    // Instagram doesn't have a direct share URL, copy link and inform user
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied! Paste it in your Instagram story or DM");
    onClose();
  };

  const shareOptions = [
    {
      label: "WhatsApp",
      icon: <MessageCircle className="w-6 h-6" />,
      color: "bg-green-600",
      action: handleWhatsApp,
    },
    {
      label: "Twitter / X",
      icon: <Twitter className="w-6 h-6" />,
      color: "bg-foreground",
      action: handleTwitter,
    },
    {
      label: "Instagram",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      ),
      color: "bg-gradient-to-br from-purple-600 to-pink-500",
      action: handleInstagram,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl p-6 max-w-[480px] mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-lg font-bold text-foreground">Share</h3>
              <button onClick={onClose}>
                <X className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>

            {/* Share options grid */}
            <div className="flex justify-around mb-6">
              {shareOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={opt.action}
                  className="flex flex-col items-center gap-2"
                >
                  <div className={`w-14 h-14 rounded-full ${opt.color} flex items-center justify-center text-white`}>
                    {opt.icon}
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{opt.label}</span>
                </button>
              ))}
            </div>

            {/* Copy link */}
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                {copied ? <Check className="w-6 h-6 text-primary" /> : <Copy className="w-6 h-6 text-primary" />}
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">{copied ? "Link copied!" : "Copy link"}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[250px]">{shareUrl}</p>
              </div>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
