"use client";

import React, { useState, useEffect } from "react";
import { getAdminAnalytics, getSystemStatus, toggleAurenPro, AdminUser } from "@/app/actions/admin";
import { Loader2, Users, BarChart2, Search, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AdminWorkspace() {
  const [data, setData] = useState<any>(null);
  const [sysStatus, setSysStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "customers">("overview");
  const [isToggling, setIsToggling] = useState<string | null>(null);

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
    if (res.success) await loadData();
    else alert(res.error);
    setIsToggling(null);
  };

  if (isLoading && !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF8F5] text-[rgba(36,27,20,0.5)]">
        <Loader2 className="animate-spin" size={20} />
      </div>
    );
  }

  if (!data || !sysStatus) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF8F5] text-[#241B14] text-[14px]">
      {/* Sidebar */}
      <aside className="w-[240px] border-r border-[rgba(36,27,20,0.08)] flex flex-col bg-[#FAF8F5] shrink-0">
        <div className="h-14 px-4 flex items-center border-b border-[rgba(36,27,20,0.08)]">
          <div className="flex items-center gap-2 font-medium text-[14px]" style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>
            <div className="w-5 h-5 relative rounded-[4px] overflow-hidden">
              <Image src="/auren_logo.webp" alt="Auren Logo" fill style={{ objectFit: "cover" }} />
            </div>
            Auren Admin
          </div>
        </div>
        <div className="flex-1 py-4 px-3 flex flex-col gap-1">
          <button 
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors text-[13px] ${activeTab === "overview" ? "bg-white border border-[rgba(36,27,20,0.08)] shadow-sm font-medium text-[#241B14]" : "text-[rgba(36,27,20,0.6)] hover:text-[#241B14] hover:bg-[rgba(36,27,20,0.04)]"}`}
          >
            <BarChart2 size={16} /> Overview
          </button>
          <button 
            onClick={() => setActiveTab("customers")}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors text-[13px] ${activeTab === "customers" ? "bg-white border border-[rgba(36,27,20,0.08)] shadow-sm font-medium text-[#241B14]" : "text-[rgba(36,27,20,0.6)] hover:text-[#241B14] hover:bg-[rgba(36,27,20,0.04)]"}`}
          >
            <Users size={16} /> Customers
          </button>
        </div>
        <div className="p-4 border-t border-[rgba(36,27,20,0.08)] text-[12px] text-[rgba(36,27,20,0.5)]">
          System Workspace
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="h-14 px-8 flex items-center justify-between border-b border-[rgba(36,27,20,0.08)] bg-[#FAF8F5] sticky top-0 z-10">
          <div className="flex items-center gap-2 text-[14px] text-[rgba(36,27,20,0.6)]">
            <Link href="/app" className="hover:text-[#241B14] transition-colors">Auren</Link> 
            <ChevronRight size={14} className="text-[rgba(36,27,20,0.3)]" /> 
            <span className="text-[#241B14] font-medium capitalize">{activeTab}</span>
          </div>
          <button 
            onClick={loadData}
            disabled={isLoading}
            className="text-[13px] text-[rgba(36,27,20,0.6)] hover:text-[#241B14] flex items-center gap-2 px-3 py-1.5 rounded-md border border-transparent hover:border-[rgba(36,27,20,0.08)] hover:bg-white transition-all"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : "Refresh Data"}
          </button>
        </header>

        {/* Content Body */}
        <div className="p-8 max-w-[1000px] w-full mx-auto">
          {activeTab === "overview" && (
            <div className="flex flex-col gap-8 animate-in fade-in duration-200">
              <h2 className="text-2xl font-semibold tracking-tight text-[#241B14]" style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>Overview</h2>
              
              <div className="grid grid-cols-3 gap-4">
                <StatCard title="Total Users" value={data.totalUsers} />
                <StatCard title="Pro Accounts" value={data.proUsers} />
                <StatCard title="Global Commands" value={data.totalCommands.toLocaleString()} />
              </div>

              <div className="mt-4">
                <h3 className="text-[15px] font-medium mb-4 text-[#241B14]">Infrastructure Routing</h3>
                <div className="border border-[rgba(36,27,20,0.08)] rounded-lg overflow-hidden bg-white shadow-sm">
                  <StatusRow name="Gemini Engine" active={sysStatus.gemini} />
                  <StatusRow name="Anthropic Engine" active={sysStatus.anthropic} />
                  <StatusRow name="OpenAI Engine" active={sysStatus.openai} />
                  <StatusRow name="OpenRouter Fallback" active={sysStatus.openrouter} />
                  <StatusRow name="Supabase Telemetry" active={sysStatus.supabase} isLast />
                </div>
              </div>
            </div>
          )}

          {activeTab === "customers" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold tracking-tight text-[#241B14]" style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>Customers</h2>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(36,27,20,0.5)]" />
                  <input 
                    type="text" 
                    placeholder="Search users..." 
                    className="pl-8 pr-4 py-1.5 border border-[rgba(36,27,20,0.08)] bg-white rounded-md text-[13px] w-[240px] focus:outline-none focus:border-[#241B14] transition-colors shadow-sm placeholder:text-[rgba(36,27,20,0.4)]"
                  />
                </div>
              </div>

              <div className="border border-[rgba(36,27,20,0.08)] rounded-lg overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-[rgba(36,27,20,0.08)] bg-[#FAF8F5]/50 text-[rgba(36,27,20,0.6)]">
                      <th className="px-5 py-3 font-medium">Customer</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Usage</th>
                      <th className="px-5 py-3 text-right font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(36,27,20,0.04)]">
                    {data.users.map((user: AdminUser) => (
                      <tr key={user.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <img src={user.imageUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.email}`} alt="" className="w-8 h-8 rounded-full border border-[rgba(36,27,20,0.08)]" />
                            <div className="flex flex-col">
                              <span className="font-medium text-[#241B14]">{user.name}</span>
                              <span className="text-[rgba(36,27,20,0.5)]">{user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          {user.isPro ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#E8593C]/10 text-[#E8593C] text-[12px] font-medium border border-[#E8593C]/20">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#E8593C]" /> Pro
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[rgba(36,27,20,0.04)] text-[rgba(36,27,20,0.6)] text-[12px] font-medium border border-[rgba(36,27,20,0.08)]">
                              <div className="w-1.5 h-1.5 rounded-full bg-[rgba(36,27,20,0.4)]" /> Standard
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          {user.isPro ? (
                            <span className="text-[rgba(36,27,20,0.6)] font-medium">Unlimited</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-1.5 bg-[rgba(36,27,20,0.04)] rounded-full overflow-hidden inset-shadow-sm">
                                <div 
                                  className="h-full bg-[#241B14]" 
                                  style={{ width: `${Math.min(100, (user.commandsUsed / data.limit) * 100)}%` }}
                                />
                              </div>
                              <span className="text-[rgba(36,27,20,0.6)]">{user.commandsUsed} / {data.limit}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => handleTogglePro(user.id, user.isPro)}
                            disabled={isToggling === user.id}
                            className={`text-[12px] font-medium px-3 py-1.5 border rounded-md shadow-sm transition-all disabled:opacity-50 ${
                              user.isPro 
                                ? "text-[rgba(36,27,20,0.6)] border-[rgba(36,27,20,0.08)] hover:text-red-600 hover:border-red-200 bg-white" 
                                : "text-[#241B14] border-[rgba(36,27,20,0.08)] hover:border-[#E8593C]/30 hover:text-[#E8593C] bg-white"
                            }`}
                          >
                            {isToggling === user.id ? "..." : (user.isPro ? "Revoke" : "Upgrade")}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {data.users.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-12 text-center text-[rgba(36,27,20,0.4)] text-[13px]">
                          No customers found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="p-5 border border-[rgba(36,27,20,0.08)] rounded-lg bg-white flex flex-col gap-1 shadow-sm">
      <span className="text-[13px] text-[rgba(36,27,20,0.6)] font-medium">{title}</span>
      <span className="text-3xl font-semibold tracking-tight text-[#241B14]">{value}</span>
    </div>
  );
}

function StatusRow({ name, active, isLast = false }: { name: string; active: boolean; isLast?: boolean }) {
  return (
    <div className={`flex items-center justify-between p-4 ${!isLast ? 'border-b border-[rgba(36,27,20,0.08)]' : ''}`}>
      <span className="text-[14px] font-medium text-[#241B14]">{name}</span>
      <span className="flex items-center gap-2 text-[13px]">
        {active ? (
          <><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" /> <span className="text-[#241B14] font-medium">Active</span></>
        ) : (
          <><div className="w-2 h-2 rounded-full bg-[rgba(36,27,20,0.2)]" /> <span className="text-[rgba(36,27,20,0.5)]">Inactive</span></>
        )}
      </span>
    </div>
  );
}
