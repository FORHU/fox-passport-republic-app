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
  const router = useRouter(); // Initialize router
  const {
    where,
    selectedLocation,
    guestCounts,
    guestLabel,
    updateGuestCount,
    activeSection,
    startTime,
    endTime,
    handleTimeSelect,
    showDatePicker, setShowDatePicker,
    showLocationPicker, setShowLocationPicker,
    showGuestPicker, setShowGuestPicker,
    searchBarRef,
    formattedDates,
    openSection,
    handleDateSelect,
    handleLocationSelect
  } = useSearchForm();

  // Unified Search Handler
  const handleSearchAction = (e: React.MouseEvent) => {
    e.stopPropagation();

    // 1. If a parent provided a handler (like in the old Hero), use it.
    if (onSearchClick) {
      onSearchClick(selectedLocation);
    } 
    // 2. OTHERWISE (like in Navbar), push to URL so the Home page detects it.
    else if (selectedLocation) {
      const params = new URLSearchParams();
      params.set("location", selectedLocation.name);
      if (selectedLocation.province) params.set("province", selectedLocation.province);
      router.push(`/?${params.toString()}`);
    }
  };

  return (
    <div 
      ref={searchBarRef} 
      className={`relative flex w-full ${isHero ? "shadow-xl" : "shadow-lg"} rounded-full bg-white border border-gray-200 z-40 h-[50px] md:h-[66px]`}
    >
      {/* 1. WHERE */}
      <div 
        className={`relative flex-[1.5] min-w-0 flex flex-col justify-center px-4 md:px-6 py-2 md:py-3 cursor-pointer transition-all rounded-l-full hover:bg-gray-100 ${activeSection === 'where' ? 'bg-gray-100' : ''}`}
        onClick={() => openSection('where')}
      >
        <span className="text-[10px] md:text-xs font-bold text-gray-800 tracking-wide">Where</span>
        <div className="text-xs md:text-sm font-semibold text-gray-700 truncate pr-2 md:pr-4">
          {selectedLocation ? (
            <span className="text-gray-900">{selectedLocation.name}, {selectedLocation.province}</span>
          ) : (
            <span className="text-gray-400 font-normal">Search destinations</span>
          )}
        </div>
      </div>

      <div className="w-px bg-gray-200 my-2 md:my-3"></div>

      {/* 2. WHEN */}
      <div 
        className={`relative flex-1 min-w-0 flex flex-col justify-center px-4 md:px-6 py-2 md:py-3 cursor-pointer transition-all hover:bg-gray-100 ${activeSection === 'when' ? 'bg-gray-100' : ''}`}
        onClick={() => openSection('when')}
      >
        <span className="text-[10px] md:text-xs font-bold text-gray-800 tracking-wide">When</span>
        <div className={`text-xs md:text-sm font-semibold truncate ${formattedDates ? 'text-gray-900' : 'text-gray-400 font-normal'}`}>
          {formattedDates || "Add dates"}
        </div>
      </div>

      <div className="w-px bg-gray-200 my-2 md:my-3"></div>

      {/* 3. WHO */}
      <div 
        className={`relative flex-1 min-w-0 flex items-center justify-between pl-4 md:pl-6 pr-2 py-2 cursor-pointer transition-all rounded-r-full hover:bg-gray-100 ${activeSection === 'who' ? 'bg-gray-100' : ''}`}
        onClick={() => openSection('who')}
      >
        <div className="flex flex-col flex-1 min-w-0 mr-2">
          <span className="text-[10px] md:text-xs font-bold text-gray-800 tracking-wide">Who</span>
          <div className={`text-xs md:text-sm font-semibold truncate ${guestLabel ? 'text-gray-900' : 'text-gray-400 font-normal'}`}>
            {guestLabel || "Add guests"}
          </div>
        </div>
        
        {/* Search Button */}
        <button 
          onClick={handleSearchAction}
          className="bg-pink-600 hover:bg-pink-700 text-white p-2 md:p-3.5 rounded-full transition-all shadow-md hover:shadow-lg flex-shrink-0"
        >
          <Search className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* --- POPUPS --- */}
      {showLocationPicker && (
        <LocationPicker
          onSelectLocation={handleLocationSelect}
          onClose={() => setShowLocationPicker(false)}
        />
      )}

      {showDatePicker && (
        <div className="absolute top-16 left-0 md:-left-24 lg:left-0 w-full md:w-[850px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50 flex flex-col animate-in fade-in zoom-in-95 duration-200">
           <div className="p-6 flex justify-center relative">
              <DatePicker
                onSelectDates={handleDateSelect}
                onClose={() => {}} 
                inline={true} 
              />
           </div>
           
           <TimeSelector 
             startTime={startTime}
             endTime={endTime}
             onChange={handleTimeSelect}
           />
           
           <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
             <button className="text-sm font-semibold text-gray-500 hover:underline px-4">
               Clear dates
             </button>
             <button 
               onClick={() => { setShowDatePicker(false); openSection('who'); }}
               className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-full text-sm font-bold transition-transform active:scale-95"
             >
               Apply
             </button>
           </div>
        </div>
      )}

      {showGuestPicker && (
        <GuestPicker
          counts={guestCounts}
          onChange={updateGuestCount}
        />
      )}
    </div>
  );
}