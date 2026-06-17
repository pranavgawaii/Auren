"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  sender: string;
  subject: string;
  avatarColor: { bg: string; text: string };
  matchScore: number;
}

const MOCK_RESULTS: SearchResult[] = [
  { id: "1", sender: "Alex at Corsair", subject: "Hackathon submission details", avatarColor: { bg: "#FEF3C7", text: "#92400E" }, matchScore: 98 },
  { id: "2", sender: "Team Sync", subject: "Hackathon updates & notes", avatarColor: { bg: "#DBEAFE", text: "#1E40AF" }, matchScore: 92 },
  { id: "3", sender: "Product Review", subject: "Next steps for Corsair integration", avatarColor: { bg: "#D1FAE5", text: "#065F46" }, matchScore: 85 },
];

export function SearchClient() {
  const [query, setQuery] = useState("Hackathon");

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#383838] h-full relative">
      
      {/* Search Header */}
      <div className="p-6 border-b border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF3EC]">
        <div className="relative flex items-center mb-4">
          <Search className="absolute left-4 w-5 h-5 text-[rgba(36,27,20,0.35)] dark:text-[rgba(255,255,255,0.35)]" />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Semantic search..."
            className="w-full h-[48px] bg-white dark:bg-[#383838] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[10px] pl-12 pr-4 text-[14px] font-mono text-[#241B14] dark:text-[#F4F4F5] placeholder:text-[rgba(36,27,20,0.35)] dark:text-[rgba(255,255,255,0.35)] focus:outline-none focus:ring-1 focus:ring-[#E8593C] focus:border-[#E8593C] transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="font-sans text-[12px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]">
            {MOCK_RESULTS.length} results found
          </span>
          <div className="bg-[#E1F5EE] text-[#085041] px-3 py-1 rounded-full font-sans font-semibold text-[11px]">
            14ms latency
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {MOCK_RESULTS.map((result, i) => (
          <div 
            key={result.id}
            className={cn(
              "h-[60px] flex items-center px-6 cursor-pointer border-b border-[rgba(36,27,20,0.04)] dark:border-[rgba(255,255,255,0.04)] transition-colors hover:bg-[rgba(36,27,20,0.02)] dark:bg-[rgba(255,255,255,0.02)]",
              i === 0 && "bg-[rgba(36,27,20,0.02)] dark:bg-[rgba(255,255,255,0.02)]" // Simulate first selected
            )}
          >
            <div 
              className="w-[32px] h-[32px] rounded-full flex items-center justify-center font-bold text-[12px] shrink-0"
              style={{ backgroundColor: result.avatarColor.bg, color: result.avatarColor.text }}
            >
              {result.sender.charAt(0)}
            </div>

            <div className="ml-3 flex-1 min-w-0 overflow-hidden">
              <div className="font-sans font-semibold text-[13px] text-[#241B14] dark:text-[#F4F4F5] truncate">
                {result.sender}
              </div>
              <div className="font-sans text-[12px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] truncate mt-[2px]">
                {result.subject}
              </div>
            </div>

            <div className="shrink-0 ml-4">
              <div className="bg-[#FCE0D2] text-[#E8593C] rounded-full px-2 py-1 font-sans font-semibold text-[11px]">
                {result.matchScore}% match
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
