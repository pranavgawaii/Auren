"use client";

import React, { useState, useEffect, useTransition } from "react";
import { getTeamContacts, addTeamContact, deleteTeamContact, type TeamContact } from "@/app/actions/team";
import { showToast } from "@/components/ui/premium-toast";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Search, Trash2, Mail, Briefcase, AtSign, Sparkles, Copy, Check, Users, ShieldCheck } from "lucide-react";

function getInitials(name: string) {
  if (!name) return "??";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

const AVATAR_PALETTES = [
  { bg: "#E8593C", lightBg: "rgba(232, 89, 60, 0.12)", text: "#E8593C" },
  { bg: "#8B5CF6", lightBg: "rgba(139, 92, 246, 0.12)", text: "#8B5CF6" },
  { bg: "#0284C7", lightBg: "rgba(2, 132, 199, 0.12)", text: "#0284C7" },
  { bg: "#16A34A", lightBg: "rgba(22, 163, 74, 0.12)", text: "#16A34A" },
  { bg: "#D97706", lightBg: "rgba(217, 119, 6, 0.12)", text: "#D97706" },
  { bg: "#EC4899", lightBg: "rgba(236, 72, 153, 0.12)", text: "#EC4899" },
];

function getAvatarPalette(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
}

export function TeamView() {
  const [contacts, setContacts] = useState<TeamContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedContact, setSelectedContact] = useState<TeamContact | null>(null);
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", email: "", role: "" });
  const [formError, setFormError] = useState("");

  const load = async () => {
    setIsLoading(true);
    const res = await getTeamContacts();
    if (res.success) {
      const data = res.data || [];
      setContacts(data);
      if (data.length > 0 && !selectedContact) {
        setSelectedContact(data[0]);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    startTransition(async () => {
      const res = await addTeamContact(form.name, form.email, form.role);
      if (res.success) {
        showToast.success(`${form.name} added to your team!`);
        setForm({ name: "", email: "", role: "" });
        setShowAddForm(false);
        load();
      } else {
        setFormError(res.error || "Failed to add contact");
      }
    });
  };

  const handleDelete = async (contact: TeamContact, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    startTransition(async () => {
      const res = await deleteTeamContact(contact.id);
      if (res.success) {
        showToast.success(`${contact.name} removed`);
        if (selectedContact?.id === contact.id) {
          setSelectedContact(null);
        }
        load();
      } else {
        showToast.error("Failed to remove contact");
      }
    });
  };

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    showToast.success(`Copied "${text}"`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.role || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex w-full h-full min-h-0 bg-white dark:bg-[#383838] overflow-hidden flex-1 relative">
      {/* LEFT COLUMN: Contact Directory & Management (380px) */}
      <div className="w-full md:w-[380px] shrink-0 border-r border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] flex flex-col h-full bg-[#FAF8F5]/50 dark:bg-[#2C2C2C]/50">
        
        {/* Directory Header */}
        <div className="p-5 border-b border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] shrink-0 bg-white dark:bg-[#383838]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[8px] bg-[#E8593C]/10 text-[#E8593C] flex items-center justify-center font-bold">
                <Users size={18} />
              </div>
              <div>
                <h1 className="text-[16px] font-semibold text-[#241B14] dark:text-[#F4F4F5] tracking-tight leading-none">
                  Team Directory
                </h1>
                <span className="text-[11px] text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)] font-medium">
                  {contacts.length} {contacts.length === 1 ? "member" : "members"}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => { setShowAddForm(!showAddForm); setFormError(""); }}
              className="flex items-center gap-1.5 h-8 px-3 bg-[#E8593C] hover:bg-[#D4472B] text-white rounded-[8px] text-[12px] font-semibold transition-all shadow-sm active:scale-95"
            >
              <UserPlus size={14} />
              <span>Add</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(36,27,20,0.35)] dark:text-[rgba(255,255,255,0.35)]" size={14} />
            <input
              type="text"
              placeholder="Search team by name, email, role..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 bg-[#FAF8F5] dark:bg-[#2C2C2C] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[8px] text-[12px] text-[#241B14] dark:text-[#F4F4F5] placeholder:text-[rgba(36,27,20,0.35)] dark:placeholder:text-[rgba(255,255,255,0.35)] outline-none focus:border-[#E8593C]/50 transition-colors"
            />
          </div>
        </div>

        {/* Add Person Inline Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[#383838] overflow-hidden"
            >
              <form onSubmit={handleAdd} className="p-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#E8593C] uppercase tracking-wider">New Team Contact</span>
                  <button 
                    type="button" 
                    onClick={() => setShowAddForm(false)} 
                    className="text-[11px] text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] hover:text-[#241B14] dark:hover:text-[#F4F4F5]"
                  >
                    Close
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  className="h-8 px-3 bg-[#FAF8F5] dark:bg-[#2C2C2C] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[6px] text-[12px] text-[#241B14] dark:text-[#F4F4F5] placeholder:text-[rgba(36,27,20,0.35)] dark:placeholder:text-[rgba(255,255,255,0.35)] outline-none focus:border-[#E8593C]/50"
                />
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  className="h-8 px-3 bg-[#FAF8F5] dark:bg-[#2C2C2C] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[6px] text-[12px] text-[#241B14] dark:text-[#F4F4F5] placeholder:text-[rgba(36,27,20,0.35)] dark:placeholder:text-[rgba(255,255,255,0.35)] outline-none focus:border-[#E8593C]/50"
                />
                <input
                  type="text"
                  placeholder="Role (e.g. Founder, Developer)"
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className="h-8 px-3 bg-[#FAF8F5] dark:bg-[#2C2C2C] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[6px] text-[12px] text-[#241B14] dark:text-[#F4F4F5] placeholder:text-[rgba(36,27,20,0.35)] dark:placeholder:text-[rgba(255,255,255,0.35)] outline-none focus:border-[#E8593C]/50"
                />
                {formError && <p className="text-[11px] text-red-500 font-medium">{formError}</p>}
                <button
                  type="submit"
                  disabled={isPending}
                  className="h-8 mt-1 bg-[#E8593C] hover:bg-[#D4472B] disabled:opacity-50 text-white rounded-[6px] text-[12px] font-semibold transition-colors shadow-sm"
                >
                  {isPending ? "Adding..." : "Save Contact"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contacts Scroll Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 bg-white dark:bg-[#383838] rounded-[10px] animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 rounded-full bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.06)] flex items-center justify-center text-[rgba(36,27,20,0.3)] dark:text-[rgba(255,255,255,0.3)] mb-3">
                <Users size={22} />
              </div>
              <p className="text-[13px] font-semibold text-[#241B14] dark:text-[#F4F4F5] mb-1">
                {searchQuery ? "No matching contacts" : "No team members yet"}
              </p>
              <p className="text-[11px] text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] max-w-[200px] leading-relaxed">
                {searchQuery ? "Try searching another name" : "Add contacts to use @mentions in AI commands"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-3 text-[12px] font-semibold text-[#E8593C] hover:underline flex items-center gap-1"
                >
                  <UserPlus size={13} /> Add first person
                </button>
              )}
            </div>
          ) : (
            filtered.map(contact => {
              const palette = getAvatarPalette(contact.name);
              const isSelected = selectedContact?.id === contact.id;

              return (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`group relative flex items-center gap-3 p-2.5 rounded-[10px] cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-white dark:bg-[#383838] border-[#E8593C]/40 shadow-sm"
                      : "bg-transparent border-transparent hover:bg-white/60 dark:hover:bg-[#383838]/60"
                  }`}
                >
                  {/* Avatar Circle */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[12px] shrink-0 border"
                    style={{
                      backgroundColor: palette.lightBg,
                      borderColor: palette.bg + "30",
                      color: palette.text,
                    }}
                  >
                    {getInitials(contact.name)}
                  </div>

                  {/* Contact Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12.5px] font-semibold text-[#241B14] dark:text-[#F4F4F5] truncate">
                        {contact.name}
                      </span>
                      {contact.role && (
                        <span className="px-1.5 py-[0.5px] rounded bg-[rgba(36,27,20,0.06)] dark:bg-[rgba(255,255,255,0.08)] text-[9.5px] font-medium text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] truncate">
                          {contact.role}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)] truncate block">
                      {contact.email}
                    </span>
                  </div>

                  {/* Delete Hover Action */}
                  <button
                    onClick={e => handleDelete(contact, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-[6px] hover:bg-red-50 dark:hover:bg-red-950/30 text-[rgba(36,27,20,0.3)] hover:text-red-500 transition-all shrink-0"
                    title="Delete contact"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Contact Workspace Preview & AI @Mention Guide (flex-1) */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#383838] overflow-y-auto p-6 md:p-10">
        {selectedContact ? (
          <div className="max-w-[640px] w-full mx-auto space-y-8">
            {/* Contact Header Card */}
            <div className="p-6 rounded-[16px] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FAF8F5] dark:bg-[#2C2C2C] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4">
                {(() => {
                  const palette = getAvatarPalette(selectedContact.name);
                  return (
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-[18px] shrink-0 border-2"
                      style={{
                        backgroundColor: palette.lightBg,
                        borderColor: palette.bg + "40",
                        color: palette.text,
                      }}
                    >
                      {getInitials(selectedContact.name)}
                    </div>
                  );
                })()}
                <div>
                  <h2 className="text-[20px] font-bold text-[#241B14] dark:text-[#F4F4F5] tracking-tight">
                    {selectedContact.name}
                  </h2>
                  <p className="text-[13px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] flex items-center gap-2 mt-0.5">
                    <Mail size={13} className="shrink-0" />
                    <span>{selectedContact.email}</span>
                  </p>
                </div>
              </div>

              {selectedContact.role && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8593C]/10 text-[#E8593C] text-[12px] font-semibold self-start md:self-auto">
                  <Briefcase size={12} />
                  <span>{selectedContact.role}</span>
                </div>
              )}
            </div>

            {/* Quick Mention Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* @Mention Tag Card */}
              <div className="p-5 rounded-[14px] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[#2C2C2C] flex flex-col justify-between gap-3 shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] uppercase tracking-wider flex items-center gap-1">
                      <AtSign size={12} className="text-[#E8593C]" /> AI @Mention Tag
                    </span>
                    <button
                      onClick={() => copyToClipboard(`@${selectedContact.name}`, "tag")}
                      className="p-1 rounded text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] hover:text-[#E8593C] transition-colors"
                      title="Copy @tag"
                    >
                      {copiedField === "tag" ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <code className="text-[15px] font-bold font-mono text-[#E8593C] bg-[#E8593C]/10 px-2.5 py-1 rounded-[6px] inline-block">
                    @{selectedContact.name}
                  </code>
                </div>
                <p className="text-[11px] text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)] leading-normal">
                  Type this tag in Auren AI to automatically target {selectedContact.name.split(" ")[0]}.
                </p>
              </div>

              {/* Resolved Email Card */}
              <div className="p-5 rounded-[14px] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[#2C2C2C] flex flex-col justify-between gap-3 shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck size={12} className="text-green-500" /> Target Email
                    </span>
                    <button
                      onClick={() => copyToClipboard(selectedContact.email, "email")}
                      className="p-1 rounded text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] hover:text-[#E8593C] transition-colors"
                      title="Copy email"
                    >
                      {copiedField === "email" ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <span className="text-[13px] font-mono font-medium text-[#241B14] dark:text-[#F4F4F5] truncate block">
                    {selectedContact.email}
                  </span>
                </div>
                <p className="text-[11px] text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)] leading-normal">
                  Auren AI automatically resolves <span className="font-semibold text-[#E8593C]">@{selectedContact.name}</span> to this address.
                </p>
              </div>
            </div>

            {/* Prompt Template Examples */}
            <div className="p-6 rounded-[16px] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FAF8F5] dark:bg-[#2C2C2C] space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#E8593C]" />
                <h3 className="text-[14px] font-bold text-[#241B14] dark:text-[#F4F4F5]">
                  Example AI Commands with @{selectedContact.name.split(" ")[0]}
                </h3>
              </div>

              <div className="space-y-2.5">
                {[
                  `Schedule a Google Meet with @${selectedContact.name} tomorrow at 3 PM and email them the meeting link`,
                  `Send an email to @${selectedContact.name} with subject "Weekly Sync" saying hi`,
                  `Book a 30-min call with @${selectedContact.name} on Friday at 11 AM`,
                ].map((promptText, idx) => (
                  <div
                    key={idx}
                    onClick={() => copyToClipboard(promptText, `prompt-${idx}`)}
                    className="group p-3 rounded-[10px] bg-white dark:bg-[#383838] border border-[rgba(36,27,20,0.06)] dark:border-[rgba(255,255,255,0.06)] flex items-center justify-between cursor-pointer hover:border-[#E8593C]/40 transition-all"
                  >
                    <span className="text-[12px] font-sans text-[#241B14] dark:text-[#F4F4F5] group-hover:text-[#E8593C] transition-colors pr-2">
                      "{promptText}"
                    </span>
                    <span className="text-[10px] font-semibold text-[#E8593C] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      Copy
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Empty / Welcome State */
          <div className="max-w-[560px] w-full mx-auto my-auto text-center space-y-6 py-12">
            <div className="w-16 h-16 rounded-full bg-[#E8593C]/10 text-[#E8593C] flex items-center justify-center mx-auto">
              <Sparkles size={28} />
            </div>
            <div>
              <h2 className="text-[22px] font-bold text-[#241B14] dark:text-[#F4F4F5] tracking-tight">
                Team & @Mention Directory
              </h2>
              <p className="text-[13px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] mt-1 max-w-[420px] mx-auto leading-relaxed">
                Add your colleagues and contacts here to tag them easily in natural language AI commands.
              </p>
            </div>

            <div className="p-6 rounded-[16px] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FAF8F5] dark:bg-[#2C2C2C] text-left space-y-3">
              <span className="text-[11px] font-bold text-[#E8593C] uppercase tracking-wider block">How it works</span>
              <ol className="text-[12.5px] text-[rgba(36,27,20,0.7)] dark:text-[rgba(255,255,255,0.7)] space-y-2 pl-4 list-decimal">
                <li>Add a person with their name and email address.</li>
                <li>Type <code className="bg-[#E8593C]/10 text-[#E8593C] px-1.5 py-0.5 rounded font-mono font-bold">@name</code> in the AI input box.</li>
                <li>Auren AI maps the mention to their exact email and schedules meetings or sends emails automatically!</li>
              </ol>
            </div>

            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 h-10 px-5 bg-[#E8593C] hover:bg-[#D4472B] text-white rounded-[10px] text-[13px] font-semibold transition-all shadow-md active:scale-95"
            >
              <UserPlus size={16} />
              <span>Add Your First Team Member</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
