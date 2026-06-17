"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, Info, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export type ToastType = "success" | "error" | "warning" | "info";

interface PremiumToastProps {
  message: string;
  type?: ToastType;
  t?: string | number; // sonner toast id
}

export function PremiumToast({ message, type = "info", t }: PremiumToastProps) {
  const isError = type === "error";
  const isSuccess = type === "success";
  const isWarning = type === "warning";

  useEffect(() => {
    // Play a subtle "tick/pop" sound when the toast mounts
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        // Gentle "pop" sound
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
        
        gain.gain.setValueAtTime(0.08, ctx.currentTime); // subtle volume
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch (e) {
      // Ignore audio errors silently
    }
  }, []);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      className={`
        relative overflow-hidden pointer-events-auto
        flex items-center gap-3.5 px-4 py-3 
        rounded-[16px] border shadow-[0_12px_40px_rgba(36,27,20,0.08)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)]
        min-w-[300px] max-w-[420px] bg-[#FDFBF9] dark:bg-[#2C2C2C]
        ${isError ? 'border-[#E8593C]/20' : 
          isSuccess ? 'border-[#E8593C]/10' : 
          isWarning ? 'border-[#FBBF24]/20' :
          'border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)]'}
      `}
      onClick={() => toast.dismiss(t)}
    >
      <div className={`
        flex items-center justify-center shrink-0 w-7 h-7 rounded-full shadow-sm border
        ${isError ? 'bg-[#E8593C]/10 text-[#E8593C] border-[#E8593C]/20' : 
          isSuccess ? 'bg-[#E8593C] text-white border-[#E8593C]' : 
          isWarning ? 'bg-[#FBBF24]/10 text-[#FBBF24] border-[#FBBF24]/20' :
          'bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.04)] text-[rgba(36,27,20,0.7)] dark:text-[rgba(255,255,255,0.7)] border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)]'}
      `}>
        {isError && <X size={14} strokeWidth={3} />}
        {isSuccess && <Check size={14} strokeWidth={3} />}
        {isWarning && <AlertTriangle size={14} strokeWidth={3} />}
        {!isError && !isSuccess && !isWarning && <Info size={14} strokeWidth={3} />}
      </div>

      <div className="flex flex-col flex-1 min-w-0 relative z-10">
        <span style={{ fontFamily: "var(--font-sans), sans-serif" }} className="text-[13.5px] font-semibold text-[#241B14] dark:text-[#F4F4F5] tracking-wide leading-snug">
          {message}
        </span>
      </div>
      
      {/* Interactive Close X */}
      <div className="shrink-0 text-[rgba(36,27,20,0.3)] dark:text-[rgba(255,255,255,0.3)] hover:text-[#E8593C] transition-colors cursor-pointer p-1 -mr-1">
        <X size={14} strokeWidth={2.5} />
      </div>
    </motion.div>
  );
}

// Utility to fire custom toasts
export const showToast = {
  success: (message: string) => {
    toast.custom((t) => <PremiumToast message={message} type="success" t={t} />, { duration: 4000 });
  },
  error: (message: string) => {
    toast.custom((t) => <PremiumToast message={message} type="error" t={t} />, { duration: 5000 });
  },
  warning: (message: string) => {
    toast.custom((t) => <PremiumToast message={message} type="warning" t={t} />, { duration: 4000 });
  },
  info: (message: string) => {
    toast.custom((t) => <PremiumToast message={message} type="info" t={t} />, { duration: 4000 });
  }
};
