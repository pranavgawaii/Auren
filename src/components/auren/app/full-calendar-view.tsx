"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { getCalendarEvents } from "@/app/actions/get-events";

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  isDb?: boolean;
}

export function FullCalendarView() {
  const [dbEvents, setDbEvents] = useState<any[]>([]);

  useEffect(() => {
    async function loadEvents() {
      const res = await getCalendarEvents();
      if (res.success && res.data) {
        setDbEvents(res.data);
      }
    }
    loadEvents();
  }, []);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Map Sunday (0) to 6, Mon to 0

  return (
    <div className="flex-1 flex flex-col bg-[#FAF8F5] overflow-y-auto">
      {/* Header */}
      <div className="h-[80px] bg-white border-b border-[rgba(36,27,20,0.08)] flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-6">
          <h1 className="font-sans font-bold text-[24px] text-[#241B14] tracking-tight">Calendar</h1>
          <div className="flex items-center gap-2">
            <button onClick={handlePrevMonth} className="p-1.5 rounded-md hover:bg-[rgba(36,27,20,0.04)] text-[rgba(36,27,20,0.4)] hover:text-[#241B14] transition-colors">
              <ChevronLeft size={20} />
            </button>
            <span className="font-sans font-semibold text-[14px] text-[#241B14]">{monthNames[currentMonth]} {currentYear}</span>
            <button onClick={handleNextMonth} className="p-1.5 rounded-md hover:bg-[rgba(36,27,20,0.04)] text-[rgba(36,27,20,0.4)] hover:text-[#241B14] transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://calendar.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="h-[36px] px-4 border border-[rgba(36,27,20,0.08)] text-[rgba(36,27,20,0.6)] rounded-[8px] font-sans font-semibold text-[13px] flex items-center gap-2 hover:bg-[rgba(36,27,20,0.02)] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
            Google Calendar
          </a>
          <button className="h-[36px] px-4 bg-[#E8593C] text-white rounded-[8px] font-sans font-semibold text-[13px] flex items-center gap-2 hover:bg-[#D14F31] transition-colors shadow-sm">
            <Plus size={16} />
            New Event
          </button>
        </div>
      </div>

      {/* Placeholder Grid */}
      <div className="flex-1 p-8 max-w-[1200px] w-full mx-auto">
        <div className="bg-white rounded-[16px] border border-[rgba(36,27,20,0.08)] shadow-[0_8px_30px_rgba(36,27,20,0.02)] h-full min-h-[600px] flex flex-col overflow-hidden">
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-[rgba(36,27,20,0.08)] bg-[#FDFBF9]">
            {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day, i) => (
              <div key={day} className="py-3 px-4 font-sans font-semibold text-[11px] text-[rgba(36,27,20,0.4)] uppercase tracking-wider border-r border-[rgba(36,27,20,0.04)] last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Body */}
          <div className="flex-1 grid grid-cols-7 grid-rows-5">
            {Array.from({ length: 35 }).map((_, i) => {
              const dayNum = i - startDayIndex + 1;
              const isToday = dayNum === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
              const isValidDay = dayNum > 0 && dayNum <= daysInMonth;
              
              const dayDbEvents = isValidDay ? dbEvents.filter(e => {
                const eDate = new Date(e.startAt);
                return eDate.getDate() === dayNum && eDate.getMonth() === currentMonth && eDate.getFullYear() === currentYear;
              }) : [];

              return (
                <div key={i} className={`p-2 border-r border-b border-[rgba(36,27,20,0.04)] ${!isValidDay ? 'bg-[#FAF8F5] opacity-50' : ''}`}>
                  {isValidDay && (
                    <div className="flex flex-col h-full gap-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-sans font-semibold text-[12px] mb-1 ${isToday ? 'bg-[#E8593C] text-white' : 'text-[#241B14]'}`}>
                        {dayNum}
                      </div>
                      
                      {dayDbEvents.map(evt => (
                        <div key={evt.id} className="px-2 py-1 rounded-[4px] bg-[#E1F5EE] border-l-2 border-[#0F6E56] font-sans text-[10px] text-[#085041] truncate cursor-pointer hover:opacity-80">
                          {new Date(evt.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {evt.title}
                        </div>
                      ))}


                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
