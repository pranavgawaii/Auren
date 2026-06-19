"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

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

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[rgba(36,27,20,0.75)] backdrop-blur-md transition-all duration-300 animate-in fade-in"
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="relative w-full max-w-[800px] bg-[#241B14] rounded-[24px] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#2C231C]">
          <span className="font-civane text-[17px] text-white tracking-wide" style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>Auren Product Demo</span>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/5 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Responsive Video Container */}
        <div className="relative pt-[56.25%] w-full bg-black">
          <iframe 
            src="https://drive.google.com/file/d/1UpaTPPVXuaxdvdgd7aQlMnyH4I2VPC0h/preview" 
            className="absolute top-0 left-0 w-full h-full border-none"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
