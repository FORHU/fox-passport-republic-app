// this hook is for SearchBar.tsx
import { useState, useEffect, useRef, useMemo } from "react";
import { LocationItem } from "@/data/location";

export type GuestType = "adults" | "children" | "infants" | "pets";

export interface GuestCounts {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

export function useSearchForm() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Search States
  const [where, setWhere] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  
  // Time States
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  const [guestCounts, setGuestCounts] = useState<GuestCounts>({
    adults: 0,
    children: 0,
    infants: 0,
    pets: 0,
  });

  // Toggles
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);

  const searchBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node)
      ) {
        setShowDatePicker(false);
        setShowLocationPicker(false);
        setShowGuestPicker(false);
        setActiveSection(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Updated Formatted Label (Dates + Times)
  const formattedDates = useMemo(() => {
    // 1. Format Dates
    let dateText = "";
    if (checkIn && checkOut) {
      dateText = `${checkIn.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${checkOut.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`;
    } else if (checkIn) {
      dateText = checkIn.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }

    // 2. Format Times
    let timeText = "";
    if (startTime && endTime) {
      timeText = `, ${startTime} - ${endTime}`;
    } else if (startTime) {
      timeText = `, ${startTime}`;
    }

    // 3. Combine
    return dateText ? `${dateText}${timeText}` : "";
  }, [checkIn, checkOut, startTime, endTime]);

  // ------------------------------------------------------------------
  // UPDATED: Simply show total guests (Adults + Children)
  // ------------------------------------------------------------------
  const guestLabel = useMemo(() => {
    const totalGuests = guestCounts.adults + guestCounts.children;
    
    // If absolutely no one is selected
    if (totalGuests === 0 && guestCounts.infants === 0 && guestCounts.pets === 0) {
      return "";
    }

    // If there are adults or children, just show "X guests"
    if (totalGuests > 0) {
      return `${totalGuests} guest${totalGuests !== 1 ? "s" : ""}`;
    }

    // Edge cases: If user only selected infants/pets without adults
    if (guestCounts.infants > 0) {
      return `${guestCounts.infants} infant${guestCounts.infants !== 1 ? "s" : ""}`;
    }
    if (guestCounts.pets > 0) {
      return `${guestCounts.pets} pet${guestCounts.pets !== 1 ? "s" : ""}`;
    }

    return "";
  }, [guestCounts]);

  const openSection = (section: string) => {
    setActiveSection(section);
    setShowDatePicker(section === "when");
    setShowLocationPicker(section === "where");
    setShowGuestPicker(section === "who");
  };

  const handleDateSelect = (start: Date | null, end: Date | null) => {
    setCheckIn(start);
    setCheckOut(end);
  };

  const handleTimeSelect = (start: string, end: string) => {
    setStartTime(start);
    setEndTime(end);
  };

  const handleLocationSelect = (location: LocationItem) => {
    setSelectedLocation(location);
    setWhere(location.name);
    setShowLocationPicker(false);
    openSection("when");
  };

  const updateGuestCount = (type: GuestType, delta: number) => {
    setGuestCounts((prev) => {
      const newValue = prev[type] + delta;
      if (newValue < 0) return prev;
      return { ...prev, [type]: newValue };
    });
  };

  return {
    where, setWhere,
    selectedLocation,
    checkIn, checkOut,
    startTime, setStartTime,
    endTime, setEndTime,
    guestCounts, updateGuestCount, guestLabel,
    activeSection,
    showDatePicker, setShowDatePicker,
    showLocationPicker, setShowLocationPicker,
    showGuestPicker, setShowGuestPicker,
    searchBarRef,
    formattedDates,
    openSection,
    handleDateSelect,
    handleTimeSelect,
    handleLocationSelect,
  };
}