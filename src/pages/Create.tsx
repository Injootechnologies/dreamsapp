import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Upload, Image, Hash, CheckCircle2, X, Camera } from "lucide-react";
import { useDreamStore, Post } from "@/lib/store";
import { toast } from "sonner";

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
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isPosted, setIsPosted] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const user = useDreamStore((state) => state.user);
  const uploadPost = useDreamStore((state) => state.uploadPost);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size must be less than 10MB");
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePost = () => {
    if (!caption.trim()) {
      toast.error("Please add a caption for your post");
      return;
    }
    if (!selectedCategory) {
      toast.error("Please select a category");
      return;
    }
    if (!selectedImage) {
      toast.error("Please upload an image");
      return;
    }
    
    // Create a new post object
    const newPost: Post = {
      id: `user-${Date.now()}`,
      creator: user?.username || 'dreamer',
      creatorId: user?.id || 'user',
      creatorAvatar: user?.username?.charAt(0).toUpperCase() || 'D',
      caption: caption.trim(),
      likes: 0,
      comments: [],
      saves: 0,
      shares: 0,
      imageUrl: selectedImage,
      category: 'foryou',
      eligibleAmount: 0, // User posts start as not eligible
      createdAt: new Date(),
    };
    
    uploadPost(newPost);
    setIsPosted(true);
    toast.success("Post created successfully!");
  };

  const handleReset = () => {
    setCaption("");
    setSelectedCategory("");
    setSelectedImage(null);
    setImageFile(null);
    setIsPosted(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          {!selectedImage ? (
            <Card variant="gradient" className="border-dashed border-2">
              <CardContent className="p-8">
                <button
                  onClick={handleUploadClick}
                  className="w-full flex flex-col items-center gap-4"
                >
                  <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <Camera className="w-10 h-10 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground mb-1">
                      Upload from Gallery
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Tap to select an image from your device
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
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <X className="w-4 h-4 text-foreground" />
                  </button>
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-success/80 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm text-white font-medium drop-shadow">Image ready</span>
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
            Caption <span className="text-destructive">*</span>
          </label>
          <Textarea
            placeholder="Write a caption that matches your image..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="min-h-[100px] resize-none"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {caption.length}/500
          </p>
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
            Select Category <span className="text-destructive">*</span>
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
            disabled={!selectedImage || !caption.trim() || !selectedCategory}
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
