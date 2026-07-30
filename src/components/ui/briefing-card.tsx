"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, Mail, GitBranch, X, ArrowUpRight, Clock, Inbox as InboxIcon } from "lucide-react";
import { AurenMascotBadge } from "@/components/ui/auren-mascot";
import type { DailyBriefingData } from "@/types";

/* Same tokens as History / Team / Home so the card reads as part of the product. */
const SERIF = { fontFamily: "var(--font-civane, Georgia, serif)" };
const RULE = "border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)]";
const MUTED = "text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]";
const FAINT = "text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]";
const INK = "text-[#241B14] dark:text-[#F4F4F5]";
const HOVER = "hover:bg-[rgba(36,27,20,0.03)] dark:hover:bg-[rgba(255,255,255,0.04)]";
const ACCENT = "#E8593C";

/** Rows cascade in rather than snapping — the card should feel composed, not dumped. */
const rise = {
  hidden: { opacity: 0, y: 8 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 + i * 0.035, duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

function greeting(d: Date) {
  const h = d.getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/** Big number + label. The three of these are the whole day in one glance. */
function Stat({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  const isHot = accent && value > 0;
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="text-[27px] leading-none tabular-nums"
        style={{ ...SERIF, color: isHot ? ACCENT : "inherit" }}
      >
        {value}
      </span>
      <span className={`font-sans text-[10.5px] font-semibold uppercase tracking-wider ${FAINT}`}>{label}</span>
    </div>
  );
}

function SectionLabel({
  icon,
  count,
  children,
}: {
  icon: React.ReactNode;
  count?: number;
  children: string;
}) {
  return (
    <div className="flex items-center justify-between px-7 pt-6 pb-3">
      <span className="inline-flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-wider">
        <span className={FAINT}>{icon}</span>
        <span className={INK}>{children}</span>
      </span>
      {typeof count === "number" && count > 0 && (
        <span className={`font-sans text-[11px] font-semibold tabular-nums ${FAINT}`}>{count}</span>
      )}
    </div>
  );
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return <p className={`px-7 pb-6 text-[13px] ${MUTED}`}>{children}</p>;
}

export function BriefingCard({
  data,
  onClose,
  onOpenInbox,
  onOpenCalendar,
  onOpenGithub,
}: {
  data: DailyBriefingData;
  onClose?: () => void;
  /** Rows are live: clicking one takes you to the thing rather than just describing it. */
  onOpenInbox?: () => void;
  onOpenCalendar?: () => void;
  onOpenGithub?: () => void;
}) {
  const now = new Date();

  const parseTime = (isoString: string) => {
    const d = new Date(isoString);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatTime = (isoString: string) => {
    const d = parseTime(isoString);
    if (!d) return isoString;
    // Locale pinned to en-US: an unspecified locale falls back to the runtime's
    // default, which can differ between the server (Node) and the browser
    // rendering it — that mismatch is a real hydration error, not a fluke.
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  const formatRepoName = (urlOrName: string) =>
    urlOrName.includes("github.com/") ? urlOrName.split("github.com/")[1] || urlOrName : urlOrName;

  const today = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  // "Next up" is the first event still ahead of us — the single most useful fact on the card,
  // so it gets called out instead of being one indistinguishable row among many.
  const nextIndex = data.schedule.findIndex((item) => {
    const d = parseTime(item.time);
    return d !== null && d.getTime() > now.getTime();
  });

  const urgentCount = data.emails.filter((e) => e.isUrgent).length;
  const prCount = data.github.reduce((sum, r) => sum + r.prsToReview, 0);
  const sortedEmails = [...data.emails].sort((a, b) => Number(b.isUrgent) - Number(a.isUrgent));

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.985 }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      className={`relative bg-white dark:bg-[#383838] rounded-[18px] border ${RULE} shadow-[0_28px_70px_rgba(36,27,20,0.16)] w-full max-h-[86vh] overflow-y-auto scrollbar-hide font-sans`}
    >
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Warm wash behind the header so the card opens on something, not a white slab. */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(120% 140% at 0% 0%, rgba(232,89,60,0.10) 0%, rgba(232,89,60,0.03) 38%, transparent 68%)",
          }}
        />

        <div className={`relative px-7 pt-7 pb-6 border-b ${RULE}`}>
          <div className="flex items-start gap-4">
            <AurenMascotBadge size={40} className="mt-1 shadow-sm shrink-0" />

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2.5 flex-wrap">
                <h2 className={`text-[25px] tracking-tight ${INK}`} style={SERIF}>
                  {greeting(now)}
                </h2>
                <span className={`font-sans text-[12px] ${FAINT}`}>{today}</span>
              </div>
              <p className={`text-[14px] leading-relaxed ${MUTED} mt-2 max-w-[620px]`}>{data.summaryText}</p>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                aria-label="Close"
                className={`shrink-0 p-1.5 rounded-[8px] ${FAINT} hover:text-[#241B14] dark:hover:text-[#F4F4F5] hover:bg-[rgba(36,27,20,0.05)] dark:hover:bg-[rgba(255,255,255,0.07)] transition-colors`}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* The day in three numbers. */}
          <div className="flex items-start gap-10 mt-6 pl-[56px]">
            <Stat value={data.schedule.length} label="Meetings" />
            <Stat value={urgentCount} label="Urgent" accent />
            <Stat value={prCount} label="PRs to review" />
          </div>
        </div>
      </div>

      {/* ── Schedule ───────────────────────────────────────────────────────── */}
      <SectionLabel icon={<Calendar size={12} />} count={data.schedule.length}>
        Schedule
      </SectionLabel>

      {data.schedule.length === 0 ? (
        <EmptyRow>Nothing scheduled today. Enjoy it.</EmptyRow>
      ) : (
        <div className="px-4 pb-2">
          {/* Grid layout, not absolute positioning: [time | rail+node | title | badge].
              The rail is one continuous element spanning the middle column so it reads
              as a single line through every row instead of being redrawn per row. */}
          <div className="relative grid grid-cols-[52px_20px_1fr_auto] gap-x-3">
            <span
              aria-hidden
              className="absolute top-1 bottom-1 w-px bg-[rgba(36,27,20,0.10)] dark:bg-[rgba(255,255,255,0.12)]"
              style={{ left: "52px", marginLeft: "9px" }}
            />

            {data.schedule.map((item, i) => {
              const isNext = i === nextIndex;
              const isPast = nextIndex === -1 ? true : i < nextIndex;

              return (
                <motion.button
                  key={i}
                  custom={i}
                  variants={rise}
                  initial="hidden"
                  animate="show"
                  onClick={onOpenCalendar}
                  className={`group col-span-4 grid grid-cols-subgrid items-center py-2.5 px-3 rounded-[10px] text-left transition-colors ${
                    onOpenCalendar ? `${HOVER} cursor-pointer` : "cursor-default"
                  }`}
                >
                  <span
                    className={`font-sans text-[12px] tabular-nums text-right pr-1 ${
                      isNext ? "font-semibold" : "font-medium"
                    } ${isPast ? FAINT : isNext ? "" : MUTED}`}
                    style={isNext ? { color: ACCENT } : undefined}
                  >
                    {formatTime(item.time)}
                  </span>

                  <span className="relative flex justify-center">
                    <span
                      aria-hidden
                      className={`w-[7px] h-[7px] rounded-full ring-4 ring-white dark:ring-[#383838] ${
                        isPast ? "bg-[rgba(36,27,20,0.22)] dark:bg-[rgba(255,255,255,0.25)]" : ""
                      }`}
                      style={
                        isPast
                          ? undefined
                          : { backgroundColor: ACCENT, boxShadow: isNext ? `0 0 0 4px ${ACCENT}22` : undefined }
                      }
                    />
                  </span>

                  <span className={`text-[13.5px] truncate min-w-0 ${isPast ? MUTED : INK} ${isNext ? "font-semibold" : ""}`}>
                    {item.title}
                  </span>

                  {isNext ? (
                    <span
                      className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-sans text-[10px] font-bold uppercase tracking-wider"
                      style={{ backgroundColor: `${ACCENT}1A`, color: ACCENT }}
                    >
                      <Clock size={9} />
                      Next
                    </span>
                  ) : (
                    <span />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Inbox ──────────────────────────────────────────────────────────── */}
      <div className={`border-t ${RULE} mt-4`}>
        <SectionLabel icon={<Mail size={12} />} count={sortedEmails.length}>
          Needs you
        </SectionLabel>

        {sortedEmails.length === 0 ? (
          <div className="px-7 pb-6 flex items-center gap-2.5">
            <InboxIcon size={14} className={FAINT} />
            <span className={`text-[13px] ${MUTED}`}>Inbox is clear.</span>
          </div>
        ) : (
          <div className="px-4 pb-2">
            {sortedEmails.map((email, i) => (
              <motion.button
                key={i}
                custom={i}
                variants={rise}
                initial="hidden"
                animate="show"
                onClick={onOpenInbox}
                className={`group w-full text-left flex items-start gap-3 py-2.5 px-3 rounded-[10px] transition-colors ${
                  onOpenInbox ? `${HOVER} cursor-pointer` : "cursor-default"
                }`}
              >
                {/* Urgency as a spine, not a badge — scannable down the left edge. */}
                <span
                  aria-hidden
                  className={`w-[3px] self-stretch rounded-full shrink-0 ${
                    email.isUrgent ? "" : "bg-[rgba(36,27,20,0.10)] dark:bg-[rgba(255,255,255,0.12)]"
                  }`}
                  style={email.isUrgent ? { backgroundColor: ACCENT } : undefined}
                />

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className={`font-semibold text-[13px] truncate ${INK}`}>{email.sender}</span>
                    {email.isUrgent && (
                      <span
                        className="shrink-0 px-2 py-0.5 rounded-full font-sans text-[10px] font-bold uppercase tracking-wider"
                        style={{ backgroundColor: `${ACCENT}1A`, color: ACCENT }}
                      >
                        Urgent
                      </span>
                    )}
                  </span>
                  <span className={`block text-[12.5px] ${MUTED} truncate mt-0.5`}>{email.subject}</span>
                </span>

                {onOpenInbox && (
                  <ArrowUpRight size={14} className={`shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${FAINT}`} />
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* ── Repositories — only when there's something to show. ─────────────── */}
      {data.github.length > 0 && (
        <div className={`border-t ${RULE} mt-4`}>
          <SectionLabel icon={<GitBranch size={12} />} count={data.github.length}>
            Repositories
          </SectionLabel>
          <div className="px-4 pb-6">
            {data.github.map((repo, i) => (
              <motion.button
                key={i}
                custom={i}
                variants={rise}
                initial="hidden"
                animate="show"
                onClick={onOpenGithub}
                className={`group w-full text-left flex items-center justify-between gap-3 py-2.5 px-3 rounded-[10px] transition-colors ${
                  onOpenGithub ? `${HOVER} cursor-pointer` : "cursor-default"
                }`}
              >
                <span className={`text-[13px] truncate ${INK}`} title={repo.repo}>
                  {formatRepoName(repo.repo)}
                </span>
                <span className={`font-sans text-[11.5px] ${MUTED} shrink-0 tabular-nums`}>
                  {repo.prsToReview} PR · {repo.issuesAssigned} issues
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {data.github.length === 0 && <div className="h-4" />}
    </motion.div>
  );
}
