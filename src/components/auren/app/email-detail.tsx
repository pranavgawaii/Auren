"use client";

import React, { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Reply, CalendarPlus, GitBranch, Archive } from "lucide-react";
import type { GmailMessage } from "@/types";

interface EmailDetailProps {
  email?: GmailMessage;
  thread?: GmailMessage[];
  onAction?: (command: string) => void;
  isAgentLoading?: boolean;
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

export function EmailDetail({ email, thread = [], onAction, isAgentLoading }: EmailDetailProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!email) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white">
        <h1 style={{ fontFamily: "var(--font-civane, Georgia, serif)" }} className="text-[36px] text-[rgba(36,27,20,0.35)] tracking-tight">Auren</h1>
        <p className="font-sans text-[13px] text-[rgba(36,27,20,0.35)] mt-2">Select an email to read</p>
      </div>
    );
  }

  const handleMenuAction = (command: string) => {
    setIsMenuOpen(false);
    onAction?.(command);
  };

  // Use thread if available, otherwise fallback to single email
  const messagesToRender = thread.length > 0 ? thread : [email];
  const subject = email.subject;

  return (
    <div className="flex-1 flex flex-col bg-white h-full relative">
      <div className="flex-1 overflow-y-auto px-8 py-8 scrollbar-hide pb-[100px]">
        {/* Main Subject Header */}
        <div className="flex items-start justify-between mb-8">
          <h3 style={{ fontFamily: "var(--font-civane, Georgia, serif)" }} className="text-[28px] text-[#241B14] tracking-tight leading-snug max-w-2xl">
            {subject}
          </h3>
          
          {/* ••• Menu */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[rgba(36,27,20,0.4)] hover:bg-[rgba(36,27,20,0.04)] hover:text-[#241B14] transition-colors"
              title="More actions"
            >
              <MoreHorizontal size={18} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-[200px] bg-white border border-[rgba(36,27,20,0.08)] rounded-[12px] shadow-[0_8px_30px_rgba(36,27,20,0.1)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                <button
                  onClick={() => handleMenuAction("Create a GitHub issue about this email")}
                  disabled={isAgentLoading}
                  className="w-full flex items-center gap-3 px-4 py-3 font-sans text-[13px] text-[#241B14] hover:bg-[rgba(36,27,20,0.03)] transition-colors disabled:opacity-50 text-left"
                >
                  <GitBranch size={15} className="text-[rgba(36,27,20,0.4)]" />
                  Create GitHub Issue
                </button>
                <div className="h-px bg-[rgba(36,27,20,0.04)] mx-3" />
                <button
                  onClick={() => handleMenuAction("Archive this email")}
                  disabled={isAgentLoading}
                  className="w-full flex items-center gap-3 px-4 py-3 font-sans text-[13px] text-[#241B14] hover:bg-[rgba(36,27,20,0.03)] transition-colors disabled:opacity-50 text-left"
                >
                  <Archive size={15} className="text-[rgba(36,27,20,0.4)]" />
                  Archive
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Thread Messages */}
        <div className="flex flex-col gap-8">
          {messagesToRender.map((msg, index) => {
            const avatarColor = getAvatarColor(msg.fromName || msg.from);
            return (
              <div key={msg.id} className="flex flex-col">
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-[40px] h-[40px] rounded-full flex items-center justify-center font-bold text-[14px] shrink-0 mt-1"
                    style={{ backgroundColor: avatarColor.bg, color: avatarColor.text }}
                  >
                    {(msg.fromName || msg.from).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <h2 className="font-sans font-bold text-[16px] text-[#241B14] truncate">{msg.fromName || msg.from}</h2>
                      <span className="font-sans text-[12px] text-[rgba(36,27,20,0.35)] shrink-0">{new Date(msg.date).toLocaleString()}</span>
                    </div>
                    <div className="font-sans text-[12px] text-[rgba(36,27,20,0.5)] truncate">
                      {msg.from}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div 
                  className="font-sans text-[14px] text-[#241B14] leading-[1.6] ml-[56px] overflow-hidden"
                >
                  {(msg.body.includes('<html') || msg.body.includes('<body') || msg.body.includes('<div') || msg.body.includes('<style>') || msg.body.includes('<p>') || msg.body.includes('<br>')) ? (
                    <iframe 
                      srcDoc={msg.body} 
                      className="w-full border-none"
                      sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                      scrolling="no"
                      onLoad={(e) => {
                        const iframe = e.target as HTMLIFrameElement;
                        if (iframe.contentWindow?.document) {
                          const doc = iframe.contentWindow.document;
                          // Reset height temporarily to allow shrinking
                          iframe.style.height = '10px';
                          // Use documentElement for more accurate measurement and add safety padding
                          const newHeight = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight);
                          iframe.style.height = `${newHeight + 20}px`;
                        }
                      }}
                    />
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.body}</div>
                  )}
                </div>

                {/* Divider between messages, but not after the last one */}
                {index < messagesToRender.length - 1 && (
                  <div className="w-full h-[1px] bg-[rgba(36,27,20,0.06)] mt-8 ml-[56px]" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Bottom Bar — only Reply and Schedule */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent flex items-center gap-3">
        <button
          onClick={() => onAction?.("Reply to this email")}
          disabled={isAgentLoading}
          className="h-9 px-4 bg-[#E8593C] text-white rounded-[8px] font-sans font-semibold text-[13px] hover:bg-[#D14F31] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
        >
          <Reply size={14} />
          {isAgentLoading ? "Thinking..." : "Reply"}
        </button>
        <button
          onClick={() => onAction?.("Schedule a 30 minute meeting based on this email")}
          disabled={isAgentLoading}
          className="h-9 px-4 border border-[rgba(36,27,20,0.08)] text-[rgba(36,27,20,0.6)] rounded-[8px] font-sans font-semibold text-[13px] hover:bg-[rgba(36,27,20,0.02)] transition-colors bg-white disabled:opacity-50 flex items-center gap-2"
        >
          <CalendarPlus size={14} />
          Schedule
        </button>
      </div>
    </div>
  );
}
