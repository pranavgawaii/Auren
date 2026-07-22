"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TABS = ["Agent command", "Inbox", "Calendar", "Search"] as const;
type Tab = (typeof TABS)[number];

/* ── mock data ── */
const INBOX_EMAILS = [
  { id: "1", initials: "RS", name: "Rahul Sharma",  subject: "Thursday 3pm confirm?",        snippet: "Hey, just checking if you're still good for...", priority: "urgent", time: "9:41am", avatarBg: "#FEE2E2", avatarText: "#991B1B" },
  { id: "2", initials: "PV", name: "Priya Verma",   subject: "Hackathon submission",          snippet: "The deadline is tonight, I need your section...", priority: "urgent", time: "8:12am", avatarBg: "#FCE7F3", avatarText: "#9D174D" },
  { id: "3", initials: "DC", name: "Dev · Corsair", subject: "MCP plugin updated",            snippet: "Version 2.4.1 includes managed OAuth and...",   priority: "normal", time: "Jun 14", avatarBg: "#EDE9FE", avatarText: "#5B21B6" },
  { id: "4", initials: "GH", name: "GitHub",         subject: "PR review requested",           snippet: "pranavgawaii opened a pull request: feat/...",  priority: "fyi",    time: "Jun 13", avatarBg: "#F3F4F6", avatarText: "#374151" },
];

const DOT: Record<string, string> = {
  urgent: "#E8593C",
  normal: "#6366F1",
  fyi:    "transparent",
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CALENDAR_EVENTS: Record<string, Array<{ title: string; time: string; color?: string; bg?: string; border?: string }>> = {
  Mon: [
    { title: "Team Standup", time: "10:00am", color: "#085041", bg: "#E1F5EE", border: "#0F6E56" },
    { title: "Design Sync", time: "2:00pm", color: "#5B21B6", bg: "#EDE9FE", border: "#5B21B6" }
  ],
  Tue: [
    { title: "1:1 with Rahul", time: "11:30am", color: "#9D174D", bg: "#FCE7F3", border: "#BE185D" }
  ],
  Wed: [
    { title: "Corsair Hackathon sync", time: "10:00am", color: "#0F6E56", bg: "#F0FDF8", border: "#0F6E56" },
    { title: "All Hands", time: "4:00pm", color: "#085041", bg: "#E1F5EE", border: "#0F6E56" }
  ],
  Thu: [
    { title: "Code Review", time: "1:00pm", color: "#991B1B", bg: "#FEE2E2", border: "#DC2626" }
  ],
  Fri: [
    { title: "Demo day prep", time: "2:00pm", color: "#0F6E56", bg: "#F0FDF8", border: "#0F6E56" },
    { title: "Wrap up", time: "5:00pm", color: "#374151", bg: "#F3F4F6", border: "#6B7280" }
  ],
  Sat: [],
  Sun: [],
};

const SEARCH_RESULTS = [
  { id: "1", initials: "RS", name: "Rahul Sharma", subject: "Hackathon judges availability",    snippet: "Confirming all judges for Thursday demo at...",      match: 94, avatarBg: "#FEE2E2", avatarText: "#991B1B" },
  { id: "2", initials: "PV", name: "Priya Verma",  subject: "ChaiCode x Corsair judging panel", snippet: "The panel includes three senior engineers from...", match: 87, avatarBg: "#FCE7F3", avatarText: "#9D174D" },
];

const TAB_CONTENT_VARIANTS = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0  },
  exit:    { opacity: 0, y: -15 },
};

/* ── Icons ── */
function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CommandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 17l6-6-6-6M12 19h8"/>
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  );
}

/* ── sub-components ── */

