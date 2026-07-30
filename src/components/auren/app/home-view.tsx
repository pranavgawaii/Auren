"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mail, Calendar, Video, GitBranch, CheckCircle2,
  ArrowUpRight, Clock, Terminal, Inbox, CalendarPlus, CircleDot, PenLine, Sun,
} from "lucide-react";
import { AurenMascotBadge } from "@/components/ui/auren-mascot";
import { useUser } from "@clerk/nextjs";
import { getCalendarEvents } from "@/app/actions/get-events";
import { getInboxEmails } from "@/app/actions/inbox";
import { getAgentHistory } from "@/app/actions/history";
import { checkConnectionStatus } from "@/app/actions/connect";
import { processCommand } from "@/app/actions/agent";
import { AurenLoading } from "@/components/ui/auren-loading";
import { BriefingCard } from "@/components/ui/briefing-card";
import { motion, AnimatePresence } from "framer-motion";
import type { CalendarEventResult, GmailMessage, AgentAction, DailyBriefingData } from "@/types";

/* Shared with History / Team / Settings so every page reads as one product. */
const SERIF = { fontFamily: "var(--font-civane, Georgia, serif)" };
const CARD =
  "bg-white dark:bg-[#383838] rounded-[16px] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-sm";
const DIVIDE = "divide-[rgba(36,27,20,0.06)] dark:divide-[rgba(255,255,255,0.06)]";
const RULE = "border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)]";
const MUTED = "text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]";
const FAINT = "text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]";

interface HomeViewProps {
  onNavigate: (view: "inbox" | "calendar" | "github" | "settings" | "history" | "team" | "search") => void;
  onAction: (command: string) => void;
  isAgentLoading?: boolean;
}

const hhmm = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function greeting() {
  const h = new Date().getHours();
  if (h < 4 || h >= 22) return "Working late";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/* ── One stat tile ───────────────────────────────────────────────────────── */
function Stat({
  label, icon, color, value, caption, onClick,
}: {
  label: string;
  icon: React.ReactNode;
  color: string;
  value: string | number;
  caption: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`${CARD} p-5 text-left hover:border-[#E8593C]/40 transition-colors group`}
    >
      <span className="flex items-center justify-between gap-2">
        <span
          className="inline-flex items-center gap-1.5 font-sans text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
          style={{ background: `${color}15`, color }}
        >
          {icon}
          {label}
        </span>
        <ArrowUpRight
          size={14}
          className={`${FAINT} group-hover:text-[#E8593C] transition-colors shrink-0`}
        />
      </span>

      <span className="block text-[28px] leading-none tabular-nums text-[#241B14] dark:text-[#F4F4F5] mt-4" style={SERIF}>
        {value}
      </span>
      <span className={`block font-sans text-[12px] ${MUTED} mt-1.5 truncate`}>{caption}</span>
    </button>
  );
}

