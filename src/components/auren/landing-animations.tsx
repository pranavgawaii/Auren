"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Calendar, GitBranch, Terminal, CheckCircle2, Lock, Code, Send, RefreshCw, ArrowRight } from "lucide-react";
import { WaitlistForm } from "./waitlist-form";

// Custom GithubIcon component using local topbar SVG path
const GithubIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

const FONT_BODY = "var(--font-sans)";
const FONT_SUBHEAD = "var(--font-sans)";
const FONT_CIVANE = "var(--font-civane, Georgia, serif)";

// Task 7 — Hero Parallax (Removed)
export function HeroIllustration() {
  return (
    <motion.div 
      style={{
        position: "absolute", right: "-50px", bottom: "40px",
        width: "400px", height: "400px",
        pointerEvents: "none", zIndex: 20
      }} 
      className="hidden lg:block"
    >
      <Image
        src="/auren_hero.webp" alt="Auren character"
        width={1024} height={1024} 
        style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "bottom right" }}
        priority
      />
    </motion.div>
  );
}

// Task 3 — Integrations strip
export function IntegrationsStrip() {
  const tools = [
    { name: "Gmail", icon: Mail },
    { name: "Google Calendar", icon: Calendar },
    { name: "GitHub", icon: GitBranch },
    { name: "via Corsair MCP", icon: Terminal, highlight: true },
  ];

  return (
    <motion.section 
      id="integrations"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      style={{ 
        padding: "64px 0", 
        textAlign: "center",
        borderTop: "1px solid rgba(36,27,20,0.08)",
        borderBottom: "1px solid rgba(36,27,20,0.08)",
        background: "rgba(255,255,255,0.3)",
        overflow: "hidden",
      }}
    >
      <motion.h3 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{ fontFamily: "var(--font-civane, Georgia, serif)", fontWeight: 300, fontSize: "24px", color: "#241B14", marginBottom: "48px" }}
      >
        Connects to the tools you already use
      </motion.h3>
      
      {/* Infinite scrolling marquee */}
      <div style={{ display: "flex", overflow: "hidden", whiteSpace: "nowrap" }}>
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 40, repeat: Infinity }}
          style={{ 
            display: "flex", 
            gap: "48px", 
            paddingRight: "48px", 
            minWidth: "max-content",
            willChange: "transform"
          }}
        >
          {/* We duplicate the 4 items 8 times so the marquee is always wide enough for large screens before repeating */}
          {[...tools, ...tools, ...tools, ...tools, ...tools, ...tools, ...tools, ...tools].map((tool, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.08, color: "#E8593C" }}
              transition={{ type: "spring", stiffness: 400, damping: 12 }}
              style={{ 
                display: "flex", alignItems: "center", gap: "12px", 
                fontFamily: FONT_BODY, fontWeight: 500, fontSize: "16px",
                color: tool.highlight ? "#E8593C" : "rgba(36,27,20,0.6)",
                cursor: "pointer",
              }}
            >
              <tool.icon style={{ width: "24px", height: "24px" }} />
              {tool.name}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

// Task 4 — The Gap
export function TheGapSection() {
  return (
    <section style={{ borderBottom: "1px solid rgba(36,27,20,0.08)" }}>
      <div className="py-16 md:py-24 px-6 md:px-12 max-w-[1440px] mx-auto text-center flex flex-col items-center">
      {/* Visual (Responsive flex wrap & gap adjustments) */}
      <div className="flex flex-wrap justify-center items-center gap-3 md:gap-6 mb-10 max-w-full">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.5 }} viewport={{ once: true }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(234,67,53,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Mail style={{ width: "24px", height: "24px", color: "#EA4335" }} />
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.15, duration: 0.5 }} viewport={{ once: true }} style={{ color: "rgba(36,27,20,0.3)", fontSize: "20px" }}>✕</motion.div>

        <motion.div initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.5 }} viewport={{ once: true }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(66,133,244,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Calendar style={{ width: "24px", height: "24px", color: "#4285F4" }} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.5 }} viewport={{ once: true }} style={{ color: "rgba(36,27,20,0.3)", fontSize: "20px" }}>✕</motion.div>

        <motion.div initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.5 }} viewport={{ once: true }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(36,27,20,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GitBranch style={{ width: "24px", height: "24px", color: "#241B14" }} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.35, duration: 0.5 }} viewport={{ once: true }} style={{ color: "rgba(36,27,20,0.3)", fontSize: "20px" }}>→</motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.5, type: "spring" }} viewport={{ once: true }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "14px", overflow: "hidden", position: "relative" }}>
            <Image src="/auren_logo.webp" alt="Auren" fill style={{ objectFit: "cover" }} />
          </div>
        </motion.div>
      </div>

      <motion.span 
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.9 }} viewport={{ once: true }}
        style={{ 
          fontFamily: FONT_BODY, fontWeight: 500, fontSize: "13px", 
          color: "rgba(36,27,20,0.4)", letterSpacing: "0.03em", marginBottom: "24px" 
        }}
      >
        THE PROBLEM
      </motion.span>
      <motion.h2 
        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }} viewport={{ once: true }}
        style={{ 
          fontFamily: FONT_CIVANE, fontWeight: 300, fontSize: "36px", 
          color: "#241B14", maxWidth: "720px", lineHeight: 1.4, margin: 0 
        }}
      >
        Switching between inbox, calendar, and GitHub breaks focus. Auren collapses every action into <span style={{ color: "#E8593C" }}>one typed command</span>.
      </motion.h2>
      </div>
    </section>
  );
}

