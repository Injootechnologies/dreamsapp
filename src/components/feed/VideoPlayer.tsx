import { useRef, useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  isVisible: boolean;
  className?: string;
}

export function VideoPlayer({ src, isVisible, className = "" }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isVisible) {
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isVisible]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMuted((prev) => !prev);
  };

  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        src={src}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        muted={muted}
        playsInline
        preload="metadata"
      />
      {/* Mute toggle */}
      <button
        onClick={toggleMute}
        className="absolute bottom-32 right-4 z-20 w-9 h-9 rounded-full bg-background/40 backdrop-blur-sm flex items-center justify-center"
      >
        {muted ? (
          <VolumeX className="w-4 h-4 text-foreground" />
        ) : (
          <Volume2 className="w-4 h-4 text-foreground" />
        )}
      </button>
    </div>
  );
}
