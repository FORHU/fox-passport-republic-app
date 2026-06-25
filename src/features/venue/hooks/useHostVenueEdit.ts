"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useVenueBuilder } from "@/features/venue/hooks/useVenueBuilder";
import { fetchVenuesByHostId, updateVenue } from "@/features/venue/api/venues";
import api from "@/shared/lib/axios";
import { VENUE_TYPES } from "@/features/venue/data/venueBuilderData";
import type { Id } from "@/shared/lib/api-types";

function belongsToHost(record: any, hostId: Id): boolean {
  const idStr = String(hostId);
  const candidates: unknown[] = [
    record?.hostId,
    record?.host_id,
    record?.ownerId,
    record?.owner_id,
    record?.userId,
    record?.user_id,
    record?.creatorId,
    record?.createdBy,
    record?.createdById,
    record?.creator?.id,
    record?.host?.id,
    record?.organizer?.id,
  ];

  return candidates.some((c) => c != null && String(c) === idStr);
}

function toTitleCase(value: unknown) {
  const s = String(value ?? "").trim();
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function normalizeVenueStatusToBackend(value: unknown): string {
  const raw = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\s+/g, " ");

  if (!raw) return "pending";
  if (raw.includes("draft")) return "draft";
  if (raw.includes("archiv")) return "archived";
  if (raw.includes("reject")) return "rejected";
  // "publish" from the mayor always goes to pending — admin approves to available
  return "pending";
}

function extractArrayOfNames(maybe: any): string[] {
  if (!maybe) return [];
  if (Array.isArray(maybe)) {
    return maybe
      .map((x) => (typeof x === "string" ? x : x?.name ?? x?.label))
      .filter(Boolean);
  }
  return [];
}

function extractImageUrl(img: any): string | null {
  if (!img) return null;
  if (typeof img === "string") return img;
  return img?.url ?? img?.imageUrl ?? img?.image ?? null;
}

type Resource = { id: string; name: string; value: number; icon: string; desc: string; category: string };

function categoryToIcon(category: string) {
  const c = category.toLowerCase();
  if (c === "spaces") return "weekend";
  if (c === "amenities") return "wifi";
  if (c === "tech") return "speaker";
  if (c === "staff") return "badge";
  if (c === "rules") return "gavel";
  return "star";
}

