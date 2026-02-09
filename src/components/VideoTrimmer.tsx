import { useState, useRef, useEffect, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, Scissors } from "lucide-react";

interface VideoTrimmerProps {
  videoSrc: string;
  onTrimComplete: (trimmedVideoUrl: string, start: number, end: number) => void;
  minDuration?: number;
  maxDuration?: number;
}

export function VideoTrimmer({
  videoSrc,
  onTrimComplete,
  minDuration = 5,
  maxDuration = 15,
}: VideoTrimmerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const animFrameRef = useRef<number>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoaded = () => {
      const dur = video.duration;
      setDuration(dur);
      setTrimStart(0);
      setTrimEnd(Math.min(dur, maxDuration));
    };

    video.addEventListener("loadedmetadata", onLoaded);
    return () => video.removeEventListener("loadedmetadata", onLoaded);
  }, [videoSrc, maxDuration]);

  const updateTime = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);

    if (video.currentTime >= trimEnd) {
      video.pause();
      video.currentTime = trimStart;
      setIsPlaying(false);
      return;
    }
    animFrameRef.current = requestAnimationFrame(updateTime);
  }, [trimStart, trimEnd]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      cancelAnimationFrame(animFrameRef.current!);
    } else {
      video.currentTime = trimStart;
      video.play();
      animFrameRef.current = requestAnimationFrame(updateTime);
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current!);
  }, []);

  const handleStartChange = (val: number[]) => {
    const newStart = val[0];
    const maxStart = trimEnd - minDuration;
    const clamped = Math.min(newStart, maxStart);
    setTrimStart(Math.max(0, clamped));
    if (videoRef.current) videoRef.current.currentTime = Math.max(0, clamped);
  };

  const handleEndChange = (val: number[]) => {
    const newEnd = val[0];
    const minEnd = trimStart + minDuration;
    const maxEnd = Math.min(trimStart + maxDuration, duration);
    const clamped = Math.max(minEnd, Math.min(newEnd, maxEnd));
    setTrimEnd(clamped);
  };

  const clipDuration = Math.round((trimEnd - trimStart) * 10) / 10;
  const isValid = clipDuration >= minDuration && clipDuration <= maxDuration;

  const handleConfirm = () => {
    if (isValid) {
      onTrimComplete(videoSrc, trimStart, trimEnd);
    }
  };

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {/* Video preview */}
      <div className="aspect-[9/16] max-h-[300px] rounded-xl overflow-hidden bg-secondary relative">
        <video
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20"
        >
          <div className="w-14 h-14 rounded-full bg-background/80 flex items-center justify-center">
            {isPlaying ? (
              <Pause className="w-6 h-6 text-foreground" />
            ) : (
              <Play className="w-6 h-6 text-foreground ml-1" />
            )}
          </div>
        </button>

        {/* Time indicator */}
        <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-black/60 text-white text-xs font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Trim controls */}
      <div className="space-y-3 px-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Scissors className="w-3.5 h-3.5" /> Trim Duration
          </span>
          <span className={`text-xs font-bold ${isValid ? "text-success" : "text-destructive"}`}>
            {clipDuration}s / {minDuration}-{maxDuration}s
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Start: {formatTime(trimStart)}</span>
          </div>
          <Slider
            value={[trimStart]}
            min={0}
            max={duration}
            step={0.1}
            onValueChange={handleStartChange}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>End: {formatTime(trimEnd)}</span>
          </div>
          <Slider
            value={[trimEnd]}
            min={0}
            max={duration}
            step={0.1}
            onValueChange={handleEndChange}
          />
        </div>
      </div>

      <Button
        variant="gold"
        className="w-full"
        onClick={handleConfirm}
        disabled={!isValid}
      >
        Confirm Trim ({clipDuration}s)
      </Button>
    </div>
  );
}
