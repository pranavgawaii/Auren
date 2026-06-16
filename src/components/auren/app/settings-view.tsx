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
  Lock
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

  // Profile
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
      alert("Avatar updated!");
    } catch (err: any) {
      alert(err.message || "Failed to upload avatar.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex-1 flex bg-[#FAF8F5] overflow-hidden selection:bg-[#E8593C] selection:text-white h-full">
      
      {/* LEFT COLUMN: Clean Minimalist Sticky Nav Navigation */}
      <div className="w-[260px] border-r border-[rgba(36,27,20,0.06)] p-8 shrink-0 flex flex-col justify-between bg-[#FAF8F5]">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="font-display font-extrabold text-[24px] text-[#241B14] tracking-tight leading-none">
              Settings
            </h1>
            <p className="font-sans text-[11px] text-[rgba(36,27,20,0.4)] mt-1.5 uppercase tracking-wider font-bold">Workspace Configuration</p>
          </div>

          <nav className="flex flex-col gap-1">
            {[
              { id: "section-general", label: "Preferences", icon: Settings },
              { id: "section-integrations", label: "Integrations", icon: Shield },
              { id: "section-notifications", label: "Notifications", icon: Bell },
              { id: "section-account", label: "Account Profile", icon: User },
              { id: "section-subscription", label: "Subscription", icon: CreditCard },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] font-sans font-semibold text-[13px] text-[rgba(36,27,20,0.55)] hover:text-[#241B14] hover:bg-[rgba(36,27,20,0.03)] transition-all text-left w-full group"
                >
                  <Icon size={15} className="text-[rgba(36,27,20,0.35)] group-hover:text-[#E8593C] transition-colors" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 px-2.5 py-2 bg-[rgba(36,27,20,0.02)] rounded-[8px] border border-[rgba(36,27,20,0.04)]">
          <Zap size={12} className="text-[#E8593C]" />
          <span className="font-sans font-bold text-[10px] text-[rgba(36,27,20,0.4)]">Auren Assistant Suite</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Single-Page Scrolling Settings Panels */}
      <div className="flex-1 p-12 overflow-y-auto max-w-[800px] space-y-12 scroll-smooth">
        
        {/* SECTION 1: Preferences */}
        <section id="section-general" className="space-y-6 pt-2">
          <div className="border-b border-[rgba(36,27,20,0.08)] pb-4">
            <h2 className="font-display font-extrabold text-[20px] text-[#241B14] tracking-tight">
              General Preferences
            </h2>
            <p className="font-sans text-[13px] text-[rgba(36,27,20,0.45)] mt-0.5">Adjust how your AI Agent operates and represents you.</p>
          </div>

          <div className="space-y-6">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-5 bg-white rounded-[16px] border border-[rgba(36,27,20,0.06)] shadow-sm">
              <div>
                <h4 className="font-sans font-bold text-[13.5px] text-[#241B14]">Interface Theme</h4>
                <p className="font-sans text-[11.5px] text-[rgba(36,27,20,0.4)] mt-0.5">Toggle light or dark modes.</p>
              </div>
              <div className="flex bg-[#FAF8F5] p-1 rounded-[10px] border border-[rgba(36,27,20,0.05)]">
                <button
                  onClick={() => setTheme("light")}
                  className={`px-3 py-1.5 rounded-[8px] font-sans font-bold text-[11.5px] flex items-center gap-1.5 transition-all ${
                    theme === "light" ? "bg-white text-[#E8593C] shadow-sm" : "text-[rgba(36,27,20,0.5)] hover:text-[#241B14]"
                  }`}
                >
                  <Sun size={13} /> Light
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`px-3 py-1.5 rounded-[8px] font-sans font-bold text-[11.5px] flex items-center gap-1.5 transition-all ${
                    theme === "dark" ? "bg-white text-[#E8593C] shadow-sm" : "text-[rgba(36,27,20,0.5)] hover:text-[#241B14]"
                  }`}
                >
                  <Moon size={13} /> Dark
                </button>
              </div>
            </div>

            {/* AI Reply Personality Options */}
            <div className="space-y-3">
              <label className="font-sans font-bold text-[12.5px] text-[#241B14] tracking-tight">AI Reply Tone & Heuristics</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "formal", title: "Formal", desc: "Structured, business-like tone", preview: "Dear client, we confirm..." },
                  { id: "casual", title: "Casual", desc: "Conversational & relaxed style", preview: "Hey! Just checking in on..." },
                  { id: "friendly", title: "Empathetic", desc: "Supportive, polite messaging", preview: "Hi there, I understand and..." },
                  { id: "professional", title: "Direct", desc: "Concise, minimal phrasing", preview: "Confirmed. Details below." }
                ].map((tone) => {
                  const isSelected = replyTone === tone.id;
                  return (
                    <button
                      key={tone.id}
                      onClick={() => setReplyTone(tone.id)}
                      className={`p-4 rounded-[12px] border text-left flex flex-col gap-2 transition-all duration-350 ${
                        isSelected 
                          ? "border-[#E8593C] bg-[rgba(232,89,60,0.02)] ring-1 ring-[#E8593C]" 
                          : "border-[rgba(36,27,20,0.06)] bg-white hover:border-[rgba(36,27,20,0.12)]"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-sans font-bold text-[13px] text-[#241B14]">{tone.title}</span>
                        {isSelected && <div className="w-4 h-4 rounded-full bg-[#E8593C] flex items-center justify-center text-white scale-90"><Check size={10} strokeWidth={3.5} /></div>}
                      </div>
                      <p className="font-sans text-[11px] text-[rgba(36,27,20,0.4)]">{tone.desc}</p>
                      <div className="p-2 bg-[#FAF8F5] rounded-[6px] font-sans text-[10px] text-[rgba(36,27,20,0.5)] italic border border-[rgba(36,27,20,0.02)]">
                        &ldquo;{tone.preview}&rdquo;
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Timezone Details */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="font-sans font-bold text-[12.5px] text-[#241B14]">Timezone Locale</label>
                <select 
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="h-10 px-3 bg-white border border-[rgba(36,27,20,0.08)] rounded-[10px] font-sans font-semibold text-[13px] text-[#241B14] focus:outline-none focus:border-[#E8593C] transition-colors"
                >
                  <option value="Asia/Kolkata">Kolkata, India (IST — GMT+5:30)</option>
                  <option value="America/New_York">New York, USA (EST — GMT-5:00)</option>
                  <option value="Europe/London">London, UK (GMT — GMT+0:00)</option>
                  <option value="Asia/Tokyo">Tokyo, Japan (JST — GMT+9:00)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-bold text-[12.5px] text-[#241B14]">Operational Start</label>
                <input 
                  type="time" 
                  value={workingHours.start}
                  onChange={(e) => setWorkingHours(prev => ({ ...prev, start: e.target.value }))}
                  className="h-10 px-3 bg-white border border-[rgba(36,27,20,0.08)] rounded-[10px] font-sans font-semibold text-[13px] text-[#241B14] focus:outline-none focus:border-[#E8593C] transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={saveGeneralSettings}
                className="h-10 px-6 bg-[#E8593C] hover:bg-[#D14F31] text-white rounded-[10px] font-sans font-bold text-[13px] transition-colors shadow-sm duration-300"
              >
                Update Preferences
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2: Integrations */}
        <section id="section-integrations" className="space-y-6">
          <div className="border-b border-[rgba(36,27,20,0.08)] pb-4">
            <h2 className="font-display font-extrabold text-[20px] text-[#241B14] tracking-tight">
              Connected Integrations
            </h2>
            <p className="font-sans text-[13px] text-[rgba(36,27,20,0.45)] mt-0.5">Authorize integrations for email parsing, scheduling, and project logging.</p>
          </div>

          <div className="space-y-3">
            {/* Google Row */}
            <div className="flex items-center justify-between p-4 bg-white rounded-[14px] border border-[rgba(36,27,20,0.06)] shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-[rgba(234,67,53,0.06)] text-[#EA4335] flex items-center justify-center border border-[rgba(234,67,53,0.04)]">
                  <Mail size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-bold text-[13.5px] text-[#241B14]">Google Gmail & Calendar</span>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border ${connected.google ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                      {connected.google ? "ACTIVE" : "OFF"}
                    </span>
                  </div>
                  <p className="font-sans text-[11px] text-[rgba(36,27,20,0.4)] mt-0.5">Sync inbox records and events.</p>
                </div>
              </div>
              <Switch 
                checked={connected.google} 
                disabled={loading.google}
                onChange={() => connected.google ? handleDisconnect("google") : handleConnect("google")}
              />
            </div>

            {/* GitHub Row */}
            <div className="flex items-center justify-between p-4 bg-white rounded-[14px] border border-[rgba(36,27,20,0.06)] shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-[rgba(36,27,20,0.04)] text-[#241B14] flex items-center justify-center border border-[rgba(36,27,20,0.03)]">
                  <GitBranch size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-bold text-[13.5px] text-[#241B14]">GitHub Issues Connection</span>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border ${connected.github ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                      {connected.github ? "ACTIVE" : "OFF"}
                    </span>
                  </div>
                  <p className="font-sans text-[11px] text-[rgba(36,27,20,0.4)] mt-0.5">Log action items as issue cards.</p>
                </div>
              </div>
              <Switch 
                checked={connected.github} 
                disabled={loading.github}
                onChange={() => connected.github ? handleDisconnect("github") : handleConnect("github")}
              />
            </div>
          </div>
        </section>

        {/* SECTION 3: Notifications */}
        <section id="section-notifications" className="space-y-6">
          <div className="border-b border-[rgba(36,27,20,0.08)] pb-4">
            <h2 className="font-display font-extrabold text-[20px] text-[#241B14] tracking-tight">
              Alerts & Notifications
            </h2>
            <p className="font-sans text-[13px] text-[rgba(36,27,20,0.45)] mt-0.5">Manage alert behaviors when executing actions.</p>
          </div>

          <div className="bg-white rounded-[16px] border border-[rgba(36,27,20,0.06)] p-5 shadow-sm space-y-4">
            {[
              { id: "emailAlerts", label: "Urgent Sync Reports", desc: "Receive email reports for key inbox events.", icon: MailCheck },
              { id: "pushAlerts", label: "Action Request Warnings", desc: "Alert when tasks require human checkoff.", icon: ShieldCheck },
              { id: "soundEffects", label: "Execution Sounds", desc: "Play auditory feedback upon action completion.", icon: Volume2 }
            ].map((item, idx) => {
              const Icon = item.icon;
              const key = item.id as keyof typeof notifications;
              return (
                <div key={item.id} className={`flex items-center justify-between ${idx > 0 ? "pt-4 border-t border-[rgba(36,27,20,0.05)]" : ""}`}>
                  <div className="flex items-center gap-3">
                    <Icon size={16} className="text-[#E8593C]" />
                    <div>
                      <div className="font-sans font-bold text-[13px] text-[#241B14]">{item.label}</div>
                      <p className="font-sans text-[11px] text-[rgba(36,27,20,0.4)] mt-0.5">{item.desc}</p>
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
        </section>

        {/* SECTION 4: Account Profile */}
        <section id="section-account" className="space-y-6">
          <div className="border-b border-[rgba(36,27,20,0.08)] pb-4">
            <h2 className="font-display font-extrabold text-[20px] text-[#241B14] tracking-tight">
              Account Profile
            </h2>
            <p className="font-sans text-[13px] text-[rgba(36,27,20,0.45)] mt-0.5">Customize your display credentials live inside the workspace.</p>
          </div>

          <div className="bg-white rounded-[16px] border border-[rgba(36,27,20,0.06)] p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-5 pb-5 border-b border-[rgba(36,27,20,0.05)]">
              <div className="relative group w-16 h-16 shrink-0 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-full h-full rounded-full overflow-hidden border border-[rgba(36,27,20,0.08)] bg-[rgba(232,89,60,0.04)] flex items-center justify-center font-sans font-extrabold text-[#E8593C] text-[26px]">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="Profile avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.firstName?.slice(0, 1) || "U"
                  )}
                </div>
                <div className="absolute inset-0 bg-black/45 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {uploadingAvatar ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
              </div>

              <div>
                <h4 className="font-sans font-extrabold text-[15px] text-[#241B14]">{user?.fullName || "Auren Assistant"}</h4>
                <p className="font-sans text-[11.5px] text-[rgba(36,27,20,0.4)] mt-0.5">Verified via Clerk Security System</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-sans font-bold text-[12px] text-[#241B14]">First Name</label>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-10 px-3 bg-[#FAF8F5] border border-[rgba(36,27,20,0.08)] rounded-[10px] font-sans font-semibold text-[13px] text-[#241B14] focus:outline-none focus:border-[#E8593C] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-sans font-bold text-[12px] text-[#241B14]">Last Name</label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-10 px-3 bg-[#FAF8F5] border border-[rgba(36,27,20,0.08)] rounded-[10px] font-sans font-semibold text-[13px] text-[#241B14] focus:outline-none focus:border-[#E8593C] transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-bold text-[11.5px] text-[rgba(36,27,20,0.4)] flex items-center gap-1"><Lock size={11} /> Registration Email Address (Read Only)</label>
              <input type="text" value={user?.emailAddresses[0]?.emailAddress || ""} disabled className="h-10 px-3 bg-[#FAF8F5] border border-[rgba(36,27,20,0.04)] text-[rgba(36,27,20,0.4)] rounded-[10px] font-sans font-semibold text-[13px] cursor-not-allowed outline-none select-all" />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[rgba(36,27,20,0.05)]">
              <span className="font-sans text-[11px] text-[rgba(36,27,20,0.35)]">Updates sync immediately across Clerk auth sessions.</span>
              <button 
                onClick={handleUpdateProfile}
                disabled={updatingProfile}
                className="h-10 px-5 bg-[#241B14] hover:bg-[#3E2F23] text-white rounded-[10px] font-sans font-bold text-[12.5px] transition-colors flex items-center gap-1.5"
              >
                {updatingProfile ? <Loader2 size={14} className="animate-spin" /> : "Save Profile"}
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 5: Subscription Plan */}
        <section id="section-subscription" className="space-y-6 pb-16">
          <div className="border-b border-[rgba(36,27,20,0.08)] pb-4">
            <h2 className="font-display font-extrabold text-[20px] text-[#241B14] tracking-tight">
              Subscription Tier
            </h2>
            <p className="font-sans text-[13px] text-[rgba(36,27,20,0.45)] mt-0.5">Control billing schedules and select your agent classification tier.</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { id: "Auren Starter", title: "Starter", price: "₹0", desc: "20 manual email syncs / day, heuristic classification" },
              { id: "Auren Pro", title: "Pro", price: "₹799", desc: "Unlimited live sync, full LLM agent actions, zoom summaries", popular: true },
              { id: "Auren Business", title: "Business", price: "₹2,499", desc: "Multi-account connections, collaborative inbox" }
            ].map((plan) => {
              const isCurrent = subscriptionTier === plan.id || (plan.id === "Auren Pro" && subscriptionTier === "Auren Pro Dev");
              return (
                <div 
                  key={plan.id} 
                  className={`bg-white p-5 rounded-[16px] border flex flex-col justify-between min-h-[260px] relative transition-all duration-300 ${
                    isCurrent ? "border-[#E8593C] ring-1 ring-[#E8593C]" : "border-[rgba(36,27,20,0.06)]"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-2 right-2 bg-[#E8593C]/10 text-[#E8593C] px-1.5 py-0.5 rounded-full font-sans font-extrabold text-[8px] uppercase tracking-wide">
                      PRO
                    </div>
                  )}
                  <div className="space-y-2">
                    <h4 className="font-sans font-extrabold text-[14px] text-[#241B14]">{plan.title}</h4>
                    <p className="font-sans text-[10px] text-[rgba(36,27,20,0.45)] leading-relaxed">{plan.desc}</p>
                    <div className="pt-2 flex items-baseline gap-0.5">
                      <span className="font-sans font-extrabold text-[22px] text-[#241B14]">{plan.price}</span>
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
                    className={`w-full py-2 rounded-[8px] font-sans font-bold text-[11.5px] transition-all ${
                      isCurrent ? "bg-[rgba(36,27,20,0.04)] text-[rgba(36,27,20,0.4)] cursor-default" : "bg-[#241B14] text-white hover:bg-[#3E2F23]"
                    }`}
                  >
                    {isCurrent ? "Current plan" : "Select plan"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
