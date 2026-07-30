"use client";

import React, { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import {
  getTeamContacts,
  addTeamContact,
  updateTeamContact,
  deleteTeamContact,
  type TeamContact,
} from "@/app/actions/team";
import { showToast } from "@/components/ui/premium-toast";
import { AurenLoading } from "@/components/ui/auren-loading";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trash2, Check, X, Plus, Pencil, Copy, Grid, List as ListIcon, Mail, CalendarPlus } from "lucide-react";
import { ScheduleMeetPopover } from "@/components/auren/app/schedule-meet-popover";

/* Shared editorial tokens — matches the dashboard: no card chrome, hairline
   rules, serif headings, mono micro-labels. */
const RULE = "border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)]";
const MUTED = "text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]";
const FAINT = "text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]";
const CARD =
  "bg-white dark:bg-[#383838] rounded-[16px] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-sm";
const DIVIDE = "divide-[rgba(36,27,20,0.06)] dark:divide-[rgba(255,255,255,0.06)]";
const SERIF = { fontFamily: "var(--font-civane, Georgia, serif)" };
const FIELD =
  "w-full h-10 px-3.5 bg-transparent border rounded-[10px] text-[13px] text-[#241B14] dark:text-[#F4F4F5] outline-none focus:border-[#E8593C] transition-colors";