// Helper components for the redesigned premium HowItWorks section

const CodeLine = ({ text, type, isNew, delay }: { text: string; type: 'normal' | 'removed' | 'added'; isNew?: boolean; delay?: number }) => {
  let bgColor = "transparent";
  let textColor = "rgba(36, 27, 20, 0.85)";
  let prefix = " ";

  if (type === 'removed') {
    bgColor = "rgba(239, 68, 68, 0.08)";
    textColor = "#B91C1C";
    prefix = "-";
  } else if (type === 'added') {
    bgColor = "rgba(34, 197, 94, 0.08)";
    textColor = "#15803D";
    prefix = "+";
  }

  const highlightTokens = (str: string) => {
    const keywords = /\b(const|let|var|await|import|from|export|default|async|function|if|return|auth)\b/g;
    const strings = /('[^']*'|"[^"]*")/g;
    const parts = str.split(/(\b(?:const|let|var|await|import|from|export|default|async|function|if|return|auth)\b|'[^']*'|"[^"]*")/g);
    
    return parts.map((part, idx) => {
      if (part.match(keywords)) {
        return <span key={idx} style={{ color: "#E8593C" }}>{part}</span>;
      }
      if (part.match(strings)) {
        return <span key={idx} style={{ color: "#0F766E" }}>{part}</span>;
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <motion.div
      initial={isNew ? { opacity: 0, height: 0 } : { opacity: 1, height: "auto" }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.2, delay }}
      style={{
        display: "flex",
        background: bgColor,
        color: textColor,
        padding: "3px 12px",
        fontFamily: "var(--font-mono), monospace",
        fontSize: "12px",
        lineHeight: "1.5",
        borderRadius: "3px",
      }}
    >
      <span className="w-5 text-[rgba(36,27,20,0.35)] select-none text-[10px] text-right pr-2">{prefix}</span>
      <span className="whitespace-pre">{highlightTokens(text)}</span>
    </motion.div>
  );
};

function LiveCodeDiff({ diffState }: { diffState: number }) {
  const codeLines = [
    { text: "import { auth } from '@clerk/nextjs';", type: "normal" as const },
    { text: "export default async function middleware(req) {", type: "normal" as const },
    
    // Removed block
    { text: "  const session = await auth();", type: "removed" as const, key: "r1" },
    { text: "  if (!session.userId) {", type: "removed" as const, key: "r2" },
    { text: "    return Response.redirect('/login');", type: "removed" as const, key: "r3" },
    { text: "  }", type: "removed" as const, key: "r4" },

    // Added block
    { text: "  const { userId, protect } = await auth();", type: "added" as const, key: "a1" },
    { text: "  if (!userId) {", type: "added" as const, key: "a2" },
    { text: "    return protect({ redirectUrl: '/sign-in' });", type: "added" as const, key: "a3" },
    { text: "  }", type: "added" as const, key: "a4" },

    { text: "  return NextResponse.next();", type: "normal" as const },
    { text: "}", type: "normal" as const },
  ];

  return (
    <div className="font-mono text-xs text-[#241B14] bg-white p-4 rounded-xl border border-[rgba(36,27,20,0.08)] flex flex-col justify-between h-full min-h-[300px]">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-[rgba(36,27,20,0.06)] mb-3">
          <div className="flex items-center gap-2">
            <Code size={13} className="text-[#E8593C]" />
            <span className="text-[10px] text-[rgba(36,27,20,0.4)] tracking-wider">SRC/MIDDLEWARE.TS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[9px] text-emerald-600 font-semibold tracking-wider">LIVE DIFF</span>
          </div>
        </div>

        <div className="space-y-0.5 overflow-hidden">
          {codeLines.map((line, idx) => {
            if (line.type === "removed") {
              if (diffState === 3) return null;
              return (
                <CodeLine
                  key={line.key}
                  text={line.text}
                  type={diffState >= 2 ? "removed" : "normal"}
                  delay={idx * 0.05}
                />
              );
            }
            if (line.type === "added") {
              if (diffState < 3) return null;
              return (
                <CodeLine
                  key={line.key}
                  text={line.text}
                  type="added"
                  isNew
                  delay={(idx - 6) * 0.1}
                />
              );
            }
            return (
              <CodeLine
                key={idx}
                text={line.text}
                type="normal"
              />
            );
          })}
        </div>
      </div>

      <div className="pt-2.5 border-t border-[rgba(36,27,20,0.06)] mt-3 flex justify-between items-center text-[10px] text-[rgba(36,27,20,0.4)]">
        <div>Lines: 9 | Diff: {diffState >= 2 ? (diffState === 3 ? "-4, +4" : "-4, +0") : "0"}</div>
        <span>Auren Agent compiler active</span>
      </div>
    </div>
  );
}

function WorkspaceSyncDiff({ syncState }: { syncState: number }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 h-full min-h-[300px]">
      {/* Gmail Pane */}
      <div className="flex-1 bg-white border border-[rgba(36,27,20,0.08)] rounded-xl p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 pb-2 border-b border-[rgba(36,27,20,0.06)] mb-3 justify-between">
            <div className="flex items-center gap-1.5">
              <Mail size={12} className="text-[#EA4335]" />
              <span className="text-[10px] text-[rgba(36,27,20,0.4)] tracking-wider font-semibold">WORKSPACE/GMAIL</span>
            </div>
            <span className="text-[9px] text-[rgba(36,27,20,0.35)] font-mono">THREAD_391</span>
          </div>

          <div className="bg-[#FAF8F5] p-2.5 rounded-lg border border-[rgba(36,27,20,0.05)] mb-2.5">
            <div className="flex justify-between items-center text-[10px] mb-1">
              <span className="font-semibold text-[#241B14]">Rahul</span>
              <span className="text-[rgba(36,27,20,0.4)] text-[8px]">4:12 PM</span>
            </div>
            <p className="text-[10px] text-[rgba(36,27,20,0.65)] leading-relaxed font-sans">
              Hey! Can we sync on Thursday at 3 PM to align on the new waitlist design?
            </p>
          </div>

          <AnimatePresence>
            {syncState >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#F0FDF8] border border-[#A7C4BB] p-2.5 rounded-lg"
              >
                <div className="flex justify-between items-center text-[9px] mb-1 border-b border-emerald-500/10 pb-1">
                  <span className="font-semibold text-[#0F6E56] flex items-center gap-1">
                    <Send size={9} /> Proposed Reply Draft
                  </span>
                  <span className="text-[#0F6E56]/60 text-[8px]">AUTO-RESOLVED</span>
                </div>
                <p className="text-[10px] text-[#0F6E56] leading-relaxed font-sans italic">
                  &ldquo;Confirming Thursday 3 PM works. Event booked.&rdquo;
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-[9px] text-[rgba(36,27,20,0.45)] flex justify-between items-center pt-2 border-t border-[rgba(36,27,20,0.06)] mt-4">
          <span>Mail API connected</span>
          {syncState >= 2 && <span className="text-[#0F6E56] font-semibold">Active Draft</span>}
        </div>
      </div>

      {/* Calendar Pane */}
      <div className="flex-1 bg-white border border-[rgba(36,27,20,0.08)] rounded-xl p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 pb-2 border-b border-[rgba(36,27,20,0.06)] mb-3 justify-between">
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-[#4285F4]" />
              <span className="text-[10px] text-[rgba(36,27,20,0.4)] tracking-wider font-semibold">WORKSPACE/CALENDAR</span>
            </div>
            <span className="text-[9px] text-[rgba(36,27,20,0.35)] font-mono">THU, JUN 18</span>
          </div>

          <div className="space-y-1.5">
            {[
              { time: "1:00 PM", title: "Lunch meeting", busy: true },
              { time: "2:00 PM", title: "Available", busy: false },
              { time: "3:00 PM", title: "Auren Sync with Rahul", booking: true },
            ].map((slot) => {
              if (slot.booking) {
                return (
                  <div key={slot.time} className="flex items-center gap-2 text-[10px]">
                    <span className="w-12 text-[rgba(36,27,20,0.4)] text-right font-mono">{slot.time}</span>
                    <div className="flex-1 h-7 rounded-lg relative flex items-center px-2">
                      {syncState >= 3 ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute inset-0 bg-[#E8593C]/10 border border-[#E8593C]/30 rounded-lg flex items-center px-2 justify-between"
                        >
                          <span className="font-semibold text-[#E8593C] text-[9px] truncate">
                            {slot.title}
                          </span>
                          <CheckCircle2 size={10} className="text-[#E8593C] flex-shrink-0" />
                        </motion.div>
                      ) : (
                        <div className="w-full h-full border border-dashed border-[rgba(36,27,20,0.12)] rounded-lg flex items-center px-2 text-[rgba(36,27,20,0.3)] italic text-[9px]">
                          Available
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div key={slot.time} className="flex items-center gap-2 text-[10px]">
                  <span className="w-12 text-[rgba(36,27,20,0.4)] text-right font-mono">{slot.time}</span>
                  <div className={`flex-1 h-7 rounded-lg flex items-center px-2 border ${
                    slot.busy 
                      ? "bg-[rgba(36,27,20,0.02)] border-[rgba(36,27,20,0.06)] text-[rgba(36,27,20,0.5)]" 
                      : "border-dashed border-[rgba(36,27,20,0.12)] text-[rgba(36,27,20,0.3)] italic"
                  }`}>
                    <span className="text-[9px] truncate">{slot.busy ? slot.title : "Available"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-[9px] text-[rgba(36,27,20,0.45)] flex justify-between items-center pt-2 border-t border-[rgba(36,27,20,0.06)] mt-4">
          <span>Calendar Sync OK</span>
          {syncState >= 3 && <span className="text-[#E8593C] font-semibold">Event Reserved</span>}
        </div>
      </div>
    </div>
  );
}

function PRTerminalExecution({ execState }: { execState: number }) {
  const consoleLines = [
    { text: "$ auren verify-build && git push origin main", show: true },
    { text: "✔ Running compiler 'tsc --noEmit'... (0 errors)", show: execState >= 2 },
    { text: "✔ Bundling server assets... Success.", show: execState >= 2 },
    { text: "✔ Pushed commit 'feat: auth-middleware' to remote.", show: execState >= 2 },
    { text: "✔ PR #14 opened successfully.", show: execState >= 2 }
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 h-full min-h-[300px]">
      {/* Shell Pane */}
      <div className="flex-1 bg-white border border-[rgba(36,27,20,0.08)] rounded-xl p-4 flex flex-col justify-between font-mono text-[10px] text-[#241B14]">
        <div>
          <div className="flex items-center gap-2 pb-2 border-b border-[rgba(36,27,20,0.06)] mb-3">
            <Terminal size={12} className="text-[#E8593C]" />
            <span className="text-[rgba(36,27,20,0.4)] tracking-wider font-semibold">AUREN EXECUTION SHELL</span>
          </div>

          <div className="space-y-1 text-[rgba(36,27,20,0.8)]">
            {consoleLines.map((line, idx) => {
              if (!line.show) return null;
              const isPrompt = idx === 0;
              return (
                <div key={idx} className={line.text.startsWith("✔") ? "text-[#0F6E56] font-semibold" : "text-[rgba(36,27,20,0.75)]"}>
                  {isPrompt && <span className="text-[#E8593C] mr-1.5 font-bold">auren &gt;</span>}
                  <span>{line.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-[9px] text-[rgba(36,27,20,0.45)] flex justify-between items-center pt-2 border-t border-[rgba(36,27,20,0.06)] mt-4">
          <span>Terminal ID: #820</span>
          {execState >= 2 && <span className="text-[#0F6E56] font-semibold">Success</span>}
        </div>
      </div>

      {/* GitHub PR Monitor */}
      <div className="flex-1 bg-white border border-[rgba(36,27,20,0.08)] rounded-xl p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 pb-2 border-b border-[rgba(36,27,20,0.06)] mb-3 justify-between">
            <div className="flex items-center gap-1.5">
              <GithubIcon size={12} className="text-[#241B14]" />
              <span className="text-[10px] text-[rgba(36,27,20,0.4)] tracking-wider font-semibold">GITHUB PR</span>
            </div>
            <span className="text-[9px] text-[rgba(36,27,20,0.35)] font-mono">tryauren/Auren</span>
          </div>

          <AnimatePresence>
            {execState >= 3 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-2.5"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#0F6E56] bg-[#F0FDF8] border border-[#A7C4BB] px-2 py-0.5 rounded text-[8px] font-bold font-mono">
                      OPEN
                    </span>
                    <span className="text-[9px] text-[rgba(36,27,20,0.4)] font-mono">PR #14</span>
                  </div>
                  <h4 className="text-[11px] font-semibold text-[#241B14] mt-1 leading-snug">
                    feat: Clerk auth middleware migration
                  </h4>
                </div>

                <div className="bg-[#FAF8F5] border border-[rgba(36,27,20,0.05)] p-2 rounded-lg space-y-1">
                  <div className="flex items-center gap-1.5 text-[8px] text-[#0F6E56] font-mono font-medium">
                    <CheckCircle2 size={10} />
                    <span>Typescript compilation passed</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[8px] text-[#0F6E56] font-mono font-medium">
                    <CheckCircle2 size={10} />
                    <span>Next.js production build succeeded</span>
                  </div>
                </div>

                <button
                  className="w-full py-1.5 bg-[#E8593C] text-white rounded-md text-[9px] font-semibold hover:bg-[#d44a2d] transition-all duration-200 shadow-sm"
                >
                  Merge Pull Request
                </button>
              </motion.div>
            ) : (
              <div className="h-24 flex flex-col items-center justify-center border border-dashed border-[rgba(36,27,20,0.12)] rounded-lg text-[rgba(36,27,20,0.35)] italic text-[9px] gap-2">
                <RefreshCw className="animate-spin text-[rgba(36,27,20,0.3)]" size={14} />
                <span>Waiting for build checks...</span>
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-[9px] text-[rgba(36,27,20,0.45)] flex justify-between items-center pt-2 border-t border-[rgba(36,27,20,0.06)] mt-4">
          <span>PR Webhook Connected</span>
          {execState >= 3 && <span className="text-[#0F6E56] font-semibold">Active</span>}
        </div>
      </div>
    </div>
  );
}

// Task 5 — How it works (Redesigned Interactive Component)
export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const autoPlayRef = useRef(true);

  // Timers inside tabs
  const [diffState, setDiffState] = useState(0);
  const [syncState, setSyncState] = useState(0);
  const [execState, setExecState] = useState(0);

  const steps = [
    {
      num: "01",
      title: "Write intent, get a plan",
      desc: "Type commands in plain text. Auren parses your workspace context (mail threads, PR branches, calendar slots) and drafts a detailed execution plan before any action is taken.",
      command: "auren > refactor auth middleware and update layout styling",
      fileTab: "src/middleware.ts",
    },
    {
      num: "02",
      title: "Inspect changes in real-time",
      desc: "Review what changes before you execute. Standard git-style diffs for code updates, inline drafts for emails, and visual blocks for calendar events show you exactly what will happen.",
      command: "auren > reply to Rahul confirming sync on Thursday 3 PM and block slot",
      fileTab: "workspace/gmail-and-calendar",
    },
    {
      num: "03",
      title: "Approve & deploy concurrently",
      desc: "Click approve to execute. Auren runs compilation checks, replies to threads, books calendar events, and opens pull requests simultaneously, reporting progress in a real-time console.",
      command: "auren > verify build, run lint checks, and open PR to main",
      fileTab: "github/pull_request.diff",
    }
  ];

  // 1. Auto-play steps & progress counter
  useEffect(() => {
    if (!autoPlayRef.current) {
      setProgress(100);
      return;
    }

    setProgress(0);
    const startTime = Date.now();
    const duration = 6000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const nextProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(nextProgress);

      if (elapsed >= duration) {
        setActiveStep((prev) => (prev + 1) % steps.length);
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [activeStep, steps.length]);

  // 2. Step 1 (Code Diff) Timeline Animation
  useEffect(() => {
    if (activeStep !== 0) {
      setDiffState(0);
      return;
    }
    setDiffState(0);
    const t1 = setTimeout(() => setDiffState(1), 500);
    const t2 = setTimeout(() => setDiffState(2), 2000);
    const t3 = setTimeout(() => setDiffState(3), 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [activeStep]);

  // 3. Step 2 (Context Sync) Timeline Animation
  useEffect(() => {
    if (activeStep !== 1) {
      setSyncState(0);
      return;
    }
    setSyncState(0);
    const t1 = setTimeout(() => setSyncState(1), 500);
    const t2 = setTimeout(() => setSyncState(2), 1800);
    const t3 = setTimeout(() => setSyncState(3), 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [activeStep]);

  // 4. Step 3 (Terminal PR) Timeline Animation
  useEffect(() => {
    if (activeStep !== 2) {
      setExecState(0);
      return;
    }
    setExecState(0);
    const t1 = setTimeout(() => setExecState(1), 500);
    const t2 = setTimeout(() => setExecState(2), 1800);
    const t3 = setTimeout(() => setExecState(3), 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [activeStep]);

  const selectStep = (idx: number) => {
    setActiveStep(idx);
    autoPlayRef.current = false; // Disable autoplay when clicked
  };

  const handleNextExecute = () => {
    autoPlayRef.current = false;
    setActiveStep((prev) => (prev + 1) % steps.length);
  };

  return (
    <section id="how-it-works" style={{ background: "rgba(255,255,255,0.3)", borderBottom: "1px solid rgba(36,27,20,0.08)" }}>
      <div className="py-20 md:py-28 px-6 md:px-12 max-w-[1440px] mx-auto">
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <span style={{ fontFamily: FONT_BODY, fontWeight: 500, fontSize: "13px", color: "rgba(36,27,20,0.4)", letterSpacing: "0.03em" }}>HOW IT WORKS</span>
          <h2 style={{ fontFamily: FONT_CIVANE, fontWeight: 300, fontSize: "36px", color: "#241B14", margin: "16px 0 0 0", letterSpacing: "-0.01em" }}>
            One command. Everything done.
          </h2>
        </div>

        {/* 2-Column interactive grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Left Column: Premium vertical progress tabs */}
          <div className="lg:col-span-5 flex flex-col gap-4 justify-center">
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <div
                  key={step.num}
                  onClick={() => selectStep(idx)}
                  className={`group cursor-pointer p-6 rounded-2xl transition-all duration-300 flex gap-5 items-start ${
                    isActive 
                      ? "bg-white shadow-[0_12px_36px_rgba(36,27,20,0.05)] border border-[rgba(232,89,60,0.12)]" 
                      : "bg-transparent border border-transparent hover:bg-white/40"
                  }`}
                >
                  {/* Vertical Progress Rail */}
                  <div className="relative self-stretch flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-semibold transition-all duration-300 ${
                      isActive 
                        ? "bg-[#E8593C] text-white shadow-[0_4px_10px_rgba(232,89,60,0.2)]" 
                        : "bg-neutral-100 text-[rgba(36,27,20,0.4)] group-hover:text-[rgba(36,27,20,0.6)]"
                    }`}>
                      {step.num}
                    </div>
                    
                    <div className="flex-1 w-[2px] bg-[rgba(36,27,20,0.05)] mt-3 rounded-full overflow-hidden relative min-h-[50px]">
                      {isActive && (
                        <motion.div 
                          initial={{ height: "0%" }}
                          animate={{ height: `${progress}%` }}
                          transition={{ ease: "linear", duration: 0.05 }}
                          className="absolute top-0 left-0 w-full bg-[#E8593C] rounded-full"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 pt-0.5">
                    <h3 
                      className={`font-sans font-semibold text-lg mb-2 transition-colors duration-300 ${
                        isActive ? "text-[#241B14]" : "text-[rgba(36,27,20,0.7)] group-hover:text-[#241B14]"
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p className="font-sans text-[14px] leading-relaxed text-[rgba(36,27,20,0.55)]">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Sleek interactive IDE window */}
          <div className="lg:col-span-7 w-full bg-[#FDFBF9] rounded-3xl border border-[rgba(36,27,20,0.08)] shadow-[0_24px_60px_rgba(36,27,20,0.06),0_4px_16px_rgba(36,27,20,0.02)] overflow-hidden flex flex-col justify-between relative min-h-[460px]">
            
            {/* Topbar Chrome */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(36,27,20,0.06)] bg-[#FAF8F5]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
              </div>
              
              <span className="text-[12px] font-medium text-[rgba(36,27,20,0.58)] select-none" style={{ fontFamily: FONT_CIVANE }}>
                {steps[activeStep].fileTab}
              </span>
              
              <div className="flex items-center gap-1 text-[10px] font-sans font-medium text-[rgba(36,27,20,0.6)] bg-white px-2 py-0.5 rounded border border-[rgba(36,27,20,0.08)]">
                <Lock size={10} className="text-[#0F6E56]" />
                <span>SANDBOXED</span>
              </div>
            </div>

            {/* Input Prompt Section */}
            <div className="px-6 py-3 border-b border-[rgba(36,27,20,0.04)] bg-[#FDFBF9] flex items-center gap-3">
              <span className="text-[#E8593C] font-mono text-xs font-bold select-none">auren &gt;</span>
              <div className="text-[12px] font-mono text-[#241B14] truncate flex-1">
                {steps[activeStep].command}
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="inline-block w-1.5 h-3.5 bg-[#E8593C] ml-1 align-middle"
                />
              </div>
            </div>

            {/* Dynamic Content Pane with Fade Transitions */}
            <div className="flex-1 p-6 relative flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {activeStep === 0 && (
                  <motion.div
                    key="step-0"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full"
                  >
                    <LiveCodeDiff diffState={diffState} />
                  </motion.div>
                )}

                {activeStep === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full"
                  >
                    <WorkspaceSyncDiff syncState={syncState} />
                  </motion.div>
                )}

                {activeStep === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full"
                  >
                    <PRTerminalExecution execState={execState} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Interactive Control Footer */}
            <div className="px-6 py-3 border-t border-[rgba(36,27,20,0.06)] bg-[#FAF8F5] flex items-center justify-between">
              <span className="text-[10px] font-sans text-[rgba(36,27,20,0.4)]">Press [Approve] to confirm changes</span>
              
              <button
                onClick={handleNextExecute}
                className="group flex items-center gap-1.5 px-4.5 py-1.5 bg-[#E8593C] text-white rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 hover:bg-[#d44a2d] hover:shadow-[0_0_12px_rgba(232,89,60,0.35)] active:scale-[0.97]"
                style={{ padding: "8px 16px" }}
              >
                <span>Approve & Execute</span>
                <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

// Task 3.5 — Built for builders
export function BuiltForBuildersSection() {
  const cards = [
    {
      title: "No dashboards to check",
      desc: "Auren surfaces what matters and acts on it - you don't have to go looking."
    },
    {
      title: "No context switching",
      desc: "Reply to email, schedule the call, file the issue - from one input."
    },
    {
      title: "Approve once, not three times",
      desc: "Review the full plan before anything runs. One click executes everything."
    }
  ];

  return (
    <section style={{ borderBottom: "1px solid rgba(36,27,20,0.08)" }}>
      <div style={{ padding: "100px 48px", maxWidth: "1440px", margin: "0 auto" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: "center", marginBottom: "64px" }}
      >
        <span style={{ 
          fontFamily: FONT_BODY, fontWeight: 500, fontSize: "13px", 
          color: "rgba(36,27,20,0.4)", letterSpacing: "0.03em", display: "block", marginBottom: "24px" 
        }}>WHY AUREN</span>
        <h2 style={{ 
          fontFamily: FONT_CIVANE, fontWeight: 400, fontSize: "32px", 
          color: "#241B14", margin: 0 
        }}>
          Built for people who&apos;d rather build than manage.
        </h2>
      </motion.div>

      <div style={{ 
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
        gap: "16px", maxWidth: "920px", margin: "0 auto" 
      }}>
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(232,89,60,0.1)", borderColor: "rgba(232,89,60,0.2)" }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.2 }}
            style={{ 
              background: "#FFFFFF", 
              border: "1px solid rgba(36,27,20,0.08)", 
              borderRadius: "18px", 
              padding: "24px" 
            }}
          >
            <h3 style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: "16px", color: "#241B14", marginBottom: "12px" }}>
              {card.title}
            </h3>
            <p style={{ fontFamily: FONT_SUBHEAD, fontWeight: 400, fontSize: "15px", lineHeight: 1.6, color: "rgba(36,27,20,0.6)", margin: 0 }}>
              {card.desc}
            </p>
          </motion.div>
        ))}
      </div>
      </div>
    </section>
  );
}

// Task 6 — Big CTA + waitlist
export function WaitlistCTASection({ count }: { count: number }) {
  return (
    <motion.section 
      id="waitlist"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="px-6 md:px-12 pb-16 md:pb-24 max-w-[1440px] mx-auto"
    >
      <div 
        className="py-12 md:py-20 px-6 md:px-16 text-center relative overflow-hidden rounded-[24px]"
        style={{
          background: "#241B14",
          position: "relative",
        }}
      >
        {/* Decorative background flare */}
        <div style={{
          position: "absolute", top: "-50%", left: "50%", transform: "translateX(-50%) translateZ(0)",
          width: "600px", height: "400px", background: "radial-gradient(circle, rgba(232,89,60,0.15) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 0,
          willChange: "transform"
        }} />

        {/* Dot grid pattern (subtle texture) */}
        <svg aria-hidden="true" style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          pointerEvents: "none", zIndex: 0,
          opacity: 0.5
        }}>
          <defs>
            <pattern id="pg-cta" x="0" y="0" width="26" height="26" patternUnits="userSpaceOnUse">
              <line x1="13" y1="7" x2="13" y2="19" stroke="rgba(255,255,255,0.06)" strokeWidth="1.4" strokeLinecap="round"/>
              <line x1="7" y1="13" x2="19" y2="13" stroke="rgba(255,255,255,0.06)" strokeWidth="1.4" strokeLinecap="round"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pg-cta)" />
        </svg>
        
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h2 
            className="text-[28px] sm:text-[36px] leading-[1.3] text-white mb-10 max-w-[600px]"
            style={{ fontFamily: FONT_CIVANE, fontWeight: 300 }}
          >
            {"The execution layer between thinking and doing.".split(" ").map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                style={{ display: "inline-block", marginRight: "8px" }}
              >
                {word}
              </motion.span>
            ))}
          </h2>
          
          <WaitlistForm />

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            style={{ marginTop: "24px", fontFamily: FONT_BODY, fontSize: "14px", color: "rgba(255,255,255,0.4)" }}
          >
            {count > 0 ? (
              <>Join <span style={{ color: "rgba(255,255,255,0.8)" }}>{count.toLocaleString()}</span> others on the waitlist.</>
            ) : (
              <>Be the first to join the waitlist.</>
            )}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
