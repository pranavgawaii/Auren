import React from "react"
import { motion } from "framer-motion"
import { Calendar, Mail, GitBranch, AlertCircle, GitPullRequest } from "lucide-react"
import type { DailyBriefingData } from "@/types"

export function BriefingCard({ data, onClose }: { data: DailyBriefingData, onClose?: () => void }) {
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  }

  const formatRepoName = (urlOrName: string) => {
    if (urlOrName.includes('github.com/')) {
      const parts = urlOrName.split('github.com/');
      return parts[1] || urlOrName;
    }
    return urlOrName;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="bg-white border border-[rgba(36,27,20,0.03)] rounded-3xl p-10 shadow-[0_12px_40px_rgb(0,0,0,0.06)] max-w-[850px] w-full flex flex-col gap-10 font-sans relative"
    >
      {onClose && (
        <button onClick={onClose} className="absolute top-6 right-6 text-[rgba(36,27,20,0.4)] hover:text-[#241B14] transition-colors p-2 rounded-full hover:bg-[rgba(36,27,20,0.03)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      )}

      {/* Ultra-Premium Header */}
      <div className="flex gap-5 border-b border-[rgba(36,27,20,0.04)] pb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FAF8F5] to-white border border-[rgba(36,27,20,0.05)] flex items-center justify-center shrink-0 shadow-sm mt-1">
          <span className="text-[24px]">🌅</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <h3 className="text-[#241B14] font-semibold text-[18px]">Morning Briefing</h3>
          <p className="text-[rgba(36,27,20,0.65)] text-[15px] leading-relaxed max-w-[650px]">{data.summaryText}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12">
        {/* Left Column: Schedule (Vertical Timeline) */}
        <div className="flex flex-col gap-6">
          {data.schedule && data.schedule.length > 0 && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2 text-[rgba(36,27,20,0.5)] font-semibold text-[11px] uppercase tracking-widest pl-1">
                <Calendar size={14} />
                <span>Today's Schedule</span>
              </div>
              
              <div className="relative pl-[26px]">
                {/* Vertical Line */}
                <div className="absolute top-3 bottom-3 left-[9px] w-[1px] bg-gradient-to-b from-[rgba(36,27,20,0.15)] via-[rgba(36,27,20,0.1)] to-transparent border-dashed" />
                
                <div className="flex flex-col gap-5">
                  {data.schedule.map((item, i) => (
                    <div key={i} className="relative flex flex-col group cursor-default">
                      {/* Timeline Dot */}
                      <div className={`absolute -left-[26px] top-1.5 w-[11px] h-[11px] rounded-full border-2 border-white ring-1 ring-[rgba(36,27,20,0.1)] transition-colors ${item.type === 'meeting' ? 'bg-blue-400' : 'bg-emerald-400'}`} />
                      
                      <div className="flex items-start gap-4">
                        <span className="text-[rgba(36,27,20,0.55)] font-medium text-[12.5px] min-w-[65px] shrink-0 mt-0.5">{formatTime(item.time)}</span>
                        <span className="text-[#241B14] text-[14px] leading-snug group-hover:text-[#E8593C] transition-colors">{item.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Inbox & GitHub */}
        <div className="flex flex-col gap-8">
          {/* Inbox Triage */}
          {data.emails && data.emails.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-[rgba(36,27,20,0.5)] font-semibold text-[11px] uppercase tracking-widest pl-2">
                <Mail size={14} />
                <span>Inbox Triage</span>
              </div>
              <div className="flex flex-col">
                {data.emails.map((email, i) => (
                  <div key={i} className="flex flex-col px-3 py-2.5 rounded-xl hover:bg-[#FAF8F5] transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[#241B14] font-medium text-[13.5px] group-hover:text-[#E8593C] transition-colors">{email.sender}</span>
                      {email.isUrgent && <span className="bg-[#E8593C]/10 text-[#E8593C] text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">URGENT</span>}
                    </div>
                    <span className="text-[rgba(36,27,20,0.6)] text-[13px] truncate">{email.subject}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GitHub Status */}
          {data.github && data.github.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-[rgba(36,27,20,0.5)] font-semibold text-[11px] uppercase tracking-widest pl-2">
                <GitBranch size={14} />
                <span>GitHub Action Items</span>
              </div>
              <div className="flex flex-col gap-2">
                {data.github.map((repo, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#FAF8F5] transition-colors cursor-pointer group">
                    <span className="text-[#241B14] font-medium text-[13.5px] truncate max-w-[160px] group-hover:text-[#E8593C] transition-colors" title={repo.repo}>
                      {formatRepoName(repo.repo)}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1.5 bg-[#FAF8F5] group-hover:bg-white border border-[rgba(36,27,20,0.04)] px-2 py-1 rounded-lg text-[rgba(36,27,20,0.65)] text-[12px] transition-colors" title="PRs to review">
                        <GitPullRequest size={12} />
                        <span className="font-medium">{repo.prsToReview}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-[#FAF8F5] group-hover:bg-white border border-[rgba(36,27,20,0.04)] px-2 py-1 rounded-lg text-[rgba(36,27,20,0.65)] text-[12px] transition-colors" title="Issues assigned">
                        <AlertCircle size={12} />
                        <span className="font-medium">{repo.issuesAssigned}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