function AgentCommandTab({ animState }: { animState: 0 | 1 | 2 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Premium Command box */}
      <div style={{
        background: "#FFFFFF",
        border: "1px solid rgba(232,89,60,0.2)",
        boxShadow: "0 4px 14px rgba(232,89,60,0.08)",
        borderRadius: "12px",
        padding: "16px 20px",
        display: "flex", alignItems: "center", gap: "12px",
        fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
        fontSize: "13px",
        color: "#241B14",
      }}>
        <div style={{ color: "#E8593C" }}><CommandIcon /></div>
        <span style={{ lineHeight: 1.5 }}>
          reply to rahul confirming thursday 3pm and send a calendar invite
        </span>
        {animState < 2 && (
          <motion.div 
            animate={{ opacity: [1, 0, 1] }} 
            transition={{ repeat: Infinity, duration: 1 }} 
            style={{ width: "6px", height: "14px", background: "#E8593C", borderRadius: "1px" }}
          />
        )}
      </div>

      {/* EXECUTING label */}
      <div style={{
        fontFamily: "var(--font-sans), sans-serif",
        fontWeight: 600, fontSize: "11px",
        color: "rgba(36,27,20,0.4)",
        letterSpacing: "0.08em",
        display: "flex", alignItems: "center", gap: "8px"
      }}>
        <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(36,27,20,0.08) 0%, transparent 100%)" }} />
        EXECUTING
        <div style={{ flex: 1, height: "1px", background: "linear-gradient(270deg, rgba(36,27,20,0.08) 0%, transparent 100%)" }} />
      </div>

      {/* Animated result rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Row 1 — Gmail */}
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: animState >= 1 ? 1 : 0, y: animState >= 1 ? 0 : 10, scale: animState >= 1 ? 1 : 0.98 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
          style={{
            background: "linear-gradient(90deg, #E1F5EE 0%, #F0FDF8 100%)",
            border: "1px solid rgba(15,110,86,0.15)",
            borderRadius: "12px",
            padding: "14px 18px",
            display: "flex", alignItems: "center", gap: "14px",
            boxShadow: "0 2px 8px rgba(15,110,86,0.05)"
          }}
        >
          <div style={{
            width: "24px", height: "24px", borderRadius: "50%",
            background: "#0F6E56",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 0 0 4px rgba(15,110,86,0.1)"
          }}>
            <CheckIcon />
          </div>
          <span style={{ fontFamily: "var(--font-sans), sans-serif", fontWeight: 600, fontSize: "13px", color: "#085041" }}>
            Gmail reply sent to Rahul
          </span>
        </motion.div>

        {/* Row 2 — Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: animState >= 2 ? 1 : 0, y: animState >= 2 ? 0 : 10, scale: animState >= 2 ? 1 : 0.98 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
          style={{
            background: "linear-gradient(90deg, #E1F5EE 0%, #F0FDF8 100%)",
            border: "1px solid rgba(15,110,86,0.15)",
            borderRadius: "12px",
            padding: "14px 18px",
            display: "flex", alignItems: "center", gap: "14px",
            boxShadow: "0 2px 8px rgba(15,110,86,0.05)"
          }}
        >
          <div style={{
            width: "24px", height: "24px", borderRadius: "50%",
            background: "#0F6E56",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 0 0 4px rgba(15,110,86,0.1)"
          }}>
            <CheckIcon />
          </div>
          <span style={{ fontFamily: "var(--font-sans), sans-serif", fontWeight: 600, fontSize: "13px", color: "#085041" }}>
            Calendar event created · Thu 3pm
          </span>
        </motion.div>
      </div>
    </div>
  );
}

function InboxTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {INBOX_EMAILS.map((email, i) => (
        <motion.div
          key={email.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.08 }}
          style={{
            display: "flex", alignItems: "center", gap: "14px",
            padding: "14px 16px",
            borderRadius: "12px",
            background: "white",
            border: "1px solid rgba(36,27,20,0.06)",
            boxShadow: "0 2px 6px rgba(36,27,20,0.02)",
            cursor: "default",
          }}
        >
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: email.avatarBg, color: email.avatarText, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "13px", flexShrink: 0 }}>
            {email.initials}
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
              <span style={{ fontWeight: 600, fontSize: "13px", color: "#241B14", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email.name}</span>
              <span style={{ fontSize: "11px", color: "rgba(36,27,20,0.4)", whiteSpace: "nowrap", flexShrink: 0, fontWeight: 500 }}>{email.time}</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "2px" }}>
              <span style={{ fontSize: "12px", fontWeight: 500, color: "#241B14", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "45%" }}>{email.subject}</span>
              <span style={{ fontSize: "12px", color: "rgba(36,27,20,0.25)" }}>·</span>
              <span style={{ fontSize: "12px", color: "rgba(36,27,20,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{email.snippet}</span>
            </div>
          </div>
          {email.priority !== "fyi" && (
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: DOT[email.priority], flexShrink: 0, boxShadow: `0 0 0 3px ${DOT[email.priority]}20` }} />
          )}
        </motion.div>
      ))}
    </div>
  );
}

function CalendarTab() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      style={{ border: "1px solid rgba(36,27,20,0.08)", borderRadius: "14px", overflowX: "auto", background: "#FAFAFA", boxShadow: "0 4px 12px rgba(36,27,20,0.03)" }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", minWidth: "560px", minHeight: "220px" }}>
        {DAYS.map((day, i) => {
          const isToday = day === "Thu";
          return (
            <div
              key={day}
              style={{
                padding: "10px 6px",
                borderRight: i < DAYS.length - 1 ? "1px solid rgba(36,27,20,0.04)" : "none",
                background: isToday ? "rgba(232,89,60,0.03)" : "white",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                position: "relative"
              }}
            >
              {isToday && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "#E8593C" }} />}
              <div style={{ textAlign: "center", fontSize: "10px", fontWeight: isToday ? 700 : 600, color: isToday ? "#E8593C" : "rgba(36,27,20,0.4)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>{day}</div>
              {CALENDAR_EVENTS[day]?.length > 0 ? (
                CALENDAR_EVENTS[day].map((event, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + (i * 0.05) }}
                    key={idx} style={{ background: event.bg || "#F0FDF8", borderLeft: `3px solid ${event.border || "#0F6E56"}`, borderRadius: "4px", padding: "6px 6px", textAlign: "left", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}
                  >
                    <div style={{ fontSize: "10px", fontWeight: 600, color: "#0D0F0C", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {event.title}
                    </div>
                    <div style={{ fontSize: "9px", fontWeight: 500, color: event.color || "#0F6E56", marginTop: "3px" }}>{event.time}</div>
                  </motion.div>
                ))
              ) : (
                <div style={{ textAlign: "center", fontSize: "11px", color: "rgba(36,27,20,0.15)", paddingTop: "8px" }}>—</div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function SearchTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <motion.div 
        initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", alignItems: "center", gap: "12px", background: "#FFFFFF", border: "1px solid rgba(36,27,20,0.15)", borderRadius: "12px", padding: "14px 18px", boxShadow: "0 4px 12px rgba(36,27,20,0.04)" }}
      >
        <div style={{ color: "rgba(36,27,20,0.4)" }}><SearchIcon /></div>
        <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "14px", color: "#241B14", fontWeight: 500 }}>hackathon judges</span>
        <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }} style={{ marginLeft: "auto", width: "2px", height: "16px", background: "#E8593C", borderRadius: "1px" }} />
      </motion.div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {SEARCH_RESULTS.map((result, i) => (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + (i * 0.1) }}
            style={{
              display: "flex", alignItems: "center", gap: "14px",
              padding: "14px 16px",
              borderRadius: "12px",
              background: "white",
              border: "1px solid rgba(36,27,20,0.06)",
              boxShadow: "0 2px 6px rgba(36,27,20,0.02)",
            }}
          >
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: result.avatarBg, color: result.avatarText, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "13px", flexShrink: 0 }}>
              {result.initials}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#241B14", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{result.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "2px" }}>
                <span style={{ fontSize: "12px", fontWeight: 500, color: "#241B14", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "50%" }}>{result.subject}</span>
                <span style={{ fontSize: "12px", color: "rgba(36,27,20,0.25)" }}>·</span>
                <span style={{ fontSize: "12px", color: "rgba(36,27,20,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{result.snippet}</span>
              </div>
            </div>
            <div style={{ background: "rgba(232,89,60,0.08)", color: "#E8593C", fontSize: "11px", fontWeight: 700, padding: "4px 8px", borderRadius: "6px", whiteSpace: "nowrap", flexShrink: 0 }}>
              {result.match}% match
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── main widget ── */
export function HeroWidget() {
  const [activeTab, setActiveTab] = useState<Tab>("Agent command");
  const [animState, setAnimState] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    let t1: NodeJS.Timeout;
    let t2: NodeJS.Timeout;

    // Reset animation state when tab changes
    setAnimState(0);

    if (activeTab === "Agent command") {
      t1 = setTimeout(() => setAnimState(1), 600);
      t2 = setTimeout(() => setAnimState(2), 1200);
    }

    // Auto-advance tabs
    const interval = setInterval(() => {
      setActiveTab(prev => {
        const idx = TABS.indexOf(prev);
        return TABS[(idx + 1) % TABS.length];
      });
    }, 4500);

    return () => { clearInterval(interval); clearTimeout(t1); clearTimeout(t2); };
  }, [activeTab]);

  return (
    <div 
      className="w-full lg:max-w-[85%] mx-auto lg:mx-0 p-6 md:p-7"
      style={{
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 12px 48px rgba(36,27,20,0.08), 0 2px 6px rgba(36,27,20,0.04)",
        border: "1px solid rgba(36,27,20,0.08)",
        position: "relative", zIndex: 10,
        transform: "translateZ(0)",
        willChange: "transform"
      }}
    >

      {/* Tabs row */}
      <div className="flex justify-center w-full">
        <div 
          className="inline-flex max-w-full overflow-x-auto scrollbar-none"
          style={{ 
            background: "#FBF3EC", 
            borderRadius: "8px", 
            padding: "4px", 
            marginBottom: "0",
            scrollbarWidth: "none",
            width: "fit-content",
          }}
        >
          {TABS.map(tab => (
            <button
              key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              fontFamily: "var(--font-sans), sans-serif",
              fontWeight: 600, fontSize: "13px",
              padding: "7px 16px", borderRadius: "7px",
              border: "none", cursor: "pointer",
              transition: "all 0.2s ease",
              background: activeTab === tab ? "#fff" : "transparent",
              color: activeTab === tab ? "#241B14" : "rgba(36,27,20,0.4)",
              boxShadow: activeTab === tab ? "0 1px 3px rgba(36,27,20,0.06)" : "none",
              whiteSpace: "nowrap",
            }}
          >
            {tab}
          </button>
        ))}
        </div>
      </div>

      {/* Tab content — padded area below tabs */}
      <div style={{ paddingTop: "28px", height: "300px" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={TAB_CONTENT_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {activeTab === "Agent command" && <AgentCommandTab animState={animState} />}
            {activeTab === "Inbox"         && <InboxTab />}
            {activeTab === "Calendar"      && <CalendarTab />}
            {activeTab === "Search"        && <SearchTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
