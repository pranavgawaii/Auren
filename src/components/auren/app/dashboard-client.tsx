"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppShell } from "./app-shell";
import { InboxPanel } from "./inbox-panel";
import { EmailDetail } from "./email-detail";
import { CalendarPanel } from "./calendar-panel";
import { SearchClient } from "./search-client";
import { ActionConfirmation } from "./action-confirmation";
import { FullCalendarView } from "./full-calendar-view";
import { SettingsView } from "./settings-view";
import { HistoryPanel } from "./history-panel";
import { CommandMenu } from "./command-menu";
import { TerminalDrawer } from "./terminal-drawer";
import { getInboxEmails } from "@/app/actions/inbox";
import { processCommand } from "@/app/actions/agent";
import { executePlan } from "@/app/actions/execute";
import type { GmailMessage, AgentReasoningResult } from "@/types";

export function DashboardClient() {
  const [view, setView] = useState<"inbox" | "search" | "calendar" | "settings" | "history">("inbox");
  const [isCalendarOpen, setIsCalendarOpen] = useState(true);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [selectedEmailId, setSelectedEmailId] = useState<string>("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [agentPlan, setAgentPlan] = useState<AgentReasoningResult | null>(null);
  const [currentCommand, setCurrentCommand] = useState<string>("");
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [emails, setEmails] = useState<GmailMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Global Ctrl+\ console shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "\\" && e.ctrlKey) {
        e.preventDefault();
        setIsConsoleOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [inboxWidth, setInboxWidth] = useState(350);
  const [calendarWidth, setCalendarWidth] = useState(300);

  const startInboxResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = inboxWidth;

    const doResize = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(260, Math.min(600, startWidth + (moveEvent.clientX - startX)));
      setInboxWidth(newWidth);
    };

    const stopResize = () => {
      document.removeEventListener("mousemove", doResize);
      document.removeEventListener("mouseup", stopResize);
    };

    document.addEventListener("mousemove", doResize);
    document.addEventListener("mouseup", stopResize);
  };

  const startCalendarResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = calendarWidth;

    const doResize = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(240, Math.min(500, startWidth - (moveEvent.clientX - startX)));
      setCalendarWidth(newWidth);
    };

    const stopResize = () => {
      document.removeEventListener("mousemove", doResize);
      document.removeEventListener("mouseup", stopResize);
    };

    document.addEventListener("mousemove", doResize);
    document.addEventListener("mouseup", stopResize);
  };

  const fetchEmails = useCallback(async (shouldSync: boolean = false) => {
    setIsLoading(true);
    const res = await getInboxEmails(shouldSync);
    if (res.success && res.data) {
      setEmails(res.data);
      if (res.data.length > 0 && !selectedEmailId) {
        setSelectedEmailId(res.data[0].id);
      }
    }
    setIsLoading(false);
  }, [selectedEmailId]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const selectedEmail = emails.find(e => e.id === selectedEmailId);
  const threadEmails = selectedEmail 
    ? emails.filter(e => e.threadId === selectedEmail.threadId).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];

  const handleAction = async (command: string) => {
    setCurrentCommand(command);
    setIsAgentLoading(true);
    const res = await processCommand(command, selectedEmail || null);
    if (res.success && res.data) {
      setAgentPlan(res.data);
      setIsConfirmOpen(true);
    } else {
      alert("Agent failed to process command.");
    }
    setIsAgentLoading(false);
  };
  
  return (
    <AppShell 
      currentView={view} 
      onViewChange={setView} 
      isCalendarOpen={isCalendarOpen} 
      onToggleCalendar={() => setIsCalendarOpen(prev => !prev)}
      isConsoleOpen={isConsoleOpen}
      onToggleConsole={() => setIsConsoleOpen(prev => !prev)}
    >
      {view === "inbox" ? (
        <div className="flex flex-1 w-full overflow-hidden h-full">
          <div 
            style={{ width: `${inboxWidth}px` }} 
            className="shrink-0 flex flex-col h-full border-r border-[rgba(36,27,20,0.08)] relative bg-white"
          >
            <InboxPanel 
              emails={emails}
              selectedEmailId={selectedEmailId} 
              onSelectEmail={setSelectedEmailId} 
              onRefresh={fetchEmails}
              isLoading={isLoading}
            />
            {/* Horizontal Resize handle (Inbox list) */}
            <div 
              className="absolute top-0 bottom-0 right-[-3px] w-[6px] hover:bg-[#E8593C]/30 cursor-col-resize z-50 group flex items-center justify-center select-none"
              onMouseDown={startInboxResize}
            >
              <div className="flex items-center justify-center w-5 h-8 bg-white border border-[rgba(36,27,20,0.12)] rounded-full shadow-[0_2px_8px_rgba(36,27,20,0.1)] opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[rgba(36,27,20,0.5)]">
                  <path d="M8 9l-3 3 3 3M16 9l3 3-3 3M12 5v14" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col relative overflow-hidden">
            <EmailDetail 
              email={selectedEmail} 
              thread={threadEmails}
              onAction={handleAction} 
              isAgentLoading={isAgentLoading}
            />
          </div>
          
          {isCalendarOpen && (
            <div 
              style={{ width: `${calendarWidth}px` }} 
              className="shrink-0 flex flex-col h-full border-l border-[rgba(36,27,20,0.08)] relative bg-white"
            >
              {/* Horizontal Resize handle (Calendar sidebar) */}
              <div 
                className="absolute top-0 bottom-0 left-[-3px] w-[6px] hover:bg-[#E8593C]/30 cursor-col-resize z-50 group flex items-center justify-center select-none"
                onMouseDown={startCalendarResize}
              >
                <div className="flex items-center justify-center w-5 h-8 bg-white border border-[rgba(36,27,20,0.12)] rounded-full shadow-[0_2px_8px_rgba(36,27,20,0.1)] opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[rgba(36,27,20,0.5)]">
                    <path d="M8 9l-3 3 3 3M16 9l3 3-3 3M12 5v14" />
                  </svg>
                </div>
              </div>
              <CalendarPanel onClose={() => setIsCalendarOpen(false)} />
            </div>
          )}
        </div>
      ) : view === "search" ? (
        <SearchClient />
      ) : view === "calendar" ? (
        <FullCalendarView />
      ) : view === "settings" ? (
        <SettingsView />
      ) : view === "history" ? (
        <HistoryPanel />
      ) : null}

      {/* Example trigger for the action confirmation - hidden in production */}
      <div 
        className="fixed bottom-12 right-12 w-10 h-10 bg-[#E8593C] rounded-full text-white flex items-center justify-center cursor-pointer shadow-lg z-50 opacity-0 hover:opacity-100"
        onClick={() => setIsConfirmOpen(true)}
        title="Test Action Confirmation"
      >
        A
      </div>

      <ActionConfirmation 
        isOpen={isConfirmOpen} 
        plan={agentPlan}
        isExecuting={isExecuting}
        onConfirm={async (finalPlan) => {
          if (!finalPlan) return;
          setIsExecuting(true);
          const res = await executePlan(finalPlan, currentCommand);
          setIsExecuting(false);
          setIsConfirmOpen(false);
          
          if (res.success) {
            alert("Actions executed successfully!");
            window.location.reload(); // Refresh the entire app to sync both Email and Calendar data
          } else {
            alert(`Execution failed: ${res.error || "Unknown error"}`);
          }
        }} 
        onCancel={() => setIsConfirmOpen(false)}
        onClarify={async (text) => {
          setIsAgentLoading(true);
          const combinedCommand = `Agent explanation was: ${agentPlan?.explanation || ""}\nUser response / instruction details: ${text}`;
          setCurrentCommand(combinedCommand);
          const res = await processCommand(combinedCommand, selectedEmail || null);
          if (res.success && res.data) {
            setAgentPlan(res.data);
          } else {
            alert("Failed to refine plan.");
          }
          setIsAgentLoading(false);
        }}
      />

      <CommandMenu onSelectView={setView} />
      <TerminalDrawer 
        isOpen={isConsoleOpen} 
        setIsOpen={setIsConsoleOpen} 
        onExecute={handleAction} 
        isAgentLoading={isAgentLoading} 
      />
    </AppShell>
  );
}
