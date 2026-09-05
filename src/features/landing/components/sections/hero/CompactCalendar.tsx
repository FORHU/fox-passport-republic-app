"use client";

import { useState } from "react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function CompactCalendar({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (d: string) => void;
}) {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const [viewYear, setViewYear] = useState(
    value ? new Date(value + "T00:00:00").getFullYear() : today.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    value ? new Date(value + "T00:00:00").getMonth() : today.getMonth(),
  );

  const dim = new Date(viewYear, viewMonth + 1, 0).getDate();
  const offset = new Date(viewYear, viewMonth, 1).getDay();

  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
  };

  return (
    <div className="glass-card rounded-xl border border-white/10 p-3 w-[260px] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={prevMonth}
          className="h-7 w-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-[#ccff00] active:scale-90 transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[16px]">
            chevron_left
          </span>
        </button>
        <p className="text-xs font-bold text-[#ccff00] tracking-wide select-none">
          {MONTHS[viewMonth]} {viewYear}
        </p>
        <button
          type="button"
          onClick={nextMonth}
          className="h-7 w-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-[#ccff00] active:scale-90 transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[16px]">
            chevron_right
          </span>
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[9px] text-white/60 font-bold py-1 tracking-wider"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} className="h-8" />;
          const ds = toDateStr(viewYear, viewMonth, day);
          const past = ds < todayStr;
          const sel = ds === value;
          return (
            <button
              key={ds}
              type="button"
              disabled={past}
              onClick={() => onSelect(ds)}
              className={[
                "h-8 w-full text-[13px] font-semibold transition-all duration-150 flex items-center justify-center",
                sel
                  ? "bg-[#ccff00] text-black rounded-full z-10 shadow-[0_0_12px_rgba(204,255,0,0.4)] scale-105"
                  : "",
                !sel && !past
                  ? "text-white/90 hover:bg-white/10 hover:rounded-full hover:scale-105 cursor-pointer active:scale-95"
                  : "",
                past ? "text-white/20 cursor-not-allowed" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
