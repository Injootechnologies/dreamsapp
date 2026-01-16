import { useState, useRef } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Bookmark, Share2, Music2 } from "lucide-react";
import { mockVideos, useDreamStore } from "@/lib/store";
import { EarningBadge } from "@/components/EarningBadge";

export default function HomeFeed() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [earnedVideos, setEarnedVideos] = useState<Set<string>>(new Set());
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [savedVideos, setSavedVideos] = useState<Set<string>>(new Set());
  const [showEarning, setShowEarning] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const addEarning = useDreamStore((state) => state.addEarning);
  const todayEarnings = useDreamStore((state) => state.todayEarnings);
  const dailyLimit = useDreamStore((state) => state.dailyLimit);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const height = container.clientHeight;
    const newIndex = Math.round(scrollTop / height);
    
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      const video = mockVideos[newIndex];
      
      // Award earning if not already earned
      if (video && !earnedVideos.has(video.id) && todayEarnings < dailyLimit) {
        setEarnedVideos((prev) => new Set([...prev, video.id]));
        addEarning({
          type: "watch",
          amount: video.earning,
          description: `Watched video from ${video.creator}`,
        });
        setShowEarning(video.id);
        setTimeout(() => setShowEarning(null), 2000);
      }
    }
  };

  const toggleLike = (videoId: string) => {
    setLikedVideos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  const toggleSave = (videoId: string) => {
    setSavedVideos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  return (
    <MobileLayout>
      {/* Daily earnings indicator */}
      <div className="fixed top-4 left-4 right-4 z-40 flex justify-between items-center">
        <div className="px-3 py-1.5 rounded-full bg-card/90 backdrop-blur-sm border border-border">
          <span className="text-xs text-muted-foreground">Today: </span>
          <span className="text-sm font-bold text-primary">₦{todayEarnings}</span>
          <span className="text-xs text-muted-foreground">/{dailyLimit}</span>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-card/90 backdrop-blur-sm border border-border">
          <span className="text-sm font-semibold text-foreground">For You</span>
        </div>
      </div>

      {/* Video Feed */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-[100dvh] overflow-y-scroll snap-y-mandatory scrollbar-hide"
      >
        {mockVideos.map((video, index) => (
          <div
            key={video.id}
            className="h-[100dvh] snap-start relative flex items-end"
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${video.thumbnail})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            </div>

            {/* Earning notification */}
            <AnimatePresence>
              {showEarning === video.id && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.8 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
                >
                  <EarningBadge amount={video.earning} className="px-6 py-3 text-lg" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content overlay */}
            <div className="relative z-10 w-full p-4 pb-24">
              <div className="flex items-end justify-between">
                {/* Left side - Creator info */}
                <div className="flex-1 mr-4">
                  <h3 className="font-bold text-foreground text-lg mb-1">
                    {video.creator}
                  </h3>
                  <p className="text-foreground/90 text-sm line-clamp-2 mb-3">
                    {video.caption}
                  </p>
                  
                  {/* Music ticker */}
                  <div className="flex items-center gap-2">
                    <Music2 className="w-4 h-4 text-foreground/70" />
                    <div className="overflow-hidden max-w-[200px]">
                      <p className="text-xs text-foreground/70 whitespace-nowrap animate-pulse">
                        Original Sound - {video.creator}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right side - Actions */}
                <div className="flex flex-col items-center gap-5">
                  {/* Profile */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center text-primary-foreground font-bold">
                      {video.creator.charAt(1).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-[10px] text-primary-foreground">+</span>
                    </div>
                  </div>

                  {/* Like */}
                  <button
                    onClick={() => toggleLike(video.id)}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className={`p-2 rounded-full ${likedVideos.has(video.id) ? "text-red-500" : "text-foreground"}`}>
                      <Heart
                        className={`w-7 h-7 transition-all ${likedVideos.has(video.id) ? "fill-current scale-110" : ""}`}
                      />
                    </div>
                    <span className="text-xs text-foreground font-medium">
                      {(video.likes + (likedVideos.has(video.id) ? 1 : 0)).toLocaleString()}
                    </span>
                  </button>

                  {/* Comment */}
                  <button className="flex flex-col items-center gap-1">
                    <div className="p-2 text-foreground">
                      <MessageCircle className="w-7 h-7" />
                    </div>
                    <span className="text-xs text-foreground font-medium">
                      {video.comments.toLocaleString()}
                    </span>
                  </button>

                  {/* Save */}
                  <button
                    onClick={() => toggleSave(video.id)}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className={`p-2 ${savedVideos.has(video.id) ? "text-primary" : "text-foreground"}`}>
                      <Bookmark
                        className={`w-7 h-7 transition-all ${savedVideos.has(video.id) ? "fill-current" : ""}`}
                      />
                    </div>
                    <span className="text-xs text-foreground font-medium">Save</span>
                  </button>

                  {/* Share */}
                  <button className="flex flex-col items-center gap-1">
                    <div className="p-2 text-foreground">
                      <Share2 className="w-7 h-7" />
                    </div>
                    <span className="text-xs text-foreground font-medium">Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </MobileLayout>
  );
}
