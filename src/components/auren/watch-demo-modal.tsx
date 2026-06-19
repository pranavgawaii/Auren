"use client";

import { useEffect, useState } from "react";
import { HeroVideoDialog } from "@/components/ui/hero-video-dialog";

export function WatchDemoModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (target && (target.getAttribute('href')?.includes('#demo') || target.getAttribute('href')?.includes('#watch-demo'))) {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(true);
      }
    };
    
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  return (
    <HeroVideoDialog
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      hideThumbnail={true}
      animationStyle="from-center"
      videoSrc="https://www.youtube.com/embed/uBdourG9P2w?autoplay=1"
      thumbnailSrc="" // Not needed as hideThumbnail is true
    />
  );
}
