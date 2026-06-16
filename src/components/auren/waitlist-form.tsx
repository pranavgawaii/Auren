"use client";

import { useState } from "react";
import { joinWaitlist } from "@/app/actions/join-waitlist";
import { Loader2 } from "lucide-react";

export function WaitlistForm({ theme = "dark" }: { theme?: "light" | "dark" }) {
  const [email, setEmail] = useState("");
  const [useCase, setUseCase] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState<"idle" | "loading1" | "step2" | "loading2" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading1");
    const result = await joinWaitlist(email);

    if (result.success) {
      setStatus("step2");
    } else {
      setStatus("error");
      setMessage(result.error ?? "Something went wrong.");
    }
  };

  const handleDetailsSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatus("loading2");
    
    const result = await joinWaitlist(email, useCase, source);

    if (result.success) {
      setStatus("success");
      setMessage("You're all set! Thanks for sharing.");
      setEmail("");
      setUseCase("");
      setSource("");
    } else {
      setStatus("error");
      setMessage(result.error ?? "Something went wrong.");
    }
  };

  const handleSkip = () => {
    setStatus("success");
    setMessage("You're on the Auren Premium waitlist ✦");
    setEmail("");
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-[12px] py-[10px]">
        <div className="w-[48px] h-[48px] rounded-full bg-[#F0FDF8] border border-[#A7C4BB] flex items-center justify-center">
          <svg className="w-[24px] h-[24px] text-[#0F6E56]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="font-sans font-medium text-[16px] text-[#0F6E56]">{message}</p>
      </div>
    );
  }

  const inputClass = "w-full h-[44px] border border-[rgba(36,27,20,0.10)] rounded-[8px] px-[16px] font-sans font-normal text-[14px] text-[#0D0F0C] placeholder:text-[#8F9B8D] outline-none focus:border-[#CDD1CB] transition-colors bg-[#FFFFFF]";

  return (
    <div className="w-full max-w-[360px] mx-auto font-sans">
      {(status === "idle" || status === "loading1" || status === "error") && (
        <form onSubmit={handleEmailSubmit} className="flex flex-col w-full gap-[12px]">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading1"}
            required
            className={inputClass}
          />
          <button
            type="submit"
            disabled={status === "loading1" || !email}
            className="w-full h-[44px] px-[20px] bg-[#E8593C] text-white rounded-[8px] font-sans font-semibold text-[14px] hover:bg-[#D44A2D] transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {status === "loading1" ? (
              <><Loader2 className="w-[16px] h-[16px] animate-spin mr-2" /> Joining...</>
            ) : "Join waitlist"}
          </button>
        </form>
      )}

      {(status === "step2" || status === "loading2") && (
        <form onSubmit={handleDetailsSubmit} className="flex flex-col w-full gap-[12px]">
          <div className="text-left mb-2">
            <p className={`font-sans text-[14px] font-medium mb-1 ${theme === "light" ? "text-[#241B14]" : "text-white"}`}>You&apos;re on the Auren Premium waitlist ✦</p>
            <p className={`font-sans text-[13px] ${theme === "light" ? "text-[rgba(36,27,20,0.6)]" : "text-[rgba(255,255,255,0.7)]"}`}>Help us tailor Auren for you (optional):</p>
          </div>
          <select
            value={useCase}
            onChange={(e) => setUseCase(e.target.value)}
            disabled={status === "loading2"}
            className={inputClass}
            style={{ 
              appearance: "none", 
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23241B14' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 16px center",
              backgroundSize: "16px",
              paddingRight: "40px"
            }}
          >
            <option value="" disabled>What will you use Auren for?</option>
            <option value="Email management">Email management</option>
            <option value="Scheduling">Scheduling</option>
            <option value="Dev workflow (GitHub)">Dev workflow (GitHub)</option>
            <option value="All of the above">All of the above</option>
          </select>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            disabled={status === "loading2"}
            className={inputClass}
            style={{ 
              appearance: "none", 
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23241B14' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 16px center",
              backgroundSize: "16px",
              paddingRight: "40px"
            }}
          >
            <option value="" disabled>How did you hear about Auren?</option>
            <option value="Twitter/X">Twitter/X</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Friend/colleague">Friend/colleague</option>
            <option value="Other">Other</option>
          </select>
          <div className="flex gap-[8px] mt-[4px]">
            <button
              type="button"
              onClick={handleSkip}
              disabled={status === "loading2"}
              className={`flex-1 h-[44px] px-[20px] rounded-[8px] font-sans font-semibold text-[14px] transition-colors disabled:opacity-50 flex items-center justify-center ${theme === "light" ? "bg-[rgba(36,27,20,0.05)] text-[#241B14] hover:bg-[rgba(36,27,20,0.1)]" : "bg-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.15)]"}`}
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={status === "loading2" || (!useCase && !source)}
              className="flex-1 h-[44px] px-[20px] bg-[#E8593C] text-white rounded-[8px] font-sans font-semibold text-[14px] hover:bg-[#D44A2D] transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {status === "loading2" ? (
                <><Loader2 className="w-[16px] h-[16px] animate-spin mr-2" /> Saving...</>
              ) : "Save"}
            </button>
          </div>
        </form>
      )}

      {status === "error" && (
        <p className="font-normal text-[12px] text-[#DC2626] mt-[12px] text-center">{message}</p>
      )}
    </div>
  );
}
