"use client";

import React, { useState, useEffect } from "react";
import { Search, History } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

export function ClockHistoryIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.8" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

interface AppShellProps {
  children: React.ReactNode;
  currentView?: "search" | "calendar" | "inbox" | "settings" | "history" | "github";
  onViewChange?: (view: "search" | "calendar" | "inbox" | "settings" | "history" | "github") => void;
  isCalendarOpen?: boolean;
  onToggleCalendar?: () => void;
  isConsoleOpen?: boolean;
  onToggleConsole?: () => void;
}

export function AppShell({ 
  children, 
  currentView = "inbox", 
  onViewChange, 
  isCalendarOpen = true, 
  onToggleCalendar,
  isConsoleOpen = false,
  onToggleConsole
}: AppShellProps) {
  const isPro = true;
  const [showThemeToggle, setShowThemeToggle] = useState(false);

  useEffect(() => {
    const loadSettings = () => {
      const savedTopbarToggle = localStorage.getItem("auren_show_topbar_toggle");
      setShowThemeToggle(savedTopbarToggle === "true");
    };
    
    if (typeof window !== "undefined") {
      loadSettings();
      window.addEventListener("auren_preferences_updated", loadSettings as EventListener);
    }
    
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("auren_preferences_updated", loadSettings as EventListener);
      }
    };
  }, []);

  return (
    <div className="h-screen bg-white dark:bg-[#383838] font-sans selection:bg-[#E8593C] selection:text-white flex flex-col overflow-hidden relative">
      {/* Topbar */}
      <header 
        className="h-[56px] border-b border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] flex items-center justify-between px-6 shrink-0 z-10 bg-[rgba(251,243,236,0.92)] dark:bg-[#2C2C2C]/90 backdrop-blur-md"
      >
          
          {/* Left: Brand */}
          <div className="flex items-center gap-4">
            <Link href="/app" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <div style={{
                width: "24px", height: "24px", borderRadius: "6px", overflow: "hidden",
                position: "relative", flexShrink: 0,
              }}>
                <Image src="/auren_logo.webp" alt="Auren Logo" fill style={{ objectFit: "cover" }} />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[#241B14] dark:text-[#F4F4F5]" style={{ fontFamily: "var(--font-civane, Georgia, serif)", fontWeight: 400, fontSize: "22px", letterSpacing: "-0.02em" }}>
                    Auren
                  </span>
                  <span className={`px-1.5 py-0.5 rounded-[4px] font-sans font-bold text-[9px] tracking-widest ${isPro ? 'bg-[#E8593C]/10 text-[#E8593C]' : 'bg-[rgba(36,27,20,0.08)] dark:bg-[rgba(255,255,255,0.15)] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]'}`}>
                    {isPro ? "PRO" : "FREE"}
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Center: Search/Command */}
          <div className="flex-1 max-w-[480px] mx-8 flex items-center gap-4">
            <div className="flex items-center gap-1 bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.1)] p-1 rounded-[10px]">
              <button 
                onClick={() => onViewChange?.("inbox")}
                className={`p-1.5 rounded-[8px] flex items-center justify-center transition-colors ${currentView === "inbox" ? "bg-white dark:bg-[#383838] shadow-sm text-[#E8593C]" : "text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] hover:text-[#241B14] dark:text-[#F4F4F5]"}`}
                title="Inbox"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </button>
              <button 
                onClick={() => onViewChange?.("calendar")}
                className={`p-1.5 rounded-[8px] flex items-center justify-center transition-colors ${currentView === "calendar" ? "bg-white dark:bg-[#383838] shadow-sm text-[#E8593C]" : "text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] hover:text-[#241B14] dark:text-[#F4F4F5]"}`}
                title="Calendar"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              </button>
              <button 
                onClick={() => onViewChange?.("github")}
                className={`p-1.5 rounded-[8px] flex items-center justify-center transition-colors ${currentView === "github" ? "bg-white dark:bg-[#383838] shadow-sm text-[#E8593C]" : "text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] hover:text-[#241B14] dark:text-[#F4F4F5]"}`}
                title="GitHub"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              </button>
            </div>

            <div className="h-[32px] flex-1 bg-[#FBF3EC] dark:bg-[#202020] rounded-[10px] border border-[rgba(36,27,20,0.04)] dark:border-[rgba(255,255,255,0.04)] flex items-center px-3 gap-2">
              <Search size={14} className="text-[rgba(36,27,20,0.35)] dark:text-[rgba(255,255,255,0.35)]" />
              <input 
                type="text" 
                placeholder="Type a command..." 
                className="bg-transparent border-none outline-none font-mono text-[12px] text-[#241B14] dark:text-[#F4F4F5] placeholder:text-[rgba(36,27,20,0.35)] dark:text-[rgba(255,255,255,0.35)] dark:placeholder:text-[rgba(255,255,255,0.35)] w-full"
              />
              <span className="font-mono text-[10px] text-[rgba(36,27,20,0.35)] dark:text-[rgba(255,255,255,0.35)]">(⌘K)</span>
            </div>
          </div>

          {/* Right: User */}
          <div className="flex items-center gap-4">
            
          <div className="flex items-center gap-1 bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.1)] p-1 rounded-[10px]">
            <button 
              onClick={() => onViewChange?.("history")}
              className={`p-1.5 rounded-[8px] flex items-center justify-center transition-colors ${currentView === "history" ? "bg-white dark:bg-[#383838] shadow-sm text-[#E8593C]" : "text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] hover:text-[#241B14] dark:text-[#F4F4F5]"}`}
              title="History"
            >
              <History size={18} />
            </button>
            <button 
              onClick={() => onViewChange?.("settings")}
              className={`p-1.5 rounded-[8px] flex items-center justify-center transition-colors ${currentView === "settings" ? "bg-white dark:bg-[#383838] shadow-sm text-[#E8593C]" : "text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] hover:text-[#241B14] dark:text-[#F4F4F5]"}`}
              title="Settings"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
            {showThemeToggle && <AnimatedThemeToggler />}
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden flex bg-white dark:bg-[#383838] relative">
          {children}
        </main>

        {/* Bottom Bar */}
        <footer className="h-[32px] border-t border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] flex items-center justify-between px-6 shrink-0 bg-white dark:bg-[#2C2C2C] z-10 select-none">
          <div className="w-[120px]" />
          
          {/* Shortcuts */}
          <div className="flex items-center gap-3 font-mono text-[10px] text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]">
            <span className="flex items-center gap-1.5"><kbd className="bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.1)] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[4px] px-1 py-0.5">⌘K</kbd> search</span>
            <span className="w-1 h-1 rounded-full bg-[rgba(36,27,20,0.1)]" />
            <span className="flex items-center gap-1.5"><kbd className="bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.1)] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[4px] px-1 py-0.5">R</kbd> reply</span>
            <span className="w-1 h-1 rounded-full bg-[rgba(36,27,20,0.1)]" />
            <span className="flex items-center gap-1.5"><kbd className="bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.1)] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[4px] px-1 py-0.5">S</kbd> schedule</span>
            <span className="w-1 h-1 rounded-full bg-[rgba(36,27,20,0.1)]" />
            <span className="flex items-center gap-1.5"><kbd className="bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.1)] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[4px] px-1 py-0.5">E</kbd> archive</span>
            <span className="w-1 h-1 rounded-full bg-[rgba(36,27,20,0.1)]" />
            <span className="flex items-center gap-1.5"><kbd className="bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.1)] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[4px] px-1 py-0.5">⌘\</kbd> zen</span>
          </div>

          <div className="w-[120px] flex justify-end">
            <button 
              onClick={onToggleConsole}
              className={`flex items-center gap-2 font-sans text-[11px] font-medium transition-all px-2.5 py-1 rounded-[6px] border shadow-sm group ${
                isConsoleOpen 
                  ? "bg-[#241B14] border-[#241B14] text-white" 
                  : "bg-white dark:bg-[#383838] border-[rgba(36,27,20,0.12)] dark:border-[rgba(255,255,255,0.12)] text-[#241B14] dark:text-[#F4F4F5] hover:bg-[#FAF8F5] dark:bg-[#2C2C2C]"
              }`}
              title="Toggle Developer Console"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={isConsoleOpen ? "text-[#E8593C]" : "text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] group-hover:text-[#E8593C] transition-colors"}><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>
              <span>Console</span>
              <kbd className={`ml-1 px-1.5 py-0.5 rounded-[4px] font-mono text-[9px] ${
                isConsoleOpen 
                  ? "bg-white dark:bg-[#383838]/20 text-white" 
                  : "bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.1)] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] group-hover:bg-white dark:bg-[#383838]"
              }`}>Ctrl+\</kbd>
            </button>
          </div>
        </footer>
    </div>
  );
}
