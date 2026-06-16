"use client";

import React, { useState } from "react";
import { Settings, User, Bell, Shield, GitBranch, Calendar, Mail, Key } from "lucide-react";

export function SettingsView() {
  const [activeTab, setActiveTab] = useState("integrations");

  return (
    <div className="flex-1 flex bg-[#FAF8F5] overflow-hidden">
      {/* Settings Sidebar */}
      <div className="w-[260px] bg-white border-r border-[rgba(36,27,20,0.08)] p-6 shrink-0 flex flex-col gap-8">
        <div>
          <h2 className="font-sans font-bold text-[18px] text-[#241B14] tracking-tight mb-4">Settings</h2>
          <div className="flex flex-col gap-1">
            <button 
              onClick={() => setActiveTab("general")}
              className={`flex items-center gap-3 px-3 py-2 rounded-[8px] font-sans font-semibold text-[13px] transition-colors ${activeTab === "general" ? "bg-[rgba(232,89,60,0.08)] text-[#E8593C]" : "text-[rgba(36,27,20,0.6)] hover:bg-[rgba(36,27,20,0.04)] hover:text-[#241B14]"}`}
            >
              <Settings size={16} />
              General
            </button>
            <button 
              onClick={() => setActiveTab("integrations")}
              className={`flex items-center gap-3 px-3 py-2 rounded-[8px] font-sans font-semibold text-[13px] transition-colors ${activeTab === "integrations" ? "bg-[rgba(232,89,60,0.08)] text-[#E8593C]" : "text-[rgba(36,27,20,0.6)] hover:bg-[rgba(36,27,20,0.04)] hover:text-[#241B14]"}`}
            >
              <Shield size={16} />
              Integrations
            </button>
            <button 
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-3 px-3 py-2 rounded-[8px] font-sans font-semibold text-[13px] transition-colors ${activeTab === "notifications" ? "bg-[rgba(232,89,60,0.08)] text-[#E8593C]" : "text-[rgba(36,27,20,0.6)] hover:bg-[rgba(36,27,20,0.04)] hover:text-[#241B14]"}`}
            >
              <Bell size={16} />
              Notifications
            </button>
            <button 
              onClick={() => setActiveTab("account")}
              className={`flex items-center gap-3 px-3 py-2 rounded-[8px] font-sans font-semibold text-[13px] transition-colors ${activeTab === "account" ? "bg-[rgba(232,89,60,0.08)] text-[#E8593C]" : "text-[rgba(36,27,20,0.6)] hover:bg-[rgba(36,27,20,0.04)] hover:text-[#241B14]"}`}
            >
              <User size={16} />
              Account
            </button>
          </div>
        </div>
      </div>

      {/* Main Settings Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-[800px]">
          {activeTab === "integrations" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              <div>
                <h1 className="font-sans font-bold text-[24px] text-[#241B14] mb-2 tracking-tight">Integrations</h1>
                <p className="font-sans text-[14px] text-[rgba(36,27,20,0.6)]">Manage your connected apps and agent permissions.</p>
              </div>

              {/* Integration Card: Gmail */}
              <div className="bg-white rounded-[16px] border border-[rgba(36,27,20,0.08)] shadow-[0_4px_24px_rgba(36,27,20,0.02)] p-6 flex flex-col gap-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[12px] bg-[rgba(234,67,53,0.1)] flex items-center justify-center text-[#EA4335]">
                      <Mail size={24} />
                    </div>
                    <div>
                      <h3 className="font-sans font-bold text-[16px] text-[#241B14]">Gmail Webhook</h3>
                      <p className="font-sans text-[13px] text-[rgba(36,27,20,0.5)] mt-1">Status: Active &middot; Linked to tryauren@gmail.com</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-[#E1F5EE] border border-[#0F6E56] text-[#085041] rounded-full font-sans font-bold text-[11px] uppercase tracking-wider">
                    Connected
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-[rgba(36,27,20,0.04)]">
                  <button className="px-4 py-2 bg-[rgba(36,27,20,0.04)] rounded-[8px] font-sans font-semibold text-[13px] text-[#241B14] hover:bg-[rgba(36,27,20,0.08)] transition-colors">
                    Re-authenticate
                  </button>
                  <button className="px-4 py-2 border border-[rgba(234,67,53,0.3)] text-[#EA4335] rounded-[8px] font-sans font-semibold text-[13px] hover:bg-[rgba(234,67,53,0.04)] transition-colors">
                    Disconnect
                  </button>
                </div>
              </div>

              {/* Integration Card: GitHub */}
              <div className="bg-white rounded-[16px] border border-[rgba(36,27,20,0.08)] shadow-[0_4px_24px_rgba(36,27,20,0.02)] p-6 flex flex-col gap-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[12px] bg-[rgba(36,27,20,0.06)] flex items-center justify-center text-[#241B14]">
                      <GitBranch size={24} />
                    </div>
                    <div>
                      <h3 className="font-sans font-bold text-[16px] text-[#241B14]">GitHub Issues</h3>
                      <p className="font-sans text-[13px] text-[rgba(36,27,20,0.5)] mt-1">Status: Active &middot; Linked to pranavgawaii</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-[#E1F5EE] border border-[#0F6E56] text-[#085041] rounded-full font-sans font-bold text-[11px] uppercase tracking-wider">
                    Connected
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-[rgba(36,27,20,0.04)]">
                  <button className="px-4 py-2 bg-[rgba(36,27,20,0.04)] rounded-[8px] font-sans font-semibold text-[13px] text-[#241B14] hover:bg-[rgba(36,27,20,0.08)] transition-colors">
                    Configure Repositories
                  </button>
                </div>
              </div>

              {/* Integration Card: Google Calendar */}
              <div className="bg-white rounded-[16px] border border-[rgba(36,27,20,0.08)] shadow-[0_4px_24px_rgba(36,27,20,0.02)] p-6 flex flex-col gap-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[12px] bg-[rgba(66,133,244,0.1)] flex items-center justify-center text-[#4285F4]">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h3 className="font-sans font-bold text-[16px] text-[#241B14]">Google Calendar</h3>
                      <p className="font-sans text-[13px] text-[rgba(36,27,20,0.5)] mt-1">Status: Read/Write Access</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-[#E1F5EE] border border-[#0F6E56] text-[#085041] rounded-full font-sans font-bold text-[11px] uppercase tracking-wider">
                    Connected
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-[rgba(36,27,20,0.04)]">
                  <button className="px-4 py-2 bg-[rgba(36,27,20,0.04)] rounded-[8px] font-sans font-semibold text-[13px] text-[#241B14] hover:bg-[rgba(36,27,20,0.08)] transition-colors">
                    Select Default Calendar
                  </button>
                </div>
              </div>

            </div>
          )}

          {activeTab !== "integrations" && (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-[rgba(36,27,20,0.04)] flex items-center justify-center text-[rgba(36,27,20,0.3)] mb-4">
                <Settings size={32} />
              </div>
              <h2 className="font-sans font-bold text-[20px] text-[#241B14] mb-2 tracking-tight capitalize">{activeTab} Settings</h2>
              <p className="font-sans text-[14px] text-[rgba(36,27,20,0.5)] max-w-[400px]">
                This section is under construction. It will contain preferences for {activeTab} in a future update.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
