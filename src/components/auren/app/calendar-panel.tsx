"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCalendarEvents } from "@/app/actions/get-events";

import { MapPin, Users, AlignLeft } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  dayIndex: number; // 0 (Mon) to 6 (Sun)
  isDb?: boolean;
  description?: string;
  location?: string;
  attendees?: any[];
}

// No mock events

export function CalendarPanel({ onClose }: { onClose?: () => void }) {
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
        attendees: evt.attendees
      };
    }).filter(evt => evt.dayIndex !== -1)
  ];

  return (
    <div className="w-full flex-1 flex flex-col bg-white overflow-hidden">
      
      {/* Header */}
      <div className="h-[56px] px-4 flex items-center justify-between border-b border-[rgba(36,27,20,0.08)] shrink-0">
        <div>
          <h2 className="font-sans font-semibold text-[14px] text-[#241B14]">Upcoming</h2>
          <div className="font-sans text-[12px] text-[rgba(36,27,20,0.35)] mt-[2px]">{dateRangeStr}</div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1.5 rounded-[8px] text-[rgba(36,27,20,0.4)] hover:bg-[rgba(36,27,20,0.04)] hover:text-[#241B14] transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Grid — scrollable */}
      <div className="flex-1 overflow-y-auto p-4" style={{ minHeight: 0 }}>
        <div className="flex flex-col gap-4">
          {days.map((day, index) => {
            const dayEvents = allEvents.filter(e => e.dayIndex === index);

            return (
              <div key={day.abbrev} className="flex flex-col gap-2">
                {/* Day Header */}
                <div className="flex items-center gap-2">
                  <span className="font-sans text-[10px] uppercase text-[rgba(36,27,20,0.35)] w-[28px]">
                    {day.abbrev}
                  </span>
                  <div className={cn(
                    "w-[24px] h-[24px] flex items-center justify-center font-sans font-bold text-[14px] rounded-full",
                    day.isToday ? "bg-[#E8593C] text-white" : "text-[#241B14]"
                  )}>
                    {day.date}
                  </div>
                </div>

                {/* Events */}
                <div className="ml-[36px] flex flex-col gap-1.5 min-h-[16px]">
                  {dayEvents.length > 0 ? (
                    dayEvents.map(event => {
                      const isExpanded = expandedId === event.id;
                      return (
                      <div 
                        key={event.id}
                        onClick={() => setExpandedId(isExpanded ? null : event.id)}
                        className={cn(
                          "rounded-lg p-2.5 cursor-pointer hover:opacity-90 transition-opacity border-l-2",
                          event.isDb 
                            ? "bg-[#E1F5EE] border-[#0F6E56] text-[#085041]" 
                            : "bg-[#FCE0D2] border-[#E8593C] text-[#241B14]"
                        )}
                      >
                        <div className="font-sans font-semibold text-[11px] mb-[2px]">{event.title}</div>
                        <div className={cn("font-sans text-[10px] font-medium", event.isDb ? "text-[#0F6E56]" : "text-[#E8593C]")}>
                          {event.time} {event.isDb && "(Synced)"}
                        </div>
                        
                        {isExpanded && (
                          <div className="mt-2 pt-2 border-t border-black/5 flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                            {event.description && (
                              <div className="flex items-start gap-1.5">
                                <AlignLeft size={12} className="mt-[2px] opacity-60 shrink-0" />
                                <span className="font-sans text-[10px] leading-[1.4] opacity-80 whitespace-pre-wrap">{event.description}</span>
                              </div>
                            )}
                            {event.location && (
                              <div className="flex items-center gap-1.5">
                                <MapPin size={12} className="opacity-60 shrink-0" />
                                <span className="font-sans text-[10px] opacity-80 truncate">{event.location}</span>
                              </div>
                            )}
                            {event.attendees && event.attendees.length > 0 && (
                              <div className="flex items-start gap-1.5">
                                <Users size={12} className="mt-[2px] opacity-60 shrink-0" />
                                <div className="flex flex-col gap-0.5">
                                  {event.attendees.map((att: any, i: number) => (
                                    <span key={i} className="font-sans text-[10px] opacity-80">{att.email}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {!event.description && !event.location && (!event.attendees || event.attendees.length === 0) && (
                              <span className="font-sans text-[10px] italic opacity-50">No additional details</span>
                            )}
                          </div>
                        )}
                      </div>
                    )})
                  ) : (
                    <div className="font-sans text-[11px] text-[rgba(36,27,20,0.35)] py-1">
                      No events
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
