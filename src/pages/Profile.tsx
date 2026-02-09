import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Settings, Grid, Heart, Image, Eye, Camera, Play } from "lucide-react";
import { useDreamStore, demoPosts, Post } from "@/lib/store";
import { toast } from "sonner";
import { PostDetailModal } from "@/components/PostDetailModal";

type ProfileTab = 'posts' | 'liked';

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const user = useDreamStore((state) => state.user);
  const userPosts = useDreamStore((state) => state.userPosts);
  const likedPosts = useDreamStore((state) => state.likedPosts);
  const totalEarned = useDreamStore((state) => state.totalEarned);
  const followingUsers = useDreamStore((state) => state.followingUsers);
  const updateProfile = useDreamStore((state) => state.updateProfile);

  const likedPostsList = demoPosts.filter(p => likedPosts.has(p.id));
  const totalViews = userPosts.reduce((acc, post) => acc + post.likes * 10, 0);

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        updateProfile({ profilePhoto: e.target?.result as string });
        toast.success("Profile photo updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  const renderPostGrid = (posts: Post[]) => (
    <div className="grid grid-cols-3 gap-1">
      {posts.map((post) => (
        <button
          key={post.id}
          onClick={() => setSelectedPost(post)}
          className="aspect-square bg-secondary rounded-lg overflow-hidden relative group"
        >
          {post.videoUrl || post.mediaType === 'video' ? (
            <>
              <video src={post.videoUrl} className="w-full h-full object-cover" muted playsInline preload="metadata" />
              <div className="absolute top-1 left-1">
                <Play className="w-3.5 h-3.5 text-white drop-shadow" />
              </div>
            </>
          ) : (
            <img src={post.imageUrl} alt={post.caption} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          <div className="absolute bottom-1 left-1 flex items-center gap-1 text-white text-xs bg-black/50 px-1.5 py-0.5 rounded">
            <Heart className="w-3 h-3" />
            <span>{post.likes}</span>
          </div>
          {post.eligibleAmount > 0 && (
            <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full bg-primary text-[8px] text-primary-foreground font-medium">
              ₦{post.eligibleAmount}
            </div>
          )}
        </button>
      ))}
    </div>
  );

  return (
    <MobileLayout>
      <div className="px-4 py-6 safe-top">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleProfilePhotoChange} className="hidden" />

        {/* Header with settings */}
        <div className="flex justify-end mb-4">
          <button onClick={() => navigate("/settings")} className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            {user?.profilePhoto ? (
              <div className="w-24 h-24 rounded-full overflow-hidden">
                <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center">
                <span className="text-4xl font-bold text-primary-foreground">{user?.username?.charAt(0).toUpperCase() || "D"}</span>
              </div>
            )}
            <button onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-background">
              <Camera className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-1">@{user?.username || "dreamer"}</h1>
          {user?.fullName && <p className="text-sm text-muted-foreground mb-1">{user.fullName}</p>}
          <p className="text-muted-foreground text-sm text-center max-w-[250px]">{user?.bio || "DREAMS Creator"}</p>
          <div className="mt-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/50">
            <span className="text-xs font-medium text-primary">Beta Account</span>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex justify-center gap-4 mb-6">
          <div className="text-center"><p className="text-xl font-bold text-foreground">{user?.followers || 0}</p><p className="text-xs text-muted-foreground">Followers</p></div>
          <div className="text-center"><p className="text-xl font-bold text-foreground">{followingUsers.size}</p><p className="text-xs text-muted-foreground">Following</p></div>
          <div className="text-center"><p className="text-xl font-bold text-foreground">{userPosts.length}</p><p className="text-xs text-muted-foreground">Posts</p></div>
          <div className="text-center"><p className="text-xl font-bold text-foreground">{totalViews.toLocaleString()}</p><p className="text-xs text-muted-foreground flex items-center gap-1 justify-center"><Eye className="w-3 h-3" /> Views</p></div>
        </motion.div>

        {/* Earnings Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-6">
          <Card variant="gradient"><CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-muted-foreground">Demo Earnings</p><p className="font-bold text-lg text-gradient-gold">₦{totalEarned.toLocaleString()}</p></div>
              <Button variant="outline" size="sm" onClick={() => navigate("/wallet")}>View Wallet</Button>
            </div>
          </CardContent></Card>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex border-b border-border mb-4">
          <button onClick={() => setActiveTab('posts')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 border-b-2 transition-colors ${activeTab === 'posts' ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
            <Grid className="w-5 h-5" /><span className="text-sm font-medium">Posts</span>
          </button>
          <button onClick={() => setActiveTab('liked')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 border-b-2 transition-colors ${activeTab === 'liked' ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
            <Heart className="w-5 h-5" /><span className="text-sm font-medium">Liked</span>
          </button>
        </motion.div>

        {/* Content Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          {activeTab === 'posts' ? (
            userPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4"><Image className="w-8 h-8 text-muted-foreground" /></div>
                <p className="text-foreground font-medium mb-1">You haven't posted yet</p>
                <p className="text-sm text-muted-foreground mb-4">Share your first content!</p>
                <Button variant="gold" onClick={() => navigate("/create")}>Create Post</Button>
              </div>
            ) : renderPostGrid(userPosts)
          ) : (
            likedPostsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4"><Heart className="w-8 h-8 text-muted-foreground" /></div>
                <p className="text-foreground font-medium mb-1">No liked posts yet</p>
                <p className="text-sm text-muted-foreground mb-4">Posts you like will appear here</p>
                <Button variant="gold" onClick={() => navigate("/home")}>Browse Posts</Button>
              </div>
            ) : renderPostGrid(likedPostsList)
          )}
        </motion.div>
      </div>

      {/* Post Detail Modal */}
      <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />
    </MobileLayout>
  );
}
