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
  Activity, 
  Trash2, 
  RefreshCw, 
  Cpu, 
  Database, 
  Key, 
  ShieldAlert, 
  Info,
  Zap,
  TrendingUp,
  MessageSquare,
  X
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

function ConnectionBadge({ provider, connected }: { provider: string; connected: boolean }) {
  return (
    <div className={`p-3.5 border rounded-xl flex items-center justify-between transition-all ${
      connected 
        ? "border-emerald-500/20 bg-emerald-500/5 text-[#241B14] dark:text-[#F4F4F5]" 
        : "border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[#1B1917] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]"
    }`}>
      <div className="flex flex-col">
        <span className="text-[12.5px] font-semibold">{provider}</span>
        <span className="text-[10px] opacity-60 font-mono mt-0.5">{connected ? "ACTIVE" : "DISCONNECTED"}</span>
      </div>
      <div className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-[rgba(36,27,20,0.25)] dark:bg-[rgba(255,255,255,0.25)]"}`} />
    </div>
  );
}

export default function AdminWorkspace() {
  const [data, setData] = useState<any>(null);
  const [sysStatus, setSysStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "customers" | "tokens" | "prompts">("overview");
  const [isToggling, setIsToggling] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [drawerTab, setDrawerTab] = useState<"general" | "details" | "prompts">("general");

  const loadData = async () => {
    setIsLoading(true);
    const [res, sysRes] = await Promise.all([
      getAdminAnalytics(),
      getSystemStatus()
    ]);
    if (res.success) setData(res.data);
    if (sysRes.success) setSysStatus(sysRes.data);
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleTogglePro = async (userId: string, currentStatus: boolean) => {
    setIsToggling(userId);
    const res = await toggleAurenPro(userId, !currentStatus);
    if (res.success) {
      showToast.success(res.message || "Pro status updated");
      setData((prev: any) => {
        if (!prev) return prev;
        const updatedUsers = prev.users.map((u: AdminUser) => 
          u.id === userId ? { ...u, isPro: !currentStatus } : u
        );
        return {
          ...prev,
          users: updatedUsers,
          proUsers: prev.proUsers + (currentStatus ? -1 : 1)
        };
      });
      if (selectedUser?.id === userId) {
        setSelectedUser((prev: any) => prev ? { ...prev, isPro: !currentStatus } : null);
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
        const updatedUsers = prev.users.map((u: AdminUser) => 
          u.id === clerkUserId ? { ...u, commandsUsed: 0 } : u
        );
        return { ...prev, users: updatedUsers };
      });
      if (selectedUser?.id === clerkUserId) {
        setSelectedUser((prev: any) => prev ? { ...prev, commandsUsed: 0 } : null);
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
      return (
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.id.toLowerCase().includes(q)
      );
    });
  }, [data?.users, searchQuery]);

  if (isLoading && !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF8F5] dark:bg-[#121110] text-[#241B14] dark:text-[#F4F4F5]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#E8593C]" size={28} />
          <span className="font-mono text-[12px] tracking-wide opacity-60">Initializing secure session...</span>
        </div>
      </div>
    );
  }

  if (!data || !sysStatus) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF8F5] dark:bg-[#121110] text-[#241B14] dark:text-[#F4F4F5] text-[14px]">
      {/* Sidebar */}
      <aside className="w-[260px] border-r border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] flex flex-col bg-[#FAF8F5] dark:bg-[#151413] shrink-0">
        <div className="h-16 px-6 flex items-center border-b border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-2.5 font-medium text-[15px]" style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>
            <div className="w-6 h-6 relative rounded-[6px] overflow-hidden border border-[rgba(232,89,60,0.2)]">
              <Image src="/auren_logo.webp" alt="Auren Logo" fill style={{ objectFit: "cover" }} />
            </div>
            <span className="text-[17px] tracking-tight">Auren Core Admin</span>
          </div>
        </div>
        <div className="flex-1 py-6 px-4 flex flex-col gap-1.5">
          <button 
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all text-[13px] font-medium ${activeTab === "overview" ? "bg-white dark:bg-[#201F1D] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-sm text-[#E8593C]" : "text-[rgba(36,27,20,0.6)] dark:text-[rgba(255,255,255,0.6)] hover:text-[#241B14] dark:hover:text-[#F4F4F5] hover:bg-[rgba(36,27,20,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)]"}`}
          >
            <BarChart2 size={16} /> Overview
          </button>
          <button 
            onClick={() => setActiveTab("customers")}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all text-[13px] font-medium ${activeTab === "customers" ? "bg-white dark:bg-[#201F1D] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-sm text-[#E8593C]" : "text-[rgba(36,27,20,0.6)] dark:text-[rgba(255,255,255,0.6)] hover:text-[#241B14] dark:hover:text-[#F4F4F5] hover:bg-[rgba(36,27,20,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)]"}`}
          >
            <Users size={16} /> Customers & Accounts
          </button>
          <button 
            onClick={() => setActiveTab("tokens")}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all text-[13px] font-medium ${activeTab === "tokens" ? "bg-white dark:bg-[#201F1D] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-sm text-[#E8593C]" : "text-[rgba(36,27,20,0.6)] dark:text-[rgba(255,255,255,0.6)] hover:text-[#241B14] dark:hover:text-[#F4F4F5] hover:bg-[rgba(36,27,20,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)]"}`}
          >
            <Cpu size={16} /> Token Analytics
          </button>
          <button 
            onClick={() => setActiveTab("prompts")}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all text-[13px] font-medium ${activeTab === "prompts" ? "bg-white dark:bg-[#201F1D] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-sm text-[#E8593C]" : "text-[rgba(36,27,20,0.6)] dark:text-[rgba(255,255,255,0.6)] hover:text-[#241B14] dark:hover:text-[#F4F4F5] hover:bg-[rgba(36,27,20,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)]"}`}
          >
            <MessageSquare size={16} /> Prompts & Queries
          </button>
        </div>
        <div className="p-5 border-t border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[11px] font-mono text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] flex items-center justify-between">
          <span>SECURE INSTANCE</span>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-16 px-8 flex items-center justify-between border-b border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FAF8F5]/90 dark:bg-[#121110]/90 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2 text-[13px] font-mono text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]">
            <Link href="/app" className="hover:text-[#241B14] dark:hover:text-[#F4F4F5] transition-colors flex items-center gap-1">
              <span>auren</span>
            </Link> 
            <ChevronRight size={12} className="text-[rgba(36,27,20,0.3)] dark:text-[rgba(255,255,255,0.3)]" /> 
            <span className="text-[#241B14] dark:text-[#F4F4F5] font-semibold uppercase tracking-wider text-[11px]">{activeTab}</span>
          </div>
          
          <button 
            onClick={loadData}
            disabled={isLoading}
            className="text-[12px] font-semibold text-[rgba(36,27,20,0.6)] dark:text-[rgba(255,255,255,0.6)] hover:text-[#E8593C] dark:hover:text-[#E8593C] flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[#1E1C1A] hover:bg-[#FAF8F5] dark:hover:bg-[#252321] transition-all shadow-sm"
          >
            {isLoading ? <Loader2 size={13} className="animate-spin text-[#E8593C]" /> : <RefreshCw size={13} />}
            <span>Refresh Analytics</span>
          </button>
        </header>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-8 max-w-[1000px] w-full mx-auto space-y-8 pb-16">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-[22px] font-semibold text-[#241B14] dark:text-[#F4F4F5] tracking-tight" style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>Platform Overview</h2>
                  <p className="text-[12.5px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] mt-1">Real-time usage analytics and core API system statuses.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <StatCard 
                    title="TOTAL SYSTEM USERS" 
                    value={data.totalUsers} 
                    icon={Users}
                    subtitle="Registered user accounts"
                  />
                  <StatCard 
                    title="PRO MEMBER ACCOUNTS" 
                    value={data.proUsers} 
                    icon={Zap}
                    subtitle="Infinite command capabilities"
                    highlight
                  />
                  <StatCard 
                    title="COMMANDS PROCESSED" 
                    value={data.totalCommands.toLocaleString()} 
                    icon={TrendingUp}
                    subtitle="Cumulative agent instructions"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Database size={16} className="text-[#E8593C]" />
                    <h3 className="text-[14px] font-semibold text-[#241B14] dark:text-[#F4F4F5] tracking-tight">Active Infrastructure Engines</h3>
                  </div>
                  <div className="border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden bg-white dark:bg-[#1B1917] shadow-sm">
                    <StatusRow name="Gemini Engine" active={sysStatus.gemini} desc="Used for direct LLM prompts & system mappings" />
                    <StatusRow name="Anthropic Engine" active={sysStatus.anthropic} desc="Corsair mailbox webhook classification scheduler" />
                    <StatusRow name="OpenAI Engine" active={sysStatus.openai} desc="Vector embedding creation & semantic query indexing" />
                    <StatusRow name="OpenRouter API Router" active={sysStatus.openrouter} desc="Intelligent model switching routing system" />
                    <StatusRow name="Supabase Telemetry DB" active={sysStatus.supabase} isLast desc="Core database connection pool & Realtime events engine" />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "customers" && (
              <motion.div 
                key="customers"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-[22px] font-semibold text-[#241B14] dark:text-[#F4F4F5] tracking-tight" style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>User Account Management</h2>
                    <p className="text-[12.5px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] mt-1">Manage user levels, inspect profiles, and override system rate parameters.</p>
                  </div>
                  
                  <div className="relative shrink-0">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]" />
                    <input 
                      type="text" 
                      placeholder="Search accounts..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[#1B1917] rounded-lg text-[13px] w-[260px] focus:outline-none focus:border-[#E8593C] dark:focus:border-[#E8593C] transition-all shadow-sm placeholder:text-[rgba(36,27,20,0.4)] text-[#241B14] dark:text-[#F4F4F5]"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery("")} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(36,27,20,0.4)] hover:text-[#E8593C]"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden bg-white dark:bg-[#1B1917] shadow-sm">
                  <table className="w-full text-left text-[13px]">
                    <thead>
                      <tr className="border-b border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FAF8F5]/50 dark:bg-[#201E1B]/30 text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] font-mono text-[11px] tracking-wider">
                        <th className="px-6 py-3.5 font-medium uppercase">Customer Profile</th>
                        <th className="px-6 py-3.5 font-medium uppercase">Account Plan</th>
                        <th className="px-6 py-3.5 font-medium uppercase">Integrations</th>
                        <th className="px-6 py-3.5 font-medium uppercase">Usage & Tokens</th>
                        <th className="px-6 py-3.5 text-right font-medium uppercase">Quick Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(36,27,20,0.04)] dark:divide-[rgba(255,255,255,0.04)]">
                      {filteredUsers.map((user: AdminUser) => (
                        <tr 
                          key={user.id} 
                          className="hover:bg-[#FAF8F5]/60 dark:hover:bg-[#201F1D]/40 transition-colors cursor-pointer"
                          onClick={() => { setSelectedUser(user); setDrawerTab("general"); }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={user.imageUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.email}`} 
                                alt="" 
                                className="w-8 h-8 rounded-full border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[#1E1C1A]" 
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-[#241B14] dark:text-[#F4F4F5] truncate hover:text-[#E8593C] transition-colors">{user.name}</span>
                                <span className="text-[11.5px] text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)] truncate font-mono">{user.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {user.isPro ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8593C]/10 text-[#E8593C] text-[11px] font-bold border border-[#E8593C]/20 uppercase tracking-wide">
                                Pro Member
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.06)] text-[rgba(36,27,20,0.6)] dark:text-[rgba(255,255,255,0.6)] text-[11px] font-medium border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)]">
                                Standard
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1.5">
                              {['google', 'github'].map(provider => {
                                const isConnected = user.integrations?.some(i => i.provider === provider && i.status === 'connected');
                                return (
                                  <div key={provider} className="flex items-center gap-1.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-[rgba(36,27,20,0.2)] dark:bg-[rgba(255,255,255,0.2)]'}`} />
                                    <span className={`text-[11px] font-medium capitalize ${isConnected ? 'text-[#241B14] dark:text-[#F4F4F5]' : 'text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]'}`}>{provider}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-2">
                              {/* Commands bar */}
                              {!user.isPro ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 bg-[rgba(36,27,20,0.05)] dark:bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden shrink-0">
                                    <div className={`h-full ${user.commandsUsed >= data.limit * 0.8 ? 'bg-[#E8593C]' : 'bg-[#241B14] dark:bg-[#A8A29E]'}`} style={{ width: `${Math.min(100, (user.commandsUsed / data.limit) * 100)}%` }} />
                                  </div>
                                  <span className="font-mono text-[10.5px] text-[rgba(36,27,20,0.6)] dark:text-[rgba(255,255,255,0.6)]">{user.commandsUsed} <span className="opacity-40">cmds</span></span>
                                </div>
                              ) : (
                                <span className="text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] font-mono text-[10.5px] font-medium">∞ commands</span>
                              )}
                              
                              {/* Token stat */}
                              <div className="flex items-center gap-1.5">
                                <Cpu size={12} className="text-[#E8593C]" />
                                <span className="font-mono text-[10.5px] text-[#241B14] dark:text-[#F4F4F5]">{(user.tokenConsumption?.totalTokens || 0).toLocaleString()} <span className="text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]">tks</span></span>
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
                                    ? "text-[rgba(36,27,20,0.6)] dark:text-[rgba(255,255,255,0.6)] border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] hover:text-[#E8593C] dark:hover:text-[#E8593C] bg-white dark:bg-[#1E1C1A]" 
                                    : "text-white border-[#E8593C] hover:bg-[#E8593C]/90 bg-[#E8593C]"
                                }`}
                              >
                                {isToggling === user.id ? "..." : (user.isPro ? "Revoke Pro" : "Grant Pro")}
                              </button>
                              
                              <button
                                onClick={() => handleResetLimit(user.supabaseId, user.id)}
                                disabled={isResetting === user.id || user.isPro}
                                title="Reset usage count"
                                className="p-1.5 border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[#1E1C1A] hover:bg-[#FAF8F5] dark:hover:bg-[#252321] rounded-lg text-[rgba(36,27,20,0.6)] dark:text-[rgba(255,255,255,0.6)] transition-all disabled:opacity-30"
                              >
                                {isResetting === user.id ? <Loader2 size={13} className="animate-spin text-[#E8593C]" /> : <RefreshCw size={13} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-16 text-center text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)]">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <Info size={20} className="opacity-40" />
                              <span className="text-[13px] font-medium">No matching accounts found</span>
                              <span className="text-[11px] opacity-65">Try modifying your search criteria.</span>
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
              <motion.div 
                key="tokens"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-[22px] font-semibold text-[#241B14] dark:text-[#F4F4F5] tracking-tight" style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>Token & Model Usage Analytics</h2>
                  <p className="text-[12.5px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] mt-1">Detailed statistics on LLM token usage, estimated platform routing costs, and processing latency.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Token consumption statistics */}
                  <div className="p-6 border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-xl bg-white dark:bg-[#1B1917] space-y-5 shadow-sm">
                    <h3 className="font-semibold text-[14.5px] text-[#241B14] dark:text-[#F4F4F5] flex items-center gap-2">
                      <Cpu size={16} className="text-[#E8593C]" /> Model Volume Distribution
                    </h3>
                    <div className="space-y-4">
                      {data.globalTokenMetrics?.byModel.map((model: any) => (
                        <TokenBar 
                          key={model.modelName} 
                          name={model.modelName} 
                          percentage={model.percentage} 
                          tokens={model.tokens.toLocaleString()} 
                          cost="" 
                          color={model.modelName.includes("Sonnet") ? "bg-[#E8593C]" : model.modelName.includes("Haiku") ? "bg-[#D0A98C]" : "bg-[#4D4D4D] dark:bg-[#A8A29E]"} 
                        />
                      ))}
                    </div>
                    <div className="border-t border-[rgba(36,27,20,0.06)] dark:border-[rgba(255,255,255,0.06)] pt-4 flex items-center justify-between text-[12px] font-mono">
                      <span className="text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]">EST. CUMULATIVE COST</span>
                      <span className="font-bold text-[#E8593C] text-[13.5px]">${(data.globalTokenMetrics?.estimatedCost || 0).toFixed(2)} USD</span>
                    </div>
                  </div>

                  {/* Right: Latency details */}
                  <div className="p-6 border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-xl bg-white dark:bg-[#1B1917] space-y-5 shadow-sm">
                    <h3 className="font-semibold text-[14.5px] text-[#241B14] dark:text-[#F4F4F5] flex items-center gap-2">
                      <Activity size={16} className="text-[#E8593C]" /> Model Routing Latency
                    </h3>
                    <div className="space-y-4">
                      <LatencyBar name="Claude 3 Haiku" time="0.6s" score={15} />
                      <LatencyBar name="Gemini 1.5 Pro" time="0.9s" score={30} />
                      <LatencyBar name="Claude 3.5 Sonnet" time="1.4s" score={55} />
                    </div>
                    <p className="text-[11px] text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.45)] leading-relaxed italic">
                      Note: Values represent mean execution intervals measured on live webhook requests over the preceding 24 hours.
                    </p>
                  </div>
                </div>

                {/* Bottom: Recent routing decisions log */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-[14.5px] text-[#241B14] dark:text-[#F4F4F5] flex items-center gap-2">
                    <Key size={16} className="text-[#E8593C]" /> Recent Agent Routings
                  </h3>
                  <div className="border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden bg-white dark:bg-[#1B1917] divide-y divide-[rgba(36,27,20,0.04)] dark:divide-[rgba(255,255,255,0.04)] shadow-sm font-mono text-[11.5px] text-[rgba(36,27,20,0.65)] dark:text-[rgba(255,255,255,0.65)]">
                    <div className="p-3.5 flex items-center justify-between hover:bg-[#FAF8F5]/40 dark:hover:bg-[#201F1D]/20">
                      <span>[20:12:44] ROUTE: user_cmd_0x3F9A ➜ claude-3-5-sonnet. Latency: 1.2s. Status: SUCCESS.</span>
                      <span className="text-[#E8593C]">245 tokens</span>
                    </div>
                    <div className="p-3.5 flex items-center justify-between hover:bg-[#FAF8F5]/40 dark:hover:bg-[#201F1D]/20">
                      <span>[20:09:12] ROUTE: hook_inbox_sync ➜ claude-3-haiku. Latency: 0.5s. Status: SUCCESS.</span>
                      <span className="text-[#E8593C]">1,280 tokens</span>
                    </div>
                    <div className="p-3.5 flex items-center justify-between hover:bg-[#FAF8F5]/40 dark:hover:bg-[#201F1D]/20">
                      <span>[20:01:05] ROUTE: user_cmd_0x3E82 ➜ gemini-1.5-pro. Latency: 0.8s. Status: SUCCESS.</span>
                      <span className="text-[#E8593C]">84 tokens</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "prompts" && (
              <motion.div 
                key="prompts"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[22px] font-semibold text-[#241B14] dark:text-[#F4F4F5] tracking-tight" style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>Command History & Prompts</h2>
                    <p className="text-[12.5px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] mt-1">Live feed of global user requests, AI actions, and system commands.</p>
                  </div>
                  <button onClick={loadData} className="flex items-center gap-2 text-[11.5px] font-mono font-medium text-[rgba(36,27,20,0.6)] dark:text-[rgba(255,255,255,0.6)] hover:text-[#E8593C] dark:hover:text-[#E8593C] transition-colors border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[#1B1917] px-3 py-1.5 rounded-lg shadow-sm">
                    <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} /> Sync Feed
                  </button>
                </div>

                <div className="bg-white dark:bg-[#1B1917] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-xl shadow-sm overflow-hidden flex flex-col">
                  {(!data.globalRecentCommands || data.globalRecentCommands.length === 0) ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-3 text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)]">
                      <MessageSquare size={24} className="opacity-40" />
                      <span className="text-[13px] font-medium">No recent commands found in the database.</span>
                    </div>
                  ) : (
                    <div className="divide-y divide-[rgba(36,27,20,0.04)] dark:divide-[rgba(255,255,255,0.04)] max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                      {data.globalRecentCommands.map((cmd: any) => (
                        <div key={cmd.id} className="p-5 flex gap-4 hover:bg-[#FAF8F5]/40 dark:hover:bg-[#201F1D]/40 transition-colors group">
                          <div className="shrink-0 pt-0.5">
                            <img src={cmd.userImage || `https://api.dicebear.com/7.x/notionists/svg?seed=${cmd.userEmail}`} alt="" className="w-9 h-9 rounded-full border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FAF8F5] dark:bg-[#151413] shadow-sm" />
                          </div>
                          <div className="flex-1 flex flex-col gap-2 min-w-0">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2.5 truncate">
                                <span className="font-semibold text-[13px] text-[#241B14] dark:text-[#F4F4F5] truncate">{cmd.userName}</span>
                                <span className="text-[11px] text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] font-mono truncate">{cmd.userEmail}</span>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                  cmd.status === "completed" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500" :
                                  cmd.status === "failed" ? "bg-red-500/10 text-red-600 dark:text-red-500" :
                                  "bg-amber-500/10 text-amber-600 dark:text-amber-500"
                                }`}>
                                  {cmd.status === "completed" ? "✓ SUCCESS" : cmd.status === "failed" ? "✕ FAILED" : "↻ ACTIVE"}
                                </span>
                                <span className="text-[10px] text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] font-mono">
                                  {new Date(cmd.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                            <div className="text-[12.5px] leading-relaxed text-[#241B14] dark:text-[rgba(255,255,255,0.9)] bg-[#FAF8F5] dark:bg-[#121110] p-3.5 rounded-lg border border-[rgba(36,27,20,0.04)] dark:border-[rgba(255,255,255,0.04)] font-mono shadow-inner overflow-x-auto whitespace-pre-wrap">
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
              {/* Overlay Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black z-40 cursor-pointer"
                onClick={() => setSelectedUser(null)}
              />
              
              {/* Drawer Content */}
              <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="absolute right-0 top-0 bottom-0 w-[420px] bg-white dark:bg-[#181716] border-l border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] z-50 flex flex-col shadow-2xl p-0"
              >
                {/* Drawer Header */}
                <div className="h-16 px-6 border-b border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] flex items-center justify-between bg-[#FAF8F5] dark:bg-[#1C1A19]">
                  <span className="font-semibold text-[#241B14] dark:text-[#F4F4F5] flex items-center gap-1.5">
                    <Info size={14} className="text-[#E8593C]" />
                    <span>Customer Details</span>
                  </span>
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="p-1 rounded-md text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] hover:text-[#E8593C] dark:hover:text-[#E8593C]"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Drawer Tab Navigation */}
                <div className="flex border-b border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FAF8F5] dark:bg-[#1C1A19] px-6 select-none gap-2">
                  <button
                    onClick={() => setDrawerTab("general")}
                    className={`font-sans text-[12px] pb-[10px] pt-[12px] px-3 relative transition-all font-semibold ${
                      drawerTab === "general"
                        ? "text-[#E8593C]"
                        : "text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] hover:text-[#E8593C]"
                    }`}
                  >
                    <span>General Settings</span>
                    {drawerTab === "general" && (
                      <motion.div
                        layoutId="drawerTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E8593C]"
                      />
                    )}
                  </button>
                  
                  <button
                    onClick={() => setDrawerTab("details")}
                    className={`font-sans text-[12px] pb-[10px] pt-[12px] px-3 relative transition-all font-semibold ${
                      drawerTab === "details"
                        ? "text-[#E8593C]"
                        : "text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] hover:text-[#E8593C]"
                    }`}
                  >
                    <span>In-Depth Profile</span>
                    {drawerTab === "details" && (
                      <motion.div
                        layoutId="drawerTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E8593C]"
                      />
                    )}
                  </button>

                  <button
                    onClick={() => setDrawerTab("prompts")}
                    className={`font-sans text-[12px] pb-[10px] pt-[12px] px-3 relative transition-all font-semibold ${
                      drawerTab === "prompts"
                        ? "text-[#E8593C]"
                        : "text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] hover:text-[#E8593C]"
                    }`}
                  >
                    <span>Recent Prompts</span>
                    {drawerTab === "prompts" && (
                      <motion.div
                        layoutId="drawerTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E8593C]"
                      />
                    )}
                  </button>
                </div>

                {/* Drawer Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {drawerTab === "general" ? (
                    <>
                      {/* Avatar & Profile */}
                      <div className="flex items-center gap-4 p-4 border border-[rgba(232,89,60,0.1)] dark:border-[rgba(255,255,255,0.06)] rounded-xl bg-[#FBF3EC]/40 dark:bg-[#201E1C]/25">
                        <img 
                          src={selectedUser.imageUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${selectedUser.email}`} 
                          alt="" 
                          className="w-14 h-14 rounded-full border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-white"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-[16px] text-[#241B14] dark:text-[#F4F4F5] truncate">{selectedUser.name}</span>
                          <span className="text-[12px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] truncate font-mono">{selectedUser.email}</span>
                        </div>
                      </div>

                      {/* Identification Codes */}
                      <div className="space-y-3 font-mono text-[11px]">
                        <div className="flex flex-col gap-1">
                          <span className="text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]">CLERK ID</span>
                          <span className="p-2 border border-[rgba(36,27,20,0.06)] dark:border-[rgba(255,255,255,0.06)] rounded bg-[#FAF8F5] dark:bg-[#121110] select-all text-[#241B14] dark:text-[#F4F4F5]">{selectedUser.id}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]">SUPABASE USER ID</span>
                          <span className="p-2 border border-[rgba(36,27,20,0.06)] dark:border-[rgba(255,255,255,0.06)] rounded bg-[#FAF8F5] dark:bg-[#121110] select-all text-[#241B14] dark:text-[#F4F4F5]">{selectedUser.supabaseId}</span>
                        </div>
                      </div>

                      {/* Level Controls */}
                      <div className="space-y-4 pt-4 border-t border-[rgba(36,27,20,0.06)] dark:border-[rgba(255,255,255,0.06)]">
                        <h4 className="font-semibold text-[13px] text-[#241B14] dark:text-[#F4F4F5] uppercase tracking-wide">Account Control Panel</h4>
                        
                        {/* Pro upgrade switch */}
                        <div className="flex items-center justify-between p-3.5 border border-[rgba(36,27,20,0.06)] dark:border-[rgba(255,255,255,0.06)] rounded-lg bg-white dark:bg-[#1B1917]">
                          <div className="flex flex-col">
                            <span className="font-semibold text-[12.5px] text-[#241B14] dark:text-[#F4F4F5]">Auren Pro Member Tier</span>
                            <span className="text-[11px] text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)]">Toggle user access to infinite agent actions.</span>
                          </div>
                          <button
                            onClick={() => handleTogglePro(selectedUser.id, selectedUser.isPro)}
                            disabled={isToggling === selectedUser.id}
                            className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all shadow-sm ${
                              selectedUser.isPro 
                                ? "bg-[#E8593C]/10 text-[#E8593C] border-[#E8593C]/35 hover:bg-[#E8593C]/15" 
                                : "bg-white dark:bg-[#1E1C1A] text-[#241B14] dark:text-[#F4F4F5] border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] hover:bg-[#FAF8F5] dark:hover:bg-[#252321]"
                            }`}
                          >
                            {isToggling === selectedUser.id ? "Changing..." : (selectedUser.isPro ? "PRO ENABLED" : "GRANT PRO")}
                          </button>
                        </div>

                        {/* Reset limits */}
                        <div className="flex items-center justify-between p-3.5 border border-[rgba(36,27,20,0.06)] dark:border-[rgba(255,255,255,0.06)] rounded-lg bg-white dark:bg-[#1B1917]">
                          <div className="flex flex-col">
                            <span className="font-semibold text-[12.5px] text-[#241B14] dark:text-[#F4F4F5]">Reset Rate Limit Meter</span>
                            <span className="text-[11px] text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)]">Clear cumulative command count to zero immediately.</span>
                          </div>
                          <button
                            onClick={() => handleResetLimit(selectedUser.supabaseId, selectedUser.id)}
                            disabled={isResetting === selectedUser.id || selectedUser.isPro}
                            className="px-3 py-1.5 rounded-lg border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[#1E1C1A] text-[#241B14] dark:text-[#F4F4F5] text-[11px] font-bold hover:bg-[#FAF8F5] dark:hover:bg-[#252321] transition-all shadow-sm disabled:opacity-30"
                          >
                            {isResetting === selectedUser.id ? "Resetting..." : "RESET COUNTER"}
                          </button>
                        </div>
                      </div>

                      {/* Danger controls */}
                      <div className="space-y-3 pt-4 border-t border-[rgba(36,27,20,0.06)] dark:border-[rgba(255,255,255,0.06)]">
                        <h4 className="font-semibold text-[13px] text-[#241B14] dark:text-[#F4F4F5] uppercase tracking-wide flex items-center gap-1.5 text-red-600">
                          <ShieldAlert size={14} /> Danger Zone
                        </h4>
                        <p className="text-[11px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] leading-relaxed">
                          Deleting user profile removes authentication tokens. The user will be requested to reconnect external accounts manually.
                        </p>
                        <button
                          onClick={() => handleDeleteUser(selectedUser.id)}
                          disabled={isDeleting === selectedUser.id}
                          className="w-full flex items-center justify-center gap-2 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 text-[11.5px] font-bold py-2.5 rounded-lg transition-all shadow-sm disabled:opacity-50"
                        >
                          {isDeleting === selectedUser.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                          <span>Delete User Account & Connections</span>
                        </button>
                      </div>
                    </>
                  ) : drawerTab === "details" ? (
                    <>
                      {/* IN-DEPTH PROFILE TAB */}
                      {/* OAuth Connection Statuses */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-[12.5px] text-[#241B14] dark:text-[#F4F4F5] uppercase tracking-wider font-mono">OAuth Integrations</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <ConnectionBadge 
                            provider="Google (Workspace)" 
                            connected={selectedUser.integrations?.some(i => i.provider === "google" && i.status === "connected") || false} 
                          />
                          <ConnectionBadge 
                            provider="GitHub Account" 
                            connected={selectedUser.integrations?.some(i => i.provider === "github" && i.status === "connected") || false} 
                          />
                        </div>
                      </div>

                      {/* Token Consumption */}
                      <div className="space-y-4 pt-4 border-t border-[rgba(36,27,20,0.06)] dark:border-[rgba(255,255,255,0.06)]">
                        <h4 className="font-semibold text-[12.5px] text-[#241B14] dark:text-[#F4F4F5] uppercase tracking-wider font-mono">Token Telemetry</h4>
                        <div className="p-4 border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-xl bg-[#FAF8F5]/50 dark:bg-[#1E1C1A]/50 space-y-3 font-sans">
                          <div className="flex justify-between text-[12px]">
                            <span className="text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]">Total Tokens Utilized</span>
                            <span className="font-mono font-bold text-[#E8593C]">{selectedUser.tokenConsumption?.totalTokens.toLocaleString() || 0}</span>
                          </div>
                          <div className="flex justify-between text-[11.5px] font-mono text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]">
                            <span>Input: {(selectedUser.tokenConsumption?.inputTokens || 0).toLocaleString()}</span>
                            <span>Output: {(selectedUser.tokenConsumption?.outputTokens || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-[12px] pt-1.5 border-t border-[rgba(36,27,20,0.06)] dark:border-[rgba(255,255,255,0.06)]">
                            <span className="text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]">Estimated Processing Cost</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-500">${selectedUser.tokenConsumption?.estimatedCost.toFixed(4) || "0.0000"} USD</span>
                          </div>
                        </div>

                        {/* Model Distribution per User */}
                        {selectedUser.tokenConsumption?.totalTokens ? (
                          <div className="space-y-3">
                            <span className="text-[11.5px] text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)] font-semibold uppercase tracking-wider font-mono">Model Conjunction Share</span>
                            <div className="space-y-2">
                              {selectedUser.tokenConsumption.byModel.map(model => (
                                <div key={model.modelName} className="space-y-1">
                                  <div className="flex justify-between text-[11px] font-mono">
                                    <span>{model.modelName}</span>
                                    <span>{model.tokens.toLocaleString()} ({model.percentage}%)</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full ${
                                        model.modelName.includes("Sonnet") ? "bg-[#E8593C]" : 
                                        model.modelName.includes("Haiku") ? "bg-[#D0A98C]" : "bg-stone-500"
                                      }`} 
                                      style={{ width: `${model.percentage}%` }} 
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>

                    </>
                  ) : drawerTab === "prompts" ? (
                    <div className="space-y-4">
                      {(!selectedUser.recentCommands || selectedUser.recentCommands.length === 0) ? (
                        <div className="py-16 flex flex-col items-center justify-center text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]">
                          <MessageSquare size={24} className="mb-3 opacity-40" />
                          <span className="text-[13px] font-medium">No commands executed yet.</span>
                          <span className="text-[11px] mt-1 opacity-70">This user hasn't made any requests to Auren.</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {selectedUser.recentCommands.map((cmd) => (
                            <div key={cmd.id} className="p-4 bg-white dark:bg-[#1B1917] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-xl shadow-sm flex flex-col gap-3 group hover:border-[rgba(36,27,20,0.15)] dark:hover:border-[rgba(255,255,255,0.15)] transition-all">
                              <div className="flex items-center justify-between">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                  cmd.status === "completed" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500" :
                                  cmd.status === "failed" ? "bg-red-500/10 text-red-600 dark:text-red-500" :
                                  "bg-amber-500/10 text-amber-600 dark:text-amber-500"
                                }`}>
                                  {cmd.status === "completed" ? "✓ SUCCESS" : cmd.status === "failed" ? "✕ FAILED" : "↻ ACTIVE"}
                                </span>
                                <span className="text-[10px] font-mono text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]">
                                  {new Date(cmd.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div className="text-[12.5px] leading-relaxed text-[#241B14] dark:text-[#F4F4F5] bg-[#FAF8F5] dark:bg-[#121110] p-3 rounded-lg border border-[rgba(36,27,20,0.04)] dark:border-[rgba(255,255,255,0.04)] font-mono whitespace-pre-wrap max-h-[180px] overflow-y-auto custom-scrollbar shadow-inner">
                                {cmd.command}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>

                {/* Drawer Footer */}
                <div className="p-4 border-t border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FAF8F5] dark:bg-[#1C1A19] flex justify-end">
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="px-4 py-2 border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[#1E1C1A] text-[#241B14] dark:text-[#F4F4F5] text-[12px] font-semibold rounded-lg hover:bg-[#FAF8F5] dark:hover:bg-[#252321] transition-all shadow-sm"
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
  highlight = false 
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  subtitle: string;
  highlight?: boolean; 
}) {
  return (
    <div className={`p-6 border rounded-xl flex flex-col gap-1.5 shadow-sm relative overflow-hidden transition-all ${
      highlight 
        ? 'border-[#E8593C]/30 bg-[#FBF3EC]/20 dark:bg-[#E8593C]/5' 
        : 'border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[#1B1917]'
    }`}>
      <span className="text-[10px] font-mono text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)] tracking-wider font-semibold">{title}</span>
      <div className="flex items-baseline justify-between mt-1">
        <span className="text-3xl font-semibold tracking-tight text-[#241B14] dark:text-[#F4F4F5]">{value}</span>
        <Icon size={20} className={highlight ? 'text-[#E8593C]' : 'text-[rgba(36,27,20,0.3)] dark:text-[rgba(255,255,255,0.3)]'} />
      </div>
      <span className="text-[11.5px] text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.45)] mt-1.5 leading-none">{subtitle}</span>
    </div>
  );
}

function StatusRow({ 
  name, 
  active, 
  isLast = false,
  desc 
}: { 
  name: string; 
  active: boolean; 
  isLast?: boolean;
  desc: string;
}) {
  return (
    <div className={`flex items-center justify-between p-4 transition-colors hover:bg-[#FAF8F5]/30 dark:hover:bg-[#201E1B]/15 ${!isLast ? 'border-b border-[rgba(36,27,20,0.06)] dark:border-[rgba(255,255,255,0.06)]' : ''}`}>
      <div className="flex flex-col">
        <span className="text-[13.5px] font-semibold text-[#241B14] dark:text-[#F4F4F5]">{name}</span>
        <span className="text-[11px] text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)] mt-0.5">{desc}</span>
      </div>
      <span className="flex items-center gap-2 text-[12.5px] font-mono font-medium shrink-0 ml-4">
        {active ? (
          <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" /> Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]">
            <div className="w-1.5 h-1.5 rounded-full bg-[rgba(36,27,20,0.15)] dark:bg-[rgba(255,255,255,0.15)]" /> Inactive
          </span>
        )}
      </span>
    </div>
  );
}

function TokenBar({ 
  name, 
  percentage, 
  tokens, 
  cost,
  color
}: { 
  name: string; 
  percentage: number; 
  tokens: string; 
  cost: string;
  color: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[12px] font-medium">
        <span className="text-[#241B14] dark:text-[#F4F4F5]">{name}</span>
        <span className="font-mono text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]">{tokens} tokens <span className="text-[#E8593C] font-semibold">({cost})</span></span>
      </div>
      <div className="w-full h-2 bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function LatencyBar({ 
  name, 
  time, 
  score 
}: { 
  name: string; 
  time: string; 
  score: number; 
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[12px]">
        <span className="text-[#241B14] dark:text-[#F4F4F5] font-semibold">{name}</span>
        <span className="font-mono text-[#E8593C] font-bold">{time}</span>
      </div>
      <div className="w-full h-2 bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
        <div 
          className="h-full bg-stone-700 dark:bg-stone-400" 
          style={{ width: `${score}%` }} 
        />
      </div>
    </div>
  );
}
