import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Bookmark, Share2, Send, X, Target, Copy, Check } from "lucide-react";
import { demoVideos, useDreamStore, Video } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type FeedTab = 'foryou' | 'following' | 'explore';

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function HomeFeed() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FeedTab>('foryou');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showEarning, setShowEarning] = useState<{videoId: string; amount: number} | null>(null);
  const [showCommentModal, setShowCommentModal] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Video progress tracking
  const [videoProgress, setVideoProgress] = useState<Map<string, number>>(new Map());
  
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  const user = useDreamStore((state) => state.user);
  const availableBalance = useDreamStore((state) => state.availableBalance);
  const likedVideos = useDreamStore((state) => state.likedVideos);
  const savedVideos = useDreamStore((state) => state.savedVideos);
  const earnedFromVideos = useDreamStore((state) => state.earnedFromVideos);
  const userVideos = useDreamStore((state) => state.userVideos);
  const toggleLike = useDreamStore((state) => state.toggleLike);
  const toggleSave = useDreamStore((state) => state.toggleSave);
  const addComment = useDreamStore((state) => state.addComment);
  const getVideoComments = useDreamStore((state) => state.getVideoComments);
  const markVideoFullyWatched = useDreamStore((state) => state.markVideoFullyWatched);

  // Generate infinite feed with shuffled videos
  const generateMoreVideos = useCallback((currentVideos: Video[], tab: FeedTab) => {
    const tabVideos = demoVideos.filter(v => v.category === tab);
    // Include user uploaded videos in foryou
    const allVideos = tab === 'foryou' ? [...tabVideos, ...userVideos] : tabVideos;
    const shuffled = shuffleArray(allVideos);
    const newVideos = shuffled.map((v, i) => ({
      ...v,
      id: `${v.id}-${Date.now()}-${i}`,
    }));
    return [...currentVideos, ...newVideos];
  }, [userVideos]);

  // Initialize feed
  useEffect(() => {
    const tabVideos = demoVideos.filter(v => v.category === activeTab);
    const allVideos = activeTab === 'foryou' ? [...tabVideos, ...userVideos] : tabVideos;
    const shuffled = shuffleArray(allVideos);
    const infiniteVideos = shuffled.map((v, i) => ({
      ...v,
      id: `${v.id}-init-${i}`,
    }));
    setVideos(infiniteVideos);
    setCurrentIndex(0);
    setVideoProgress(new Map());
  }, [activeTab, userVideos]);

  // Intersection Observer for autoplay
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoElement = entry.target as HTMLVideoElement;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.8) {
            videoElement.play().catch(() => {});
          } else {
            videoElement.pause();
          }
        });
      },
      { threshold: 0.8 }
    );

    return () => observerRef.current?.disconnect();
  }, []);

  // Attach observer to videos
  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (observerRef.current) {
        observerRef.current.observe(video);
      }
    });

    return () => {
      videoRefs.current.forEach((video) => {
        if (observerRef.current) {
          observerRef.current.unobserve(video);
        }
      });
    };
  }, [videos]);

  // Handle video time update for 100% watch tracking
  const handleTimeUpdate = useCallback((videoId: string, video: Video, currentTime: number, duration: number) => {
    if (duration === 0) return;
    
    const progress = (currentTime / duration) * 100;
    setVideoProgress(prev => new Map(prev).set(videoId, progress));
    
    // Check if 100% watched
    if (progress >= 98 && video.isMonetized && !earnedFromVideos.has(video.id.split('-')[0])) {
      const baseId = video.id.split('-')[0];
      const earned = markVideoFullyWatched(baseId, video);
      if (earned) {
        setShowEarning({ videoId: video.id, amount: video.rewardAmount });
        setTimeout(() => setShowEarning(null), 3000);
      }
    }
  }, [earnedFromVideos, markVideoFullyWatched]);

  // Infinite scroll - load more when near bottom
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const height = container.clientHeight;
    const scrollHeight = container.scrollHeight;
    const newIndex = Math.round(scrollTop / height);
    
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
    
    // Load more videos when 80% scrolled
    if (scrollTop + height >= scrollHeight * 0.8) {
      setVideos(prev => generateMoreVideos(prev, activeTab));
    }
  }, [currentIndex, activeTab, generateMoreVideos]);

  const handleLike = (videoId: string) => {
    const baseId = videoId.split('-')[0];
    toggleLike(baseId);
    // NO earnings for likes!
  };

  const handleSave = (videoId: string) => {
    const baseId = videoId.split('-')[0];
    toggleSave(baseId);
    // NO earnings for saves!
  };

  const handleComment = (videoId: string) => {
    if (!commentText.trim()) return;
    const baseId = videoId.split('-')[0];
    addComment(baseId, commentText);
    setCommentText("");
    toast.success("Comment added!");
    // NO earnings for comments!
  };

  const handleCopyLink = (videoId: string) => {
    const baseId = videoId.split('-')[0];
    navigator.clipboard.writeText(`https://dreams.app/v/${baseId}`);
    setCopiedLink(true);
    toast.success("Link copied!");
    setTimeout(() => {
      setCopiedLink(false);
      setShowShareModal(null);
    }, 1500);
  };

  const handleCreatorClick = (creatorId: string) => {
    navigate(`/creator/${creatorId}`);
  };

  const tabs: { key: FeedTab; label: string }[] = [
    { key: 'foryou', label: 'For You' },
    { key: 'following', label: 'Following' },
    { key: 'explore', label: 'Explore' },
  ];

  return (
    <MobileLayout>
      {/* Top Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-background/95 to-transparent pt-4 pb-8 px-4">
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
        className="h-[100dvh] overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {videos.map((video, index) => {
          const baseId = video.id.split('-')[0];
          const isLiked = likedVideos.has(baseId);
          const isSaved = savedVideos.has(baseId);
          const hasEarned = earnedFromVideos.has(baseId);
          const comments = getVideoComments(baseId);
          const progress = videoProgress.get(video.id) || 0;
          
          return (
            <div
              key={video.id}
              className="h-[100dvh] snap-start snap-always relative flex items-end"
              style={{ scrollSnapAlign: 'start' }}
            >
              {/* Video Player */}
              <video
                ref={(el) => {
                  if (el) {
                    videoRefs.current.set(video.id, el);
                    el.ontimeupdate = () => handleTimeUpdate(video.id, video, el.currentTime, el.duration);
                  }
                }}
                src={video.videoUrl}
                className="absolute inset-0 w-full h-full object-cover"
                loop
                muted
                playsInline
                preload="metadata"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

              {/* Monetization indicator */}
              <div className="absolute top-20 left-4 z-30">
                {video.isMonetized ? (
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
                    hasEarned ? "bg-success/30 border border-success" : "bg-primary/30 border border-primary"
                  }`}>
                    <Target className={`w-3.5 h-3.5 ${hasEarned ? "text-success" : "text-primary"}`} />
                    <span className={`text-xs font-medium ${hasEarned ? "text-success" : "text-primary"}`}>
                      {hasEarned ? "Earned ₦" + video.rewardAmount : "🎯 Eligible for ₦" + video.rewardAmount}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border">
                    <span className="text-xs text-muted-foreground">This video is not monetized</span>
                  </div>
                )}
              </div>

              {/* Watch progress bar for monetized videos */}
              {video.isMonetized && !hasEarned && (
                <div className="absolute top-28 left-4 right-20 z-30">
                  <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Watch 100% to earn
                  </p>
                </div>
              )}

              {/* Earning notification */}
              <AnimatePresence>
                {showEarning?.videoId === video.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.8 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
                  >
                    <div className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-amber-500 text-primary-foreground shadow-2xl">
                      <p className="text-2xl font-bold">+₦{showEarning.amount}</p>
                      <p className="text-sm opacity-90">Reward earned! 🎉</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Content overlay */}
              <div className="relative z-10 w-full p-4 pb-24">
                <div className="flex items-end justify-between max-w-[480px] mx-auto">
                  {/* Left side - Creator info */}
                  <div className="flex-1 mr-4">
                    <button 
                      onClick={() => handleCreatorClick(video.creatorId)}
                      className="flex items-center gap-2 mb-2 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-primary-foreground font-bold text-sm">
                        {video.creatorAvatar || video.creator.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-foreground">@{video.creator}</span>
                    </button>
                    <p className="text-foreground/90 text-sm line-clamp-2 mb-3">
                      {video.caption}
                    </p>
                  </div>

                  {/* Right side - Actions */}
                  <div className="flex flex-col items-center gap-5">
                    {/* Profile */}
                    <button 
                      onClick={() => handleCreatorClick(video.creatorId)}
                      className="relative"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-primary-foreground font-bold">
                        {video.creatorAvatar || video.creator.charAt(1).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-[10px] text-primary-foreground">+</span>
                      </div>
                    </button>

                    {/* Like - NO earnings */}
                    <button
                      onClick={() => handleLike(video.id)}
                      className="flex flex-col items-center gap-1"
                    >
                      <div className={`p-2 rounded-full ${isLiked ? "text-red-500" : "text-foreground"}`}>
                        <Heart
                          className={`w-7 h-7 transition-all ${isLiked ? "fill-current scale-110" : ""}`}
                        />
                      </div>
                      <span className="text-xs text-foreground font-medium">
                        {(video.likes + (isLiked ? 1 : 0)).toLocaleString()}
                      </span>
                    </button>

                    {/* Comment - NO earnings */}
                    <button 
                      onClick={() => setShowCommentModal(video.id)}
                      className="flex flex-col items-center gap-1"
                    >
                      <div className="p-2 text-foreground">
                        <MessageCircle className="w-7 h-7" />
                      </div>
                      <span className="text-xs text-foreground font-medium">
                        {comments.length + video.comments.length}
                      </span>
                    </button>

                    {/* Save - NO earnings */}
                    <button
                      onClick={() => handleSave(video.id)}
                      className="flex flex-col items-center gap-1"
                    >
                      <div className={`p-2 ${isSaved ? "text-primary" : "text-foreground"}`}>
                        <Bookmark
                          className={`w-7 h-7 transition-all ${isSaved ? "fill-current" : ""}`}
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
          );
        })}
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
              className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl p-6 max-h-[70vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display text-lg font-bold text-foreground">
                  Comments
                </h3>
                <button onClick={() => setShowCommentModal(null)}>
                  <X className="w-6 h-6 text-muted-foreground" />
                </button>
              </div>
              
              {/* Comments list */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {(() => {
                  const baseId = showCommentModal.split('-')[0];
                  const comments = getVideoComments(baseId);
                  
                  if (comments.length === 0) {
                    return (
                      <div className="text-center text-muted-foreground py-8">
                        Be the first to comment!
                      </div>
                    );
                  }
                  
                  return comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                        {comment.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{comment.username}</p>
                        <p className="text-sm text-muted-foreground">{comment.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ));
                })()}
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && showCommentModal) {
                      handleComment(showCommentModal);
                    }
                  }}
                />
                <Button variant="gold" size="icon" onClick={() => handleComment(showCommentModal)}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground text-center mt-3">
                Comments do not earn rewards
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal - Simple copy link */}
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
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-lg font-bold text-foreground">Share</h3>
                <button onClick={() => setShowShareModal(null)}>
                  <X className="w-6 h-6 text-muted-foreground" />
                </button>
              </div>
              
              <Button
                variant="gold"
                size="lg"
                className="w-full"
                onClick={() => handleCopyLink(showShareModal)}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-5 h-5" />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy Video Link
                  </>
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center mt-4">
                Sharing does not earn rewards
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MobileLayout>
  );
}