export function useHostVenueEdit(venueId: string) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hostId = user?.id;

  const builder = useVenueBuilder();

  const backHref = "/creator-dashboard/venues";

  const [isPrefilling, setIsPrefilling] = useState(true);
  const [prefillError, setPrefillError] = useState<string | null>(null);

  const [existingStatus, setExistingStatus] = useState<string>("pending_review");

  const handleBack = useCallback(() => {
    router.push(backHref);
  }, [router]);

  const submitVenue = async (targetStatus: string) => {
    if (!builder.venueName || !builder.venueType) {
      toast.error("Please fill in the required fields (Name and Type)");
      return;
    }

    const capacityNum = parseInt(builder.capacity || "0", 10);
    if (!Number.isFinite(capacityNum) || capacityNum < 1) {
      toast.error("Capacity must be at least 1");
      return;
    }

    builder.setIsSubmitting(true);
    try {
      const allItems = [...builder.includedItems, ...builder.addonItems];
      const payload = {
        name: builder.venueName,
        description: builder.description || "Venue updated via Studio.",
        category: builder.venueType.toLowerCase(),
        capacity: capacityNum,
        address: builder.location,
        city: builder.city,
        state: builder.state || undefined,
        country: builder.country,
        price: builder.baseRate,
        spaceType: allItems.filter((i: any) => i.category === "spaces").map((i: any) => i.name),
        amenities: allItems.filter((i: any) => i.category === "amenities").map((i: any) => i.name),
        techAv: allItems.filter((i: any) => i.category === "tech").map((i: any) => i.name),
        staffing: allItems.filter((i: any) => i.category === "staff").map((i: any) => i.name),
        policies: allItems.filter((i: any) => i.category === "rules").map((i: any) => i.name),
        status: normalizeVenueStatusToBackend(targetStatus),
      };

      if (!venueId) {
        toast.error("Invalid venue id.");
        builder.setIsSubmitting(false);
        return;
      }

      await updateVenue(venueId, payload);

      // Upload any new gallery files only.
      const galleryFiles = builder.gallery
        .map((item: any) => item.file)
        .filter(Boolean) as File[];
      if (galleryFiles.length > 0) {
        const formData = new FormData();
        galleryFiles.forEach((file) => formData.append("images", file));
        await api.post(`/venues/${venueId}/images`, formData);
      }

      setExistingStatus(targetStatus);
      toast.success(targetStatus === "draft" ? "Draft saved!" : "Venue published!");
      setTimeout(() => {
        builder.reset();
        router.push(backHref);
      }, 500);
    } catch (error: any) {
      console.error("Venue update error:", error);
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (typeof error?.response?.data === "string" ? error.response.data : null);
      toast.error(backendMessage || error?.message || "Failed to update venue");
    } finally {
      builder.setIsSubmitting(false);
    }
  };

  const handlePublish = useCallback(() => submitVenue("published"), [
    builder,
    router,
    venueId,
  ]);

  const handleSaveDraft = useCallback(() => submitVenue("draft"), [
    builder,
    router,
    venueId,
  ]);

  useEffect(() => {
    if (!venueId) {
      setIsPrefilling(false);
      setPrefillError("Invalid venue id.");
      return;
    }
    if (!hostId) {
      // Avoid leaving the page stuck in the prefill loader.
      setIsPrefilling(false);
      setPrefillError(null);
      return;
    }
    let cancelled = false;

    (async () => {
      setIsPrefilling(true);
      setPrefillError(null);

      try {
        const raw = await fetchVenuesByHostId(hostId);
        const filtered = raw.filter((vn) => belongsToHost(vn, hostId));
        const found = filtered.find((vn) => String(vn?.id) === String(venueId));

        if (!found) {
          if (!cancelled) setPrefillError("Venue not found or not owned by you.");
          return;
        }
        if (cancelled) return;

        setExistingStatus(normalizeVenueStatusToBackend(found?.status ?? "pending_review"));

        builder.reset();
        builder.setShowGuide(false);

        builder.setVenueName(found?.name ?? found?.title ?? "");
        builder.setDescription(found?.description ?? "");

        const rawType = found?.type ?? found?.venueType ?? "";
        const normalizedType = toTitleCase(String(rawType).toLowerCase());
        builder.setVenueType(normalizedType || (VENUE_TYPES[0] as any));

        builder.setCapacity(String(found?.capacity ?? found?.cap ?? ""));

        const address = found?.address ?? found?.location ?? "";
        builder.setLocation(address);

        builder.setCity(found?.city ?? "");
        builder.setState(found?.state ?? "");
        builder.setCountry(found?.country ?? "");

        // Gallery
        const images = found?.venueImages ?? found?.images ?? [];
        if (Array.isArray(images)) {
          images.forEach((img: any, idx: number) => {
            const url = extractImageUrl(img);
            if (!url) return;
            builder.addGalleryItem({
              id: `venue-img-${found?.id}-${idx}`,
              url,
              caption: img?.altText ?? img?.caption ?? `Image ${idx + 1}`,
            } as any);
          });
        }

        // Included/addon items
        const spaceTypes = extractArrayOfNames(found?.spaceType ?? found?.spaceTypes);
        spaceTypes.forEach((name, idx) => {
          const item: Resource = {
            id: `space-${name}-${idx}`,
            name,
            value: 0,
            icon: categoryToIcon("spaces"),
            desc: "",
            category: "spaces",
          };
          builder.addIncludedItem(item as any);
        });

        extractArrayOfNames(found?.amenities).forEach((name, idx) => {
          builder.addAddonItem({
            id: `amenity-${name}-${idx}`,
            name,
            value: 0,
            icon: categoryToIcon("amenities"),
            desc: "",
            category: "amenities",
          } as any);
        });

        extractArrayOfNames(found?.techAv).forEach((name, idx) => {
          builder.addAddonItem({
            id: `tech-${name}-${idx}`,
            name,
            value: 0,
            icon: categoryToIcon("tech"),
            desc: "",
            category: "tech",
          } as any);
        });

        extractArrayOfNames(found?.staffing).forEach((name, idx) => {
          builder.addAddonItem({
            id: `staff-${name}-${idx}`,
            name,
            value: 0,
            icon: categoryToIcon("staff"),
            desc: "",
            category: "staff",
          } as any);
        });

        extractArrayOfNames(found?.policies).forEach((name, idx) => {
          builder.addAddonItem({
            id: `policy-${name}-${idx}`,
            name,
            value: 0,
            icon: categoryToIcon("rules"),
            desc: "",
            category: "rules",
          } as any);
        });

        builder.setBaseRate(Number(found?.price ?? found?.baseRate ?? builder.baseRate));
        builder.setOccupancyRate(Number(found?.occupancyRate ?? found?.occupancy ?? 60));
      } catch (err: any) {
        console.error("Prefill venue edit failed:", err);
        if (!cancelled) setPrefillError("Failed to load venue.");
      } finally {
        if (!cancelled) setIsPrefilling(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hostId, venueId]);

  return {
    ...builder,
    isPrefilling,
    prefillError,
    existingStatus,
    handleBack,
    handlePublish,
    handleSaveDraft,
  };
}

