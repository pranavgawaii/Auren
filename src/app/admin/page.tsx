"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  getAdminAnalytics,
  getSystemStatus,
  toggleAurenPro,
  resetUserRateLimit,
  deleteUserAccount
} from "@/app/actions/admin";
import type { AdminUser } from "@/app/actions/admin";
import { showToast } from "@/components/ui/premium-toast";
import {
  Loader2,
  Users,
  BarChart2,
  Search,
  ChevronRight,
  Trash2,
  RefreshCw,
  Cpu,
  Database,
  ShieldAlert,
  Info,
  Zap,
  TrendingUp,
  MessageSquare,
  X,
  Download,
  Copy,
  Check,
  CircleCheck,
  CircleX,
  CircleDashed,
  Mail,
  GitBranch,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

/* Same editorial tokens as the rest of the app (team-view, home-view,
   briefing-card) — the admin surface used to run its own near-black dark
   palette and its own alpha values. This brings it back in line. */
const RULE = "border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)]";
const MUTED = "text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]";
const FAINT = "text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]";
const DIVIDE = "divide-[rgba(36,27,20,0.06)] dark:divide-[rgba(255,255,255,0.06)]";
const SERIF = { fontFamily: "var(--font-civane, Georgia, serif)" };
const SURFACE = "bg-[#FAF8F5] dark:bg-[#2C2C2C]";

type Tab = "overview" | "customers" | "tokens" | "prompts";
type CmdStatus = "all" | "completed" | "failed" | "pending";

function StatusPill({ status }: { status: string }) {
  if (status === "completed")
    return (
      <span className="inline-flex items-center gap-1 text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <CircleCheck size={10} /> Success
      </span>
    );
  if (status === "failed")
    return (
      <span className="inline-flex items-center gap-1 text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-red-500/10 text-red-600 dark:text-red-400">
        <CircleX size={10} /> Failed
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400">
      <CircleDashed size={10} /> Pending
    </span>
  );
}

function ConnectionBadge({ provider, connected }: { provider: string; connected: boolean }) {
  return (
    <div
      className={`p-3.5 border rounded-xl flex items-center justify-between transition-all ${
        connected ? "border-emerald-500/25 bg-emerald-500/5" : `${RULE} ${SURFACE}`
      }`}
    >
      <div className="flex flex-col">
        <span className="text-[12.5px] font-semibold">{provider}</span>
        <span className={`text-[10px] font-mono mt-0.5 ${connected ? "text-emerald-600 dark:text-emerald-400" : FAINT}`}>
          {connected ? "CONNECTED" : "NOT CONNECTED"}
        </span>
      </div>
      <div className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-[rgba(36,27,20,0.2)] dark:bg-[rgba(255,255,255,0.2)]"}`} />
    </div>
  );
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <span className={`${FAINT} text-[11px]`}>{label}</span>
      <button
        onClick={() => {
          navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
        className={`group flex items-center justify-between gap-2 p-2 border ${RULE} rounded-lg ${SURFACE} font-mono text-[11px] text-left hover:border-[#E8593C]/40 transition-colors`}
        title="Copy"
      >
        <span className="truncate">{value}</span>
        {copied ? (
          <Check size={12} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <Copy size={12} className={`shrink-0 ${FAINT} group-hover:text-[#E8593C]`} />
        )}
      </button>
    </div>
  );
}

export default function AdminWorkspace() {
  const [data, setData] = useState<any>(null);
  const [sysStatus, setSysStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isToggling, setIsToggling] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [promptQuery, setPromptQuery] = useState("");
  const [promptStatus, setPromptStatus] = useState<CmdStatus>("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [drawerTab, setDrawerTab] = useState<"general" | "details" | "prompts">("general");

  const loadData = async () => {
    setIsLoading(true);
    const [res, sysRes] = await Promise.all([getAdminAnalytics(), getSystemStatus()]);
    if (res.success) setData(res.data);
    if (sysRes.success) setSysStatus(sysRes.data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTogglePro = async (userId: string, currentStatus: boolean) => {
    setIsToggling(userId);
    const res = await toggleAurenPro(userId, !currentStatus);
    if (res.success) {
      showToast.success(res.message || "Pro status updated");
      setData((prev: any) => {
        if (!prev) return prev;
        const updatedUsers = prev.users.map((u: AdminUser) => (u.id === userId ? { ...u, isPro: !currentStatus } : u));
        return { ...prev, users: updatedUsers, proUsers: prev.proUsers + (currentStatus ? -1 : 1) };
      });
      if (selectedUser?.id === userId) {
        setSelectedUser((prev: any) => (prev ? { ...prev, isPro: !currentStatus } : null));
      }
    } else {
      showToast.error(res.error || "Failed");
    }
    setIsToggling(null);
  };

  const handleResetLimit = async (supabaseId: string, clerkUserId: string) => {
    setIsResetting(clerkUserId);
    const res = await resetUserRateLimit(supabaseId);
    if (res.success) {
      showToast.success("Limits reset successfully!");
      setData((prev: any) => {
        if (!prev) return prev;
        const updatedUsers = prev.users.map((u: AdminUser) => (u.id === clerkUserId ? { ...u, commandsUsed: 0 } : u));
        return { ...prev, users: updatedUsers };
      });
      if (selectedUser?.id === clerkUserId) {
        setSelectedUser((prev: any) => (prev ? { ...prev, commandsUsed: 0 } : null));
      }
    } else {
      showToast.error(res.error || "Failed to reset limits.");
    }
    setIsResetting(null);
  };

  const handleDeleteUser = async (clerkUserId: string) => {
    if (!window.confirm("Are you absolutely sure you want to permanently delete this user? This action is irreversible and revokes all OAuth connections.")) {
      return;
    }
    setIsDeleting(clerkUserId);
    const res = await deleteUserAccount(clerkUserId);
    if (res.success) {
      showToast.success("User account deleted successfully.");
      setSelectedUser(null);
      await loadData();
    } else {
      showToast.error(res.error || "Failed to delete user.");
    }
    setIsDeleting(null);
  };

  const filteredUsers = useMemo(() => {
    if (!data?.users) return [];
    return data.users.filter((user: AdminUser) => {
      const q = searchQuery.toLowerCase();
      return user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q) || user.id.toLowerCase().includes(q);
    });
  }, [data?.users, searchQuery]);

  const filteredCommands = useMemo(() => {
    if (!data?.globalRecentCommands) return [];
    const q = promptQuery.toLowerCase();
    return data.globalRecentCommands.filter((cmd: any) => {
      const matchesStatus = promptStatus === "all" ? true : promptStatus === "pending" ? cmd.status !== "completed" && cmd.status !== "failed" : cmd.status === promptStatus;
      const matchesQuery = !q || cmd.command?.toLowerCase().includes(q) || cmd.userEmail?.toLowerCase().includes(q) || cmd.userName?.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [data?.globalRecentCommands, promptQuery, promptStatus]);

  // Client-side CSV export — the table already holds everything, so no new
  // endpoint is needed for something an admin will want within the first week.
  const exportUsersCsv = () => {
    if (!data?.users) return;
    const rows = [
      ["name", "email", "clerk_id", "plan", "commands_used", "google_connected", "github_connected", "total_tokens_est"],
      ...data.users.map((u: AdminUser) => [
        u.name,
        u.email,
        u.id,
        u.isPro ? "pro" : "standard",
        String(u.commandsUsed),
        String(u.integrations?.some((i) => i.provider === "google") || false),
        String(u.integrations?.some((i) => i.provider === "github") || false),
        String(u.tokenConsumption?.totalTokens || 0),
      ]),
    ];
    const csv = rows.map((r) => r.map((cell: string) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `auren-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading && !data) {
    return (
      <div className={`flex h-screen items-center justify-center ${SURFACE}`}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#E8593C]" size={28} />
          <span className={`font-mono text-[12px] tracking-wide ${MUTED}`}>Initializing secure session...</span>
        </div>
      </div>
    );
  }

  if (!data || !sysStatus) return null;

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "overview", label: "Overview", icon: BarChart2 },
    { key: "customers", label: "Customers & Accounts", icon: Users },
    { key: "tokens", label: "Usage & Tokens", icon: Cpu },
    { key: "prompts", label: "Prompts & Queries", icon: MessageSquare },
  ];

  return (
    <div className={`flex h-screen overflow-hidden ${SURFACE} text-[#241B14] dark:text-[#F4F4F5] text-[14px]`}>
      {/* Sidebar */}
      <aside className={`w-[260px] border-r ${RULE} flex flex-col ${SURFACE} shrink-0`}>
        <div className={`h-16 px-6 flex items-center border-b ${RULE}`}>
          <div className="flex items-center gap-2.5 font-medium text-[15px]" style={SERIF}>
            <div className="w-6 h-6 relative rounded-[6px] overflow-hidden border border-[rgba(232,89,60,0.2)]">
              <Image src="/auren_logo.webp" alt="Auren Logo" fill sizes="64px" style={{ objectFit: "cover" }} />
            </div>
            <span className="text-[17px] tracking-tight">Auren Core Admin</span>
          </div>
        </div>
        <div className="flex-1 py-6 px-4 flex flex-col gap-1.5">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all text-[13px] font-medium ${
                activeTab === t.key
                  ? `bg-white dark:bg-[#383838] border ${RULE} shadow-sm text-[#E8593C]`
                  : `${MUTED} hover:text-[#241B14] dark:hover:text-[#F4F4F5] hover:bg-[rgba(36,27,20,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)]`
              }`}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>
        <div className={`p-5 border-t ${RULE} text-[11px] font-mono ${FAINT} flex items-center justify-between`}>
          <span>SECURE INSTANCE</span>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className={`h-16 px-8 flex items-center justify-between border-b ${RULE} ${SURFACE}/90 backdrop-blur-md sticky top-0 z-10`}>
          <div className={`flex items-center gap-2 text-[13px] font-mono ${MUTED}`}>
            <Link href="/dashboard" className="hover:text-[#241B14] dark:hover:text-[#F4F4F5] transition-colors">
              auren
            </Link>
            <ChevronRight size={12} className={FAINT} />
            <span className="text-[#241B14] dark:text-[#F4F4F5] font-semibold uppercase tracking-wider text-[11px]">{activeTab}</span>
          </div>

          <button
            onClick={loadData}
            disabled={isLoading}
            className={`text-[12px] font-semibold ${MUTED} hover:text-[#E8593C] flex items-center gap-2 px-3 py-1.5 rounded-lg border ${RULE} bg-white dark:bg-[#383838] hover:bg-[#FAF8F5] dark:hover:bg-[#2C2C2C] transition-all shadow-sm`}
          >
            {isLoading ? <Loader2 size={13} className="animate-spin text-[#E8593C]" /> : <RefreshCw size={13} />}
            <span>Refresh</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 max-w-[1000px] w-full mx-auto space-y-8 pb-16">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-8">
                <div>
                  <h2 className="text-[22px] font-semibold tracking-tight" style={SERIF}>
                    Platform Overview
                  </h2>
                  <p className={`text-[12.5px] ${MUTED} mt-1`}>Real-time usage analytics and live service health.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <StatCard title="TOTAL SYSTEM USERS" value={data.totalUsers} icon={Users} subtitle="Registered user accounts" />
                  <StatCard title="PRO MEMBER ACCOUNTS" value={data.proUsers} icon={Zap} subtitle="Infinite command capabilities" highlight />
                  <StatCard title="COMMANDS PROCESSED" value={data.totalCommands.toLocaleString()} icon={TrendingUp} subtitle={`Cap: ${data.limit.toLocaleString()}/hr per user`} />
                </div>

                {/* Real, computed status breakdown — replaces the old fabricated
                    "Model Routing Latency" section, which had no source. */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <MiniStat label="Completed" value={data.statusBreakdown.completed} tone="emerald" icon={CircleCheck} />
                  <MiniStat label="Failed" value={data.statusBreakdown.failed} tone="red" icon={CircleX} />
                  <MiniStat label="Pending / Running" value={data.statusBreakdown.pending} tone="amber" icon={CircleDashed} />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Database size={16} className="text-[#E8593C]" />
                    <h3 className="text-[14px] font-semibold tracking-tight">Live Service Health</h3>
                  </div>
                  <div className={`border ${RULE} rounded-xl overflow-hidden bg-white dark:bg-[#383838] shadow-sm`}>
                    <StatusRow name="Groq — Reasoning Engine" active={sysStatus.groq} desc="Llama 3.3 70B — parses every command into an action plan" />
                    <StatusRow name="Corsair Integration Platform" active={sysStatus.corsair} desc="Gmail, Calendar & GitHub credential + execution layer" />
                    <StatusRow name="MongoDB" active={sysStatus.database} desc="Action logs, rate limits, team contacts" />
                    <StatusRow name="Resend" active={sysStatus.resend} desc="Outbound transactional email delivery" />
                    <StatusRow name="Google OAuth" active={sysStatus.googleOAuth} isLast desc="Client credentials configured for Gmail/Calendar connect" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} className="text-[#E8593C]" />
                      <h3 className="text-[14px] font-semibold tracking-tight">Latest Activity</h3>
                    </div>
                    <button onClick={() => setActiveTab("prompts")} className="text-[11.5px] font-semibold text-[#E8593C] hover:underline">
                      View all →
                    </button>
                  </div>
                  <div className={`border ${RULE} rounded-xl overflow-hidden bg-white dark:bg-[#383838] shadow-sm divide-y ${DIVIDE}`}>
                    {data.globalRecentCommands.slice(0, 5).map((cmd: any) => (
                      <div key={cmd.id} className="p-4 flex items-center gap-4">
                        <img
                          src={cmd.userImage || `https://api.dicebear.com/7.x/notionists/svg?seed=${cmd.userEmail}`}
                          alt=""
                          className={`w-7 h-7 rounded-full border ${RULE} shrink-0 ${SURFACE}`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[12.5px] truncate">{cmd.userName}</span>
                            <span className={`text-[11px] ${FAINT} font-mono truncate`}>{cmd.userEmail}</span>
                          </div>
                          <p className={`text-[12px] ${MUTED} truncate font-mono mt-0.5`}>{cmd.command}</p>
                        </div>
                        <StatusPill status={cmd.status} />
                      </div>
                    ))}
                    {data.globalRecentCommands.length === 0 && (
                      <div className={`p-10 text-center text-[13px] ${FAINT}`}>No commands logged yet.</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "customers" && (
              <motion.div key="customers" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-[22px] font-semibold tracking-tight" style={SERIF}>
                      User Account Management
                    </h2>
                    <p className={`text-[12.5px] ${MUTED} mt-1`}>Manage plan level, inspect profiles, override rate limits.</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="relative">
                      <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${FAINT}`} />
                      <input
                        type="text"
                        placeholder="Search accounts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`pl-9 pr-8 py-2 border ${RULE} bg-white dark:bg-[#383838] rounded-lg text-[13px] w-[240px] focus:outline-none focus:border-[#E8593C] transition-all shadow-sm placeholder:${FAINT}`}
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery("")} className={`absolute right-3 top-1/2 -translate-y-1/2 ${FAINT} hover:text-[#E8593C]`}>
                          <X size={12} />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={exportUsersCsv}
                      title="Export all users as CSV"
                      className={`flex items-center gap-1.5 text-[12px] font-semibold px-3 py-2 border ${RULE} bg-white dark:bg-[#383838] rounded-lg shadow-sm hover:border-[#E8593C]/40 hover:text-[#E8593C] transition-all`}
                    >
                      <Download size={13} /> Export
                    </button>
                  </div>
                </div>

                {/* Real integration coverage — computed from the same Corsair
                    credential lookups the user list already fetches. */}
                <div className="grid grid-cols-2 gap-5">
                  <CoverageCard icon={Mail} label="Connected Gmail/Calendar" count={data.integrationBreakdown.google} total={data.totalUsers} pct={data.integrationBreakdown.googlePct} />
                  <CoverageCard icon={GitBranch} label="Connected GitHub" count={data.integrationBreakdown.github} total={data.totalUsers} pct={data.integrationBreakdown.githubPct} />
                </div>

                <div className={`border ${RULE} rounded-xl overflow-hidden bg-white dark:bg-[#383838] shadow-sm`}>
                  <table className="w-full text-left text-[13px]">
                    <thead>
                      <tr className={`border-b ${RULE} ${SURFACE}/50 ${MUTED} font-mono text-[11px] tracking-wider`}>
                        <th className="px-6 py-3.5 font-medium uppercase">Customer Profile</th>
                        <th className="px-6 py-3.5 font-medium uppercase">Account Plan</th>
                        <th className="px-6 py-3.5 font-medium uppercase">Integrations</th>
                        <th className="px-6 py-3.5 font-medium uppercase">Usage & Tokens</th>
                        <th className="px-6 py-3.5 text-right font-medium uppercase">Quick Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${DIVIDE}`}>
                      {filteredUsers.map((user: AdminUser) => (
                        <tr
                          key={user.id}
                          className="hover:bg-[rgba(36,27,20,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedUser(user);
                            setDrawerTab("general");
                          }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={user.imageUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.email}`}
                                alt=""
                                className={`w-8 h-8 rounded-full border ${RULE} bg-white dark:bg-[#2C2C2C]`}
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold truncate hover:text-[#E8593C] transition-colors">{user.name}</span>
                                <span className={`text-[11.5px] ${FAINT} truncate font-mono`}>{user.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {user.isPro ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8593C]/10 text-[#E8593C] text-[11px] font-bold border border-[#E8593C]/20 uppercase tracking-wide">
                                Pro Member
                              </span>
                            ) : (
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.06)] ${MUTED} text-[11px] font-medium border ${RULE}`}>
                                Standard
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1.5">
                              {["google", "github"].map((provider) => {
                                const isConnected = user.integrations?.some((i) => i.provider === provider && i.status === "connected");
                                return (
                                  <div key={provider} className="flex items-center gap-1.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-500" : "bg-[rgba(36,27,20,0.2)] dark:bg-[rgba(255,255,255,0.2)]"}`} />
                                    <span className={`text-[11px] font-medium capitalize ${isConnected ? "" : FAINT}`}>{provider}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-2">
                              {!user.isPro ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 bg-[rgba(36,27,20,0.05)] dark:bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden shrink-0">
                                    <div
                                      className={`h-full ${user.commandsUsed >= data.limit * 0.8 ? "bg-[#E8593C]" : "bg-[#241B14] dark:bg-[#A8A29E]"}`}
                                      style={{ width: `${Math.min(100, (user.commandsUsed / data.limit) * 100)}%` }}
                                    />
                                  </div>
                                  <span className={`font-mono text-[10.5px] ${MUTED}`}>
                                    {user.commandsUsed} <span className="opacity-60">cmds</span>
                                  </span>
                                </div>
                              ) : (
                                <span className={`font-mono text-[10.5px] font-medium ${FAINT}`}>∞ commands</span>
                              )}
                              <div className="flex items-center gap-1.5">
                                <Cpu size={12} className="text-[#E8593C]" />
                                <span className="font-mono text-[10.5px]">
                                  {(user.tokenConsumption?.totalTokens || 0).toLocaleString()} <span className={FAINT}>tks (est.)</span>
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleTogglePro(user.id, user.isPro)}
                                disabled={isToggling === user.id}
                                className={`text-[11.5px] font-semibold px-2.5 py-1.5 border rounded-lg shadow-sm transition-all disabled:opacity-50 ${
                                  user.isPro
                                    ? `${MUTED} ${RULE} hover:text-[#E8593C] bg-white dark:bg-[#2C2C2C]`
                                    : "text-white border-[#E8593C] hover:bg-[#E8593C]/90 bg-[#E8593C]"
                                }`}
                              >
                                {isToggling === user.id ? "..." : user.isPro ? "Revoke Pro" : "Grant Pro"}
                              </button>

                              <button
                                onClick={() => handleResetLimit(user.supabaseId, user.id)}
                                disabled={isResetting === user.id || user.isPro}
                                title="Reset usage count"
                                className={`p-1.5 border ${RULE} bg-white dark:bg-[#2C2C2C] hover:bg-[#FAF8F5] dark:hover:bg-[#383838] rounded-lg ${MUTED} transition-all disabled:opacity-30`}
                              >
                                {isResetting === user.id ? <Loader2 size={13} className="animate-spin text-[#E8593C]" /> : <RefreshCw size={13} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={5} className={`px-6 py-16 text-center ${FAINT}`}>
                            <div className="flex flex-col items-center justify-center gap-2">
                              <Info size={20} className="opacity-40" />
                              <span className="text-[13px] font-medium">No matching accounts found</span>
                              <span className="text-[11px] opacity-70">Try modifying your search criteria.</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === "tokens" && (
              <motion.div key="tokens" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-8">
                <div>
                  <h2 className="text-[22px] font-semibold tracking-tight" style={SERIF}>
                    Usage & Token Estimates
                  </h2>
                  <p className={`text-[12.5px] ${MUTED} mt-1`}>
                    Auren's reasoning runs entirely on Groq's Llama 3.3 70B — there's no per-call token metering wired up yet, so figures below are estimated from command length and action count, not billed usage.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <StatCard title="ESTIMATED TOTAL TOKENS" value={data.globalTokenMetrics.totalTokens.toLocaleString()} icon={Cpu} subtitle={data.globalTokenMetrics.engine} highlight />
                  <StatCard title="GROQ RATE CAP" value={`${(data.globalTokenMetrics.tpmLimit / 1000).toFixed(0)}k`} icon={Zap} subtitle="Tokens per minute (free tier)" />
                  <StatCard title="ACTIVE ENGINE" value="Llama 3.3 70B" icon={Database} subtitle="Single-engine reasoning path" />
                </div>

                <div className={`p-5 border ${RULE} rounded-xl bg-white dark:bg-[#383838] shadow-sm flex items-start gap-3`}>
                  <ShieldAlert size={18} className="text-[#E8593C] shrink-0 mt-0.5" />
                  <p className={`text-[12.5px] leading-relaxed ${MUTED}`}>
                    A single oversized prompt (long email thread + full chat history) can exceed the {(data.globalTokenMetrics.tpmLimit / 1000).toFixed(0)}k TPM cap and return a 413 from Groq.
                    <code className="mx-1 px-1.5 py-0.5 rounded bg-[rgba(36,27,20,0.06)] dark:bg-[rgba(255,255,255,0.08)] font-mono text-[11.5px]">src/agents/executor.ts</code>
                    now trims email bodies and chat history before every call — watch for the <code className="mx-1 px-1.5 py-0.5 rounded bg-[rgba(36,27,20,0.06)] dark:bg-[rgba(255,255,255,0.08)] font-mono text-[11.5px]">[analyzeCommand] prompt ≈ N tokens</code> log line if failures reappear.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[14px] font-semibold tracking-tight flex items-center gap-2">
                    <TrendingUp size={16} className="text-[#E8593C]" /> Estimated Tokens by Account
                  </h3>
                  <div className={`border ${RULE} rounded-xl overflow-hidden bg-white dark:bg-[#383838] shadow-sm divide-y ${DIVIDE}`}>
                    {[...data.users]
                      .sort((a: AdminUser, b: AdminUser) => (b.tokenConsumption?.totalTokens || 0) - (a.tokenConsumption?.totalTokens || 0))
                      .slice(0, 8)
                      .map((u: AdminUser) => {
                        const max = Math.max(...data.users.map((x: AdminUser) => x.tokenConsumption?.totalTokens || 0), 1);
                        const pct = Math.round(((u.tokenConsumption?.totalTokens || 0) / max) * 100);
                        return (
                          <div key={u.id} className="p-4 flex items-center gap-4">
                            <span className="text-[12.5px] font-semibold w-[160px] truncate shrink-0">{u.name}</span>
                            <div className="flex-1 h-2 bg-[rgba(36,27,20,0.05)] dark:bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                              <div className="h-full bg-[#E8593C]" style={{ width: `${pct}%` }} />
                            </div>
                            <span className={`font-mono text-[11.5px] ${MUTED} w-[90px] text-right shrink-0`}>
                              {(u.tokenConsumption?.totalTokens || 0).toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    {data.users.length === 0 && <div className={`p-10 text-center text-[13px] ${FAINT}`}>No usage yet.</div>}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "prompts" && (
              <motion.div key="prompts" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-[22px] font-semibold tracking-tight" style={SERIF}>
                      Command History & Prompts
                    </h2>
                    <p className={`text-[12.5px] ${MUTED} mt-1`}>Live feed of every command run against the agent.</p>
                  </div>
                  <button
                    onClick={loadData}
                    className={`flex items-center gap-2 text-[11.5px] font-mono font-medium ${MUTED} hover:text-[#E8593C] transition-colors border ${RULE} bg-white dark:bg-[#383838] px-3 py-1.5 rounded-lg shadow-sm`}
                  >
                    <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} /> Sync Feed
                  </button>
                </div>

                {/* Search + status filter — the old Prompts tab had neither, which
                    made "find the failing command" a manual scroll. */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${FAINT}`} />
                    <input
                      type="text"
                      placeholder="Search commands, name, or email..."
                      value={promptQuery}
                      onChange={(e) => setPromptQuery(e.target.value)}
                      className={`w-full pl-9 pr-8 py-2 border ${RULE} bg-white dark:bg-[#383838] rounded-lg text-[13px] focus:outline-none focus:border-[#E8593C] transition-all shadow-sm`}
                    />
                  </div>
                  <div className="flex gap-1.5">
                    {(["all", "completed", "failed", "pending"] as CmdStatus[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setPromptStatus(s)}
                        className={`px-3 py-2 rounded-lg text-[11.5px] font-semibold capitalize border transition-all shadow-sm ${
                          promptStatus === s ? "bg-[#E8593C] text-white border-[#E8593C]" : `bg-white dark:bg-[#383838] ${RULE} ${MUTED} hover:text-[#E8593C]`
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`bg-white dark:bg-[#383838] border ${RULE} rounded-xl shadow-sm overflow-hidden flex flex-col`}>
                  {filteredCommands.length === 0 ? (
                    <div className={`py-20 flex flex-col items-center justify-center gap-3 ${FAINT}`}>
                      <MessageSquare size={24} className="opacity-40" />
                      <span className="text-[13px] font-medium">No commands match this filter.</span>
                    </div>
                  ) : (
                    <div className={`divide-y ${DIVIDE} max-h-[calc(100vh-260px)] overflow-y-auto custom-scrollbar`}>
                      {filteredCommands.map((cmd: any) => (
                        <div key={cmd.id} className="p-5 flex gap-4 hover:bg-[rgba(36,27,20,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)] transition-colors group">
                          <div className="shrink-0 pt-0.5">
                            <img
                              src={cmd.userImage || `https://api.dicebear.com/7.x/notionists/svg?seed=${cmd.userEmail}`}
                              alt=""
                              className={`w-9 h-9 rounded-full border ${RULE} ${SURFACE} shadow-sm`}
                            />
                          </div>
                          <div className="flex-1 flex flex-col gap-2 min-w-0">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2.5 truncate">
                                <span className="font-semibold text-[13px] truncate">{cmd.userName}</span>
                                <span className={`text-[11px] ${FAINT} font-mono truncate`}>{cmd.userEmail}</span>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <StatusPill status={cmd.status} />
                                <span className={`text-[10px] ${FAINT} font-mono`}>
                                  {new Date(cmd.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                            </div>
                            <div className={`text-[12.5px] leading-relaxed ${SURFACE} p-3.5 rounded-lg border ${RULE} font-mono shadow-inner overflow-x-auto whitespace-pre-wrap`}>
                              {cmd.command}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Detailed User Side Panel / Drawer */}
        <AnimatePresence>
          {selectedUser && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black z-40 cursor-pointer"
                onClick={() => setSelectedUser(null)}
              />

              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className={`absolute right-0 top-0 bottom-0 w-[420px] bg-white dark:bg-[#383838] border-l ${RULE} z-50 flex flex-col shadow-2xl p-0`}
              >
                <div className={`h-16 px-6 border-b ${RULE} flex items-center justify-between ${SURFACE}`}>
                  <span className="font-semibold flex items-center gap-1.5">
                    <Info size={14} className="text-[#E8593C]" />
                    <span>Customer Details</span>
                  </span>
                  <button onClick={() => setSelectedUser(null)} className={`p-1 rounded-md ${FAINT} hover:text-[#E8593C]`}>
                    <X size={18} />
                  </button>
                </div>

                <div className={`flex border-b ${RULE} ${SURFACE} px-6 select-none gap-2`}>
                  {(["general", "details", "prompts"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setDrawerTab(t)}
                      className={`font-sans text-[12px] pb-[10px] pt-[12px] px-3 relative transition-all font-semibold capitalize ${
                        drawerTab === t ? "text-[#E8593C]" : `${MUTED} hover:text-[#E8593C]`
                      }`}
                    >
                      <span>{t === "general" ? "General" : t === "details" ? "In-Depth Profile" : "Recent Prompts"}</span>
                      {drawerTab === t && <motion.div layoutId="drawerTabUnderline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E8593C]" />}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {drawerTab === "general" ? (
                    <>
                      <div className={`flex items-center gap-4 p-4 border ${RULE} rounded-xl ${SURFACE}`}>
                        <img
                          src={selectedUser.imageUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${selectedUser.email}`}
                          alt=""
                          className={`w-14 h-14 rounded-full border ${RULE} bg-white`}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-[16px] truncate">{selectedUser.name}</span>
                          <span className={`text-[12px] ${MUTED} truncate font-mono`}>{selectedUser.email}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <CopyField label="CLERK ID" value={selectedUser.id} />
                        <CopyField label="SUPABASE / CORSAIR USER ID" value={selectedUser.supabaseId} />
                      </div>

                      <div className={`space-y-4 pt-4 border-t ${RULE}`}>
                        <h4 className="font-semibold text-[13px] uppercase tracking-wide">Account Control Panel</h4>

                        <div className={`flex items-center justify-between p-3.5 border ${RULE} rounded-lg bg-white dark:bg-[#2C2C2C]`}>
                          <div className="flex flex-col">
                            <span className="font-semibold text-[12.5px]">Auren Pro Member Tier</span>
                            <span className={`text-[11px] ${FAINT}`}>Toggle user access to infinite agent actions.</span>
                          </div>
                          <button
                            onClick={() => handleTogglePro(selectedUser.id, selectedUser.isPro)}
                            disabled={isToggling === selectedUser.id}
                            className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all shadow-sm ${
                              selectedUser.isPro
                                ? "bg-[#E8593C]/10 text-[#E8593C] border-[#E8593C]/35 hover:bg-[#E8593C]/15"
                                : `bg-white dark:bg-[#383838] ${RULE} hover:bg-[#FAF8F5] dark:hover:bg-[#2C2C2C]`
                            }`}
                          >
                            {isToggling === selectedUser.id ? "Changing..." : selectedUser.isPro ? "PRO ENABLED" : "GRANT PRO"}
                          </button>
                        </div>

                        <div className={`flex items-center justify-between p-3.5 border ${RULE} rounded-lg bg-white dark:bg-[#2C2C2C]`}>
                          <div className="flex flex-col">
                            <span className="font-semibold text-[12.5px]">Reset Rate Limit Meter</span>
                            <span className={`text-[11px] ${FAINT}`}>Clear cumulative command count to zero immediately.</span>
                          </div>
                          <button
                            onClick={() => handleResetLimit(selectedUser.supabaseId, selectedUser.id)}
                            disabled={isResetting === selectedUser.id || selectedUser.isPro}
                            className={`px-3 py-1.5 rounded-lg border ${RULE} bg-white dark:bg-[#383838] text-[11px] font-bold hover:bg-[#FAF8F5] dark:hover:bg-[#2C2C2C] transition-all shadow-sm disabled:opacity-30`}
                          >
                            {isResetting === selectedUser.id ? "Resetting..." : "RESET COUNTER"}
                          </button>
                        </div>
                      </div>

                      <div className={`space-y-3 pt-4 border-t ${RULE}`}>
                        <h4 className="font-semibold text-[13px] uppercase tracking-wide flex items-center gap-1.5 text-red-600 dark:text-red-400">
                          <ShieldAlert size={14} /> Danger Zone
                        </h4>
                        <p className={`text-[11px] ${MUTED} leading-relaxed`}>
                          Deleting user profile removes authentication tokens. The user will be requested to reconnect external accounts manually.
                        </p>
                        <button
                          onClick={() => handleDeleteUser(selectedUser.id)}
                          disabled={isDeleting === selectedUser.id}
                          className="w-full flex items-center justify-center gap-2 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 text-[11.5px] font-bold py-2.5 rounded-lg transition-all shadow-sm disabled:opacity-50"
                        >
                          {isDeleting === selectedUser.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                          <span>Delete User Account & Connections</span>
                        </button>
                      </div>
                    </>
                  ) : drawerTab === "details" ? (
                    <>
                      <div className="space-y-3">
                        <h4 className={`font-semibold text-[12.5px] uppercase tracking-wider font-mono ${FAINT}`}>OAuth Integrations</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <ConnectionBadge provider="Google (Workspace)" connected={selectedUser.integrations?.some((i) => i.provider === "google" && i.status === "connected") || false} />
                          <ConnectionBadge provider="GitHub Account" connected={selectedUser.integrations?.some((i) => i.provider === "github" && i.status === "connected") || false} />
                        </div>
                      </div>

                      <div className={`space-y-4 pt-4 border-t ${RULE}`}>
                        <h4 className={`font-semibold text-[12.5px] uppercase tracking-wider font-mono ${FAINT}`}>Estimated Token Usage</h4>
                        <div className={`p-4 border ${RULE} rounded-xl ${SURFACE} space-y-3`}>
                          <div className="flex justify-between text-[12px]">
                            <span className={MUTED}>Total (estimated)</span>
                            <span className="font-mono font-bold text-[#E8593C]">{selectedUser.tokenConsumption?.totalTokens.toLocaleString() || 0}</span>
                          </div>
                          <div className={`flex justify-between text-[11.5px] font-mono ${MUTED}`}>
                            <span>Input: {(selectedUser.tokenConsumption?.inputTokens || 0).toLocaleString()}</span>
                            <span>Output: {(selectedUser.tokenConsumption?.outputTokens || 0).toLocaleString()}</span>
                          </div>
                        </div>
                        <p className={`text-[11px] ${FAINT} leading-relaxed`}>
                          Estimated from command length and action count — Groq's API doesn't return per-call usage today, so this isn't billed usage.
                        </p>
                      </div>
                    </>
                  ) : drawerTab === "prompts" ? (
                    <div className="space-y-4">
                      {!selectedUser.recentCommands || selectedUser.recentCommands.length === 0 ? (
                        <div className={`py-16 flex flex-col items-center justify-center ${FAINT}`}>
                          <MessageSquare size={24} className="mb-3 opacity-40" />
                          <span className="text-[13px] font-medium">No commands executed yet.</span>
                          <span className="text-[11px] mt-1 opacity-70">This user hasn't made any requests to Auren.</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {selectedUser.recentCommands.map((cmd) => (
                            <div key={cmd.id} className={`p-4 bg-white dark:bg-[#2C2C2C] border ${RULE} rounded-xl shadow-sm flex flex-col gap-3 group hover:border-[rgba(36,27,20,0.15)] dark:hover:border-[rgba(255,255,255,0.15)] transition-all`}>
                              <div className="flex items-center justify-between">
                                <StatusPill status={cmd.status} />
                                <span className={`text-[10px] font-mono ${FAINT}`}>
                                  {new Date(cmd.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                              <div className={`text-[12.5px] leading-relaxed ${SURFACE} p-3 rounded-lg border ${RULE} font-mono whitespace-pre-wrap max-h-[180px] overflow-y-auto custom-scrollbar shadow-inner`}>
                                {cmd.command}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>

                <div className={`p-4 border-t ${RULE} ${SURFACE} flex justify-end`}>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className={`px-4 py-2 border ${RULE} bg-white dark:bg-[#2C2C2C] text-[12px] font-semibold rounded-lg hover:bg-[#FAF8F5] dark:hover:bg-[#383838] transition-all shadow-sm`}
                  >
                    Close Panel
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  highlight = false,
}: {
  title: string;
  value: string | number;
  icon: any;
  subtitle: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-6 border rounded-xl flex flex-col gap-1.5 shadow-sm relative overflow-hidden transition-all ${
        highlight ? "border-[#E8593C]/30 bg-[#E8593C]/[0.04]" : `${RULE} bg-white dark:bg-[#383838]`
      }`}
    >
      <span className={`text-[10px] font-mono ${FAINT} tracking-wider font-semibold`}>{title}</span>
      <div className="flex items-baseline justify-between mt-1">
        <span className="text-3xl font-semibold tracking-tight">{value}</span>
        <Icon size={20} className={highlight ? "text-[#E8593C]" : FAINT} />
      </div>
      <span className={`text-[11.5px] ${FAINT} mt-1.5 leading-none`}>{subtitle}</span>
    </div>
  );
}

function MiniStat({ label, value, tone, icon: Icon }: { label: string; value: number; tone: "emerald" | "red" | "amber"; icon: any }) {
  const tones = {
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    red: "text-red-600 dark:text-red-400 bg-red-500/10",
    amber: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  } as const;
  return (
    <div className={`p-4 border ${RULE} rounded-xl bg-white dark:bg-[#383838] shadow-sm flex items-center gap-3`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tones[tone]}`}>
        <Icon size={17} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[18px] font-semibold leading-tight">{value.toLocaleString()}</span>
        <span className={`text-[11px] ${FAINT}`}>{label}</span>
      </div>
    </div>
  );
}

function CoverageCard({ icon: Icon, label, count, total, pct }: { icon: any; label: string; count: number; total: number; pct: number }) {
  return (
    <div className={`p-5 border ${RULE} rounded-xl bg-white dark:bg-[#383838] shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-2 text-[12.5px] font-semibold">
          <Icon size={15} className="text-[#E8593C]" /> {label}
        </span>
        <span className={`text-[12px] font-mono ${MUTED}`}>
          {count}/{total}
        </span>
      </div>
      <div className="w-full h-2 bg-[rgba(36,27,20,0.05)] dark:bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
        <div className="h-full bg-[#E8593C]" style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-[11px] ${FAINT} mt-1.5 block`}>{pct}% of users connected</span>
    </div>
  );
}

function StatusRow({ name, active, isLast = false, desc }: { name: string; active: boolean; isLast?: boolean; desc: string }) {
  return (
    <div className={`flex items-center justify-between p-4 transition-colors hover:bg-[rgba(36,27,20,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)] ${!isLast ? `border-b ${RULE}` : ""}`}>
      <div className="flex flex-col">
        <span className="text-[13.5px] font-semibold">{name}</span>
        <span className={`text-[11px] ${FAINT} mt-0.5`}>{desc}</span>
      </div>
      <span className="flex items-center gap-2 text-[12.5px] font-mono font-medium shrink-0 ml-4">
        {active ? (
          <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" /> Active
          </span>
        ) : (
          <span className={`inline-flex items-center gap-1.5 ${FAINT}`}>
            <div className="w-1.5 h-1.5 rounded-full bg-[rgba(36,27,20,0.15)] dark:bg-[rgba(255,255,255,0.15)]" /> Not configured
          </span>
        )}
      </span>
    </div>
  );
}
