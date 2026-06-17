"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = {
  "Navigation": [
    { keys: ["⌘", "K"], label: "Open command palette" },
    { keys: ["G", "I"], label: "Go to inbox" },
    { keys: ["G", "C"], label: "Go to calendar" },
    { keys: ["G", "H"], label: "Go to history" },
    { keys: ["/"], label: "Focus search" },
    { keys: ["?"], label: "Show shortcuts" },
  ],
  "Email": [
    { keys: ["J"], label: "Next email" },
    { keys: ["K"], label: "Previous email" },
    { keys: ["R"], label: "Reply" },
    { keys: ["E"], label: "Archive" },
    { keys: ["C"], label: "Compose new email" },
    { keys: ["Esc"], label: "Close / dismiss" },
  ],
  "Agent": [
    { keys: ["Enter"], label: "Execute command" },
    { keys: ["↑"], label: "Previous command" },
    { keys: ["↓"], label: "Next command" },
  ],
};

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
          style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(4px)" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="bg-white dark:bg-[#2C2C2C] rounded-[20px] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-2xl w-full max-w-[560px] mx-4 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(36,27,20,0.06)] dark:border-[rgba(255,255,255,0.06)]">
              <h2 className="font-sans font-semibold text-[15px] text-[#241B14] dark:text-[#F4F4F5]">Keyboard shortcuts</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] hover:bg-[rgba(36,27,20,0.05)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 grid grid-cols-2 gap-6">
              {Object.entries(SHORTCUTS).map(([section, shortcuts]) => (
                <div key={section}>
                  <p className="font-sans font-semibold text-[11px] uppercase tracking-widest text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] mb-3">{section}</p>
                  <div className="flex flex-col gap-2">
                    {shortcuts.map(({ keys, label }) => (
                      <div key={label} className="flex items-center justify-between gap-4">
                        <span className="font-sans text-[13px] text-[rgba(36,27,20,0.7)] dark:text-[rgba(255,255,255,0.7)]">{label}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {keys.map((key) => (
                            <kbd
                              key={key}
                              className="px-2 py-0.5 rounded-[6px] bg-[#FAF8F5] dark:bg-[#383838] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] font-mono text-[11px] text-[#241B14] dark:text-[#F4F4F5] shadow-sm"
                            >
                              {key}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-3 border-t border-[rgba(36,27,20,0.06)] dark:border-[rgba(255,255,255,0.06)]">
              <p className="font-sans text-[11px] text-[rgba(36,27,20,0.35)] dark:text-[rgba(255,255,255,0.35)] text-center">Press <kbd className="px-1.5 py-0.5 rounded bg-[#FAF8F5] dark:bg-[#383838] border border-[rgba(36,27,20,0.08)] font-mono text-[10px]">?</kbd> anytime to show this</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
