'use client';

import React, { useState, useMemo } from 'react';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

// ── Single-date mode ─────────────────────────────────────────────────────────
interface SingleProps {
  mode: 'single';
  value: string;
  onChange: (date: string) => void;
  bookedDates: string[];
  accent?: 'orange' | 'purple' | 'lime';
}

// ── Multi-date mode (services — pick any number of individual dates) ──────────
interface MultiProps {
  mode: 'multi';
  values: string[];
  onChange: (dates: string[]) => void;
  bookedDates: string[];
  accent?: 'orange' | 'purple' | 'lime';
}

// ── Date-range mode (assets) ─────────────────────────────────────────────────
interface RangeProps {
  mode: 'range';
  startValue: string;
  endValue: string;
  onStartChange: (date: string) => void;
  onEndChange: (date: string) => void;
  bookedRanges: { startDate: string; endDate: string; bookedQty: number }[];
  totalQty: number;
  requestedQty: number;
  accent?: 'orange' | 'purple' | 'lime';
}

type Props = SingleProps | MultiProps | RangeProps;

const ACCENT_CLASSES = {
  orange: { sel: 'bg-orange-400 text-black shadow-[0_0_12px_rgba(251,146,60,0.4)]', ring: 'ring-orange-400/40', dot: 'bg-orange-400' },
  purple: { sel: 'bg-purple-400 text-black shadow-[0_0_12px_rgba(192,132,252,0.4)]', ring: 'ring-purple-400/40', dot: 'bg-purple-400' },
  lime:   { sel: 'bg-accent text-black shadow-[0_0_12px_rgba(204,255,0,0.4)]',      ring: 'ring-accent/40',    dot: 'bg-accent' },
};

export default function AvailabilityCalendar(props: Props) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const accent = ACCENT_CLASSES[props.accent ?? 'lime'];
  const dim = daysInMonth(viewYear, viewMonth);
  const offset = firstDayOfMonth(viewYear, viewMonth);

  const unavailableSet = useMemo(() => {
    if (props.mode === 'single' || props.mode === 'multi') {
      return new Set(props.bookedDates);
    }
    const { bookedRanges, totalQty, requestedQty } = props;
    const set = new Set<string>();
    for (let d = 1; d <= dim; d++) {
      const ds = toDateStr(viewYear, viewMonth, d);
      let booked = 0;
      for (const r of bookedRanges) {
        if (ds >= r.startDate && ds <= r.endDate) booked += r.bookedQty;
      }
      if (totalQty - booked < requestedQty) set.add(ds);
    }
    return set;
  }, [props, viewYear, viewMonth, dim]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const handleClick = (ds: string) => {
    if (ds < todayStr || unavailableSet.has(ds)) return;

    if (props.mode === 'single') {
      props.onChange(ds);
      return;
    }

    if (props.mode === 'multi') {
      const next = props.values.includes(ds)
        ? props.values.filter(d => d !== ds)
        : [...props.values, ds].sort();
      props.onChange(next);
      return;
    }

    // Range mode
    const { startValue, endValue } = props;
    if (!startValue || (startValue && endValue)) {
      props.onStartChange(ds);
      props.onEndChange('');
    } else {
      if (ds < startValue) {
        props.onStartChange(ds);
      } else {
        props.onEndChange(ds);
      }
    }
  };

  const isSelected = (ds: string) => {
    if (props.mode === 'single') return ds === props.value;
    if (props.mode === 'multi') return props.values.includes(ds);
    return ds === props.startValue || ds === props.endValue;
  };

  const isInRange = (ds: string) => {
    if (props.mode !== 'range') return false;
    const { startValue, endValue } = props;
    if (!startValue || !endValue) return false;
    return ds > startValue && ds < endValue;
  };

  const isRangeEdge = (ds: string, edge: 'start' | 'end') => {
    if (props.mode !== 'range') return false;
    return edge === 'start' ? ds === props.startValue : ds === props.endValue;
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-5 select-none">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>
        <p className="text-sm font-bold text-white tracking-wide">
          {MONTHS[viewMonth]} {viewYear}
        </p>
        <button
          onClick={nextMonth}
          className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[10px] text-white/25 font-bold uppercase py-1.5">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} className="h-9" />;
          const ds = toDateStr(viewYear, viewMonth, day);
          const past      = ds < todayStr;
          const unavail   = unavailableSet.has(ds);
          const sel       = isSelected(ds);
          const inRange   = isInRange(ds);
          const isToday   = ds === todayStr;
          const startEdge = isRangeEdge(ds, 'start');
          const endEdge   = isRangeEdge(ds, 'end');

          return (
            <button
              key={ds}
              onClick={() => handleClick(ds)}
              disabled={past || unavail}
              className={[
                'relative h-9 w-full text-xs font-bold transition-all flex items-center justify-center',
                inRange ? 'bg-white/5' : '',
                startEdge ? 'rounded-l-xl' : '',
                endEdge   ? 'rounded-r-xl' : '',
                (!startEdge && !endEdge && !inRange) ? 'rounded-xl' : '',
                sel ? `${accent.sel} rounded-xl z-10` : '',
                isToday && !sel ? 'ring-1 ring-white/40 rounded-xl' : '',
                !sel && !past && !unavail ? 'hover:bg-white/10 hover:rounded-xl cursor-pointer' : '',
                past ? 'text-white/15 cursor-not-allowed' : '',
                unavail && !past ? 'text-red-400/50 cursor-not-allowed' : '',
                !sel && !past && !unavail ? 'text-white/80' : '',
              ].filter(Boolean).join(' ')}
            >
              {day}
              {unavail && !past && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-red-400/70" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-4 pt-3 border-t border-white/8">
        <div className="flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-sm ${accent.dot}`} />
          <span className="text-[10px] text-white/35 font-medium">Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-red-500/30 ring-1 ring-red-400/30" />
          <span className="text-[10px] text-white/35 font-medium">
            {props.mode === 'range' ? 'Fully Booked' : 'Unavailable'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-white/5 ring-1 ring-white/30" />
          <span className="text-[10px] text-white/35 font-medium">Today</span>
        </div>
      </div>

      {/* Mode hints */}
      {props.mode === 'multi' && (
        <p className="text-[10px] text-white/25 text-center mt-2">
          {props.values.length === 0
            ? 'Tap dates to select — tap again to deselect'
            : `${props.values.length} date${props.values.length !== 1 ? 's' : ''} selected — tap to add or remove`}
        </p>
      )}
      {props.mode === 'range' && (
        <p className="text-[10px] text-white/25 text-center mt-2">
          {!props.startValue
            ? 'Click a date to set pickup'
            : !props.endValue
              ? 'Now click return date'
              : `${props.startValue} → ${props.endValue}`}
        </p>
      )}
    </div>
  );
}
