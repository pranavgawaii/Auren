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
import { TeamView } from "./team-view";
import { HomeView } from "./home-view";
import { CommandMenu } from "./command-menu";
import { TerminalDrawer } from "./terminal-drawer";
import { AurenLoading } from "@/components/ui/auren-loading";
import { getInboxEmails } from "@/app/actions/inbox";
import { processCommand } from "@/app/actions/agent";
import { executePlan } from "@/app/actions/execute";
import { checkConnectionStatus } from "@/app/actions/connect";
import { getTeamContacts } from "@/app/actions/team";
import { markEmailAsRead } from "@/app/actions/mark-read";
import type { GmailMessage, AgentReasoningResult } from "@/types";
import { MorphPanel } from "@/components/ui/ai-input";
import { DownsideCommandBar } from "@/components/ui/downside-command-bar";
import { motion, AnimatePresence } from "framer-motion";
import { showToast } from "@/components/ui/premium-toast";

export function DashboardClient() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Optimistic boot: a Google grant that existed last session is still there this
  // session, so trust the cached answer and render the app immediately while the
  // real check runs underneath. Only a first-ever load blocks on the network —
  // the check itself costs ~3s round trip to Corsair, and the dashboard's own data
  // finishes loading well before it returns.
  const [isCheckingConnection, setIsCheckingConnection] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem("auren:google-connected") !== "1";
  });

  useEffect(() => {
    let active = true;
    async function verifyConnection() {
      if (!isLoaded) return;
      if (!user) {
        router.push("/sign-in");
        return;
      }

      let retries = 3;
      let status = { google: false, github: false };
      
      while (retries > 0 && active) {
        try {
          status = await checkConnectionStatus();
          if (status.google) {
            break;
          }
        } catch (err) {
          console.error(`[verifyConnection] Attempt failed. Retries left: ${retries - 1}`, err);
        }
        
        retries--;
        if (retries > 0 && active) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      if (!active) return;

      if (!status.google) {
        // The optimistic cache was wrong (grant revoked, or never existed) — clear it
        // so the next load blocks properly instead of flashing an unusable app.
        window.localStorage.removeItem("auren:google-connected");
        console.warn("[verifyConnection] Google not connected after retries. Redirecting to onboarding.");
        router.push("/onboarding");
      } else {
        window.localStorage.setItem("auren:google-connected", "1");
        setIsCheckingConnection(false);
      }
    }
    verifyConnection();
    return () => {
      active = false;
    };
  }, [user, isLoaded, router]);

  const pathname = usePathname();
  
  // Determine initial view from pathname
  const initialView = pathname.startsWith("/settings") ? "settings"
    : pathname.startsWith("/history") ? "history"
    : pathname.startsWith("/calendar") ? "calendar"
    : pathname.startsWith("/search") ? "search"
    : pathname.startsWith("/github") ? "github"
    : pathname.startsWith("/team") ? "team"
    : pathname.startsWith("/mail") ? "inbox"
    : "home";

  const [view, setViewInternal] = useState<"home" | "search" | "github" | "calendar" | "inbox" | "settings" | "history" | "team">(initialView as any);

  // Team contacts for @ mentions
  const [teamContacts, setTeamContacts] = useState<{name: string; email: string}[]>([]);
  useEffect(() => {
    getTeamContacts().then(res => {
      if (res.success && res.data) setTeamContacts(res.data);
    });
  }, []);

  useEffect(() => {
    setViewInternal(initialView as any);
  }, [initialView]);

  const setView = (newView: string) => {
    if (newView === "home") {
      setIsZenMode(false);
      router.push("/dashboard", { scroll: false });
      setViewInternal("home");
    } else if (newView === "inbox") {
      setIsZenMode(false);
      router.push("/mail", { scroll: false });
      setViewInternal("inbox");
    } else if (newView === "team") {
      // Refresh contacts when navigating to Team
      getTeamContacts().then(res => { if (res.success && res.data) setTeamContacts(res.data); });
      router.push("/team", { scroll: false });
      setViewInternal("team");
    } else {
      router.push(`/${newView}`, { scroll: false });
      setViewInternal(newView as any);
    }
  };

  const [folderType, setFolderType] = useState<"INBOX" | "SENT" | "DRAFT">("INBOX");
  const [isCalendarOpen, setIsCalendarOpen] = useState(true);
  const [isZenMode, setIsZenMode] = useState(true);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
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

  // Opening a message marks it read. Update local state first so the unread dot and
  // the topbar badge clear instantly, then persist (DB + Gmail label) in the background.
  const handleSelectEmail = useCallback((id: string) => {
    setSelectedEmailId(id);
    if (!id) return;

    setEmails(prev => {
      const target = prev.find(e => e.id === id);
      if (!target || target.isRead) return prev;
      return prev.map(e => (e.id === id ? { ...e, isRead: true } : e));
    });

    markEmailAsRead(id).catch(err => console.error("[markEmailAsRead] failed:", err));
  }, []);

  const selectedEmail = emails.find(e => e.id === selectedEmailId);
  const threadEmails = selectedEmail 
    ? emails.filter(e => e.threadId === selectedEmail.threadId).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];

  const handleAction = async (command: string, history?: any[], opts?: { fromChat?: boolean }) => {
    setCurrentCommand(command);
    setIsAgentLoading(true);
    const res = await processCommand(command, selectedEmail || null, history);
    setIsAgentLoading(false);

    if (res.success && res.data) {
      // Home already shows a live, real-data summary (schedule, inbox, commands) — a
      // "brief me" style request should just take the user there rather than open a
      // second, LLM-fabricated summary card with mock data.
      if (res.data.briefing) {
        setView("home");
        showToast.success("Here's your day.");
      } else if (res.data.actions && res.data.actions.length > 0) {
        setAgentPlan(res.data);
        setIsConfirmOpen(true);
      } else if (!opts?.fromChat) {
        // The agent also answers with a plain explanation or a follow-up question and
        // no actions (summaries, lookups, anything conversational). Without this the
        // command ran, cost a request, and showed the user nothing at all.
        // Skipped for chat-originated commands — the thread already renders the reply,
        // and toasting it too produced a second copy over the topbar.
        const reply = res.data.followUpQuestion || res.data.explanation;
        if (reply) {
          showToast.success(reply.length > 120 ? `${reply.slice(0, 117)}…` : reply);
        }
      }
      return res.data;
    } else {
      showToast.error(`Agent error: ${res.error || "Failed to process command."}`);
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
      urgentEmailCount={emails.filter(e => e.priority === "urg" || e.priority === "urgent").length}
    >
      {/* Loading overlay: frosted, not opaque — the workspace stays visible behind it.
          HomeView renders a silent skeleton while this is up, so there's no second
          loader competing underneath. */}
      {(isCheckingConnection || !isLoaded || !user) && (
        <AurenLoading text="Preparing your workspace…" variant="overlay" size="lg" />
      )}

      <AnimatePresence>
        {isAgentLoading && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-40 bg-white/20 dark:bg-[#383838]/20 pointer-events-none"
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
      {view === "home" ? (
        <div className="flex flex-1 w-full overflow-hidden h-full">
          <HomeView
            onNavigate={(v) => setView(v)}
            onAction={handleAction}
            isAgentLoading={isAgentLoading}
          />
        </div>
      ) : view === "inbox" ? (
        <div className="flex flex-1 w-full overflow-hidden h-full relative">
          {!isZenMode && (
            <div 
              style={{ width: `${inboxWidth}px` }} 
              className="shrink-0 flex flex-col h-full border-r border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] relative bg-white dark:bg-[#383838]"
            >
              <InboxPanel 
                emails={emails}
                selectedEmailId={selectedEmailId} 
                onSelectEmail={handleSelectEmail} 
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
              <div className="flex flex-col items-center justify-center h-full w-full bg-white dark:bg-[#383838]">
                <AurenLoading text="Syncing your inbox…" size="md" />
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
      ) : view === "team" ? (
        <div className="flex flex-1 w-full overflow-hidden h-full">
          <TeamView />
        </div>
      ) : view === "settings" ? (
        <SettingsView />
      ) : view === "history" ? (
        <div className="flex flex-1 w-full overflow-hidden h-full">
          <HistoryPanel />
        </div>
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
            // Check if any action produced a Google Meet link
            const meetResult = res.results?.find(
              (r: any) => r.tool === "calendar_create" && r.data?.meetLink
            ) as any;
            if (meetResult?.data?.meetLink) {
              showToast.success(`✅ Event created! 📹 Meet: ${meetResult.data.meetLink}`);
            } else {
              showToast.success("Actions executed successfully!");
            }
            setIsExecuting(false);
            setIsConfirmOpen(false);
            setTimeout(() => router.refresh(), 1500); // Reload to sync state after toast without unmounting client
          } else {
            showToast.error(`Execution failed: ${res.error || "Unknown error"}`);
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
            showToast.error("Failed to refine plan.");
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
      {view === "home" && (
        <DownsideCommandBar 
          onExecute={handleAction} 
          isAgentLoading={isAgentLoading} 
          teamContacts={teamContacts} 
          emails={emails} 
        />
      )}
      <div className="fixed bottom-12 right-12 z-[60]">
        <MorphPanel onExecute={handleAction} isAgentLoading={isAgentLoading} emails={emails} teamContacts={teamContacts} />
      </div>
    </AppShell>
  );
}
