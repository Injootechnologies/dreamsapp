import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Image, Hash, CheckCircle2, X, Camera, Video } from "lucide-react";
import { useDreamStore, Post } from "@/lib/store";
import { toast } from "sonner";
import { VideoTrimmer } from "@/components/VideoTrimmer";

const categories = [
  "Entertainment", "Education", "Comedy", "Music",
  "Dance", "Lifestyle", "Food", "Tech", "Fashion", "Sports",
];

type MediaMode = "image" | "video";

export default function Create() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isPosted, setIsPosted] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mediaMode, setMediaMode] = useState<MediaMode>("image");

  // Video state
  const [rawVideoUrl, setRawVideoUrl] = useState<string | null>(null);
  const [trimmedVideo, setTrimmedVideo] = useState<{ url: string; start: number; end: number } | null>(null);

  const user = useDreamStore((state) => state.user);
  const uploadPost = useDreamStore((state) => state.uploadPost);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File must be less than 50MB");
      return;
    }

    if (mediaMode === "image") {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => setSelectedImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      if (!file.type.startsWith("video/")) {
        toast.error("Please select a video file");
        return;
      }
      const url = URL.createObjectURL(file);
      setRawVideoUrl(url);
      setTrimmedVideo(null);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = mediaMode === "image" ? "image/*" : "video/*";
      fileInputRef.current.click();
    }
  };

  const handleRemoveMedia = () => {
    setSelectedImage(null);
    if (rawVideoUrl) URL.revokeObjectURL(rawVideoUrl);
    setRawVideoUrl(null);
    setTrimmedVideo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTrimComplete = (url: string, start: number, end: number) => {
    setTrimmedVideo({ url, start, end });
    toast.success(`Video trimmed to ${Math.round((end - start) * 10) / 10}s`);
  };

  const hasMedia = mediaMode === "image" ? !!selectedImage : !!trimmedVideo;

  const handlePost = () => {
    if (!caption.trim()) { toast.error("Please add a caption"); return; }
    if (!selectedCategory) { toast.error("Please select a category"); return; }
    if (!hasMedia) { toast.error(`Please upload ${mediaMode === "image" ? "an image" : "a video and trim it"}`); return; }

    const newPost: Post = {
      id: `user-${Date.now()}`,
      creator: user?.username || "dreamer",
      creatorId: user?.id || "user",
      creatorAvatar: user?.username?.charAt(0).toUpperCase() || "D",
      caption: caption.trim(),
      likes: 0,
      comments: [],
      saves: 0,
      shares: 0,
      imageUrl: mediaMode === "image" ? selectedImage! : "",
      videoUrl: mediaMode === "video" ? trimmedVideo!.url : undefined,
      mediaType: mediaMode,
      trimStart: trimmedVideo?.start,
      trimEnd: trimmedVideo?.end,
      category: "foryou",
      eligibleAmount: 0,
      createdAt: new Date(),
    };

    uploadPost(newPost);
    setIsPosted(true);
    toast.success("Post created successfully!");
  };

  const handleReset = () => {
    setCaption("");
    setSelectedCategory("");
    handleRemoveMedia();
    setIsPosted(false);
    setMediaMode("image");
  };

  if (isPosted) {
    return (
      <MobileLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mb-6"
          >
            <CheckCircle2 className="w-12 h-12 text-success" />
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="font-display text-2xl font-bold text-foreground mb-2">Post Created!</motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-muted-foreground text-center mb-6">Your post is now live on DREAMS.</motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex gap-3">
            <Button variant="gold-outline" onClick={handleReset}>Create Another</Button>
            <Button variant="gold" onClick={() => navigate("/profile")}>View Profile</Button>
          </motion.div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="px-4 py-6 safe-top">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground mb-1">Create Post</h1>
          <p className="text-muted-foreground text-sm">Share your creativity with the DREAMS community</p>
        </motion.div>

        <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" />

        {/* Media type toggle */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-4">
          <div className="flex gap-2 bg-secondary rounded-xl p-1">
            <button
              onClick={() => { setMediaMode("image"); handleRemoveMedia(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mediaMode === "image" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              <Image className="w-4 h-4" /> Image
            </button>
            <button
              onClick={() => { setMediaMode("video"); handleRemoveMedia(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mediaMode === "video" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              <Video className="w-4 h-4" /> Video
            </button>
          </div>
        </motion.div>

        {/* Upload Area */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          {mediaMode === "image" ? (
            !selectedImage ? (
              <Card variant="gradient" className="border-dashed border-2">
                <CardContent className="p-8">
                  <button onClick={handleUploadClick} className="w-full flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center">
                      <Camera className="w-10 h-10 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-foreground mb-1">Upload from Gallery</p>
                      <p className="text-sm text-muted-foreground">Tap to select an image from your device</p>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Image className="w-4 h-4" />
                      <span className="text-xs">JPG, PNG, WebP</span>
                    </div>
                  </button>
                </CardContent>
              </Card>
            ) : (
              <Card variant="gradient">
                <CardContent className="p-4">
                  <div className="aspect-square max-h-[300px] rounded-xl bg-secondary overflow-hidden relative">
                    <img src={selectedImage} alt="Upload preview" className="w-full h-full object-cover" />
                    <button onClick={handleRemoveMedia}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center">
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
            )
          ) : (
            !rawVideoUrl ? (
              <Card variant="gradient" className="border-dashed border-2">
                <CardContent className="p-8">
                  <button onClick={handleUploadClick} className="w-full flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center">
                      <Video className="w-10 h-10 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-foreground mb-1">Upload Video</p>
                      <p className="text-sm text-muted-foreground">Select a video and trim to 5-15 seconds</p>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Video className="w-4 h-4" />
                      <span className="text-xs">MP4, WebM, MOV</span>
                    </div>
                  </button>
                </CardContent>
              </Card>
            ) : (
              <Card variant="gradient">
                <CardContent className="p-4">
                  {trimmedVideo ? (
                    <div className="relative">
                      <div className="aspect-[9/16] max-h-[300px] rounded-xl bg-secondary overflow-hidden relative">
                        <video src={trimmedVideo.url} className="w-full h-full object-cover" playsInline muted autoPlay loop />
                        <button onClick={handleRemoveMedia}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center">
                          <X className="w-4 h-4 text-foreground" />
                        </button>
                        <div className="absolute bottom-3 left-3 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-success/80 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-sm text-white font-medium drop-shadow">
                            Video ready ({Math.round((trimmedVideo.end - trimmedVideo.start) * 10) / 10}s)
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setTrimmedVideo(null)}
                        className="mt-2 text-xs text-primary font-medium"
                      >
                        Re-trim video
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-foreground">Trim your video</span>
                        <button onClick={handleRemoveMedia} className="text-xs text-muted-foreground">Remove</button>
                      </div>
                      <VideoTrimmer videoSrc={rawVideoUrl} onTrimComplete={handleTrimComplete} />
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          )}
        </motion.div>

        {/* Caption */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Caption <span className="text-destructive">*</span>
          </label>
          <Textarea placeholder="Write a caption that matches your content..." value={caption}
            onChange={(e) => setCaption(e.target.value)} className="min-h-[100px] resize-none" maxLength={500} />
          <p className="text-xs text-muted-foreground mt-1 text-right">{caption.length}/500</p>
        </motion.div>

        {/* Category */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
          <label className="text-sm font-medium text-foreground mb-3 block flex items-center gap-2">
            <Hash className="w-4 h-4" /> Select Category <span className="text-destructive">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button key={category} onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}>
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Post Button */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Button variant="gold" size="xl" className="w-full" onClick={handlePost}
            disabled={!hasMedia || !caption.trim() || !selectedCategory}>
            Post {mediaMode === "image" ? "Image" : "Video"}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Your post will appear on your profile and in the For You feed
          </p>
        </motion.div>
      </div>
    </MobileLayout>
  );
}
