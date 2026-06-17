"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  User, 
  SlidersHorizontal, 
  GitBranch, 
  Bell, 
  CreditCard,
  Loader2,
  Lock,
  Camera,
  Check,
  ChevronRight
} from "lucide-react";
import { showToast } from "@/components/ui/premium-toast";
import { checkConnectionStatus, getConnectUrl, disconnectService } from "@/app/actions/connect";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Pricing } from "@/components/blocks/pricing";

const aurenPlans = [
  {
    name: "STARTER",
    price: "0",
    yearlyPrice: "0",
    period: "per month",
    features: ["20 manual email syncs/day", "Basic heuristic classification", "Standard response time"],
    description: "Perfect for individuals and basic workflows",
    buttonText: "Current Plan",
    href: "#",
    isPopular: false,
  },
  {
    name: "AUREN PRO",
    price: "799",
    yearlyPrice: "639",
    period: "per month",
    features: ["Unlimited live sync", "Full LLM action runs", "Smart zoom summaries", "Priority queue"],
    description: "Ideal for power users maximizing productivity",
    buttonText: "Upgrade to Pro",
    href: "#",
    isPopular: true,
  },
  {
    name: "BUSINESS",
    price: "2499",
    yearlyPrice: "1999",
    period: "per month",
    features: ["Multi-mailbox connections", "Shared team action cards", "Dedicated account manager", "24/7 Phone support"],
    description: "For organizations requiring custom scale",
    buttonText: "Contact Sales",
    href: "#",
    isPopular: false,
  },
];

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
      className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-all duration-300 ease-in-out focus:outline-none relative ${
        checked 
          ? "bg-[#E8593C]" 
          : "bg-[rgba(36,27,20,0.08)] dark:bg-[rgba(255,255,255,0.15)]"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:scale-105 active:scale-95"}`}
    >
      <div
        className={`bg-white dark:bg-[#383838] w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ease-in-out ${
          checked ? "translate-x-4" : "translate-x-0"
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
  const [showTopbarToggle, setShowTopbarToggle] = useState(false);

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
      const savedTopbarToggle = localStorage.getItem("auren_show_topbar_toggle");
      setTheme(savedTheme);
      setReplyTone(savedTone);
      setTimezone(savedTimezone);
      setSubscriptionTier(savedTier);
      if (savedTopbarToggle) {
        setShowTopbarToggle(savedTopbarToggle === "true");
      }
      
      // Read the actual current theme from the DOM (already applied by the root layout),
      // then sync state to it — never override the DOM from here.
      const isDarkNow = document.documentElement.classList.contains("dark");
      const resolvedTheme = isDarkNow ? "dark" : "light";
      // Only update localStorage if we don't have a saved value yet
      // Only update localStorage if we don't have a saved value yet
      if (!localStorage.getItem("auren_theme")) {
        localStorage.setItem("auren_theme", resolvedTheme);
      }
      setTheme(resolvedTheme);
      
      // Auto-route to specific tab if requested (e.g. from Upgrade button)
      const defaultTab = localStorage.getItem("auren_default_settings_tab");
      if (defaultTab) {
        setActiveTab(defaultTab as any);
        localStorage.removeItem("auren_default_settings_tab");
      }
    }

    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
    }

    const handleFocus = () => loadStatus();
    window.addEventListener("focus", handleFocus);
    
    // Custom event listener for cross-component routing (from Upgrade button)
    const handleOpenBilling = () => setActiveTab("billing");
    window.addEventListener("auren-open-billing", handleOpenBilling);
    
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("auren-open-billing", handleOpenBilling);
    };
  }, [user]);

  const handleConnect = async (service: "google" | "github") => {
    setLoading((prev) => ({ ...prev, [service]: true }));
    const res = await getConnectUrl(service);
    if (res.success && res.url) {
      window.open(res.url, "_blank");
    } else {
      showToast.error(res.error || `Failed to connect ${service}`);
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
      showToast.error(res.error || `Failed to disconnect ${service}`);
    }
    setLoading((prev) => ({ ...prev, [service]: false }));
  };

  const saveGeneralSettings = () => {
    localStorage.setItem("auren_theme", theme);
    localStorage.setItem("auren_reply_tone", replyTone);
    localStorage.setItem("auren_timezone", timezone);
    localStorage.setItem("auren_show_topbar_toggle", showTopbarToggle.toString());
    window.dispatchEvent(new Event("auren_preferences_updated"));
    showToast.success("Preferences updated!");
  };

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("auren_theme", newTheme);
    window.dispatchEvent(new Event("auren_preferences_updated"));
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      setUpdatingProfile(true);
      await user.update({ firstName, lastName });
      showToast.success("Profile updated!");
    } catch (err: any) {
      showToast.error(err.message || "Failed to update profile name.");
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
      showToast.success("Avatar updated successfully!");
    } catch (err: any) {
      showToast.error(err.message || "Failed to upload avatar.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF8F5] dark:bg-[#2C2C2C] text-[#241B14] dark:text-[#F4F4F5] text-[13px] w-full font-sans antialiased">
      {/* ─── LEFT SIDEBAR TABS (ADMIN-STYLE) ─── */}
      <aside className="w-[220px] border-r border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] flex flex-col bg-[#FAF8F5] dark:bg-[#2C2C2C] shrink-0 z-10">
        <div className="h-14 px-4 flex items-center border-b border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-2 font-medium text-[22px]" style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>
            Settings
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
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md transition-colors text-[12px] ${
                  isActive 
                    ? "bg-white dark:bg-[#383838] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-sm font-medium text-[#241B14] dark:text-[#F4F4F5]" 
                    : "text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] hover:text-[#241B14] dark:text-[#F4F4F5] hover:bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.1)] border border-transparent"
                }`}
              >
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>
      </aside>

      {/* ─── RIGHT CONTENT AREA ─── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto z-10 bg-[#FAF8F5] dark:bg-[#2C2C2C]">
        <div className="p-6 max-w-[700px] w-full mx-auto">
          
          {/* TAB 1: MY ACCOUNT */}
          {activeTab === "account" && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-1.5">
                <h2 className="text-[28px] tracking-tight text-[#241B14] dark:text-[#F4F4F5]" style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>
                  My Account
                </h2>
                <p className="font-sans text-[13px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]">Manage your display credentials, avatar uploader, and active identity.</p>
              </div>

              <div className="bg-white dark:bg-[#383838] rounded-[16px] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-sm p-6 space-y-6">
                <div className="flex items-center gap-5">
                  <div 
                    className="relative group w-14 h-14 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-[#FAF8F5] shadow-sm bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.1)] flex items-center justify-center font-sans font-bold text-[#241B14] dark:text-[#F4F4F5] text-[18px]"
                    onClick={() => fileInputRef.current?.click()}
                    title="Change display avatar"
                  >
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt="Profile photo" className="w-full h-full object-cover" />
                    ) : (
                      user?.firstName?.slice(0, 1) || "U"
                    )}
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {uploadingAvatar ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-sans font-bold text-[15px] text-[#241B14] dark:text-[#F4F4F5]">{user?.fullName || "Auren User"}</h4>
                    <p className="font-sans text-[11px] text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.1)] px-2 py-0.5 rounded-full w-max">Clerk Active Identity Verification</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans font-semibold text-[11px] text-[#241B14] dark:text-[#F4F4F5] uppercase tracking-wide">First Name</label>
                    <input 
                      type="text" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-9 px-3 bg-[#FAF8F5] dark:bg-[#2C2C2C] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[8px] font-sans font-medium text-[13px] text-[#241B14] dark:text-[#F4F4F5] focus:outline-none focus:border-[#E8593C] focus:ring-1 focus:ring-[#E8593C]/20 transition-all shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans font-semibold text-[11px] text-[#241B14] dark:text-[#F4F4F5] uppercase tracking-wide">Last Name</label>
                    <input 
                      type="text" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-9 px-3 bg-[#FAF8F5] dark:bg-[#2C2C2C] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[8px] font-sans font-medium text-[13px] text-[#241B14] dark:text-[#F4F4F5] focus:outline-none focus:border-[#E8593C] focus:ring-1 focus:ring-[#E8593C]/20 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans font-semibold text-[11px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] flex items-center gap-1 uppercase tracking-wide">
                    <Lock size={10} /> Registration Email Address
                  </label>
                  <input 
                    type="text" 
                    value={user?.emailAddresses[0]?.emailAddress || ""} 
                    disabled 
                    className="h-9 px-3 bg-[#FAF8F5] dark:bg-[#2C2C2C]/50 border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] rounded-[8px] font-sans font-medium text-[13px] cursor-not-allowed w-full outline-none select-all" 
                  />
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)]">
                  <span className="font-sans text-[11px] text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]">Updates sync immediately across Clerk auth sessions.</span>
                  <button 
                    onClick={handleUpdateProfile}
                    disabled={updatingProfile}
                    className="h-9 px-5 bg-[#241B14] hover:bg-[#3E2F23] text-white rounded-[8px] font-sans font-bold text-[12px] transition-all flex items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  >
                    {updatingProfile ? <Loader2 size={14} className="animate-spin" /> : "Save Profile"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PREFERENCES */}
          {activeTab === "preferences" && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-1.5">
                <h2 className="text-[28px] tracking-tight text-[#241B14] dark:text-[#F4F4F5]" style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>
                  Preferences
                </h2>
                <p className="font-sans text-[13px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]">Configure visual interfaces, tones, timezones, and hours.</p>
              </div>

              <div className="bg-white dark:bg-[#383838] rounded-[16px] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-sm p-6 space-y-6">
                {/* Interface Theme */}
                <div className="flex flex-col gap-3 pb-6 border-b border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)]">
                  <div className="space-y-1">
                    <span className="font-semibold text-[14px] text-[#241B14] dark:text-[#F4F4F5]" style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>Interface Theme</span>
                    <p className="text-[12px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]">Choose your visual workspace style.</p>
                  </div>
                  <div className="flex bg-[#FAF8F5] dark:bg-[#2C2C2C] p-1 rounded-[10px] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] w-max shadow-inner">
                    <button
                      onClick={() => handleThemeChange("light")}
                      className={`px-4 py-1.5 rounded-[6px] font-sans font-bold text-[12px] flex items-center gap-2 transition-all ${
                        theme === "light" 
                          ? "bg-white dark:bg-[#383838] text-[#E8593C] shadow-sm border border-[rgba(36,27,20,0.04)] dark:border-[rgba(255,255,255,0.04)]" 
                          : "text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] hover:text-[#241B14] dark:text-[#F4F4F5]"
                      }`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => handleThemeChange("dark")}
                      className={`px-4 py-1.5 rounded-[6px] font-sans font-bold text-[12px] flex items-center gap-2 transition-all ${
                        theme === "dark" 
                          ? "bg-white dark:bg-[#383838] text-[#E8593C] shadow-sm border border-[rgba(36,27,20,0.04)] dark:border-[rgba(255,255,255,0.04)]" 
                          : "text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] hover:text-[#241B14] dark:text-[#F4F4F5]"
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                </div>

                {/* Topbar Theme Toggle Setting */}
                <div className="flex items-center justify-between pb-6 border-b border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)]">
                  <div className="space-y-1">
                    <span className="font-semibold text-[14px] text-[#241B14] dark:text-[#F4F4F5]" style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>Show Theme Toggle in Topbar</span>
                    <p className="text-[12px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] max-w-sm">Display the quick sun/moon toggle switch next to your profile picture.</p>
                  </div>
                  <Switch 
                    checked={showTopbarToggle} 
                    onChange={(val) => {
                      setShowTopbarToggle(val);
                      localStorage.setItem("auren_show_topbar_toggle", val.toString());
                      window.dispatchEvent(new Event("auren_preferences_updated"));
                    }} 
                  />
                </div>

                {/* AI Tone */}
                <div className="space-y-3 pb-6 border-b border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)]">
                  <div className="space-y-1">
                    <span className="font-semibold text-[14px] text-[#241B14] dark:text-[#F4F4F5]" style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>AI Response Tone</span>
                    <p className="text-[12px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]">Determine the style and tone used by Auren when answering drafts.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-2">
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
                          className={`p-3 rounded-[12px] border text-left flex flex-col gap-1.5 transition-all group ${
                            isSelected 
                              ? "border-[#E8593C] bg-[#E8593C]/5 ring-1 ring-[#E8593C]/20 shadow-sm" 
                              : "border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FAF8F5] dark:bg-[#2C2C2C] hover:border-[#E8593C]/50 hover:shadow-sm"
                          }`}
                        >
                          <span className={`font-sans font-bold text-[12px] ${
                            isSelected ? "text-[#E8593C]" : "text-[#241B14] dark:text-[#F4F4F5] group-hover:text-[#E8593C]"
                          }`}>{tone.label}</span>
                          <span className="font-sans text-[11px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] truncate w-full">{tone.preview}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Operational timezone */}
                <div className="flex gap-4 pb-2">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="font-sans font-bold text-[11px] text-[#241B14] dark:text-[#F4F4F5] uppercase tracking-wide">
                      Operational Timezone
                    </label>
                    <select 
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full h-9 px-3 bg-[#FAF8F5] dark:bg-[#2C2C2C] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[8px] font-sans font-medium text-[12px] text-[#241B14] dark:text-[#F4F4F5] focus:outline-none focus:border-[#E8593C] focus:ring-1 focus:ring-[#E8593C]/20 transition-all shadow-sm"
                    >
                      <option value="Asia/Kolkata">Kolkata, India (IST)</option>
                      <option value="America/New_York">New York, USA (EST)</option>
                      <option value="Europe/London">London, UK (GMT)</option>
                      <option value="Asia/Tokyo">Tokyo, Japan (JST)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5 w-1/3">
                    <label className="font-sans font-bold text-[11px] text-[#241B14] dark:text-[#F4F4F5] uppercase tracking-wide">
                      Start Hour
                    </label>
                    <input 
                      type="time" 
                      value={workingHours.start}
                      onChange={(e) => setWorkingHours(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full h-9 px-3 bg-[#FAF8F5] dark:bg-[#2C2C2C] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[8px] font-sans font-medium text-[12px] text-[#241B14] dark:text-[#F4F4F5] focus:outline-none focus:border-[#E8593C] focus:ring-1 focus:ring-[#E8593C]/20 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)]">
                  <button 
                    onClick={saveGeneralSettings}
                    className="h-9 px-6 bg-[#E8593C] hover:bg-[#E8593C]-hover active:scale-95 text-white rounded-[8px] font-sans font-bold text-[12px] transition-all shadow-sm hover:shadow-md"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INTEGRATIONS */}
          {activeTab === "integrations" && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-1.5">
                <h2 className="text-[28px] tracking-tight text-[#241B14] dark:text-[#F4F4F5]" style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>
                  Integrations
                </h2>
                <p className="font-sans text-[13px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]">Connect action parameters dynamically to third-party providers.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Google */}
                <div className="bg-white dark:bg-[#383838] rounded-[16px] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-sm p-5 flex items-center justify-between transition-all hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[12px] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FAF8F5] dark:bg-[#2C2C2C] flex items-center justify-center shadow-inner">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#241B14] dark:text-[#F4F4F5]"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[16px] text-[#241B14] dark:text-[#F4F4F5]" style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>Google Workspace</span>
                        {connected.google && <span className="text-[9px] font-bold bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 rounded-full border border-[#10B981]/20">ACTIVE</span>}
                      </div>
                      <p className="text-[12px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] max-w-sm">Sync your inbox messages and calendar appointments dynamically.</p>
                    </div>
                  </div>
                  <Switch 
                    checked={connected.google} 
                    disabled={loading.google}
                    onChange={() => connected.google ? handleDisconnect("google") : handleConnect("google")}
                  />
                </div>

                {/* GitHub */}
                <div className="bg-white dark:bg-[#383838] rounded-[16px] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-sm p-5 flex items-center justify-between transition-all hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[12px] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FAF8F5] dark:bg-[#2C2C2C] flex items-center justify-center shadow-inner">
                      <GitBranch size={24} className="text-[#241B14] dark:text-[#F4F4F5]" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[16px] text-[#241B14] dark:text-[#F4F4F5]" style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>GitHub Issues</span>
                        {connected.github && <span className="text-[9px] font-bold bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 rounded-full border border-[#10B981]/20">ACTIVE</span>}
                      </div>
                      <p className="text-[12px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] max-w-sm">Log action items straight to code repositories.</p>
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
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-1.5">
                <h2 className="text-[28px] tracking-tight text-[#241B14] dark:text-[#F4F4F5]" style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>
                  Notifications
                </h2>
                <p className="font-sans text-[13px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]">Decide when and how you are prompted for folder updates.</p>
              </div>

              <div className="bg-white dark:bg-[#383838] rounded-[16px] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-sm p-2">
                {[
                  { id: "emailAlerts", label: "Sync Summaries", desc: "Receive automated email digests of core workspace and folder actions." },
                  { id: "pushAlerts", label: "Action Request Alerts", desc: "Always prompt for human confirmation before writing drafts or modifying items." },
                  { id: "soundEffects", label: "Auditory Feedback", desc: "Play subtle high-fidelity audio chimes when tasks are successfully executed." }
                ].map((item, idx, arr) => {
                  const key = item.id as keyof typeof notifications;
                  return (
                    <div key={item.id} className={`flex items-center justify-between p-4 ${idx !== arr.length - 1 ? "border-b border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)]" : ""}`}>
                      <div className="flex-1 pr-4">
                        <div className="space-y-1">
                          <span className="font-semibold text-[15px] text-[#241B14] dark:text-[#F4F4F5]" style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>{item.label}</span>
                          <p className="text-[12px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] max-w-md leading-relaxed">{item.desc}</p>
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
            <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Pricing 
                plans={aurenPlans}
                title="Upgrade your workspace"
                description={"Select the perfect intelligence tier for your workflow.\nSwitch plans or cancel anytime."}
              />
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
