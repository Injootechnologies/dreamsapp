import { useParams, useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Users } from "lucide-react";
import { demoVideos, creatorProfiles } from "@/lib/store";

export default function CreatorProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Get creator info
  const creator = id ? creatorProfiles[id] : null;
  
  // Get creator's videos
  const creatorVideos = demoVideos.filter(v => v.creatorId === id);
  
  if (!creator) {
    return (
      <MobileLayout>
        <div className="px-4 py-6 safe-top">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-foreground font-medium">Creator not found</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="px-4 py-6 safe-top">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-6"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center mb-4">
            <span className="text-4xl font-bold text-primary-foreground">
              {creator.avatar}
            </span>
          </div>

          <h1 className="font-display text-2xl font-bold text-foreground mb-1">
            @{creator.username}
          </h1>
          <p className="text-muted-foreground text-sm text-center max-w-[250px]">
            {creator.bio}
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center gap-8 mb-6"
        >
          <div className="text-center">
            <p className="text-xl font-bold text-foreground">{creator.followers.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-foreground">{creator.following.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-foreground">{creator.totalViews.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Views</p>
          </div>
        </motion.div>

        {/* Follow Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <Button variant="gold" size="lg" className="w-full">
            <Users className="w-5 h-5" />
            Follow
          </Button>
        </motion.div>

        {/* Videos Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">
            Videos
          </h2>
          
          {creatorVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Play className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium">No videos yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {creatorVideos.map((video) => (
                <div
                  key={video.id}
                  className="aspect-[9/16] bg-secondary rounded-lg overflow-hidden relative cursor-pointer"
                  onClick={() => navigate("/home")}
                >
                  <video
                    src={video.videoUrl}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute bottom-1 left-1 flex items-center gap-1 text-white text-xs">
                    <Play className="w-3 h-3" />
                    <span>{video.views.toLocaleString()}</span>
                  </div>
                  {video.isMonetized && (
                    <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-primary/80 text-[10px] text-primary-foreground">
                      🎯 ₦{video.rewardAmount}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Demo label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs text-muted-foreground text-center mt-8"
        >
          Demo profile • Beta version
        </motion.p>
      </div>
    </MobileLayout>
  );
}
