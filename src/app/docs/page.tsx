"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Calendar, GitBranch } from "lucide-react";
import { Topbar } from "@/components/auren/topbar";
import { Footer } from "@/components/auren/footer";
import { WatchDemoModal } from "@/components/auren/watch-demo-modal";

const FONT_BODY = "var(--font-sans), sans-serif";
const FONT_MONO = "var(--font-mono), 'JetBrains Mono', monospace";
const FONT_DISPLAY = "var(--font-display), sans-serif";
const FONT_CIVANE = "var(--font-civane), serif";

const NAV_SECTIONS = [
  { label: "Getting started", href: "#getting-started" },
  { label: "Commands", href: "#commands" },
  { label: "Integrations", href: "#integrations" },
  { label: "Search", href: "#search" },
  { label: "Keyboard shortcuts", href: "#shortcuts" },
];

const COMMANDS = [
  { cmd: "reply to X confirming Y", desc: "Drafts and sends a Gmail reply to the specified person at the specified time." },
  { cmd: "schedule a call with X at Y", desc: "Creates a Google Calendar event and sends an invite to the attendee." },
  { cmd: "create an issue for X", desc: "Opens a GitHub issue in the connected repository with the given title." },
  { cmd: "summarize my unread emails", desc: "Returns a digest of your unread inbox, grouped by priority." },
];

const SHORTCUTS = [
  { keys: "⌘K", action: "Focus command bar / search" },
  { keys: "R", action: "Reply to selected email" },
  { keys: "E", action: "Archive selected email" },
  { keys: "J / K", action: "Navigate emails down / up" },
  { keys: "G then I", action: "Go to inbox" },
  { keys: "G then S", action: "Go to search" },
];

