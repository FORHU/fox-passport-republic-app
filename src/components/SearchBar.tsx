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
    showDatePicker, setShowDatePicker, showLocationPicker, setShowLocationPicker,
    showGuestPicker, setShowGuestPicker, searchBarRef, formattedDates,
    openSection, handleDateSelect, handleLocationSelect
  } = useSearchForm();

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
      className={`relative flex w-full ${isHero ? "shadow-lg" : "shadow-md"} rounded-full bg-white border border-gray-200 z-40 h-[48px] md:h-[66px]`}
    >
      {/* 1. WHERE */}
      <div 
        className={`relative flex-1 min-w-0 flex flex-col justify-center px-5 py-1.5 cursor-pointer transition-all rounded-full md:rounded-l-full md:rounded-r-none hover:bg-gray-100 ${activeSection === 'where' ? 'bg-gray-100' : ''}`}
        onClick={() => openSection('where')}
      >
        <span className="hidden md:block text-xs font-bold text-gray-800 tracking-wide uppercase">Where</span>
        <div className="text-xs md:text-sm font-semibold text-gray-700 truncate pr-8 md:pr-4 flex items-center h-full">
          {selectedLocation ? (
            <span className="text-gray-900">{selectedLocation.name}</span>
          ) : (
            <span className="text-gray-900 md:text-gray-400 font-medium md:font-normal text-sm md:text-sm">
               <span className="md:hidden">Where to?</span>
               <span className="hidden md:inline">Search destinations</span>
            </span>
          )}
        </div>
      </div>

      <div className="hidden md:block w-px bg-gray-200 my-3"></div>

      {/* 2. WHEN (Desktop) */}
      <div 
        className={`hidden md:flex relative flex-1 min-w-0 flex-col justify-center px-6 py-2 cursor-pointer transition-all hover:bg-gray-100 ${activeSection === 'when' ? 'bg-gray-100' : ''}`}
        onClick={() => openSection('when')}
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
        onClick={() => openSection('who')}
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
        <LocationPicker onSelectLocation={handleLocationSelect} onClose={() => setShowLocationPicker(false)} />
      )}
      
      {showDatePicker && (
        // MOBILE OPTIMIZED CONTAINER
        // max-h-[85vh] and overflow-y-auto ensure scrolling on small screens
        <div className="absolute top-16 left-0 w-full md:w-[850px] bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden z-50 flex flex-col max-h-[85vh] overflow-y-auto custom-scrollbar">
           
           {/* 1. CALENDAR */}
           <div className="p-4 md:p-6">
              <DatePicker 
                onSelectDates={handleDateSelect} 
                onClose={()=>{}} 
                inline={true} 
              />
           </div>

           {/* 2. TIME SELECTOR (Now explicitly included below calendar) */}
           <TimeSelector 
              startTime={startTime} 
              endTime={endTime} 
              onChange={handleTimeSelect} 
           />

           {/* 3. FOOTER ACTIONS */}
           <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50 sticky bottom-0 z-10">
             <button 
               className="text-xs md:text-sm font-semibold text-gray-500 hover:underline px-2"
               onClick={() => { /* Clear logic */ }}
             >
               Clear
             </button>
             <button 
               onClick={() => { setShowDatePicker(false); openSection('who'); }} 
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