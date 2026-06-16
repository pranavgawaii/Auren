"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Reply, Calendar as CalendarIcon, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GmailMessage } from "@/types";

interface EmailRowProps {
  id: string;
  sender: string;
  subject: string;
  time: string;
  priority: "urgent" | "normal" | "fyi";
  avatarColor: { bg: string; text: string };
  isSelected?: boolean;
  onSelect: (id: string) => void;
}

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

function EmailRow({ id, sender, subject, time, priority, avatarColor, isSelected, onSelect }: EmailRowProps) {
  const [isHovered, setIsHovered] = useState(false);

  const priorityColor = {
    urgent: "#EF4444",
    normal: "#6366F1",
    fyi: "#D1D5DB"
  }[priority];

  return (
    <div 
      className={cn(
        "h-[60px] flex items-center px-4 cursor-pointer border-b border-[rgba(36,27,20,0.04)] transition-colors relative group",
        isSelected ? "bg-[#FBF3EC]" : "hover:bg-[rgba(36,27,20,0.02)]"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(id)}
    >
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#E8593C]" />
      )}
      
      <div 
        className="w-[32px] h-[32px] rounded-full flex items-center justify-center font-bold text-[12px] shrink-0"
        style={{ backgroundColor: avatarColor.bg, color: avatarColor.text }}
      >
        {sender.charAt(0).toUpperCase()}
      </div>

      <div className="ml-3 flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="font-sans font-semibold text-[13px] text-[#241B14] truncate">
            {sender}
          </span>
        </div>
        <div className="font-sans text-[12px] text-[rgba(36,27,20,0.5)] truncate mt-[2px]">
          {subject}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-4">
        <div 
          className="w-[6px] h-[6px] rounded-full" 
          style={{ backgroundColor: priorityColor }} 
        />
        
        <div className="w-[80px] flex justify-end">
          {isHovered ? (
            <div className="flex items-center gap-2 text-[rgba(36,27,20,0.4)]">
              <button className="hover:text-[#241B14] transition-colors"><Reply size={14} /></button>
              <button className="hover:text-[#241B14] transition-colors"><CalendarIcon size={14} /></button>
              <button className="hover:text-[#241B14] transition-colors"><Code2 size={14} /></button>
            </div>
          ) : (
            <span className="font-sans text-[11px] text-[rgba(36,27,20,0.35)]">
              {time}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export interface InboxPanelProps {
  emails: GmailMessage[];
  selectedEmailId: string;
  onSelectEmail: (id: string) => void;
  onRefresh: (shouldSync?: boolean) => void;
  isLoading: boolean;
}

export function InboxPanel({ emails, selectedEmailId, onSelectEmail, onRefresh, isLoading }: InboxPanelProps) {
  const [activeTab, setActiveTab] = useState("All");

  const priorityMap: Record<string, "urgent" | "normal" | "fyi"> = {
    urg: "urgent",
    nrm: "normal",
    fyi: "fyi",
    urgent: "urgent",
    normal: "normal",
  };

  const filteredEmails = emails.filter(email => {
    if (activeTab === "All") return true;
    const p = email.priority || "nrm";
    if (activeTab === "Urgent") return p === "urg" || p === "urgent";
    if (activeTab === "Normal") return p === "nrm" || p === "normal";
    if (activeTab === "FYI") return p === "fyi";
    return true;
  });

  const countAll = emails.length;
  const countUrgent = emails.filter(e => e.priority === "urg" || e.priority === "urgent").length;
  const countNormal = emails.filter(e => e.priority === "nrm" || e.priority === "normal" || !e.priority).length;
  const countFYI = emails.filter(e => e.priority === "fyi").length;

  const tabs = [
    { name: "All", count: countAll, color: "bg-[rgba(36,27,20,0.4)]", desc: "All incoming emails" },
    { name: "Urgent", count: countUrgent, color: "bg-[#EF4444]", desc: "Immediate attention required" },
    { name: "Normal", count: countNormal, color: "bg-[#6366F1]", desc: "Regular priority correspondence" },
    { name: "FYI", count: countFYI, color: "bg-[#D1D5DB]", desc: "For Your Information (Newsletters & CCs)" },
  ];

  return (
    <div className="w-full flex-1 flex flex-col bg-white h-full overflow-hidden">
      
      {/* Header */}
      <div className="h-[56px] px-6 flex items-center justify-between border-b border-[rgba(36,27,20,0.08)] shrink-0">
        <div className="flex items-center gap-2">
          <h2 style={{ fontFamily: "var(--font-civane, Georgia, serif)" }} className="text-[20px] text-[#241B14] tracking-tight">
            Inbox
          </h2>
          <div className="bg-[#FBF3EC] border border-[rgba(36,27,20,0.08)] rounded-full px-2 py-[2px] font-sans text-[11px] text-[rgba(36,27,20,0.5)] leading-none flex items-center">
            {filteredEmails.length}
          </div>
        </div>
        <button 
          onClick={() => onRefresh(true)}
          disabled={isLoading}
          className="h-[28px] px-3 border border-[rgba(36,27,20,0.08)] rounded-[8px] font-sans text-[11px] text-[#241B14] hover:bg-[#FBF3EC] transition-colors disabled:opacity-50"
        >
          {isLoading ? "Syncing..." : "Sync"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-4 border-b border-[rgba(36,27,20,0.08)] bg-[#FAF8F5] shrink-0 gap-1 select-none">
        {tabs.map(tab => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={cn(
              "font-sans text-[11.5px] pb-[10px] pt-[12px] px-2.5 relative transition-all flex items-center gap-1.5",
              activeTab === tab.name 
                ? "text-[#241B14] font-semibold" 
                : "text-[rgba(36,27,20,0.4)] hover:text-[#241B14]"
            )}
            title={tab.desc}
          >
            {tab.name !== "All" && (
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", tab.color)} />
            )}
            <span>{tab.name}</span>
            <span className={cn(
              "text-[9px] px-1.5 py-0.5 rounded font-mono leading-none font-medium",
              activeTab === tab.name 
                ? "bg-[#E8593C]/10 text-[#E8593C]" 
                : "bg-[rgba(36,27,20,0.04)] text-[rgba(36,27,20,0.4)]"
            )}>
              {tab.count}
            </span>
            {activeTab === tab.name && (
              <motion.div 
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E8593C]" 
              />
            )}
          </button>
        ))}
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {filteredEmails.map((email) => (
          <EmailRow 
            key={email.id} 
            id={email.id}
            sender={email.fromName || email.from}
            subject={email.subject}
            time={new Date(email.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            priority={priorityMap[email.priority || "nrm"] || "normal"}
            avatarColor={getAvatarColor(email.fromName || email.from)}
            isSelected={selectedEmailId === email.id}
            onSelect={onSelectEmail}
          />
        ))}
        {filteredEmails.length === 0 && !isLoading && (
          <div className="p-8 text-center text-[rgba(36,27,20,0.5)] font-sans text-[13px]">
            No emails found.
          </div>
        )}
      </div>

    </div>
  );
}