function getInitials(name: string) {
  if (!name) return "??";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const AVATAR_PALETTES = [
  { lightBg: "rgba(232, 89, 60, 0.12)", text: "#E8593C" },
  { lightBg: "rgba(139, 92, 246, 0.12)", text: "#8B5CF6" },
  { lightBg: "rgba(2, 132, 199, 0.12)", text: "#0284C7" },
  { lightBg: "rgba(22, 163, 74, 0.12)", text: "#16A34A" },
  { lightBg: "rgba(217, 119, 6, 0.12)", text: "#D97706" },
  { lightBg: "rgba(236, 72, 153, 0.12)", text: "#EC4899" },
];

function getAvatarPalette(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
}

export function TeamView() {
  const [contacts, setContacts] = useState<TeamContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "core" | "synced">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  /** Contact id whose scheduler popover is open — only ever one at a time. */
  const [schedulingId, setSchedulingId] = useState<string | null>(null);

  const sendMeetCommand = (text: string) => {
    document.dispatchEvent(new CustomEvent("open-ai-chat", { detail: { text } }));
  };

  const [form, setForm] = useState({ name: "", email: "", role: "" });
  const [formError, setFormError] = useState("");
  // null = adding a new contact; otherwise editing this one.
  const [editingContact, setEditingContact] = useState<TeamContact | null>(null);

  const load = async () => {
    setIsLoading(true);
    const res = await getTeamContacts();
    if (res.success) setContacts(res.data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openAddModal = () => {
    setEditingContact(null);
    setForm({ name: "", email: "", role: "" });
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (contact: TeamContact, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingContact(contact);
    setForm({
      name: contact.name,
      email: contact.email,
      role: contact.role && contact.role !== "Team Member" ? contact.role : "",
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    startTransition(async () => {
      const res = editingContact
        ? await updateTeamContact(editingContact.id, form.name, form.email, form.role)
        : await addTeamContact(form.name, form.email, form.role);

      if (res.success) {
        showToast.success(editingContact ? `${form.name} updated` : `${form.name} added to your team`);
        setForm({ name: "", email: "", role: "" });
        setEditingContact(null);
        setShowModal(false);
        load();
      } else {
        setFormError(res.error || (editingContact ? "Failed to update contact" : "Failed to add contact"));
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

  const copyTag = (tag: string, key: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedField(key);
    showToast.success(`Copied "${tag}"`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const filtered = contacts.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.role || "").toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (activeTab === "core") return c.role && c.role.toLowerCase() !== "synced contact";
    if (activeTab === "synced") return c.role && c.role.toLowerCase() === "synced contact";
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#FAF8F5] dark:bg-[#2C2C2C] overflow-y-auto min-w-0">

      {/* ── Full-width header bar ────────────────────────────────────────── */}
      <div className="min-h-[80px] bg-white dark:bg-[#383838] border-b border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] flex items-center justify-between gap-6 px-8 py-4 shrink-0">
        <div className="min-w-0">
          <h1 className="text-[22px] tracking-tight text-[#241B14] dark:text-[#F4F4F5]" style={SERIF}>
            Team &amp; People
          </h1>
          <p className={`font-sans text-[12.5px] ${MUTED} mt-0.5`}>
            Everyone here becomes an <span className="text-[#E8593C] font-medium">@mention</span> Auren can resolve to a real email.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="shrink-0 h-9 px-4 inline-flex items-center gap-1.5 bg-[#E8593C] hover:bg-[#D4472B] text-white rounded-[10px] font-sans text-[12.5px] font-semibold transition-colors shadow-sm"
        >
          <Plus size={14} />
          Add contact
        </button>
      </div>

      {/* ── Full-width content ───────────────────────────────────────────── */}
      <div className="flex-1 p-8 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

        {/* ── Filters + search ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.06)] p-1 rounded-[10px]">
            {(["all", "core", "synced"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-[8px] font-sans text-[12px] font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? "bg-white dark:bg-[#383838] shadow-sm text-[#241B14] dark:text-[#F4F4F5]"
                    : `${MUTED} hover:text-[#241B14] dark:hover:text-[#F4F4F5]`
                }`}
              >
                {tab === "all" ? `All ${contacts.length}` : tab}
              </button>
            ))}
          </div>

          <div className={`h-[34px] w-[200px] ${CARD} flex items-center gap-2 px-3 focus-within:border-[#E8593C]/40 transition-colors`}>
            <Search size={13} className={`${FAINT} shrink-0`} />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none font-sans text-[12px] text-[#241B14] dark:text-[#F4F4F5] placeholder:text-[rgba(36,27,20,0.35)] dark:placeholder:text-[rgba(255,255,255,0.35)] w-full"
            />
          </div>

          <div className="flex items-center gap-1 bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.06)] p-1 rounded-[10px] shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              title="Grid view"
              className={`p-1.5 rounded-[8px] transition-colors ${
                viewMode === "grid"
                  ? "bg-white dark:bg-[#383838] shadow-sm text-[#E8593C]"
                  : FAINT
              }`}
            >
              <Grid size={14} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              title="List view"
              className={`p-1.5 rounded-[8px] transition-colors ${
                viewMode === "list"
                  ? "bg-white dark:bg-[#383838] shadow-sm text-[#E8593C]"
                  : FAINT
              }`}
            >
              <ListIcon size={14} />
            </button>
          </div>
        </div>

        {/* ── Directory list ─────────────────────────────────────────────── */}
        <section>
          {isLoading ? (
            <div className={`${CARD} p-12`}>
              <AurenLoading text="Loading your team…" size="sm" />
            </div>
          ) : filtered.length === 0 ? (
            <div className={`${CARD} py-10 flex flex-col items-center text-center`}>
              {!searchQuery && (
                <div className="relative w-[120px] h-[120px] mb-2 opacity-90">
                  <Image
                    src="/mascot-create.webp"
                    alt=""
                    width={512}
                    height={512}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </div>
              )}
              <p className="text-[20px] text-[#241B14] dark:text-[#F4F4F5] mb-1.5" style={SERIF}>
                {searchQuery ? "No matching contacts" : "Nobody here yet"}
              </p>
              <p className={`font-sans text-[13.5px] ${MUTED} max-w-[320px] leading-relaxed mb-5`}>
                {searchQuery
                  ? "Try a different name, email, or role."
                  : "Add a contact so Auren can turn an @mention into a real email address."}
              </p>
              {!searchQuery && (
                <button
                  onClick={openAddModal}
                  className="h-9 px-4 inline-flex items-center gap-1.5 bg-[#E8593C] hover:bg-[#D4472B] text-white rounded-[10px] font-sans text-[12.5px] font-semibold transition-colors shadow-sm"
                >
                  <Plus size={14} />
                  Add your first contact
                </button>
              )}
            </div>
          ) : (
            viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
              {filtered.map((contact) => {
                const palette = getAvatarPalette(contact.name);
                const tag = `@${contact.name}`;
                const role = contact.role && contact.role !== "Team Member" ? contact.role : null;
                return (
                  <div
                    key={contact.id}
                    className={`group ${CARD} p-5 flex flex-col hover:border-[rgba(36,27,20,0.16)] dark:hover:border-[rgba(255,255,255,0.16)] transition-colors`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <span
                        className="w-11 h-11 rounded-full flex items-center justify-center font-sans font-semibold text-[14px] shrink-0"
                        style={{ backgroundColor: palette.lightBg, color: palette.text }}
                      >
                        {getInitials(contact.name)}
                      </span>
                      <span className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => openEditModal(contact, e)}
                          title="Edit contact"
                          className={`p-1.5 rounded-[6px] ${FAINT} hover:text-[#E8593C] hover:bg-[rgba(36,27,20,0.04)] dark:hover:bg-[rgba(255,255,255,0.06)] transition-colors`}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(contact, e)}
                          title="Remove contact"
                          className={`p-1.5 rounded-[6px] ${FAINT} hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </span>
                    </div>

                    <p className="font-sans font-semibold text-[14.5px] text-[#241B14] dark:text-[#F4F4F5] truncate">
                      {contact.name}
                    </p>
                    <p className={`font-sans text-[12.5px] ${MUTED} truncate mt-0.5 flex items-center gap-1.5`}>
                      <Mail size={12} className="shrink-0" />
                      {contact.email}
                    </p>
                    {role && (
                      <span className="inline-block mt-2.5 w-max px-2 py-0.5 rounded-full bg-[rgba(36,27,20,0.05)] dark:bg-[rgba(255,255,255,0.07)] font-sans text-[10.5px] font-medium text-[rgba(36,27,20,0.55)] dark:text-[rgba(255,255,255,0.55)]">
                        {role}
                      </span>
                    )}

                    <div className="mt-4 pt-3.5 border-t border-[rgba(36,27,20,0.06)] dark:border-[rgba(255,255,255,0.06)] flex items-center justify-between gap-2">
                      <button
                        onClick={() => copyTag(tag, contact.id)}
                        title="Copy @mention"
                        className="flex items-center gap-1 px-2 py-1 rounded-[6px] bg-[#E8593C]/10 hover:bg-[#E8593C]/20 text-[#E8593C] font-mono text-[11px] font-semibold transition-colors"
                      >
                        {tag}
                        {copiedField === contact.id ? <Check size={11} /> : <Copy size={10} />}
                      </button>
                      <div className="relative">
                        <button
                          onClick={() =>
                            setSchedulingId((prev) => (prev === contact.id ? null : contact.id))
                          }
                          className={`inline-flex items-center gap-1 font-sans text-[11.5px] font-medium transition-colors ${
                            schedulingId === contact.id
                              ? "text-[#E8593C]"
                              : `${MUTED} hover:text-[#E8593C]`
                          }`}
                        >
                          <CalendarPlus size={12} />
                          Schedule meet
                        </button>
                        <ScheduleMeetPopover
                          open={schedulingId === contact.id}
                          onClose={() => setSchedulingId(null)}
                          contactName={contact.name}
                          tag={tag}
                          onSubmit={sendMeetCommand}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <ul className={`${CARD} overflow-hidden divide-y ${DIVIDE}`}>
              {filtered.map((contact) => {
                const palette = getAvatarPalette(contact.name);
                const tag = `@${contact.name}`;
                const role = contact.role && contact.role !== "Team Member" ? contact.role : null;
                return (
                  <li
                    key={contact.id}
                    className="group flex items-center gap-4 px-5 py-3.5 hover:bg-[rgba(36,27,20,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  >
                    <span
                      className="w-9 h-9 rounded-full flex items-center justify-center font-sans font-semibold text-[12.5px] shrink-0"
                      style={{ backgroundColor: palette.lightBg, color: palette.text }}
                    >
                      {getInitials(contact.name)}
                    </span>

                    <span className="flex-1 min-w-0">
                      <span className="flex items-baseline gap-2">
                        <span className="font-sans text-[14.5px] text-[#241B14] dark:text-[#F4F4F5] truncate">
                          {contact.name}
                        </span>
                        {role && (
                          <span className="shrink-0 px-2 py-0.5 rounded-full bg-[rgba(36,27,20,0.05)] dark:bg-[rgba(255,255,255,0.07)] font-sans text-[10.5px] font-medium text-[rgba(36,27,20,0.55)] dark:text-[rgba(255,255,255,0.55)]">
                            {role}
                          </span>
                        )}
                      </span>
                      <span className={`block font-sans text-[13px] ${MUTED} truncate`}>{contact.email}</span>
                    </span>

                    <button
                      onClick={() => copyTag(tag, contact.id)}
                      title="Copy @mention"
                      className={`shrink-0 hidden sm:flex items-center gap-1.5 font-mono text-[12px] ${MUTED} hover:text-[#E8593C] transition-colors`}
                    >
                      {tag}
                      {copiedField === contact.id ? (
                        <Check size={11} className="text-[#16A34A]" />
                      ) : (
                        <Copy size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>

                    <span
                      className={`shrink-0 flex items-center gap-1 transition-opacity ${
                        schedulingId === contact.id
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <div className="relative">
                        <button
                          onClick={() =>
                            setSchedulingId((prev) => (prev === contact.id ? null : contact.id))
                          }
                          title="Schedule meet"
                          className={`p-1.5 rounded-full transition-colors ${
                            schedulingId === contact.id ? "text-[#E8593C]" : `${FAINT} hover:text-[#E8593C]`
                          }`}
                        >
                          <CalendarPlus size={13} />
                        </button>
                        <ScheduleMeetPopover
                          open={schedulingId === contact.id}
                          onClose={() => setSchedulingId(null)}
                          contactName={contact.name}
                          tag={tag}
                          onSubmit={sendMeetCommand}
                        />
                      </div>
                      <button
                        onClick={(e) => openEditModal(contact, e)}
                        title="Edit contact"
                        className={`p-1.5 rounded-full ${FAINT} hover:text-[#E8593C] transition-colors`}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(contact, e)}
                        title="Remove contact"
                        className={`p-1.5 rounded-full ${FAINT} hover:text-red-500 transition-colors`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
          )
          )}
        </section>

        <div className="h-4" />
      </div>

      {/* ── Add / Edit modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[rgba(36,27,20,0.35)] backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#383838] border border-[rgba(36,27,20,0.12)] dark:border-[rgba(255,255,255,0.12)] rounded-[16px] p-6 max-w-[420px] w-full"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className={`font-sans text-[11px] font-semibold uppercase tracking-wider ${FAINT} mb-2`}>
                    {editingContact ? "Edit" : "New"}
                  </p>
                  <h3 className="text-[22px] leading-tight text-[#241B14] dark:text-[#F4F4F5]" style={SERIF}>
                    {editingContact ? "Edit contact" : "Add contact"}
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className={`${FAINT} hover:text-[#241B14] dark:hover:text-[#F4F4F5] transition-colors p-1`}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className={`block font-sans text-[11px] font-semibold uppercase tracking-wider ${FAINT} mb-1.5`}>
                    Full name
                  </label>
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                    className={`${FIELD} ${RULE}`}
                  />
                </div>

                <div>
                  <label className={`block font-sans text-[11px] font-semibold uppercase tracking-wider ${FAINT} mb-1.5`}>
                    Email address
                  </label>
                  <input
                    type="email"
                    placeholder="jane.doe@company.com"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    required
                    className={`${FIELD} ${RULE}`}
                  />
                </div>

                <div>
                  <label className={`block font-sans text-[11px] font-semibold uppercase tracking-wider ${FAINT} mb-1.5`}>
                    Role <span className="normal-case">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Designer"
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                    className={`${FIELD} ${RULE}`}
                  />
                </div>

                {formError && <p className="font-sans text-[12.5px] text-red-500">{formError}</p>}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 h-10 rounded-[10px] bg-[#E8593C] hover:bg-[#D4472B] text-white font-sans text-[13px] font-semibold transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {isPending
                      ? editingContact
                        ? "Saving…"
                        : "Adding…"
                      : editingContact
                      ? "Save changes"
                      : "Add contact"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className={`h-10 px-4 font-sans text-[13px] ${MUTED} hover:text-[#241B14] dark:hover:text-[#F4F4F5] transition-colors`}
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
