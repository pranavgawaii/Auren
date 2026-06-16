"use client";

import React, { useEffect, useState } from "react";
import { Search, Mail, Calendar, Settings, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandMenuProps {
  onSelectView: (view: "inbox" | "search" | "calendar" | "settings" | "history") => void;
}

export function CommandMenu({ onSelectView }: CommandMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const options = [
    { id: "inbox", label: "Go to Inbox", icon: Mail, view: "inbox" as const },
    { id: "search", label: "Search...", icon: Search, view: "search" as const },
    { id: "calendar", label: "Go to Calendar", icon: Calendar, view: "calendar" as const },
    { id: "history", label: "Agent History", icon: Activity, view: "history" as const },
    { id: "settings", label: "Settings", icon: Settings, view: "settings" as const },
  ];

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] bg-[rgba(255,255,255,0.6)] backdrop-blur-sm flex items-start justify-center pt-[15vh]">
      <div 
        className="w-full max-w-lg bg-white rounded-xl shadow-[0_16px_60px_rgba(36,27,20,0.1)] border border-[rgba(36,27,20,0.08)] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-[rgba(36,27,20,0.06)]">
          <Search size={18} className="text-[rgba(36,27,20,0.4)] mr-3" />
          <input 
            autoFocus
            className="flex-1 bg-transparent border-none outline-none font-sans text-[15px] text-[#241B14] placeholder:text-[rgba(36,27,20,0.3)]"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="text-[10px] font-sans font-medium text-[rgba(36,27,20,0.3)] bg-[rgba(36,27,20,0.04)] px-1.5 py-0.5 rounded border border-[rgba(36,27,20,0.06)]">
            ESC
          </div>
        </div>
        
        <div className="p-2 max-h-[300px] overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-[13px] font-sans text-[rgba(36,27,20,0.4)]">
              No results found.
            </div>
          ) : (
            filteredOptions.map((opt, i) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    onSelectView(opt.view);
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                    "hover:bg-[rgba(36,27,20,0.04)] text-[#241B14]"
                  )}
                >
                  <Icon size={16} className="text-[rgba(36,27,20,0.5)]" />
                  <span className="font-sans text-[13px]">{opt.label}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
      
      {/* Click outside to close */}
      <div className="absolute inset-0 z-[-1]" onClick={() => setIsOpen(false)} />
    </div>
  );
}
