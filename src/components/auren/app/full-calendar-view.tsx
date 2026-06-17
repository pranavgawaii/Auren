"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Check, MoreVertical, X, Clock } from "lucide-react";
import { getCalendarEvents } from "@/app/actions/get-events";
import { createCalendarEvent } from "@/app/actions/create-event";
import { showToast } from "@/components/ui/premium-toast";

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  startAt?: string;
  endAt?: string;
  isDb?: boolean;
}

export function FullCalendarView() {
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"week" | "month">("month");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventTime, setNewEventTime] = useState("09:00");
  const [isCreating, setIsCreating] = useState(false);

  const fetchEvents = async () => {
    const res = await getCalendarEvents();
    if (res.success && res.data) {
      setDbEvents(res.data);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const today = new Date();
  
  // Month View State
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // Week View State
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - d.getDay()); // Sunday
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const handlePrev = () => {
    if (viewMode === "month") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() - 7);
      setCurrentWeekStart(d);
    }
  };

  const handleNext = () => {
    if (viewMode === "month") {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + 7);
      setCurrentWeekStart(d);
    }
  };

  const handleToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    
    const d = new Date(today);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    setCurrentWeekStart(d);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newEventDate || !newEventTime) return;

    setIsCreating(true);
    try {
      const startAt = new Date(`${newEventDate}T${newEventTime}:00`).toISOString();
      // default 1 hour event
      const endAt = new Date(new Date(startAt).getTime() + 60 * 60 * 1000).toISOString();

      const res = await createCalendarEvent({
        title: newEventTitle,
        startAt,
        endAt,
        attendees: [],
      });

      if (res.success) {
        const meetLink = (res as Record<string, unknown>).data && ((res as Record<string, unknown>).data as Record<string, unknown>).meetLink as string | null;
        const warning = (res as Record<string, unknown>).warning as string | undefined;
        if (warning === "calendar_sync_failed") {
          showToast.warning("Saved locally — Google Calendar sync unavailable");
        } else {
          showToast.success(`Event created${meetLink ? ` · Meet: ${meetLink}` : ''}`);
        }
        setIsCreateModalOpen(false);
        setNewEventTitle("");
        fetchEvents();
      } else {
        showToast.error("Failed to create event.");
      }
    } catch (err) {
      showToast.error("An error occurred while creating the event.");
    } finally {
      setIsCreating(false);
    }
  };

  // Month View Calculations
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDayIndex = firstDayOfMonth; // Map Sunday (0) to 0

  // Week View Calculations
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const hours = Array.from({ length: 24 }).map((_, i) => i);

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#383838] overflow-hidden relative">
      {/* Header */}
      <div className="h-[64px] border-b border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-8">
          <h1 className="font-sans font-medium text-[22px] text-[#241B14] dark:text-[#F4F4F5] tracking-tight" style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>
            Calendar
          </h1>
          
          <div className="flex items-center gap-4">
            <button onClick={handleToday} className="px-3 py-1.5 border border-[rgba(36,27,20,0.12)] dark:border-[rgba(255,255,255,0.12)] rounded-md font-sans text-[13px] font-medium text-[rgba(36,27,20,0.7)] dark:text-[rgba(255,255,255,0.7)] hover:bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.04)] transition-colors">
              Today
            </button>
            <div className="flex items-center gap-1">
              <button onClick={handlePrev} className="p-1.5 rounded-full hover:bg-[rgba(36,27,20,0.06)] dark:bg-[rgba(255,255,255,0.06)] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] hover:text-[#241B14] dark:text-[#F4F4F5] transition-colors">
                <ChevronLeft size={20} />
              </button>
              <button onClick={handleNext} className="p-1.5 rounded-full hover:bg-[rgba(36,27,20,0.06)] dark:bg-[rgba(255,255,255,0.06)] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] hover:text-[#241B14] dark:text-[#F4F4F5] transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
            <span className="font-sans text-[18px] text-[#241B14] dark:text-[#F4F4F5] ml-2 tracking-tight">
              {viewMode === "month" 
                ? `${monthNames[currentMonth]} ${currentYear}`
                : `${monthNames[currentWeekStart.getMonth()]} ${currentWeekStart.getFullYear()}`}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.04)] p-0.5 rounded-lg border border-[rgba(36,27,20,0.06)] dark:border-[rgba(255,255,255,0.06)]">
            <button 
              onClick={() => setViewMode("week")}
              className={`px-3 py-1.5 rounded-md font-sans text-[13px] font-medium transition-all ${viewMode === "week" ? "bg-white dark:bg-[#383838] shadow-sm text-[#241B14] dark:text-[#F4F4F5]" : "text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] hover:text-[#241B14] dark:text-[#F4F4F5]"}`}
            >
              Week
            </button>
            <button 
              onClick={() => setViewMode("month")}
              className={`px-3 py-1.5 rounded-md font-sans text-[13px] font-medium transition-all ${viewMode === "month" ? "bg-white dark:bg-[#383838] shadow-sm text-[#241B14] dark:text-[#F4F4F5]" : "text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] hover:text-[#241B14] dark:text-[#F4F4F5]"}`}
            >
              Month
            </button>
          </div>
          <a
            href="https://calendar.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[rgba(36,27,20,0.12)] dark:border-[rgba(255,255,255,0.12)] text-[rgba(36,27,20,0.6)] dark:text-[rgba(255,255,255,0.6)] hover:bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.04)] hover:text-[#1A73E8] transition-all group"
          >
            <CalendarIcon size={16} className="group-hover:text-[#1A73E8]" />
            <span className="font-sans text-[13px] font-medium">Google Calendar</span>
          </a>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-[256px] shrink-0 border-r border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[#383838] flex flex-col p-4 overflow-y-auto hidden md:flex">
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="h-[44px] px-4 w-fit bg-white dark:bg-[#383838] border border-[rgba(36,27,20,0.12)] dark:border-[rgba(255,255,255,0.12)] text-[#241B14] dark:text-[#F4F4F5] rounded-full font-sans font-medium text-[14px] flex items-center gap-3 shadow-sm hover:shadow-md hover:bg-[#FAF8F5] dark:bg-[#2C2C2C] transition-all mb-8"
          >
            <svg width="24" height="24" viewBox="0 0 24 24"><path fill="#EA4335" d="M10.25 3.5h3.5v17h-3.5z"/><path fill="#34A853" d="M3.5 10.25h17v3.5h-17z"/><path fill="#4285F4" d="M3.5 10.25h8.5v3.5h-8.5z"/><path fill="#FBBC05" d="M10.25 10.25h3.5v8.5h-3.5z"/></svg>
            Create
          </button>

          {/* Mini Calendar placeholder */}
          <div className="mb-8 select-none">
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="font-sans text-[13px] font-medium text-[#241B14] dark:text-[#F4F4F5]">{monthNames[currentMonth]} {currentYear}</span>
              <div className="flex">
                <ChevronLeft size={16} className="text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] cursor-pointer" />
                <ChevronRight size={16} className="text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] cursor-pointer" />
              </div>
            </div>
            <div className="grid grid-cols-7 gap-y-1 mb-1 px-1">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <div key={i} className="text-center font-sans text-[10px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1 px-1">
              {Array.from({ length: 35 }).map((_, i) => {
                const num = i - startDayIndex + 1;
                const valid = num > 0 && num <= daysInMonth;
                const isTodayStr = num === today.getDate() && currentMonth === today.getMonth() ? "bg-[#1A73E8] text-white rounded-full" : "text-[#241B14] dark:text-[#F4F4F5] hover:bg-[rgba(36,27,20,0.06)] dark:bg-[rgba(255,255,255,0.06)] rounded-full cursor-pointer";
                return (
                  <div key={i} className="aspect-square flex items-center justify-center font-sans text-[11px]">
                    {valid && <span className={`w-6 h-6 flex items-center justify-center ${isTodayStr}`}>{num}</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between group cursor-pointer px-2 py-1">
                <span className="font-sans text-[13px] font-medium text-[#241B14] dark:text-[#F4F4F5]">My calendars</span>
                <ChevronLeft size={16} className="text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] rotate-[-90deg]" />
              </div>
              <div className="mt-2 space-y-1">
                <label className="flex items-center gap-3 px-2 py-1.5 hover:bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.04)] rounded-md cursor-pointer group">
                  <div className="w-4 h-4 rounded-[3px] bg-[#E8593C] flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                  <span className="font-sans text-[13px] text-[#241B14] dark:text-[#F4F4F5] flex-1">Pranav Gawaii</span>
                  <MoreVertical size={14} className="opacity-0 group-hover:opacity-100 text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]" />
                </label>
                <label className="flex items-center gap-3 px-2 py-1.5 hover:bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.04)] rounded-md cursor-pointer group">
                  <div className="w-4 h-4 rounded-[3px] bg-[#0F6E56] flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                  <span className="font-sans text-[13px] text-[#241B14] dark:text-[#F4F4F5] flex-1">Work</span>
                  <MoreVertical size={14} className="opacity-0 group-hover:opacity-100 text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]" />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Main Calendar Grid */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#383838] overflow-hidden relative">
          
          {viewMode === "month" && (
            <div className="flex-1 flex flex-col h-full min-h-[600px] overflow-y-auto">
              {/* Days Header */}
              <div className="grid grid-cols-7 border-b border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[#383838] shrink-0 sticky top-0 z-10">
                {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day, i) => (
                  <div key={day} className="py-2 flex flex-col items-center justify-center border-r border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] last:border-r-0">
                    <span className="font-sans font-medium text-[11px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] uppercase tracking-wider">{day}</span>
                  </div>
                ))}
              </div>
              
              {/* Calendar Body */}
              <div className="flex-1 grid grid-cols-7 grid-rows-5 bg-[rgba(36,27,20,0.08)] dark:bg-[rgba(255,255,255,0.08)] gap-[1px]">
                {Array.from({ length: 35 }).map((_, i) => {
                  const dayNum = i - startDayIndex + 1;
                  const isToday = dayNum === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                  const isValidDay = dayNum > 0 && dayNum <= daysInMonth;
                  
                  const dayDbEvents = isValidDay ? dbEvents.filter(e => {
                    const eDate = new Date(e.startAt);
                    return eDate.getDate() === dayNum && eDate.getMonth() === currentMonth && eDate.getFullYear() === currentYear;
                  }) : [];

                  return (
                    <div key={i} className={`bg-white dark:bg-[#383838] p-1 flex flex-col ${!isValidDay ? 'opacity-40' : ''}`}>
                      <div className="flex justify-center mb-1 mt-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-sans text-[12px] ${isToday ? 'bg-[#1A73E8] text-white font-medium' : 'text-[#241B14] dark:text-[#F4F4F5] hover:bg-[rgba(36,27,20,0.06)] dark:bg-[rgba(255,255,255,0.06)] cursor-pointer'}`}>
                          {isValidDay ? dayNum : ""}
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto space-y-1 px-1 custom-scrollbar">
                        {isValidDay && dayDbEvents.map(evt => (
                          <div key={evt.id} className="px-2 py-0.5 rounded-[4px] bg-[#039BE5] text-white font-sans text-[11px] font-medium truncate cursor-pointer hover:opacity-90 shadow-sm leading-tight flex items-center gap-1.5 relative group">
                            <div className="w-[6px] h-[6px] rounded-full bg-white dark:bg-[#383838]/40 shrink-0" />
                            <span className="truncate">{evt.title}</span>
                            
                            {/* Tooltip */}
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:flex flex-col bg-[#241B14] text-white p-2.5 rounded-lg shadow-xl z-[100] min-w-[200px] pointer-events-none">
                              <span className="font-semibold text-[12px] whitespace-normal leading-snug">{evt.title}</span>
                              <span className="opacity-80 mt-1 text-[11px] flex items-center gap-1.5">
                                <Clock size={10} />
                                {new Date(evt.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {evt.endAt ? ` - ${new Date(evt.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === "week" && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Week Header */}
              <div className="flex border-b border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] shrink-0 sticky top-0 z-20 bg-white dark:bg-[#383838]">
                <div className="w-16 border-r border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] shrink-0" />
                <div className="flex-1 grid grid-cols-7">
                  {weekDays.map((d, i) => {
                    const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
                    return (
                      <div key={i} className="py-2 flex flex-col items-center justify-center border-r border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] last:border-r-0">
                        <span className={`font-sans font-medium text-[11px] uppercase tracking-wider mb-0.5 ${isToday ? 'text-[#1A73E8]' : 'text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]'}`}>
                          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][d.getDay()]}
                        </span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-sans text-[18px] ${isToday ? 'bg-[#1A73E8] text-white font-medium' : 'text-[#241B14] dark:text-[#F4F4F5]'}`}>
                          {d.getDate()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Week Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto custom-scrollbar relative flex bg-white dark:bg-[#383838]">
                {/* Time column */}
                <div className="w-16 shrink-0 relative bg-white dark:bg-[#383838] border-r border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] z-10">
                  {hours.map(hour => (
                    <div key={hour} className="h-14 relative flex justify-end pr-2">
                      <span className="absolute -top-2 font-sans text-[10px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] font-medium">
                        {hour === 0 ? "" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Grid lines and Events container */}
                <div className="flex-1 relative bg-white dark:bg-[#383838]">
                  {/* Horizontal grid lines */}
                  <div className="absolute inset-0 flex flex-col pointer-events-none">
                    {hours.map(hour => (
                      <div key={hour} className="h-14 border-b border-[rgba(36,27,20,0.04)] dark:border-[rgba(255,255,255,0.04)] w-full" />
                    ))}
                  </div>

                  {/* Vertical grid lines */}
                  <div className="absolute inset-0 grid grid-cols-7 pointer-events-none">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={i} className="border-r border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] h-full last:border-r-0" />
                    ))}
                  </div>

                  {/* Absolute positioned events */}
                  {dbEvents.map(evt => {
                    const eDate = new Date(evt.startAt);
                    // Check if event is in the current week
                    const eTime = eDate.getTime();
                    const weekStart = currentWeekStart.getTime();
                    const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000;
                    
                    if (eTime >= weekStart && eTime < weekEnd) {
                      const dayIndex = eDate.getDay();
                      const startHour = eDate.getHours() + eDate.getMinutes() / 60;
                      // Default 1 hour if endAt not provided
                      const durationHours = evt.endAt ? (new Date(evt.endAt).getTime() - eTime) / (1000 * 60 * 60) : 1;

                      const top = startHour * 56; // 56px = h-14
                      const height = durationHours * 56;

                      return (
                        <div 
                          key={evt.id} 
                          className="absolute bg-[#039BE5] rounded-[4px] p-1.5 shadow-sm overflow-visible text-white hover:opacity-90 cursor-pointer border border-[#0288D1] transition-all group"
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            left: `calc(${dayIndex * (100/7)}% + 2px)`,
                            width: `calc(${100/7}% - 5px)`,
                            zIndex: 20
                          }}
                        >
                          <div className="font-sans font-medium text-[11px] truncate leading-tight">
                            {evt.title}
                          </div>
                          <div className="font-sans text-[10px] opacity-80 truncate">
                            {eDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>

                          {/* Tooltip */}
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:flex flex-col bg-[#241B14] text-white p-2.5 rounded-lg shadow-xl z-[100] min-w-[200px] pointer-events-none text-left">
                            <span className="font-semibold text-[12px] whitespace-normal leading-snug">{evt.title}</span>
                            <span className="opacity-80 mt-1 text-[11px] flex items-center gap-1.5">
                              <Clock size={10} />
                              {eDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {evt.endAt ? ` - ${new Date(evt.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                            </span>
                            {(evt as Record<string, unknown>).hangoutLink || (evt as Record<string, unknown>).meetLink ? (
                              <a
                                href={((evt as Record<string, unknown>).hangoutLink || (evt as Record<string, unknown>).meetLink) as string}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-1.5 pointer-events-auto"
                                style={{ fontSize:'11px', color:'#E8593C', fontWeight:600, textDecoration:'none', background:'#FCE0D2', padding:'2px 8px', borderRadius:'4px', display:'inline-block' }}
                              >🎥 Join Meet</a>
                            ) : null}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Event Modal */}
      {isCreateModalOpen && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#383838] rounded-[16px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FAF8F5] dark:bg-[#2C2C2C]">
              <h2 className="font-sans font-medium text-[15px] text-[#241B14] dark:text-[#F4F4F5] flex items-center gap-2">
                <CalendarIcon size={16} className="text-[#1A73E8]" />
                Create New Event
              </h2>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[rgba(36,27,20,0.08)] dark:bg-[rgba(255,255,255,0.08)] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleCreateEvent} className="p-6 flex flex-col gap-5">
              <div>
                <input 
                  type="text" 
                  value={newEventTitle}
                  onChange={e => setNewEventTitle(e.target.value)}
                  placeholder="Add title"
                  className="w-full text-[22px] bg-transparent font-sans text-[#241B14] dark:text-[#F4F4F5] placeholder-[rgba(36,27,20,0.3)] border-b border-[rgba(36,27,20,0.12)] dark:border-[rgba(255,255,255,0.12)] pb-2 focus:outline-none focus:border-[#1A73E8] transition-colors"
                  autoFocus
                  required
                />
              </div>
              
              <div className="flex items-center gap-4 text-[#241B14] dark:text-[#F4F4F5] font-sans text-[14px]">
                <Clock size={16} className="text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]" />
                <input 
                  type="date"
                  value={newEventDate}
                  onChange={e => setNewEventDate(e.target.value)}
                  className="border border-[rgba(36,27,20,0.12)] dark:border-[rgba(255,255,255,0.12)] bg-transparent rounded-md px-3 py-1.5 focus:outline-none focus:border-[#1A73E8]"
                  required
                />
                <input 
                  type="time"
                  value={newEventTime}
                  onChange={e => setNewEventTime(e.target.value)}
                  className="border border-[rgba(36,27,20,0.12)] dark:border-[rgba(255,255,255,0.12)] bg-transparent rounded-md px-3 py-1.5 focus:outline-none focus:border-[#1A73E8]"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)]">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 font-sans font-medium text-[13px] text-[rgba(36,27,20,0.6)] dark:text-[rgba(255,255,255,0.6)] hover:bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.04)] rounded-[8px] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 bg-[#1A73E8] text-white font-sans font-medium text-[13px] rounded-[8px] hover:bg-[#1557B0] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isCreating ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : null}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
