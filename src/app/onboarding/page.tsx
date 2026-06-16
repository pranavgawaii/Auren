"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight, CheckCircle2, ChevronRight, Mail, CalendarDays, GitBranch, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [connected, setConnected] = useState({
    google: false, // Covers both Gmail + Calendar
    github: false,
  });
  const [connecting, setConnecting] = useState({
    google: false,
    github: false,
  });

  React.useEffect(() => {
    if (isLoaded && user) {
      setConnected({
        google: localStorage.getItem(`auren_${user.id}_google_connected`) === "true",
        github: localStorage.getItem(`auren_${user.id}_github_connected`) === "true",
      });
    }
  }, [user, isLoaded]);

  const handleConnect = (service: "google" | "github") => {
    if (!user) return;
    setConnecting((prev) => ({ ...prev, [service]: true }));
    // Simulates the Corsair OAuth flow completing
    setTimeout(() => {
      setConnected((prev) => ({ ...prev, [service]: true }));
      setConnecting((prev) => ({ ...prev, [service]: false }));
      localStorage.setItem(`auren_${user.id}_${service}_connected`, "true");
    }, 1200);
  };

  // Google is required; GitHub is optional
  const canEnter = connected.google;

  return (
    <div className="min-h-screen bg-[#FBF3EC] font-sans selection:bg-[#E8593C] selection:text-white flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background blobs */}
      <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-white rounded-full blur-[140px] opacity-50 pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#E8593C] rounded-full blur-[160px] opacity-[0.07] pointer-events-none" />

      <div className="w-full max-w-[520px] z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Brand */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-[52px] h-[52px] rounded-[14px] overflow-hidden relative mb-5 shadow-md ring-1 ring-black/5">
            <Image src="/auren_logo.webp" alt="Auren" fill style={{ objectFit: "cover" }} />
          </div>
          <h1
            style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}
            className="text-[30px] text-[#241B14] mb-3 tracking-tight"
          >
            Set up your workspace
          </h1>
          <p className="text-[14px] text-[rgba(36,27,20,0.5)] leading-relaxed max-w-[380px]">
            Connect your Google account so Auren can read your emails, manage your calendar, and take actions on your behalf.
          </p>
        </div>

        {/* Connection Cards */}
        <div className="flex flex-col gap-3 mb-6">

          {/* Google Card — REQUIRED */}
          <div
            className={cn(
              "bg-white rounded-[18px] border shadow-sm p-5 transition-all duration-300",
              connected.google
                ? "border-[#0F6E56] bg-[#F0FBF7]"
                : "border-[rgba(36,27,20,0.08)] hover:border-[rgba(36,27,20,0.14)]"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* Google G logo SVG */}
                <div className="w-10 h-10 rounded-full bg-white border border-[rgba(36,27,20,0.08)] flex items-center justify-center shadow-sm">
                  <svg width="20" height="20" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
                    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                    <path fill="#4CAF50" d="M24 44c5.2 0 9.8-2 13.3-5.1l-6.2-5.2C29.2 35.4 26.7 36 24 36c-5.2 0-9.7-3.3-11.3-8H6.3C9.7 35.7 16.3 40 24 40v4z"/>
                    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.2 5.2C41.6 34.9 44 29.9 44 24c0-1.3-.1-2.6-.4-3.9z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-[14px] text-[#241B14] flex items-center gap-2">
                    Google
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-[#E8593C] text-white rounded-full">Required</span>
                  </div>
                  <div className="text-[12px] text-[rgba(36,27,20,0.5)] mt-0.5">Gmail + Google Calendar</div>
                </div>
              </div>
              <button
                onClick={() => handleConnect("google")}
                disabled={connected.google || connecting.google}
                className={cn(
                  "h-8 px-4 rounded-[8px] font-semibold text-[12px] transition-all flex items-center gap-1.5 min-w-[80px] justify-center",
                  connected.google
                    ? "bg-[#E1F5EE] text-[#085041] cursor-default"
                    : connecting.google
                    ? "bg-[rgba(36,27,20,0.06)] text-[rgba(36,27,20,0.4)] cursor-not-allowed"
                    : "bg-[#241B14] text-white hover:bg-[#3E2F23] shadow-sm"
                )}
              >
                {connected.google ? (
                  <><CheckCircle2 size={13} /> Connected</>
                ) : connecting.google ? (
                  <><span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" /> Connecting</>
                ) : (
                  "Connect"
                )}
              </button>
            </div>

            {/* Permissions explainer */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="flex items-center gap-2 px-3 py-2 bg-[rgba(36,27,20,0.03)] rounded-[10px]">
                <Mail size={13} className="text-[#E8593C] shrink-0" />
                <span className="text-[11px] text-[rgba(36,27,20,0.6)]">Read & compose email</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-[rgba(36,27,20,0.03)] rounded-[10px]">
                <CalendarDays size={13} className="text-[#4285F4] shrink-0" />
                <span className="text-[11px] text-[rgba(36,27,20,0.6)]">View & create events</span>
              </div>
            </div>
          </div>

          {/* GitHub Card — OPTIONAL */}
          <div
            className={cn(
              "bg-white rounded-[18px] border shadow-sm p-5 transition-all duration-300",
              connected.github
                ? "border-[#0F6E56] bg-[#F0FBF7]"
                : "border-[rgba(36,27,20,0.08)] hover:border-[rgba(36,27,20,0.14)]"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#24292e] flex items-center justify-center">
                  <GitBranch size={18} className="text-white" />
                </div>
                <div>
                  <div className="font-semibold text-[14px] text-[#241B14] flex items-center gap-2">
                    GitHub
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-[rgba(36,27,20,0.06)] text-[rgba(36,27,20,0.5)] rounded-full">Optional</span>
                  </div>
                  <div className="text-[12px] text-[rgba(36,27,20,0.5)] mt-0.5">Create and manage issues</div>
                </div>
              </div>
              <button
                onClick={() => handleConnect("github")}
                disabled={connected.github || connecting.github}
                className={cn(
                  "h-8 px-4 rounded-[8px] font-semibold text-[12px] transition-all flex items-center gap-1.5 min-w-[80px] justify-center",
                  connected.github
                    ? "bg-[#E1F5EE] text-[#085041] cursor-default"
                    : connecting.github
                    ? "bg-[rgba(36,27,20,0.06)] text-[rgba(36,27,20,0.4)] cursor-not-allowed"
                    : "bg-[rgba(36,27,20,0.06)] text-[#241B14] hover:bg-[rgba(36,27,20,0.1)]"
                )}
              >
                {connected.github ? (
                  <><CheckCircle2 size={13} /> Connected</>
                ) : connecting.github ? (
                  <><span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" /> Connecting</>
                ) : (
                  "Connect"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Auren capability preview */}
        <div className="bg-white/60 backdrop-blur-sm rounded-[14px] border border-[rgba(36,27,20,0.06)] p-4 mb-6 flex items-start gap-3">
          <Zap size={16} className="text-[#E8593C] shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-[12px] text-[#241B14] mb-1">What Auren can do once connected</div>
            <div className="text-[11px] text-[rgba(36,27,20,0.55)] leading-relaxed">
              Auto-reply to emails · Schedule meetings from email threads · Create GitHub issues from bugs · Summarise your week · Prioritise your inbox automatically
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push("/app")}
          disabled={!canEnter}
          className={cn(
            "w-full h-[52px] rounded-[14px] flex items-center justify-center gap-2 font-semibold text-[15px] transition-all",
            canEnter
              ? "bg-[#E8593C] text-white hover:bg-[#D14F31] shadow-[0_8px_24px_-8px_rgba(232,89,60,0.45)] cursor-pointer"
              : "bg-[rgba(36,27,20,0.06)] text-[rgba(36,27,20,0.3)] cursor-not-allowed"
          )}
        >
          {canEnter ? "Enter Dashboard" : "Connect Google to continue"}
          {canEnter && <ArrowRight size={18} />}
        </button>

        {/* Skip entirely for returning users */}
        <button
          onClick={() => router.push("/app")}
          className="w-full text-center mt-3 text-[12px] text-[rgba(36,27,20,0.4)] hover:text-[rgba(36,27,20,0.6)] transition-colors py-2"
        >
          Already set up? Go straight to dashboard <ChevronRight size={12} className="inline" />
        </button>

      </div>
    </div>
  );
}
