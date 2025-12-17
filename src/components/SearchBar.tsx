// src/components/SearchBar.tsx
"use client";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import DatePicker from "@/src/components/DatePicker";
import LocationPicker from "@/src/components/LocationPicker";
import GuestPicker from "@/src/components/GuestPicker";
import TimeSelector from "@/src/components/TimeSelector";
import { useSearchForm } from "@/src/hooks/useSearchForm";
import { LocationItem } from "@/src/data/location";

interface Props {
  isHero?: boolean;
  onSearchClick?: (location: LocationItem | null) => void;
}

export default function SearchBar({ isHero = false, onSearchClick }: Props) {
  const router = useRouter();
  
  const {
    where, selectedLocation, checkIn, checkOut, startTime, endTime, guestCounts,
    guestLabel, updateGuestCount, activeSection, handleTimeSelect,
    showDatePicker, setShowDatePicker, 
    showLocationPicker, setShowLocationPicker, // Ensure these are exposed from your hook
    showGuestPicker, setShowGuestPicker, 
    searchBarRef, formattedDates,
    openSection, handleDateSelect, handleLocationSelect
  } = useSearchForm();

  // Wrapper for selecting location - explicit close for safety
  const onLocationSelect = (loc: LocationItem) => {
    handleLocationSelect(loc);
    setShowLocationPicker(false);
  };

  const handleSearchAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSearchClick) { onSearchClick(selectedLocation); return; } 
    if (selectedLocation) {
        const params = new URLSearchParams();
        params.set("location", selectedLocation.name);
        router.push(`/?${params.toString()}`);
    }
  };

  return (
    <div 
      ref={searchBarRef} 
      className={`relative flex w-full ${isHero ? "shadow-lg" : "shadow-md"} rounded-full bg-white border border-gray-200 ${isHero ? "z-[100]" : "z-40"} h-[48px] md:h-[66px]`}
    >
      {/* 1. WHERE */}
      <div 
        className={`relative flex-1 min-w-0 flex flex-col justify-center px-6 py-2 cursor-pointer transition-all rounded-full md:rounded-l-full md:rounded-r-none hover:bg-gray-100 ${activeSection === 'where' ? 'bg-gray-100' : ''}`}
        onClick={(e) => {
           e.stopPropagation();
           openSection('where');
           setShowLocationPicker(true); // <--- OPEN PICKER
           setShowDatePicker(false);
           setShowGuestPicker(false);
        }}
      >
        <span className="hidden md:block text-xs font-bold text-gray-800 tracking-wide uppercase">Where</span>
        <div className={`text-sm font-semibold truncate ${selectedLocation ? 'text-gray-900' : 'text-gray-400 font-normal'}`}>
          {selectedLocation ? (
            <span className="text-gray-900">{selectedLocation.name}</span>
          ) : (
            <>
              <span className="md:hidden text-gray-900 font-medium">Where to?</span>
              <span className="hidden md:inline">Search destinations</span>
            </>
          )}
        </div>
      </div>

      <div className="hidden md:block w-px bg-gray-200 my-3"></div>

      {/* 2. WHEN (Desktop) */}
      <div 
        className={`hidden md:flex relative flex-1 min-w-0 flex-col justify-center px-6 py-2 cursor-pointer transition-all hover:bg-gray-100 ${activeSection === 'when' ? 'bg-gray-100' : ''}`}
        onClick={() => {
            openSection('when');
            setShowDatePicker(true); // Explicitly open date picker
            setShowLocationPicker(false);
        }}
      >
        <span className="text-xs font-bold text-gray-800 tracking-wide uppercase">When</span>
        <div className={`text-sm font-semibold truncate ${formattedDates ? 'text-gray-900' : 'text-gray-400 font-normal'}`}>
          {formattedDates || "Add dates"}
        </div>
      </div>

      <div className="hidden md:block w-px bg-gray-200 my-3"></div>

      {/* 3. WHO (Desktop) */}
      <div 
        className={`hidden md:flex relative flex-1 min-w-0 flex-col justify-center pl-6 pr-12 py-2 cursor-pointer transition-all rounded-r-full hover:bg-gray-100 ${activeSection === 'who' ? 'bg-gray-100' : ''}`}
        onClick={() => {
            openSection('who');
            setShowGuestPicker(true);
            setShowLocationPicker(false);
        }}
      >
        <span className="text-xs font-bold text-gray-800 tracking-wide uppercase">Who</span>
        <div className={`text-sm font-semibold truncate ${guestLabel ? 'text-gray-900' : 'text-gray-400 font-normal'}`}>
          {guestLabel || "Add guests"}
        </div>
      </div>

      {/* SEARCH BUTTON */}
      <div className="absolute right-1.5 top-1.5 md:top-2 md:right-2">
        <button 
          onClick={handleSearchAction}
          className="bg-pink-600 hover:bg-pink-700 text-white p-2 md:p-3.5 rounded-full transition-all shadow-md hover:shadow-lg flex items-center justify-center"
        >
          <Search className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* --- POPUPS --- */}
      {showLocationPicker && (
        <LocationPicker 
            onSelectLocation={onLocationSelect} 
            onClose={() => setShowLocationPicker(false)} 
        />
      )}
      
      {showDatePicker && (
        <div className="absolute top-full left-0 mt-4 w-full md:w-[850px] bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden z-[9999] flex flex-col max-h-[85vh] overflow-y-auto custom-scrollbar">
           <div className="p-4 md:p-6">
              <DatePicker 
                onSelectDates={handleDateSelect} 
                onClose={()=>{}} 
                inline={true} 
              />
           </div>
           <TimeSelector 
              startTime={startTime} 
              endTime={endTime} 
              onChange={handleTimeSelect} 
           />
           <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50 sticky bottom-0 z-10">
             <button 
               className="text-xs md:text-sm font-semibold text-gray-500 hover:underline px-2"
               onClick={() => { /* Clear logic */ }}
             >
               Clear
             </button>
             <button 
               onClick={() => { setShowDatePicker(false); openSection('who'); setShowGuestPicker(true); }} 
               className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-md"
             >
               Apply
             </button>
           </div>
        </div>
      )}
      
      {showGuestPicker && (
        <GuestPicker counts={guestCounts} onChange={updateGuestCount} />
      )}
    </div>
  );
}