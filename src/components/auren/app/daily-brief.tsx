"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Calendar, Mail, Clock, ArrowRight } from "lucide-react";
import { getCalendarEvents } from "@/app/actions/get-events";
import { getInboxEmails } from "@/app/actions/inbox";
import { AurenMascotBadge } from "@/components/ui/auren-mascot";
import type { CalendarEventResult, GmailMessage } from "@/types";

/* Shared tokens — same as home-view / briefing-card / team-view. */
const SERIF = { fontFamily: "var(--font-civane, Georgia, serif)" };
const RULE = "border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)]";
const MUTED = "text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]";
const FAINT = "text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]";
const INK = "text-[#241B14] dark:text-[#F4F4F5]";
const ACCENT = "#E8593C";

function greetingFor(d: Date) {
  const h = d.getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/** en-US pinned: an unspecified locale differs between server and browser and
 *  produces a real hydration mismatch. */
const fmtTime = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
};

function isToday(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return false;
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

export function DailyBrief() {
  const { user } = useUser();
  const firstName = user?.firstName || "there";

  const [events, setEvents] = useState<CalendarEventResult[] | null>(null);
  const [emails, setEmails] = useState<GmailMessage[] | null>(null);

  // This panel used to render a hardcoded paragraph ("an urgent security code")
  // that was identical for every user on every day — it described a day nobody
  // was having. It now reads the same two sources the rest of the app uses.
  useEffect(() => {
    let active = true;
    getCalendarEvents(false)
      .then((r) => active && setEvents(r.success && r.data ? r.data : []))
      .catch(() => active && setEvents([]));
    getInboxEmails(false, 20, "INBOX")
      .then((r: any) => active && setEmails(r?.success && r?.data ? r.data : []))
      .catch(() => active && setEmails([]));
    return () => {
      active = false;
    };
  }, []);

  const isLoading = events === null || emails === null;

  const { todayEvents, nextEvent, unread, urgent } = useMemo(() => {
    const now = Date.now();
    const te = (events || [])
      .filter((e) => isToday(e.startAt))
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
    return {
      todayEvents: te,
      nextEvent: te.find((e) => new Date(e.startAt).getTime() > now) || null,
      unread: (emails || []).filter((e) => !e.isRead),
      urgent: (emails || []).filter((e) => !e.isRead && (e.priority === "urg" || e.priority === "urgent")),
    };
  }, [events, emails]);

  /* One honest sentence assembled from real counts, rather than a fixed script. */
  const summary = useMemo(() => {
    if (isLoading) return "";
    const parts: string[] = [];
    if (todayEvents.length === 0) parts.push("Nothing on your calendar today");
    else if (nextEvent) parts.push(`${todayEvents.length} meeting${todayEvents.length === 1 ? "" : "s"} today, next at ${fmtTime(nextEvent.startAt)}`);
    else parts.push(`${todayEvents.length} meeting${todayEvents.length === 1 ? "" : "s"} today, all done`);

    if (urgent.length) parts.push(`${urgent.length} email${urgent.length === 1 ? "" : "s"} marked urgent`);
    else if (unread.length) parts.push(`${unread.length} unread`);
    else parts.push("inbox is clear");

    return parts.join(" · ");
  }, [isLoading, todayEvents, nextEvent, unread, urgent]);

  const openChat = (text?: string) => {
    document.dispatchEvent(new CustomEvent("open-ai-chat", text ? { detail: { text } } : undefined));
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-[#FAF8F5] dark:bg-[#2C2C2C] relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "radial-gradient(#241B14 1px, transparent 1px)", backgroundSize: "24px 24px" }}
      />

      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-[520px] px-6">
        <AurenMascotBadge size={52} className="mb-7 shadow-sm" />

        <h2 className={`text-[34px] leading-tight ${INK} tracking-tight`} style={SERIF}>
          {greetingFor(new Date())}, {firstName}.
        </h2>

        {isLoading ? (
          <div className="mt-3 h-[15px] w-[280px] rounded-[6px] bg-[rgba(36,27,20,0.07)] dark:bg-[rgba(255,255,255,0.07)] animate-pulse" />
        ) : (
          <p className={`text-[14.5px] ${MUTED} mt-3 font-sans`}>{summary}</p>
        )}

        {/* Next meeting + unread — the two facts worth surfacing on an empty pane. */}
        {!isLoading && (todayEvents.length > 0 || unread.length > 0) && (
          <div className="w-full mt-8 flex flex-col gap-2.5">
            {nextEvent && (
              <button
                onClick={() => openChat(`What's my next meeting about?`)}
                className={`group w-full flex items-center gap-3.5 px-4 py-3 rounded-[12px] border ${RULE} bg-white dark:bg-[#383838] shadow-sm text-left hover:border-[rgba(36,27,20,0.16)] dark:hover:border-[rgba(255,255,255,0.16)] transition-colors`}
              >
                <span className="w-1 self-stretch min-h-[34px] rounded-full shrink-0" style={{ backgroundColor: ACCENT }} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-sans text-[10px] font-bold uppercase tracking-wider"
                      style={{ backgroundColor: `${ACCENT}1A`, color: ACCENT }}
                    >
                      <Clock size={9} /> Next
                    </span>
                    <span className={`font-sans text-[12px] font-medium tabular-nums ${MUTED}`}>{fmtTime(nextEvent.startAt)}</span>
                  </span>
                  <span className={`block text-[13.5px] font-semibold ${INK} truncate mt-1`}>{nextEvent.title}</span>
                </span>
                <ArrowRight size={14} className={`shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${FAINT}`} />
              </button>
            )}

            <div className="flex gap-2.5">
              <StatChip icon={<Calendar size={13} />} value={todayEvents.length} label={todayEvents.length === 1 ? "meeting" : "meetings"} />
              <StatChip icon={<Mail size={13} />} value={unread.length} label="unread" accent={urgent.length > 0} />
            </div>
          </div>
        )}

        <button
          onClick={() => openChat()}
          className={`mt-9 inline-flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-[#383838] border ${RULE} rounded-full text-[14px] font-medium ${INK} hover:border-[#E8593C]/40 hover:text-[#E8593C] transition-colors shadow-sm`}
        >
          <AurenMascotBadge size={16} />
          Ask Auren
        </button>
      </div>
    </div>
  );
}

function StatChip({ icon, value, label, accent }: { icon: React.ReactNode; value: number; label: string; accent?: boolean }) {
  const hot = accent && value > 0;
  return (
    <div className={`flex-1 flex items-center gap-2.5 px-4 py-2.5 rounded-[12px] border ${RULE} bg-white dark:bg-[#383838] shadow-sm`}>
      <span className={hot ? "" : FAINT} style={hot ? { color: ACCENT } : undefined}>
        {icon}
      </span>
      <span className="flex items-baseline gap-1.5 min-w-0">
        <span className="text-[16px] font-semibold tabular-nums" style={hot ? { color: ACCENT } : undefined}>
          {value}
        </span>
        <span className={`font-sans text-[12px] ${MUTED} truncate`}>{label}</span>
      </span>
    </div>
  );
}
