import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Bookmark, Share2, Send, X, Copy, Check } from "lucide-react";
import { demoPosts, useDreamStore, Post } from "@/lib/store";
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
  const [showCommentModal, setShowCommentModal] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  const likedPosts = useDreamStore((state) => state.likedPosts);
  const savedPosts = useDreamStore((state) => state.savedPosts);
  const userPosts = useDreamStore((state) => state.userPosts);
  const toggleLike = useDreamStore((state) => state.toggleLike);
  const toggleSave = useDreamStore((state) => state.toggleSave);
  const addComment = useDreamStore((state) => state.addComment);
  const getPostComments = useDreamStore((state) => state.getPostComments);

  // Generate infinite feed with shuffled posts
  const generateMorePosts = useCallback((currentPosts: Post[], tab: FeedTab) => {
    const tabPosts = demoPosts.filter(p => p.category === tab);
    // Include user uploaded posts in foryou
    const allPosts = tab === 'foryou' ? [...tabPosts, ...userPosts] : tabPosts;
    const shuffled = shuffleArray(allPosts);
    const newPosts = shuffled.map((p, i) => ({
      ...p,
      id: `${p.id}-${Date.now()}-${i}`,
    }));
    return [...currentPosts, ...newPosts];
  }, [userPosts]);

  // Initialize feed
  useEffect(() => {
    const tabPosts = demoPosts.filter(p => p.category === activeTab);
    const allPosts = activeTab === 'foryou' ? [...tabPosts, ...userPosts] : tabPosts;
    const shuffled = shuffleArray(allPosts);
    const infinitePosts = shuffled.map((p, i) => ({
      ...p,
      id: `${p.id}-init-${i}`,
    }));
    setPosts(infinitePosts);
  }, [activeTab, userPosts]);

  // Infinite scroll - load more when near bottom
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const height = container.clientHeight;
    const scrollHeight = container.scrollHeight;
    
    // Load more posts when 80% scrolled
    if (scrollTop + height >= scrollHeight * 0.8) {
      setPosts(prev => generateMorePosts(prev, activeTab));
    }
  }, [activeTab, generateMorePosts]);

  const handleLike = (postId: string) => {
    const baseId = postId.split('-')[0];
    toggleLike(baseId);
  };

  const handleSave = (postId: string) => {
    const baseId = postId.split('-')[0];
    toggleSave(baseId);
  };

  const handleComment = (postId: string) => {
    if (!commentText.trim()) return;
    const baseId = postId.split('-')[0];
    addComment(baseId, commentText);
    setCommentText("");
    toast.success("Comment added!");
  };

  const handleCopyLink = (postId: string) => {
    const baseId = postId.split('-')[0];
    navigator.clipboard.writeText(`https://dreams.app/p/${baseId}`);
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
          {/* Logo */}
          <div className="px-3 py-1.5 rounded-full bg-card/90 backdrop-blur-sm border border-border">
            <span className="text-sm font-bold text-gradient-gold">DREAMS</span>
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
          
          {/* Demo badge */}
          <div className="px-2 py-1 rounded-full bg-primary/20 border border-primary/50">
            <span className="text-[10px] font-medium text-primary">Demo</span>
          </div>
        </div>
      </div>

      {/* Image Feed */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-[100dvh] overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {posts.map((post) => {
          const baseId = post.id.split('-')[0];
          const isLiked = likedPosts.has(baseId);
          const isSaved = savedPosts.has(baseId);
          const comments = getPostComments(baseId);
          
          return (
            <div
              key={post.id}
              className="h-[100dvh] snap-start snap-always relative flex items-end"
              style={{ scrollSnapAlign: 'start' }}
            >
              {/* Image */}
              <img
                src={post.imageUrl}
                alt={post.caption}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

              {/* Content overlay */}
              <div className="relative z-10 w-full p-4 pb-24">
                <div className="flex items-end justify-between max-w-[480px] mx-auto">
                  {/* Left side - Creator info */}
                  <div className="flex-1 mr-4">
                    <button 
                      onClick={() => handleCreatorClick(post.creatorId)}
                      className="flex items-center gap-2 mb-2 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-primary-foreground font-bold text-sm">
                        {post.creatorAvatar || post.creator.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-foreground">@{post.creator}</span>
                    </button>
                    <p className="text-foreground/90 text-sm line-clamp-2 mb-3">
                      {post.caption}
                    </p>
                  </div>

                  {/* Right side - Actions */}
                  <div className="flex flex-col items-center gap-5">
                    {/* Profile */}
                    <button 
                      onClick={() => handleCreatorClick(post.creatorId)}
                      className="relative"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-primary-foreground font-bold">
                        {post.creatorAvatar || post.creator.charAt(1).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-[10px] text-primary-foreground">+</span>
                      </div>
                    </button>

                    {/* Like */}
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex flex-col items-center gap-1"
                    >
                      <div className={`p-2 rounded-full ${isLiked ? "text-red-500" : "text-foreground"}`}>
                        <Heart
                          className={`w-7 h-7 transition-all ${isLiked ? "fill-current scale-110" : ""}`}
                        />
                      </div>
                      <span className="text-xs text-foreground font-medium">
                        {(post.likes + (isLiked ? 1 : 0) - (likedPosts.has(baseId) && !isLiked ? 1 : 0)).toLocaleString()}
                      </span>
                    </button>

                    {/* Comment */}
                    <button 
                      onClick={() => setShowCommentModal(post.id)}
                      className="flex flex-col items-center gap-1"
                    >
                      <div className="p-2 text-foreground">
                        <MessageCircle className="w-7 h-7" />
                      </div>
                      <span className="text-xs text-foreground font-medium">
                        {comments.length + post.comments.length}
                      </span>
                    </button>

                    {/* Save */}
                    <button
                      onClick={() => handleSave(post.id)}
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
                      onClick={() => setShowShareModal(post.id)}
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
                <h3 className="font-display text-lg font-bold text-foreground">Comments</h3>
                <button onClick={() => setShowCommentModal(null)}>
                  <X className="w-6 h-6 text-muted-foreground" />
                </button>
              </div>

              {/* Comments list */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {(() => {
                  const baseId = showCommentModal.split('-')[0];
                  const comments = getPostComments(baseId);
                  const post = posts.find(p => p.id === showCommentModal);
                  const allComments = [...(post?.comments || []), ...comments];
                  
                  if (allComments.length === 0) {
                    return (
                      <p className="text-center text-muted-foreground py-8">
                        No comments yet. Be the first!
                      </p>
                    );
                  }
                  
                  return allComments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                        {comment.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-semibold text-foreground">{comment.username}</span>{" "}
                          <span className="text-foreground/80">{comment.text}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {/* Add comment */}
              <div className="flex gap-2 border-t border-border pt-4">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && showCommentModal) {
                      handleComment(showCommentModal);
                    }
                  }}
                />
                <Button 
                  variant="gold" 
                  size="icon"
                  onClick={() => showCommentModal && handleComment(showCommentModal)}
                  disabled={!commentText.trim()}
                >
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
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end justify-center"
            onClick={() => setShowShareModal(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full max-w-[480px] bg-card rounded-t-3xl p-6"
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
                    <Check className="w-5 h-5 mr-2" />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MobileLayout>
  );
}
