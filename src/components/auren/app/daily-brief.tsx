import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';

export function DailyBrief() {
  const { user } = useUser();
  const firstName = user?.firstName || "there";
  
  const [greeting, setGreeting] = useState("Workspace ready,");

  useEffect(() => {
    // Keeping the effect structure in case we want to re-add time-based logic later
  }, []);

  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-[#FAF8F5] dark:bg-[#2C2C2C] relative overflow-hidden">
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]" 
        style={{ backgroundImage: 'radial-gradient(#241B14 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      ></div>
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-md px-6">
        <div className="w-16 h-16 mb-8 rounded-2xl bg-white dark:bg-[#383838] shadow-sm border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] flex items-center justify-center">
          <Image src="/auren_logo.webp" alt="Auren" width={40} height={40} className="opacity-90" />
        </div>
        
        <h2 className="text-[38px] leading-tight text-[#241B14] dark:text-[#F4F4F5] mb-6 tracking-tight" style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>
          {greeting}, {firstName}.
        </h2>
        
        <p className="text-[15px] text-[rgba(36,27,20,0.6)] dark:text-[rgba(255,255,255,0.6)] mb-10 leading-relaxed font-sans max-w-[420px] mx-auto">
          You have a mix of meetings and focused work today. Your inbox has a few routine updates and an urgent security code. Let me know if you need any help scheduling.
        </p>

        <button 
          onClick={() => {
            // Trigger Auren focus or open command menu
            const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
            document.dispatchEvent(event);
          }}
          className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-[#383838] border border-[rgba(36,27,20,0.12)] dark:border-[rgba(255,255,255,0.12)] rounded-full text-[14px] font-medium text-[#241B14] dark:text-[#F4F4F5] hover:bg-neutral-50 transition-colors shadow-sm cursor-pointer"
        >
          <Image src="/auren_logo.webp" alt="Auren" width={14} height={14} className="opacity-80 rounded-[2px]" />
          Ask Auren
        </button>
      </div>
    </div>
  );
}

