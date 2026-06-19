"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight, CheckCircle2, ChevronRight, Mail, CalendarDays, GitBranch, Zap, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { getConnectUrl, checkConnectionStatus } from "@/app/actions/connect";
import { showToast } from "@/components/ui/premium-toast";

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

  const loadStatus = React.useCallback(async () => {
    try {
      const status = await checkConnectionStatus();
      setConnected(status);
      return status;
    } catch (err) {
      console.error("Failed to load connection status:", err);
    }
  }, []);

  // Polling connection status in background when connecting
  React.useEffect(() => {
    if (isLoaded && user) {
      loadStatus();
      
      const interval = setInterval(async () => {
        try {
          const status = await checkConnectionStatus();
          
          setConnected((prev) => {
            if (!prev.google && status.google) {
              showToast.success("Google Workspace connected!");
            }
            if (!prev.github && status.github) {
              showToast.success("GitHub connected!");
            }
            
            // Clear connecting states once connected
            setConnecting((prevConnecting) => ({
              google: status.google ? false : prevConnecting.google,
              github: status.github ? false : prevConnecting.github,
            }));
            
            return status;
          });
        } catch (err) {
          console.error("Error polling connection status:", err);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [user, isLoaded, loadStatus]);

  const handleConnect = async (service: "google" | "github") => {
    if (!user) return;
    
    // Open a blank popup synchronously to satisfy browser security policies and bypass popup blockers
    const popup = window.open("about:blank", "_blank");
    if (!popup) {
      showToast.error("Popup window blocked. Please check your browser popup settings.");
      return;
    }
    
    popup.document.write(`
      <html>
        <head>
          <title>Connecting to ${service === "google" ? "Google Workspace" : "GitHub"}...</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
              display: flex; 
              flex-direction: column;
              align-items: center; 
              justify-content: center; 
              height: 100vh; 
              margin: 0; 
              background: #FAF8F5; 
              color: #241B14; 
            }
            .loader { 
              border: 3px solid rgba(232, 89, 60, 0.1); 
              border-top: 3px solid #E8593C; 
              border-radius: 50%; 
              width: 24px; 
              height: 24px; 
              animation: spin 1s linear infinite; 
              margin-bottom: 16px;
            }
            @keyframes spin { 
              0% { transform: rotate(0deg); } 
              100% { transform: rotate(360deg); } 
            }
            .title {
              font-size: 14px;
              font-weight: 600;
              margin-bottom: 4px;
            }
            .subtitle {
              font-size: 12px;
              color: rgba(36, 27, 20, 0.5);
            }
          </style>
        </head>
        <body>
          <div class="loader"></div>
          <div class="title">Preparing secure connection...</div>
          <div class="subtitle">Opening ${service === "google" ? "Google Workspace" : "GitHub"} authorization screen</div>
        </body>
      </html>
    `);
    popup.document.close();

    setConnecting((prev) => ({ ...prev, [service]: true }));
    try {
      const res = await getConnectUrl(service);
      
      if (res.success && res.url) {
        popup.location.href = res.url;
        const interval = setInterval(() => {
          if (popup.closed) {
            clearInterval(interval);
            setConnecting((prev) => ({ ...prev, [service]: false }));
          }
        }, 1000);
      } else {
        popup.close();
        showToast.error(res.error || "Failed to generate connection URL.");
        setConnecting((prev) => ({ ...prev, [service]: false }));
      }
    } catch (err: any) {
      popup.close();
      showToast.error(err.message || "An unexpected error occurred during connection.");
      setConnecting((prev) => ({ ...prev, [service]: false }));
    }
  };

  const [syncLimit, setSyncLimit] = useState(50);

  // Google is required; GitHub is optional
  const canEnter = connected.google;

  const handleEnterDashboard = () => {
    if (user) {
      localStorage.setItem(`auren_${user.id}_sync_limit`, String(syncLimit));
    }
    router.push("/app");
  };

  return (
    <div className="min-h-screen bg-[var(--auren-bg)] text-[var(--auren-fg)] font-ui selection:bg-[var(--auren-brand)] selection:text-white flex items-center justify-center p-6 transition-colors duration-300 relative">
      
      {/* Top Header with Profile Icon / Sign Out */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        {isLoaded && user && (
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[var(--auren-surface)] border border-[var(--auren-border)] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:bg-[var(--auren-surface-hover)]">
            <span className="text-[11.5px] font-semibold text-[var(--auren-muted)] max-w-[120px] truncate">
              {user.primaryEmailAddress?.emailAddress}
            </span>
            <UserButton />
          </div>
        )}
      </div>

      <div className="w-full max-w-[460px] z-10 animate-in fade-in slide-in-from-bottom-6 duration-500 flex flex-col gap-6">
        
        {/* ─── LOGO & BRANDING ─── */}
        <div className="flex flex-col items-center text-center mb-1 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="relative w-12 h-12 mb-4">
            <Image 
              src="/auren_logo.webp" 
              alt="Auren Logo" 
              fill 
              style={{ objectFit: "contain" }}
            />
          </div>
          
          <h1
            style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}
            className="text-[26px] text-[var(--auren-fg)] mb-1.5 tracking-tight transition-colors duration-300 font-normal"
          >
            Set up your workspace
          </h1>
          <p className="text-[13px] text-[var(--auren-muted)] leading-relaxed max-w-[340px]">
            Connect your accounts to enable Auren's AI execution layer across your daily tools.
          </p>
        </div>

        {/* ─── MAIN ONBOARDING CARD ─── */}
        <div className="bg-[var(--auren-surface)] border border-[var(--auren-border)] rounded-[24px] shadow-[0_24px_60px_-15px_rgba(36,27,20,0.06)] dark:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.45)] p-6 md:p-8 flex flex-col gap-6 transition-all duration-300">
          
          <div className="flex flex-col gap-4">
            
            {/* Google Workspace Connection Row */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--auren-surface-hover)] border border-[var(--auren-border)] flex items-center justify-center shadow-sm">
                    <svg width="18" height="18" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
                      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                      <path fill="#4CAF50" d="M24 44c5.2 0 9.8-2 13.3-5.1l-6.2-5.2C29.2 35.4 26.7 36 24 36c-5.2 0-9.7-3.3-11.3-8H6.3C9.7 35.7 16.3 40 24 40v4z"/>
                      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.2 5.2C41.6 34.9 44 29.9 44 24c0-1.3-.1-2.6-.4-3.9z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-ui font-semibold text-[13.5px] text-[var(--auren-fg)] flex items-center gap-1.5">
                      Google Workspace
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-[var(--auren-brand)]/10 text-[var(--auren-brand)] border border-[var(--auren-brand)]/20 rounded-[4px] shrink-0">Required</span>
                    </div>
                    <div className="text-[12px] text-[var(--auren-muted)] mt-0.5">Gmail & Google Calendar</div>
                  </div>
                </div>

                <button
                  onClick={() => handleConnect("google")}
                  disabled={connected.google || connecting.google}
                  className={cn(
                    "h-8 px-4 rounded-[10px] font-ui font-semibold text-xs transition-all flex items-center gap-1.5 min-w-[85px] justify-center cursor-pointer border shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
                    connected.google
                      ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/25 shadow-none cursor-default pointer-events-none font-bold"
                      : connecting.google
                      ? "bg-[var(--auren-surface-hover)] text-[var(--auren-muted-light)] border-[var(--auren-border)] cursor-not-allowed shadow-none"
                      : "bg-[var(--auren-surface)] border-[var(--auren-border-strong)] hover:border-[var(--auren-fg)] text-[var(--auren-fg)] hover:bg-[var(--auren-surface-hover)] active:scale-95"
                  )}
                >
                  {connected.google ? (
                    <><CheckCircle2 size={11} className="shrink-0" /> Connected</>
                  ) : connecting.google ? (
                    <><span className="w-2.5 h-2.5 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" /> Linking</>
                  ) : (
                    "Connect"
                  )}
                </button>
              </div>

              {/* Minimal Scopes List */}
              <div className="flex flex-col gap-1.5 pl-[52px]">
                <div className="flex items-center gap-2 text-[12px] text-[var(--auren-muted)]">
                  <Mail size={12} className="text-[var(--auren-brand)] shrink-0" />
                  <span>Read, parse, and send email actions</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-[var(--auren-muted)]">
                  <CalendarDays size={12} className="text-[var(--auren-info)] shrink-0" />
                  <span>Manage calendar agenda & scheduling</span>
                </div>
              </div>
            </div>

            <div className="h-[1px] bg-[var(--auren-border)] my-2" />

            {/* GitHub Connection Row */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--auren-surface-hover)] border border-[var(--auren-border)] flex items-center justify-center shadow-sm">
                  <GitBranch size={18} className="text-[var(--auren-fg)]" />
                </div>
                <div>
                  <div className="font-ui font-semibold text-[13.5px] text-[var(--auren-fg)] flex items-center gap-1.5">
                    GitHub
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-[var(--auren-surface-hover)] text-[var(--auren-muted)] border border-[var(--auren-border)] rounded-[4px] shrink-0">Optional</span>
                  </div>
                  <div className="text-[12px] text-[var(--auren-muted)] mt-0.5">Automated repository tracker</div>
                </div>
              </div>

              <button
                onClick={() => handleConnect("github")}
                disabled={connected.github || connecting.github}
                className={cn(
                  "h-8 px-4 rounded-[10px] font-ui font-semibold text-xs transition-all flex items-center gap-1.5 min-w-[85px] justify-center cursor-pointer border shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
                  connected.github
                    ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/25 shadow-none cursor-default pointer-events-none font-bold"
                    : connecting.github
                    ? "bg-[var(--auren-surface-hover)] text-[var(--auren-muted-light)] border-[var(--auren-border)] cursor-not-allowed shadow-none"
                    : "bg-[var(--auren-surface)] border-[var(--auren-border-strong)] hover:border-[var(--auren-fg)] text-[var(--auren-fg)] hover:bg-[var(--auren-surface-hover)] active:scale-95"
                )}
              >
                {connected.github ? (
                  <><CheckCircle2 size={11} className="shrink-0" /> Connected</>
                ) : connecting.github ? (
                  <><span className="w-2.5 h-2.5 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" /> Linking</>
                ) : (
                  "Connect"
                )}
              </button>
            </div>

          </div>

          {/* Sync Depth Card (Google must be connected) */}
          {canEnter && (
            <div className="border-t border-[var(--auren-border)] pt-4 flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="font-ui font-semibold text-[12.5px] text-[var(--auren-fg)] flex items-center gap-1.5">
                <Sparkles size={12} className="text-[var(--auren-brand)]" />
                Initial email sync depth
              </div>
              <div className="flex gap-3 w-full pt-2">
                {[
                  { value: 20, label: "Quick start" },
                  { value: 50, label: "Recommended" },
                  { value: 100, label: "Full import" }
                ].map((item) => {
                  const isActive = syncLimit === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setSyncLimit(item.value)}
                      className={cn(
                        "flex-1 flex flex-col items-center justify-center py-3 px-1 rounded-xl border transition-all cursor-pointer",
                        isActive
                          ? "bg-[var(--auren-surface)] text-[var(--auren-brand)] border-[var(--auren-brand)]/35 shadow-sm ring-1 ring-[var(--auren-brand)]/20"
                          : "border-[var(--auren-border)] bg-[var(--auren-surface-hover)] text-[var(--auren-muted)] hover:text-[var(--auren-fg)] hover:border-[var(--auren-border-strong)]"
                      )}
                    >
                      <span className="font-ui font-extrabold text-[15px]">
                        {item.value}
                      </span>
                      {item.value === 50 ? (
                        <span className="px-1.5 py-0.5 text-[7.5px] font-extrabold uppercase tracking-widest bg-[#E8593C] text-white rounded-full mt-1 shadow-[0_2px_4px_rgba(232,89,60,0.15)] scale-[0.95]">
                          Recommended
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold mt-1 tracking-tight uppercase opacity-85">
                          {item.label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div 
                className="text-[12px] text-center mt-1 font-sans" 
                style={{ color: "rgba(36,27,20,0.4)" }}
              >
                You can sync more emails anytime from Settings.
              </div>
            </div>
          )}

          {/* Platform capabilities info card */}
          <div className="bg-[var(--auren-surface-hover)] border border-[var(--auren-border)] rounded-[18px] p-4 flex gap-3">
            <Zap size={14} className="text-[var(--auren-brand)] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-ui font-semibold text-[12.5px] text-[var(--auren-fg)]">Platform Capabilities Enabled</div>
              <p className="text-[11.5px] text-[var(--auren-muted)] leading-relaxed">
                Auren drafts email replies, schedules calendar events directly from conversation context, lists repository issues, and organizes task briefs securely.
              </p>
            </div>
          </div>

          {/* Action Row containing CTA and Skip Link */}
          <div className="flex flex-col gap-3">
            {/* Primary CTA button */}
            <button
              onClick={handleEnterDashboard}
              disabled={!canEnter}
              className={cn(
                "w-full h-11 rounded-xl flex items-center justify-center gap-2 font-ui font-semibold text-[13px] transition-all duration-200 relative overflow-hidden group border",
                canEnter
                  ? "bg-[var(--auren-brand)] hover:bg-[var(--auren-brand-hover)] text-white border-transparent hover:-translate-y-0.5 shadow-sm hover:shadow-md hover:shadow-[var(--auren-brand)]/15 active:scale-[0.98] cursor-pointer"
                  : "bg-[var(--auren-surface-hover)] text-[var(--auren-muted-light)] border-[var(--auren-border)] cursor-not-allowed shadow-none"
              )}
            >
              {canEnter ? (
                <>
                  Enter Workspace
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </>
              ) : (
                "Connect Google to continue"
              )}
            </button>

            {/* Skip link */}
            <button
              onClick={handleEnterDashboard}
              className="w-full text-center text-[12px] text-[var(--auren-muted)] hover:text-[var(--auren-brand)] transition-colors py-1 cursor-pointer font-semibold"
            >
              Already set up? Go straight to workspace <ChevronRight size={11} className="inline-block mt-[-1.5px] ml-0.5" />
            </button>
          </div>

        </div>
        
      </div>
    </div>
  );
}

