"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchEmails, type SearchResult as ServerSearchResult } from "@/app/actions/search-emails";

function getAvatarColor(name: string) {
  const colors = [
    { bg: "#FEF3C7", text: "#92400E" },
    { bg: "#DBEAFE", text: "#1E40AF" },
    { bg: "#D1FAE5", text: "#065F46" },
    { bg: "#FCE0D2", text: "#E8593C" },
    { bg: "#F3E8FF", text: "#6B21A8" },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function SearchClient() {
  const [query, setQuery] = useState("Hackathon");
  const [results, setResults] = useState<ServerSearchResult[]>([]);
  const [latencyMs, setLatencyMs] = useState(14);
  const [isSearching, setIsSearching] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      startTransition(async () => {
        try {
          const res = await searchEmails(query);
          if (res.success) {
            setResults(res.results);
            setLatencyMs(res.latencyMs);
          } else {
            setResults([]);
          }
        } catch {
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#383838] h-full relative">
      
      {/* Search Header */}
      <div className="p-6 border-b border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF3EC] dark:bg-[#2C2C2C]">
        <div className="relative flex items-center mb-4">
          <Search className="absolute left-4 w-5 h-5 text-[rgba(36,27,20,0.35)] dark:text-[rgba(255,255,255,0.35)]" />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Semantic search emails..."
            className="w-full h-[48px] bg-white dark:bg-[#383838] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[10px] pl-12 pr-10 text-[14px] font-sans text-[#241B14] dark:text-[#F4F4F5] placeholder:text-[rgba(36,27,20,0.35)] dark:placeholder:text-[rgba(255,255,255,0.35)] focus:outline-none focus:ring-1 focus:ring-[#E8593C] focus:border-[#E8593C] transition-all shadow-sm"
          />
          {isSearching && (
            <Loader2 className="absolute right-4 w-4 h-4 text-[#E8593C] animate-spin" />
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="font-sans text-[12px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]">
            {results.length} result{results.length === 1 ? "" : "s"} found
          </span>
          <div className="bg-[#E1F5EE] text-[#085041] dark:bg-[#064E3B]/30 dark:text-[#34D399] px-3 py-1 rounded-full font-sans font-semibold text-[11px]">
            {latencyMs}ms latency
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {results.length === 0 && !isSearching ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-[14px] text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] font-sans">
              {query.trim() ? "No matching emails found" : "Type to search your inbox..."}
            </p>
          </div>
        ) : (
          results.map((result, i) => {
            const senderName = result.email.fromName || result.email.fromEmail || "Unknown Sender";
            const avatarColor = getAvatarColor(senderName);
            const matchScore = Math.round((result.similarity || 0.9) * 100);

            return (
              <div 
                key={result.email.id || i}
                className={cn(
                  "h-[64px] flex items-center px-6 cursor-pointer border-b border-[rgba(36,27,20,0.04)] dark:border-[rgba(255,255,255,0.04)] transition-colors hover:bg-[rgba(36,27,20,0.02)] dark:hover:bg-[rgba(255,255,255,0.03)]",
                  i === 0 && "bg-[rgba(36,27,20,0.015)] dark:bg-[rgba(255,255,255,0.015)]"
                )}
              >
                <div 
                  className="w-[32px] h-[32px] rounded-full flex items-center justify-center font-bold text-[12px] shrink-0"
                  style={{ backgroundColor: avatarColor.bg, color: avatarColor.text }}
                >
                  {senderName.charAt(0).toUpperCase()}
                </div>

                <div className="ml-3 flex-1 min-w-0 overflow-hidden">
                  <div className="font-sans font-semibold text-[13px] text-[#241B14] dark:text-[#F4F4F5] truncate">
                    {senderName}
                  </div>
                  <div className="font-sans text-[12px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] truncate mt-[2px]">
                    {result.email.subject || "(No Subject)"}
                  </div>
                </div>

                <div className="shrink-0 ml-4">
                  <div className="bg-[#FCE0D2] text-[#E8593C] dark:bg-[#E8593C]/20 dark:text-[#E8593C] rounded-full px-2.5 py-1 font-sans font-semibold text-[11px]">
                    {matchScore}% match
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

