"use client";

import React, { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { ColorOrb } from "./ai-input";

interface DownsideCommandBarProps {
  onExecute?: (command: string, history?: any[], opts?: { fromChat?: boolean }) => Promise<any>;
  isAgentLoading?: boolean;
  teamContacts?: { name: string; email: string }[];
  emails?: any[];
}

export function DownsideCommandBar({
  onExecute,
  isAgentLoading = false,
  teamContacts = [],
  emails = [],
}: DownsideCommandBarProps) {
  const [inputVal, setInputVal] = useState("");
  const [mentionQuery, setMentionQuery] = useState<{ trigger: "@" | "/"; text: string } | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mentions list (@contacts and /repos)
  const mentions = useMemo(() => {
    const repos = [
      { id: "repo-1", trigger: "/" as const, label: "Auren Frontend", value: "github/Auren", display: "github.com/8TEEH/Auren" },
      { id: "repo-2", trigger: "/" as const, label: "skills-introduction-to-github", value: "github/skills-intro", display: "github.com/8TEEH/skills-intro" },
    ];

    const contacts = teamContacts.map((c) => ({
      id: `team-${c.email}`,
      trigger: "@" as const,
      label: c.name,
      value: `@${c.name}`,
      display: c.email,
    }));

    return [...contacts, ...repos];
  }, [teamContacts]);

  const filteredMentions = useMemo(() => {
    if (!mentionQuery) return [];
    return mentions.filter(
      (m) =>
        m.trigger === mentionQuery.trigger &&
        (m.label.toLowerCase().includes(mentionQuery.text) || m.display.toLowerCase().includes(mentionQuery.text))
    );
  }, [mentionQuery, mentions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);

    const cursor = e.target.selectionStart || val.length;
    const textBeforeCursor = val.slice(0, cursor);
    const match = textBeforeCursor.match(/([@/])(\S*)$/);

    if (match) {
      setMentionQuery({ trigger: match[1] as "@" | "/", text: match[2].toLowerCase() });
      setSelectedIndex(0);
    } else {
      setMentionQuery(null);
    }
  };

  const insertMention = (value: string) => {
    if (!inputRef.current) return;
    const cursor = inputRef.current.selectionStart || inputVal.length;
    const textBeforeCursor = inputVal.slice(0, cursor);
    const match = textBeforeCursor.match(/([@/])(\S*)$/);

    if (match) {
      const start = match.index!;
      const before = inputVal.slice(0, start);
      const after = inputVal.slice(cursor);
      const updated = before + value + " " + after;
      setInputVal(updated);
      setMentionQuery(null);

      setTimeout(() => {
        if (inputRef.current) {
          const newPos = start + value.length + 1;
          inputRef.current.setSelectionRange(newPos, newPos);
          inputRef.current.focus();
        }
      }, 10);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd || isAgentLoading) return;

    setInputVal("");
    setMentionQuery(null);

    // Dispatch event to open AI Chat panel and submit command
    const openEvent = new CustomEvent("open-ai-chat", {
      detail: { text: cmd, autoSubmit: true },
    });
    document.dispatchEvent(openEvent);

    if (onExecute) {
      onExecute(cmd, [], { fromChat: false });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (mentionQuery && filteredMentions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredMentions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredMentions.length) % filteredMentions.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertMention(filteredMentions[selectedIndex].value);
        return;
      }
      if (e.key === "Escape") {
        setMentionQuery(null);
        return;
      }
    }

    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="fixed bottom-10 sm:bottom-12 left-1/2 -translate-x-1/2 z-40 w-[92%] sm:w-full max-w-[700px] pointer-events-auto">
      {/* Mention Suggestions Popup */}
      <AnimatePresence>
        {mentionQuery && filteredMentions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2.5 left-3 right-3 bg-white dark:bg-[#2C2C2C] border border-[rgba(36,27,20,0.12)] dark:border-[rgba(255,255,255,0.12)] rounded-2xl shadow-xl overflow-hidden py-1.5 z-50 max-h-52 overflow-y-auto"
          >
            {filteredMentions.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => insertMention(item.value)}
                className={`w-full text-left px-4 py-2.5 flex items-center justify-between text-[13.5px] transition-colors ${
                  idx === selectedIndex
                    ? "bg-[#E8593C]/10 text-[#E8593C] font-semibold"
                    : "text-[#241B14] dark:text-[#F4F4F5] hover:bg-[rgba(36,27,20,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#E8593C]/15 text-[#E8593C] flex items-center justify-center font-bold text-[11px]">
                    {item.trigger}
                  </span>
                  <span>{item.label}</span>
                </div>
                <span className="text-[11px] opacity-50 font-mono">{item.display}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Command Bar Box */}
      <form
        onSubmit={handleSubmit}
        className="w-full bg-white dark:bg-[#2A2A2A] border border-[rgba(36,27,20,0.14)] dark:border-[rgba(255,255,255,0.14)] rounded-full shadow-[0_6px_28px_rgba(0,0,0,0.09)] dark:shadow-[0_6px_28px_rgba(0,0,0,0.4)] px-4.5 py-3 sm:px-5 sm:py-3 flex items-center justify-between gap-3.5"
      >
        {/* Left Animated Color Orb */}
        <div className="shrink-0 flex items-center justify-center pl-0.5">
          <button
            type="button"
            onClick={() => {
              const openEvent = new CustomEvent("open-ai-chat");
              document.dispatchEvent(openEvent);
            }}
            className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer overflow-hidden shrink-0"
            title="Ask Auren AI"
          >
            <ColorOrb
              dimension="28px"
              spinDuration={12}
              tones={{
                base: "oklch(22.64% 0 0)",
                accent1: "oklch(60% 0.15 30)",
                accent2: "oklch(50% 0.15 40)",
                accent3: "oklch(70% 0.15 20)",
              }}
            />
          </button>
        </div>

        {/* Center Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a command, or @mention someone."
          disabled={isAgentLoading}
          className="flex-1 bg-transparent border-none outline-none text-[15px] sm:text-[15.5px] text-[#241B14] dark:text-[#F4F4F5] placeholder:text-[rgba(36,27,20,0.38)] dark:placeholder:text-[rgba(255,255,255,0.38)] font-sans px-1"
        />

        {/* Right Orange/Coral Action Button */}
        <button
          type="submit"
          disabled={isAgentLoading || !inputVal.trim()}
          className="shrink-0 w-8 h-8 rounded-full bg-[#E8593C] hover:bg-[#D4472B] active:scale-95 text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm cursor-pointer"
          title="Send command"
        >
          {isAgentLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            <ArrowUp size={15} className="text-white stroke-[2.5]" />
          )}
        </button>
      </form>
    </div>
  );
}
