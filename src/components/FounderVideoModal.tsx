import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STORAGE_KEY = "galoras_founder_video_seen";

// TODO: Replace this placeholder with your actual founder video URL
const FOUNDER_VIDEO_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export function FounderVideoModal() {
  const [isOpen, setIsOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const hasSeenVideo = localStorage.getItem(STORAGE_KEY);
    if (!hasSeenVideo) {
      setIsOpen(true);
    }
  }, []);

  const handleVideoEnd = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      localStorage.setItem(STORAGE_KEY, "true");
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-black border-none">
        <DialogHeader className="sr-only">
          <DialogTitle>Welcome to Galoras</DialogTitle>
        </DialogHeader>
        <video
          ref={videoRef}
          src={FOUNDER_VIDEO_URL}
          controls
          onEnded={handleVideoEnd}
          className="w-full aspect-video"
          playsInline
        >
          Your browser does not support the video tag.
        </video>
      </DialogContent>
    </Dialog>
  );
}
