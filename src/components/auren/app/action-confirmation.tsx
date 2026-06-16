"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, Check, Play, MessageSquare, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentReasoningResult } from "@/types";

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
  const [isSubmittingClarification, setIsSubmittingClarification] = useState(false);

  useEffect(() => {
    if (plan) {
      const clonedPlan = JSON.parse(JSON.stringify(plan));
      
      // Auto-fill missing dates to prevent Bad Request from Google API
      clonedPlan.actions.forEach((a: any) => {
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

  if (!isOpen) return null;

  const toggleAction = (index: number) => {
    const next = [...enabledActions];
    next[index] = !next[index];
    setEnabledActions(next);
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
      <div className="relative w-[540px] max-w-full mx-auto bg-[#FDFBF9] rounded-t-[24px] border-t border-[rgba(36,27,20,0.08)] shadow-[0_-12px_48px_rgba(36,27,20,0.12)] p-6 z-10 animate-in slide-in-from-bottom-12 duration-300 flex flex-col gap-4 max-h-[85vh] overflow-y-auto scrollbar-hide text-left">
        
        {/* Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#E8593C] animate-pulse" />
            <h3 className="font-sans font-bold text-[16px] text-[#241B14] tracking-tight">
              Auren Plan Confirmation
            </h3>
          </div>
        </div>

        {/* Explanation */}
        {plan?.explanation && (
          <div className="bg-[rgba(251,243,236,0.5)] border border-[rgba(36,27,20,0.04)] rounded-[12px] p-4 font-sans text-[13px] text-[#241B14] leading-[1.6]">
            {plan.explanation}
          </div>
        )}

        {/* Actions Checklist */}
        {hasActions && editedPlan && (
          <div className="flex flex-col gap-3">
            <span className="font-sans font-semibold text-[11px] text-[rgba(36,27,20,0.4)] uppercase tracking-wider">
              Integrations Checklist & Parameters
            </span>
            <div className="flex flex-col gap-3">
              {editedPlan.actions.map((action, i) => {
                const isEnabled = enabledActions[i];
                return (
                  <div 
                    key={i} 
                    className={cn(
                      "border rounded-[14px] p-4 transition-all duration-200 bg-white",
                      isEnabled 
                        ? "border-[rgba(232,89,60,0.2)] shadow-sm shadow-[rgba(232,89,60,0.02)]" 
                        : "border-[rgba(36,27,20,0.06)] opacity-60 bg-[rgba(36,27,20,0.01)]"
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
                          <span className="font-sans font-bold text-[13px] text-[#241B14] capitalize">
                            {action.tool.replace(/_/g, " ")}
                          </span>
                          <span className="font-sans text-[11px] text-[rgba(36,27,20,0.4)]">
                            {action.description}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Editable fields if enabled */}
                    {isEnabled && (
                      <div className="pl-8 flex flex-col gap-2.5 mt-1 pt-2 border-t border-[rgba(36,27,20,0.04)]">
                        {action.tool === "gmail_send" && (
                          <>
                            <div className="flex flex-col gap-1">
                              <label className="font-sans text-[10px] font-semibold text-[rgba(36,27,20,0.45)]">To</label>
                              <input 
                                type="text"
                                className="border border-[rgba(36,27,20,0.08)] bg-[#FAF8F5] rounded-[6px] px-2.5 py-1 text-[12px] font-sans text-[#241B14] focus:outline-[#E8593C]"
                                value={String(action.parameters.to || "")}
                                onChange={(e) => updateParam(i, "to", e.target.value)}
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="font-sans text-[10px] font-semibold text-[rgba(36,27,20,0.45)]">Subject</label>
                              <input 
                                type="text"
                                className="border border-[rgba(36,27,20,0.08)] bg-[#FAF8F5] rounded-[6px] px-2.5 py-1 text-[12px] font-sans text-[#241B14] focus:outline-[#E8593C]"
                                value={String(action.parameters.subject || "")}
                                onChange={(e) => updateParam(i, "subject", e.target.value)}
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="font-sans text-[10px] font-semibold text-[rgba(36,27,20,0.45)]">Email Draft Body</label>
                              <textarea 
                                rows={3}
                                className="border border-[rgba(36,27,20,0.08)] bg-[#FAF8F5] rounded-[6px] px-2.5 py-1 text-[12px] font-sans text-[#241B14] focus:outline-[#E8593C] resize-none"
                                value={String(action.parameters.body || "")}
                                onChange={(e) => updateParam(i, "body", e.target.value)}
                              />
                            </div>
                          </>
                        )}

                        {action.tool === "calendar_create" && (
                          <>
                            <div className="flex flex-col gap-1">
                              <label className="font-sans text-[10px] font-semibold text-[rgba(36,27,20,0.45)]">Event Title</label>
                              <input 
                                type="text"
                                className="border border-[rgba(36,27,20,0.08)] bg-[#FAF8F5] rounded-[6px] px-2.5 py-1 text-[12px] font-sans text-[#241B14] focus:outline-[#E8593C]"
                                value={String(action.parameters.title || "")}
                                onChange={(e) => updateParam(i, "title", e.target.value)}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col gap-1.5">
                                <label className="font-sans text-[11px] font-semibold text-[rgba(36,27,20,0.6)] uppercase tracking-wider">Start Time</label>
                                <div className="flex flex-col gap-2">
                                  <input 
                                    type="date"
                                    className="w-full min-h-[32px] border border-[rgba(36,27,20,0.12)] bg-white rounded-[8px] px-3 py-1.5 text-[13px] font-sans text-[#241B14] outline-none transition-all focus:border-[#E8593C] focus:ring-2 focus:ring-[#E8593C]/20 shadow-sm"
                                    value={(() => {
                                      const val = String(action.parameters.startAt || "");
                                      if (!val) return "";
                                      const d = new Date(val);
                                      if (isNaN(d.getTime())) return "";
                                      // Extract verbatim date
                                      return d.toISOString().split('T')[0];
                                    })()}
                                    onChange={(e) => {
                                      const currentVal = String(action.parameters.startAt || new Date().toISOString());
                                      const d = new Date(currentVal);
                                      const [y, m, day] = e.target.value.split('-');
                                      if (y && m && day) {
                                        d.setUTCFullYear(parseInt(y), parseInt(m)-1, parseInt(day));
                                        updateParam(i, "startAt", d.toISOString());
                                      }
                                    }}
                                  />
                                  <input 
                                    type="time"
                                    className="w-full min-h-[32px] border border-[rgba(36,27,20,0.12)] bg-white rounded-[8px] px-3 py-1.5 text-[13px] font-sans text-[#241B14] outline-none transition-all focus:border-[#E8593C] focus:ring-2 focus:ring-[#E8593C]/20 shadow-sm"
                                    value={(() => {
                                      const val = String(action.parameters.startAt || "");
                                      if (!val) return "";
                                      const d = new Date(val);
                                      if (isNaN(d.getTime())) return "";
                                      const hh = String(d.getUTCHours()).padStart(2, '0');
                                      const mm = String(d.getUTCMinutes()).padStart(2, '0');
                                      return `${hh}:${mm}`;
                                    })()}
                                    onChange={(e) => {
                                      const currentVal = String(action.parameters.startAt || new Date().toISOString());
                                      const d = new Date(currentVal);
                                      const [h, min] = e.target.value.split(':');
                                      if (h && min) {
                                        d.setUTCHours(parseInt(h), parseInt(min));
                                        updateParam(i, "startAt", d.toISOString());
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="font-sans text-[11px] font-semibold text-[rgba(36,27,20,0.6)] uppercase tracking-wider">End Time</label>
                                <div className="flex flex-col gap-2">
                                  <input 
                                    type="date"
                                    className="w-full min-h-[32px] border border-[rgba(36,27,20,0.12)] bg-white rounded-[8px] px-3 py-1.5 text-[13px] font-sans text-[#241B14] outline-none transition-all focus:border-[#E8593C] focus:ring-2 focus:ring-[#E8593C]/20 shadow-sm"
                                    value={(() => {
                                      const val = String(action.parameters.endAt || "");
                                      if (!val) return "";
                                      const d = new Date(val);
                                      if (isNaN(d.getTime())) return "";
                                      return d.toISOString().split('T')[0];
                                    })()}
                                    onChange={(e) => {
                                      const currentVal = String(action.parameters.endAt || new Date().toISOString());
                                      const d = new Date(currentVal);
                                      const [y, m, day] = e.target.value.split('-');
                                      if (y && m && day) {
                                        d.setUTCFullYear(parseInt(y), parseInt(m)-1, parseInt(day));
                                        updateParam(i, "endAt", d.toISOString());
                                      }
                                    }}
                                  />
                                  <input 
                                    type="time"
                                    className="w-full min-h-[32px] border border-[rgba(36,27,20,0.12)] bg-white rounded-[8px] px-3 py-1.5 text-[13px] font-sans text-[#241B14] outline-none transition-all focus:border-[#E8593C] focus:ring-2 focus:ring-[#E8593C]/20 shadow-sm"
                                    value={(() => {
                                      const val = String(action.parameters.endAt || "");
                                      if (!val) return "";
                                      const d = new Date(val);
                                      if (isNaN(d.getTime())) return "";
                                      const hh = String(d.getUTCHours()).padStart(2, '0');
                                      const mm = String(d.getUTCMinutes()).padStart(2, '0');
                                      return `${hh}:${mm}`;
                                    })()}
                                    onChange={(e) => {
                                      const currentVal = String(action.parameters.endAt || new Date().toISOString());
                                      const d = new Date(currentVal);
                                      const [h, min] = e.target.value.split(':');
                                      if (h && min) {
                                        d.setUTCHours(parseInt(h), parseInt(min));
                                        updateParam(i, "endAt", d.toISOString());
                                      }
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
                              <label className="font-sans text-[10px] font-semibold text-[rgba(36,27,20,0.45)]">Repository URL or Name</label>
                              <input 
                                type="text"
                                className="border border-[rgba(36,27,20,0.08)] bg-[#FAF8F5] rounded-[6px] px-2.5 py-1 text-[12px] font-sans text-[#241B14] focus:outline-[#E8593C]"
                                placeholder="e.g. https://github.com/pranavgawaii/Auren"
                                value={String(action.parameters.repoUrl || "")}
                                onChange={(e) => updateParam(i, "repoUrl", e.target.value)}
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <label className="font-sans text-[10px] font-semibold text-[rgba(36,27,20,0.45)]">Issue Title</label>
                              <input 
                                type="text"
                                className="border border-[rgba(36,27,20,0.08)] bg-[#FAF8F5] rounded-[6px] px-2.5 py-1 text-[12px] font-sans text-[#241B14] focus:outline-[#E8593C]"
                                value={String(action.parameters.title || "")}
                                onChange={(e) => updateParam(i, "title", e.target.value)}
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="font-sans text-[10px] font-semibold text-[rgba(36,27,20,0.45)]">Description</label>
                              <textarea 
                                rows={2}
                                className="border border-[rgba(36,27,20,0.08)] bg-[#FAF8F5] rounded-[6px] px-2.5 py-1 text-[12px] font-sans text-[#241B14] focus:outline-[#E8593C] resize-none"
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
        {!hasActions && (
          <div className="flex gap-2.5 bg-[#FEF3C7] border border-[#F59E0B] text-[#92400E] rounded-[12px] p-3 text-[12px] font-sans items-start">
            <AlertCircle className="w-4 h-4 mt-[2px] shrink-0" />
            <div className="flex flex-col gap-1">
              <strong>Needs Clarification</strong>
              <span>Auren has not scheduled any actions yet because it requires additional details. Provide responses below to parameterize the calendar or integration.</span>
            </div>
          </div>
        )}

        {/* Dynamic Clarification/Conversational Input */}
        <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-[rgba(36,27,20,0.08)]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-[#E8593C]" />
            <span className="font-sans font-bold text-[11px] text-[rgba(36,27,20,0.45)] uppercase tracking-wider">
              Talk to Auren / Provide details
            </span>
          </div>
          <div className="flex items-center gap-2 border border-[rgba(36,27,20,0.1)] rounded-[10px] p-1 bg-white shadow-inner">
            <input 
              type="text" 
              placeholder="e.g., 'At 3:00 PM tomorrow', 'Don't create a GitHub issue'" 
              className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-[12.5px] font-sans text-[#241B14]"
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

        {/* Footer Buttons */}
        <div className="flex items-center gap-3 mt-3">
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
            className="flex-1 h-[44px] border border-[rgba(36,27,20,0.08)] text-[rgba(36,27,20,0.5)] rounded-[10px] font-sans font-bold text-[13px] hover:bg-[rgba(36,27,20,0.02)] transition-colors bg-white"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
