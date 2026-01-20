import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Upload, Image, Hash, CheckCircle2 } from "lucide-react";
import { useDreamStore, Post } from "@/lib/store";

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

// Sample image URLs for simulated uploads
const sampleImageUrls = [
  'https://picsum.photos/seed/upload1/800/1200',
  'https://picsum.photos/seed/upload2/800/1200',
  'https://picsum.photos/seed/upload3/800/1200',
  'https://picsum.photos/seed/upload4/800/1200',
  'https://picsum.photos/seed/upload5/800/1200',
];

export default function Create() {
  const navigate = useNavigate();
  const [caption, setCaption] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isUploaded, setIsUploaded] = useState(false);
  const [isPosted, setIsPosted] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  
  const user = useDreamStore((state) => state.user);
  const uploadPost = useDreamStore((state) => state.uploadPost);

  const handleUpload = () => {
    const randomImage = sampleImageUrls[Math.floor(Math.random() * sampleImageUrls.length)];
    setSelectedImage(randomImage);
    setIsUploaded(true);
  };

  const handlePost = () => {
    if (!caption || !selectedCategory) return;
    
    // Create a new post object
    const newPost: Post = {
      id: `user-${Date.now()}`,
      creator: user?.username || 'dreamer',
      creatorId: user?.id || 'user',
      creatorAvatar: user?.username?.charAt(0).toUpperCase() || 'D',
      caption: caption,
      likes: 0,
      comments: [],
      saves: 0,
      shares: 0,
      imageUrl: selectedImage,
      category: 'foryou',
      isMonetized: false,
      createdAt: new Date(),
    };
    
    uploadPost(newPost);
    setIsPosted(true);
  };

  const handleReset = () => {
    setCaption("");
    setSelectedCategory("");
    setIsUploaded(false);
    setIsPosted(false);
    setSelectedImage("");
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
            Post Created!
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground text-center mb-6"
          >
            Your post is now live on DREAMS.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-3"
          >
            <Button variant="gold-outline" onClick={handleReset}>
              Create Another
            </Button>
            <Button variant="gold" onClick={() => navigate("/profile")}>
              View Profile
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
            Create Post
          </h1>
          <p className="text-muted-foreground text-sm">
            Share your creativity with the DREAMS community
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
                  onClick={handleUpload}
                  className="w-full flex flex-col items-center gap-4"
                >
                  <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <Upload className="w-10 h-10 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground mb-1">
                      Upload Image
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Tap to select an image file
                    </p>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Image className="w-4 h-4" />
                      <span className="text-xs">JPG, PNG, WebP</span>
                    </div>
                  </div>
                </button>
              </CardContent>
            </Card>
          ) : (
            <Card variant="gradient">
              <CardContent className="p-4">
                <div className="aspect-square max-h-[300px] rounded-xl bg-secondary overflow-hidden relative">
                  <img
                    src={selectedImage}
                    alt="Upload preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-success/80 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm text-white font-medium">Image ready</span>
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
            Post Image
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Your post will appear on your profile and in the For You feed
          </p>
        </motion.div>
      </div>
    </MobileLayout>
  );
}
