import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Image, Hash, CheckCircle2, X, Camera, Film } from "lucide-react";
import { toast } from "sonner";
import { useCreatePost } from "@/hooks/usePosts";
import { captionSchema, categorySchema } from "@/lib/validation";
import { z } from "zod";
import { VideoTrimmer } from "@/components/create/VideoTrimmer";

const categories = [
  "Entertainment", "Education", "Comedy", "Music",
  "Dance", "Lifestyle", "Food", "Tech", "Fashion", "Sports",
];

export default function Create() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isPosted, setIsPosted] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [showTrimmer, setShowTrimmer] = useState(false);
  const [rawVideoFile, setRawVideoFile] = useState<File | null>(null);
  
  const createPost = useCreatePost();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      if (file.size > 100 * 1024 * 1024) {
        toast.error("Video size must be less than 100MB");
        return;
      }
      // Open trimmer for any video length
      setRawVideoFile(file);
      setShowTrimmer(true);
    } else if (file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size must be less than 10MB");
        return;
      }
      setMediaType('image');
      setMediaFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setSelectedMedia(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      toast.error("Please select an image or video file");
    }
  };

  const handleTrimComplete = (trimmedBlob: Blob, duration: number) => {
    const file = new File([trimmedBlob], rawVideoFile?.name || 'video.mp4', {
      type: rawVideoFile?.type || 'video/mp4',
    });
    setMediaType('video');
    setMediaFile(file);
    setVideoDuration(duration);
    setSelectedMedia(URL.createObjectURL(file));
    setShowTrimmer(false);
    setRawVideoFile(null);
  };

  const handleTrimCancel = () => {
    setShowTrimmer(false);
    setRawVideoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveMedia = () => {
    setSelectedMedia(null);
    setMediaFile(null);
    setVideoDuration(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePost = () => {
    if (!mediaFile) { toast.error("Please upload media"); return; }

    try {
      captionSchema.parse(caption);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }

    try {
      categorySchema.parse(selectedCategory);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }

    createPost.mutate({
      caption: caption.trim(),
      mediaFile,
      mediaType,
      category: selectedCategory,
      videoDuration: mediaType === 'video' ? videoDuration : undefined,
    }, {
      onSuccess: () => setIsPosted(true),
    });
  };

  // Video trimmer screen
  if (showTrimmer && rawVideoFile) {
    return (
      <MobileLayout hideNav>
        <div className="px-4 py-6 safe-top h-[100dvh] flex flex-col">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <h1 className="font-display text-xl font-bold text-foreground">Trim Video</h1>
            <p className="text-muted-foreground text-sm">Select a 5-15 second clip to post</p>
          </motion.div>
          <div className="flex-1 min-h-0">
            <VideoTrimmer
              file={rawVideoFile}
              onTrimComplete={handleTrimComplete}
              onCancel={handleTrimCancel}
            />
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (isPosted) {
    return (
      <MobileLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-12 h-12 text-success" />
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="font-display text-2xl font-bold text-foreground mb-2">Post Created!</motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-muted-foreground text-center mb-6">Your post is now live on DREAM$.</motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex gap-3">
            <Button variant="gold-outline" onClick={() => { setCaption(""); setSelectedCategory(""); handleRemoveMedia(); setIsPosted(false); }}>Create Another</Button>
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
          <p className="text-muted-foreground text-sm">Share images or videos — we'll help you trim</p>
        </motion.div>

        <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileSelect} className="hidden" />

        {/* Upload Area */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          {!selectedMedia ? (
            <Card variant="gradient" className="border-dashed border-2">
              <CardContent className="p-8">
                <button onClick={() => fileInputRef.current?.click()} className="w-full flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <Camera className="w-10 h-10 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground mb-1">Upload Media</p>
                    <p className="text-sm text-muted-foreground">Tap to select an image or video</p>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Image className="w-4 h-4" /><span className="text-xs">Images</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Film className="w-4 h-4" /><span className="text-xs">Videos (any length)</span>
                    </div>
                  </div>
                </button>
              </CardContent>
            </Card>
          ) : (
            <Card variant="gradient">
              <CardContent className="p-4">
                <div className="aspect-square max-h-[300px] rounded-xl bg-secondary overflow-hidden relative">
                  {mediaType === 'video' ? (
                    <video src={selectedMedia} className="w-full h-full object-cover" controls muted />
                  ) : (
                    <img src={selectedMedia} alt="Preview" className="w-full h-full object-cover" />
                  )}
                  <button onClick={handleRemoveMedia} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center">
                    <X className="w-4 h-4 text-foreground" />
                  </button>
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-success/80 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm text-white font-medium drop-shadow">
                      {mediaType === 'video' ? `Video (${videoDuration}s)` : 'Image ready'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Caption */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
          <label className="text-sm font-medium text-foreground mb-2 block">Caption <span className="text-destructive">*</span></label>
          <Textarea placeholder="Write a caption..." value={caption} onChange={(e) => setCaption(e.target.value)} className="min-h-[100px] resize-none" maxLength={500} />
          <p className="text-xs text-muted-foreground mt-1 text-right">{caption.length}/500</p>
        </motion.div>

        {/* Category */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
          <label className="text-sm font-medium text-foreground mb-3 block flex items-center gap-2">
            <Hash className="w-4 h-4" /> Category <span className="text-destructive">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}>{cat}</button>
            ))}
          </div>
        </motion.div>

        {/* Post Button */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Button variant="gold" size="xl" className="w-full" onClick={handlePost}
            disabled={!selectedMedia || !caption.trim() || !selectedCategory || createPost.isPending}>
            {createPost.isPending ? "Uploading..." : "Post"}
          </Button>
        </motion.div>
      </div>
    </MobileLayout>
  );
}
