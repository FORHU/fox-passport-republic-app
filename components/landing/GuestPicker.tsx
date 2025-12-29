// src/components/GuestPicker.tsx
import { Minus, Plus } from "lucide-react";
import { GuestCounts, GuestType } from "@/hooks/useSearchForm";

interface Props {
  counts: GuestCounts;
  onChange: (type: GuestType, delta: number) => void;
}

export default function GuestPicker({ counts, onChange }: Props) {
  
  // Helper Component for a single Row
  const CounterRow = ({ 
    type, 
    label, 
    subLabel, 
    value, 
    disableDec 
  }: { 
    type: GuestType; 
    label: string; 
    subLabel: string; 
    value: number; 
    disableDec: boolean; 
  }) => (
    <div className="flex items-center justify-between py-3 md:py-4 border-b border-gray-100 last:border-0">
      {/* Label Section */}
      <div className="flex flex-col items-start text-left"> 
        <span className="font-semibold text-gray-800 text-sm">{label}</span>
        <span className="text-gray-400 text-[10px] md:text-xs">{subLabel}</span>
      </div>
      
      {/* Controls Section */}
      <div className="flex items-center gap-3">
        {/* Minus Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onChange(type, -1); }}
          disabled={disableDec}
          className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all
            ${disableDec 
              ? "border-gray-200 text-gray-300 cursor-not-allowed" 
              : "border-gray-400 text-gray-600 hover:border-black hover:text-black"
            }`}
        >
          <Minus className="w-3 h-3" strokeWidth={2.5} />
        </button>

        {/* Count Value */}
        <span className="w-6 text-center text-sm font-medium text-gray-700">
          {value}
        </span>

        {/* Plus Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onChange(type, 1); }}
          className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-400 text-gray-600 hover:border-black hover:text-black transition-all"
        >
          <Plus className="w-3 h-3" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );

  return (
    // MOBILE: w-full, left-0 (Matches search bar width)
    // DESKTOP: w-[350px], right-0 (Aligns to right edge)
    <div className="absolute top-full mt-3 z-50 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden p-5 md:p-6 animate-in fade-in zoom-in-95 duration-200 w-full left-0 md:w-[350px] md:left-auto md:right-0">
      
      <CounterRow 
        type="adults" 
        label="Adults" 
        subLabel="Ages 13 or above" 
        value={counts.adults} 
        disableDec={counts.adults <= 0} 
      />
      
      <CounterRow 
        type="children" 
        label="Children" 
        subLabel="Ages 2 – 12" 
        value={counts.children} 
        disableDec={counts.children <= 0} 
      />
      
      <CounterRow 
        type="infants" 
        label="Infants" 
        subLabel="Under 2" 
        value={counts.infants} 
        disableDec={counts.infants <= 0} 
      />
      
      <CounterRow 
        type="pets" 
        label="Pets" 
        subLabel="Service animal?" 
        value={counts.pets} 
        disableDec={counts.pets <= 0} 
      />

    </div>
  );
}