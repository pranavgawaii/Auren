"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, RotateCcw, Clock, Mail, Calendar, GitBranch, Terminal } from "lucide-react";
import { getAgentHistory } from "@/app/actions/history";
import type { AgentAction } from "@/types";
import { AurenLoading } from "@/components/ui/auren-loading";

/* Shared with Dashboard / Settings / GitHub views so every page reads as one product. */
const SERIF = { fontFamily: "var(--font-civane, Georgia, serif)" };
const CARD =
  "bg-white dark:bg-[#383838] rounded-[16px] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-sm";
const DIVIDE = "divide-[rgba(36,27,20,0.06)] dark:divide-[rgba(255,255,255,0.06)]";
const MUTED = "text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]";
const FAINT = "text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]";

const TOOL_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  gmail_send: { label: "Gmail", color: "#E8593C", icon: <Mail size={12} /> },
  calendar_create: { label: "Calendar", color: "#0EA5E9", icon: <Calendar size={12} /> },
  github_create_issue: { label: "GitHub", color: "#8B5CF6", icon: <GitBranch size={12} /> },
  github_list_issues: { label: "GitHub", color: "#8B5CF6", icon: <GitBranch size={12} /> },
  github_review_pr: { label: "GitHub", color: "#8B5CF6", icon: <GitBranch size={12} /> },
};

const meta = (tool?: string) =>
  TOOL_META[tool?.toLowerCase() ?? ""] ?? {
    label: tool?.replace(/_/g, " ") ?? "Action",
    color: "#6B7280",
    icon: <Terminal size={12} />,
  };

const hhmm = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    completed: { bg: "bg-[#10B981]/10", fg: "text-[#10B981]", label: "Done" },
    failed: { bg: "bg-[#EF4444]/10", fg: "text-[#EF4444]", label: "Failed" },
  };
  const s = map[status] ?? { bg: "bg-[#E8593C]/10", fg: "text-[#E8593C]", label: "Pending" };
  return (
    <span
      className={`shrink-0 px-2 py-0.5 rounded-full font-sans text-[10px] font-bold uppercase tracking-wider ${s.bg} ${s.fg}`}
    >
      {s.label}
    </span>
  );
}

