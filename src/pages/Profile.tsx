import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Settings, Grid, Heart, Image } from "lucide-react";
import { useDreamStore, demoPosts } from "@/lib/store";

type ProfileTab = 'posts' | 'liked';

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  
  const user = useDreamStore((state) => state.user);
  const userPosts = useDreamStore((state) => state.userPosts);
  const likedPosts = useDreamStore((state) => state.likedPosts);

  // Get liked posts data
  const likedPostsList = demoPosts.filter(p => likedPosts.has(p.id));

  return (
    <MobileLayout>
      <div className="px-4 py-6 safe-top">
        {/* Header with settings */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate("/settings")}
            className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-6"
        >
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center">
              <span className="text-4xl font-bold text-primary-foreground">
                {user?.username?.charAt(0).toUpperCase() || "D"}
              </span>
            </div>
          </div>

          <h1 className="font-display text-2xl font-bold text-foreground mb-1">
            @{user?.username || "dreamer"}
          </h1>
          <p className="text-muted-foreground text-sm text-center max-w-[250px]">
            {user?.bio || "DREAMS Creator"}
          </p>
          
          {/* Demo badge */}
          <div className="mt-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/50">
            <span className="text-xs font-medium text-primary">Demo Account</span>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center gap-8 mb-6"
        >
          <div className="text-center">
            <p className="text-xl font-bold text-foreground">{user?.followers || 0}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-foreground">{user?.following || 0}</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-foreground">{userPosts.length}</p>
            <p className="text-xs text-muted-foreground">Posts</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex border-b border-border mb-4"
        >
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 border-b-2 transition-colors ${
              activeTab === 'posts'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            }`}
          >
            <Grid className="w-5 h-5" />
            <span className="text-sm font-medium">Posts</span>
          </button>
          <button
            onClick={() => setActiveTab('liked')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 border-b-2 transition-colors ${
              activeTab === 'liked'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            }`}
          >
            <Heart className="w-5 h-5" />
            <span className="text-sm font-medium">Liked</span>
          </button>
        </motion.div>

        {/* Content Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {activeTab === 'posts' ? (
            userPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <Image className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-foreground font-medium mb-1">You haven't posted yet</p>
                <p className="text-sm text-muted-foreground mb-4">Share your first image!</p>
                <Button
                  variant="gold"
                  onClick={() => navigate("/create")}
                >
                  Create Post
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {userPosts.map((post) => (
                  <div
                    key={post.id}
                    className="aspect-square bg-secondary rounded-lg overflow-hidden relative"
                  >
                    <img
                      src={post.imageUrl}
                      alt={post.caption}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 left-1 flex items-center gap-1 text-white text-xs bg-black/50 px-1.5 py-0.5 rounded">
                      <Heart className="w-3 h-3" />
                      <span>{post.likes}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            likedPostsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-foreground font-medium mb-1">No liked posts yet</p>
                <p className="text-sm text-muted-foreground mb-4">Posts you like will appear here</p>
                <Button
                  variant="gold"
                  onClick={() => navigate("/home")}
                >
                  Browse Posts
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {likedPostsList.map((post) => (
                  <div
                    key={post.id}
                    className="aspect-square bg-secondary rounded-lg overflow-hidden relative"
                  >
                    <img
                      src={post.imageUrl}
                      alt={post.caption}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 left-1 flex items-center gap-1 text-white text-xs bg-black/50 px-1.5 py-0.5 rounded">
                      <Heart className="w-3 h-3" />
                      <span>{post.likes.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </motion.div>
      </div>
    </MobileLayout>
  );
}
