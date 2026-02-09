import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDreamStore, Comment } from "@/lib/store";
import { toast } from "sonner";

interface CommentSheetProps {
  postId: string | null;
  existingComments?: Comment[];
  onClose: () => void;
}

export function CommentSheet({ postId, existingComments = [], onClose }: CommentSheetProps) {
  const [commentText, setCommentText] = useState("");
  const addComment = useDreamStore((state) => state.addComment);
  const getPostComments = useDreamStore((state) => state.getPostComments);

  if (!postId) return null;

  const baseId = postId.split("-")[0];
  const userComments = getPostComments(baseId);
  const allComments = [...existingComments, ...userComments];

  const handleSubmit = () => {
    if (!commentText.trim()) return;
    addComment(baseId, commentText);
    setCommentText("");
    toast.success("Comment added!");
  };

  return (
    <AnimatePresence>
      {postId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl flex flex-col"
            style={{ maxHeight: "70dvh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted" />
            </div>

            {/* Header */}
            <div className="flex justify-between items-center px-5 py-3 border-b border-border">
              <h3 className="font-display text-lg font-bold text-foreground">
                Comments ({allComments.length})
              </h3>
              <button onClick={onClose}>
                <X className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4 scrollbar-hide">
              {allComments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No comments yet. Be the first!
                </p>
              ) : (
                allComments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center text-xs font-bold text-foreground">
                      {comment.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold text-foreground">
                          {comment.username}
                        </span>{" "}
                        <span className="text-foreground/80">{comment.text}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input - above any nav, with safe area */}
            <div className="px-5 py-3 border-t border-border bg-card safe-bottom">
              <div className="flex gap-2">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
                  autoFocus
                />
                <Button
                  variant="gold"
                  size="icon"
                  onClick={handleSubmit}
                  disabled={!commentText.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
