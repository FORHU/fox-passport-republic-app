// src/hooks/useVenuePage.ts
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { HARDCODED_VENUES } from "@/data/hardcodedVenues";

export function useVenuePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  // Safe access to ID (handling edge case where ID might be an array)
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  // --- 1. Fetch Data ---
  const venue = useMemo(() => HARDCODED_VENUES.find((v) => v.id === id), [id]);

  // --- 2. Booking Logic ---
  const initialCheckIn = searchParams.get("checkIn")
    ? new Date(searchParams.get("checkIn")!)
    : null;
  const initialCheckOut = searchParams.get("checkOut")
    ? new Date(searchParams.get("checkOut")!)
    : null;
  const guestsParam = searchParams.get("guests");

  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: initialCheckIn,
    end: initialCheckOut,
  });

  // Calculate nights
  const nights = useMemo(() => {
    if (dateRange.start && dateRange.end) {
      const diffTime = Math.abs(
        dateRange.end.getTime() - dateRange.start.getTime()
      );
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }
    return 0;
  }, [dateRange]);

  // --- 3. Gallery Logic ---
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Fallback Logic: Ensure we have at least 5 images for the grid
  const images = useMemo(() => {
    if (!venue) return [];
    const rawImages = venue.images || [];
    if (rawImages.length < 5) {
      const needed = 5 - rawImages.length;
      const filler = rawImages[0] || "/placeholder.jpg";
      return [...rawImages, ...Array(needed).fill(filler)];
    }
    return rawImages;
  }, [venue]);

  // Mock Rich Data for Sidebar
  const imageRichData = useMemo(
    () =>
      images.map((img, idx) => ({
        src: img,
        caption:
          idx === 0
            ? `Welcome to ${venue?.title}. This is the main view showing the spacious living area.`
            : `A detailed look at the property amenities. Every corner is designed with comfort in mind.`,
        photographer:
          idx % 2 === 0 ? "Verified Host Photo" : "Professional Photographer",
      })),
    [images, venue]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isGalleryOpen) return;
      if (e.key === "Escape") setIsGalleryOpen(false);
      if (e.key === "ArrowRight")
        setPhotoIndex((prev) => (prev + 1) % images.length);
      if (e.key === "ArrowLeft")
        setPhotoIndex((prev) => (prev - 1 + images.length) % images.length);
    },
    [isGalleryOpen, images.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll
  useEffect(() => {
    if (isGalleryOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isGalleryOpen]);

  const openGallery = (index: number) => {
    setPhotoIndex(index);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => setIsGalleryOpen(false);

  const nextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPhotoIndex((prev) => (prev + 1) % images.length);
  };

  const prevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPhotoIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // --- 4. Calculations & Derived Data ---
  const host = venue?.host || {
    name: "Host",
    avatar: "",
    isCertifiedFoxer: false,
    joined: "Joined 2023",
  };
  const ratingCats = venue?.ratingCategories || {
    cleanliness: 4.8,
    accuracy: 4.8,
    checkIn: 4.9,
    communication: 4.9,
    location: 4.8,
    value: 4.8,
  };

  const displayActivities =
    venue?.activities && venue.activities.length > 0
      ? venue.activities
      : [
          "Explore local landmarks",
          "Visit nearby cafes",
          "Walk around the city center",
          "Discover hidden gems",
        ];

  const price = venue?.price || 0;
  const stayTotal = price * (nights > 0 ? nights : 1);
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
      images,
    },
    details: {
      host,
      ratingCats,
      displayActivities,
    },
  };
}
