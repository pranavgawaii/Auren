"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppShell } from "./app-shell";
import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { InboxPanel } from "./inbox-panel";
import { EmailDetail } from "./email-detail";
import { DailyBrief } from "./daily-brief";
import { CalendarPanel } from "./calendar-panel";
import { SearchClient } from "./search-client";
import { GitHubIntegrationView } from "./github-view";
import { ActionConfirmation } from "./action-confirmation";
import { FullCalendarView } from "./full-calendar-view";
import { SettingsView } from "./settings-view";
import { HistoryPanel } from "./history-panel";
import { CommandMenu } from "./command-menu";
import { TerminalDrawer } from "./terminal-drawer";
import { getInboxEmails } from "@/app/actions/inbox";
import { processCommand } from "@/app/actions/agent";
import { executePlan } from "@/app/actions/execute";
import { checkConnectionStatus } from "@/app/actions/connect";
import type { GmailMessage, AgentReasoningResult } from "@/types";
import { MorphPanel } from "@/components/ui/ai-input";
import { motion, AnimatePresence } from "framer-motion";
import { BriefingCard } from "@/components/ui/briefing-card";
import { ShiningText } from "@/components/ui/shining-text";

export function DashboardClient() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    async function verifyConnection() {
      if (isLoaded) {
        if (!user) {
          router.push("/sign-in");
          return;
        }
        const status = await checkConnectionStatus();
        if (!status.google) {
          router.push("/onboarding");
        }
      }
    }
    verifyConnection();
  }, [user, isLoaded, router]);

  const pathname = usePathname();
  
  // Determine initial view from pathname
  const initialView = pathname.startsWith("/settings") ? "settings" 
    : pathname.startsWith("/history") ? "history" 
    : pathname.startsWith("/calendar") ? "calendar" 
    : pathname.startsWith("/search") ? "search"
    : pathname.startsWith("/github") ? "github"
    : "inbox";

  const [view, setViewInternal] = useState<"search" | "github" | "calendar" | "inbox" | "settings" | "history">(initialView as any);

  const setView = (newView: string) => {
    if (newView === "inbox") {
      setIsZenMode(false);
      window.history.pushState(null, "", "/app");
      setViewInternal("inbox");
    } else {
      window.history.pushState(null, "", `/${newView}`);
      setViewInternal(newView as any);
    }
  };

  const [folderType, setFolderType] = useState<"INBOX" | "SENT" | "DRAFT">("INBOX");
  const [isCalendarOpen, setIsCalendarOpen] = useState(true);
  const [isZenMode, setIsZenMode] = useState(true);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [briefingData, setBriefingData] = useState<any>(null);
  const [selectedEmailId, setSelectedEmailId] = useState<string>("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [agentPlan, setAgentPlan] = useState<AgentReasoningResult | null>(null);
  const [currentCommand, setCurrentCommand] = useState<string>("");
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [emails, setEmails] = useState<GmailMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Global Ctrl+\ console shortcut and Cmd+\ Zen Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "\\" && e.ctrlKey) {
        e.preventDefault();
        setIsConsoleOpen((prev) => !prev);
      }
      if (e.key === "\\" && e.metaKey) {
        e.preventDefault();
        setIsZenMode((prev) => !prev);
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
    let limit = 10; // Reduced from 20 for faster loading
    if (typeof window !== "undefined" && user) {
      const savedLimit = localStorage.getItem(`auren_${user.id}_sync_limit`);
      if (savedLimit) limit = parseInt(savedLimit, 10);
    }
    const res = await getInboxEmails(shouldSync, limit, folderType);
    if (res.success && res.data) {
      setEmails(res.data);
      if (res.data.length > 0 && !selectedEmailId) {
        const unread = res.data.find(e => !e.isRead);
        if (unread) {
          setSelectedEmailId(unread.id);
        } else {
          // If no unread, show Daily Brief by leaving it empty
          setSelectedEmailId("");
        }
      }
    }
    setIsLoading(false);
  }, [selectedEmailId, user, folderType]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  useEffect(() => {
    if (selectedEmailId) {
      setIsZenMode(false);
    }
  }, [selectedEmailId]);

  const selectedEmail = emails.find(e => e.id === selectedEmailId);
  const threadEmails = selectedEmail 
    ? emails.filter(e => e.threadId === selectedEmail.threadId).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];

  const handleAction = async (command: string, history?: any[]) => {
    setCurrentCommand(command);
    setIsAgentLoading(true);
    const res = await processCommand(command, selectedEmail || null, history);
    setIsAgentLoading(false);

    if (res.success && res.data) {
      // If there is a briefing, intercept it and show the overlay instead of confirmation
      if (res.data.briefing) {
        setBriefingData(res.data.briefing);
      } else if (res.data.actions && res.data.actions.length > 0) {
        setAgentPlan(res.data);
        setIsConfirmOpen(true);
      }
      return res.data;
    } else {
      alert(`Agent error: ${res.error || "Failed to process command."}`);
      return null;
    }
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
      <AnimatePresence>
        {isAgentLoading && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(2px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-40 bg-white dark:bg-[#383838]/20 pointer-events-none"
            transition={{ duration: 0.3 }}
          />
        )}
        {briefingData && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(6px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-50 bg-[#FAF8F5] dark:bg-[#2C2C2C]/50 flex items-center justify-center p-8"
          >
            <div className="absolute inset-0 cursor-pointer" onClick={() => setBriefingData(null)} />
            <div className="relative z-10 w-full max-w-[800px]">
              <BriefingCard data={briefingData} onClose={() => setBriefingData(null)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {view === "inbox" ? (
        <div className="flex flex-1 w-full overflow-hidden h-full relative">
          {!isZenMode && (
            <div 
              style={{ width: `${inboxWidth}px` }} 
              className="shrink-0 flex flex-col h-full border-r border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] relative bg-white dark:bg-[#383838]"
            >
              <InboxPanel 
                emails={emails}
                selectedEmailId={selectedEmailId} 
                onSelectEmail={setSelectedEmailId} 
                onRefresh={fetchEmails}
                isLoading={isLoading}
                folderType={folderType}
                onFolderChange={setFolderType}
              />
              {/* Horizontal Resize handle (Inbox list) */}
              <div 
                className="absolute top-0 bottom-0 right-[-3px] w-[6px] hover:bg-[#E8593C]/30 cursor-col-resize z-50 group flex items-center justify-center select-none"
                onMouseDown={startInboxResize}
              >
                <div className="flex items-center justify-center w-5 h-8 bg-white dark:bg-[#383838] border border-[rgba(36,27,20,0.12)] dark:border-[rgba(255,255,255,0.12)] rounded-full shadow-[0_2px_8px_rgba(36,27,20,0.1)] opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]">
                    <path d="M8 9l-3 3 3 3M16 9l3 3-3 3M12 5v14" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {isZenMode && !selectedEmail && (
            <button
              onClick={() => setIsZenMode(false)}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white dark:bg-[#383838] border border-[rgba(36,27,20,0.12)] dark:border-[rgba(255,255,255,0.12)] border-l-0 rounded-r-xl p-2 shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] hover:text-[#E8593C] hover:bg-[#FAF8F5] dark:bg-[#2C2C2C] transition-all z-40"
              title="Open Inbox"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </button>
          )}
          
          <div className="flex-1 flex flex-col relative overflow-hidden">
            {isLoading && !selectedEmail ? (
              <div className="flex flex-col items-center justify-center h-full w-full gap-4 bg-white dark:bg-[#383838]">
                <ShiningText text="Auren is thinking..." className="text-[13px] font-medium tracking-wide font-sans" />
              </div>
            ) : selectedEmail ? (
              <EmailDetail 
                email={selectedEmail} 
                thread={threadEmails}
                onAction={handleAction} 
                isAgentLoading={isAgentLoading}
              />
            ) : (
              <DailyBrief />
            )}
          </div>
          
          {!isZenMode && isCalendarOpen && (
            <div 
              style={{ width: `${calendarWidth}px` }} 
              className="shrink-0 flex flex-col h-full border-l border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] relative bg-white dark:bg-[#383838]"
            >
              {/* Horizontal Resize handle (Calendar sidebar) */}
              <div 
                className="absolute top-0 bottom-0 left-[-3px] w-[6px] hover:bg-[#E8593C]/30 cursor-col-resize z-50 group flex items-center justify-center select-none"
                onMouseDown={startCalendarResize}
              >
                <div className="flex items-center justify-center w-5 h-8 bg-white dark:bg-[#383838] border border-[rgba(36,27,20,0.12)] dark:border-[rgba(255,255,255,0.12)] rounded-full shadow-[0_2px_8px_rgba(36,27,20,0.1)] opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]">
                    <path d="M8 9l-3 3 3 3M16 9l3 3-3 3M12 5v14" />
                  </svg>
                </div>
              </div>
              <CalendarPanel onClose={() => setIsCalendarOpen(false)} />
            </div>
          )}

          {!isCalendarOpen && (
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white dark:bg-[#383838] border border-[rgba(36,27,20,0.12)] dark:border-[rgba(255,255,255,0.12)] border-r-0 rounded-l-xl p-2 shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] hover:text-[#E8593C] hover:bg-[#FAF8F5] dark:bg-[#2C2C2C] transition-all z-40"
              title="Open Calendar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            </button>
          )}
        </div>
      ) : view === "search" ? (
        <SearchClient />
      ) : view === "calendar" ? (
        <FullCalendarView />
      ) : view === "github" ? (
        <GitHubIntegrationView />
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

      <CommandMenu onSelectView={setView} onAction={handleAction} />
      <TerminalDrawer 
        isOpen={isConsoleOpen} 
        setIsOpen={setIsConsoleOpen} 
        onExecute={handleAction} 
        isAgentLoading={isAgentLoading} 
      />
      <div className="fixed bottom-12 right-12 z-[60]">
        <MorphPanel onExecute={handleAction} isAgentLoading={isAgentLoading} />
      </div>
    </AppShell>
  );
}
