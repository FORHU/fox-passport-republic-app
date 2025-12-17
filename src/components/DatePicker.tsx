// src/components/DatePicker.tsx
"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  onSelectDates: (start: Date | null, end: Date | null) => void;
  onClose: () => void;
  inline?: boolean;
}

export default function DatePicker({ onSelectDates, onClose, inline = false }: DatePickerProps) {
  const [viewDate, setViewDate] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // --- HELPERS ---
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handleDayClick = (date: Date) => {
    if (date < today) return;
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
      onSelectDates(date, null);
    } else {
      if (date < startDate) {
        setStartDate(date);
      } else {
        setEndDate(date);
        onSelectDates(startDate, date);
      }
    }
  };

  const changeMonth = (offset: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  const isSelected = (date: Date) => {
    if (!startDate) return false;
    if (date.getTime() === startDate.getTime()) return true;
    if (endDate && date.getTime() === endDate.getTime()) return true;
    return false;
  };

  const isInRange = (date: Date) => {
    if (!startDate || !endDate) return false;
    return date > startDate && date < endDate;
  };

  const renderMonthGrid = (baseDate: Date) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const daysArray = [...Array(daysInMonth).keys()].map((i) => i + 1);
    const emptyDays = [...Array(firstDay).keys()];

    return (
      // Changed width to auto/full to fit mobile container
      <div className="w-[280px] md:w-[320px] shrink-0">
        <h3 className="font-bold text-gray-800 text-sm md:text-base text-center mb-4">
          {baseDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>

        <div className="grid grid-cols-7 mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <span key={day} className="text-center text-[10px] md:text-xs font-semibold text-gray-400">
              {day}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1 gap-x-0">
          {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}
          
          {daysArray.map((day) => {
            const current = new Date(year, month, day);
            const selected = isSelected(current);
            const inRange = isInRange(current);
            const isDisabled = current < today;
            const isStart = startDate && current.getTime() === startDate.getTime();
            const isEnd = endDate && current.getTime() === endDate.getTime();

            return (
              <div key={day} className="relative w-full aspect-square flex items-center justify-center py-0.5">
                 {!isDisabled && inRange && <div className="absolute inset-y-1 w-full bg-gray-100" />}
                 {!isDisabled && isStart && endDate && <div className="absolute inset-y-1 right-0 w-1/2 bg-gray-100" />}
                 {!isDisabled && isEnd && startDate && <div className="absolute inset-y-1 left-0 w-1/2 bg-gray-100" />}

                <button
                  onClick={() => handleDayClick(current)}
                  disabled={isDisabled}
                  className={`relative z-10 w-8 h-8 md:w-10 md:h-10 rounded-full text-xs font-semibold flex items-center justify-center transition-all
                    ${
                      isDisabled
                        ? "text-gray-300 cursor-not-allowed hover:bg-transparent"
                        : selected 
                          ? "bg-black text-white hover:bg-gray-800 shadow-md" 
                          : inRange 
                            ? "text-gray-900 bg-gray-100 hover:bg-gray-200" 
                            : "text-gray-700 hover:bg-gray-100 border border-transparent"
                    }
                  `}
                >
                  {day}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const nextMonthDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);

  // Responsive container logic
  const containerClasses = inline
    ? "w-full bg-white flex flex-col items-center relative" 
    : "absolute top-full left-0 md:-left-24 mt-3 w-[calc(100vw-2rem)] md:w-auto max-w-[850px] bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 md:p-6 z-50 overflow-hidden";

  return (
    <div className={containerClasses} onClick={(e) => e.stopPropagation()}>
      
      {/* Navigation */}
      <div className="w-full flex justify-between items-center px-2 md:px-4 absolute top-4 md:top-6 z-20 pointer-events-none">
        <button onClick={() => changeMonth(-1)} className="p-1.5 md:p-2 bg-white hover:bg-gray-100 rounded-full shadow-sm border border-gray-100 pointer-events-auto">
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <button onClick={() => changeMonth(1)} className="p-1.5 md:p-2 bg-white hover:bg-gray-100 rounded-full shadow-sm border border-gray-100 pointer-events-auto">
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Grid Container */}
      <div className="flex flex-col md:flex-row gap-8 pt-2 pb-4 justify-center items-center">
        {renderMonthGrid(viewDate)}
        <div className="hidden md:block w-px bg-gray-100 self-stretch" />
        <div className="hidden md:block">
           {renderMonthGrid(nextMonthDate)}
        </div>
      </div>

      {!inline && (
        <div className="mt-2 flex justify-end border-t border-gray-100 pt-3 w-full">
          <button onClick={onClose} className="text-sm font-semibold underline text-gray-500 hover:text-gray-800">
            Close
          </button>
        </div>
      )}
    </div>
  );
}