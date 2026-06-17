import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';

export function DailyBrief() {
  const { user } = useUser();
  const firstName = user?.firstName || "there";
  
  const [greeting, setGreeting] = useState("Good morning");
  const [meetingCount, setMeetingCount] = useState(2);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
    
    // Mock dynamic meeting count for personalization feel based on the day
    const pseudoRandom = (new Date().getDate() + (user?.id ? user.id.charCodeAt(0) : 0)) % 4;
    setMeetingCount(pseudoRandom);
  }, [user]);

  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-[#FAF8F5] relative overflow-hidden">
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]" 
        style={{ backgroundImage: 'radial-gradient(#241B14 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      ></div>
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-md px-6">
        <div className="w-16 h-16 mb-8 rounded-2xl bg-white shadow-sm border border-[rgba(36,27,20,0.08)] flex items-center justify-center">
          <Image src="/auren_logo.webp" alt="Auren" width={40} height={40} className="opacity-90" />
        </div>
        
        <h2 className="text-[28px] leading-tight font-medium text-[#241B14] mb-3" style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>
          {greeting}, {firstName}.
        </h2>
        
        <p className="text-[15px] text-[rgba(36,27,20,0.6)] mb-8 leading-relaxed">
          Your inbox is clear. 
          {meetingCount > 0 ? (
            <> You have <span className="font-medium text-[#241B14]">{meetingCount} {meetingCount === 1 ? 'meeting' : 'meetings'}</span> coming up today.</>
          ) : (
            <> Your schedule is wide open today.</>
          )}
        </p>

        <button 
          onClick={() => {
            // Trigger Auren focus or open command menu
            const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
            document.dispatchEvent(event);
          }}
          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-[rgba(36,27,20,0.12)] rounded-full text-[14px] font-medium text-[#241B14] hover:bg-neutral-50 transition-colors shadow-sm cursor-pointer"
        >
          <Image src="/auren_logo.webp" alt="Auren" width={14} height={14} className="opacity-80 rounded-[2px]" />
          Ask Auren
        </button>
      </div>
    </div>
  );
}

