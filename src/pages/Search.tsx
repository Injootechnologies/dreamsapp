import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, User, Play, Image as ImageIcon, X } from "lucide-react";
import { useFeedPosts } from "@/hooks/usePosts";

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { data: dbPosts = [] } = useFeedPosts();

  const results = useMemo(() => {
    if (!query.trim()) return { users: [], posts: [] };
    const q = query.toLowerCase();

    // Search DB posts by caption, username, or category
    const matchedPosts = dbPosts.filter(
      (p) =>
        p.caption.toLowerCase().includes(q) ||
        (p.profile?.username || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
    ).slice(0, 12);

    // Extract unique users from matched posts
    const seenUsers = new Set<string>();
    const users = dbPosts
      .filter((p) => {
        const username = p.profile?.username || '';
        if (seenUsers.has(p.user_id)) return false;
        if (username.toLowerCase().includes(q)) {
          seenUsers.add(p.user_id);
          return true;
        }
        return false;
      })
      .map((p) => ({
        id: p.user_id,
        username: p.profile?.username || 'user',
        avatar_url: p.profile?.avatar_url,
        full_name: p.profile?.full_name || '',
      }))
      .slice(0, 8);

    return { users, posts: matchedPosts };
  }, [query, dbPosts]);

  const hasResults = results.users.length > 0 || results.posts.length > 0;

  return (
    <MobileLayout>
      <div className="px-4 py-6 safe-top">
        {/* Search bar */}
        <div className="relative mb-6">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search creators, posts, topics..."
            className="pl-12 pr-10 h-12"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!query.trim() ? (
            /* Empty state */
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium">Search Dream$</p>
              <p className="text-sm text-muted-foreground">Find creators, posts, and topics</p>
            </motion.div>
          ) : (
            /* Search Results */
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {!hasResults && (
                <div className="text-center py-12">
                  <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground font-medium">No results found</p>
                  <p className="text-sm text-muted-foreground">Try a different search term</p>
                </div>
              )}

              {/* Users */}
              {results.users.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" /> Creators
                  </h3>
                  <div className="space-y-2">
                    {results.users.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => navigate(`/creator/${user.id}`)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-card hover:bg-secondary transition-colors"
                      >
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-primary-foreground font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="text-left flex-1">
                          <p className="font-semibold text-foreground">@{user.username}</p>
                          <p className="text-xs text-muted-foreground">{user.full_name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts */}
              {results.posts.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Posts
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {results.posts.map((post) => (
                      <div
                        key={post.id}
                        className="aspect-[3/4] rounded-xl overflow-hidden relative cursor-pointer"
                        onClick={() => navigate("/home")}
                      >
                        {post.media_type === 'video' ? (
                          <>
                            <video
                              src={post.media_url}
                              className="w-full h-full object-cover"
                              preload="metadata"
                              muted
                            />
                            <div className="absolute top-2 right-2">
                              <Play className="w-4 h-4 text-foreground drop-shadow" />
                            </div>
                          </>
                        ) : (
                          <img
                            src={post.media_url}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-2">
                          <p className="text-xs text-foreground line-clamp-2">{post.caption}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">@{post.profile?.username || 'user'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MobileLayout>
  );
}
