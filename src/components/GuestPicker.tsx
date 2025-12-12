// src/components/GuestPicker.tsx
import { Minus, Plus } from "lucide-react";
import { GuestCounts, GuestType } from "@/src/hooks/useSearchForm";

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
  <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
    {/* Added 'items-start' and 'text-left' to force left alignment */}
    <div className="flex flex-col items-start text-left"> 
      <span className="font-semibold text-gray-800 text-sm">{label}</span>
      <span className="text-gray-400 text-xs">
        {type === 'pets' ? (
           /* Optional: "Bringing a service animal?" is typically underlined in this UI pattern */
           <span className="underline decoration-gray-400 cursor-pointer">{subLabel}</span>
        ) : (
           subLabel
        )}
      </span>
    </div>
    
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
    <div className="absolute top-16 right-0 w-[350px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 p-6 animate-in fade-in zoom-in-95 duration-200">
      
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
        subLabel="Bringing a service animal?" 
        value={counts.pets} 
        disableDec={counts.pets <= 0} 
      />

    </div>
  );
}