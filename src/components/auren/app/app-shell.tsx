"use client";

import React from "react";
import { Search, History } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

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
  currentView?: "inbox" | "search" | "calendar" | "settings" | "history";
  onViewChange?: (view: "inbox" | "search" | "calendar" | "settings" | "history") => void;
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
  return (
    <div className="h-screen bg-white font-sans selection:bg-[#E8593C] selection:text-white flex flex-col overflow-hidden relative">
      {/* Topbar */}
      <header 
        className="h-[56px] border-b border-[rgba(36,27,20,0.08)] flex items-center justify-between px-6 shrink-0 z-10"
        style={{
          background: "rgba(251,243,236,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
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
                <span className="font-display font-extrabold text-[20px] tracking-tight text-[#241B14]">
                  Auren
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Search/Command */}
          <div className="flex-1 max-w-[480px] mx-8 flex items-center gap-4">
            <div className="flex items-center gap-1 bg-[rgba(36,27,20,0.04)] p-1 rounded-[10px]">
              <button 
                onClick={() => onViewChange?.("inbox")}
                className={`p-1.5 rounded-[8px] flex items-center justify-center transition-colors ${currentView === "inbox" ? "bg-white shadow-sm text-[#E8593C]" : "text-[rgba(36,27,20,0.4)] hover:text-[#241B14]"}`}
                title="Inbox"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </button>
              <button 
                onClick={() => onViewChange?.("calendar")}
                className={`p-1.5 rounded-[8px] flex items-center justify-center transition-colors ${currentView === "calendar" ? "bg-white shadow-sm text-[#E8593C]" : "text-[rgba(36,27,20,0.4)] hover:text-[#241B14]"}`}
                title="Calendar"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              </button>
            </div>

            <div className="h-[32px] flex-1 bg-[#FBF3EC] rounded-[10px] border border-[rgba(36,27,20,0.04)] flex items-center px-3 gap-2">
              <Search size={14} className="text-[rgba(36,27,20,0.35)]" />
              <input 
                type="text" 
                placeholder="Type a command..." 
                className="bg-transparent border-none outline-none font-mono text-[12px] text-[#241B14] placeholder:text-[rgba(36,27,20,0.35)] w-full"
              />
              <span className="font-mono text-[10px] text-[rgba(36,27,20,0.35)]">(⌘K)</span>
            </div>
          </div>

          {/* Right: User */}
          <div className="flex items-center gap-4">
            
          <button 
            onClick={() => onViewChange?.("history")}
            className={`w-10 h-10 rounded-[10px] flex items-center justify-center transition-colors ${currentView === "history" ? "bg-[rgba(36,27,20,0.06)] text-[#241B14]" : "text-[rgba(36,27,20,0.4)] hover:bg-[rgba(36,27,20,0.04)] hover:text-[#241B14]"}`}
            title="History"
          >
            <ClockHistoryIcon size={20} />
          </button>
            
            <button 
              onClick={() => onViewChange?.("settings")}
              className={`p-2 rounded-[8px] flex items-center justify-center transition-colors ${currentView === "settings" ? "bg-[rgba(36,27,20,0.06)] text-[#241B14]" : "text-[rgba(36,27,20,0.4)] hover:bg-[rgba(36,27,20,0.04)] hover:text-[#241B14]"}`}
              title="Settings"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden flex bg-white relative">
          {children}
        </main>

        {/* Bottom Bar */}
        <footer className="h-[30px] border-t border-[rgba(36,27,20,0.08)] flex items-center justify-between px-6 shrink-0 bg-white z-10 select-none">
          <div className="w-[120px]" />
          <span className="font-mono text-[11px] text-[rgba(36,27,20,0.35)]">
            ⌘K search · R reply · E archive · J/K navigate · Ctrl+\ console
          </span>
          <div className="w-[120px] flex justify-end">
            <button 
              onClick={onToggleConsole}
              className={`flex items-center gap-1.5 font-sans text-[10px] font-semibold transition-all px-2.5 py-0.5 rounded-[6px] border ${
                isConsoleOpen 
                  ? "bg-[#E8593C]/10 border-[#E8593C]/20 text-[#E8593C]" 
                  : "bg-transparent border-[rgba(36,27,20,0.06)] text-[rgba(36,27,20,0.4)] hover:text-[#241B14] hover:bg-[rgba(36,27,20,0.02)]"
              }`}
            >
              <span className="font-mono">&gt;_</span>
              <span>Console</span>
              <span className="opacity-40 text-[9px] font-mono">Ctrl+\</span>
            </button>
          </div>
        </footer>
    </div>
  );
}
