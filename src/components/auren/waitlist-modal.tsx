"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { WaitlistForm } from "./waitlist-form";

export function WaitlistModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (target && target.getAttribute('href')?.includes('#waitlist')) {
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[rgba(36,27,20,0.6)] backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="relative w-full max-w-[420px] bg-[#FBF3EC] rounded-[24px] shadow-[0_20px_50px_-16px_rgba(36,27,20,0.2)] p-8 border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] hover:text-[#241B14] dark:text-[#F4F4F5] transition-colors rounded-full hover:bg-[rgba(36,27,20,0.05)]"
        >
          <X size={20} />
        </button>
        
        <div className="text-center mb-6">
          <h2 className="font-civane text-[28px] text-[#241B14] dark:text-[#F4F4F5] mb-2">Secure Your Spot</h2>
          <p className="font-sans text-[14px] text-[rgba(36,27,20,0.6)] dark:text-[rgba(255,255,255,0.6)]">
            Join the waitlist to get early access to Auren.
          </p>
        </div>

        <WaitlistForm theme="light" />
      </div>
    </div>
  );
}
