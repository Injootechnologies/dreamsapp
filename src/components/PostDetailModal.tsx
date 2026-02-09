import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, MessageCircle, Eye, Share2 } from "lucide-react";
import { Post, useDreamStore } from "@/lib/store";
import { CommentSheet } from "./CommentSheet";

interface PostDetailModalProps {
  post: Post | null;
  onClose: () => void;
}

export function PostDetailModal({ post, onClose }: PostDetailModalProps) {
  const [showComments, setShowComments] = useState(false);
  const likedPosts = useDreamStore((s) => s.likedPosts);
  const toggleLike = useDreamStore((s) => s.toggleLike);
  const getPostComments = useDreamStore((s) => s.getPostComments);

  if (!post) return null;

  const isLiked = likedPosts.has(post.id);
  const comments = getPostComments(post.id);
  const totalComments = comments.length + post.comments.length;
  const views = post.likes * 10; // demo estimation

  return (
    <>
      <AnimatePresence>
        {post && !showComments && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="absolute inset-4 flex flex-col bg-card rounded-2xl overflow-hidden max-w-[480px] mx-auto my-auto max-h-[85dvh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <div className="absolute top-3 right-3 z-10">
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-background/80 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-foreground" />
                </button>
              </div>

              {/* Media */}
              <div className="flex-1 min-h-0 bg-secondary">
                {post.videoUrl ? (
                  <video
                    src={post.videoUrl}
                    className="w-full h-full object-cover"
                    controls
                    playsInline
                    autoPlay
                    muted
                    loop
                  />
                ) : (
                  <img
                    src={post.imageUrl}
                    alt={post.caption}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Info */}
              <div className="p-4 space-y-3">
                <p className="text-sm text-foreground line-clamp-3">
                  {post.caption}
                </p>

                {/* Stats row */}
                <div className="flex items-center gap-5">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className="flex items-center gap-1.5"
                  >
                    <Heart
                      className={`w-5 h-5 ${isLiked ? "text-red-500 fill-current" : "text-muted-foreground"}`}
                    />
                    <span className="text-sm text-muted-foreground">
                      {(post.likes + (isLiked ? 1 : 0)).toLocaleString()}
                    </span>
                  </button>

                  <button
                    onClick={() => setShowComments(true)}
                    className="flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {totalComments}
                    </span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <Eye className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {views.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Share2 className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {post.shares}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showComments && (
        <CommentSheet
          postId={post.id}
          existingComments={post.comments}
          onClose={() => setShowComments(false)}
        />
      )}
    </>
  );
}
