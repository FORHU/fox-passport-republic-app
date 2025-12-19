// src/components/DatePicker.tsx
"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Keyboard } from "lucide-react";

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

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    onSelectDates(null, null);
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
      <div className="w-[300px] md:w-[340px] shrink-0">
        <h3 className="font-bold text-gray-800 text-base md:text-lg text-center mb-6">
          {baseDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>

        <div className="grid grid-cols-7 mb-4">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
            <span key={idx} className="text-center text-xs font-bold text-gray-500">
              {day}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}
          
          {daysArray.map((day) => {
            const current = new Date(year, month, day);
            const selected = isSelected(current);
            const inRange = isInRange(current);
            const isDisabled = current < today;
            const isStart = startDate && current.getTime() === startDate.getTime();
            const isEnd = endDate && current.getTime() === endDate.getTime();

            return (
              <div key={day} className="relative w-full aspect-square flex items-center justify-center">
                 {!isDisabled && inRange && <div className="absolute inset-y-1 w-full bg-gray-50" />}
                 {!isDisabled && isStart && endDate && <div className="absolute inset-y-1 right-0 w-1/2 bg-gray-50" />}
                 {!isDisabled && isEnd && startDate && <div className="absolute inset-y-1 left-0 w-1/2 bg-gray-50" />}

                <button
                  onClick={() => handleDayClick(current)}
                  disabled={isDisabled}
                  className={`relative z-10 w-9 h-9 md:w-11 md:h-11 rounded-full text-sm font-semibold flex items-center justify-center transition-all
                    ${
                      isDisabled
                        ? "text-gray-300 cursor-not-allowed"
                        : selected 
                          ? "bg-black text-white shadow-sm" 
                          : inRange 
                            ? "text-gray-900 bg-gray-50 hover:bg-gray-100" 
                            : "text-gray-700 hover:bg-gray-50"
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

  const containerClasses = inline
    ? "w-full bg-white flex flex-col items-start px-2 py-4" 
    : "absolute top-full left-0 md:-left-24 mt-3 w-full md:w-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 z-50 transition-all";

  return (
    <div className={containerClasses} onClick={(e) => e.stopPropagation()}>
      
      {/* HEADER SECTION (Agoda Style) */}
      <div className="mb-8 w-full">
         <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">Select check-in date</h2>
         <p className="text-gray-500 text-sm md:text-base">Add your travel dates for exact pricing</p>
      </div>

      <div className="relative w-full">
        {/* Navigation Arrows - Far left and far right */}
        <div className="absolute top-1 md:top-2 w-full flex justify-between items-center z-20 pointer-events-none">
          <button onClick={() => changeMonth(-1)} className="p-2 text-gray-400 hover:text-gray-800 pointer-events-auto transition">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => changeMonth(1)} className="p-2 text-gray-400 hover:text-gray-800 pointer-events-auto transition">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Grid Container */}
        <div className="flex flex-col md:flex-row gap-12 justify-center">
          {renderMonthGrid(viewDate)}
          <div className="hidden md:block w-px bg-gray-100 self-stretch" />
          <div className="hidden md:block">
             {renderMonthGrid(nextMonthDate)}
          </div>
        </div>
      </div>

      {/* FOOTER SECTION (Agoda Style) */}
      <div className="mt-8 flex items-center justify-between w-full border-t border-gray-100 pt-6">
         <Keyboard className="w-6 h-6 text-gray-800 cursor-pointer" />
         <div className="flex items-center gap-6">
            <button onClick={handleClear} className="text-sm font-bold underline text-gray-800 hover:text-black">
              Clear dates
            </button>
            {!inline && (
              <button onClick={onClose} className="bg-black text-white px-6 py-2 rounded-full text-sm font-bold shadow-sm hover:bg-gray-800">
                Close
              </button>
            )}
         </div>
      </div>
    </div>
  );
}
