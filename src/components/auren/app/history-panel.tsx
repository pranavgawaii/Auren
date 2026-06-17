"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, CheckCircle2, XCircle, Terminal, Mail, Calendar, 
  GitBranch, Search, ChevronRight, ChevronDown, Activity, 
  Eye, AlertCircle 
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

  const filteredHistory = history.filter((action) => {
    if (activeFilter !== "all") {
      const hasTool = action.actionsTaken.some(step => step.tool?.toLowerCase() === `${activeFilter}_send` || step.tool?.toLowerCase() === `${activeFilter}_create` || step.tool?.toLowerCase() === `${activeFilter}_create_issue`);
      const matchesCategory = action.actionsTaken.some(step => step.tool?.toLowerCase().includes(activeFilter));
      if (!hasTool && !matchesCategory) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesCommand = action.command.toLowerCase().includes(q);
      const matchesToolName = action.actionsTaken.some(step => step.tool?.toLowerCase().includes(q));
      if (!matchesCommand && !matchesToolName) return false;
    }
    return true;
  });

  const renderActionStep = (step: any, actionId: string, stepIdx: number) => {
    const tool = step.tool?.toLowerCase();
    const input = step.input || {};
    const output = step.output || null;
    const stepKey = `${actionId}-${stepIdx}`;
    const isInspecting = inspectingStepId[stepKey] || false;

    let toolIcon = <Terminal size={18} />;
    let toolName = "Custom Action";
    let iconBg = "bg-[rgba(36,27,20,0.08)] dark:bg-[rgba(255,255,255,0.15)] text-[#241B14] dark:text-[#F4F4F5]";

    if (tool === "gmail_send") {
      toolIcon = <Mail size={18} />;
      toolName = "Gmail Dispatch";
      iconBg = "bg-[#E8593C]/10 text-[#E8593C]";
    } else if (tool === "calendar_create") {
      toolIcon = <Calendar size={18} />;
      toolName = "Calendar Invite";
      iconBg = "bg-[#4285F4]/10 text-[#4285F4]";
    } else if (tool === "github_create_issue") {
      toolIcon = <GitBranch size={18} />;
      toolName = "GitHub Issue";
      iconBg = "bg-[#241B14]/10 text-[#241B14] dark:text-[#F4F4F5]";
    }

    return (
      <div className="w-full flex flex-col font-sans relative">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 shadow-sm border border-[rgba(36,27,20,0.04)] dark:border-[rgba(255,255,255,0.04)] ${iconBg}`}>
            {toolIcon}
          </div>
          
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[14px] text-[#241B14] dark:text-[#F4F4F5]">{toolName}</span>
              <button
                onClick={() => toggleInspect(stepKey)}
                className="flex items-center gap-1.5 text-[10px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] hover:text-[#E8593C] font-bold transition-colors uppercase tracking-widest bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.1)] hover:bg-[#E8593C]/10 px-2.5 py-1 rounded-full"
              >
                <Eye size={12} />
                <span>{isInspecting ? "Hide Raw" : "Inspect"}</span>
              </button>
            </div>

            <div className="mt-2 space-y-1">
              {tool === "gmail_send" && (
                <>
                  <div className="text-[13px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]">
                    To: <span className="font-semibold text-[#241B14] dark:text-[#F4F4F5]">{input.to || "Unknown Contact"}</span>
                  </div>
                  {input.subject && (
                    <div className="text-[16px] text-[#241B14] dark:text-[#F4F4F5] font-bold tracking-tight mt-1" style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>
                      &quot;{input.subject}&quot;
                    </div>
                  )}
                </>
              )}

              {tool === "calendar_create" && (
                <>
                  {input.title && (
                    <div className="text-[16px] text-[#241B14] dark:text-[#F4F4F5] font-bold tracking-tight" style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>
                      {input.title}
                    </div>
                  )}
                </>
              )}

              {tool === "github_create_issue" && (
                <>
                  {input.title && (
                    <div className="text-[16px] text-[#241B14] dark:text-[#F4F4F5] font-bold tracking-tight" style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>
                      {input.title}
                    </div>
                  )}
                  <div className="text-[11px] text-[#241B14] dark:text-[#F4F4F5] bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.1)] px-2 py-0.5 rounded-md w-max font-medium mt-1.5 border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)]">
                    {input.owner}/{input.repo}
                  </div>
                </>
              )}

              {tool !== "gmail_send" && tool !== "calendar_create" && tool !== "github_create_issue" && (
                <div className="font-mono text-[10px] text-[rgba(36,27,20,0.7)] dark:text-[rgba(255,255,255,0.7)] bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.1)] p-3 rounded-lg border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] overflow-x-auto shadow-inner mt-2">
                  {JSON.stringify(input)}
                </div>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isInspecting && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-4"
            >
              <div className="bg-[#241B14] p-4 rounded-xl font-mono text-[11px] space-y-3 shadow-inner">
                <div>
                  <span className="text-white/40 font-bold tracking-wider uppercase text-[9px] mb-1.5 block">Inputs payload</span>
                  <pre className="overflow-x-auto whitespace-pre-wrap text-[#EBE5DE] leading-relaxed bg-[#1A130E] border border-white/5 p-3 rounded-lg">
                    {JSON.stringify(input, null, 2)}
                  </pre>
                </div>
                {output && (
                  <div>
                    <span className="text-[#10B981]/70 font-bold tracking-wider uppercase text-[9px] mb-1.5 block">Outputs payload</span>
                    <pre className="overflow-x-auto whitespace-pre-wrap text-[#EBE5DE] leading-relaxed bg-[#1A130E] border border-white/5 p-3 rounded-lg">
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
    <div className="flex h-screen overflow-hidden bg-[#FAF8F5] dark:bg-[#2C2C2C] text-[#241B14] dark:text-[#F4F4F5] text-[13px] w-full font-sans antialiased">
      <aside className="w-[220px] border-r border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] flex flex-col bg-[#FAF8F5] dark:bg-[#2C2C2C] shrink-0 z-10 justify-between">
        <div className="flex flex-col">
          <div className="h-14 px-4 flex items-center border-b border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)]">
            <div className="flex items-center gap-2 font-medium text-[22px]" style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>
              History
            </div>
          </div>
          
          <div className="flex-1 py-4 px-3 flex flex-col gap-1">
            <button 
              onClick={() => setActiveFilter("all")}
              className={`flex items-center justify-between px-3 py-1.5 rounded-md transition-colors text-[12px] ${activeFilter === "all" ? "bg-white dark:bg-[#383838] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-sm font-medium text-[#241B14] dark:text-[#F4F4F5]" : "text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] hover:text-[#241B14] dark:text-[#F4F4F5] hover:bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.1)] border border-transparent"}`}
            >
              <div className="flex items-center gap-2.5">
                <Clock size={14} /> All Runs
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeFilter === "all" ? "bg-[#E8593C] text-white" : "bg-[rgba(36,27,20,0.08)] dark:bg-[rgba(255,255,255,0.15)] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]"}`}>
                {history.length}
              </span>
            </button>
            
            <button 
              onClick={() => setActiveFilter("gmail")}
              className={`flex items-center justify-between px-3 py-1.5 rounded-md transition-colors text-[12px] ${activeFilter === "gmail" ? "bg-white dark:bg-[#383838] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-sm font-medium text-[#241B14] dark:text-[#F4F4F5]" : "text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] hover:text-[#241B14] dark:text-[#F4F4F5] hover:bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.1)] border border-transparent"}`}
            >
              <div className="flex items-center gap-2.5">
                <Mail size={14} /> Gmail Tasks
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeFilter === "gmail" ? "bg-[#E8593C] text-white" : "bg-[rgba(36,27,20,0.08)] dark:bg-[rgba(255,255,255,0.15)] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]"}`}>
                {history.filter(a => a.actionsTaken.some(s => s.tool?.toLowerCase() === "gmail_send")).length}
              </span>
            </button>

            <button 
              onClick={() => setActiveFilter("calendar")}
              className={`flex items-center justify-between px-3 py-1.5 rounded-md transition-colors text-[12px] ${activeFilter === "calendar" ? "bg-white dark:bg-[#383838] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-sm font-medium text-[#241B14] dark:text-[#F4F4F5]" : "text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] hover:text-[#241B14] dark:text-[#F4F4F5] hover:bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.1)] border border-transparent"}`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar size={14} /> Calendar Tasks
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeFilter === "calendar" ? "bg-[#E8593C] text-white" : "bg-[rgba(36,27,20,0.08)] dark:bg-[rgba(255,255,255,0.15)] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]"}`}>
                {history.filter(a => a.actionsTaken.some(s => s.tool?.toLowerCase() === "calendar_create")).length}
              </span>
            </button>

            <button 
              onClick={() => setActiveFilter("github")}
              className={`flex items-center justify-between px-3 py-1.5 rounded-md transition-colors text-[12px] ${activeFilter === "github" ? "bg-white dark:bg-[#383838] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-sm font-medium text-[#241B14] dark:text-[#F4F4F5]" : "text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] hover:text-[#241B14] dark:text-[#F4F4F5] hover:bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.1)] border border-transparent"}`}
            >
              <div className="flex items-center gap-2.5">
                <GitBranch size={14} /> GitHub Tasks
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeFilter === "github" ? "bg-[#E8593C] text-white" : "bg-[rgba(36,27,20,0.08)] dark:bg-[rgba(255,255,255,0.15)] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]"}`}>
                {history.filter(a => a.actionsTaken.some(s => s.tool?.toLowerCase() === "github_create_issue")).length}
              </span>
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] flex flex-col gap-2">
          <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]">
            Execution Stats
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-[18px] font-bold text-[#241B14] dark:text-[#F4F4F5] tracking-tight leading-none">{history.length}</span>
              <span className="text-[9px] font-medium text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] mt-1">Total Runs</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[18px] font-bold text-[#10B981] tracking-tight leading-none">
                {history.length > 0 
                  ? Math.round((history.filter(a => a.status === "completed").length / history.length) * 100) 
                  : 100}%
              </span>
              <span className="text-[9px] font-medium text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] mt-1">Success Rate</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto z-10 relative bg-[#FAF8F5] dark:bg-[#2C2C2C]">
        
        <div className="absolute top-6 right-6 h-[38px] bg-white dark:bg-[#383838] rounded-[10px] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-sm flex items-center px-3 gap-2 w-[240px] focus-within:w-[280px] focus-within:border-[#E8593C]/50 focus-within:ring-2 focus-within:ring-[#E8593C]/20 transition-all duration-300 z-20">
          <Search size={16} className="text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] shrink-0" />
          <input 
            type="text" 
            placeholder="Search past logs..." 
            className="bg-transparent border-none outline-none font-sans text-[13px] text-[#241B14] dark:text-[#F4F4F5] placeholder:text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] hover:text-[#E8593C] transition-colors"
            >
              <XCircle size={16} />
            </button>
          )}
        </div>

        <div className="flex-1 p-6 pt-16 max-w-[800px] w-full mx-auto pb-20">
          <div className="flex flex-col gap-6">
            
            <div className="mb-4">
               <h2 className="text-[28px] tracking-tight text-[#241B14] dark:text-[#F4F4F5]" style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>
                 Action History
               </h2>
               <p className="font-sans text-[14px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] mt-1.5">Review the execution traces, payloads, and results of all Auren actions.</p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20 text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] text-[14px] font-sans bg-white dark:bg-[#383838] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[16px] shadow-sm">
                <Activity size={18} className="animate-spin text-[#E8593C]" />
                <span className="ml-2.5" style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>Loading logs workspace...</span>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] text-[14px] gap-4 font-sans bg-white dark:bg-[#383838] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[16px] shadow-sm">
                <ClockHistoryIcon size={40} className="text-auren-border-strong" />
                <p className="text-[18px] text-[#241B14] dark:text-[#F4F4F5]" style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>No matches in execution history.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredHistory.map((action) => {
                  const isExpanded = expandedIds[action.id] || false;
                  const uniqueTools = Array.from(new Set(action.actionsTaken.map(s => s.tool?.toLowerCase())));

                  return (
                    <div 
                      key={action.id}
                      className={`bg-white dark:bg-[#383838] rounded-[16px] overflow-hidden transition-all duration-300 border ${
                        isExpanded 
                          ? "border-[#E8593C]/30 shadow-md ring-4 ring-[#E8593C]/5" 
                          : "border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-sm hover:shadow-md hover:border-[rgba(36,27,20,0.15)] dark:border-[rgba(255,255,255,0.12)]"
                      }`}
                    >
                      <div 
                        onClick={() => toggleExpand(action.id)}
                        className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#FAF8F5] dark:bg-[#2C2C2C]/30 select-none"
                      >
                        <div className="flex-1 min-w-0 flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full shrink-0 flex items-center justify-center ${
                            action.status === "completed" 
                              ? "bg-[#10B981] shadow-[0_0_12px_rgba(16,185,129,0.5)]" 
                              : action.status === "failed" 
                              ? "bg-[#EF4444] shadow-[0_0_12px_rgba(239,68,68,0.5)]" 
                              : "bg-[#E8593C] animate-pulse shadow-[0_0_12px_rgba(232,89,60,0.5)]"
                          }`} />

                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h3 className="text-[15px] text-[#241B14] dark:text-[#F4F4F5] leading-snug truncate font-bold font-sans">
                              {action.command}
                            </h3>
                            <div className="flex items-center gap-2 font-medium text-[11px] text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] mt-1.5">
                              <span>
                                {new Date(action.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} &middot; {new Date(action.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {uniqueTools.length > 0 && (
                                <>
                                  <span className="text-[rgba(36,27,20,0.2)]">&bull;</span>
                                  <div className="flex items-center gap-1.5">
                                    {uniqueTools.map((t, idx) => (
                                      <span key={idx} className="bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.1)] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] px-1.5 py-0.5 rounded text-[9px] text-[#241B14] dark:text-[#F4F4F5] uppercase tracking-wider font-bold">
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
                          {action.status === "failed" && (
                            <span className="text-[10px] font-sans font-bold px-2.5 py-1 rounded-md bg-[#EF4444]/10 text-[#EF4444] uppercase tracking-wider border border-[#EF4444]/20">
                              Failed
                            </span>
                          )}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isExpanded ? "bg-[#E8593C]/10 text-[#E8593C]" : "bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.1)] text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]"}`}>
                            {isExpanded ? (
                              <ChevronDown size={18} />
                            ) : (
                              <ChevronRight size={18} />
                            )}
                          </div>
                        </div>
                      </div>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                          >
                            <div className="p-5 bg-[#FAF8F5] dark:bg-[#2C2C2C]/80 border-t border-[rgba(36,27,20,0.04)] dark:border-[rgba(255,255,255,0.04)] shadow-inner">
                              {action.actionsTaken.length > 0 ? (
                                <div className="flex flex-col gap-3">
                                  {action.actionsTaken.map((step, idx) => (
                                    <div key={idx} className="bg-white dark:bg-[#383838] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[12px] p-4 shadow-sm hover:shadow-md transition-shadow">
                                      {renderActionStep(step, action.id, idx)}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex items-center gap-3 text-[13px] text-[#241B14] dark:text-[#F4F4F5] p-4 bg-white dark:bg-[#383838] rounded-[12px] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-sm">
                                  <Activity size={16} className="text-[#E8593C] animate-spin" />
                                  <span style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>
                                    {action.status === "pending" ? "Auren is processing intent..." : action.errorMessage || "No execution steps logged."}
                                  </span>
                                </div>
                              )}

                              {action.errorMessage && (
                                <div className="mt-4 border border-[#EF4444]/20 bg-[#EF4444]/5 p-4 rounded-[12px] text-[12px] text-[#EF4444] font-sans flex items-start gap-3 shadow-sm">
                                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                  <div className="space-y-1.5 w-full">
                                    <div className="font-bold tracking-wider uppercase text-[10px]">Execution Error Trace</div>
                                    <div className="font-mono text-[10px] break-all leading-relaxed bg-white dark:bg-[#383838] border border-[#EF4444]/10 p-3 rounded-lg w-full shadow-inner">{action.errorMessage}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
