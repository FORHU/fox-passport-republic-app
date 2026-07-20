'use client';

import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

export function diffDays(start: string, end: string): number {
  if (!start || !end) return 1;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-PH', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

const WEEKDAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function CompactDatePicker({
  startValue, endValue, onStartChange, onEndChange, onDone,
}: {
  startValue: string; endValue: string;
  onStartChange: (d: string) => void; onEndChange: (d: string) => void;
  onDone: () => void;
}) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const dim = daysInMonth(viewYear, viewMonth);
  const offset = firstDayOfMonth(viewYear, viewMonth);

  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const handleClick = (ds: string) => {
    if (ds < todayStr) return;
    if (!startValue || (startValue && endValue)) {
      onStartChange(ds);
      onEndChange('');
      return;
    }
    if (ds < startValue) { onStartChange(ds); return; }
    onEndChange(ds);
    onDone();
  };

  const isSelected = (ds: string) => ds === startValue || ds === endValue;
  const isInRange = (ds: string) => startValue && endValue && ds > startValue && ds < endValue;

  return (
    <div className="bg-black/95 border border-white/10 rounded-2xl p-4 w-[280px] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="h-7 w-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-accent active:scale-90 transition-all duration-200 group"
        >
          <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-0.5 transition-transform duration-200">chevron_left</span>
        </button>
        <p className="text-xs font-bold text-accent tracking-wide select-none">{MONTHS[viewMonth]} {viewYear}</p>
        <button
          onClick={nextMonth}
          className="h-7 w-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-accent active:scale-90 transition-all duration-200 group"
        >
          <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform duration-200">chevron_right</span>
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[9px] text-white/60 font-bold py-1 tracking-wider">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} className="h-8" />;
          const ds = toDateStr(viewYear, viewMonth, day);
          const past = ds < todayStr;
          const sel = isSelected(ds);
          const inRange = isInRange(ds);

          return (
            <button
              key={ds}
              onClick={() => handleClick(ds)}
              disabled={past}
              className={[
                'h-8 w-full text-[13px] font-semibold transition-all duration-150 flex items-center justify-center',
                inRange ? 'bg-gradient-to-r from-accent/10 via-accent/15 to-accent/10' : '',
                sel ? 'bg-accent text-black rounded-full z-10 shadow-[0_0_12px_rgba(204,255,0,0.4)] scale-105' : '',
                !sel && !past ? 'text-white/90 hover:bg-white/10 hover:rounded-full hover:scale-105 cursor-pointer active:scale-95' : '',
                past ? 'text-white/20 cursor-not-allowed' : '',
                ds === todayStr && !sel ? 'ring-1 ring-white/70 rounded-full animate-pulse' : '',
              ].filter(Boolean).join(' ')}
            >
              {day}
            </button>
          );
        })}
      </div>

    </div>
  );
}

export default function DateRangePicker({
  startDate, endDate, onStartChange, onEndChange, errors, startLabel = 'Start Date', endLabel = 'End Date', showSummary = true, stacked = false,
}: {
  startDate: string;
  endDate: string;
  onStartChange: (d: string) => void;
  onEndChange: (d: string) => void;
  errors?: { dates?: string };
  startLabel?: string;
  endLabel?: string;
  showSummary?: boolean;
  stacked?: boolean;
}) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const toDisplay = (d: string) =>
    d
      ? new Date(d + 'T00:00:00').toLocaleDateString('en-PH', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '';
  const [localStart, setLocalStart] = useState(toDisplay(startDate));
  const [localEnd, setLocalEnd] = useState(toDisplay(endDate));

  const handleCalendarStart = (d: string) => {
    onStartChange(d);
    setLocalStart(toDisplay(d));
    setLocalEnd('');
  };

  const handleCalendarEnd = (d: string) => {
    onEndChange(d);
    setLocalEnd(toDisplay(d));
  };

  const parseDisplay = (val: string, setter: (d: string) => void) => {
    const cleaned = val.replace(/\//g, '-');
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) {
      setter(d.toISOString().split('T')[0]);
    }
  };

  const openCalendar = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).parentElement!.getBoundingClientRect();
    const CALENDAR_W = 280;
    const CALENDAR_H = 300;
    let top = rect.bottom + 4;
    let left = rect.right - CALENDAR_W;
    if (top + CALENDAR_H > window.innerHeight) {
      top = rect.top - CALENDAR_H - 4;
    }
    if (left < 8) left = 8;
    if (left + CALENDAR_W > window.innerWidth - 8) {
      left = window.innerWidth - CALENDAR_W - 8;
    }
    setPopupPos({ top, left });
    setCalendarOpen(true);
  };

  const days = diffDays(startDate, endDate);

  return (
    <div className="relative">
      <div className={stacked ? "grid grid-cols-1 gap-4" : "grid sm:grid-cols-2 gap-6"}>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-text-muted font-bold ml-1">{startLabel}</label>
          <div className="relative" ref={triggerRef}>
            <input
              type="text"
              value={localStart}
              placeholder="Select date"
              onChange={(e) => setLocalStart(e.target.value)}
              onBlur={(e) => parseDisplay(e.target.value, onStartChange)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all pr-12"
            />
            <span
              onClick={openCalendar}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 cursor-pointer material-symbols-outlined"
            >
              calendar_today
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-text-muted font-bold ml-1">{endLabel}</label>
          <div className="relative">
            <input
              type="text"
              value={localEnd}
              placeholder="Select date"
              onChange={(e) => setLocalEnd(e.target.value)}
              onBlur={(e) => parseDisplay(e.target.value, onEndChange)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all pr-12"
            />
            <span
              onClick={openCalendar}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 cursor-pointer material-symbols-outlined"
            >
              calendar_today
            </span>
          </div>
        </div>
      </div>

      {errors?.dates && (
        <p className="text-xs text-red-400 mt-3 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[13px]">error</span>
          {errors.dates}
        </p>
      )}
      {showSummary && startDate && endDate && !calendarOpen && (
        <p className="text-xs text-white/40 mt-3 flex items-center gap-1">
          <span className="material-symbols-outlined text-[12px]">info</span>
          {formatDate(startDate)} → {formatDate(endDate)} · {days} day{days !== 1 ? 's' : ''}
        </p>
      )}

      {calendarOpen && createPortal(
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setCalendarOpen(false)} />
          <div
            className="fixed z-[101] animate-in fade-in zoom-in-95 duration-150"
            style={{ top: popupPos.top, left: popupPos.left }}
          >
            <CompactDatePicker
              startValue={startDate}
              endValue={endDate}
              onStartChange={handleCalendarStart}
              onEndChange={handleCalendarEnd}
              onDone={() => setCalendarOpen(false)}
            />
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
