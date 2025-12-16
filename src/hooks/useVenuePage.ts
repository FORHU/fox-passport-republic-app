// this hook is for /[id]/page.tsx
import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { HARDCODED_VENUES } from "@/src/data/hardcodedVenues";

export function useVenuePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;

  // --- 1. Fetch Data ---
  const venue = HARDCODED_VENUES.find((v) => v.id === id);

  // --- 2. Booking Logic ---
  const initialCheckIn = searchParams.get("checkIn") ? new Date(searchParams.get("checkIn")!) : null;
  const initialCheckOut = searchParams.get("checkOut") ? new Date(searchParams.get("checkOut")!) : null;
  const guestsParam = searchParams.get("guests");

  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: initialCheckIn,
    end: initialCheckOut,
  });

  const [nights, setNights] = useState(0);

  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      const diffTime = Math.abs(dateRange.end.getTime() - dateRange.start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setNights(diffDays > 0 ? diffDays : 1);
    } else {
      setNights(0);
    }
  }, [dateRange]);

  // --- 3. Gallery Logic ---
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Fallbacks for data
  const images = venue?.images?.length && venue.images.length >= 5 
    ? venue.images 
    : Array(5).fill(venue?.images?.[0] || "/placeholder.jpg");

  // Create Mock Rich Data for Sidebar
  const imageRichData = images.map((img, idx) => ({
    src: img,
    caption: idx === 0 
      ? `Welcome to ${venue?.title}. This is the main view showing the spacious living area and distinct architectural style.`
      : `A detailed look at area ${idx + 1} of the property. Every corner is designed with comfort and style in mind.`,
    photographer: idx % 2 === 0 ? "Verified Host Photo" : "Professional Photographer"
  }));

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isGalleryOpen) return;
    if (e.key === "Escape") closeGallery();
    if (e.key === "ArrowRight") setPhotoIndex((prev) => (prev + 1) % images.length);
    if (e.key === "ArrowLeft") setPhotoIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [isGalleryOpen, images.length]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const openGallery = (index: number) => {
    setPhotoIndex(index);
    setIsGalleryOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
    document.body.style.overflow = "auto";
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev + 1) % images.length);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // --- 4. Calculations & Derived Data ---
  const host = venue?.host || { name: "Host", avatar: "", isSuperhost: false, joined: "Joined 2023" };
  const ratingCats = venue?.ratingCategories || { cleanliness: 4.8, accuracy: 4.8, checkIn: 4.9, communication: 4.9, location: 4.8, value: 4.8 };
  
  const displayActivities = (venue?.activities && venue.activities.length > 0) 
    ? venue.activities 
    : [ "Explore local landmarks", "Visit nearby cafes", "Walk around the city center", "Discover hidden gems" ];

  const price = venue?.price || 0;
  const stayTotal = price * (nights || 1);
  const serviceFee = Math.round(stayTotal * 0.12);
  const grandTotal = stayTotal + serviceFee;

  const formatDate = (date: Date | null) => {
    if (!date) return "Add date";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return {
    venue,
    loading: !venue,
    booking: {
      dateRange,
      setDateRange,
      guestsParam,
      nights,
      formatDate,
      stayTotal,
      serviceFee,
      grandTotal,
    },
    gallery: {
      isOpen: isGalleryOpen,
      open: openGallery,
      close: closeGallery,
      index: photoIndex,
      next: nextPhoto,
      prev: prevPhoto,
      richData: imageRichData,
      images, // raw images
    },
    details: {
      host,
      ratingCats,
      displayActivities,
    }
  };
}