/* ── One run ─────────────────────────────────────────────────────────────── */
function RunRow({ action, defaultOpen }: { action: AgentAction; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [inspecting, setInspecting] = useState<number | null>(null);

  const created = new Date(action.createdAt);
  const tools = Array.from(new Set(action.actionsTaken.map((s) => s.tool?.toLowerCase()).filter(Boolean)));

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left flex items-center gap-3 px-5 py-3.5 hover:bg-[rgba(36,27,20,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)] transition-colors group"
      >
        <span className={`font-sans text-[12px] font-medium ${MUTED} w-[52px] shrink-0 tabular-nums`}>
          {hhmm(created)}
        </span>

        <span className="flex-1 min-w-0">
          <span className="block font-sans font-semibold text-[13.5px] text-[#241B14] dark:text-[#F4F4F5] truncate group-hover:text-[#E8593C] transition-colors">
            {action.command}
          </span>
          <span className="flex items-center gap-2 mt-1">
            <span className={`font-sans text-[11px] ${FAINT}`}>
              {created.toLocaleDateString([], { month: "short", day: "numeric" })}
            </span>
            {tools.map((t) => {
              const m = meta(t!);
              return (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 font-sans text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                  style={{ background: `${m.color}15`, color: m.color }}
                >
                  {m.icon}
                  {m.label}
                </span>
              );
            })}
          </span>
        </span>

        <StatusPill status={action.status} />

        <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.18 }} className={`${FAINT} shrink-0`}>
          <ChevronRight size={14} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 pl-[76px] flex flex-col gap-2.5">
              {action.actionsTaken.length === 0 && (
                <p className={`font-sans text-[12.5px] ${MUTED}`}>
                  {action.errorMessage || "No steps were logged for this run."}
                </p>
              )}

              {action.actionsTaken.map((step, idx) => {
                const m = meta(step.tool);
                const input = (step.input || {}) as Record<string, unknown>;
                const isOpen = inspecting === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-[12px] border border-[rgba(36,27,20,0.07)] dark:border-[rgba(255,255,255,0.07)] p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1.5 min-w-0">
                        <span style={{ color: m.color }} className="shrink-0">
                          {m.icon}
                        </span>
                        <span className="font-sans font-semibold text-[12.5px] text-[#241B14] dark:text-[#F4F4F5]">
                          {m.label}
                        </span>
                      </span>
                      <span className="flex items-center gap-3 shrink-0">
                        {step.executedAt && (
                          <span
                            className={`font-sans text-[11px] ${FAINT} tabular-nums`}
                            title={new Date(step.executedAt).toLocaleString()}
                          >
                            {new Date(step.executedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                        )}
                        <button
                          onClick={() => setInspecting(isOpen ? null : idx)}
                          className={`font-sans text-[11px] font-semibold ${MUTED} hover:text-[#E8593C] transition-colors`}
                        >
                          {isOpen ? "Hide" : "Inspect"}
                        </button>
                      </span>
                    </div>

                    <p className={`font-sans text-[12.5px] ${MUTED} mt-1 truncate`}>
                      {String(input.to || input.title || input.repoUrl || input.subject || "—")}
                    </p>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.pre
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className={`mt-2.5 overflow-x-auto font-mono text-[10.5px] leading-relaxed ${MUTED} whitespace-pre-wrap bg-[#FAF8F5] dark:bg-[#2C2C2C] rounded-[10px] p-3`}
                        >
                          {JSON.stringify({ input: step.input, output: step.output }, null, 2)}
                        </motion.pre>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {action.errorMessage && action.actionsTaken.length > 0 && (
                <p className="font-mono text-[11px] text-[#EF4444] whitespace-pre-wrap break-all bg-[#EF4444]/5 border border-[#EF4444]/15 rounded-[10px] p-3">
                  {action.errorMessage}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export function HistoryPanel() {
  const [history, setHistory] = useState<AgentAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "gmail" | "calendar" | "github">("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const res = await getAgentHistory(50);
      if (res.success && res.data) setHistory(res.data);
      setIsLoading(false);
    })();
  }, []);

  const filtered = history.filter((a) => {
    if (filter !== "all" && !a.actionsTaken.some((s) => s.tool?.toLowerCase().includes(filter))) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      if (!a.command.toLowerCase().includes(q) && !a.actionsTaken.some((s) => s.tool?.toLowerCase().includes(q)))
        return false;
    }
    return true;
  });

  const completed = history.filter((a) => a.status === "completed").length;
  const successRate = history.length ? Math.round((completed / history.length) * 100) : 100;

  return (
    <div className="flex-1 flex flex-col bg-[#FAF8F5] dark:bg-[#2C2C2C] overflow-y-auto min-w-0">

      {/* ── Full-width header bar ────────────────────────────────────────── */}
      <div className="min-h-[80px] bg-white dark:bg-[#383838] border-b border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] flex items-center justify-between gap-6 px-8 py-4 shrink-0">
        <div className="min-w-0">
          <h1 className="text-[22px] tracking-tight text-[#241B14] dark:text-[#F4F4F5]" style={SERIF}>
            History
          </h1>
          <p className={`font-sans text-[12.5px] ${MUTED} mt-0.5`}>
            {history.length === 0
              ? "Every command you run will appear here."
              : `${history.length} run${history.length === 1 ? "" : "s"} · ${successRate}% completed successfully.`}
          </p>
        </div>

        <div className={`h-[36px] w-[220px] hidden sm:flex ${CARD} items-center gap-2 px-3 focus-within:border-[#E8593C]/40 transition-colors shrink-0`}>
          <Search size={13} className={`${FAINT} shrink-0`} />
          <input
            type="text"
            placeholder="Search runs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent border-none outline-none font-sans text-[12px] text-[#241B14] dark:text-[#F4F4F5] placeholder:text-[rgba(36,27,20,0.35)] dark:placeholder:text-[rgba(255,255,255,0.35)] w-full"
          />
        </div>
      </div>

      {/* ── Full-width content ───────────────────────────────────────────── */}
      <div className="flex-1 p-8 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

        {/* Filters */}
        <div className="flex items-center gap-1 bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.06)] p-1 rounded-[10px] w-max">
          {(["all", "gmail", "calendar", "github"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-[8px] font-sans text-[12px] font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-white dark:bg-[#383838] shadow-sm text-[#241B14] dark:text-[#F4F4F5]"
                  : `${MUTED} hover:text-[#241B14] dark:hover:text-[#F4F4F5]`
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ── Feed ───────────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className={`${CARD} p-12`}>
            <AurenLoading text="Loading your history…" size="sm" />
          </div>
        ) : filtered.length === 0 ? (
          <div className={`${CARD} p-10 flex flex-col items-center text-center gap-2`}>
            <div className="w-12 h-12 rounded-[14px] bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.06)] flex items-center justify-center mb-1">
              <Clock size={20} className={FAINT} />
            </div>
            <p className="text-[17px] text-[#241B14] dark:text-[#F4F4F5]" style={SERIF}>
              {query || filter !== "all" ? "No matching runs" : "No history yet"}
            </p>
            <p className={`font-sans text-[13px] ${MUTED}`}>
              {query || filter !== "all"
                ? "Try a different search or filter."
                : "Run a command and it will show up here."}
            </p>
            {(query || filter !== "all") && (
              <button
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
                className={`mt-3 inline-flex items-center gap-1.5 font-sans text-[12.5px] ${MUTED} hover:text-[#E8593C] transition-colors`}
              >
                <RotateCcw size={12} />
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className={`${CARD} overflow-hidden`}>
            <div className={`divide-y ${DIVIDE}`}>
              {filtered.map((action, i) => (
                <RunRow key={action.id} action={action} defaultOpen={i === 0} />
              ))}
            </div>
          </div>
        )}

        <div className="h-2" />
      </div>
    </div>
  );
}
