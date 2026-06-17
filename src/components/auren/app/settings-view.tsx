"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  User, 
  SlidersHorizontal, 
  GitBranch, 
  Bell, 
  CreditCard,
  Sun, 
  Moon, 
  Globe, 
  Clock,
  Loader2,
  Lock,
  Camera,
  Check,
  ChevronRight
} from "lucide-react";
import { checkConnectionStatus, getConnectUrl, disconnectService } from "@/app/actions/connect";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

// Premium iOS-style Toggle Switch
interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function Switch({ checked, onChange, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-all duration-300 ease-in-out focus:outline-none relative ${
        checked 
          ? "bg-[#E8593C]" 
          : "bg-[rgba(36,27,20,0.12)]"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:scale-105 active:scale-95"}`}
    >
      <div
        className={`bg-white w-5 h-5 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.1)] transform transition-transform duration-300 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function SettingsView() {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<"account" | "preferences" | "integrations" | "notifications" | "billing">("account");
  
  // Connection states
  const [connected, setConnected] = useState({ google: false, github: false });
  const [loading, setLoading] = useState({ google: false, github: false });

  // Preferences
  const [theme, setTheme] = useState("light");
  const [replyTone, setReplyTone] = useState("formal");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [workingHours, setWorkingHours] = useState({ start: "09:00", end: "18:00" });
  const [subscriptionTier, setSubscriptionTier] = useState("Auren Pro");

  // Profile Form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushAlerts: true,
    soundEffects: true,
  });

  const loadStatus = async () => {
    const status = await checkConnectionStatus();
    setConnected(status);
  };

  useEffect(() => {
    loadStatus();
    
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("auren_theme") || "light";
      const savedTone = localStorage.getItem("auren_reply_tone") || "formal";
      const savedTimezone = localStorage.getItem("auren_timezone") || "Asia/Kolkata";
      const savedTier = localStorage.getItem("auren_subscription_tier") || "Auren Pro";
      setTheme(savedTheme);
      setReplyTone(savedTone);
      setTimezone(savedTimezone);
      setSubscriptionTier(savedTier);
    }

    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
    }

    const handleFocus = () => loadStatus();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user]);

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
    if (!confirm(`Are you sure you want to disconnect ${service === "google" ? "Google" : "GitHub"}?`)) {
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
    alert("Preferences updated!");
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      setUpdatingProfile(true);
      await user.update({ firstName, lastName });
      alert("Profile updated!");
    } catch (err: any) {
      alert(err.message || "Failed to update profile name.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      setUploadingAvatar(true);
      await user.setProfileImage({ file });
      alert("Avatar updated successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to upload avatar.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF8F5] text-[#241B14] text-[14px] w-full font-sans antialiased">
      {/* ─── LEFT SIDEBAR TABS (ADMIN-STYLE) ─── */}
      <aside className="w-[240px] border-r border-[rgba(36,27,20,0.08)] flex flex-col bg-[#FAF8F5] shrink-0 z-10">
        <div className="h-14 px-4 flex items-center border-b border-[rgba(36,27,20,0.08)]">
          <div className="flex items-center gap-2 font-display font-medium text-[14px]">
            <div className="w-5 h-5 relative rounded-[4px] overflow-hidden">
              <Image src="/auren_logo.webp" alt="Auren Logo" fill style={{ objectFit: "cover" }} />
            </div>
            Auren Settings
          </div>
        </div>

        <div className="flex-1 py-4 px-3 flex flex-col gap-1">
          {[
            { id: "account", label: "My Account", icon: User },
            { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
            { id: "integrations", label: "Integrations", icon: GitBranch },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "billing", label: "Billing Plan", icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors text-[13px] ${
                  isActive 
                    ? "bg-white border border-[rgba(36,27,20,0.08)] shadow-sm font-medium text-[#241B14]" 
                    : "text-[rgba(36,27,20,0.6)] hover:text-[#241B14] hover:bg-[rgba(36,27,20,0.04)] border border-transparent"
                }`}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>
      </aside>

      {/* ─── RIGHT CONTENT AREA ─── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto z-10">
        <div className="p-8 max-w-[800px] w-full mx-auto">
          
          {/* TAB 1: MY ACCOUNT */}
          {activeTab === "account" && (
            <div className="flex flex-col gap-8 animate-in fade-in duration-200">
              <div className="pb-4 border-b border-[rgba(36,27,20,0.08)] space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight text-[#241B14] font-display">
                  My Account
                </h2>
                <p className="font-sans text-[13px] text-[rgba(36,27,20,0.5)]">Manage your display credentials, avatar uploader, and active identity.</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 py-2">
                  <div 
                    className="relative group w-14 h-14 shrink-0 cursor-pointer overflow-hidden rounded-full border border-[rgba(36,27,20,0.08)] bg-[rgba(36,27,20,0.02)] flex items-center justify-center font-sans font-bold text-[#241B14] text-[20px]"
                    onClick={() => fileInputRef.current?.click()}
                    title="Change display avatar"
                  >
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt="Profile photo" className="w-full h-full object-cover" />
                    ) : (
                      user?.firstName?.slice(0, 1) || "U"
                    )}
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {uploadingAvatar ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-sans font-bold text-[14px] text-[#241B14]">{user?.fullName || "Auren User"}</h4>
                    <p className="font-sans text-[11px] text-[rgba(36,27,20,0.4)]">Clerk Active Identity Verification</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans font-semibold text-[11.5px] text-[#241B14]">First Name</label>
                    <input 
                      type="text" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-10 px-3 bg-[#FBF3EC] border border-[rgba(36,27,20,0.12)] rounded-[8px] font-sans font-medium text-[13px] text-[#241B14] focus:outline-none focus:border-[#E8593C] transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans font-semibold text-[11.5px] text-[#241B14]">Last Name</label>
                    <input 
                      type="text" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-10 px-3 bg-[#FBF3EC] border border-[rgba(36,27,20,0.12)] rounded-[8px] font-sans font-medium text-[13px] text-[#241B14] focus:outline-none focus:border-[#E8593C] transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans font-semibold text-[11.5px] text-[rgba(36,27,20,0.45)] flex items-center gap-1">
                    <Lock size={11} /> Registration Email Address (Read Only)
                  </label>
                  <input 
                    type="text" 
                    value={user?.emailAddresses[0]?.emailAddress || ""} 
                    disabled 
                    className="h-10 px-3 bg-[#FBF3EC]/40 border border-[rgba(36,27,20,0.06)] text-[rgba(36,27,20,0.4)] rounded-[8px] font-sans font-medium text-[13px] cursor-not-allowed w-full outline-none select-all" 
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-[rgba(36,27,20,0.06)] gap-4">
                  <span className="font-sans text-[11px] text-[rgba(36,27,20,0.35)] text-center sm:text-left">Updates sync immediately across Clerk auth sessions.</span>
                  <button 
                    onClick={handleUpdateProfile}
                    disabled={updatingProfile}
                    className="h-10 px-5 bg-[#241B14] hover:bg-[#3E2F23] text-white rounded-[8px] font-sans font-bold text-[12px] transition-all flex items-center gap-2"
                  >
                    {updatingProfile ? <Loader2 size={13} className="animate-spin" /> : "Save Profile"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PREFERENCES */}
          {activeTab === "preferences" && (
            <div className="flex flex-col gap-8 animate-in fade-in duration-200">
              <div className="pb-4 border-b border-[rgba(36,27,20,0.08)] space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight text-[#241B14] font-display">
                  Preferences
                </h2>
                <p className="font-sans text-[13px] text-[rgba(36,27,20,0.5)]">Configure visual interfaces, tones, timezones, and hours.</p>
              </div>

              <div className="space-y-6">
                {/* Interface Theme */}
                <div className="flex flex-col gap-2 py-2 border-b border-[rgba(36,27,20,0.04)]">
                  <div className="space-y-1">
                    <span className="font-medium text-[14px] text-[#241B14]">Interface Theme</span>
                    <p className="text-[13px] text-[rgba(36,27,20,0.6)]">Choose your visual workspace style.</p>
                  </div>
                  <div className="flex bg-[#FBF3EC] p-0.5 rounded-[8px] border border-[rgba(36,27,20,0.08)] w-max">
                    <button
                      onClick={() => setTheme("light")}
                      className={`px-4 py-1.5 rounded-[6px] font-sans font-bold text-[11px] flex items-center gap-1.5 transition-all ${
                        theme === "light" 
                          ? "bg-white text-[#E8593C] shadow-sm" 
                          : "text-[rgba(36,27,20,0.45)] hover:text-[#241B14]"
                      }`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={`px-4 py-1.5 rounded-[6px] font-sans font-bold text-[11px] flex items-center gap-1.5 transition-all ${
                        theme === "dark" 
                          ? "bg-white text-[#E8593C] shadow-sm" 
                          : "text-[rgba(36,27,20,0.45)] hover:text-[#241B14]"
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                </div>

                {/* AI Tone */}
                <div className="space-y-3 py-2 border-b border-[rgba(36,27,20,0.04)]">
                  <div className="space-y-1">
                    <span className="font-medium text-[14px] text-[#241B14]">AI Response Tone</span>
                    <p className="text-[13px] text-[rgba(36,27,20,0.6)]">Determine the style and tone used by Auren when answering drafts.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    {[
                      { id: "formal", label: "Formal", preview: "Dear Client, I confirm..." },
                      { id: "casual", label: "Casual", preview: "Hey! Just checking in..." },
                      { id: "friendly", label: "Empathetic", preview: "Hi there, I understand..." },
                      { id: "professional", label: "Direct", preview: "Confirmed. Details below." }
                    ].map((tone) => {
                      const isSelected = replyTone === tone.id;
                      return (
                        <button
                          key={tone.id}
                          onClick={() => setReplyTone(tone.id)}
                          className={`py-3 px-4 rounded-[10px] border text-left flex flex-col gap-1 transition-all ${
                            isSelected 
                              ? "border-[#E8593C] bg-white ring-1 ring-[#E8593C]" 
                              : "border-[rgba(36,27,20,0.08)] bg-white/50 hover:border-[rgba(36,27,20,0.15)]"
                          }`}
                        >
                          <span className={`font-sans font-bold text-[12.5px] ${
                            isSelected ? "text-[#E8593C]" : "text-[#241B14]"
                          }`}>{tone.label}</span>
                          <span className="font-sans text-[10.5px] text-[rgba(36,27,20,0.45)] truncate w-full">{tone.preview}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Operational timezone */}
                <div className="flex flex-col gap-3 py-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans font-bold text-[12.5px] text-[#241B14]">
                      Operational Timezone
                    </label>
                    <select 
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full h-10 px-3 bg-[#FBF3EC] border border-[rgba(36,27,20,0.12)] rounded-[8px] font-sans font-medium text-[13px] text-[#241B14] focus:outline-none focus:border-[#E8593C]"
                    >
                      <option value="Asia/Kolkata">Kolkata, India (IST — GMT+5:30)</option>
                      <option value="America/New_York">New York, USA (EST — GMT-5:00)</option>
                      <option value="Europe/London">London, UK (GMT — GMT+0:00)</option>
                      <option value="Asia/Tokyo">Tokyo, Japan (JST — GMT+9:00)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans font-bold text-[12.5px] text-[#241B14]">
                      Start Hour
                    </label>
                    <input 
                      type="time" 
                      value={workingHours.start}
                      onChange={(e) => setWorkingHours(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full h-10 px-3 bg-[#FBF3EC] border border-[rgba(36,27,20,0.12)] rounded-[8px] font-sans font-medium text-[13px] text-[#241B14] focus:outline-none focus:border-[#E8593C]"
                    />
                  </div>
                </div>

                <div className="flex justify-start pt-4 border-t border-[rgba(36,27,20,0.06)]">
                  <button 
                    onClick={saveGeneralSettings}
                    className="h-10 px-5 bg-[#E8593C] hover:bg-[#D14F31] active:scale-95 text-white rounded-[8px] font-sans font-bold text-[12px] transition-all shadow-sm"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INTEGRATIONS */}
          {activeTab === "integrations" && (
            <div className="flex flex-col gap-8 animate-in fade-in duration-200">
              <div className="pb-4 border-b border-[rgba(36,27,20,0.08)] space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight text-[#241B14] font-display">
                  Integrations
                </h2>
                <p className="font-sans text-[13px] text-[rgba(36,27,20,0.5)]">Connect action parameters dynamically to third-party providers.</p>
              </div>

              <div className="divide-y divide-[rgba(36,27,20,0.06)]">
                {/* Google */}
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-[rgba(36,27,20,0.08)] bg-white flex items-center justify-center shadow-sm">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#241B14]"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[14px] text-[#241B14]">Google Workspace</span>
                        {connected.google && <span className="text-[10px] font-bold bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 rounded-full border border-[#10B981]/20">ACTIVE</span>}
                      </div>
                      <p className="text-[13px] text-[rgba(36,27,20,0.6)] max-w-md">Sync your inbox messages and calendar appointments dynamically.</p>
                    </div>
                  </div>
                  <Switch 
                    checked={connected.google} 
                    disabled={loading.google}
                    onChange={() => connected.google ? handleDisconnect("google") : handleConnect("google")}
                  />
                </div>

                {/* GitHub */}
                <div className="flex items-center justify-between py-4 border-t border-[rgba(36,27,20,0.08)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-[rgba(36,27,20,0.08)] bg-white flex items-center justify-center shadow-sm">
                      <GitBranch size={20} className="text-[#241B14]" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[14px] text-[#241B14]">GitHub Issues</span>
                        {connected.github && <span className="text-[10px] font-bold bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 rounded-full border border-[#10B981]/20">ACTIVE</span>}
                      </div>
                      <p className="text-[13px] text-[rgba(36,27,20,0.6)] max-w-md">Log action items straight to code repositories.</p>
                    </div>
                  </div>
                  <Switch 
                    checked={connected.github} 
                    disabled={loading.github}
                    onChange={() => connected.github ? handleDisconnect("github") : handleConnect("github")}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="flex flex-col gap-8 animate-in fade-in duration-200">
              <div className="pb-4 border-b border-[rgba(36,27,20,0.08)] space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight text-[#241B14] font-display">
                  Notifications
                </h2>
                <p className="font-sans text-[13px] text-[rgba(36,27,20,0.5)]">Decide when and how you are prompted for folder updates.</p>
              </div>

              <div className="divide-y divide-[rgba(36,27,20,0.06)]">
                {[
                  { id: "emailAlerts", label: "Sync Summaries", desc: "Receive automated email digests of core workspace and folder actions." },
                  { id: "pushAlerts", label: "Action Request Alerts", desc: "Always prompt for human confirmation before writing drafts or modifying items." },
                  { id: "soundEffects", label: "Auditory Feedback", desc: "Play subtle high-fidelity audio chimes when tasks are successfully executed." }
                ].map((item) => {
                  const key = item.id as keyof typeof notifications;
                  return (
                    <div key={item.id} className="flex items-center justify-between py-4 border-b border-[rgba(36,27,20,0.08)]">
                      <div className="flex-1 pr-6">
                        <div className="space-y-1">
                          <span className="font-medium text-[14px] text-[#241B14]">{item.label}</span>
                          <p className="text-[13px] text-[rgba(36,27,20,0.6)] max-w-md leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                      <Switch 
                        checked={notifications[key]} 
                        onChange={(checked) => setNotifications(prev => ({ ...prev, [key]: checked }))} 
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: BILLING */}
          {activeTab === "billing" && (
            <div className="flex flex-col gap-10 animate-in fade-in duration-300">
              <div className="text-center space-y-3 pb-4">
                <h2 className="text-3xl font-semibold tracking-tight text-[#241B14] font-display">
                  Upgrade your workspace
                </h2>
                <p className="text-[15px] text-[rgba(36,27,20,0.6)] max-w-lg mx-auto">
                  Select the perfect intelligence tier for your workflow. Switch plans or cancel anytime.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { 
                    id: "Auren Starter", 
                    title: "Starter", 
                    price: "₹0", 
                    features: ["20 manual email syncs/day", "Basic heuristic classification", "Standard response time"] 
                  },
                  { 
                    id: "Auren Pro", 
                    title: "Pro", 
                    price: "₹799", 
                    popular: true, 
                    features: ["Unlimited live sync", "Full LLM action runs", "Smart zoom summaries", "Priority queue"] 
                  },
                  { 
                    id: "Auren Business", 
                    title: "Business", 
                    price: "₹2,499", 
                    features: ["Multi-mailbox connections", "Shared team action cards", "Dedicated account manager", "24/7 Phone support"] 
                  }
                ].map((plan) => {
                  const isCurrent = subscriptionTier === plan.id || (plan.id === "Auren Pro" && subscriptionTier === "Auren Pro Dev");
                  return (
                    <div 
                      key={plan.id} 
                      className={`relative flex flex-col p-6 rounded-2xl transition-all duration-300 ${
                        plan.popular 
                          ? "bg-[#241B14] text-white shadow-xl scale-[1.02] z-10 ring-1 ring-[#3E2F23]" 
                          : "bg-white text-[#241B14] border border-[rgba(36,27,20,0.08)] hover:border-[rgba(36,27,20,0.15)] shadow-sm hover:shadow-md"
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3.5 left-0 right-0 flex justify-center">
                          <span className="bg-[#E8593C] text-white px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-sm">
                            Most Popular
                          </span>
                        </div>
                      )}

                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`text-lg font-bold ${plan.popular ? "text-white" : "text-[#241B14]"}`}>
                            {plan.title}
                          </h3>
                          {isCurrent && (
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              plan.popular ? "bg-white/20 text-white" : "bg-[#E8593C]/10 text-[#E8593C]"
                            }`}>
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-baseline gap-1 mt-4">
                          <span className={`text-4xl font-extrabold tracking-tight ${plan.popular ? "text-white" : "text-[#241B14]"}`}>
                            {plan.price}
                          </span>
                          <span className={`text-sm ${plan.popular ? "text-white/60" : "text-[rgba(36,27,20,0.4)]"}`}>
                            /mo
                          </span>
                        </div>
                      </div>

                      <button
                        disabled={isCurrent}
                        onClick={() => {
                          localStorage.setItem("auren_subscription_tier", plan.id);
                          setSubscriptionTier(plan.id);
                          alert(`Subscribed to ${plan.title}!`);
                        }}
                        className={`w-full py-2.5 rounded-xl text-[13px] font-bold transition-all mb-8 ${
                          isCurrent 
                            ? (plan.popular ? "bg-white/10 text-white/50 cursor-default" : "bg-[rgba(36,27,20,0.04)] text-[rgba(36,27,20,0.4)] cursor-default")
                            : (plan.popular 
                                ? "bg-[#E8593C] text-white hover:bg-[#D14F31] hover:scale-[1.02] active:scale-95 shadow-sm" 
                                : "bg-[#FBF3EC] text-[#241B14] hover:bg-[#F2E5D9] hover:scale-[1.02] active:scale-95")
                        }`}
                      >
                        {isCurrent ? "Current Plan" : "Upgrade"}
                      </button>

                      <div className="flex-1">
                        <ul className="space-y-3.5">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <Check size={16} className={`shrink-0 mt-0.5 ${plan.popular ? "text-[#E8593C]" : "text-[rgba(36,27,20,0.3)]"}`} />
                              <span className={`text-[13px] leading-snug ${plan.popular ? "text-white/80" : "text-[rgba(36,27,20,0.6)]"}`}>
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
