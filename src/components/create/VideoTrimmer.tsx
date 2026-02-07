import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Scissors, Check, RotateCcw } from "lucide-react";

interface VideoTrimmerProps {
  file: File;
  onTrimComplete: (trimmedBlob: Blob, duration: number) => void;
  onCancel: () => void;
}

export function VideoTrimmer({ file, onTrimComplete, onCancel }: VideoTrimmerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(15);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const scrubberRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);

  const trimDuration = Math.round(endTime - startTime);
  const isValidTrim = trimDuration >= 5 && trimDuration <= 15;

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoaded = () => {
      const dur = video.duration;
      setDuration(dur);
      setEndTime(Math.min(dur, 15));
      generateThumbnails(video, dur);
    };

    video.addEventListener('loadedmetadata', onLoaded);
    return () => video.removeEventListener('loadedmetadata', onLoaded);
  }, [videoUrl]);

  const generateThumbnails = useCallback((video: HTMLVideoElement, dur: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 80;
    canvas.height = 120;
    const count = Math.min(10, Math.ceil(dur));
    const thumbs: string[] = [];
    let i = 0;

    const captureThumbnail = () => {
      if (i >= count) {
        setThumbnails(thumbs);
        video.currentTime = 0;
        return;
      }
      video.currentTime = (dur / count) * i;
    };

    video.onseeked = () => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      thumbs.push(canvas.toDataURL('image/jpeg', 0.5));
      i++;
      captureThumbnail();
    };

    captureThumbnail();
  }, []);

  // Playback tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isPlaying) return;

    const update = () => {
      setCurrentTime(video.currentTime);
      if (video.currentTime >= endTime) {
        video.pause();
        video.currentTime = startTime;
        setIsPlaying(false);
        return;
      }
      animFrameRef.current = requestAnimationFrame(update);
    };
    animFrameRef.current = requestAnimationFrame(update);

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying, endTime, startTime]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      if (video.currentTime < startTime || video.currentTime >= endTime) {
        video.currentTime = startTime;
      }
      video.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleScrubberInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    if (!scrubberRef.current) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const time = pct * duration;

    if (isDragging === 'start') {
      const newStart = Math.min(time, endTime - 5);
      setStartTime(Math.max(0, newStart));
    } else if (isDragging === 'end') {
      const newEnd = Math.max(time, startTime + 5);
      setEndTime(Math.min(duration, newEnd));
    }
  };

  const handleTrimComplete = async () => {
    // For MVP: we pass the original file with trim metadata
    // A production app would use FFmpeg.wasm here
    onTrimComplete(file, trimDuration);
  };

  const resetTrim = () => {
    setStartTime(0);
    setEndTime(Math.min(duration, 15));
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
    }
    setIsPlaying(false);
  };

  const startPct = (startTime / duration) * 100 || 0;
  const endPct = (endTime / duration) * 100 || 100;
  const currentPct = (currentTime / duration) * 100 || 0;

  return (
    <div className="flex flex-col h-full">
      <canvas ref={canvasRef} className="hidden" />

      {/* Video preview */}
      <div className="flex-1 relative bg-background rounded-xl overflow-hidden mb-4 max-h-[50vh]">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          playsInline
          muted
        />
        {/* Play overlay */}
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-background/20"
        >
          <div className="w-16 h-16 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center">
            {isPlaying ? (
              <Pause className="w-8 h-8 text-foreground" />
            ) : (
              <Play className="w-8 h-8 text-foreground ml-1" />
            )}
          </div>
        </button>

        {/* Trim duration badge */}
        <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold ${
          isValidTrim ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'
        }`}>
          <Scissors className="w-3 h-3 inline mr-1" />
          {trimDuration}s
        </div>
      </div>

      {/* Thumbnail scrubber */}
      <div className="px-2 mb-4">
        <div
          ref={scrubberRef}
          className="relative h-16 rounded-lg overflow-hidden bg-secondary cursor-pointer"
          onMouseMove={isDragging ? handleScrubberInteraction : undefined}
          onMouseUp={() => setIsDragging(null)}
          onMouseLeave={() => setIsDragging(null)}
          onTouchMove={isDragging ? handleScrubberInteraction : undefined}
          onTouchEnd={() => setIsDragging(null)}
        >
          {/* Thumbnails */}
          <div className="absolute inset-0 flex">
            {thumbnails.map((thumb, i) => (
              <img
                key={i}
                src={thumb}
                alt=""
                className="h-full flex-1 object-cover"
              />
            ))}
            {thumbnails.length === 0 && (
              <div className="flex-1 bg-muted animate-pulse" />
            )}
          </div>

          {/* Dimmed regions outside trim */}
          <div
            className="absolute inset-y-0 left-0 bg-background/70"
            style={{ width: `${startPct}%` }}
          />
          <div
            className="absolute inset-y-0 right-0 bg-background/70"
            style={{ width: `${100 - endPct}%` }}
          />

          {/* Trim selection border */}
          <div
            className="absolute inset-y-0 border-2 border-primary rounded-sm"
            style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
          />

          {/* Start handle */}
          <div
            className="absolute inset-y-0 w-5 cursor-ew-resize z-10 flex items-center justify-center"
            style={{ left: `calc(${startPct}% - 10px)` }}
            onMouseDown={() => setIsDragging('start')}
            onTouchStart={() => setIsDragging('start')}
          >
            <div className="w-1.5 h-8 rounded-full bg-primary" />
          </div>

          {/* End handle */}
          <div
            className="absolute inset-y-0 w-5 cursor-ew-resize z-10 flex items-center justify-center"
            style={{ left: `calc(${endPct}% - 10px)` }}
            onMouseDown={() => setIsDragging('end')}
            onTouchStart={() => setIsDragging('end')}
          >
            <div className="w-1.5 h-8 rounded-full bg-primary" />
          </div>

          {/* Current time indicator */}
          {isPlaying && (
            <div
              className="absolute inset-y-0 w-0.5 bg-foreground z-20"
              style={{ left: `${currentPct}%` }}
            />
          )}
        </div>

        {/* Time labels */}
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{formatTime(startTime)}</span>
          <span className={`font-medium ${isValidTrim ? 'text-success' : 'text-destructive'}`}>
            {trimDuration}s selected {!isValidTrim && '(need 5-15s)'}
          </span>
          <span>{formatTime(endTime)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="outline" size="icon" onClick={resetTrim}>
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          variant="gold"
          className="flex-1"
          onClick={handleTrimComplete}
          disabled={!isValidTrim}
        >
          <Check className="w-4 h-4 mr-2" />
          Use Clip
        </Button>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
