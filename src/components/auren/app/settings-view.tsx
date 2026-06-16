"use client";

import React, { useState, useEffect } from "react";
import { Settings, User, Bell, Shield, GitBranch, Mail, Clock, Globe, MessageSquare, Sun, Moon, Volume2, ShieldCheck, MailCheck, Database, Key, CreditCard, Zap } from "lucide-react";
import { checkConnectionStatus, getConnectUrl, disconnectService } from "@/app/actions/connect";
import { useUser } from "@clerk/nextjs";

export function SettingsView() {
  const [activeTab, setActiveTab] = useState("integrations");
  const { user } = useUser();
  
  // Connection states
  const [connected, setConnected] = useState({
    google: false,
    github: false,
  });
  const [loading, setLoading] = useState({
    google: false,
    github: false,
  });

  // Local preferences states
  const [theme, setTheme] = useState("light");
  const [replyTone, setReplyTone] = useState("formal");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [workingHours, setWorkingHours] = useState({ start: "09:00", end: "18:00" });
  const [subscriptionTier, setSubscriptionTier] = useState("Auren Pro Dev");

  // Notification states
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    weeklyDigest: false,
    soundEffects: true,
    pushAlerts: true,
  });

  const loadStatus = async () => {
    const status = await checkConnectionStatus();
    setConnected(status);
  };

  useEffect(() => {
    loadStatus();
    
    // Load local settings from localStorage
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("auren_theme") || "light";
      const savedTone = localStorage.getItem("auren_reply_tone") || "formal";
      const savedTimezone = localStorage.getItem("auren_timezone") || "Asia/Kolkata";
      const savedTier = localStorage.getItem("auren_subscription_tier") || "Auren Pro Dev";
      setTheme(savedTheme);
      setReplyTone(savedTone);
      setTimezone(savedTimezone);
      setSubscriptionTier(savedTier);
    }

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

  const saveGeneralSettings = () => {
    localStorage.setItem("auren_theme", theme);
    localStorage.setItem("auren_reply_tone", replyTone);
    localStorage.setItem("auren_timezone", timezone);
    alert("Settings saved successfully!");
  };

  return (
    <div className="flex-1 flex bg-[#FAF8F5] overflow-hidden selection:bg-[#E8593C] selection:text-white">
      {/* Settings Sidebar */}
      <div className="w-[260px] bg-white border-r border-[rgba(36,27,20,0.08)] p-6 shrink-0 flex flex-col gap-8">
        <div>
          <h2 className="font-sans font-bold text-[18px] text-[#241B14] tracking-tight mb-4">Settings</h2>
          <div className="flex flex-col gap-1">
            <button 
              onClick={() => setActiveTab("general")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[8px] font-sans font-semibold text-[13px] transition-colors ${activeTab === "general" ? "bg-[rgba(232,89,60,0.08)] text-[#E8593C]" : "text-[rgba(36,27,20,0.6)] hover:bg-[rgba(36,27,20,0.04)] hover:text-[#241B14]"}`}
            >
              <Settings size={16} />
              General
            </button>
            <button 
              onClick={() => setActiveTab("integrations")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[8px] font-sans font-semibold text-[13px] transition-colors ${activeTab === "integrations" ? "bg-[rgba(232,89,60,0.08)] text-[#E8593C]" : "text-[rgba(36,27,20,0.6)] hover:bg-[rgba(36,27,20,0.04)] hover:text-[#241B14]"}`}
            >
              <Shield size={16} />
              Integrations
            </button>
            <button 
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[8px] font-sans font-semibold text-[13px] transition-colors ${activeTab === "notifications" ? "bg-[rgba(232,89,60,0.08)] text-[#E8593C]" : "text-[rgba(36,27,20,0.6)] hover:bg-[rgba(36,27,20,0.04)] hover:text-[#241B14]"}`}
            >
              <Bell size={16} />
              Notifications
            </button>
            <button 
              onClick={() => setActiveTab("account")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[8px] font-sans font-semibold text-[13px] transition-colors ${activeTab === "account" ? "bg-[rgba(232,89,60,0.08)] text-[#E8593C]" : "text-[rgba(36,27,20,0.6)] hover:bg-[rgba(36,27,20,0.04)] hover:text-[#241B14]"}`}
            >
              <User size={16} />
              Account
            </button>
            <button 
              onClick={() => setActiveTab("subscription")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[8px] font-sans font-semibold text-[13px] transition-colors ${activeTab === "subscription" ? "bg-[rgba(232,89,60,0.08)] text-[#E8593C]" : "text-[rgba(36,27,20,0.6)] hover:bg-[rgba(36,27,20,0.04)] hover:text-[#241B14]"}`}
            >
              <CreditCard size={16} />
              Subscription
            </button>
          </div>
        </div>
      </div>

      {/* Main Settings Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-[700px]">
          
          {/* GENERAL TAB */}
          {activeTab === "general" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              <div>
                <h1 className="font-sans font-bold text-[24px] text-[#241B14] mb-2 tracking-tight">General settings</h1>
                <p className="font-sans text-[14px] text-[rgba(36,27,20,0.6)]">Configure your workspace defaults and agent behaviors.</p>
              </div>

              <div className="bg-white rounded-[16px] border border-[rgba(36,27,20,0.08)] shadow-[0_4px_24px_rgba(36,27,20,0.02)] p-6 flex flex-col gap-6">
                
                {/* Tone Selector */}
                <div className="flex flex-col gap-2">
                  <label className="font-sans font-semibold text-[13px] text-[#241B14] flex items-center gap-2">
                    <MessageSquare size={15} className="text-[#E8593C]" />
                    AI Agent Reply Tone
                  </label>
                  <select 
                    value={replyTone}
                    onChange={(e) => setReplyTone(e.target.value)}
                    className="w-full h-10 px-3 bg-[#FAF8F5] border border-[rgba(36,27,20,0.08)] rounded-[10px] font-sans text-[13px] text-[#241B14] focus:outline-none focus:border-[#E8593C] transition-colors"
                  >
                    <option value="formal">Formal & Professional</option>
                    <option value="casual">Casual & Friendly</option>
                    <option value="friendly">Warm & Empathetic</option>
                    <option value="professional">Direct & Concise</option>
                  </select>
                </div>

                {/* Timezone */}
                <div className="flex flex-col gap-2">
                  <label className="font-sans font-semibold text-[13px] text-[#241B14] flex items-center gap-2">
                    <Globe size={15} className="text-[#E8593C]" />
                    Default Timezone
                  </label>
                  <select 
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full h-10 px-3 bg-[#FAF8F5] border border-[rgba(36,27,20,0.08)] rounded-[10px] font-sans text-[13px] text-[#241B14] focus:outline-none focus:border-[#E8593C] transition-colors"
                  >
                    <option value="Asia/Kolkata">Kolkata, India (IST)</option>
                    <option value="America/New_York">New York, USA (EST)</option>
                    <option value="Europe/London">London, UK (GMT)</option>
                    <option value="Asia/Tokyo">Tokyo, Japan (JST)</option>
                  </select>
                </div>

                {/* Working hours */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-sans font-semibold text-[13px] text-[#241B14] flex items-center gap-2">
                      <Clock size={15} className="text-[#E8593C]" />
                      Working Hours Start
                    </label>
                    <input 
                      type="time" 
                      value={workingHours.start}
                      onChange={(e) => setWorkingHours(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full h-10 px-3 bg-[#FAF8F5] border border-[rgba(36,27,20,0.08)] rounded-[10px] font-sans text-[13px] text-[#241B14] focus:outline-none focus:border-[#E8593C] transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-sans font-semibold text-[13px] text-[#241B14] flex items-center gap-2">
                      <Clock size={15} className="text-[#E8593C]" />
                      Working Hours End
                    </label>
                    <input 
                      type="time" 
                      value={workingHours.end}
                      onChange={(e) => setWorkingHours(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full h-10 px-3 bg-[#FAF8F5] border border-[rgba(36,27,20,0.08)] rounded-[10px] font-sans text-[13px] text-[#241B14] focus:outline-none focus:border-[#E8593C] transition-colors"
                    />
                  </div>
                </div>

                {/* Theme Mode */}
                <div className="flex flex-col gap-2">
                  <label className="font-sans font-semibold text-[13px] text-[#241B14] flex items-center gap-2">
                    <Sun size={15} className="text-[#E8593C]" />
                    Appearance Theme
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setTheme("light")}
                      className={`h-11 rounded-[10px] border font-sans font-semibold text-[12px] flex items-center justify-center gap-2 transition-all ${
                        theme === "light" 
                          ? "border-[#E8593C] bg-[rgba(232,89,60,0.04)] text-[#E8593C]" 
                          : "border-[rgba(36,27,20,0.08)] text-[rgba(36,27,20,0.6)] bg-white hover:border-[rgba(36,27,20,0.15)]"
                      }`}
                    >
                      <Sun size={14} /> Light Mode
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={`h-11 rounded-[10px] border font-sans font-semibold text-[12px] flex items-center justify-center gap-2 transition-all ${
                        theme === "dark" 
                          ? "border-[#E8593C] bg-[rgba(232,89,60,0.04)] text-[#E8593C]" 
                          : "border-[rgba(36,27,20,0.08)] text-[rgba(36,27,20,0.6)] bg-white hover:border-[rgba(36,27,20,0.15)]"
                      }`}
                    >
                      <Moon size={14} /> Dark Mode
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-[rgba(36,27,20,0.04)]">
                  <button 
                    onClick={saveGeneralSettings}
                    className="h-10 px-6 bg-[#E8593C] hover:bg-[#D14F31] text-white rounded-[8px] font-sans font-semibold text-[13px] transition-colors shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* INTEGRATIONS TAB */}
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

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              <div>
                <h1 className="font-sans font-bold text-[24px] text-[#241B14] mb-2 tracking-tight">Notification settings</h1>
                <p className="font-sans text-[14px] text-[rgba(36,27,20,0.6)]">Configure how and when you receive agent updates.</p>
              </div>

              <div className="bg-white rounded-[16px] border border-[rgba(36,27,20,0.08)] shadow-[0_4px_24px_rgba(36,27,20,0.02)] p-6 flex flex-col gap-5">
                
                {/* Toggle 1 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <MailCheck size={18} className="text-[#E8593C] mt-0.5" />
                    <div>
                      <div className="font-semibold text-[13px] text-[#241B14]">Email Sync Reports</div>
                      <div className="text-[12px] text-[rgba(36,27,20,0.5)]">Receive emails when Auren identifies urgent sync items.</div>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifications.emailAlerts}
                    onChange={(e) => setNotifications(prev => ({ ...prev, emailAlerts: e.target.checked }))}
                    className="w-4 h-4 rounded text-[#E8593C] focus:ring-[#E8593C] border-gray-300 cursor-pointer"
                  />
                </div>

                {/* Toggle 2 */}
                <div className="flex items-center justify-between pt-4 border-t border-[rgba(36,27,20,0.04)]">
                  <div className="flex items-start gap-3">
                    <ShieldCheck size={18} className="text-[#E8593C] mt-0.5" />
                    <div>
                      <div className="font-semibold text-[13px] text-[#241B14]">Action Request Notifications</div>
                      <div className="text-[12px] text-[rgba(36,27,20,0.5)]">Notify when background agent jobs require human confirmation.</div>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifications.pushAlerts}
                    onChange={(e) => setNotifications(prev => ({ ...prev, pushAlerts: e.target.checked }))}
                    className="w-4 h-4 rounded text-[#E8593C] focus:ring-[#E8593C] border-gray-300 cursor-pointer"
                  />
                </div>

                {/* Toggle 3 */}
                <div className="flex items-center justify-between pt-4 border-t border-[rgba(36,27,20,0.04)]">
                  <div className="flex items-start gap-3">
                    <Volume2 size={18} className="text-[#E8593C] mt-0.5" />
                    <div>
                      <div className="font-semibold text-[13px] text-[#241B14]">Sound Effects</div>
                      <div className="text-[12px] text-[rgba(36,27,20,0.5)]">Play alert sounds when agent tasks complete successfully.</div>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifications.soundEffects}
                    onChange={(e) => setNotifications(prev => ({ ...prev, soundEffects: e.target.checked }))}
                    className="w-4 h-4 rounded text-[#E8593C] focus:ring-[#E8593C] border-gray-300 cursor-pointer"
                  />
                </div>

                <div className="pt-4 border-t border-[rgba(36,27,20,0.04)]">
                  <button 
                    onClick={() => alert("Notification settings saved!")}
                    className="h-10 px-6 bg-[#E8593C] hover:bg-[#D14F31] text-white rounded-[8px] font-sans font-semibold text-[13px] transition-colors"
                  >
                    Save Preferences
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ACCOUNT TAB */}
          {activeTab === "account" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              <div>
                <h1 className="font-sans font-bold text-[24px] text-[#241B14] mb-2 tracking-tight">Account settings</h1>
                <p className="font-sans text-[14px] text-[rgba(36,27,20,0.6)]">Manage your account profile and view system usage statistics.</p>
              </div>

              {/* Profile Card */}
              <div className="bg-white rounded-[16px] border border-[rgba(36,27,20,0.08)] shadow-[0_4px_24px_rgba(36,27,20,0.02)] p-6 flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-[rgba(232,89,60,0.1)] flex items-center justify-center font-sans font-bold text-[#E8593C] text-[24px]">
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt={user.fullName || "User"} className="w-full h-full object-cover" />
                    ) : (
                      user?.firstName?.slice(0, 1) || "U"
                    )}
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-[18px] text-[#241B14]">{user?.fullName || "User Profile"}</h3>
                    <p className="font-sans text-[13px] text-[rgba(36,27,20,0.5)] mt-0.5">
                      Email: {user?.emailAddresses[0]?.emailAddress || "loading..."}
                    </p>
                  </div>
                </div>

                {/* Account details grid */}
                <div className="grid grid-cols-1 gap-4 pt-4 border-t border-[rgba(36,27,20,0.04)]">
                  <div className="flex items-start gap-2.5 p-3.5 bg-[#FAF8F5] rounded-[12px]">
                    <Key size={16} className="text-[#E8593C] mt-0.5" />
                    <div>
                      <div className="font-bold text-[13px] text-[#241B14]">Subscription tier</div>
                      <div className="text-[11px] text-[#085041] mt-0.5 font-semibold bg-[#E1F5EE] px-1.5 py-0.5 rounded-full uppercase tracking-wider inline-block">
                        {subscriptionTier}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[rgba(36,27,20,0.04)] flex justify-between items-center">
                  <span className="text-[11px] text-[rgba(36,27,20,0.4)]">Member since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "2026"}</span>
                  <button 
                    onClick={() => alert("Profile updates are managed through Clerk login panel.")}
                    className="px-4 py-2 bg-[rgba(36,27,20,0.04)] hover:bg-[rgba(36,27,20,0.08)] rounded-[8px] font-sans font-semibold text-[12px] text-[#241B14] transition-colors"
                  >
                    Edit Clerk Profile
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* SUBSCRIPTION TAB */}
          {activeTab === "subscription" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              <div>
                <h1 className="font-sans font-bold text-[24px] text-[#241B14] mb-2 tracking-tight">Subscription plans</h1>
                <p className="font-sans text-[14px] text-[rgba(36,27,20,0.6)]">Select the plan that fits your email workflow and AI needs.</p>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {/* Free Plan */}
                <div className={`bg-white rounded-[16px] border p-6 flex flex-col justify-between min-h-[360px] relative ${subscriptionTier === "Auren Starter" ? "border-[#E8593C] ring-1 ring-[#E8593C]" : "border-[rgba(36,27,20,0.08)]"}`}>
                  <div>
                    <h3 className="font-sans font-bold text-[16px] text-[#241B14]">Auren Starter</h3>
                    <p className="font-sans text-[12px] text-[rgba(36,27,20,0.5)] mt-1">Perfect for trying out Auren&apos;s core features.</p>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="font-sans font-bold text-[28px] text-[#241B14]">₹0</span>
                      <span className="font-sans text-[12px] text-[rgba(36,27,20,0.5)]">/ month</span>
                    </div>
                    <ul className="mt-6 flex flex-col gap-3 font-sans text-[12px] text-[rgba(36,27,20,0.6)]">
                      <li className="flex items-center gap-2">✓ 20 manual email syncs / day</li>
                      <li className="flex items-center gap-2">✓ Standard AI sorting</li>
                      <li className="flex items-center gap-2">✓ Basic priority routing</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => {
                      localStorage.setItem("auren_subscription_tier", "Auren Starter");
                      setSubscriptionTier("Auren Starter");
                      alert("Downgraded to Auren Starter plan!");
                    }}
                    className={`w-full py-2.5 rounded-[8px] font-sans font-semibold text-[13px] transition-colors mt-6 ${subscriptionTier === "Auren Starter" ? "bg-[rgba(36,27,20,0.06)] text-[rgba(36,27,20,0.4)] cursor-default" : "bg-[#241B14] text-white hover:bg-[#3E2F23]"}`}
                    disabled={subscriptionTier === "Auren Starter"}
                  >
                    {subscriptionTier === "Auren Starter" ? "Current Plan" : "Choose Starter"}
                  </button>
                </div>

                {/* Pro Plan */}
                <div className={`bg-white rounded-[16px] border p-6 flex flex-col justify-between min-h-[360px] relative ${subscriptionTier === "Auren Pro" || subscriptionTier === "Auren Pro Dev" ? "border-[#E8593C] ring-1 ring-[#E8593C]" : "border-[rgba(36,27,20,0.08)]"}`}>
                  <div className="absolute top-3 right-3 bg-[#E8593C]/10 text-[#E8593C] px-2 py-0.5 rounded-full font-sans font-bold text-[9px] uppercase tracking-wide">
                    Popular
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-[16px] text-[#241B14]">Auren Pro</h3>
                    <p className="font-sans text-[12px] text-[rgba(36,27,20,0.5)] mt-1">For professionals who need real-time automation.</p>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="font-sans font-bold text-[28px] text-[#241B14]">₹799</span>
                      <span className="font-sans text-[12px] text-[rgba(36,27,20,0.5)]">/ month</span>
                    </div>
                    <ul className="mt-6 flex flex-col gap-3 font-sans text-[12px] text-[rgba(36,27,20,0.6)]">
                      <li className="flex items-center gap-2">✓ Unlimited real-time sync</li>
                      <li className="flex items-center gap-2">✓ Advanced AI agent reasoning</li>
                      <li className="flex items-center gap-2">✓ Action request confirmations</li>
                      <li className="flex items-center gap-2">✓ Calendar zoom summaries</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => {
                      localStorage.setItem("auren_subscription_tier", "Auren Pro");
                      setSubscriptionTier("Auren Pro");
                      alert("Upgraded to Auren Pro plan!");
                    }}
                    className={`w-full py-2.5 rounded-[8px] font-sans font-semibold text-[13px] transition-colors mt-6 ${subscriptionTier === "Auren Pro" || subscriptionTier === "Auren Pro Dev" ? "bg-[rgba(36,27,20,0.06)] text-[rgba(36,27,20,0.4)] cursor-default" : "bg-[#E8593C] text-white hover:bg-[#D14F31]"}`}
                    disabled={subscriptionTier === "Auren Pro" || subscriptionTier === "Auren Pro Dev"}
                  >
                    {subscriptionTier === "Auren Pro" || subscriptionTier === "Auren Pro Dev" ? "Current Plan" : "Upgrade to Pro"}
                  </button>
                </div>

                {/* Business Plan */}
                <div className={`bg-white rounded-[16px] border p-6 flex flex-col justify-between min-h-[360px] relative ${subscriptionTier === "Auren Business" ? "border-[#E8593C] ring-1 ring-[#E8593C]" : "border-[rgba(36,27,20,0.08)]"}`}>
                  <div>
                    <h3 className="font-sans font-bold text-[16px] text-[#241B14]">Auren Business</h3>
                    <p className="font-sans text-[12px] text-[rgba(36,27,20,0.5)] mt-1">For organizations and high-volume workloads.</p>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="font-sans font-bold text-[28px] text-[#241B14]">₹2,499</span>
                      <span className="font-sans text-[12px] text-[rgba(36,27,20,0.5)]">/ month</span>
                    </div>
                    <ul className="mt-6 flex flex-col gap-3 font-sans text-[12px] text-[rgba(36,27,20,0.6)]">
                      <li className="flex items-center gap-2">✓ Multi-account sync integration</li>
                      <li className="flex items-center gap-2">✓ Team shared collaborative inbox</li>
                      <li className="flex items-center gap-2">✓ Compliance filters & logs</li>
                      <li className="flex items-center gap-2">✓ Dedicated SLA support</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => {
                      localStorage.setItem("auren_subscription_tier", "Auren Business");
                      setSubscriptionTier("Auren Business");
                      alert("Upgraded to Auren Business plan!");
                    }}
                    className={`w-full py-2.5 rounded-[8px] font-sans font-semibold text-[13px] transition-colors mt-6 ${subscriptionTier === "Auren Business" ? "bg-[rgba(36,27,20,0.06)] text-[rgba(36,27,20,0.4)] cursor-default" : "bg-[#241B14] text-white hover:bg-[#3E2F23]"}`}
                    disabled={subscriptionTier === "Auren Business"}
                  >
                    {subscriptionTier === "Auren Business" ? "Current Plan" : "Choose Business"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
