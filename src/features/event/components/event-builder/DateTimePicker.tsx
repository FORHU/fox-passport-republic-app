'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface Props {
  value: string; // "YYYY-MM-DDTHH:MM" (datetime-local format)
  onChange: (val: string) => void;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function parseValue(val: string) {
  if (!val) return { year: null, month: null, day: null, hour: 12, minute: 0, ampm: 'PM' as 'AM'|'PM' };
  const [datePart, timePart] = val.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  let hour = 12, minute = 0, ampm: 'AM' | 'PM' = 'PM';
  if (timePart) {
    const [h, m] = timePart.split(':').map(Number);
    ampm = h >= 12 ? 'PM' : 'AM';
    hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    minute = m;
  }
  return { year, month: month - 1, day, hour, minute, ampm };
}

function buildValue(year: number, month: number, day: number, hour: number, minute: number, ampm: 'AM' | 'PM') {
  const h = ampm === 'PM' ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${year}-${pad(month + 1)}-${pad(day)}T${pad(h)}:${pad(minute)}`;
}

export default function DateTimePicker({ value, onChange }: Props) {
  const parsed = parseValue(value);

  const now = new Date();
  const [viewYear, setViewYear] = useState(parsed.year ?? now.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed.month ?? now.getMonth());
  const [selYear, setSelYear] = useState<number | null>(parsed.year);
  const [selMonth, setSelMonth] = useState<number | null>(parsed.month);
  const [selDay, setSelDay] = useState<number | null>(parsed.day);
  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(parsed.minute);
  const [ampm, setAmpm] = useState<'AM' | 'PM'>(parsed.ampm);

  const [open, setOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Sync internal state when value changes externally
  useEffect(() => {
    const p = parseValue(value);
    if (p.year !== null) {
      setSelYear(p.year); setSelMonth(p.month); setSelDay(p.day);
      setViewYear(p.year); setViewMonth(p.month!);
      setHour(p.hour); setMinute(p.minute); setAmpm(p.ampm);
    }
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (triggerRef.current?.contains(e.target as Node) || dropdownRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const handleScroll = () => setOpen(false);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [open]);

  const emitChange = (y: number | null, mo: number | null, d: number | null, h: number, min: number, ap: 'AM' | 'PM') => {
    if (y !== null && mo !== null && d !== null) {
      onChange(buildValue(y, mo, d, h, min, ap));
    }
  };

  const selectDay = (d: number) => {
    setSelYear(viewYear); setSelMonth(viewMonth); setSelDay(d);
    emitChange(viewYear, viewMonth, d, hour, minute, ampm);
  };

  const handleHour = (h: number) => {
    const clamped = Math.max(1, Math.min(12, h));
    setHour(clamped);
    emitChange(selYear, selMonth, selDay, clamped, minute, ampm);
  };

  const handleMinute = (m: number) => {
    const clamped = Math.max(0, Math.min(59, m));
    setMinute(clamped);
    emitChange(selYear, selMonth, selDay, hour, clamped, ampm);
  };

  const handleAmpm = (ap: 'AM' | 'PM') => {
    setAmpm(ap);
    emitChange(selYear, selMonth, selDay, hour, minute, ap);
  };

  const handleClear = () => {
    setSelYear(null); setSelMonth(null); setSelDay(null);
    onChange('');
  };

  const handleToday = () => {
    const t = new Date();
    const y = t.getFullYear(), mo = t.getMonth(), d = t.getDate();
    setViewYear(y); setViewMonth(mo);
    setSelYear(y); setSelMonth(mo); setSelDay(d);
    emitChange(y, mo, d, hour, minute, ampm);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(v => v - 1); }
    else setViewMonth(v => v - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(v => v + 1); }
    else setViewMonth(v => v + 1);
  };

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  const isSelected = (d: number) => d === selDay && viewMonth === selMonth && viewYear === selYear;
  const isToday = (d: number) => {
    const t = new Date();
    return d === t.getDate() && viewMonth === t.getMonth() && viewYear === t.getFullYear();
  };

  const displayLabel = (() => {
    if (selYear === null || selMonth === null || selDay === null) return null;
    const p = parseValue(value);
    if (!value) return null;
    const dateStr = `${MONTHS[selMonth].slice(0, 3)} ${selDay}, ${selYear}`;
    const h = p.hour, ap = p.ampm, min = p.minute;
    const timeStr = `${h}:${String(min).padStart(2, '0')} ${ap}`;
    return `${dateStr} · ${timeStr}`;
  })();

  const handleToggle = () => {
    if (!open && triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
    setOpen(o => !o);
  };

  const dropdown = open && triggerRect ? (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: triggerRect.bottom + 4,
        left: triggerRect.left,
        width: Math.max(triggerRect.width, 320),
        zIndex: 9999,
      }}
      className="bg-[#0f111a] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
    >
      {/* Calendar header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
          <ChevronLeft size={15} />
        </button>
        <span className="text-sm font-bold text-white">{MONTHS[viewMonth]} {viewYear}</span>
        <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 px-3 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-white/25 py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 px-3 pb-3 gap-y-0.5">
        {cells.map((d, i) => (
          <div key={i} className="flex items-center justify-center">
            {d ? (
              <button
                type="button"
                onClick={() => selectDay(d)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all
                  ${isSelected(d)
                    ? 'bg-accent text-black font-bold'
                    : isToday(d)
                    ? 'border border-accent/40 text-accent'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
              >
                {d}
              </button>
            ) : <div className="w-8 h-8" />}
          </div>
        ))}
      </div>

      {/* Time picker */}
      <div className="border-t border-white/5 px-4 py-3 flex items-center gap-3">
        <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider mr-1">Time</span>
        <div className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1.5 border border-white/8">
          <input
            type="number"
            min={1}
            max={12}
            value={String(hour).padStart(2, '0')}
            onChange={e => handleHour(Number(e.target.value))}
            className="w-7 bg-transparent text-center text-sm font-bold text-white focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="text-white/40 font-bold">:</span>
          <input
            type="number"
            min={0}
            max={59}
            value={String(minute).padStart(2, '0')}
            onChange={e => handleMinute(Number(e.target.value))}
            className="w-7 bg-transparent text-center text-sm font-bold text-white focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
        <div className="flex rounded-lg overflow-hidden border border-white/8">
          {(['AM', 'PM'] as const).map(ap => (
            <button
              key={ap}
              type="button"
              onClick={() => handleAmpm(ap)}
              className={`px-2.5 py-1.5 text-xs font-bold transition-all
                ${ampm === ap ? 'bg-accent text-black' : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'}`}
            >
              {ap}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/5 px-4 py-2.5 flex justify-between">
        <button type="button" onClick={handleClear} className="text-xs text-white/40 hover:text-white transition-colors font-medium">Clear</button>
        <button type="button" onClick={handleToday} className="text-xs text-accent font-bold hover:text-white transition-colors">Today</button>
      </div>
    </div>
  ) : null;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center gap-2 bg-white/5 px-4 py-3 rounded-xl border border-white/5 focus:border-accent/30 transition-colors text-left"
      >
        <span className="material-symbols-outlined text-white/50 text-[18px]">calendar_today</span>
        <span className={`text-sm flex-1 ${displayLabel ? 'text-white' : 'text-white/30'}`}>
          {displayLabel ?? 'Pick a date & time'}
        </span>
        <ChevronDown size={14} className={`text-white/30 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {mounted && createPortal(dropdown, document.body)}
    </div>
  );
}
