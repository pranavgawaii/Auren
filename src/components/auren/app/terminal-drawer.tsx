"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, Lock, RefreshCw, ArrowRight, Calendar, Mail, GitBranch, TerminalSquare } from "lucide-react";
import Image from "next/image";
import { getContacts } from "@/app/actions/get-contacts";

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
  
  // Terminal Height Resizing
  const [consoleHeight, setConsoleHeight] = useState(320);

  const startConsoleResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = consoleHeight;

    const doResize = (moveEvent: MouseEvent) => {
      const newHeight = Math.max(200, Math.min(650, startHeight - (moveEvent.clientY - startY)));
      setConsoleHeight(newHeight);
    };

    const stopResize = () => {
      document.removeEventListener("mousemove", doResize);
      document.removeEventListener("mouseup", stopResize);
    };

    document.addEventListener("mousemove", doResize);
    document.addEventListener("mouseup", stopResize);
  };
  
  // Contacts and Autocomplete States
  const [contacts, setContacts] = useState<{ name: string; email: string }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Suggested Prompts list
  const suggestions = [
    {
      title: "Schedule Sync",
      desc: "reply to Rahul confirming sync on Thursday 3 PM, block slot, and add Meet link",
      icon: <Calendar size={13} className="text-[#4285F4]" />
    },
    {
      title: "Create Calendar Block",
      desc: "schedule a 30 minute sync with the product team tomorrow morning",
      icon: <Calendar size={13} className="text-[#E8593C]" />
    },
    {
      title: "Send Confirmation",
      desc: "send a message to Pranav saying I will be late by 15 minutes",
      icon: <Mail size={13} className="text-[#EA4335]" />
    },
    {
      title: "File GitHub Bug",
      desc: "create a GitHub issue for the sidebar navigation layout bug",
      icon: <GitBranch size={13} className="text-[#241B14]" />
    }
  ];

  // 1. Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
      setLogs([]);
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
      // Speech recognition fallback simulation
      setIsListening(true);
      setCommand("Listening (Simulated)...");
      
      setTimeout(() => {
        const phrases = [
          "reply to Rahul confirming sync on Thursday 3 PM, block slot, and add Meet link",
          "schedule a 30 minute sync with the product team tomorrow morning",
          "send a message to Pranav saying I will be late by 15 minutes"
        ];
        const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
        typeSuggestion(randomPhrase);
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
    setLogs(["[info] Parsing natural language intent..."]);

    const steps = [
      "[info] Intersecting active workspace context...",
      "[info] Fetching user calendar parameters...",
      "[info] Resolving target email threads...",
      "[success] Actions planned. Launching plan approval..."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setLogs((prev) => [...prev, steps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsTypingLog(false);
        // Execute command in main application
        onExecute(command);
        // Keep logs for review or close drawer
        setTimeout(() => {
          setIsOpen(false);
        }, 1500);
      }
    }, 400);
  };

  // Autocomplete change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCommand(value);

    const selectionStart = e.target.selectionStart || 0;
    const textBeforeCursor = value.slice(0, selectionStart);
    const lastAtIdx = textBeforeCursor.lastIndexOf("@");
    
    if (lastAtIdx !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIdx + 1);
      // Ensure no spaces between "@" and cursor (representing active tag typing)
      if (!textAfterAt.includes(" ")) {
        setShowDropdown(true);
        setSearchQuery(textAfterAt);
        setSelectedIndex(0);
        return;
      }
    }
    
    setShowDropdown(false);
  };

  // Keyboard navigation inside dropdown list
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
    }
  };

  // Select contact callback
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
    <>
      {/* Slide-Up Docked Console (Full-Width bottom drawer in Auren Light Theme) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            style={{ height: `${consoleHeight}px` }}
            className="fixed bottom-[30px] left-0 w-full z-50 bg-[#FDFBF9] border-t border-[rgba(36,27,20,0.12)] shadow-[0_-8px_32px_rgba(36,27,20,0.08)] flex flex-col justify-between overflow-hidden"
          >
            {/* Height resize handle */}
            <div 
              className="absolute top-0 left-0 right-0 h-[6px] hover:bg-[#E8593C]/30 cursor-row-resize z-50 group flex items-center justify-center select-none"
              onMouseDown={startConsoleResize}
            >
              <div className="flex items-center justify-center w-8 h-5 bg-white border border-[rgba(36,27,20,0.12)] rounded-full shadow-[0_2px_8px_rgba(36,27,20,0.1)] opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[rgba(36,27,20,0.5)]">
                  <path d="M9 8l3-3 3 3M9 16l3 3 3-3M5 12h14" />
                </svg>
              </div>
            </div>
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

            {/* Content Area with centered empty state */}
            <div className="flex-1 flex flex-col justify-between h-full relative overflow-hidden">
              
              {/* Console logs / Centered Welcome Panel */}
              <div 
                className={`flex-1 px-6 py-4 overflow-y-auto scrollbar-hide flex flex-col ${
                  logs.length === 0 ? "justify-center items-center" : "justify-start"
                }`}
              >
                {logs.length === 0 ? (
                  <div className="flex flex-col items-center text-center gap-3.5 w-full animate-in fade-in duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 relative shrink-0 flex items-center justify-center">
                        <Image src="/auren_logo.webp" alt="Auren" fill className="object-contain" />
                      </div>
                      <div className="space-y-1 text-left">
                        <h4 style={{ fontFamily: "var(--font-civane, Georgia, serif)" }} className="text-[17px] text-[#241B14] font-medium leading-none">
                          Auren Agent Terminal
                        </h4>
                        <p className="font-sans text-[11px] text-[rgba(36,27,20,0.5)] max-w-[540px] leading-relaxed">
                          Auren uses Gemini to translate natural language into structured actions. Select an email to run context-aware drafts, schedule calendar blocks, or file repository issues. Use <span className="font-mono bg-[rgba(36,27,20,0.05)] px-1 py-0.5 rounded text-[10px]">@</span> to tag contacts.
                        </p>
                      </div>
                    </div>

                    {/* Suggestions Grid */}
                    <div className="grid grid-cols-2 gap-3 max-w-[660px] w-full mt-4 mx-auto">
                      {suggestions.map((sug, idx) => (
                        <div
                          key={idx}
                          onClick={() => typeSuggestion(sug.desc)}
                          className="bg-white border border-[rgba(36,27,20,0.05)] rounded-[12px] p-2.5 text-left hover:border-[#E8593C] hover:shadow-[0_4px_16px_rgba(232,89,60,0.04)] hover:translate-y-[-1px] cursor-pointer transition-all duration-200 group flex items-center gap-3"
                        >
                          <div className="p-2 rounded-lg bg-[#FAF8F5] shrink-0 group-hover:bg-[#E8593C]/5 group-hover:text-[#E8593C] transition-colors flex items-center justify-center">
                            {sug.icon}
                          </div>
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <div className="text-[11px] font-sans font-bold text-[#241B14] group-hover:text-[#E8593C] transition-colors leading-none">
                              {sug.title}
                            </div>
                            <div className="text-[9.5px] font-sans text-[rgba(36,27,20,0.4)] truncate">
                              {sug.desc}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 font-mono text-[11px] max-w-[560px] mx-auto w-full pt-2">
                    {logs.map((log, idx) => (
                      <div 
                        key={idx} 
                        className={`px-3 py-1.5 rounded-lg flex items-center gap-2 border ${
                          log?.startsWith("[success]") 
                            ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-700 font-semibold" 
                            : log?.startsWith("[info]")
                            ? "bg-[rgba(36,27,20,0.02)] border-[rgba(36,27,20,0.04)] text-[rgba(36,27,20,0.6)]"
                            : "bg-red-500/5 border-red-500/10 text-red-700 font-semibold"
                        }`}
                      >
                        {log?.startsWith("[success]") ? (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-[rgba(36,27,20,0.3)]" />
                        )}
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tag autocomplete dropdown */}
              {showDropdown && filteredContacts.length > 0 && (
                <div className="absolute bottom-[60px] left-6 bg-white border border-[rgba(36,27,20,0.08)] shadow-[0_8px_32px_rgba(36,27,20,0.12)] rounded-xl w-[320px] max-h-[200px] overflow-y-auto z-50 p-1.5 flex flex-col gap-0.5 scrollbar-hide">
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
                </div>
              )}

              {/* Input Console Bar (Bordered Input box matching App inputs) */}
              <form
                onSubmit={handleSubmit}
                className="h-[56px] border-t border-[rgba(36,27,20,0.06)] bg-[#FAF6F0] px-6 flex items-center gap-3 shrink-0"
              >
                <span 
                  className="text-[#E8593C] text-[12px] font-bold select-none"
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  auren &gt;
                </span>
                
                <input
                  ref={inputRef}
                  type="text"
                  onKeyDown={handleInputKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-[12.5px] text-[#241B14] placeholder:text-[rgba(36,27,20,0.25)] font-mono transition-shadow duration-200"
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                  placeholder="reply to Rahul confirming sync on Thursday 3 PM, block slot, and add Meet link..."
                  value={command}
                  onChange={handleInputChange}
                  disabled={isAgentLoading || isTypingLog}
                />

                <div className="flex items-center gap-2">
                  {/* Voice Activation button */}
                  <button
                    type="button"
                    onClick={handleMicClick}
                    disabled={isAgentLoading || isTypingLog}
                    className={`p-2 rounded-lg border transition-all duration-200 flex items-center justify-center ${
                      isListening
                        ? "bg-[#E8593C]/10 border-[#E8593C]/30 text-[#E8593C] animate-pulse"
                        : "bg-white border-[rgba(36,27,20,0.08)] text-[rgba(36,27,20,0.4)] hover:text-[#241B14] hover:bg-[rgba(36,27,20,0.02)]"
                    }`}
                    title="Voice Input (Speech-to-Text)"
                  >
                    <Mic size={13} />
                  </button>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isAgentLoading || isListening || isTypingLog || !command.trim()}
                    className="p-2 rounded-lg bg-[#E8593C] text-white hover:bg-[#d44a2d] transition-all flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_2px_8px_rgba(232,89,60,0.15)]"
                  >
                    {isAgentLoading || isTypingLog ? (
                      <RefreshCw size={13} className="animate-spin" />
                    ) : (
                      <ArrowRight size={13} />
                    )}
                  </button>
                </div>
              </form>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
