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
  Check
} from "lucide-react";
import { checkConnectionStatus, getConnectUrl, disconnectService } from "@/app/actions/connect";
import { useUser } from "@clerk/nextjs";

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
      className={`w-10 h-5.5 flex items-center rounded-full p-0.5 transition-all duration-300 ease-in-out focus:outline-none relative ${
        checked 
          ? "bg-[#E8593C]" 
          : "bg-[rgba(36,27,20,0.12)]"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:scale-105 active:scale-95"}`}
    >
      <div
        className={`bg-white w-4.5 h-4.5 rounded-full shadow-sm transform transition-transform duration-300 ease-in-out ${
          checked ? "translate-x-4.5" : "translate-x-0"
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
    <div className="flex-1 bg-[#FBF3EC] flex overflow-hidden selection:bg-[#E8593C] selection:text-white h-full w-full relative">
      
      {/* Background dot grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] select-none" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #241B14 1px, transparent 0)`,
        backgroundSize: '24px 24px'
      }} />

      {/* ─── LEFT SIDEBAR TABS (HIGH-END MINIMALIST DESIGN) ─── */}
      <aside className="w-[230px] border-r border-[rgba(36,27,20,0.06)] bg-[rgba(251,243,236,0.3)] backdrop-blur-md flex flex-col shrink-0 p-6 space-y-8 z-10">
        <div className="space-y-1 px-3">
          <h2 
            style={{ fontFamily: "var(--font-civane, Georgia, serif)", fontWeight: 400 }}
            className="text-[20px] text-[#241B14] tracking-tight leading-none"
          >
            Settings
          </h2>
          <p className="font-sans text-[10.5px] text-[rgba(36,27,20,0.4)] leading-tight">
            Workspace configuration
          </p>
        </div>

        <nav className="flex flex-col gap-0.5">
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
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[8px] font-sans font-medium text-[13px] text-left transition-all duration-150 ${
                  isActive 
                    ? "bg-[rgba(36,27,20,0.05)] text-[#241B14] font-semibold" 
                    : "text-[rgba(36,27,20,0.45)] hover:text-[#241B14] hover:bg-[rgba(36,27,20,0.02)]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={15} className={isActive ? "text-[#E8593C]" : "text-[rgba(36,27,20,0.45)]"} />
                  <span>{tab.label}</span>
                </div>
                {isActive && (
                  <div className="w-1.5 h-1.5 bg-[#E8593C] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ─── RIGHT CONTENT AREA (CENTERED CONTENT CANVAS) ─── */}
      <main className="flex-1 overflow-y-auto p-12 md:p-16 z-10">
        <div className="max-w-[620px] mx-auto">
          
          {/* TAB 1: MY ACCOUNT */}
          {activeTab === "account" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="pb-4 border-b border-[rgba(36,27,20,0.08)] space-y-1">
                <h3 style={{ fontFamily: "var(--font-civane, Georgia, serif)", fontWeight: 400 }} className="text-[26px] text-[#241B14] tracking-tight leading-none">
                  My Account
                </h3>
                <p className="font-sans text-[12px] text-[rgba(36,27,20,0.45)]">Manage your display credentials, avatar uploader, and active identity.</p>
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
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="pb-4 border-b border-[rgba(36,27,20,0.08)] space-y-1">
                <h3 style={{ fontFamily: "var(--font-civane, Georgia, serif)", fontWeight: 400 }} className="text-[26px] text-[#241B14] tracking-tight leading-none">
                  Preferences
                </h3>
                <p className="font-sans text-[12px] text-[rgba(36,27,20,0.45)]">Configure visual interfaces, tones, timezones, and hours.</p>
              </div>

              <div className="space-y-6">
                {/* Interface Theme */}
                <div className="flex items-center justify-between gap-6 py-2 border-b border-[rgba(36,27,20,0.04)]">
                  <div className="space-y-0.5">
                    <span className="font-sans font-bold text-[13.5px] text-[#241B14]">Interface Theme</span>
                    <p className="font-sans text-[11.5px] text-[rgba(36,27,20,0.4)]">Choose your visual workspace style.</p>
                  </div>
                  <div className="flex bg-[#FBF3EC] p-0.5 rounded-[8px] border border-[rgba(36,27,20,0.08)]">
                    <button
                      onClick={() => setTheme("light")}
                      className={`px-3 py-1.5 rounded-[6px] font-sans font-bold text-[11px] flex items-center gap-1.5 transition-all ${
                        theme === "light" 
                          ? "bg-white text-[#E8593C] shadow-sm" 
                          : "text-[rgba(36,27,20,0.45)] hover:text-[#241B14]"
                      }`}
                    >
                      <Sun size={12} /> Light
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={`px-3 py-1.5 rounded-[6px] font-sans font-bold text-[11px] flex items-center gap-1.5 transition-all ${
                        theme === "dark" 
                          ? "bg-white text-[#E8593C] shadow-sm" 
                          : "text-[rgba(36,27,20,0.45)] hover:text-[#241B14]"
                      }`}
                    >
                      <Moon size={12} /> Dark
                    </button>
                  </div>
                </div>

                {/* AI Tone */}
                <div className="space-y-3 py-2 border-b border-[rgba(36,27,20,0.04)]">
                  <div className="space-y-0.5">
                    <span className="font-sans font-bold text-[13.5px] text-[#241B14]">AI Response Tone</span>
                    <p className="font-sans text-[11.5px] text-[rgba(36,27,20,0.45)]">Determine the style and tone used by Auren when answering drafts.</p>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans font-bold text-[12.5px] text-[#241B14] flex items-center gap-1.5">
                      <Globe size={13} className="text-[#E8593C]" />
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
                    <label className="font-sans font-bold text-[12.5px] text-[#241B14] flex items-center gap-1.5">
                      <Clock size={13} className="text-[#E8593C]" />
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

                <div className="flex justify-end pt-4 border-t border-[rgba(36,27,20,0.06)]">
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
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="pb-4 border-b border-[rgba(36,27,20,0.08)] space-y-1">
                <h3 style={{ fontFamily: "var(--font-civane, Georgia, serif)", fontWeight: 400 }} className="text-[26px] text-[#241B14] tracking-tight leading-none">
                  Integrations
                </h3>
                <p className="font-sans text-[12px] text-[rgba(36,27,20,0.45)]">Connect action parameters dynamically to third-party providers.</p>
              </div>

              <div className="divide-y divide-[rgba(36,27,20,0.06)]">
                {/* Google */}
                <div className="py-5 flex items-center justify-between gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-sans font-bold text-[14px] text-[#241B14]">Google Workspace</span>
                      <span className={`text-[8.5px] font-extrabold px-2 py-0.5 rounded-full border leading-none tracking-wide ${
                        connected.google 
                          ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                          : "bg-neutral-50 border-neutral-100 text-neutral-500"
                      }`}>
                        {connected.google ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                    <p className="font-sans text-[12px] text-[rgba(36,27,20,0.45)] max-w-md">Sync your inbox messages and calendar appointments dynamically.</p>
                  </div>
                  <Switch 
                    checked={connected.google} 
                    disabled={loading.google}
                    onChange={() => connected.google ? handleDisconnect("google") : handleConnect("google")}
                  />
                </div>

                {/* GitHub */}
                <div className="py-5 flex items-center justify-between gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-sans font-bold text-[14px] text-[#241B14]">GitHub Issues</span>
                      <span className={`text-[8.5px] font-extrabold px-2 py-0.5 rounded-full border leading-none tracking-wide ${
                        connected.github 
                          ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                          : "bg-neutral-50 border-neutral-100 text-neutral-500"
                      }`}>
                        {connected.github ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                    <p className="font-sans text-[12px] text-[rgba(36,27,20,0.45)] max-w-md">Log action items straight to code repositories.</p>
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
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="pb-4 border-b border-[rgba(36,27,20,0.08)] space-y-1">
                <h3 style={{ fontFamily: "var(--font-civane, Georgia, serif)", fontWeight: 400 }} className="text-[26px] text-[#241B14] tracking-tight leading-none">
                  Notifications
                </h3>
                <p className="font-sans text-[12px] text-[rgba(36,27,20,0.45)]">Decide when and how you are prompted for folder updates.</p>
              </div>

              <div className="divide-y divide-[rgba(36,27,20,0.06)]">
                {[
                  { id: "emailAlerts", label: "Sync Summaries", desc: "Receive automated email digests of core workspace and folder actions." },
                  { id: "pushAlerts", label: "Action Request Alerts", desc: "Always prompt for human confirmation before writing drafts or modifying items." },
                  { id: "soundEffects", label: "Auditory Feedback", desc: "Play subtle high-fidelity audio chimes when tasks are successfully executed." }
                ].map((item) => {
                  const key = item.id as keyof typeof notifications;
                  return (
                    <div key={item.id} className="flex items-center justify-between gap-6 py-5">
                      <div className="space-y-1">
                        <span className="font-sans font-bold text-[14px] text-[#241B14]">{item.label}</span>
                        <p className="font-sans text-[12px] text-[rgba(36,27,20,0.45)] max-w-md leading-relaxed">{item.desc}</p>
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
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="pb-4 border-b border-[rgba(36,27,20,0.08)] space-y-1">
                <h3 style={{ fontFamily: "var(--font-civane, Georgia, serif)", fontWeight: 400 }} className="text-[26px] text-[#241B14] tracking-tight leading-none">
                  Billing Plan
                </h3>
                <p className="font-sans text-[12px] text-[rgba(36,27,20,0.45)]">Control billing schedules and select your agent classification tier.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: "Auren Starter", title: "Auren Starter", price: "₹0", desc: "20 manual email syncs / day, basic heuristic classification" },
                  { id: "Auren Pro", title: "Auren Pro", price: "₹799", desc: "Unlimited live sync, full LLM action runs, smart zoom summaries", popular: true },
                  { id: "Auren Business", title: "Auren Business", price: "₹2,499", desc: "Multi-mailbox connections, shared team action cards, priority support" }
                ].map((plan) => {
                  const isCurrent = subscriptionTier === plan.id || (plan.id === "Auren Pro" && subscriptionTier === "Auren Pro Dev");
                  return (
                    <div 
                      key={plan.id} 
                      className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 transition-all duration-200 relative ${
                        isCurrent 
                          ? "border-[#E8593C] bg-white ring-1 ring-[#E8593C] shadow-sm" 
                          : "border-[rgba(36,27,20,0.06)] hover:border-[rgba(36,27,20,0.15)] bg-white/60"
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-2.5 left-5 bg-[#E8593C] text-white px-2 py-0.5 rounded-full font-sans font-extrabold text-[8px] uppercase tracking-wide leading-none">
                          POPULAR Choice
                        </div>
                      )}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-sans font-bold text-[14px] text-[#241B14]">{plan.title}</h4>
                          {isCurrent && (
                            <span className="text-[9px] font-bold bg-[#E8593C]/10 text-[#E8593C] px-2 py-0.5 rounded-full">Active</span>
                          )}
                        </div>
                        <p className="font-sans text-[11.5px] text-[rgba(36,27,20,0.5)] leading-relaxed max-w-sm">{plan.desc}</p>
                      </div>

                      <div className="flex items-center gap-5 shrink-0 justify-between sm:justify-end">
                        <div className="text-right">
                          <span className="font-sans font-extrabold text-[20px] text-[#241B14] tracking-tight">{plan.price}</span>
                          <span className="font-sans text-[11px] text-[rgba(36,27,20,0.4)] block leading-none mt-0.5">/ month</span>
                        </div>
                        <button
                          disabled={isCurrent}
                          onClick={() => {
                            localStorage.setItem("auren_subscription_tier", plan.id);
                            setSubscriptionTier(plan.id);
                            alert(`Subscribed to ${plan.title}!`);
                          }}
                          className={`px-5 py-2 rounded-xl font-sans font-semibold text-[12px] transition-all ${
                            isCurrent 
                              ? "bg-[rgba(36,27,20,0.04)] text-[rgba(36,27,20,0.4)] cursor-default font-medium" 
                              : "bg-[#241B14] text-white hover:bg-[#3E2F23] hover:scale-[1.02] active:scale-98"
                          }`}
                        >
                          {isCurrent ? "Current" : "Upgrade"}
                        </button>
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
