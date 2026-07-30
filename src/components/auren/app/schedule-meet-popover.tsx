"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, Video, Mail, X, Clock } from "lucide-react";
import { CalendarDate, Time, getLocalTimeZone, today } from "@internationalized/date";
import { Calendar } from "@/components/ui/calendar-rac";

/* Shared tokens with Team / Home / History. */
const RULE = "border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)]";
const DIVIDE = "divide-[rgba(36,27,20,0.08)] dark:divide-[rgba(255,255,255,0.08)]";
const MUTED = "text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]";
const FAINT = "text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]";
const INK = "text-[#241B14] dark:text-[#F4F4F5]";
const ACCENT = "#E8593C";
const FIELD =
  "w-full h-9 px-2.5 rounded-[8px] border border-[rgba(36,27,20,0.12)] dark:border-[rgba(255,255,255,0.14)] bg-white dark:bg-[#2C2C2C] font-sans text-[12.5px] text-[#241B14] dark:text-[#F4F4F5] outline-none focus:border-[#E8593C] transition-colors";

const DURATIONS = [15, 30, 45, 60, 90, 120];
/** Quarter-hour slots — the granularity people actually book meetings at. */
const SLOT_MINUTES = 15;

function formatTime12(hour: number, minute: number) {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  const suffix = hour < 12 ? "AM" : "PM";
  return `${h}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function formatDateLong(d: CalendarDate, withYear = false) {
  return new Date(d.year, d.month - 1, d.day).toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    ...(withYear ? { year: "numeric" as const } : {}),
  });
}

/** Minutes-from-midnight, rounded up to the next slot — nobody books 2:07pm. */
function nextSlot(): number {
  const d = new Date();
  const mins = d.getHours() * 60 + d.getMinutes() + SLOT_MINUTES;
  return Math.min(Math.ceil(mins / SLOT_MINUTES) * SLOT_MINUTES, 23 * 60 + 45);
}

function isSameDay(a: CalendarDate, b: CalendarDate) {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

export interface ScheduleMeetValues {
  date: CalendarDate;
  startMinutes: number;
  durationMinutes: number;
  title: string;
  withMeetLink: boolean;
  emailInvite: boolean;
  note: string;
}

/**
 * Builds the natural-language command the agent actually runs. The agent still
 * parses text, so this stays a sentence — but every value in it now comes from a
 * real control instead of the hardcoded "tomorrow at 3 PM" template.
 */
export function buildMeetCommand(tag: string, v: ScheduleMeetValues): string {
  const h = Math.floor(v.startMinutes / 60);
  const m = v.startMinutes % 60;

  const parts = [
    `Schedule a ${v.durationMinutes}-minute`,
    v.withMeetLink ? "Google Meet" : "meeting",
    `with ${tag}`,
    `titled "${v.title.trim() || `Meeting with ${tag.replace(/^@/, "")}`}"`,
    // Year included: a date past December is otherwise ambiguous to the agent.
    `on ${formatDateLong(v.date, true)}`,
    `at ${formatTime12(h, m)}`,
  ];

  let command = parts.join(" ");
  if (v.emailInvite) {
    command += v.withMeetLink
      ? ", and email them the meeting link"
      : ", and email them the invite";
  }
  if (v.note.trim()) command += `. Include this note: "${v.note.trim()}"`;

  return command;
}

export function ScheduleMeetPopover({
  open,
  onClose,
  contactName,
  tag,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  contactName: string;
  tag: string;
  onSubmit: (command: string) => void;
}) {
  const [date, setDate] = useState<CalendarDate>(() => today(getLocalTimeZone()));
  const [startMinutes, setStartMinutes] = useState<number>(() => nextSlot());
  const [durationMinutes, setDuration] = useState(30);
  const [title, setTitle] = useState("");
  const [withMeetLink, setWithMeetLink] = useState(true);
  const [emailInvite, setEmailInvite] = useState(true);
  const [note, setNote] = useState("");

  // Reset to sensible defaults each time it opens, so a stale date from an earlier
  // contact never silently carries over into a new invite.
  useEffect(() => {
    if (!open) return;
    setDate(today(getLocalTimeZone()));
    setStartMinutes(nextSlot());
    setDuration(30);
    setTitle("");
    setWithMeetLink(true);
    setEmailInvite(true);
    setNote("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // The modal owns the screen while it's up — don't let the page scroll behind it.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const isToday = isSameDay(date, today(getLocalTimeZone()));

  // Times already past are dropped when the chosen day is today — offering 9:00 AM
  // at 5 PM just produces a plan the agent has to reject.
  const slots = useMemo(() => {
    const floor = isToday ? nextSlot() - SLOT_MINUTES : -1;
    const out: { value: number; label: string }[] = [];
    for (let m = 0; m < 24 * 60; m += SLOT_MINUTES) {
      if (m <= floor) continue;
      out.push({ value: m, label: formatTime12(Math.floor(m / 60), m % 60) });
    }
    return out;
  }, [isToday]);

  // Switching to today can strand the selection in the past; pull it forward.
  useEffect(() => {
    if (slots.length === 0) return;
    if (!slots.some((s) => s.value === startMinutes)) setStartMinutes(slots[0].value);
  }, [slots, startMinutes]);

  const endLabel = useMemo(() => {
    const end = startMinutes + durationMinutes;
    return formatTime12(Math.floor(end / 60) % 24, end % 60);
  }, [startMinutes, durationMinutes]);

  const submit = () => {
    onSubmit(
      buildMeetCommand(tag, {
        date,
        startMinutes,
        durationMinutes,
        title,
        withMeetLink,
        emailInvite,
        note,
      })
    );
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6 bg-[rgba(36,27,20,0.28)] backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Schedule a meeting with ${contactName}`}
            className={`w-full max-w-[620px] max-h-[88vh] flex flex-col bg-white dark:bg-[#383838] rounded-[16px] border ${RULE} shadow-[0_28px_70px_rgba(36,27,20,0.18)] overflow-hidden font-sans`}
          >
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className={`flex items-start justify-between gap-3 px-6 pt-5 pb-4 border-b ${RULE} shrink-0`}>
              <div className="min-w-0">
                <h2
                  className={`text-[18px] tracking-tight ${INK}`}
                  style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}
                >
                  Schedule with {contactName}
                </h2>
                <p className={`font-sans text-[12px] ${MUTED} mt-1 flex items-center gap-1.5 tabular-nums`}>
                  <Clock size={11} className="shrink-0" />
                  {formatDateLong(date)} · {formatTime12(Math.floor(startMinutes / 60), startMinutes % 60)} – {endLabel}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className={`shrink-0 p-1.5 rounded-[8px] ${FAINT} hover:text-[#241B14] dark:hover:text-[#F4F4F5] hover:bg-[rgba(36,27,20,0.05)] dark:hover:bg-[rgba(255,255,255,0.07)] transition-colors`}
              >
                <X size={16} />
              </button>
            </div>

            {/* ── Body: calendar beside the fields, so nothing needs scrolling ── */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className={`grid grid-cols-1 sm:grid-cols-[auto_1fr] sm:divide-x ${DIVIDE}`}>
                {/* Date */}
                <div className={`flex justify-center px-4 py-4 border-b sm:border-b-0 ${RULE}`}>
                  <Calendar
                    className="[&_td]:px-0"
                    value={date}
                    minValue={today(getLocalTimeZone())}
                    onChange={(v) => v && setDate(v as CalendarDate)}
                  />
                </div>

                {/* Details */}
                <div className="px-5 py-4 flex flex-col gap-3.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="flex flex-col gap-1.5">
                      <label className={`font-sans text-[10.5px] font-semibold uppercase tracking-wider ${FAINT}`}>
                        Start
                      </label>
                      <select
                        value={startMinutes}
                        onChange={(e) => setStartMinutes(Number(e.target.value))}
                        className={FIELD}
                      >
                        {slots.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={`font-sans text-[10.5px] font-semibold uppercase tracking-wider ${FAINT}`}>
                        Duration
                      </label>
                      <select
                        value={durationMinutes}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className={FIELD}
                      >
                        {DURATIONS.map((d) => (
                          <option key={d} value={d}>
                            {d < 60
                              ? `${d} min`
                              : d % 60 === 0
                                ? `${d / 60} hr`
                                : `${Math.floor(d / 60)} hr ${d % 60} min`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className={`font-sans text-[10.5px] font-semibold uppercase tracking-wider ${FAINT}`}>
                      Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={`Meeting with ${contactName}`}
                      className={FIELD}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className={`font-sans text-[10.5px] font-semibold uppercase tracking-wider ${FAINT}`}>
                      Note <span className="normal-case font-normal tracking-normal">(optional)</span>
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      placeholder="Anything to add to the invite…"
                      className={`${FIELD} h-auto py-2 resize-none leading-snug`}
                    />
                  </div>

                  <div className={`flex flex-col gap-2 pt-1 mt-auto border-t ${RULE} pt-3`}>
                    <Toggle
                      icon={<Video size={12} />}
                      label="Add Google Meet link"
                      checked={withMeetLink}
                      onChange={setWithMeetLink}
                    />
                    <Toggle
                      icon={<Mail size={12} />}
                      label="Email the invite"
                      checked={emailInvite}
                      onChange={setEmailInvite}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Footer ─────────────────────────────────────────────────── */}
            <div
              className={`flex items-center justify-end gap-2 px-6 py-3.5 border-t ${RULE} bg-[#FAF8F5] dark:bg-[#2C2C2C] shrink-0`}
            >
              <button
                onClick={onClose}
                className={`h-9 px-4 rounded-[9px] font-sans text-[12.5px] font-medium ${MUTED} hover:text-[#241B14] dark:hover:text-[#F4F4F5] hover:bg-[rgba(36,27,20,0.05)] dark:hover:bg-[rgba(255,255,255,0.07)] transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={submit}
                className="h-9 px-5 inline-flex items-center justify-center gap-1.5 bg-[#E8593C] hover:bg-[#D4472B] text-white rounded-[9px] font-sans text-[12.5px] font-semibold transition-colors shadow-sm"
              >
                <CalendarIcon size={13} />
                Review plan
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Toggle({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-2 w-full"
    >
      <span className={`inline-flex items-center gap-1.5 font-sans text-[12.5px] ${checked ? INK : MUTED}`}>
        <span className={checked ? "" : FAINT} style={checked ? { color: ACCENT } : undefined}>
          {icon}
        </span>
        {label}
      </span>
      <span
        className={`w-8 h-[18px] rounded-full p-0.5 transition-colors shrink-0 ${
          checked ? "" : "bg-[rgba(36,27,20,0.18)] dark:bg-[rgba(255,255,255,0.22)]"
        }`}
        style={checked ? { backgroundColor: ACCENT } : undefined}
      >
        <span
          className={`block w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-[14px]" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}

export default ScheduleMeetPopover;