export default function DocsPage() {
  const [activeId, setActiveId] = useState("");
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    const sections = document.querySelectorAll("section[id]");
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ background: "#FBF3EC", color: "#241B14", fontFamily: FONT_BODY, minHeight: "100vh" }}>

      {/* ── NAV ── */}
      <Topbar />

      {/* ── BODY: sidebar + content ── */}
      <div style={{ display: "flex", maxWidth: "1200px", margin: "0 auto" }}>

        {/* SIDEBAR */}
        <aside style={{
          width: "240px", flexShrink: 0,
          position: "sticky", top: "72px", alignSelf: "flex-start",
          height: "calc(100vh - 72px)", overflowY: "auto",
          borderRight: "1px solid rgba(36,27,20,0.08)",
          padding: "40px 24px",
        }}>
          <p style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: "11px", color: "rgba(36,27,20,0.4)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "16px", margin: "0 0 16px 0" }}>
            Documentation
          </p>
          <nav style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {NAV_SECTIONS.map((s) => {
              const isActive = activeId === s.href.replace("#", "");
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  className="nav-sidebar-link"
                  style={{
                    fontFamily: FONT_BODY,
                    fontWeight: 500,
                    fontSize: "14px",
                    textDecoration: "none",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    display: "block",
                    background: isActive ? "#FBF3EC" : "transparent",
                    color: isActive ? "#241B14" : "rgba(36,27,20,0.6)",
                  }}
                >
                  {s.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* CONTENT */}
        <main style={{ flex: 1, minWidth: 0, maxWidth: "720px", padding: "48px 64px", display: "flex", flexDirection: "column", gap: "72px" }}>

          {/* ─── GETTING STARTED ─── */}
          <motion.section id="getting-started" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h1 style={{ fontFamily: FONT_CIVANE, fontWeight: 400, fontSize: "32px", color: "#241B14", margin: "0 0 16px 0", letterSpacing: "-0.01em" }}>
              Getting started
            </h1>
            <button
              onClick={() => setShowVideo(true)}
              className="flex items-center gap-2 text-[#E8593C] text-[13px] font-semibold mb-5 hover:opacity-80 transition-opacity cursor-pointer"
              style={{ fontFamily: FONT_BODY }}
            >
              <span style={{
                width: 24, height: 24, borderRadius: '50%',
                background: '#E8593C', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10
              }}>▶</span>
              Watch setup guide (60 sec)
            </button>
            <p style={{ fontFamily: FONT_BODY, fontWeight: 400, fontSize: "15px", lineHeight: 1.7, color: "rgba(36,27,20,0.7)", margin: "0 0 32px 0" }}>
              Auren reads your inbox, calendar, and GitHub activity, and executes multi-step actions from a single typed command.
            </p>

            <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: "16px", color: "#241B14", margin: "0 0 12px 0" }}>
              Your first command
            </h3>
            <div style={{
              background: "#241B14", borderRadius: "10px", padding: "20px 24px",
              fontFamily: FONT_MONO, fontSize: "13px", color: "#FBF3EC",
              lineHeight: 1.6, marginBottom: "20px",
              border: "1px solid rgba(255,255,255,0.06)"
            }}>
              <span style={{ color: "rgba(251,243,236,0.4)" }}>{"↳ "}</span>
              reply to [name] confirming [time] and send a calendar invite
            </div>
            <p style={{ fontFamily: FONT_BODY, fontWeight: 400, fontSize: "15px", lineHeight: 1.7, color: "rgba(36,27,20,0.7)", margin: 0 }}>
              Auren plans the steps, shows you what it will do, and executes everything after a single approval.
            </p>
          </motion.section>

          {/* ─── COMMANDS ─── */}
          <motion.section id="commands" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: "22px", color: "#241B14", margin: "0 0 8px 0" }}>Commands</h2>
            <p style={{ fontFamily: FONT_BODY, fontWeight: 400, fontSize: "15px", lineHeight: 1.7, color: "rgba(36,27,20,0.7)", margin: "0 0 28px 0" }}>
              Type any of the following into the agent bar (⌘K) to get started.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {COMMANDS.map((item) => (
                <div key={item.cmd} style={{
                  display: "flex", flexDirection: "column", gap: "6px",
                  background: "white", borderRadius: "12px",
                  padding: "18px 20px",
                  border: "1px solid rgba(36,27,20,0.07)",
                  boxShadow: "0 1px 6px rgba(36,27,20,0.03)"
                }}>
                  <span style={{
                    fontFamily: FONT_MONO, fontSize: "13px", color: "#241B14",
                    background: "rgba(36,27,20,0.05)", borderRadius: "4px",
                    padding: "3px 8px", display: "inline-block"
                  }}>
                    {item.cmd}
                  </span>
                  <span style={{ fontFamily: FONT_BODY, fontWeight: 400, fontSize: "14px", color: "rgba(36,27,20,0.6)" }}>
                    → {item.desc}
                  </span>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ─── INTEGRATIONS ─── */}
          <motion.section id="integrations" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: "22px", color: "#241B14", margin: "0 0 8px 0" }}>Integrations</h2>
            <p style={{ fontFamily: FONT_BODY, fontWeight: 400, fontSize: "15px", lineHeight: 1.7, color: "rgba(36,27,20,0.7)", margin: "0 0 28px 0" }}>
              Auren connects to your existing tools — no data migration required.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                {
                  icon: Mail, iconBg: "rgba(234,67,53,0.08)", iconColor: "#EA4335",
                  name: "Gmail",
                  body: "Auren listens to your inbox via webhook and classifies incoming email by priority. It can draft replies, send on your behalf, and archive threads. Every send requires your explicit approval before execution.",
                  note: "Connected via Corsair MCP",
                },
                {
                  icon: Calendar, iconBg: "rgba(66,133,244,0.08)", iconColor: "#4285F4",
                  name: "Google Calendar",
                  body: "Auren creates events, reschedules conflicts, and sends invites directly to attendees. The calendar panel shows your upcoming schedule so you can act on meetings and emails from a single interface.",
                  note: "Connected via Corsair MCP",
                },
                {
                  icon: GitBranch, iconBg: "rgba(36,27,20,0.06)", iconColor: "#241B14",
                  name: "GitHub",
                  body: "Auren can open issues, post comments, and link pull requests to email threads — all from a single typed command. Authentication is handled via managed OAuth, so there is nothing to configure beyond connecting once.",
                  note: "Connected via Corsair MCP",
                },
              ].map((integration) => (
                <div key={integration.name} style={{
                  background: "white", borderRadius: "16px", padding: "24px",
                  border: "1px solid rgba(36,27,20,0.07)",
                  boxShadow: "0 2px 12px rgba(36,27,20,0.03)",
                  display: "flex", gap: "18px", alignItems: "flex-start"
                }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: integration.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <integration.icon style={{ width: "20px", height: "20px", color: integration.iconColor }} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: "16px", color: "#241B14", margin: "0 0 6px 0" }}>{integration.name}</h3>
                    <p style={{ fontFamily: FONT_BODY, fontWeight: 400, fontSize: "14px", lineHeight: 1.7, color: "rgba(36,27,20,0.65)", margin: "0 0 10px 0" }}>{integration.body}</p>
                    <span style={{ fontFamily: FONT_MONO, fontSize: "12px", color: "#0F6E56", background: "rgba(15,110,86,0.08)", borderRadius: "4px", padding: "2px 8px" }}>
                      {integration.note}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ─── SEARCH ─── */}
          <motion.section id="search" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: "22px", color: "#241B14", margin: "0 0 8px 0" }}>Search</h2>
            <p style={{ fontFamily: FONT_BODY, fontWeight: 400, fontSize: "15px", lineHeight: 1.7, color: "rgba(36,27,20,0.7)", margin: "0 0 24px 0" }}>
              Auren embeds your inbox so you can search by meaning, not just keywords. Instead of matching exact words, the search understands the intent behind your query.
            </p>
            <div style={{ background: "white", borderRadius: "12px", padding: "20px 24px", border: "1px solid rgba(36,27,20,0.07)", marginBottom: "20px" }}>
              <p style={{ fontFamily: FONT_BODY, fontWeight: 500, fontSize: "12px", color: "rgba(36,27,20,0.4)", margin: "0 0 10px 0", letterSpacing: "0.04em", textTransform: "uppercase" }}>Example</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: "13px", color: "#E8593C" }}>
                  Query: <span style={{ color: "#241B14" }}>&ldquo;that email about the API being down&rdquo;</span>
                </div>
                <div style={{ fontFamily: FONT_BODY, fontSize: "14px", color: "rgba(36,27,20,0.6)" }}>
                  → Returns the most semantically relevant threads, ranked by similarity score.
                </div>
              </div>
            </div>
            <p style={{ fontFamily: FONT_BODY, fontWeight: 400, fontSize: "15px", lineHeight: 1.7, color: "rgba(36,27,20,0.7)", margin: 0 }}>
              Search results show the sender, subject, snippet, and a relevance percentage. Press <span style={{ fontFamily: FONT_MONO, fontSize: "13px", background: "rgba(36,27,20,0.06)", padding: "1px 6px", borderRadius: "4px" }}>G then S</span> to open search from anywhere in the app.
            </p>
          </motion.section>

          {/* ─── KEYBOARD SHORTCUTS ─── */}
          <motion.section id="shortcuts" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: "22px", color: "#241B14", margin: "0 0 8px 0" }}>Keyboard shortcuts</h2>
            <p style={{ fontFamily: FONT_BODY, fontWeight: 400, fontSize: "15px", lineHeight: 1.7, color: "rgba(36,27,20,0.7)", margin: "0 0 24px 0" }}>
              Auren is built for keyboard-first workflows. Every core action has a shortcut.
            </p>
            <div style={{ background: "white", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(36,27,20,0.07)" }}>
              {SHORTCUTS.map((row, i) => (
                <div
                  key={row.keys}
                  style={{
                    display: "flex", alignItems: "center", gap: "24px",
                    padding: "14px 20px",
                    borderBottom: i < SHORTCUTS.length - 1 ? "1px solid rgba(36,27,20,0.06)" : "none",
                  }}
                >
                  <span style={{
                    fontFamily: FONT_MONO, fontSize: "13px", color: "#241B14",
                    background: "rgba(36,27,20,0.05)", borderRadius: "5px",
                    padding: "4px 10px", minWidth: "100px", textAlign: "center",
                    border: "1px solid rgba(36,27,20,0.1)"
                  }}>
                    {row.keys}
                  </span>
                  <span style={{ fontFamily: FONT_BODY, fontWeight: 400, fontSize: "14px", color: "rgba(36,27,20,0.7)" }}>
                    {row.action}
                  </span>
                </div>
              ))}
            </div>
          </motion.section>

        </main>
      </div>

      <Footer />
      <WatchDemoModal isOpen={showVideo} onClose={() => setShowVideo(false)} />
    </div>
  );
}
