import { useState, useRef, useEffect, useCallback } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Bookmark, Share2, Music2, Send, X } from "lucide-react";
import { demoVideos, useDreamStore, Video } from "@/lib/store";
import { EarningBadge } from "@/components/EarningBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FeedTab = 'foryou' | 'following' | 'explore';

export default function HomeFeed() {
  const [activeTab, setActiveTab] = useState<FeedTab>('foryou');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showEarning, setShowEarning] = useState<{videoId: string; amount: number} | null>(null);
  const [showCommentModal, setShowCommentModal] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  
  const availableBalance = useDreamStore((state) => state.availableBalance);
  const likedVideos = useDreamStore((state) => state.likedVideos);
  const savedVideos = useDreamStore((state) => state.savedVideos);
  const watchedVideos = useDreamStore((state) => state.watchedVideos);
  const toggleLike = useDreamStore((state) => state.toggleLike);
  const toggleSave = useDreamStore((state) => state.toggleSave);
  const markVideoWatched = useDreamStore((state) => state.markVideoWatched);
  const addComment = useDreamStore((state) => state.addComment);

  // Filter videos by tab and add more for infinite scroll
  useEffect(() => {
    const tabVideos = demoVideos.filter(v => v.category === activeTab);
    // Duplicate videos for infinite scroll effect
    const infiniteVideos = [...tabVideos, ...tabVideos, ...tabVideos].map((v, i) => ({
      ...v,
      id: `${v.id}-${i}`,
    }));
    setVideos(infiniteVideos);
    setCurrentIndex(0);
  }, [activeTab]);

  // Handle video autoplay
  useEffect(() => {
    videoRefs.current.forEach((video, id) => {
      const videoIndex = videos.findIndex(v => v.id === id);
      if (videoIndex === currentIndex) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [currentIndex, videos]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const height = container.clientHeight;
    const newIndex = Math.round(scrollTop / height);
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < videos.length) {
      setCurrentIndex(newIndex);
      const video = videos[newIndex];
      
      // Award earning if not already watched
      if (video && !watchedVideos.has(video.id.split('-')[0])) {
        const earned = markVideoWatched(video.id.split('-')[0]);
        if (earned) {
          setShowEarning({ videoId: video.id, amount: 20 });
          setTimeout(() => setShowEarning(null), 2000);
        }
      }
    }
  }, [currentIndex, videos, watchedVideos, markVideoWatched]);

  const handleLike = (videoId: string) => {
    const baseId = videoId.split('-')[0];
    const earned = toggleLike(baseId);
    if (earned) {
      setShowEarning({ videoId, amount: 5 });
      setTimeout(() => setShowEarning(null), 1500);
    }
  };

  const handleSave = (videoId: string) => {
    const baseId = videoId.split('-')[0];
    const earned = toggleSave(baseId);
    if (earned) {
      setShowEarning({ videoId, amount: 5 });
      setTimeout(() => setShowEarning(null), 1500);
    }
  };

  const handleComment = (videoId: string) => {
    if (!commentText.trim()) return;
    const baseId = videoId.split('-')[0];
    addComment(baseId, commentText);
    setCommentText("");
    setShowEarning({ videoId, amount: 10 });
    setTimeout(() => {
      setShowEarning(null);
      setShowCommentModal(null);
    }, 1500);
  };

  const tabs: { key: FeedTab; label: string }[] = [
    { key: 'foryou', label: 'For You' },
    { key: 'following', label: 'Following' },
    { key: 'explore', label: 'Explore' },
  ];

  return (
    <MobileLayout>
      {/* Top Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-background/90 to-transparent pt-4 pb-8 px-4">
        <div className="max-w-[480px] mx-auto flex justify-between items-center">
          {/* Balance */}
          <div className="px-3 py-1.5 rounded-full bg-card/90 backdrop-blur-sm border border-border">
            <span className="text-xs text-muted-foreground">Balance: </span>
            <span className="text-sm font-bold text-primary">₦{availableBalance.toLocaleString()}</span>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-1 bg-card/90 backdrop-blur-sm rounded-full p-1 border border-border">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Beta badge */}
          <div className="px-2 py-1 rounded-full bg-success/20 border border-success/50">
            <span className="text-[10px] font-medium text-success">Beta</span>
          </div>
        </div>
      </div>

      {/* Video Feed */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-[100dvh] overflow-y-scroll snap-y-mandatory scrollbar-hide"
      >
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="h-[100dvh] snap-start relative flex items-end"
          >
            {/* Video Player */}
            <video
              ref={(el) => {
                if (el) videoRefs.current.set(video.id, el);
              }}
              src={video.videoUrl}
              className="absolute inset-0 w-full h-full object-cover"
              loop
              muted
              playsInline
              poster={video.thumbnail}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

            {/* Earning notification */}
            <AnimatePresence>
              {showEarning?.videoId === video.id && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.8 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
                >
                  <EarningBadge amount={showEarning.amount} className="px-6 py-3 text-lg" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content overlay */}
            <div className="relative z-10 w-full p-4 pb-24">
              <div className="flex items-end justify-between max-w-[480px] mx-auto">
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
                    <p className="text-xs text-foreground/70 whitespace-nowrap animate-pulse">
                      Original Sound - {video.creator}
                    </p>
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
                    onClick={() => handleLike(video.id)}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className={`p-2 rounded-full ${likedVideos.has(video.id.split('-')[0]) ? "text-red-500" : "text-foreground"}`}>
                      <Heart
                        className={`w-7 h-7 transition-all ${likedVideos.has(video.id.split('-')[0]) ? "fill-current scale-110" : ""}`}
                      />
                    </div>
                    <span className="text-xs text-foreground font-medium">
                      {(video.likes + (likedVideos.has(video.id.split('-')[0]) ? 1 : 0)).toLocaleString()}
                    </span>
                  </button>

                  {/* Comment */}
                  <button 
                    onClick={() => setShowCommentModal(video.id)}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="p-2 text-foreground">
                      <MessageCircle className="w-7 h-7" />
                    </div>
                    <span className="text-xs text-foreground font-medium">
                      {video.comments.length || Math.floor(Math.random() * 500)}
                    </span>
                  </button>

                  {/* Save */}
                  <button
                    onClick={() => handleSave(video.id)}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className={`p-2 ${savedVideos.has(video.id.split('-')[0]) ? "text-primary" : "text-foreground"}`}>
                      <Bookmark
                        className={`w-7 h-7 transition-all ${savedVideos.has(video.id.split('-')[0]) ? "fill-current" : ""}`}
                      />
                    </div>
                    <span className="text-xs text-foreground font-medium">Save</span>
                  </button>

                  {/* Share */}
                  <button 
                    onClick={() => setShowShareModal(video.id)}
                    className="flex flex-col items-center gap-1"
                  >
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

      {/* Comment Modal */}
      <AnimatePresence>
        {showCommentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowCommentModal(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl p-6 max-h-[60vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display text-lg font-bold text-foreground">Comments</h3>
                <button onClick={() => setShowCommentModal(null)}>
                  <X className="w-6 h-6 text-muted-foreground" />
                </button>
              </div>
              
              <div className="text-center text-muted-foreground py-8">
                Be the first to comment! (+₦10)
              </div>
              
              <div className="flex gap-2 mt-4">
                <Input
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1"
                />
                <Button variant="gold" size="icon" onClick={() => handleComment(showCommentModal)}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowShareModal(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display text-lg font-bold text-foreground">Share</h3>
                <button onClick={() => setShowShareModal(null)}>
                  <X className="w-6 h-6 text-muted-foreground" />
                </button>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                {['WhatsApp', 'Instagram', 'Twitter', 'Copy Link'].map((option) => (
                  <button
                    key={option}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-secondary transition-colors"
                    onClick={() => setShowShareModal(null)}
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Share2 className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs text-foreground">{option}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MobileLayout>
  );
}
