"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, RefreshCw, ArrowRight, TerminalSquare } from "lucide-react";
import { getContacts } from "@/app/actions/get-contacts";
import { ShiningText } from "@/components/ui/shining-text";

interface TerminalDrawerProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onExecute: (command: string) => void;
  isAgentLoading: boolean;
}

export function TerminalDrawer({ isOpen, setIsOpen, onExecute, isAgentLoading }: TerminalDrawerProps) {
  const [command, setCommand] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isTypingLog, setIsTypingLog] = useState(false);
  
  // Contacts and Autocomplete States
  const [contacts, setContacts] = useState<{ name: string; email: string }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // 1. Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
      setLogs([]);
      setCommand("");
    }
  }, [isOpen]);

  // 2. Load Contacts when Console opens
  useEffect(() => {
    async function loadContacts() {
      const res = await getContacts();
      if (res.success && res.data) {
        setContacts(res.data);
      }
    }
    if (isOpen) {
      loadContacts();
    }
  }, [isOpen]);

  // 3. Web Speech API Integration
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.lang = "en-US";
        rec.interimResults = false;

        rec.onstart = () => {
          setIsListening(true);
          setCommand("Listening...");
        };

        rec.onresult = (event: any) => {
          const resultText = event.results[0][0].transcript;
          setCommand(resultText);
        };

        rec.onerror = () => {
          setIsListening(false);
          setCommand("Speech recognition error. Please type.");
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else if (recognitionRef.current) {
      recognitionRef.current.start();
    } else {
      setIsListening(true);
      setCommand("Listening (Simulated)...");
      setTimeout(() => {
        const text = "schedule a 30 minute sync with the product team tomorrow morning";
        typeSuggestion(text);
      }, 1000);
    }
  };

  const typeSuggestion = (text: string) => {
    if (isTypingLog || isAgentLoading) return;
    setCommand("");
    let index = 0;
    const interval = setInterval(() => {
      setCommand(text.slice(0, index + 1));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
        setIsListening(false);
      }
    }, 12);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || isListening) return;

    setIsTypingLog(true);
    setLogs([`> ${command}`]);

    // Simulate thinking state, then execute
    setTimeout(() => {
      setIsTypingLog(false);
      onExecute(command);
      setTimeout(() => {
        setIsOpen(false);
      }, 1000);
    }, 1500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCommand(value);

    const selectionStart = e.target.selectionStart || 0;
    const textBeforeCursor = value.slice(0, selectionStart);
    const lastAtIdx = textBeforeCursor.lastIndexOf("@");
    
    if (lastAtIdx !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIdx + 1);
      if (!textAfterAt.includes(" ")) {
        setShowDropdown(true);
        setSearchQuery(textAfterAt);
        setSelectedIndex(0);
        return;
      }
    }
    setShowDropdown(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showDropdown && filteredContacts.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredContacts.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredContacts.length) % filteredContacts.length);
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        selectContact(filteredContacts[selectedIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setShowDropdown(false);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const selectContact = (contact: { name: string; email: string }) => {
    if (!inputRef.current) return;
    
    const cursorPosition = inputRef.current.selectionStart || 0;
    const value = command;
    const textBeforeCursor = value.slice(0, cursorPosition);
    const lastAtIdx = textBeforeCursor.lastIndexOf("@");
    
    if (lastAtIdx !== -1) {
      const beforeAt = value.slice(0, lastAtIdx);
      const afterCursor = value.slice(cursorPosition);
      const replacement = `${contact.name} (${contact.email})`;
      const newValue = beforeAt + replacement + " " + afterCursor;
      
      setCommand(newValue);
      setShowDropdown(false);
      
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const newCursorPos = lastAtIdx + replacement.length + 1;
          inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 50);
    }
  };

  const filteredContacts = contacts.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          className="fixed bottom-0 left-0 w-full z-[60] bg-[#FDFBF9] border-t border-[rgba(36,27,20,0.12)] shadow-[0_-8px_32px_rgba(36,27,20,0.08)] flex flex-col overflow-visible"
        >
          {/* Header bar in warm sand */}
          <div className="h-[44px] bg-[#FAF6F0] border-b border-[rgba(36,27,20,0.06)] flex items-center justify-between px-6 shrink-0 select-none">
            <div className="flex items-center gap-2">
              <TerminalSquare size={16} className="text-[#E8593C]" />
              <span style={{ fontFamily: "var(--font-civane, Georgia, serif)" }} className="text-[16px] text-[#241B14] tracking-wide font-medium">
                Auren Console
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsOpen(false)}
                className="text-[rgba(36,27,20,0.4)] hover:text-[#E8593C] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="flex flex-col relative bg-white">
            {/* Tag autocomplete dropdown */}
            <AnimatePresence>
              {showDropdown && filteredContacts.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-6 mb-2 bg-white border border-[rgba(36,27,20,0.08)] shadow-[0_8px_32px_rgba(36,27,20,0.12)] rounded-xl w-[320px] max-h-[200px] overflow-y-auto scrollbar-hide flex flex-col p-1.5 z-50"
                >
                  <div className="text-[9px] font-sans font-bold uppercase tracking-wider text-[rgba(36,27,20,0.35)] px-2.5 py-1.5 border-b border-[rgba(36,27,20,0.04)] mb-1">
                    Contacts Autocomplete
                  </div>
                  {filteredContacts.map((contact, idx) => (
                    <div
                      key={contact.email}
                      onClick={() => selectContact(contact)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${
                        idx === selectedIndex 
                          ? "bg-[rgba(232,89,60,0.08)] text-[#E8593C]" 
                          : "hover:bg-[rgba(36,27,20,0.02)] text-[#241B14]"
                      }`}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-sans font-semibold text-[11.5px] truncate">
                          {contact.name}
                        </span>
                        <span className="font-mono text-[9px] text-[rgba(36,27,20,0.4)] truncate">
                          {contact.email}
                        </span>
                      </div>
                      {idx === selectedIndex && (
                        <span className="text-[9px] font-mono opacity-50 bg-[#E8593C]/10 px-1 rounded">
                          Enter
                        </span>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Logs Area / Thinking State */}
            <AnimatePresence>
              {(logs.length > 0 || isTypingLog || isAgentLoading) && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 py-5 border-b border-[rgba(36,27,20,0.06)] bg-[#FAF8F5]/80 flex flex-col gap-3 overflow-hidden"
                >
                  {/* User Command Echo */}
                  {logs.map((log, idx) => {
                    if (!log) return null;
                    return (
                      <div key={idx} className="flex gap-3 text-[#241B14] font-mono text-[13px]">
                        <span className="text-[#E8593C] font-bold">❯</span>
                        <span className="font-sans font-medium text-[rgba(36,27,20,0.8)]">{log.replace(">", "").trim()}</span>
                      </div>
                    );
                  })}

                  {/* Shining Thinking Text */}
                  {(isAgentLoading || isTypingLog) && (
                    <div className="flex items-center gap-3 pt-1">
                      <ShiningText text="Auren is thinking..." />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Bar */}
            <form
              onSubmit={handleSubmit}
              className="h-[64px] bg-[#FDFBF9] border-t border-[rgba(36,27,20,0.08)] px-6 flex items-center gap-3 shrink-0"
            >
              <span 
                className="text-[#E8593C] text-[14px] font-bold select-none whitespace-nowrap"
                style={{ fontFamily: "var(--font-mono), monospace" }}
              >
                auren &gt;
              </span>
              
              <input
                ref={inputRef}
                type="text"
                onKeyDown={handleInputKeyDown}
                className="flex-1 bg-transparent border-none outline-none text-[14px] text-[#241B14] placeholder:text-[rgba(36,27,20,0.25)] font-mono"
                style={{ fontFamily: "var(--font-mono), monospace" }}
                placeholder="type a command... (press Esc to close)"
                value={command}
                onChange={handleInputChange}
                disabled={isAgentLoading || isTypingLog}
                autoComplete="off"
                spellCheck={false}
              />

              <div className="flex items-center gap-2 shrink-0">
                {/* Voice Activation button */}
                <button
                  type="button"
                  onClick={handleMicClick}
                  disabled={isAgentLoading || isTypingLog}
                  className={`p-2.5 rounded-lg transition-all duration-200 flex items-center justify-center ${
                    isListening
                      ? "bg-[#E8593C]/10 text-[#E8593C] animate-pulse"
                      : "text-[rgba(36,27,20,0.4)] hover:text-[#241B14] hover:bg-[rgba(36,27,20,0.04)]"
                  }`}
                  title="Voice Input (Speech-to-Text)"
                >
                  <Mic size={15} />
                </button>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isAgentLoading || isListening || isTypingLog || !command.trim()}
                  className="w-9 h-9 rounded-lg bg-[#E8593C] text-white hover:bg-[#d44a2d] transition-all flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_2px_8px_rgba(232,89,60,0.15)]"
                >
                  {isAgentLoading || isTypingLog ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <ArrowRight size={14} strokeWidth={2.5} />
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
