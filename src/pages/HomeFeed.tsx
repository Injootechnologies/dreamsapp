import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Bookmark, Share2, Send, X, Copy, Check, Coins, UserPlus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useFeedPosts, useUserLikes, useToggleLike, useEarnFromPost } from "@/hooks/usePosts";
import { useFollowing, useToggleFollow } from "@/hooks/useFollow";

type FeedTab = 'foryou' | 'following' | 'explore';

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
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<FeedTab>('foryou');
  const [showCommentModal, setShowCommentModal] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [earningToast, setEarningToast] = useState<{amount: number; id: string} | null>(null);
  const [doubleTapLike, setDoubleTapLike] = useState<string | null>(null);
  const [earnedPosts, setEarnedPosts] = useState<Set<string>>(new Set());
  
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<{time: number; postId: string | null}>({ time: 0, postId: null });
  
  const { data: allPosts = [], isLoading } = useFeedPosts();
  const { data: likedPosts = new Set<string>() } = useUserLikes();
  const { data: followingUsers = new Set<string>() } = useFollowing();
  const toggleLikeMutation = useToggleLike();
  const toggleFollowMutation = useToggleFollow();
  const earnMutation = useEarnFromPost();

  // Filter posts by tab
  const feedPosts = (() => {
    let filtered = allPosts;
    if (activeTab === 'following') {
      filtered = allPosts.filter(p => followingUsers.has(p.user_id));
    } else if (activeTab === 'explore') {
      filtered = allPosts.filter(p => p.category === 'explore' || !p.category);
    }
    return shuffleArray(filtered);
  })();

  // Double tap to like handler
  const handleDoubleTap = (postId: string) => {
    const now = Date.now();
    const lastTap = lastTapRef.current;
    
    if (lastTap.postId === postId && now - lastTap.time < 300) {
      if (!likedPosts.has(postId) && !postId.startsWith('demo-')) {
        toggleLikeMutation.mutate({ postId, isLiked: false });
      }
      setDoubleTapLike(postId);
      setTimeout(() => setDoubleTapLike(null), 800);
      lastTapRef.current = { time: 0, postId: null };
    } else {
      lastTapRef.current = { time: now, postId };
    }
  };

  const handleLike = (postId: string) => {
    if (postId.startsWith('demo-')) {
      toast.info("Like saved locally for demo posts");
      return;
    }
    toggleLikeMutation.mutate({ postId, isLiked: likedPosts.has(postId) });
  };

  const handleFollow = (userId: string) => {
    if (userId.startsWith('u')) {
      toast.info("Following demo creators is saved locally");
      return;
    }
    toggleFollowMutation.mutate({
      targetUserId: userId,
      isFollowing: followingUsers.has(userId),
    });
    toast.success(followingUsers.has(userId) ? "Unfollowed" : "Following!");
  };

  const handleEarn = useCallback((postId: string, amount: number) => {
    if (amount <= 0 || earnedPosts.has(postId) || postId.startsWith('demo-')) return;
    
    // For demo posts, just show toast (no real DB earning)
    if (postId.startsWith('demo-')) return;

    earnMutation.mutate({ postId, amount }, {
      onSuccess: (earned) => {
        if (earned) {
          setEarnedPosts(prev => new Set(prev).add(postId));
          setEarningToast({ amount, id: postId });
          setTimeout(() => setEarningToast(null), 2000);
        }
      },
    });
  }, [earnedPosts, earnMutation]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const height = container.clientHeight;
    
    const postScrolledPast = Math.floor((scrollTop + height * 0.3) / height);
    
    if (feedPosts[postScrolledPast - 1]) {
      const passedPost = feedPosts[postScrolledPast - 1];
      if (passedPost.is_eligible && passedPost.eligible_amount > 0 && !passedPost.id.startsWith('demo-')) {
        handleEarn(passedPost.id, passedPost.eligible_amount);
      }
    }
  }, [feedPosts, handleEarn]);

  const handleCopyLink = (postId: string) => {
    navigator.clipboard.writeText(`https://dreamsapp.lovable.app/p/${postId}`);
    setCopiedLink(true);
    toast.success("Link copied!");
    setTimeout(() => {
      setCopiedLink(false);
      setShowShareModal(null);
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
      <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-background/95 to-transparent pt-4 pb-8 px-4">
        <div className="max-w-[480px] mx-auto flex justify-between items-center">
          <div className="px-3 py-1.5 rounded-full bg-card/90 backdrop-blur-sm border border-border">
            <span className="text-sm font-bold text-gradient-gold">DREAMS</span>
          </div>
          
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
          
          <div className="px-2 py-1 rounded-full bg-primary/20 border border-primary/50 flex items-center gap-1">
            <Coins className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-medium text-primary">₦{profile?.wallet_balance?.toLocaleString() || '0'}</span>
          </div>
        </div>
      </div>

      {/* Earning Toast */}
      <AnimatePresence>
        {earningToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="px-4 py-2 rounded-full bg-gradient-to-r from-primary to-amber-500 text-primary-foreground font-bold text-sm flex items-center gap-2 shadow-lg">
              <Coins className="w-4 h-4" />
              ₦{earningToast.amount} earned!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state */}
      {isLoading && (
        <div className="h-[100dvh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Following empty state */}
      {activeTab === 'following' && feedPosts.length === 0 && !isLoading && (
        <div className="h-[100dvh] flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
            <UserPlus className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground mb-2">No posts yet</h2>
          <p className="text-muted-foreground mb-4">Follow creators to see their posts here</p>
          <Button variant="gold" onClick={() => setActiveTab('foryou')}>Explore For You</Button>
        </div>
      )}

      {/* Feed */}
      {feedPosts.length > 0 && !isLoading && (
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="h-[100dvh] overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
          style={{ scrollSnapType: 'y mandatory' }}
        >
          {feedPosts.map((post) => {
            const isLiked = likedPosts.has(post.id);
            const isFollowingUser = followingUsers.has(post.user_id);
            const username = post.profile?.username || 'creator';
            const avatarInitial = username.charAt(0).toUpperCase();
            
            return (
              <div
                key={post.id}
                className="h-[100dvh] snap-start snap-always relative flex items-end"
                onClick={() => handleDoubleTap(post.id)}
              >
                {/* Media */}
                {post.media_type === 'video' ? (
                  <video
                    src={post.media_url}
                    className="absolute inset-0 w-full h-full object-cover"
                    loop
                    muted
                    playsInline
                    autoPlay
                  />
                ) : (
                  <img
                    src={post.media_url}
                    alt={post.caption}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

                {/* Double tap like animation */}
                <AnimatePresence>
                  {doubleTapLike === post.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1.2 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                    >
                      <Heart className="w-24 h-24 text-red-500 fill-current drop-shadow-lg" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Eligibility Label */}
                <div className="absolute top-20 left-4 z-20">
                  <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
                    post.is_eligible && post.eligible_amount > 0
                      ? 'bg-gradient-to-r from-primary/90 to-amber-500/90 text-primary-foreground' 
                      : 'bg-secondary/90 text-muted-foreground'
                  }`}>
                    {post.is_eligible && post.eligible_amount > 0 ? (
                      <>
                        <Coins className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">Eligible for ₦{post.eligible_amount}</span>
                        {earnedPosts.has(post.id) && <Check className="w-3 h-3 ml-1" />}
                      </>
                    ) : (
                      <span className="text-xs font-medium">Not eligible for earning</span>
                    )}
                  </div>
                </div>

                {/* Content overlay */}
                <div className="relative z-10 w-full p-4 pb-24">
                  <div className="flex items-end justify-between max-w-[480px] mx-auto">
                    <div className="flex-1 mr-4">
                      <div className="flex items-center gap-2 mb-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/creator/${post.user_id}`); }}
                          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                        >
                          {post.profile?.avatar_url ? (
                            <img src={post.profile.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-primary-foreground font-bold text-sm">
                              {avatarInitial}
                            </div>
                          )}
                          <span className="font-bold text-foreground">@{username}</span>
                        </button>
                        
                        <button
                          onClick={(e) => { e.stopPropagation(); handleFollow(post.user_id); }}
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all ${
                            isFollowingUser
                              ? "bg-secondary text-muted-foreground"
                              : "bg-primary text-primary-foreground"
                          }`}
                        >
                          {isFollowingUser ? (
                            <><UserCheck className="w-3 h-3" /> Following</>
                          ) : (
                            <><UserPlus className="w-3 h-3" /> Follow</>
                          )}
                        </button>
                      </div>
                      <p className="text-foreground/90 text-sm line-clamp-3 mb-3">{post.caption}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-center gap-5">
                      <button onClick={(e) => { e.stopPropagation(); handleLike(post.id); }} className="flex flex-col items-center gap-1">
                        <div className={`p-2 rounded-full ${isLiked ? "text-red-500" : "text-foreground"}`}>
                          <Heart className={`w-7 h-7 transition-all ${isLiked ? "fill-current scale-110" : ""}`} />
                        </div>
                        <span className="text-xs text-foreground font-medium">{(post.likes_count + (isLiked ? 1 : 0)).toLocaleString()}</span>
                      </button>

                      <button onClick={(e) => { e.stopPropagation(); setShowCommentModal(post.id); }} className="flex flex-col items-center gap-1">
                        <div className="p-2 text-foreground"><MessageCircle className="w-7 h-7" /></div>
                        <span className="text-xs text-foreground font-medium">{post.comments_count}</span>
                      </button>

                      <button onClick={(e) => { e.stopPropagation(); setShowShareModal(post.id); }} className="flex flex-col items-center gap-1">
                        <div className="p-2 text-foreground"><Share2 className="w-7 h-7" /></div>
                        <span className="text-xs text-foreground font-medium">Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
              <div className="flex-1 overflow-y-auto mb-4">
                <p className="text-center text-muted-foreground py-8">No comments yet. Be the first!</p>
              </div>
              <div className="flex gap-2 border-t border-border pt-4">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1"
                  maxLength={500}
                />
                <Button variant="gold" size="icon" disabled={!commentText.trim() || commentText.length > 500}>
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
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-lg font-bold text-foreground">Share</h3>
                <button onClick={() => setShowShareModal(null)}>
                  <X className="w-6 h-6 text-muted-foreground" />
                </button>
              </div>
              <button
                onClick={() => showShareModal && handleCopyLink(showShareModal)}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  {copiedLink ? <Check className="w-6 h-6 text-primary" /> : <Copy className="w-6 h-6 text-primary" />}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">{copiedLink ? "Link copied!" : "Copy link"}</p>
                  <p className="text-sm text-muted-foreground">Share this post with others</p>
                </div>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MobileLayout>
  );
}
