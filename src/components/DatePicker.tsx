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

  // Get "Today" with time stripped to ensure accurate comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // --- HELPERS ---
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handleDayClick = (date: Date) => {
    // Prevent clicking if date is in the past
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
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    
    // Optional: Prevent going back past the current month
    // if (offset < 0 && newDate.getMonth() < today.getMonth() && newDate.getFullYear() <= today.getFullYear()) return;
    
    setViewDate(newDate);
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

  // --- RENDER A SINGLE MONTH GRID ---
  const renderMonthGrid = (baseDate: Date) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const daysArray = [...Array(daysInMonth).keys()].map((i) => i + 1);
    const emptyDays = [...Array(firstDay).keys()];

    return (
      <div className="w-[320px]">
        <h3 className="font-bold text-gray-800 text-base text-center mb-4">
          {baseDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>

        {/* Weekday Labels */}
        <div className="grid grid-cols-7 mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <span key={day} className="text-center text-xs font-semibold text-gray-400">
              {day}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-1 gap-x-0">
          {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}
          
          {daysArray.map((day) => {
            const current = new Date(year, month, day);
            const selected = isSelected(current);
            const inRange = isInRange(current);
            
            // Check if date is in the past
            const isDisabled = current < today;

            // Styling logic for range connectors
            const isStart = startDate && current.getTime() === startDate.getTime();
            const isEnd = endDate && current.getTime() === endDate.getTime();

            return (
              <div key={day} className="relative w-full aspect-square flex items-center justify-center py-0.5">
                 {/* Range Backgrounds (Only show if not disabled) */}
                 {!isDisabled && inRange && <div className="absolute inset-y-1 w-full bg-gray-100" />}
                 {!isDisabled && isStart && endDate && <div className="absolute inset-y-1 right-0 w-1/2 bg-gray-100" />}
                 {!isDisabled && isEnd && startDate && <div className="absolute inset-y-1 left-0 w-1/2 bg-gray-100" />}

                <button
                  onClick={() => handleDayClick(current)}
                  disabled={isDisabled}
                  className={`relative z-10 w-10 h-10 rounded-full text-sm font-semibold flex items-center justify-center transition-all
                    ${
                      isDisabled
                        ? "text-gray-300 cursor-not-allowed hover:bg-transparent" // Disabled Style
                        : selected 
                          ? "bg-black text-white hover:bg-gray-800 shadow-md" 
                          : inRange 
                            ? "text-gray-900 bg-gray-100 hover:bg-gray-200" 
                            : "text-gray-700 hover:bg-gray-100 hover:border-gray-200 border border-transparent"
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

  // --- MAIN RENDER ---
  const nextMonthDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);

  const containerClasses = inline
    ? "w-full bg-white flex flex-col items-center" 
    : "absolute top-16 left-0 bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 z-50";

  return (
    <div className={containerClasses} onClick={(e) => e.stopPropagation()}>
      
      {/* Navigation Header */}
      <div className="w-full flex justify-between items-center px-4 absolute top-6 z-20 pointer-events-none">
        <button 
          onClick={() => changeMonth(-1)} 
          // Optional: Disable back button if checking previous month (requires more logic), 
          // but clicking previous days is already disabled so this is fine.
          className="p-2 bg-white hover:bg-gray-100 rounded-full shadow-sm border border-gray-100 pointer-events-auto transition-transform hover:scale-105"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <button 
          onClick={() => changeMonth(1)} 
          className="p-2 bg-white hover:bg-gray-100 rounded-full shadow-sm border border-gray-100 pointer-events-auto transition-transform hover:scale-105"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Dual Calendar Container */}
      <div className="flex flex-col md:flex-row gap-8 pt-2 pb-4">
        {renderMonthGrid(viewDate)}
        <div className="hidden md:block w-px bg-gray-100" />
        {renderMonthGrid(nextMonthDate)}
      </div>

      {!inline && (
        <div className="mt-4 flex justify-end border-t border-gray-100 pt-4 w-full">
          <button onClick={onClose} className="text-sm font-semibold underline text-gray-500 hover:text-gray-800">
            Close
          </button>
        </div>
      )}
    </div>
  );
}