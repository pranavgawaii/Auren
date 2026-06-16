"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, CheckCircle2, XCircle, Terminal, Mail, Calendar, 
  GitBranch, Search, ChevronRight, ChevronDown, Activity, 
  HelpCircle, Eye, AlertCircle, Sparkles, Filter 
} from "lucide-react";
import { getAgentHistory } from "@/app/actions/history";
import type { AgentAction } from "@/types";
import { ClockHistoryIcon } from "./app-shell";

export function HistoryPanel() {
  const [history, setHistory] = useState<AgentAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "gmail" | "calendar" | "github">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [inspectingStepId, setInspectingStepId] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadHistory() {
      setIsLoading(true);
      const res = await getAgentHistory(50);
      if (res.success && res.data) {
        setHistory(res.data);
        // Expand the most recent run by default
        if (res.data.length > 0) {
          setExpandedIds({ [res.data[0].id]: true });
        }
      }
      setIsLoading(false);
    }
    loadHistory();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleInspect = (stepKey: string) => {
    setInspectingStepId(prev => ({ ...prev, [stepKey]: !prev[stepKey] }));
  };

  // Filters logic
  const filteredHistory = history.filter((action) => {
    // 1. Sidebar filter
    if (activeFilter !== "all") {
      const hasTool = action.actionsTaken.some(step => step.tool?.toLowerCase() === `${activeFilter}_send` || step.tool?.toLowerCase() === `${activeFilter}_create` || step.tool?.toLowerCase() === `${activeFilter}_create_issue`);
      // Fallback matching
      const matchesCategory = action.actionsTaken.some(step => step.tool?.toLowerCase().includes(activeFilter));
      if (!hasTool && !matchesCategory) return false;
    }
    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesCommand = action.command.toLowerCase().includes(q);
      const matchesToolName = action.actionsTaken.some(step => step.tool?.toLowerCase().includes(q));
      if (!matchesCommand && !matchesToolName) return false;
    }
    return true;
  });

  // Render detail fields for steps
  const renderActionStep = (step: any, actionId: string, stepIdx: number) => {
    const tool = step.tool?.toLowerCase();
    const input = step.input || {};
    const output = step.output || null;
    const stepKey = `${actionId}-${stepIdx}`;
    const isInspecting = inspectingStepId[stepKey] || false;

    // Resolve icons and tool details
    let toolIcon = <Terminal size={12} />;
    let toolName = "Custom Action";
    let accentColor = "text-[rgba(36,27,20,0.6)]";
    let badgeBg = "bg-[rgba(36,27,20,0.04)] border-[rgba(36,27,20,0.06)]";

    if (tool === "gmail_send") {
      toolIcon = <Mail size={12} />;
      toolName = "Gmail Dispatch";
      accentColor = "text-[#EA4335]";
      badgeBg = "bg-[#EA4335]/5 border-[#EA4335]/10 text-[#EA4335]";
    } else if (tool === "calendar_create") {
      toolIcon = <Calendar size={12} />;
      toolName = "Calendar Invite";
      accentColor = "text-[#4285F4]";
      badgeBg = "bg-[#4285F4]/5 border-[#4285F4]/10 text-[#4285F4]";
    } else if (tool === "github_create_issue") {
      toolIcon = <GitBranch size={12} />;
      toolName = "GitHub Issue";
      accentColor = "text-[#241B14]";
      badgeBg = "bg-[rgba(36,27,20,0.04)] border-[rgba(36,27,20,0.06)] text-[#241B14]";
    }

    let dateStr = "";
    try {
      if (input.startAt) {
        dateStr = new Date(input.startAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
      }
    } catch {}

    return (
      <div className="w-full flex flex-col gap-2 font-sans">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 border rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${badgeBg}`}>
              {toolIcon}
              {toolName}
            </span>
          </div>

          <button
            onClick={() => toggleInspect(stepKey)}
            className="flex items-center gap-1 text-[10px] text-[rgba(36,27,20,0.4)] hover:text-[#E8593C] font-semibold transition-colors"
          >
            <Eye size={10} />
            <span>{isInspecting ? "Hide Raw JSON" : "Inspect JSON"}</span>
          </button>
        </div>

        {/* Content Field Layouts */}
        <div className="pl-2.5 pt-0.5 space-y-2">
          {tool === "gmail_send" && (
            <div className="space-y-1.5">
              <div className="text-[11px] text-[rgba(36,27,20,0.6)]">
                Recipient: <span className="font-mono text-[#241B14] font-semibold bg-[rgba(36,27,20,0.03)] px-1.5 py-0.5 rounded border border-[rgba(36,27,20,0.02)]">{input.to || "Unknown Contact"}</span>
              </div>
              {input.subject && (
                <div className="text-[12.5px] text-[#241B14] font-bold tracking-tight">
                  {input.subject}
                </div>
              )}
              {input.body && (
                <p className="text-[11.5px] text-[rgba(36,27,20,0.5)] leading-relaxed italic border-l-2 border-[rgba(36,27,20,0.08)] pl-2.5">
                  &ldquo;{input.body}&rdquo;
                </p>
              )}
            </div>
          )}

          {tool === "calendar_create" && (
            <div className="space-y-1.5">
              {input.title && (
                <div className="text-[12.5px] text-[#241B14] font-bold tracking-tight">
                  {input.title}
                </div>
              )}
              {dateStr && (
                <div className="text-[10px] text-[#4285F4] font-mono font-medium bg-[#4285F4]/5 border border-[#4285F4]/10 rounded px-2 py-0.5 w-max">
                  {dateStr}
                </div>
              )}
            </div>
          )}

          {tool === "github_create_issue" && (
            <div className="space-y-1.5">
              {input.title && (
                <div className="text-[12.5px] text-[#241B14] font-bold tracking-tight">
                  {input.title}
                </div>
              )}
              <div className="text-[10px] text-[rgba(36,27,20,0.65)] bg-[rgba(36,27,20,0.03)] border border-[rgba(36,27,20,0.06)] px-2 py-0.5 rounded w-max font-mono">
                Target: {input.owner}/{input.repo}
              </div>
            </div>
          )}

          {tool !== "gmail_send" && tool !== "calendar_create" && tool !== "github_create_issue" && (
            <div className="font-mono text-[10px] text-[rgba(36,27,20,0.7)] bg-[rgba(36,27,20,0.02)] p-2.5 rounded border border-[rgba(36,27,20,0.04)] overflow-x-auto">
              {JSON.stringify(input)}
            </div>
          )}
        </div>

        {/* Collapsible raw JSON inspector */}
        <AnimatePresence>
          {isInspecting && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-1 pl-2.5"
            >
              <div className="bg-[#FAF6F0]/60 border border-[rgba(36,27,20,0.06)] p-3 rounded-lg font-mono text-[9px] text-[rgba(36,27,20,0.75)] space-y-2">
                <div>
                  <span className="text-[#E8593C] font-semibold">Inputs:</span>
                  <pre className="overflow-x-auto whitespace-pre-wrap mt-0.5 text-[8.5px] leading-relaxed bg-white border border-[rgba(36,27,20,0.04)] p-2 rounded">
                    {JSON.stringify(input, null, 2)}
                  </pre>
                </div>
                {output && (
                  <div>
                    <span className="text-emerald-700 font-semibold">Outputs:</span>
                    <pre className="overflow-x-auto whitespace-pre-wrap mt-0.5 text-[8.5px] leading-relaxed bg-white border border-[rgba(36,27,20,0.04)] p-2 rounded">
                      {JSON.stringify(output, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex-1 flex bg-[#FAF8F5] overflow-hidden">
      {/* Sidebar */}
      <div className="w-[260px] bg-white border-r border-[rgba(36,27,20,0.08)] p-6 shrink-0 flex flex-col justify-between select-none">
        <div className="flex flex-col gap-8">
          <div>
            <h2 style={{ fontFamily: "var(--font-civane, Georgia, serif)" }} className="text-[20px] text-[#241B14] tracking-tight mb-5 flex items-center gap-2">
              <ClockHistoryIcon size={18} className="text-[#E8593C]" />
              <span>History</span>
            </h2>
            
            <div className="flex flex-col gap-1">
              <button 
                onClick={() => setActiveFilter("all")}
                className={`flex items-center justify-between px-3 py-2.5 rounded-[8px] font-sans font-semibold text-[12.5px] transition-colors ${activeFilter === "all" ? "bg-[rgba(232,89,60,0.08)] text-[#E8593C]" : "text-[rgba(36,27,20,0.6)] hover:bg-[rgba(36,27,20,0.04)] hover:text-[#241B14]"}`}
              >
                <div className="flex items-center gap-2">
                  <Clock size={14} className="opacity-70" />
                  All Runs
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium ${activeFilter === "all" ? "bg-[#E8593C]/10 text-[#E8593C]" : "bg-[rgba(36,27,20,0.04)] text-[rgba(36,27,20,0.5)]"}`}>
                  {history.length}
                </span>
              </button>
              
              <button 
                onClick={() => setActiveFilter("gmail")}
                className={`flex items-center justify-between px-3 py-2.5 rounded-[8px] font-sans font-semibold text-[12.5px] transition-colors ${activeFilter === "gmail" ? "bg-[rgba(232,89,60,0.08)] text-[#E8593C]" : "text-[rgba(36,27,20,0.6)] hover:bg-[rgba(36,27,20,0.04)] hover:text-[#241B14]"}`}
              >
                <div className="flex items-center gap-2">
                  <Mail size={14} className="opacity-70" />
                  Gmail Tasks
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium ${activeFilter === "gmail" ? "bg-[#E8593C]/10 text-[#E8593C]" : "bg-[rgba(36,27,20,0.04)] text-[rgba(36,27,20,0.5)]"}`}>
                  {history.filter(a => a.actionsTaken.some(s => s.tool?.toLowerCase() === "gmail_send")).length}
                </span>
              </button>

              <button 
                onClick={() => setActiveFilter("calendar")}
                className={`flex items-center justify-between px-3 py-2.5 rounded-[8px] font-sans font-semibold text-[12.5px] transition-colors ${activeFilter === "calendar" ? "bg-[rgba(232,89,60,0.08)] text-[#E8593C]" : "text-[rgba(36,27,20,0.6)] hover:bg-[rgba(36,27,20,0.04)] hover:text-[#241B14]"}`}
              >
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="opacity-70" />
                  Calendar Tasks
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium ${activeFilter === "calendar" ? "bg-[#E8593C]/10 text-[#E8593C]" : "bg-[rgba(36,27,20,0.04)] text-[rgba(36,27,20,0.5)]"}`}>
                  {history.filter(a => a.actionsTaken.some(s => s.tool?.toLowerCase() === "calendar_create")).length}
                </span>
              </button>

              <button 
                onClick={() => setActiveFilter("github")}
                className={`flex items-center justify-between px-3 py-2.5 rounded-[8px] font-sans font-semibold text-[12.5px] transition-colors ${activeFilter === "github" ? "bg-[rgba(232,89,60,0.08)] text-[#E8593C]" : "text-[rgba(36,27,20,0.6)] hover:bg-[rgba(36,27,20,0.04)] hover:text-[#241B14]"}`}
              >
                <div className="flex items-center gap-2">
                  <GitBranch size={14} className="opacity-70" />
                  GitHub Tasks
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium ${activeFilter === "github" ? "bg-[#E8593C]/10 text-[#E8593C]" : "bg-[rgba(36,27,20,0.04)] text-[rgba(36,27,20,0.5)]"}`}>
                  {history.filter(a => a.actionsTaken.some(s => s.tool?.toLowerCase() === "github_create_issue")).length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom stats card */}
        <div className="bg-[#FAF6F0] border border-[rgba(36,27,20,0.06)] rounded-[12px] p-4 flex flex-col gap-3">
          <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-[rgba(36,27,20,0.4)]">
            Execution Stats
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-[20px] font-bold text-[#241B14] tracking-tight leading-none">{history.length}</span>
              <span className="text-[9px] text-[rgba(36,27,20,0.5)] mt-1.5">Total Runs</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[20px] font-bold text-[#0F6E56] tracking-tight leading-none">
                {history.length > 0 
                  ? Math.round((history.filter(a => a.status === "completed").length / history.length) * 100) 
                  : 100}%
              </span>
              <span className="text-[9px] text-[rgba(36,27,20,0.5)] mt-1.5">Success Rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main panel */}
      <div className="flex-1 flex flex-col bg-[#FAF8F5] overflow-hidden">
        {/* Top Control Bar */}
        <div className="h-[56px] border-b border-[rgba(36,27,20,0.08)] bg-white px-8 flex items-center justify-between shrink-0 select-none">
          <h1 style={{ fontFamily: "var(--font-civane, Georgia, serif)" }} className="text-[20px] text-[#241B14] font-medium tracking-tight">
            Activity Logs Workspace
          </h1>

          {/* Search bar inside header */}
          <div className="h-[32px] bg-[#FAF8F5] rounded-[8px] border border-[rgba(36,27,20,0.05)] flex items-center px-3 gap-2 w-[240px] focus-within:w-[280px] focus-within:border-[#E8593C] transition-all duration-200">
            <Search size={13} className="text-[rgba(36,27,20,0.35)] shrink-0" />
            <input 
              type="text" 
              placeholder="Search past logs..." 
              className="bg-transparent border-none outline-none font-sans text-[11.5px] text-[#241B14] placeholder:text-[rgba(36,27,20,0.35)] w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="text-[rgba(36,27,20,0.3)] hover:text-[#241B14] transition-colors"
              >
                <XCircle size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable feed */}
        <div className="flex-1 overflow-y-auto p-10">
          <div className="max-w-[720px] mx-auto flex flex-col gap-5">
            {isLoading ? (
              <div className="flex items-center justify-center py-20 text-[rgba(36,27,20,0.4)] text-[13px] font-sans bg-white border border-[rgba(36,27,20,0.05)] rounded-2xl shadow-sm">
                <Activity size={18} className="animate-spin text-[#E8593C]" />
                <span className="ml-2">Loading logs workspace...</span>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-[rgba(36,27,20,0.4)] text-[13px] gap-3 font-sans bg-white border border-[rgba(36,27,20,0.08)] rounded-[16px] shadow-sm">
                <ClockHistoryIcon size={32} className="text-[rgba(36,27,20,0.3)]" />
                <p>No matches in execution history.</p>
              </div>
            ) : (
              filteredHistory.map((action) => {
                const isExpanded = expandedIds[action.id] || false;
                const dominantTool = action.actionsTaken[0]?.tool?.toLowerCase();
                
                // Color accent borders
                let stripeBg = "bg-[rgba(36,27,20,0.12)]";
                let stripeText = "text-[rgba(36,27,20,0.7)]";
                if (dominantTool === "gmail_send") {
                  stripeBg = "bg-[#EA4335]";
                  stripeText = "text-[#EA4335]";
                } else if (dominantTool === "calendar_create") {
                  stripeBg = "bg-[#4285F4]";
                  stripeText = "text-[#4285F4]";
                } else if (dominantTool === "github_create_issue") {
                  stripeBg = "bg-[#241B14]";
                  stripeText = "text-[#241B14]";
                }

                // Render list of executed tool types in badge
                const uniqueTools = Array.from(new Set(action.actionsTaken.map(s => s.tool?.toLowerCase())));

                return (
                  <div 
                    key={action.id}
                    className="bg-white border border-[rgba(36,27,20,0.05)] rounded-[16px] shadow-[0_2px_12px_rgba(36,27,20,0.015)] overflow-hidden transition-all duration-200"
                  >
                    {/* Accordion Trigger Header */}
                    <div 
                      onClick={() => toggleExpand(action.id)}
                      className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-[rgba(36,27,20,0.01)] select-none relative"
                    >
                      {/* Accent stripe */}
                      <div className={`absolute top-0 bottom-0 left-0 w-[4.5px] ${stripeBg}`} />
                      
                      <div className="pl-2.5 flex-1 min-w-0 flex items-center gap-3">
                        {/* Status Light */}
                        <div className={`w-2 h-2 rounded-full shrink-0 ${
                          action.status === "completed" 
                            ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" 
                            : action.status === "failed" 
                            ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" 
                            : "bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                        }`} />

                        <div className="flex-1 min-w-0 space-y-0.5">
                          <h3 className="font-sans font-bold text-[13.5px] text-[#241B14] leading-snug truncate">
                            {action.command}
                          </h3>
                          <div className="flex items-center gap-2 font-mono text-[9px] text-[rgba(36,27,20,0.4)]">
                            <span>
                              {new Date(action.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} &middot; {new Date(action.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {uniqueTools.length > 0 && (
                              <>
                                <span>&middot;</span>
                                <div className="flex items-center gap-1">
                                  {uniqueTools.map((t, idx) => (
                                    <span key={idx} className="bg-[rgba(36,27,20,0.04)] border border-[rgba(36,27,20,0.04)] px-1 py-0.5 rounded capitalize text-[8px] text-[rgba(36,27,20,0.5)]">
                                      {t?.replace(/_/g, " ")}
                                    </span>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded-full border ${
                          action.status === "completed" 
                            ? "bg-emerald-50 border-emerald-500/10 text-emerald-700" 
                            : action.status === "failed" 
                            ? "bg-red-50 border-red-500/10 text-red-700" 
                            : "bg-indigo-50 border-indigo-500/10 text-indigo-700"
                        }`}>
                          {action.status === "completed" ? "Success" : action.status === "failed" ? "Failed" : "Running"}
                        </span>
                        
                        {isExpanded ? (
                          <ChevronDown size={16} className="text-[rgba(36,27,20,0.4)]" />
                        ) : (
                          <ChevronRight size={16} className="text-[rgba(36,27,20,0.4)]" />
                        )}
                      </div>
                    </div>

                    {/* Accordion Expansion Block */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="overflow-hidden border-t border-[rgba(36,27,20,0.04)]"
                        >
                          <div className="p-6 bg-[#FCFAF7] space-y-5 relative">
                            {/* Connector line for trace flow */}
                            {action.actionsTaken.length > 1 && (
                              <div className="absolute left-[36px] top-6 bottom-6 w-px bg-[rgba(36,27,20,0.06)] z-0" />
                            )}

                            {/* Detailed steps list */}
                            {action.actionsTaken.length > 0 ? (
                              <div className="flex flex-col gap-5 relative z-10">
                                {action.actionsTaken.map((step, idx) => (
                                  <div key={idx} className="flex gap-4 items-start">
                                    {/* Small trace dot on connector line */}
                                    <div className="w-[20px] h-[20px] shrink-0 rounded-full bg-white border border-[rgba(36,27,20,0.1)] flex items-center justify-center shadow-sm text-[8px] font-mono text-[rgba(36,27,20,0.5)]">
                                      {idx + 1}
                                    </div>
                                    <div className="flex-1 bg-white border border-[rgba(36,27,20,0.04)] rounded-[12px] p-4 shadow-[0_1px_4px_rgba(36,27,20,0.01)]">
                                      {renderActionStep(step, action.id, idx)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2.5 text-[12px] text-[rgba(36,27,20,0.5)] pl-2.5">
                                <AlertCircle size={14} className="text-[#E8593C]" />
                                <span>
                                  {action.status === "pending" ? "Auren is processing intent..." : action.errorMessage || "No execution steps logged."}
                                </span>
                              </div>
                            )}

                            {/* Error Message Trace */}
                            {action.errorMessage && (
                              <div className="pl-2.5 border-l-2 border-l-red-500 bg-red-500/5 p-3 rounded-r-lg text-[11px] text-red-700 font-sans flex items-start gap-2">
                                <AlertCircle size={12} className="mt-[2px] shrink-0" />
                                <div className="space-y-0.5">
                                  <div className="font-bold">Execution Error Trace:</div>
                                  <div className="font-mono text-[10px] break-all">{action.errorMessage}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
