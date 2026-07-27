"use client";

import React, { useState, useEffect, useTransition } from "react";
import { getTeamContacts, addTeamContact, deleteTeamContact, type TeamContact } from "@/app/actions/team";
import { showToast } from "@/components/ui/premium-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  Mail, 
  Briefcase, 
  AtSign, 
  Sparkles, 
  Copy, 
  Check, 
  ShieldCheck, 
  Calendar,
  Grid,
  List as ListIcon,
  X,
  ExternalLink,
  Plus
} from "lucide-react";

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<"all" | "core" | "synced">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({ name: "", email: "", role: "" });
  const [formError, setFormError] = useState("");

  const load = async () => {
    setIsLoading(true);
    const res = await getTeamContacts();
    if (res.success) {
      setContacts(res.data || []);
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
        setShowAddModal(false);
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

  const triggerAIChat = (promptText: string) => {
    document.dispatchEvent(new CustomEvent("open-ai-chat", { detail: { text: promptText } }));
  };

  const filtered = contacts.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.role || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === "core") return c.role && c.role.toLowerCase() !== "synced contact";
    if (activeTab === "synced") return c.role && c.role.toLowerCase() === "synced contact";
    return true;
  });

  return (
    <div className="flex-1 w-full h-full min-h-screen bg-white dark:bg-[#383838] overflow-y-auto flex flex-col relative">
      
      {/* Top Banner / Stats Header */}
      <div className="p-6 md:p-10 border-b border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FAF8F5]/60 dark:bg-[#2C2C2C]/60 shrink-0">
        <div className="max-w-[1200px] mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-[#E8593C]/10 text-[#E8593C] font-mono text-[10.5px] font-bold tracking-wide uppercase">
                  Auren Network Hub
                </span>
              </div>
              <h1 className="text-[26px] font-extrabold text-[#241B14] dark:text-[#F4F4F5] tracking-tight">
                Team & People Directory
              </h1>
              <p className="text-[13px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] mt-1 max-w-[600px]">
                Manage team members, contacts, and custom email mappings for instant AI <span className="font-semibold text-[#E8593C]">@mentions</span>.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => { setShowAddModal(true); setFormError(""); }}
                className="flex items-center gap-2 h-10 px-4 bg-[#E8593C] hover:bg-[#D4472B] text-white rounded-[10px] text-[13px] font-semibold transition-all shadow-md active:scale-95 shrink-0"
              >
                <UserPlus size={16} />
                <span>Add Team Member</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-[14px] bg-white dark:bg-[#383838] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[11px] font-bold text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] uppercase tracking-wider">
                  Total Contacts
                </span>
                <p className="text-[24px] font-extrabold text-[#241B14] dark:text-[#F4F4F5] mt-0.5">
                  {contacts.length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-[10px] bg-[#E8593C]/10 text-[#E8593C] flex items-center justify-center font-bold">
                <Users size={20} />
              </div>
            </div>

            <div className="p-4 rounded-[14px] bg-white dark:bg-[#383838] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[11px] font-bold text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] uppercase tracking-wider">
                  AI @Mentions
                </span>
                <p className="text-[24px] font-extrabold text-[#E8593C] mt-0.5">
                  100% Ready
                </p>
              </div>
              <div className="w-10 h-10 rounded-[10px] bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                <AtSign size={20} />
              </div>
            </div>

            <div className="p-4 rounded-[14px] bg-white dark:bg-[#383838] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[11px] font-bold text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] uppercase tracking-wider">
                  Email Resolution
                </span>
                <p className="text-[24px] font-extrabold text-green-600 dark:text-green-400 mt-0.5 flex items-center gap-1.5">
                  <ShieldCheck size={20} /> Auto-Mapped
                </p>
              </div>
              <div className="w-10 h-10 rounded-[10px] bg-green-500/10 text-green-500 flex items-center justify-center font-bold">
                <Sparkles size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="p-6 md:p-10 flex-1">
        <div className="max-w-[1200px] mx-auto space-y-6">
          
          {/* Controls Bar: Search, Tabs, View Toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2">
            
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-[#FAF8F5] dark:bg-[#2C2C2C] p-1 rounded-[10px] border border-[rgba(36,27,20,0.06)] dark:border-[rgba(255,255,255,0.06)] w-full sm:w-auto">
              {(["all", "core", "synced"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-[7px] text-[12px] font-semibold transition-colors capitalize ${
                    activeTab === tab
                      ? "bg-white dark:bg-[#383838] text-[#E8593C] shadow-sm"
                      : "text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] hover:text-[#241B14] dark:hover:text-[#F4F4F5]"
                  }`}
                >
                  {tab === "all" ? `All Members (${contacts.length})` : tab === "core" ? "Core Team" : "Synced"}
                </button>
              ))}
            </div>

            {/* Search & Layout Toggle */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(36,27,20,0.35)] dark:text-[rgba(255,255,255,0.35)]" size={14} />
                <input
                  type="text"
                  placeholder="Search by name, email, or role..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 bg-[#FAF8F5] dark:bg-[#2C2C2C] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[9px] text-[12px] text-[#241B14] dark:text-[#F4F4F5] placeholder:text-[rgba(36,27,20,0.35)] dark:placeholder:text-[rgba(255,255,255,0.35)] outline-none focus:border-[#E8593C]/50 transition-colors"
                />
              </div>

              <div className="flex items-center gap-1 bg-[#FAF8F5] dark:bg-[#2C2C2C] p-1 rounded-[9px] border border-[rgba(36,27,20,0.06)] dark:border-[rgba(255,255,255,0.06)] shrink-0">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-[6px] transition-colors ${viewMode === "grid" ? "bg-white dark:bg-[#383838] text-[#E8593C] shadow-sm" : "text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]"}`}
                  title="Grid View"
                >
                  <Grid size={15} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-[6px] transition-colors ${viewMode === "list" ? "bg-white dark:bg-[#383838] text-[#E8593C] shadow-sm" : "text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]"}`}
                  title="List View"
                >
                  <ListIcon size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Directory Content */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-44 bg-[#FAF8F5] dark:bg-[#2C2C2C] rounded-[16px] animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center bg-[#FAF8F5]/40 dark:bg-[#2C2C2C]/40 rounded-[20px] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] py-16">
              <div className="w-14 h-14 rounded-full bg-[#E8593C]/10 text-[#E8593C] flex items-center justify-center mb-3">
                <Users size={24} />
              </div>
              <h3 className="text-[16px] font-bold text-[#241B14] dark:text-[#F4F4F5] mb-1">
                {searchQuery ? "No matching team members" : "Directory Empty"}
              </h3>
              <p className="text-[12px] text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)] max-w-[320px] leading-relaxed mb-4">
                {searchQuery ? "Try refining your search keyword." : "Add contacts to use @mentions in AI commands."}
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 h-9 px-4 bg-[#E8593C] hover:bg-[#D4472B] text-white rounded-[9px] text-[12.5px] font-semibold transition-all shadow-sm"
              >
                <Plus size={14} /> Add First Contact
              </button>
            </div>
          ) : viewMode === "grid" ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(contact => {
                const palette = getAvatarPalette(contact.name);
                const tag = `@${contact.name}`;

                return (
                  <motion.div
                    key={contact.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group p-5 rounded-[16px] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[#2C2C2C] shadow-sm hover:shadow-md hover:border-[#E8593C]/40 transition-all flex flex-col justify-between relative overflow-hidden"
                  >
                    <div>
                      {/* Top row: Avatar & Delete */}
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-[15px] border-2 shrink-0"
                          style={{
                            backgroundColor: palette.lightBg,
                            borderColor: palette.bg + "40",
                            color: palette.text,
                          }}
                        >
                          {getInitials(contact.name)}
                        </div>

                        <button
                          onClick={e => handleDelete(contact, e)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-[6px] hover:bg-red-50 dark:hover:bg-red-950/40 text-[rgba(36,27,20,0.3)] hover:text-red-500 transition-all"
                          title="Delete Member"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Name & Role */}
                      <div className="space-y-1">
                        <h3 className="text-[15px] font-bold text-[#241B14] dark:text-[#F4F4F5] truncate">
                          {contact.name}
                        </h3>
                        <p className="text-[12px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] truncate flex items-center gap-1.5">
                          <Mail size={12} className="shrink-0" />
                          <span>{contact.email}</span>
                        </p>
                      </div>
                    </div>

                    {/* Footer: @Mention badge & AI Trigger button */}
                    <div className="pt-4 mt-4 border-t border-[rgba(36,27,20,0.06)] dark:border-[rgba(255,255,255,0.06)] flex items-center justify-between gap-2">
                      <button
                        onClick={() => copyToClipboard(tag, `tag-${contact.id}`)}
                        className="flex items-center gap-1 px-2 py-1 rounded-[6px] bg-[#E8593C]/10 hover:bg-[#E8593C]/20 text-[#E8593C] font-mono text-[11px] font-bold transition-colors shrink-0"
                        title="Click to copy @mention"
                      >
                        <AtSign size={11} />
                        <span>{contact.name.split(" ")[0]}</span>
                        {copiedField === `tag-${contact.id}` ? <Check size={11} className="text-green-600" /> : <Copy size={10} />}
                      </button>

                      <button
                        onClick={() => triggerAIChat(`Schedule a Google Meet with @${contact.name} tomorrow at 3 PM and email them the meeting link`)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] hover:text-[#E8593C] transition-colors"
                        title="AI Meet Request"
                      >
                        <span>Meet</span>
                        <ExternalLink size={10} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* LIST VIEW */
            <div className="space-y-2">
              {filtered.map(contact => {
                const palette = getAvatarPalette(contact.name);
                const tag = `@${contact.name}`;

                return (
                  <div
                    key={contact.id}
                    className="group p-4 rounded-[12px] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[#2C2C2C] flex items-center justify-between gap-4 hover:border-[#E8593C]/40 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[13px] border-2 shrink-0"
                        style={{
                          backgroundColor: palette.lightBg,
                          borderColor: palette.bg + "40",
                          color: palette.text,
                        }}
                      >
                        {getInitials(contact.name)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-bold text-[#241B14] dark:text-[#F4F4F5] truncate">
                            {contact.name}
                          </span>
                          {contact.role && (
                            <span className="px-2 py-[1px] rounded bg-[rgba(36,27,20,0.06)] dark:bg-[rgba(255,255,255,0.08)] text-[10px] font-semibold text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]">
                              {contact.role}
                            </span>
                          )}
                        </div>
                        <span className="text-[12px] text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)] truncate block">
                          {contact.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => copyToClipboard(tag, `tag-${contact.id}`)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-[6px] bg-[#E8593C]/10 text-[#E8593C] font-mono text-[11px] font-bold hover:bg-[#E8593C]/20 transition-colors"
                      >
                        <AtSign size={11} />
                        <span>{contact.name.split(" ")[0]}</span>
                      </button>

                      <button
                        onClick={e => handleDelete(contact, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-[6px] hover:bg-red-50 dark:hover:bg-red-950/40 text-[rgba(36,27,20,0.3)] hover:text-red-500 transition-all"
                        title="Delete Member"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#2C2C2C] border border-[rgba(36,27,20,0.12)] dark:border-[rgba(255,255,255,0.12)] rounded-[20px] p-6 max-w-[440px] w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[7px] bg-[#E8593C]/10 text-[#E8593C] flex items-center justify-center">
                    <UserPlus size={15} />
                  </div>
                  <h3 className="text-[16px] font-bold text-[#241B14] dark:text-[#F4F4F5]">Add Team Member</h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-full text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] hover:text-[#241B14] dark:hover:text-[#F4F4F5]"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAdd} className="space-y-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pranav Gawai"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                    className="w-full h-10 px-3.5 bg-[#FAF8F5] dark:bg-[#383838] border border-[rgba(36,27,20,0.10)] dark:border-[rgba(255,255,255,0.10)] rounded-[10px] text-[13px] text-[#241B14] dark:text-[#F4F4F5] outline-none focus:border-[#E8593C]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] uppercase mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. pranavgawai1518@gmail.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                    className="w-full h-10 px-3.5 bg-[#FAF8F5] dark:bg-[#383838] border border-[rgba(36,27,20,0.10)] dark:border-[rgba(255,255,255,0.10)] rounded-[10px] text-[13px] text-[#241B14] dark:text-[#F4F4F5] outline-none focus:border-[#E8593C]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] uppercase mb-1">
                    Role (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Founder, Developer, Designer"
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full h-10 px-3.5 bg-[#FAF8F5] dark:bg-[#383838] border border-[rgba(36,27,20,0.10)] dark:border-[rgba(255,255,255,0.10)] rounded-[10px] text-[13px] text-[#241B14] dark:text-[#F4F4F5] outline-none focus:border-[#E8593C]"
                  />
                </div>

                {formError && <p className="text-[12px] text-red-500 font-medium">{formError}</p>}

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 h-10 bg-[#E8593C] hover:bg-[#D4472B] disabled:opacity-50 text-white rounded-[10px] text-[13px] font-bold transition-all shadow-sm"
                  >
                    {isPending ? "Adding..." : "Add to Team"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="h-10 px-4 bg-[rgba(36,27,20,0.06)] dark:bg-[rgba(255,255,255,0.08)] text-[#241B14] dark:text-[#F4F4F5] rounded-[10px] text-[13px] font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
