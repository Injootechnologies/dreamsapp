import { useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Upload, Image, Film, Hash, CheckCircle2 } from "lucide-react";
import { useDreamStore } from "@/lib/store";

const categories = [
  "Entertainment",
  "Education",
  "Comedy",
  "Music",
  "Dance",
  "Lifestyle",
  "Food",
  "Tech",
  "Fashion",
  "Sports",
];

export default function Create() {
  const [caption, setCaption] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isUploaded, setIsUploaded] = useState(false);
  const [isPosted, setIsPosted] = useState(false);
  
  const incrementContentCount = useDreamStore((state) => state.incrementContentCount);
  const addEarning = useDreamStore((state) => state.addEarning);

  const handlePost = () => {
    if (!caption || !selectedCategory) return;
    
    setIsPosted(true);
    incrementContentCount();
    addEarning({
      type: "create",
      amount: 50,
      description: "Created new content",
    });
  };

  const handleReset = () => {
    setCaption("");
    setSelectedCategory("");
    setIsUploaded(false);
    setIsPosted(false);
  };

  if (isPosted) {
    return (
      <MobileLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mb-6"
          >
            <CheckCircle2 className="w-12 h-12 text-success" />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-2xl font-bold text-foreground mb-2"
          >
            Content Posted!
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground text-center mb-2"
          >
            Your content is now live.
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-primary font-semibold text-lg mb-8"
          >
            +₦50 earned for posting!
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <p className="text-sm text-muted-foreground mb-4">
              Earnings will reflect based on engagement.
            </p>
            <Button variant="gold" onClick={handleReset}>
              Create Another
            </Button>
          </motion.div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="px-4 py-6 safe-top">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-display text-2xl font-bold text-foreground mb-1">
            Create Content
          </h1>
          <p className="text-muted-foreground text-sm">
            Share your creativity and earn ₦50+
          </p>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          {!isUploaded ? (
            <Card variant="gradient" className="border-dashed border-2">
              <CardContent className="p-8">
                <button
                  onClick={() => setIsUploaded(true)}
                  className="w-full flex flex-col items-center gap-4"
                >
                  <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <Upload className="w-10 h-10 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground mb-1">
                      Upload Content
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Tap to select video or image
                    </p>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Film className="w-4 h-4" />
                      <span className="text-xs">Video</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Image className="w-4 h-4" />
                      <span className="text-xs">Image</span>
                    </div>
                  </div>
                </button>
              </CardContent>
            </Card>
          ) : (
            <Card variant="gradient">
              <CardContent className="p-4">
                <div className="aspect-[4/5] rounded-xl bg-secondary flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-success/20" />
                  <div className="relative z-10 text-center">
                    <Film className="w-12 h-12 text-primary mx-auto mb-2" />
                    <p className="text-sm text-foreground">Video uploaded</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Caption */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <label className="text-sm font-medium text-foreground mb-2 block">
            Caption
          </label>
          <Input
            placeholder="Write a caption for your post..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="h-14"
          />
        </motion.div>

        {/* Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <label className="text-sm font-medium text-foreground mb-3 block flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Select Category
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Post Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="gold"
            size="xl"
            className="w-full"
            onClick={handlePost}
            disabled={!isUploaded || !caption || !selectedCategory}
          >
            Post Content
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Earn ₦50 for posting + bonus based on engagement
          </p>
        </motion.div>
      </div>
    </MobileLayout>
  );
}
