"use client";

import React, { useState, useEffect } from "react";
import { Settings, User, Bell, Shield, GitBranch, Calendar, Mail, Key } from "lucide-react";
import { checkConnectionStatus, getConnectUrl, disconnectService } from "@/app/actions/connect";
import { useUser } from "@clerk/nextjs";

export function SettingsView() {
  const [activeTab, setActiveTab] = useState("integrations");
  const { user } = useUser();
  const [connected, setConnected] = useState({
    google: false,
    github: false,
  });
  const [loading, setLoading] = useState({
    google: false,
    github: false,
  });

  const loadStatus = async () => {
    const status = await checkConnectionStatus();
    setConnected(status);
  };

  useEffect(() => {
    loadStatus();
    
    // Polling connection status in background when window gets focus
    const handleFocus = () => loadStatus();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const handleConnect = async (service: "google" | "github") => {
    setLoading((prev) => ({ ...prev, [service]: true }));
    const res = await getConnectUrl(service);
    if (res.success && res.url) {
      window.open(res.url, "_blank");
    } else {
      alert(res.error || `Failed to connect ${service}`);
    }
    setLoading((prev) => ({ ...prev, [service]: false }));
  };

  const handleDisconnect = async (service: "google" | "github") => {
    if (!confirm(`Are you sure you want to disconnect ${service === "google" ? "Google (Gmail & Calendar)" : "GitHub"}?`)) {
      return;
    }
    setLoading((prev) => ({ ...prev, [service]: true }));
    const res = await disconnectService(service);
    if (res.success) {
      await loadStatus();
    } else {
      alert(res.error || `Failed to disconnect ${service}`);
    }
    setLoading((prev) => ({ ...prev, [service]: false }));
  };

  return (
    <div className="flex-1 flex bg-[#FAF8F5] overflow-hidden">
      {/* Settings Sidebar */}
      <div className="w-[260px] bg-white border-r border-[rgba(36,27,20,0.08)] p-6 shrink-0 flex flex-col gap-8">
        <div>
          <h2 className="font-sans font-bold text-[18px] text-[#241B14] tracking-tight mb-4">Settings</h2>
          <div className="flex flex-col gap-1">
            <button 
              onClick={() => setActiveTab("general")}
              className={`flex items-center gap-3 px-3 py-2 rounded-[8px] font-sans font-semibold text-[13px] transition-colors ${activeTab === "general" ? "bg-[rgba(232,89,60,0.08)] text-[#E8593C]" : "text-[rgba(36,27,20,0.6)] hover:bg-[rgba(36,27,20,0.04)] hover:text-[#241B14]"}`}
            >
              <Settings size={16} />
              General
            </button>
            <button 
              onClick={() => setActiveTab("integrations")}
              className={`flex items-center gap-3 px-3 py-2 rounded-[8px] font-sans font-semibold text-[13px] transition-colors ${activeTab === "integrations" ? "bg-[rgba(232,89,60,0.08)] text-[#E8593C]" : "text-[rgba(36,27,20,0.6)] hover:bg-[rgba(36,27,20,0.04)] hover:text-[#241B14]"}`}
            >
              <Shield size={16} />
              Integrations
            </button>
            <button 
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-3 px-3 py-2 rounded-[8px] font-sans font-semibold text-[13px] transition-colors ${activeTab === "notifications" ? "bg-[rgba(232,89,60,0.08)] text-[#E8593C]" : "text-[rgba(36,27,20,0.6)] hover:bg-[rgba(36,27,20,0.04)] hover:text-[#241B14]"}`}
            >
              <Bell size={16} />
              Notifications
            </button>
            <button 
              onClick={() => setActiveTab("account")}
              className={`flex items-center gap-3 px-3 py-2 rounded-[8px] font-sans font-semibold text-[13px] transition-colors ${activeTab === "account" ? "bg-[rgba(232,89,60,0.08)] text-[#E8593C]" : "text-[rgba(36,27,20,0.6)] hover:bg-[rgba(36,27,20,0.04)] hover:text-[#241B14]"}`}
            >
              <User size={16} />
              Account
            </button>
          </div>
        </div>
      </div>

      {/* Main Settings Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-[800px]">
          {activeTab === "integrations" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              <div>
                <h1 className="font-sans font-bold text-[24px] text-[#241B14] mb-2 tracking-tight">Integrations</h1>
                <p className="font-sans text-[14px] text-[rgba(36,27,20,0.6)]">Manage your connected apps and agent permissions.</p>
              </div>

              {/* Integration Card: Google (Gmail + Calendar) */}
              <div className="bg-white rounded-[16px] border border-[rgba(36,27,20,0.08)] shadow-[0_4px_24px_rgba(36,27,20,0.02)] p-6 flex flex-col gap-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[12px] bg-[rgba(234,67,53,0.1)] flex items-center justify-center text-[#EA4335]">
                      <Mail size={24} />
                    </div>
                    <div>
                      <h3 className="font-sans font-bold text-[16px] text-[#241B14]">Google integration (Gmail + Calendar)</h3>
                      <p className="font-sans text-[13px] text-[rgba(36,27,20,0.5)] mt-1">
                        {connected.google 
                          ? `Status: Active · Connected to Gmail & Calendar` 
                          : "Status: Disconnected"}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full font-sans font-bold text-[11px] uppercase tracking-wider border ${
                    connected.google 
                      ? "bg-[#E1F5EE] border-[#0F6E56] text-[#085041]" 
                      : "bg-red-50 border-red-300 text-red-700"
                  }`}>
                    {connected.google ? "Connected" : "Disconnected"}
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-[rgba(36,27,20,0.04)]">
                  {connected.google ? (
                    <>
                      <button 
                        onClick={() => handleConnect("google")}
                        disabled={loading.google}
                        className="px-4 py-2 bg-[rgba(36,27,20,0.04)] rounded-[8px] font-sans font-semibold text-[13px] text-[#241B14] hover:bg-[rgba(36,27,20,0.08)] transition-colors disabled:opacity-50"
                      >
                        Re-authenticate
                      </button>
                      <button 
                        onClick={() => handleDisconnect("google")}
                        disabled={loading.google}
                        className="px-4 py-2 border border-[rgba(234,67,53,0.3)] text-[#EA4335] rounded-[8px] font-sans font-semibold text-[13px] hover:bg-[rgba(234,67,53,0.04)] transition-colors disabled:opacity-50"
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => handleConnect("google")}
                      disabled={loading.google}
                      className="px-4 py-2 bg-[#E8593C] text-white rounded-[8px] font-sans font-semibold text-[13px] hover:bg-[#D14F31] transition-colors disabled:opacity-50"
                    >
                      Connect Google Account
                    </button>
                  )}
                </div>
              </div>

              {/* Integration Card: GitHub */}
              <div className="bg-white rounded-[16px] border border-[rgba(36,27,20,0.08)] shadow-[0_4px_24px_rgba(36,27,20,0.02)] p-6 flex flex-col gap-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[12px] bg-[rgba(36,27,20,0.06)] flex items-center justify-center text-[#241B14]">
                      <GitBranch size={24} />
                    </div>
                    <div>
                      <h3 className="font-sans font-bold text-[16px] text-[#241B14]">GitHub Issues</h3>
                      <p className="font-sans text-[13px] text-[rgba(36,27,20,0.5)] mt-1">
                        {connected.github 
                          ? "Status: Active · Create and manage repository issues" 
                          : "Status: Disconnected"}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full font-sans font-bold text-[11px] uppercase tracking-wider border ${
                    connected.github 
                      ? "bg-[#E1F5EE] border-[#0F6E56] text-[#085041]" 
                      : "bg-red-50 border-red-300 text-red-700"
                  }`}>
                    {connected.github ? "Connected" : "Disconnected"}
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-[rgba(36,27,20,0.04)]">
                  {connected.github ? (
                    <button 
                      onClick={() => handleDisconnect("github")}
                      disabled={loading.github}
                      className="px-4 py-2 border border-[rgba(234,67,53,0.3)] text-[#EA4335] rounded-[8px] font-sans font-semibold text-[13px] hover:bg-[rgba(234,67,53,0.04)] transition-colors disabled:opacity-50"
                    >
                      Disconnect GitHub
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleConnect("github")}
                      disabled={loading.github}
                      className="px-4 py-2 bg-[#241B14] text-white rounded-[8px] font-sans font-semibold text-[13px] hover:bg-[#3E2F23] transition-colors disabled:opacity-50"
                    >
                      Connect GitHub
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}

          {activeTab !== "integrations" && (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-[rgba(36,27,20,0.04)] flex items-center justify-center text-[rgba(36,27,20,0.3)] mb-4">
                <Settings size={32} />
              </div>
              <h2 className="font-sans font-bold text-[20px] text-[#241B14] mb-2 tracking-tight capitalize">{activeTab} Settings</h2>
              <p className="font-sans text-[14px] text-[rgba(36,27,20,0.5)] max-w-[400px]">
                This section is under construction. It will contain preferences for {activeTab} in a future update.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
