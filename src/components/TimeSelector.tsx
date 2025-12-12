// src/components/TimeSelector.tsx
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  startTime: string;
  endTime: string;
  onChange: (start: string, end: string) => void;
}

export default function TimeSelector({ startTime, endTime, onChange }: Props) {
  // Helper to generate time options (e.g., "1:00 AM", "1:30 AM")
  const generateTimeOptions = () => {
    const times = [];
    const periods = ["AM", "PM"];
    for (const period of periods) {
      // 12 AM is 00:00, usually handled as 12
      let hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; 
      for (const hour of hours) {
        times.push(`${hour}:00 ${period}`);
        times.push(`${hour}:30 ${period}`);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  // Local state for dropdowns
  const [start, setStart] = useState(startTime || "10:00 AM");
  const [end, setEnd] = useState(endTime || "2:00 PM");

  // Sync with parent changes
  useEffect(() => {
    onChange(start, end);
  }, [start, end]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="p-4 bg-white border-t border-gray-100">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
        Event Time
      </h3>
      
      <div className="flex items-center gap-3">
        {/* Start Time */}
        <div className="flex-1">
          <label className="text-xs text-gray-400 font-semibold mb-1 block">Start</label>
          <div className="relative">
            <Clock className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
            <select
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-pink-500 appearance-none cursor-pointer"
            >
              {timeOptions.map((t) => (
                <option key={`start-${t}`} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-gray-300 mt-4">–</span>

        {/* End Time */}
        <div className="flex-1">
          <label className="text-xs text-gray-400 font-semibold mb-1 block">End</label>
          <div className="relative">
            <Clock className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
            <select
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-pink-500 appearance-none cursor-pointer"
            >
              {timeOptions.map((t) => (
                <option key={`end-${t}`} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}