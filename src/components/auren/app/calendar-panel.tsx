"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCalendarEvents } from "@/app/actions/get-events";

import { MapPin, Users } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  dayIndex: number; // 0 (Mon) to 6 (Sun)
  isDb?: boolean;
  description?: string;
  location?: string;
  attendees?: any[];
  zoomLink?: string;
  htmlLink?: string;
}

// No mock events

export function CalendarPanel({ onClose }: { onClose?: () => void }) {
  const [dbEvents, setDbEvents] = useState<any[]>([]);

  // Compute upcoming 30 days starting from today
  const today = new Date();
  const days = Array.from({ length: 30 }).map((_, index) => {
    const d = new Date(today);
    d.setDate(today.getDate() + index);
    
    const abbrevs = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const isToday = d.toDateString() === today.toDateString();
    
    return {
      abbrev: abbrevs[d.getDay()],
      date: d.getDate(),
      isToday,
      rawDate: d,
    };
  });

  useEffect(() => {
    async function loadEvents() {
      const res = await getCalendarEvents();
      if (res.success && res.data) {
        setDbEvents(res.data);
      }
    }
    loadEvents();
  }, []);

  // Format date range header
  const startMonth = today.toLocaleDateString([], { month: 'short' });
  const startDate = today.getDate();
  const endDateObj = days[29].rawDate;
  const endMonth = endDateObj.toLocaleDateString([], { month: 'short' });
  const endDate = endDateObj.getDate();
  const dateRangeStr = startMonth === endMonth 
    ? `${startMonth} ${startDate} - ${endDate}`
    : `${startMonth} ${startDate} - ${endMonth} ${endDate}`;

  // Use only database events
  const allEvents: CalendarEvent[] = [
    ...dbEvents.map((evt: any) => {
      const start = new Date(evt.startAt);
      const dayIdx = days.findIndex(day => 
        day.rawDate.getFullYear() === start.getFullYear() &&
        day.rawDate.getMonth() === start.getMonth() &&
        day.rawDate.getDate() === start.getDate()
      );
      
      const timeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return {
        id: evt.id,
        title: evt.title,
        time: timeStr,
        dayIndex: dayIdx,
        isDb: true,
        description: evt.description,
        location: evt.location,
        attendees: evt.attendees,
        zoomLink: evt.zoomLink,
        htmlLink: evt.htmlLink
      };
    }).filter(evt => evt.dayIndex !== -1)
  ];

  return (
    <div className="w-full flex-1 flex flex-col bg-white dark:bg-[#383838] overflow-hidden">
      
      {/* Header */}
      <div className="h-[56px] px-4 flex items-center justify-between border-b border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] shrink-0">
        <div>
          <h2 className="font-sans font-semibold text-[14px] text-[#241B14] dark:text-[#F4F4F5]">Upcoming</h2>
          <div className="font-sans text-[12px] text-[rgba(36,27,20,0.35)] dark:text-[rgba(255,255,255,0.35)] mt-[2px]">{dateRangeStr}</div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1.5 rounded-[8px] text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] hover:bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.04)] hover:text-[#241B14] dark:text-[#F4F4F5] transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Grid — scrollable */}
      <div className="flex-1 overflow-y-auto p-4" style={{ minHeight: 0 }}>
        <div className="flex flex-col gap-4">
          {days
            .map((day, index) => ({ day, index, dayEvents: allEvents.filter(e => e.dayIndex === index) }))
            .filter(({ dayEvents }) => dayEvents.length > 0)
            .map(({ day, index, dayEvents }) => {
            return (
              <div key={index} className="flex flex-col gap-2">
                {/* Day Header */}
                <div className="flex items-center gap-2">
                  <span className="font-sans text-[10px] uppercase text-[rgba(36,27,20,0.35)] dark:text-[rgba(255,255,255,0.35)] w-[28px]">
                    {day.abbrev}
                  </span>
                  <div className={cn(
                    "w-[24px] h-[24px] flex items-center justify-center font-sans font-bold text-[14px] rounded-full",
                    day.isToday ? "bg-[#E8593C] text-white" : "text-[#241B14] dark:text-[#F4F4F5]"
                  )}>
                    {day.date}
                  </div>
                  {day.isToday && (
                    <span className="font-sans text-[9px] font-bold uppercase tracking-widest text-[#E8593C] ml-1">Today</span>
                  )}
                </div>

                {/* Events */}
                <div className="ml-[36px] flex flex-col gap-1.5">
                  {dayEvents.map(event => {
                    const joinLink = event.zoomLink || event.htmlLink;
                    return (
                    <div 
                      key={event.id}
                      className={cn(
                        "rounded-lg p-2.5 border-l-2 group",
                        event.isDb 
                          ? "bg-[#E1F5EE] dark:bg-[#0F6E56]/20 border-[#0F6E56] dark:border-[#0F6E56]/50 text-[#085041] dark:text-[#E1F5EE]" 
                          : "bg-[#FCE0D2] dark:bg-[#E8593C]/20 border-[#E8593C] dark:border-[#E8593C]/50 text-[#241B14] dark:text-[#FCE0D2]"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-sans font-semibold text-[11px] mb-[2px] truncate">{event.title}</div>
                          <div className={cn("font-sans text-[10px] font-medium", event.isDb ? "text-[#0F6E56] dark:text-[#52D1AD]" : "text-[#E8593C] dark:text-[#FF8C73]")}>
                            {event.time}
                          </div>
                          {event.location && (
                            <div className="font-sans text-[9px] opacity-70 mt-0.5 flex items-center gap-1 truncate">
                              <MapPin size={8} className="shrink-0" />
                              {event.location}
                            </div>
                          )}
                          {event.attendees && event.attendees.length > 0 && (
                            <div className="font-sans text-[9px] opacity-70 mt-0.5 flex items-center gap-1">
                              <Users size={8} className="shrink-0" />
                              {event.attendees.length} attendee{event.attendees.length !== 1 ? "s" : ""}
                            </div>
                          )}
                        </div>
                        {joinLink && (
                          <a
                            href={joinLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="shrink-0 flex items-center gap-1 px-2 py-1 bg-white/60 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 rounded-md font-sans font-semibold text-[9px] text-[#0F6E56] dark:text-[#52D1AD] transition-colors border border-[#0F6E56]/20"
                          >
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>
                            Join
                          </a>
                        )}
                      </div>
                    </div>
                  )})}
                </div>
              </div>
            );
          })}
          {allEvents.length === 0 && (
            <div className="py-8 text-center">
              <p className="font-sans text-[12px] text-[rgba(36,27,20,0.35)] dark:text-[rgba(255,255,255,0.35)]">No upcoming events</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
