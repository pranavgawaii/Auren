"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, Check, Play, MessageSquare, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentReasoningResult } from "@/types";
import { RangeCalendar } from "@/components/ui/calendar-rac";
import { TimePicker } from "@/components/ui/time-rac";
import { parseDate, Time } from "@internationalized/date";
import type { DateRange } from "react-aria-components";
interface ActionConfirmationProps {
  isOpen: boolean;
  plan: AgentReasoningResult | null;
  onConfirm: (finalPlan: AgentReasoningResult) => void;
  onCancel: () => void;
  isExecuting?: boolean;
  onClarify?: (text: string) => void;
}

export function ActionConfirmation({
  isOpen,
  plan,
  onConfirm,
  onCancel,
  isExecuting,
  onClarify,
}: ActionConfirmationProps) {
  const [editedPlan, setEditedPlan] = useState<AgentReasoningResult | null>(null);
  const [enabledActions, setEnabledActions] = useState<boolean[]>([]);
  const [clarificationText, setClarificationText] = useState("");
  const [panelSize, setPanelSize] = useState({ width: 640, height: typeof window !== 'undefined' ? window.innerHeight * 0.85 : 800 });
  const [isResizing, setIsResizing] = useState(false);
  const [isSubmittingClarification, setIsSubmittingClarification] = useState(false);
  const [expandedActions, setExpandedActions] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (plan) {
      const clonedPlan = JSON.parse(JSON.stringify(plan));
      
      // Auto-fill missing dates to prevent Bad Request from Google API
      clonedPlan.actions.forEach((a: any) => {
        if (!a.parameters) a.parameters = {};
        if (!a.tool) a.tool = "unknown_tool";
        
        if (a.tool === "calendar_create") {
          if (!a.parameters.startAt) {
            const now = new Date();
            now.setMinutes(Math.ceil(now.getMinutes() / 30) * 30);
            a.parameters.startAt = now.toISOString();
          }
          if (!a.parameters.endAt) {
            const end = new Date(a.parameters.startAt);
            end.setHours(end.getHours() + 1);
            a.parameters.endAt = end.toISOString();
          }
        }
      });

      setEditedPlan(clonedPlan);
      setEnabledActions(clonedPlan.actions.map(() => true));
      setClarificationText("");
      setIsSubmittingClarification(false);
    } else {
      setEditedPlan(null);
      setEnabledActions([]);
    }
  }, [plan]);

  const startResize = React.useCallback((e: React.MouseEvent, direction: 'tl' | 'tr' | 't') => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = panelSize.width;
    const startHeight = panelSize.height;

    const doResize = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = startY - moveEvent.clientY; // Dragging UP increases height
      
      let newWidth = startWidth;
      if (direction === 'tr') newWidth = startWidth + deltaX * 2;
      else if (direction === 'tl') newWidth = startWidth - deltaX * 2;
      
      const newHeight = startHeight + deltaY;
      
      setPanelSize({
        width: Math.max(400, Math.min(1200, newWidth)),
        height: Math.max(300, Math.min(typeof window !== 'undefined' ? window.innerHeight - 40 : 1000, newHeight)),
      });
    };

    const stopResize = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", doResize);
      document.removeEventListener("mouseup", stopResize);
    };

    document.addEventListener("mousemove", doResize);
    document.addEventListener("mouseup", stopResize);
  }, [panelSize]);

  if (!isOpen) return null;

  const toggleAction = (index: number) => {
    setEnabledActions(prev => {
      const newArr = [...prev];
      newArr[index] = !newArr[index];
      return newArr;
    });
  };

  const toggleExpand = (index: number) => {
    setExpandedActions(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const updateParam = (actionIndex: number, paramKey: string, value: any) => {
    if (!editedPlan) return;
    const nextActions = [...editedPlan.actions];
    nextActions[actionIndex].parameters[paramKey] = value;
    setEditedPlan({ ...editedPlan, actions: nextActions });
  };

  const handleConfirmSubmit = () => {
    if (!editedPlan) return;
    const finalActions = editedPlan.actions.filter((_, i) => enabledActions[i]);
    onConfirm({
      ...editedPlan,
      actions: finalActions,
    });
  };

  const handleClarifySubmit = async () => {
    if (!clarificationText.trim() || !onClarify) return;
    setIsSubmittingClarification(true);
    await onClarify(clarificationText);
    setClarificationText("");
    setIsSubmittingClarification(false);
  };

  const hasActions = plan?.actions && plan.actions.length > 0;
  const anyActionEnabled = enabledActions.some(Boolean);

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[rgba(36,27,20,0.15)] backdrop-blur-[4px] transition-opacity"
        onClick={onCancel}
      />

      {/* Sheet panel */}
      <div 
        style={{ width: panelSize.width, height: panelSize.height }}
        className="relative max-w-full mx-auto bg-[#FDFBF9] dark:bg-[#2C2C2C] rounded-t-[24px] border-t border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-[0_-12px_48px_rgba(36,27,20,0.12)] p-6 z-10 animate-in slide-in-from-bottom-12 duration-300 flex flex-col gap-4 overflow-hidden text-left transition-none"
      >
        {/* Resize handles */}
        <div 
          className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize z-20"
          onMouseDown={(e) => startResize(e, 't')}
        />
        <div 
          className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize z-30"
          onMouseDown={(e) => startResize(e, 'tl')}
        />
        <div 
          className="absolute top-0 right-0 w-4 h-4 cursor-nesw-resize z-30"
          onMouseDown={(e) => startResize(e, 'tr')}
        />
        
        {/* Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#E8593C] animate-pulse" />
            <h3 
              className="font-bold text-[18px] text-[#241B14] dark:text-[#F4F4F5] tracking-tight"
              style={{ fontFamily: "var(--font-civane), sans-serif" }}
            >
              Execution Plan
            </h3>
          </div>
        </div>

        {/* Explanation */}
        {plan?.explanation && (
          <div className="bg-[rgba(251,243,236,0.5)] dark:bg-[rgba(255,255,255,0.04)] border border-[rgba(36,27,20,0.04)] dark:border-[rgba(255,255,255,0.04)] rounded-[12px] p-4 font-sans text-[13px] text-[#241B14] dark:text-[#F4F4F5] leading-[1.6]">
            {plan.explanation}
          </div>
        )}

        {/* Actions Checklist */}
        <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-4 min-h-0 pr-1">
          {hasActions && editedPlan && (
            <div className="flex flex-col gap-3">
              <span className="font-sans font-semibold text-[11px] text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] uppercase tracking-wider">
              Integrations Checklist & Parameters
            </span>
            <div className="flex flex-col gap-3">
              {editedPlan.actions.map((action, i) => {
                const isEnabled = enabledActions[i];
                return (
                  <div 
                    key={i} 
                    className={cn(
                      "border rounded-[14px] p-4 transition-all duration-200 bg-white dark:bg-[#383838]",
                      isEnabled 
                        ? "border-[rgba(232,89,60,0.2)] shadow-sm shadow-[rgba(232,89,60,0.02)]" 
                        : "border-[rgba(36,27,20,0.06)] dark:border-[rgba(255,255,255,0.06)] opacity-60 bg-[rgba(36,27,20,0.01)]"
                    )}
                  >
                    {/* Header line with checkbox */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleAction(i)}
                          className={cn(
                            "w-5 h-5 rounded-[6px] border flex items-center justify-center transition-colors shrink-0",
                            isEnabled 
                              ? "bg-[#E8593C] border-[#E8593C] text-white" 
                              : "border-[rgba(36,27,20,0.18)] text-transparent hover:border-[#E8593C]"
                          )}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                        <div className="flex flex-col">
                          <span className="font-sans font-bold text-[13px] text-[#241B14] dark:text-[#F4F4F5] capitalize">
                            {(action.tool || "Action").replace(/_/g, " ")}
                          </span>
                          <span className="font-sans text-[11px] text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]">
                            {action.description}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleExpand(i)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-[6px] transition-colors hover:bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.04)] text-[11px] font-sans font-semibold text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)] hover:text-[rgba(36,27,20,0.7)] dark:text-[rgba(255,255,255,0.7)]"
                      >
                        {expandedActions[i] ? (
                          <>Hide Details <ChevronUp className="w-3.5 h-3.5" /></>
                        ) : (
                          <>Edit Details <ChevronDown className="w-3.5 h-3.5" /></>
                        )}
                      </button>
                    </div>

                    {/* Editable fields if enabled and expanded */}
                    {isEnabled && expandedActions[i] && (
                      <div className="pl-8 flex flex-col gap-2.5 mt-1 pt-2 border-t border-[rgba(36,27,20,0.04)] dark:border-[rgba(255,255,255,0.04)]">
                        {action.tool === "gmail_send" && (
                          <>
                            <div className="flex flex-col gap-1">
                              <label className="font-sans text-[10px] font-semibold text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)]">To</label>
                              <input 
                                type="text"
                                className="border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FAF8F5] dark:bg-[#2C2C2C] rounded-[6px] px-2.5 py-1 text-[12px] font-sans text-[#241B14] dark:text-[#F4F4F5] focus:outline-[#E8593C]"
                                value={String(action.parameters.to || "")}
                                onChange={(e) => updateParam(i, "to", e.target.value)}
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="font-sans text-[10px] font-semibold text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)]">Subject</label>
                              <input 
                                type="text"
                                className="border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FAF8F5] dark:bg-[#2C2C2C] rounded-[6px] px-2.5 py-1 text-[12px] font-sans text-[#241B14] dark:text-[#F4F4F5] focus:outline-[#E8593C]"
                                value={String(action.parameters.subject || "")}
                                onChange={(e) => updateParam(i, "subject", e.target.value)}
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="font-sans text-[10px] font-semibold text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)]">Email Draft Body</label>
                              <textarea 
                                rows={3}
                                className="border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FAF8F5] dark:bg-[#2C2C2C] rounded-[6px] px-2.5 py-1 text-[12px] font-sans text-[#241B14] dark:text-[#F4F4F5] focus:outline-[#E8593C] resize-none"
                                value={String(action.parameters.body || "")}
                                onChange={(e) => updateParam(i, "body", e.target.value)}
                              />
                            </div>
                          </>
                        )}

                        {action.tool === "calendar_create" && (
                          <>
                            <div className="flex flex-col gap-1">
                              <label className="font-sans text-[10px] font-semibold text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)]">Event Title</label>
                              <input 
                                type="text"
                                className="border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FAF8F5] dark:bg-[#2C2C2C] rounded-[6px] px-2.5 py-1 text-[12px] font-sans text-[#241B14] dark:text-[#F4F4F5] focus:outline-[#E8593C]"
                                value={String(action.parameters.title || "")}
                                onChange={(e) => updateParam(i, "title", e.target.value)}
                              />
                            </div>
                            <div className="flex flex-col gap-3">
                              <label className="font-sans text-[11px] font-semibold text-[rgba(36,27,20,0.6)] dark:text-[rgba(255,255,255,0.6)] uppercase tracking-wider">Date & Time Range</label>
                              
                              <div className="flex justify-center p-3 border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[#383838] rounded-[12px] shadow-sm">
                                <RangeCalendar
                                  className="[&_td]:px-0"
                                  value={(() => {
                                    try {
                                      const s = String(action.parameters.startAt || "");
                                      const e = String(action.parameters.endAt || "");
                                      if (!s || !e) return null;
                                      const sDate = s.includes('T') ? s.split('T')[0] : s;
                                      const eDate = e.includes('T') ? e.split('T')[0] : e;
                                      if (!/^\d{4}-\d{2}-\d{2}$/.test(sDate) || !/^\d{4}-\d{2}-\d{2}$/.test(eDate)) return null;
                                      return {
                                        start: parseDate(sDate),
                                        end: parseDate(eDate)
                                      };
                                    } catch {
                                      return null;
                                    }
                                  })()}
                                  onChange={(range) => {
                                    if (!range) return;
                                    const startD = new Date(String(action.parameters.startAt || new Date().toISOString()));
                                    const endD = new Date(String(action.parameters.endAt || new Date().toISOString()));
                                    
                                    const [sy, sm, sd] = range.start.toString().split('-');
                                    const [ey, em, ed] = range.end.toString().split('-');
                                    
                                    startD.setFullYear(parseInt(sy), parseInt(sm)-1, parseInt(sd));
                                    endD.setFullYear(parseInt(ey), parseInt(em)-1, parseInt(ed));
                                    
                                    updateParam(i, "startAt", startD.toISOString());
                                    updateParam(i, "endAt", endD.toISOString());
                                  }}
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2 mt-1">
                                <div className="flex flex-col gap-1">
                                  <label className="font-sans text-[10px] font-semibold text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)]">Start Time</label>
                                  <TimePicker 
                                    value={(() => {
                                      const val = String(action.parameters.startAt || "");
                                      if (!val) return null;
                                      const d = new Date(val);
                                      if (isNaN(d.getTime())) return null;
                                      return new Time(d.getHours(), d.getMinutes());
                                    })()}
                                    onChange={(time) => {
                                      if (!time) return;
                                      const currentVal = String(action.parameters.startAt || new Date().toISOString());
                                      const d = new Date(currentVal);
                                      d.setHours(time.hour, time.minute);
                                      updateParam(i, "startAt", d.toISOString());
                                    }}
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="font-sans text-[10px] font-semibold text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)]">End Time</label>
                                  <TimePicker 
                                    value={(() => {
                                      const val = String(action.parameters.endAt || "");
                                      if (!val) return null;
                                      const d = new Date(val);
                                      if (isNaN(d.getTime())) return null;
                                      return new Time(d.getHours(), d.getMinutes());
                                    })()}
                                    onChange={(time) => {
                                      if (!time) return;
                                      const currentVal = String(action.parameters.endAt || new Date().toISOString());
                                      const d = new Date(currentVal);
                                      d.setHours(time.hour, time.minute);
                                      updateParam(i, "endAt", d.toISOString());
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        {action.tool === "github_create_issue" && (
                          <>
                            <div className="flex flex-col gap-1">
                              <label className="font-sans text-[10px] font-semibold text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)]">Repository URL or Name</label>
                              <input 
                                type="text"
                                className="border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FAF8F5] dark:bg-[#2C2C2C] rounded-[6px] px-2.5 py-1 text-[12px] font-sans text-[#241B14] dark:text-[#F4F4F5] focus:outline-[#E8593C]"
                                placeholder="e.g. https://github.com/pranavgawaii/Auren"
                                value={String(action.parameters.repoUrl || "")}
                                onChange={(e) => updateParam(i, "repoUrl", e.target.value)}
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <label className="font-sans text-[10px] font-semibold text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)]">Issue Title</label>
                              <input 
                                type="text"
                                className="border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FAF8F5] dark:bg-[#2C2C2C] rounded-[6px] px-2.5 py-1 text-[12px] font-sans text-[#241B14] dark:text-[#F4F4F5] focus:outline-[#E8593C]"
                                value={String(action.parameters.title || "")}
                                onChange={(e) => updateParam(i, "title", e.target.value)}
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="font-sans text-[10px] font-semibold text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)]">Description</label>
                              <textarea 
                                rows={2}
                                className="border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FAF8F5] dark:bg-[#2C2C2C] rounded-[6px] px-2.5 py-1 text-[12px] font-sans text-[#241B14] dark:text-[#F4F4F5] focus:outline-[#E8593C] resize-none"
                                value={String(action.parameters.body || "")}
                                onChange={(e) => updateParam(i, "body", e.target.value)}
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="font-sans text-[10px] font-semibold text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)]">Assignees (comma separated)</label>
                              <input 
                                type="text"
                                className="border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FAF8F5] dark:bg-[#2C2C2C] rounded-[6px] px-2.5 py-1 text-[12px] font-sans text-[#241B14] dark:text-[#F4F4F5] focus:outline-[#E8593C]"
                                placeholder="e.g. pranavgawaii, 8teen"
                                value={Array.isArray(action.parameters.assignees) ? action.parameters.assignees.join(", ") : ""}
                                onChange={(e) => updateParam(i, "assignees", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="font-sans text-[10px] font-semibold text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)]">Labels (comma separated)</label>
                              <input 
                                type="text"
                                className="border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FAF8F5] dark:bg-[#2C2C2C] rounded-[6px] px-2.5 py-1 text-[12px] font-sans text-[#241B14] dark:text-[#F4F4F5] focus:outline-[#E8593C]"
                                placeholder="e.g. bug, urgent"
                                value={Array.isArray(action.parameters.labels) ? action.parameters.labels.join(", ") : ""}
                                onChange={(e) => updateParam(i, "labels", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                              />
                            </div>
                          </>
                        )}

                        {action.tool === "github_list_issues" && (
                          <>
                            <div className="flex flex-col gap-1">
                              <label className="font-sans text-[10px] font-semibold text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)]">Repository URL or Name</label>
                              <input 
                                type="text"
                                className="border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FAF8F5] dark:bg-[#2C2C2C] rounded-[6px] px-2.5 py-1 text-[12px] font-sans text-[#241B14] dark:text-[#F4F4F5] focus:outline-[#E8593C]"
                                placeholder="e.g. pranavgawaii/Auren"
                                value={String(action.parameters.repoUrl || "")}
                                onChange={(e) => updateParam(i, "repoUrl", e.target.value)}
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="font-sans text-[10px] font-semibold text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)]">State</label>
                              <select
                                className="border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FAF8F5] dark:bg-[#2C2C2C] rounded-[6px] px-2.5 py-1 text-[12px] font-sans text-[#241B14] dark:text-[#F4F4F5] focus:outline-[#E8593C]"
                                value={String(action.parameters.state || "open")}
                                onChange={(e) => updateParam(i, "state", e.target.value)}
                              >
                                <option value="open">Open</option>
                                <option value="closed">Closed</option>
                                <option value="all">All</option>
                              </select>
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="font-sans text-[10px] font-semibold text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)]">Filter Labels (comma separated)</label>
                              <input 
                                type="text"
                                className="border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FAF8F5] dark:bg-[#2C2C2C] rounded-[6px] px-2.5 py-1 text-[12px] font-sans text-[#241B14] dark:text-[#F4F4F5] focus:outline-[#E8593C]"
                                placeholder="e.g. bug"
                                value={Array.isArray(action.parameters.labels) ? action.parameters.labels.join(", ") : ""}
                                onChange={(e) => updateParam(i, "labels", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                              />
                            </div>
                          </>
                        )}

                        {action.tool === "github_review_pr" && (
                          <>
                            <div className="flex flex-col gap-1">
                              <label className="font-sans text-[10px] font-semibold text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)]">Repository URL or Name</label>
                              <input 
                                type="text"
                                className="border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FAF8F5] dark:bg-[#2C2C2C] rounded-[6px] px-2.5 py-1 text-[12px] font-sans text-[#241B14] dark:text-[#F4F4F5] focus:outline-[#E8593C]"
                                placeholder="e.g. pranavgawaii/Auren"
                                value={String(action.parameters.repoUrl || "")}
                                onChange={(e) => updateParam(i, "repoUrl", e.target.value)}
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="font-sans text-[10px] font-semibold text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)]">PR Number</label>
                              <input 
                                type="number"
                                className="border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FAF8F5] dark:bg-[#2C2C2C] rounded-[6px] px-2.5 py-1 text-[12px] font-sans text-[#241B14] dark:text-[#F4F4F5] focus:outline-[#E8593C]"
                                value={Number(action.parameters.pullNumber || 0)}
                                onChange={(e) => updateParam(i, "pullNumber", Number(e.target.value))}
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="font-sans text-[10px] font-semibold text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)]">Review Action</label>
                              <select
                                className="border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FAF8F5] dark:bg-[#2C2C2C] rounded-[6px] px-2.5 py-1 text-[12px] font-sans text-[#241B14] dark:text-[#F4F4F5] focus:outline-[#E8593C]"
                                value={String(action.parameters.event || "COMMENT")}
                                onChange={(e) => updateParam(i, "event", e.target.value)}
                              >
                                <option value="COMMENT">Comment Only</option>
                                <option value="APPROVE">Approve</option>
                                <option value="REQUEST_CHANGES">Request Changes</option>
                              </select>
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="font-sans text-[10px] font-semibold text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)]">Review Body</label>
                              <textarea 
                                rows={3}
                                className="border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FAF8F5] dark:bg-[#2C2C2C] rounded-[6px] px-2.5 py-1 text-[12px] font-sans text-[#241B14] dark:text-[#F4F4F5] focus:outline-[#E8593C] resize-none"
                                value={String(action.parameters.body || "")}
                                onChange={(e) => updateParam(i, "body", e.target.value)}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Informational warning if no actions are scheduled */}
        {!hasActions && !plan?.followUpQuestion && (
          <div className="flex gap-2.5 bg-[#FEF3C7] dark:bg-[#92400E]/20 border border-[#F59E0B] dark:border-[#F59E0B]/50 text-[#92400E] dark:text-[#FEF3C7] rounded-[12px] p-3 text-[12px] font-sans items-start">
            <AlertCircle className="w-4 h-4 mt-[2px] shrink-0" />
            <div className="flex flex-col gap-1">
              <strong>Needs Clarification</strong>
              <span>Auren has not scheduled any actions yet because it requires additional details. Provide responses below to parameterize the calendar or integration.</span>
            </div>
          </div>
        )}

        {/* Display Follow-up Question if provided */}
        {plan?.followUpQuestion && (
          <div className="flex gap-2.5 bg-[#F0FDF4] dark:bg-[#166534]/20 border border-[#BBF7D0] dark:border-[#BBF7D0]/50 text-[#166534] dark:text-[#F0FDF4] rounded-[12px] p-3 text-[12px] font-sans items-start">
            <MessageSquare className="w-4 h-4 mt-[2px] shrink-0 text-[#16A34A]" />
            <div className="flex flex-col gap-1">
              <strong>Follow-up Question</strong>
              <span className="text-[13px] leading-relaxed">{plan.followUpQuestion}</span>
            </div>
          </div>
        )}

        {/* Dynamic Clarification/Conversational Input */}
        <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-[#E8593C]" />
            <span className="font-sans font-bold text-[11px] text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)] uppercase tracking-wider">
              {plan?.followUpQuestion ? "Reply to Auren" : "Talk to Auren / Provide details"}
            </span>
          </div>
          <div className="flex items-center gap-2 border border-[rgba(36,27,20,0.1)] dark:border-[rgba(255,255,255,0.1)] rounded-[10px] p-1 bg-white dark:bg-[#383838] shadow-inner">
            <input 
              type="text" 
              placeholder="e.g., 'At 3:00 PM tomorrow', 'Don't create a GitHub issue'" 
              className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-[12.5px] font-sans text-[#241B14] dark:text-[#F4F4F5]"
              value={clarificationText}
              onChange={(e) => setClarificationText(e.target.value)}
              onKeyDown={(e) => { 
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleClarifySubmit();
                }
              }}
              disabled={isExecuting || isSubmittingClarification}
            />
            <button 
              onClick={handleClarifySubmit}
              disabled={isExecuting || isSubmittingClarification || !clarificationText.trim()}
              className="px-4 py-2 bg-[#E8593C] text-white rounded-[8px] font-sans font-semibold text-[12px] hover:bg-[#D14F31] transition-colors disabled:opacity-50"
            >
              {isSubmittingClarification ? "Thinking..." : "Update Plan"}
            </button>
          </div>
        </div>

        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between gap-3 pt-4 mt-auto border-t border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FDFBF9] dark:bg-[#2C2C2C]">
          <button 
            onClick={handleConfirmSubmit}
            disabled={isExecuting || !hasActions || !anyActionEnabled}
            className="flex-1 h-[44px] bg-[#E8593C] text-white rounded-[10px] font-sans font-bold text-[13px] hover:bg-[#D14F31] transition-all shadow-md disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isExecuting ? "Executing..." : "Confirm & Execute"}
          </button>
          <button 
            onClick={onCancel}
            disabled={isExecuting}
            className="flex-1 h-[44px] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] rounded-[10px] font-sans font-bold text-[13px] hover:bg-[rgba(36,27,20,0.02)] dark:bg-[rgba(255,255,255,0.02)] transition-colors bg-white dark:bg-[#383838]"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
