"use client";

import React, { useState, useEffect } from "react";
import { GitPullRequest, CircleDot, MessageSquare, ExternalLink, BookOpen, Lock } from "lucide-react";
import { checkConnectionStatus } from "@/app/actions/connect";
import { useRouter } from "next/navigation";

export function GitHubIntegrationView() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [pullRequests, setPullRequests] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGithubData() {
      setIsLoading(true);
      setError(null);
      try {
        const status = await checkConnectionStatus();
        setIsConnected(status.github);
        
        if (!status.github) {
          setIsLoading(false);
          return;
        }

        const [prRes, issueRes] = await Promise.all([
          fetch("https://api.github.com/search/issues?q=is:pr+is:open+author:8teen"),
          fetch("https://api.github.com/search/issues?q=is:issue+is:open+assignee:8teen")
        ]);

        if (!prRes.ok || !issueRes.ok) throw new Error("Failed to fetch data from GitHub. Rate limit may have been exceeded.");

        const prData = await prRes.json();
        const issueData = await issueRes.json();

        setPullRequests(prData.items || []);
        setIssues(issueData.items || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchGithubData();
  }, []);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  // Dynamically extract unique repositories from issues and PRs
  const dynamicRepos = React.useMemo(() => {
    const repoMap = new Map<string, { id: string, name: string, isPrivate: boolean, active: boolean }>();
    const allItems = [...pullRequests, ...issues];
    
    allItems.forEach((item) => {
      const repoUrl = item.repository_url;
      if (!repoUrl) return;
      
      const name = repoUrl.split('/').slice(-2).join('/');
      if (!repoMap.has(name)) {
        repoMap.set(name, {
          id: name,
          name,
          isPrivate: false, // Default to public without auth context
          active: true,
        });
      }
    });
    
    return Array.from(repoMap.values());
  }, [pullRequests, issues]);

  if (isConnected === false && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#FAF8F5] dark:bg-[#2C2C2C] p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#383838] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] flex items-center justify-center mb-6 shadow-sm">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#241B14] dark:text-[#F4F4F5]"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
        </div>
        <h2 className="text-[20px] font-bold text-[#241B14] dark:text-[#F4F4F5] mb-2 font-sans tracking-tight">Connect your GitHub</h2>
        <p className="text-[14px] text-[rgba(36,27,20,0.6)] dark:text-[rgba(255,255,255,0.6)] max-w-[320px] mb-8 leading-relaxed">
          Connect your GitHub account in Settings to view your pull requests, manage issues, and take action seamlessly with Auren.
        </p>
        <button 
          onClick={() => {
            localStorage.setItem("auren_default_settings_tab", "integrations");
            router.push("/settings");
          }}
          className="h-[40px] px-6 bg-[#E8593C] text-white rounded-[10px] font-sans font-bold text-[13px] hover:bg-[#D14F31] transition-colors shadow-sm"
        >
          Go to Settings
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#FAF8F5] dark:bg-[#2C2C2C] overflow-y-auto">
      {/* Header */}
        <div className="h-[80px] bg-white dark:bg-[#383838] border-b border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.04)] flex items-center justify-center border border-[rgba(36,27,20,0.06)] dark:border-[rgba(255,255,255,0.06)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-[#241B14] dark:text-[#F4F4F5]"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            </div>
            <div>
              <h1 className="text-[24px] text-[#241B14] dark:text-[#F4F4F5] leading-none mb-1" style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>GitHub</h1>
              <p className="font-sans text-[13px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]">8teen • Connected</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="h-[36px] px-4 bg-white dark:bg-[#383838] border border-[rgba(36,27,20,0.12)] dark:border-[rgba(255,255,255,0.12)] text-[#241B14] dark:text-[#F4F4F5] rounded-[8px] font-sans font-medium text-[13px] flex items-center gap-2 hover:bg-[#FAF8F5] dark:bg-[#2C2C2C] shadow-sm transition-colors">
              Sync Now
            </button>
          </div>
        </div>

      <div className="flex-1 p-8 max-w-[1000px] w-full mx-auto flex flex-col gap-8">
        
        {/* Repositories Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans font-semibold text-[15px] text-[#241B14] dark:text-[#F4F4F5] flex items-center gap-2">
              <BookOpen size={16} className="text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]" />
              Your Repositories
            </h2>
            <span className="font-sans text-[12px] font-medium text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.04)] px-2 py-0.5 rounded-full">
              {dynamicRepos.length} Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <div className="col-span-full p-8 flex justify-center"><div className="w-6 h-6 border-2 border-[rgba(36,27,20,0.1)] dark:border-[rgba(255,255,255,0.1)] border-t-[#241B14] rounded-full animate-spin" /></div>
            ) : dynamicRepos.length === 0 ? (
              <div className="col-span-full p-8 text-center text-[13px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[12px]">No repositories found.</div>
            ) : dynamicRepos.map((repo) => (
              <a 
                href={`https://github.com/${repo.name}`}
                target="_blank"
                rel="noopener noreferrer"
                key={repo.id} 
                className="bg-white dark:bg-[#383838] p-4 rounded-[12px] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-[0_2px_12px_rgba(36,27,20,0.02)] hover:border-[#E8593C]/30 hover:shadow-md transition-all group cursor-pointer flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-[8px] bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.04)] flex items-center justify-center text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] group-hover:text-[#E8593C] group-hover:bg-[#E8593C]/10 transition-colors">
                  <BookOpen size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-sans font-semibold text-[14px] text-[#241B14] dark:text-[#F4F4F5] truncate mb-0.5 group-hover:text-[#E8593C] transition-colors">{repo.name}</h3>
                  <div className="flex items-center gap-1.5 font-sans text-[11.5px] text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]">
                    {repo.isPrivate ? <Lock size={10} /> : <BookOpen size={10} />}
                    <span>{repo.isPrivate ? "Private" : "Public"}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Pull Requests Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans font-semibold text-[15px] text-[#241B14] dark:text-[#F4F4F5] flex items-center gap-2">
              <GitPullRequest size={16} className="text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]" />
              Review Requests
            </h2>
            <span className="font-sans text-[12px] font-medium text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.04)] px-2 py-0.5 rounded-full">
              {pullRequests.length} Open
            </span>
          </div>

          <div className="bg-white dark:bg-[#383838] rounded-[12px] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-[0_2px_12px_rgba(36,27,20,0.02)] overflow-hidden">
            {isLoading ? (
              <div className="p-8 flex justify-center"><div className="w-6 h-6 border-2 border-[rgba(36,27,20,0.1)] dark:border-[rgba(255,255,255,0.1)] border-t-[#241B14] rounded-full animate-spin" /></div>
            ) : error ? (
              <div className="p-8 text-center text-[13px] text-[#E8593C]">{error}</div>
            ) : pullRequests.length === 0 ? (
              <div className="p-8 text-center text-[13px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]">No open pull requests found.</div>
            ) : pullRequests.map((pr, i) => (
              <div key={pr.id} className={`p-4 flex flex-col gap-3 hover:bg-[#FAF8F5] dark:hover:bg-[#2C2C2C] transition-colors ${i !== pullRequests.length - 1 ? 'border-b border-[rgba(36,27,20,0.04)] dark:border-[rgba(255,255,255,0.04)]' : ''}`}>
                <div className="flex items-start gap-4 group">
                  <div className="mt-1">
                    <GitPullRequest size={18} className="text-[#0F6E56]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <a href={pr.html_url} target="_blank" rel="noopener noreferrer" className="font-sans font-medium text-[14px] text-[#241B14] dark:text-[#F4F4F5] truncate hover:text-[#E8593C] transition-colors">{pr.title}</a>
                      <span className="shrink-0 font-sans text-[12px] text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]">{timeAgo(pr.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-3 font-sans text-[13px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]">
                      <span className="font-medium">{pr.repository_url.split('/').slice(-2).join('/')}</span>
                      <span className="w-1 h-1 rounded-full bg-[rgba(36,27,20,0.15)]" />
                      <span>#{pr.number} opened by {pr.user.login}</span>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <a href={pr.html_url} target="_blank" rel="noopener noreferrer" className="text-[rgba(36,27,20,0.3)] dark:text-[rgba(255,255,255,0.3)] hover:text-[rgba(36,27,20,0.6)] dark:hover:text-[rgba(255,255,255,0.6)]">
                      <ExternalLink size={14} />
                    </a>
                    <div className="flex items-center gap-1 font-sans text-[12px] text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]">
                      <MessageSquare size={12} />
                      <span>{pr.comments}</span>
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions Row */}
                <div className="flex items-center gap-2 pl-9 mt-1">
                  <button 
                    onClick={() => {
                      const event = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true });
                      document.dispatchEvent(event);
                      setTimeout(() => {
                        const input = document.querySelector('input[placeholder="Type a command..."]') as HTMLInputElement;
                        if (input) {
                          input.value = `Approve PR #${pr.number} in ${pr.repository_url.split('/').slice(-2).join('/')} with comment "LGTM!"`;
                          input.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                      }, 100);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[#383838] hover:border-[#E8593C]/30 hover:bg-[#E8593C]/5 text-[11.5px] font-sans font-medium text-[rgba(36,27,20,0.7)] dark:text-[rgba(255,255,255,0.7)] hover:text-[#E8593C] transition-all shadow-[0_1px_2px_rgba(36,27,20,0.02)]"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    Approve PR
                  </button>
                  <button 
                    onClick={() => {
                      const event = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true });
                      document.dispatchEvent(event);
                      setTimeout(() => {
                        const input = document.querySelector('input[placeholder="Type a command..."]') as HTMLInputElement;
                        if (input) {
                          input.value = `Draft a review comment for PR #${pr.number} in ${pr.repository_url.split('/').slice(-2).join('/')} saying...`;
                          input.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                      }, 100);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[#383838] hover:border-[#E8593C]/30 hover:bg-[#E8593C]/5 text-[11.5px] font-sans font-medium text-[rgba(36,27,20,0.7)] dark:text-[rgba(255,255,255,0.7)] hover:text-[#E8593C] transition-all shadow-[0_1px_2px_rgba(36,27,20,0.02)]"
                  >
                    <MessageSquare size={11} className="mt-[1px]" />
                    Draft Comment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Assigned Issues Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans font-semibold text-[15px] text-[#241B14] dark:text-[#F4F4F5] flex items-center gap-2">
              <CircleDot size={16} className="text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]" />
              Assigned Issues
            </h2>
            <span className="font-sans text-[12px] font-medium text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.04)] px-2 py-0.5 rounded-full">
              {issues.length} Open
            </span>
          </div>

          <div className="bg-white dark:bg-[#383838] rounded-[12px] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-[0_2px_12px_rgba(36,27,20,0.02)] overflow-hidden">
            {isLoading ? (
              <div className="p-8 flex justify-center"><div className="w-6 h-6 border-2 border-[rgba(36,27,20,0.1)] dark:border-[rgba(255,255,255,0.1)] border-t-[#241B14] rounded-full animate-spin" /></div>
            ) : error ? (
              <div className="p-8 text-center text-[13px] text-[#E8593C]">{error}</div>
            ) : issues.length === 0 ? (
              <div className="p-8 text-center text-[13px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]">No open issues found.</div>
            ) : issues.map((issue, i) => (
              <div key={issue.id} className={`p-4 flex flex-col gap-3 hover:bg-[#FAF8F5] dark:hover:bg-[#2C2C2C] transition-colors ${i !== issues.length - 1 ? 'border-b border-[rgba(36,27,20,0.04)] dark:border-[rgba(255,255,255,0.04)]' : ''}`}>
                <div className="flex items-start gap-4 group">
                  <div className="mt-1">
                    <CircleDot size={18} className="text-[#E8593C]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <a href={issue.html_url} target="_blank" rel="noopener noreferrer" className="font-sans font-medium text-[14px] text-[#241B14] dark:text-[#F4F4F5] truncate hover:text-[#E8593C] transition-colors">{issue.title}</a>
                      <span className="shrink-0 font-sans text-[12px] text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]">{timeAgo(issue.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-3 font-sans text-[13px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]">
                      <span className="font-medium">{issue.repository_url.split('/').slice(-2).join('/')}</span>
                      <span className="w-1 h-1 rounded-full bg-[rgba(36,27,20,0.15)]" />
                      <span>#{issue.number}</span>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <a href={issue.html_url} target="_blank" rel="noopener noreferrer" className="text-[rgba(36,27,20,0.3)] dark:text-[rgba(255,255,255,0.3)] hover:text-[rgba(36,27,20,0.6)] dark:hover:text-[rgba(255,255,255,0.6)]">
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>

                {/* Quick Actions Row */}
                <div className="flex items-center gap-2 pl-9 mt-1">
                  <button 
                    onClick={() => {
                      const event = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true });
                      document.dispatchEvent(event);
                      setTimeout(() => {
                        const input = document.querySelector('input[placeholder="Type a command..."]') as HTMLInputElement;
                        if (input) {
                          input.value = `Close issue #${issue.number} in ${issue.repository_url.split('/').slice(-2).join('/')} as completed`;
                          input.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                      }, 100);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[#383838] hover:border-[#E8593C]/30 hover:bg-[#E8593C]/5 text-[11.5px] font-sans font-medium text-[rgba(36,27,20,0.7)] dark:text-[rgba(255,255,255,0.7)] hover:text-[#E8593C] transition-all shadow-[0_1px_2px_rgba(36,27,20,0.02)]"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    Close Issue
                  </button>
                  <button 
                    onClick={() => {
                      const event = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true });
                      document.dispatchEvent(event);
                      setTimeout(() => {
                        const input = document.querySelector('input[placeholder="Type a command..."]') as HTMLInputElement;
                        if (input) {
                          input.value = `Assign issue #${issue.number} in ${issue.repository_url.split('/').slice(-2).join('/')} to me`;
                          input.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                      }, 100);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[#383838] hover:border-[#E8593C]/30 hover:bg-[#E8593C]/5 text-[11.5px] font-sans font-medium text-[rgba(36,27,20,0.7)] dark:text-[rgba(255,255,255,0.7)] hover:text-[#E8593C] transition-all shadow-[0_1px_2px_rgba(36,27,20,0.02)]"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                    Assign to Me
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
