import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, TrendingUp, User, Play, Image as ImageIcon, X } from "lucide-react";
import { realisticDemoPosts } from "@/lib/demoContent";
import { creatorProfiles } from "@/lib/store";
import { useFeedPosts } from "@/hooks/usePosts";

const trendingTopics = [
  "Afrobeats Challenge", "Lagos Life", "Jollof Rice", "Tech Nigeria",
  "Ankara Styles", "Fitness Goals", "Nollywood", "Crypto Nigeria",
];

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { data: dbPosts = [] } = useFeedPosts();

  const results = useMemo(() => {
    if (!query.trim()) return { users: [], posts: [] };
    const q = query.toLowerCase();

    // Search demo creators
    const users = Object.values(creatorProfiles).filter(
      (c) =>
        c.username.toLowerCase().includes(q) ||
        c.bio.toLowerCase().includes(q)
    ).slice(0, 8);

    // Search demo + DB posts
    const demoPosts = realisticDemoPosts.filter(
      (p) =>
        p.caption.toLowerCase().includes(q) ||
        p.creator.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );

    const realPosts = dbPosts.filter(
      (p) =>
        p.caption.toLowerCase().includes(q) ||
        (p.profile?.username || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
    ).map((p) => ({
      id: p.id,
      creatorId: p.user_id,
      creator: p.profile?.username || 'user',
      avatar: (p.profile?.username || 'U').charAt(0).toUpperCase(),
      caption: p.caption,
      mediaUrl: p.media_url,
      mediaType: p.media_type as 'image' | 'video',
      category: p.category || '',
      likes: p.likes_count,
      views: p.views_count,
    }));

    const allPosts = [...realPosts, ...demoPosts.map(p => ({
      id: p.id,
      creatorId: p.creatorId,
      creator: p.creator,
      avatar: p.avatar,
      caption: p.caption,
      mediaUrl: p.mediaUrl,
      mediaType: p.mediaType,
      category: p.category,
      likes: p.likes,
      views: p.views,
    }))].slice(0, 12);

    return { users, posts: allPosts };
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
            /* Trending Topics */
            <motion.div
              key="trending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> Trending
              </h2>
              <div className="flex flex-wrap gap-2 mb-8">
                {trendingTopics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setQuery(topic)}
                    className="px-4 py-2 rounded-full bg-secondary text-sm font-medium text-foreground hover:bg-primary/20 transition-colors"
                  >
                    #{topic}
                  </button>
                ))}
              </div>

              {/* Discover grid */}
              <h2 className="font-display text-lg font-bold text-foreground mb-4">Discover</h2>
              <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
                {realisticDemoPosts.slice(0, 9).map((post) => (
                  <div
                    key={post.id}
                    className="aspect-square relative cursor-pointer overflow-hidden"
                    onClick={() => navigate("/home")}
                  >
                    {post.mediaType === 'video' ? (
                      <>
                        <video
                          src={post.mediaUrl}
                          className="w-full h-full object-cover"
                          preload="metadata"
                          muted
                        />
                        <div className="absolute top-1 right-1">
                          <Play className="w-3 h-3 text-foreground drop-shadow" />
                        </div>
                      </>
                    ) : (
                      <img
                        src={post.mediaUrl}
                        alt={post.caption}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>
                ))}
              </div>
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
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-primary-foreground font-bold">
                          {user.avatar}
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-semibold text-foreground">@{user.username}</p>
                          <p className="text-xs text-muted-foreground">{user.bio} • {formatCount(user.followers)} followers</p>
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
                        {post.mediaType === 'video' ? (
                          <>
                            <video
                              src={post.mediaUrl}
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
                            src={post.mediaUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-2">
                          <p className="text-xs text-foreground line-clamp-2">{post.caption}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">@{post.creator}</p>
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

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
}