/* ── Section shell ───────────────────────────────────────────────────────── */
function Section({
  title, action, onAction, children,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={`${CARD} overflow-hidden flex flex-col`}>
      <div className={`flex items-center justify-between gap-3 px-5 py-3.5 border-b ${RULE}`}>
        <h2 className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#241B14] dark:text-[#F4F4F5]">
          {title}
        </h2>
        {action && (
          <button
            onClick={onAction}
            className={`font-sans text-[11.5px] font-semibold ${MUTED} hover:text-[#E8593C] transition-colors shrink-0`}
          >
            {action}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function Empty({ icon, title, hint }: { icon: React.ReactNode; title: string; hint: string }) {
  return (
    <div className="p-10 flex flex-col items-center text-center gap-2">
      <div className="w-12 h-12 rounded-[14px] bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.06)] flex items-center justify-center mb-1">
        {icon}
      </div>
      <p className="text-[17px] text-[#241B14] dark:text-[#F4F4F5]" style={SERIF}>
        {title}
      </p>
      <p className={`font-sans text-[13px] ${MUTED}`}>{hint}</p>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export function HomeView({ onNavigate, onAction, isAgentLoading }: HomeViewProps) {
  const { user } = useUser();
  const firstName = user?.firstName || "there";

  const [emails, setEmails] = useState<GmailMessage[]>([]);
  const [events, setEvents] = useState<CalendarEventResult[]>([]);
  const [history, setHistory] = useState<AgentAction[]>([]);
  const [isGithubConnected, setIsGithubConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // null while the summary prose is still being generated.
  const [summary, setSummary] = useState<DailyBriefingData | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    (async () => {
      setIsLoading(true);
      try {
        const [emailRes, eventRes, historyRes, conn] = await Promise.all([
          getInboxEmails(false, 20, "INBOX"),
          getCalendarEvents(false),
          getAgentHistory(10),
          checkConnectionStatus(),
        ]);
        if (emailRes.success && emailRes.data) setEmails(emailRes.data);
        if (eventRes.success && eventRes.data) setEvents(eventRes.data);
        if (historyRes.success && historyRes.data) setHistory(historyRes.data);
        if (conn) setIsGithubConnected(conn.github);
      } catch (e) {
        console.error("[HomeView]", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const now = new Date();
  const isToday = (d: Date) =>
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const urgent = emails.filter((e) => (e.priority === "urg" || e.priority === "urgent") && !e.isRead);
  const unread = emails.filter((e) => !e.isRead);
  const todayEvents = events
    .filter((e) => isToday(new Date(e.startAt)))
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  const upcomingEvents = todayEvents.filter((e) => new Date(e.startAt) > now);
  const nextEvent =
    upcomingEvents[0] ||
    events.filter((e) => new Date(e.startAt) > now).sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())[0];

  const nextLink = nextEvent ? (nextEvent as any).meetLink || nextEvent.htmlLink : null;
  const recent = history.filter((h) => h.status === "completed" && h.command).slice(0, 6);
  const completed = history.filter((h) => h.status === "completed").length;

  /* Run a command in the chat panel — the only surface that renders a reply. */
  /* `label` is shown in the thread in place of `command` — used when the command
     carries a data payload that would be unreadable as a chat bubble. */
  const ask = (command: string, label?: string) => {
    document.dispatchEvent(
      new CustomEvent("open-ai-chat", { detail: { text: command, autoSubmit: true, label } })
    );
  };

  /* Open the chat with the command pre-typed so the user can finish the details
     (who, when) before running it. */
  const compose = (draft: string) => {
    document.dispatchEvent(new CustomEvent("open-ai-chat", { detail: { text: draft } }));
  };

  /* The agent refuses to write summaries because it has no live data of its own — so
     for a day summary we hand it today's real schedule and inbox in the command and
     tell it to use only that. Nothing is invented.
     The card's rows come straight from Gmail/Calendar; only the prose is the model's. */
  const runDaySummary = async () => {
    setIsSummaryOpen(true);
    setSummary(null);

    const schedule = todayEvents.length
      ? todayEvents.map((e) => `- ${hhmm(new Date(e.startAt))} — ${e.title}`).join("\n")
      : "- (nothing scheduled)";
    const inbox = unread.length
      ? unread.slice(0, 8).map((e) => `- ${e.fromName || e.from}: ${e.subject}`).join("\n")
      : "- (inbox clear)";

    const res = await processCommand(
      `Summarise my day using ONLY the live data below — do not invent or assume anything ` +
        `beyond it. Two or three sentences, plain prose, no lists.\n\n` +
        `TODAY'S SCHEDULE (${todayEvents.length}):\n${schedule}\n\n` +
        `UNREAD EMAIL (${unread.length}${urgent.length ? `, ${urgent.length} urgent` : ""}):\n${inbox}`,
      null
    );

    setSummary({
      summaryText: res.success && res.data?.explanation
        ? res.data.explanation
        : `${todayEvents.length} event${todayEvents.length === 1 ? "" : "s"} today and ${unread.length} unread message${unread.length === 1 ? "" : "s"}.`,
      schedule: todayEvents.map((e) => ({
        time: e.startAt as unknown as string,
        title: e.title,
        type: "meeting" as const,
      })),
      emails: (urgent.length ? urgent : unread).slice(0, 6).map((e) => ({
        sender: e.fromName || e.from,
        subject: e.subject,
        isUrgent: urgent.some((u) => u.id === e.id),
      })),
      github: [],
    });
  };

  /* Everything here maps to something Auren can actually do. */
  const quickActions = [
    { label: "Day summary", icon: <Sun size={12} />, run: runDaySummary },
    { label: "Open inbox", icon: <Inbox size={12} />, run: () => onNavigate("inbox") },
    {
      label: "Schedule meeting",
      icon: <CalendarPlus size={12} />,
      run: () => compose("Schedule a 30 minute Google Meet with "),
    },
    {
      label: "Draft email",
      icon: <PenLine size={12} />,
      run: () => compose("Send an email to "),
    },
    {
      label: "GitHub issues",
      icon: <CircleDot size={12} />,
      run: () => ask("List the open issues in github/Auren"),
    },
  ];

  if (isLoading) {
    /* Skeleton mirrors the real layout row-for-row. The boot overlay used to cover
       this, but the connection check is optimistic now (dashboard-client caches the
       Google grant), so on a warm reload this IS what the user looks at — bare
       rectangles read as a broken page, structured placeholders read as loading. */
    const bar = "bg-[rgba(36,27,20,0.07)] dark:bg-[rgba(255,255,255,0.07)] rounded-[6px]";
    const dim = "bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.04)] rounded-[6px]";

    /* One card's worth of header + rows, matching <Section> + its row rhythm. */
    const SectionSkeleton = ({ rows, className = "" }: { rows: number; className?: string }) => (
      <div className={`${CARD} overflow-hidden ${className}`}>
        <div className={`flex items-center justify-between px-5 py-3.5 border-b ${RULE}`}>
          <div className={`h-[13px] w-[90px] ${bar}`} />
          <div className={`h-[11px] w-[64px] ${dim}`} />
        </div>
        <div className={`divide-y ${DIVIDE}`}>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-3.5 px-5 py-4">
              <div className={`w-1 self-stretch min-h-[34px] ${dim} rounded-full shrink-0`} />
              <div className="flex flex-col gap-2 min-w-0 flex-1">
                <div className={`h-[13px] ${bar}`} style={{ width: `${68 - i * 9}%` }} />
                <div className={`h-[11px] ${dim}`} style={{ width: `${44 - i * 6}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    return (
      <div className="flex-1 flex flex-col bg-[#FAF8F5] dark:bg-[#2C2C2C] overflow-hidden min-w-0 animate-pulse">
        {/* Header bar */}
        <div className={`min-h-[80px] bg-white dark:bg-[#383838] border-b ${RULE} flex items-center justify-between gap-6 px-8 py-4 shrink-0`}>
          <div className="flex flex-col gap-2">
            <div className={`h-[22px] w-[220px] ${bar}`} />
            <div className={`h-[12px] w-[280px] ${dim}`} />
          </div>
          <div className={`h-9 w-[170px] rounded-[10px] border ${RULE} hidden sm:block`} />
        </div>

        <div className="flex-1 p-8 flex flex-col gap-6">
          {/* Quick-actions segmented control */}
          <div className="flex justify-center">
            <div className="flex items-center gap-1 bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.06)] p-1 rounded-[10px]">
              {[92, 78, 86, 80].map((w, i) => (
                <div key={i} className={`h-7 rounded-[8px] bg-white/70 dark:bg-[#383838]/70`} style={{ width: w }} />
              ))}
            </div>
          </div>

          {/* Four stat tiles — label, big number, caption */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`${CARD} h-[120px] p-4 flex flex-col justify-between`}>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${dim}`} />
                  <div className={`h-[10px] w-[52px] ${dim}`} />
                </div>
                <div className={`h-[30px] w-[46px] ${bar}`} />
                <div className={`h-[11px] w-[76px] ${dim}`} />
              </div>
            ))}
          </div>

          {/* Today (7) + Needs you (5) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <SectionSkeleton rows={3} className="lg:col-span-7" />
            <SectionSkeleton rows={3} className="lg:col-span-5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#FAF8F5] dark:bg-[#2C2C2C] overflow-y-auto min-w-0">

      {/* ── Full-width header bar ────────────────────────────────────────── */}
      <div className="min-h-[80px] bg-white dark:bg-[#383838] border-b border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] flex items-center justify-between gap-6 px-8 py-4 shrink-0">
        <div className="min-w-0">
          <h1 className="text-[22px] tracking-tight text-[#241B14] dark:text-[#F4F4F5]" style={SERIF}>
            {greeting()}, {firstName}.
          </h1>
          <p className={`font-sans text-[12.5px] ${MUTED} mt-0.5`}>
            {now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
            {" · "}
            {todayEvents.length
              ? `${todayEvents.length} event${todayEvents.length === 1 ? "" : "s"} today`
              : "Nothing scheduled today"}
            {unread.length ? ` · ${unread.length} unread` : " · Inbox clear"}
          </p>
        </div>

        <div className={`hidden sm:flex items-center gap-2 h-9 px-3.5 rounded-[10px] border ${RULE} shrink-0`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          <span className={`font-sans text-[12px] font-medium ${MUTED}`}>
            {isGithubConnected ? "All integrations active" : "Google connected"}
          </span>
        </div>
      </div>

      {/* ── Full-width content ───────────────────────────────────────────── */}
      <div className="flex-1 p-8 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

        {/* Quick actions — same segmented-control language as History / Team filters,
            centered on the page rather than hugging the left edge. */}
        <div className="flex justify-center">
        <div className="flex items-center justify-center gap-1 bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.06)] p-1 rounded-[10px] w-max max-w-full flex-wrap">
          <span className={`inline-flex items-center gap-1.5 pl-2 pr-1.5 font-sans text-[11px] font-semibold uppercase tracking-wider ${FAINT}`}>
            <AurenMascotBadge size={20} />
            Ask Auren
          </span>
          {quickActions.map((qa) => (
            <button
              key={qa.label}
              onClick={qa.run}
              disabled={isAgentLoading}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] font-sans text-[12px] font-medium transition-colors disabled:opacity-40 bg-white dark:bg-[#383838] shadow-sm text-[#241B14] dark:text-[#F4F4F5] hover:text-[#E8593C]`}
            >
              {qa.icon}
              {qa.label}
            </button>
          ))}
        </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat
            label="Inbox"
            icon={<Mail size={11} />}
            color="#E8593C"
            value={unread.length}
            caption={urgent.length ? `${urgent.length} urgent` : "Unread messages"}
            onClick={() => onNavigate("inbox")}
          />
          <Stat
            label="Schedule"
            icon={<Calendar size={11} />}
            color="#0EA5E9"
            value={todayEvents.length}
            caption={
              nextEvent
                ? `Next at ${hhmm(new Date(nextEvent.startAt))}`
                : todayEvents.length
                  // Events exist but all have passed — "Schedule clear" under a count
                  // of 8 read as a contradiction.
                  ? "All done for today"
                  : "Nothing scheduled"
            }
            onClick={() => onNavigate("calendar")}
          />
          <Stat
            label="GitHub"
            icon={<GitBranch size={11} />}
            color="#8B5CF6"
            value={isGithubConnected ? "Active" : "Off"}
            caption={isGithubConnected ? "Repository linked" : "Connect GitHub"}
            onClick={() => onNavigate("github")}
          />
          <Stat
            label="Runs"
            icon={<CheckCircle2 size={11} />}
            color="#10B981"
            value={completed}
            caption="Completed executions"
            onClick={() => onNavigate("history")}
          />
        </div>

        {/* Today + Triage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          <div className="lg:col-span-7 flex flex-col gap-6">
            <Section title="Today" action="Full calendar" onAction={() => onNavigate("calendar")}>
              {nextEvent ? (
                <>
                  <div className={`px-5 py-4 flex items-center justify-between gap-4 border-b ${RULE}`}>
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-1 self-stretch min-h-[38px] bg-[#E8593C] rounded-full shrink-0" />
                      <div className="min-w-0">
                        <span className="inline-flex items-center gap-1 font-sans text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#E8593C]/10 text-[#E8593C]">
                          Up next
                        </span>
                        <p className="font-sans font-semibold text-[14px] text-[#241B14] dark:text-[#F4F4F5] truncate mt-1.5">
                          {nextEvent.title}
                        </p>
                        <p className={`font-sans text-[12px] ${MUTED} mt-0.5 tabular-nums`}>
                          {hhmm(new Date(nextEvent.startAt))}
                        </p>
                      </div>
                    </div>

                    {nextLink && (
                      <a
                        href={nextLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 h-9 px-4 inline-flex items-center gap-1.5 bg-[#E8593C] hover:bg-[#D4472B] text-white rounded-[10px] font-sans text-[12.5px] font-semibold transition-colors shadow-sm"
                      >
                        <Video size={14} />
                        Join
                      </a>
                    )}
                  </div>

                  {todayEvents.length > 0 && (
                    <div className={`divide-y ${DIVIDE}`}>
                      {todayEvents.slice(0, 4).map((ev) => {
                        const past = new Date(ev.startAt) < now;
                        return (
                          <div key={ev.id} className="flex items-center gap-3 px-5 py-3">
                            <span className={`font-sans text-[12px] font-medium ${MUTED} w-[52px] shrink-0 tabular-nums`}>
                              {hhmm(new Date(ev.startAt))}
                            </span>
                            <span
                              className={`font-sans text-[13px] truncate flex-1 min-w-0 ${
                                past ? MUTED : "text-[#241B14] dark:text-[#F4F4F5]"
                              }`}
                            >
                              {ev.title}
                            </span>
                            {past && (
                              <span className={`font-sans text-[10px] font-bold uppercase tracking-wider ${FAINT} shrink-0`}>
                                Done
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <Empty
                  icon={<Calendar size={20} className={FAINT} />}
                  title="Nothing left today"
                  hint="Your calendar is clear — enjoy the focus time."
                />
              )}
            </Section>

            <Section title="Recent runs" action="Full history" onAction={() => onNavigate("history")}>
              {recent.length === 0 ? (
                <Empty
                  icon={<Terminal size={20} className={FAINT} />}
                  title="No runs yet"
                  hint="Run a command and it will show up here."
                />
              ) : (
                <div className={`divide-y ${DIVIDE}`}>
                  {recent.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => ask(item.command)}
                      disabled={isAgentLoading}
                      className="w-full text-left flex items-center gap-3 px-5 py-3 hover:bg-[rgba(36,27,20,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)] transition-colors group disabled:opacity-40"
                    >
                      <CheckCircle2 size={13} className="text-[#10B981] shrink-0" />
                      <span className="font-sans text-[13px] text-[#241B14] dark:text-[#F4F4F5] truncate flex-1 min-w-0 group-hover:text-[#E8593C] transition-colors">
                        {item.command}
                      </span>
                      <span className={`font-sans text-[11px] ${FAINT} shrink-0 hidden sm:flex items-center gap-1`}>
                        <Clock size={11} />
                        Re-run
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </Section>
          </div>

          {/* Triage */}
          <div className="lg:col-span-5">
            <Section title="Needs you" action="View all" onAction={() => onNavigate("inbox")}>
              {unread.length === 0 ? (
                <Empty
                  icon={<CheckCircle2 size={20} className="text-[#10B981]" />}
                  title="Inbox zero"
                  hint="Every message has been processed."
                />
              ) : (
                <>
                  <div className={`divide-y ${DIVIDE}`}>
                    {(urgent.length ? urgent : unread).slice(0, 5).map((email) => {
                      const isUrg = urgent.some((u) => u.id === email.id);
                      return (
                        <button
                          key={email.id}
                          onClick={() => onNavigate("inbox")}
                          className="w-full text-left px-5 py-3 hover:bg-[rgba(36,27,20,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)] transition-colors group"
                        >
                          <span className="flex items-center justify-between gap-2">
                            <span className="font-sans font-semibold text-[13px] text-[#241B14] dark:text-[#F4F4F5] truncate group-hover:text-[#E8593C] transition-colors">
                              {email.fromName || email.from}
                            </span>
                            {isUrg && (
                              <span className="shrink-0 px-2 py-0.5 rounded-full font-sans text-[10px] font-bold uppercase tracking-wider bg-[#E8593C]/10 text-[#E8593C]">
                                Urgent
                              </span>
                            )}
                          </span>
                          <span className={`block font-sans text-[12.5px] ${MUTED} truncate mt-0.5`}>
                            {email.subject}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className={`flex items-center justify-between gap-3 px-5 py-3 border-t ${RULE}`}>
                    <span className={`font-sans text-[12px] ${MUTED}`}>
                      {unread.length} unread in inbox
                    </span>
                    {/* Names the actual sender/subject so the agent has something to
                        draft against — a bare "draft replies" hits its no-summaries rule. */}
                    <button
                      onClick={() => {
                        const top = (urgent.length ? urgent : unread)[0];
                        if (!top) return;
                        compose(
                          `Draft a reply to ${top.fromName || top.from} about "${top.subject}": `
                        );
                      }}
                      disabled={isAgentLoading}
                      className="inline-flex items-center gap-1.5 font-sans text-[12px] font-semibold text-[#E8593C] hover:text-[#D4472B] transition-colors disabled:opacity-40"
                    >
                      <PenLine size={12} />
                      Draft reply
                    </button>
                  </div>
                </>
              )}
            </Section>
          </div>
        </div>

        <div className="h-2" />
      </div>

      {/* ── Day summary card ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isSummaryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsSummaryOpen(false)}
            className="fixed inset-0 z-[80] flex items-center justify-center p-6 bg-[rgba(36,27,20,0.28)] backdrop-blur-md"
          >
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[850px]">
              {summary ? (
                <BriefingCard
                  data={summary}
                  onClose={() => setIsSummaryOpen(false)}
                  onOpenInbox={() => { setIsSummaryOpen(false); onNavigate("inbox"); }}
                  onOpenCalendar={() => { setIsSummaryOpen(false); onNavigate("calendar"); }}
                  onOpenGithub={() => { setIsSummaryOpen(false); onNavigate("github"); }}
                />
              ) : (
                <div className={`${CARD} p-14`}>
                  <AurenLoading text="Reading your day…" size="md" />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
