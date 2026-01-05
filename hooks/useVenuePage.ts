// src/hooks/useVenuePage.ts
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import api from "@/lib/axios";

// Define interface matching the component's expectations
interface Venue {
  id: string;
  title: string;
  location: string;
  province: string;
  price: number;
  rating: number;
  reviews: number;
  images: string[];
  description: string;
  category: string;
  guestCount: number;
  bedroomCount: number;
  bathroomCount: number;
  host: {
    name: string;
    avatar: string;
    isCertifiedFoxer: boolean;
    joined: string;
    description?: string;
    responseRate?: number;
    responseTime?: string;
    coHosts?: { name: string; avatar: string }[];
    work?: string;
    funFact?: string;
    details?: string[];
    reviewCount?: number;
    rating?: number;
    yearsHosting?: number;
  };
  offers: string[];
  activities: string[];
  ratingCategories?: {
    cleanliness: number;
    accuracy: number;
    checkIn: number;
    communication: number;
    location: number;
    value: number;
  };
}

export function useVenuePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  // Safe access to ID (handling edge case where ID might be an array)
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- 1. Fetch Data ---
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // STRATEGY: Try fetching as EVENT first (most likely from Category page),
        // then fallback to VENUE if not found (404).

        let data: any = null;
        let isEvent = false;

        try {
          // Try fetching as Event
          // Note: /api/v1/events/:id
          const response = await api.get(`/v1/events/${id}`);
          if (response.data?.success) {
            data = response.data.data;
            isEvent = true;
          }
        } catch (eventErr: any) {
          // If 404, it might be a Venue ID, so try that next.
          // If other error, we might still want to try Venue or fail.
          if (eventErr.response && eventErr.response.status === 404) {
            console.log("Not an event, trying venue...");
          } else {
            // Log but continue to try venue just in case (optional, but safer to try)
            console.warn("Error fetching event:", eventErr);
          }
        }

        if (!data) {
          try {
            // Fallback: Try fetching as Venue
            // Note: /api/v1/venues/:id
            const response = await api.get(`/v1/venues/${id}`);
            if (response.data?.success) {
              data = response.data.data;
              isEvent = false;
            }
          } catch (venueErr: any) {
            console.error("Error fetching venue:", venueErr);
            throw new Error("Could not find event or venue");
          }
        }

        if (!data) {
          throw new Error("No data found");
        }

        // --- MAP TRANSFORM ---
        // Normalize both Event or Venue data to the UI 'Venue' interface

        const hostData = isEvent ? data.foxer : data.host;
        const details = isEvent ? data.details : data; // Event has 'details' relation, Venue IS the details (mostly)
        const pricing = isEvent
          ? data.pricing?.[0] || {}
          : data.pricing?.[0] || {};

        // Images
        const rawImages = data.images?.map((img: any) => img.imageUrl) || [];

        // Host Image
        const hostAvatar =
          hostData?.profileImage ||
          `https://ui-avatars.com/api/?name=${
            hostData?.name || "User"
          }&background=random`;

        const mappedVenue: Venue = {
          id: data.id,
          title: isEvent ? data.title : data.name,
          location: isEvent ? details?.city || "Location TBD" : data.city,
          province: isEvent
            ? details?.state || details?.country || ""
            : data.state || data.country,
          price: Number(pricing.basePrice || pricing.pricePerDay || 0),
          rating: 4.8, // Placeholder until reviews are aggregated
          reviews: data._count?.reviews || 0,
          images:
            rawImages.length > 0
              ? rawImages
              : [
                  "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
                ], // Fallback image
          description: data.description || "No description available.",
          category: data.category?.name || (isEvent ? "Event" : "Venue"),
          guestCount: isEvent ? data.maxAttendees || 20 : data.capacity || 2,
          bedroomCount: 1, // Not really applicable for events, default to 1
          bathroomCount: 1,
          host: {
            name: hostData?.name || "Host",
            avatar: hostAvatar,
            isCertifiedFoxer: hostData?.isFoxer || false,
            joined: hostData?.createdAt
              ? `Joined ${new Date(hostData.createdAt).getFullYear()}`
              : "Joined 2024",
            description:
              hostData?.bio || `Hosted by ${hostData?.name || "Foxer"}`,
            responseRate: 100,
            responseTime: "within an hour",
          },
          offers: isEvent
            ? data.venue?.amenities?.map((a: any) => a.name) || [] // If event has venue, use its amenities
            : data.amenities?.map((a: any) => a.name) || [],
          activities: [], // Can map if backend has this
          ratingCategories: {
            cleanliness: 5.0,
            accuracy: 5.0,
            checkIn: 5.0,
            communication: 5.0,
            location: 5.0,
            value: 5.0,
          },
        };

        setVenue(mappedVenue);
      } catch (err) {
        console.error("Failed to load page data:", err);
        setError("Failed to load details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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

  // Ensure we have images (fallback logic)
  const images = useMemo(() => {
    if (!venue) return [];
    const rawImages = venue.images || [];
    // If fewer than 5 images, repeat them to fill the grid (UI requirement)
    if (rawImages.length > 0 && rawImages.length < 5) {
      const needed = 5 - rawImages.length;
      const filler = rawImages[0];
      return [...rawImages, ...Array(needed).fill(filler)];
    }
    return rawImages;
  }, [venue]);

  // Sidebar Data for Gallery
  const imageRichData = useMemo(
    () =>
      images.map((img, idx) => ({
        src: img,
        caption:
          idx === 0 ? `Welcome to ${venue?.title}.` : `Experience the vibe.`,
        photographer: "Foxer Republic",
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

  // Default rating categories if fetch fails or incomplete
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
    loading,
    error,
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
