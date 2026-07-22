"use client";

import { useEffect, useState } from "react";
import { HeroVideoDialog } from "@/components/ui/hero-video-dialog";

interface WatchDemoModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  videoId?: string;
}

export function WatchDemoModal({ isOpen: controlledIsOpen, onClose, videoId }: WatchDemoModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  
  const setIsOpen = (open: boolean) => {
    if (controlledIsOpen !== undefined) {
      if (!open && onClose) {
        onClose();
      }
    } else {
      setInternalIsOpen(open);
    }
  };

  useEffect(() => {
    if (controlledIsOpen !== undefined) return;

    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (target && (target.getAttribute('href')?.includes('#demo') || target.getAttribute('href')?.includes('#watch-demo'))) {
        e.preventDefault();
        e.stopPropagation();
        setInternalIsOpen(true);
      }
    };
    
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [controlledIsOpen]);

  const activeVideoId = videoId || process.env.NEXT_PUBLIC_ONBOARDING_VIDEO_ID || "uBdourG9P2w";
  const videoSrc = `https://www.youtube.com/embed/${activeVideoId}?autoplay=1`;

  return (
    <HeroVideoDialog
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      hideThumbnail={true}
      animationStyle="from-center"
      videoSrc={videoSrc}
      thumbnailSrc=""
    />
  );
}
