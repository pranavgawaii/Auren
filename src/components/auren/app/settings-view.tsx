"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  GitBranch, 
  Mail, 
  Clock, 
  Globe, 
  Sun, 
  Moon, 
  Volume2, 
  ShieldCheck, 
  MailCheck, 
  Key, 
  CreditCard, 
  Zap, 
  Camera, 
  Check, 
  Loader2,
  Lock,
  ArrowRight
} from "lucide-react";
import { checkConnectionStatus, getConnectUrl, disconnectService } from "@/app/actions/connect";
import { useUser } from "@clerk/nextjs";

// iOS-Style Toggle Switch
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
      className={`w-10 h-6 flex items-center rounded-full p-0.5 transition-all duration-300 ease-in-out focus:outline-none ${
        checked ? "bg-[#E8593C]" : "bg-[rgba(36,27,20,0.12)]"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <div
        className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-300 ease-in-out ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function SettingsView() {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
      alert("Profile details updated!");
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
    <div className="flex-1 bg-[#FAF8F5] p-10 overflow-y-auto selection:bg-[#E8593C] selection:text-white h-full w-full">
      <div className="max-w-[1200px] mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex items-center justify-between pb-6 border-b border-[rgba(36,27,20,0.08)]">
          <div className="space-y-1">
            <h1 
              style={{ fontFamily: "var(--font-civane, Georgia, serif)", fontWeight: 400 }}
              className="text-[36px] text-[#241B14] tracking-tight leading-none"
            >
              Control Panel
            </h1>
            <p className="font-sans text-[13px] text-[rgba(36,27,20,0.5)]">
              Manage your connected agent workflows, themes, boundaries, and subscription tier.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(36,27,20,0.03)] rounded-[8px] border border-[rgba(36,27,20,0.05)]">
            <Zap size={14} className="text-[#E8593C]" />
            <span className="font-sans font-bold text-[11px] text-[rgba(36,27,20,0.5)]">AI Assistant Suite</span>
          </div>
        </div>

        {/* 2-Column Focus Grid Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Preferences & Profile (Span 7) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* CARD 1: AI Agent Tone & Workspace Preferences */}
            <div className="bg-white rounded-[24px] border border-[rgba(36,27,20,0.08)] p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 
                  style={{ fontFamily: "var(--font-civane, Georgia, serif)", fontWeight: 400 }}
                  className="text-[20px] text-[#241B14] flex items-center gap-2.5"
                >
                  <Settings size={18} className="text-[#E8593C]" />
                  Agent Configurations
                </h3>
                
                {/* Theme Selector */}
                <div className="flex bg-[#FAF8F5] p-0.5 rounded-[8px] border border-[rgba(36,27,20,0.04)]">
                  <button
                    onClick={() => setTheme("light")}
                    className={`px-2.5 py-1 rounded-[6px] font-sans font-bold text-[11px] flex items-center gap-1 transition-all ${
                      theme === "light" ? "bg-white text-[#E8593C] shadow-sm" : "text-[rgba(36,27,20,0.4)]"
                    }`}
                  >
                    <Sun size={12} /> Light
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`px-2.5 py-1 rounded-[6px] font-sans font-bold text-[11px] flex items-center gap-1 transition-all ${
                      theme === "dark" ? "bg-white text-[#E8593C] shadow-sm" : "text-[rgba(36,27,20,0.4)]"
                    }`}
                  >
                    <Moon size={12} /> Dark
                  </button>
                </div>
              </div>

              {/* Personality Selector Chips */}
              <div className="space-y-3">
                <label className="font-sans font-bold text-[12px] text-[rgba(36,27,20,0.5)] uppercase tracking-wider">AI Response Preset</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "formal", title: "Formal Preset", desc: "Structured business style", preview: "Dear Client, I confirm..." },
                    { id: "casual", title: "Casual Preset", desc: "Relaxed conversational", preview: "Hey! Just wanted to touch base..." },
                    { id: "friendly", title: "Empathetic Preset", desc: "Warm supportive style", preview: "Hi there, I understand and..." },
                    { id: "professional", title: "Direct Preset", desc: "Short concise phrasing", preview: "Confirmed. Details below." },
                  ].map((tone) => {
                    const isSelected = replyTone === tone.id;
                    return (
                      <button
                        key={tone.id}
                        onClick={() => setReplyTone(tone.id)}
                        className={`p-3.5 rounded-[12px] border text-left flex flex-col gap-1.5 transition-all duration-300 ${
                          isSelected 
                            ? "border-[#E8593C] bg-[rgba(232,89,60,0.02)] ring-1 ring-[#E8593C]" 
                            : "border-[rgba(36,27,20,0.06)] bg-white hover:border-[rgba(36,27,20,0.12)]"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-sans font-bold text-[12.5px] text-[#241B14]">{tone.title}</span>
                          {isSelected && <div className="w-3.5 h-3.5 rounded-full bg-[#E8593C] flex items-center justify-center text-white scale-90"><Check size={9} strokeWidth={4} /></div>}
                        </div>
                        <p className="font-sans text-[10.5px] text-[rgba(36,27,20,0.4)]">{tone.desc}</p>
                        <div className="p-2 bg-[#FAF8F5] rounded-[6px] font-sans text-[10px] text-[rgba(36,27,20,0.5)] italic border border-[rgba(36,27,20,0.02)] truncate w-full">
                          &ldquo;{tone.preview}&rdquo;
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Timezone boundary configs */}
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="font-sans font-bold text-[12px] text-[rgba(36,27,20,0.5)] uppercase tracking-wider">Operational Timezone</label>
                  <select 
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="h-10 px-3 bg-[#FAF8F5] border border-[rgba(36,27,20,0.06)] rounded-[10px] font-sans font-semibold text-[13px] text-[#241B14] focus:outline-none focus:border-[#E8593C] transition-colors"
                  >
                    <option value="Asia/Kolkata">Kolkata, India (IST — GMT+5:30)</option>
                    <option value="America/New_York">New York, USA (EST — GMT-5:00)</option>
                    <option value="Europe/London">London, UK (GMT — GMT+0:00)</option>
                    <option value="Asia/Tokyo">Tokyo, Japan (JST — GMT+9:00)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans font-bold text-[12px] text-[rgba(36,27,20,0.5)] uppercase tracking-wider">Start Hours</label>
                  <input 
                    type="time" 
                    value={workingHours.start}
                    onChange={(e) => setWorkingHours(prev => ({ ...prev, start: e.target.value }))}
                    className="h-10 px-3 bg-[#FAF8F5] border border-[rgba(36,27,20,0.06)] rounded-[10px] font-sans font-semibold text-[13px] text-[#241B14] focus:outline-none focus:border-[#E8593C] transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-[rgba(36,27,20,0.04)]">
                <button 
                  onClick={saveGeneralSettings}
                  className="h-10 px-6 bg-[#E8593C] hover:bg-[#D14F31] text-white rounded-[10px] font-sans font-bold text-[12.5px] transition-colors shadow-sm duration-300"
                >
                  Save Agent Preferences
                </button>
              </div>
            </div>

            {/* CARD 2: Account Profile */}
            <div className="bg-white rounded-[24px] border border-[rgba(36,27,20,0.08)] p-6 shadow-sm space-y-6">
              <h3 
                style={{ fontFamily: "var(--font-civane, Georgia, serif)", fontWeight: 400 }}
                className="text-[20px] text-[#241B14] flex items-center gap-2.5"
              >
                <User size={18} className="text-[#E8593C]" />
                User Profile
              </h3>

              <div className="flex items-center gap-5 pb-5 border-b border-[rgba(36,27,20,0.04)]">
                <div 
                  className="relative group w-16 h-16 shrink-0 cursor-pointer" 
                  onClick={() => fileInputRef.current?.click()}
                  title="Change avatar picture"
                >
                  <div className="w-full h-full rounded-full overflow-hidden border border-[rgba(36,27,20,0.08)] bg-[rgba(232,89,60,0.04)] flex items-center justify-center font-sans font-extrabold text-[#E8593C] text-[26px]">
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt="User photo" className="w-full h-full object-cover" />
                    ) : (
                      user?.firstName?.slice(0, 1) || "U"
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {uploadingAvatar ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                </div>
                <div>
                  <h4 className="font-sans font-extrabold text-[15px] text-[#241B14]">{user?.fullName || "Auren Assistant"}</h4>
                  <p className="font-sans text-[12px] text-[rgba(36,27,20,0.4)] mt-0.5">Clerk Session Sync Enabled</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans font-bold text-[12px] text-[#241B14]">First Name</label>
                  <input 
                    type="text" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-10 px-3 bg-[#FAF8F5] border border-[rgba(36,27,20,0.06)] rounded-[10px] font-sans font-semibold text-[13px] text-[#241B14] focus:outline-none focus:border-[#E8593C] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans font-bold text-[12px] text-[#241B14]">Last Name</label>
                  <input 
                    type="text" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-10 px-3 bg-[#FAF8F5] border border-[rgba(36,27,20,0.06)] rounded-[10px] font-sans font-semibold text-[13px] text-[#241B14] focus:outline-none focus:border-[#E8593C] transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-bold text-[11.5px] text-[rgba(36,27,20,0.4)] flex items-center gap-1">
                  <Lock size={11} /> Registration Email Address (Read Only)
                </label>
                <input 
                  type="text" 
                  value={user?.emailAddresses[0]?.emailAddress || ""} 
                  disabled 
                  className="h-10 px-3 bg-[#FAF8F5] border border-[rgba(36,27,20,0.04)] text-[rgba(36,27,20,0.4)] rounded-[10px] font-sans font-semibold text-[13px] cursor-not-allowed outline-none select-all" 
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[rgba(36,27,20,0.04)]">
                <span className="font-sans text-[11px] text-[rgba(36,27,20,0.35)]">Updates immediately sync to your Clerk account session.</span>
                <button 
                  onClick={handleUpdateProfile}
                  disabled={updatingProfile}
                  className="h-10 px-6 bg-[#241B14] hover:bg-[#3E2F23] text-white rounded-[10px] font-sans font-bold text-[12.5px] transition-colors flex items-center gap-1.5"
                >
                  {updatingProfile ? <Loader2 size={14} className="animate-spin" /> : "Save Profile"}
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Integrations & Notifications (Span 5) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* CARD 3: Connections */}
            <div className="bg-white rounded-[24px] border border-[rgba(36,27,20,0.08)] p-6 shadow-sm space-y-5">
              <h3 
                style={{ fontFamily: "var(--font-civane, Georgia, serif)", fontWeight: 400 }}
                className="text-[20px] text-[#241B14] flex items-center gap-2.5"
              >
                <Shield size={18} className="text-[#E8593C]" />
                Connections
              </h3>

              <div className="space-y-3">
                {/* Google */}
                <div className="flex items-center justify-between p-3.5 bg-[#FAF8F5] rounded-[14px] border border-[rgba(36,27,20,0.04)]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[8px] bg-red-50 text-[#EA4335] flex items-center justify-center border border-red-100">
                      <Mail size={16} />
                    </div>
                    <div>
                      <span className="font-sans font-bold text-[12.5px] text-[#241B14]">Google Suite</span>
                      <p className="font-sans text-[10px] text-[rgba(36,27,20,0.4)]">Inbox & calendar sync</p>
                    </div>
                  </div>
                  <Switch 
                    checked={connected.google} 
                    disabled={loading.google}
                    onChange={() => connected.google ? handleDisconnect("google") : handleConnect("google")}
                  />
                </div>

                {/* GitHub */}
                <div className="flex items-center justify-between p-3.5 bg-[#FAF8F5] rounded-[14px] border border-[rgba(36,27,20,0.04)]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[8px] bg-neutral-100 text-[#241B14] flex items-center justify-center border border-neutral-200">
                      <GitBranch size={16} />
                    </div>
                    <div>
                      <span className="font-sans font-bold text-[12.5px] text-[#241B14]">GitHub Issues</span>
                      <p className="font-sans text-[10px] text-[rgba(36,27,20,0.4)]">Issue action hooks</p>
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

            {/* CARD 4: Control Center (Notifications) */}
            <div className="bg-white rounded-[24px] border border-[rgba(36,27,20,0.08)] p-6 shadow-sm space-y-5">
              <h3 
                style={{ fontFamily: "var(--font-civane, Georgia, serif)", fontWeight: 400 }}
                className="text-[20px] text-[#241B14] flex items-center gap-2.5"
              >
                <Bell size={18} className="text-[#E8593C]" />
                Alert Settings
              </h3>

              <div className="space-y-4">
                {[
                  { id: "emailAlerts", label: "Sync Reports", icon: MailCheck },
                  { id: "pushAlerts", label: "Confirmation Check", icon: ShieldCheck },
                  { id: "soundEffects", label: "Sound Effects", icon: Volume2 }
                ].map((item) => {
                  const Icon = item.icon;
                  const key = item.id as keyof typeof notifications;
                  return (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-[#241B14]">
                        <Icon size={15} className="text-[#E8593C]" />
                        <span className="font-sans font-semibold text-[12.5px]">{item.label}</span>
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

          </div>

        </div>

        {/* SECTION 5: Subscription Pricing (Spans full width bottom) */}
        <div className="bg-white rounded-[24px] border border-[rgba(36,27,20,0.08)] p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(36,27,20,0.04)]">
            <h3 
              style={{ fontFamily: "var(--font-civane, Georgia, serif)", fontWeight: 400 }}
              className="text-[20px] text-[#241B14] flex items-center gap-2.5"
            >
              <CreditCard size={18} className="text-[#E8593C]" />
              Active Subscription
            </h3>
            <span className="font-sans font-bold text-[11px] text-[rgba(36,27,20,0.4)]">
              Current Tier: <span className="text-[#E8593C] font-extrabold">{subscriptionTier}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: "Auren Starter", title: "Auren Starter", price: "₹0", desc: "20 manual email syncs / day, heuristic classification" },
              { id: "Auren Pro", title: "Auren Pro", price: "₹799", desc: "Unlimited background sync, full LLM actions, zoom summaries", popular: true },
              { id: "Auren Business", title: "Auren Business", price: "₹2,499", desc: "Multi-mailbox connections, shared team action cards" }
            ].map((plan) => {
              const isCurrent = subscriptionTier === plan.id || (plan.id === "Auren Pro" && subscriptionTier === "Auren Pro Dev");
              return (
                <div 
                  key={plan.id} 
                  className={`bg-[#FAF8F5] p-5 rounded-[16px] border flex flex-col justify-between min-h-[220px] transition-all duration-300 relative ${
                    isCurrent ? "border-[#E8593C] bg-white ring-1 ring-[#E8593C]" : "border-[rgba(36,27,20,0.05)]"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-2.5 right-2.5 bg-[#E8593C]/10 text-[#E8593C] px-1.5 py-0.5 rounded-full font-sans font-extrabold text-[8px] uppercase tracking-wide">
                      POPULAR
                    </div>
                  )}
                  <div className="space-y-2">
                    <h4 className="font-sans font-extrabold text-[13.5px] text-[#241B14]">{plan.title}</h4>
                    <p className="font-sans text-[10.5px] text-[rgba(36,27,20,0.45)] leading-relaxed">{plan.desc}</p>
                    <div className="pt-2 flex items-baseline gap-0.5">
                      <span className="font-sans font-extrabold text-[20px] text-[#241B14]">{plan.price}</span>
                      <span className="font-sans text-[10px] text-[rgba(36,27,20,0.4)]">/ month</span>
                    </div>
                  </div>

                  <button
                    disabled={isCurrent}
                    onClick={() => {
                      localStorage.setItem("auren_subscription_tier", plan.id);
                      setSubscriptionTier(plan.id);
                      alert(`Subscribed to ${plan.title}!`);
                    }}
                    className={`w-full py-2.5 rounded-[8px] font-sans font-bold text-[11.5px] transition-all mt-4 ${
                      isCurrent 
                        ? "bg-[rgba(36,27,20,0.04)] text-[rgba(36,27,20,0.4)] cursor-default" 
                        : "bg-[#241B14] text-white hover:bg-[#3E2F23]"
                    }`}
                  >
                    {isCurrent ? "Current plan" : "Upgrade Plan"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
