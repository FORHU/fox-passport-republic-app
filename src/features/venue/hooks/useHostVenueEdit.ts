"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { useVenueBuilder } from "@/features/venue/hooks/useVenueBuilder";
import { fetchVenuesByHostId, updateVenue } from "@/features/venue/api/venues";
import api from "@/shared/lib/axios";
import { VENUE_TYPES } from "@/features/venue/data/venueBuilderData";
import type { Id } from "@/shared/lib/api-types";
import type {
  Venue,
  VenueItem,
  VenueUpdatePayload,
  VenueImage,
} from "@/features/venue/types/venue";

function belongsToHost(record: Venue, hostId: Id): boolean {
  const idStr = String(hostId);
  const candidates: (string | undefined)[] = [
    String(record?.hostId),
    String(record?.ownerId),
    String(record?.owner_id),
    String(record?.userId),
    String(record?.user_id),
    String(record?.creatorId),
    String(record?.host?.id),
    // The raw API venue record carries `mayorId`/`mayor`, not `hostId`/
    // `host` — those only appear after the server-side `normalizeVenue()`
    // pass, which this client-side fetch never goes through. Without these,
    // every real venue fails ownership matching regardless of who owns it.
    String((record as any)?.mayorId),
    String((record as any)?.mayor?.id),
  ];

  return candidates.some((c) => c && c !== "undefined" && c === idStr);
}

function toTitleCase(value: unknown): string {
  const s = String(value ?? "").trim();
  if (!s) return "";
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Used only for the *target* status a submit action sends to the backend
// (from handleSaveDraft/handlePublish) — the backend only ever accepts a
// generic update moving a venue between "draft" and "pending" (see
// venue.service.ts's updateVenue clamp), so anything else collapses to
// "pending" here. Do NOT use this to interpret a venue's *current*, already-
// fetched status — see normalizeExistingVenueStatus below for that.
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
  return "pending";
}

// Used to interpret the venue's *current* status as fetched from the
// backend, for display and for deciding whether editing this venue should
// even be allowed to touch its status at all. Distinct from the function
// above: this one recognizes "available" (the live/approved status) instead
// of collapsing it to "pending" — collapsing it there was the bug that made
// an already-approved venue's Studio header claim it was still a draft.
function normalizeExistingVenueStatus(value: unknown): string {
  const raw = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\s+/g, " ");

  if (!raw) return "pending";
  if (raw.includes("draft")) return "draft";
  if (raw.includes("archiv")) return "archived";
  if (raw.includes("reject")) return "rejected";
  if (raw.includes("available") || raw.includes("publish")) return "available";
  return "pending";
}

function extractArrayOfNames(maybe: unknown): string[] {
  if (!maybe) return [];
  if (Array.isArray(maybe)) {
    return maybe
      .map((x) => {
        if (typeof x === "string") return x;
        if (x && typeof x === "object") {
          const obj = x as Record<string, unknown>;
          return (
            (obj.name as string | undefined) ??
            (obj.label as string | undefined)
          );
        }
        return undefined;
      })
      .filter((x): x is string => Boolean(x));
  }
  return [];
}

function extractImageUrl(img: unknown): string | null {
  if (!img) return null;
  if (typeof img === "string") return img;
  if (img && typeof img === "object") {
    const imgObj = img as VenueImage;
    return imgObj?.url ?? imgObj?.imageUrl ?? imgObj?.image ?? null;
  }
  return null;
}

function categoryToIcon(category: string): string {
  const c = category.toLowerCase();
  if (c === "spaces") return "weekend";
  if (c === "amenities") return "wifi";
  if (c === "tech") return "speaker";
  if (c === "staff") return "badge";
  if (c === "rules") return "gavel";
  return "star";
}

interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
  message?: string;
}

export function useHostVenueEdit(venueId: string) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hostId = user?.id;

  const builder = useVenueBuilder();

  // `useVenueBuilder` returns a fresh object literal on every render (it spreads
  // the store and rebuilds handlers, and the return itself is not memoised), so
  // its identity always changes. The prefill effect below calls builder.setX(),
  // which updates the store and triggers a render, which produces a new builder
  // object - so listing `builder` in that effect's deps made it re-run forever,
  // refetching GET /venues?hostId=... on every pass.
  //
  // Read it through a ref instead: the effect gets the current builder without
  // depending on an identity that changes every render.
  const builderRef = useRef(builder);
  useLayoutEffect(() => {
    builderRef.current = builder;
  });

  const backHref = "/creator-dashboard/venues";

  const [isPrefilling, setIsPrefilling] = useState(true);
  const [prefillError, setPrefillError] = useState<string | null>(null);
  const [existingStatus, setExistingStatus] =
    useState<string>("pending_review");

  const handleBack = useCallback(() => {
    router.push(backHref);
  }, [router]);

  const submitVenue = async (targetStatus: string): Promise<void> => {
    if (!builder.venueName || !builder.venueType) {
      toast.error("Please fill in the required fields (Name and Type)");
      return;
    }
    if (builder.venueType === "Other" && !builder.venueTypeOther.trim()) {
      toast.error("Please specify the venue type");
      return;
    }

    const capacityNum = parseInt(builder.capacity || "0", 10);
    if (!Number.isFinite(capacityNum) || capacityNum < 1) {
      toast.error("Capacity must be at least 1");
      return;
    }

    // Once a venue is already live (`available`), this Studio session is
    // just editing its details — never resubmitting it. Sending
    // status: "pending"/"draft" here (what a fresh submit/save would send)
    // would silently demote an approved, publicly-bookable venue back into
    // review and pull it out of search/booking until an admin re-approves
    // it, even though nothing about its approval actually changed.
    const isAlreadyLive = existingStatus === "available";
    const normalizedTarget = normalizeVenueStatusToBackend(targetStatus);
    if (
      !isAlreadyLive &&
      normalizedTarget !== "draft" &&
      (!builder.boundary || builder.boundary.length < 3)
    ) {
      toast.error("Draw a service-area shape on the map before publishing");
      return;
    }

    builder.setIsSubmitting(true);
    try {
      const allItems: any[] = [...builder.includedItems, ...builder.addonItems];
      const payload: VenueUpdatePayload = {
        name: builder.venueName,
        description: builder.description || "Venue updated via Studio.",
        category: (
          builder.venueType === "Other" && builder.venueTypeOther.trim()
            ? builder.venueTypeOther.trim()
            : builder.venueType
        ).toLowerCase(),
        capacity: capacityNum,
        address: builder.location,
        city: builder.city,
        state: builder.state || undefined,
        country: builder.country,
        boundary: builder.boundary ?? undefined,
        price: builder.baseRate,
        spaceType: allItems
          .filter((i) => i.category === "spaces")
          .map((i) => i.name),
        amenities: allItems
          .filter((i) => i.category === "amenities")
          .map((i) => i.name),
        techAv: allItems
          .filter((i) => i.category === "tech")
          .map((i) => i.name),
        staffing: allItems
          .filter((i) => i.category === "staff")
          .map((i) => i.name),
        policies: allItems
          .filter((i) => i.category === "rules")
          .map((i) => i.name),
        cancellationPolicyId: builder.cancellationPolicyId || undefined,
        ...(isAlreadyLive ? {} : { status: normalizedTarget }),
      };

      if (!venueId) {
        toast.error("Invalid venue id.");
        builder.setIsSubmitting(false);
        return;
      }

      await updateVenue(venueId, payload);

      // Upload any new gallery files only.
      const galleryFiles = builder.gallery
        .map((item: { file?: File }) => item.file)
        .filter((f): f is File => Boolean(f));

      if (galleryFiles.length > 0) {
        const formData = new FormData();
        galleryFiles.forEach((file) => formData.append("images", file));
        await api.post(`/venues/${venueId}/images`, formData);
      }

      if (!isAlreadyLive) setExistingStatus(normalizedTarget);
      toast.success(
        isAlreadyLive
          ? "Venue updated!"
          : targetStatus === "draft"
            ? "Draft saved!"
            : "Venue published!",
      );
      setTimeout(() => {
        builder.reset();
        router.push(backHref);
      }, 500);
    } catch (error) {
      console.error("Venue update error:", error);
      const axiosError = error as ErrorResponse;
      const backendMessage =
        axiosError?.response?.data?.message ||
        axiosError?.response?.data?.error ||
        (typeof axiosError?.response?.data === "string"
          ? axiosError.response.data
          : null);
      toast.error(
        backendMessage || axiosError?.message || "Failed to update venue",
      );
    } finally {
      builder.setIsSubmitting(false);
    }
  };

  const handlePublish = useCallback(
    () => submitVenue("published"),
    [builder, router, venueId],
  );

  const handleSaveDraft = useCallback(
    () => submitVenue("draft"),
    [builder, router, venueId],
  );

  useEffect(() => {
    // Shadows the outer `builder` for the whole effect body, so every
    // builder.setX() below acts on the current instance without this effect
    // depending on that instance's identity.
    const builder = builderRef.current;

    if (!venueId) {
      setIsPrefilling(false);
      setPrefillError("Invalid venue id.");
      return;
    }
    if (!hostId) {
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
          if (!cancelled)
            setPrefillError("Venue not found or not owned by you.");
          return;
        }
        if (cancelled) return;

        setExistingStatus(
          normalizeExistingVenueStatus(found?.status ?? "pending_review"),
        );

        builder.reset();
        builder.setShowGuide(false);

        builder.setVenueName(found?.name ?? found?.title ?? "");
        builder.setDescription(found?.description ?? "");

        // The backend stores this as `category` (a free-text field); `type`/
        // `venueType` are checked first only as legacy fallbacks in case an
        // older normalized shape is ever passed in here.
        const rawType = found?.type ?? found?.venueType ?? found?.category ?? "";
        const normalizedType = toTitleCase(String(rawType).toLowerCase());
        if (normalizedType && VENUE_TYPES.includes(normalizedType)) {
          builder.setVenueType(normalizedType);
          builder.setVenueTypeOther("");
        } else if (normalizedType) {
          // A category that isn't one of the known types — e.g. a custom
          // value entered via "Other" — round-trips back into "Other" with
          // the original text restored.
          builder.setVenueType("Other");
          builder.setVenueTypeOther(normalizedType);
        } else {
          builder.setVenueType(VENUE_TYPES[0] as string);
          builder.setVenueTypeOther("");
        }

        builder.setCapacity(String(found?.capacity ?? found?.cap ?? ""));

        const address = found?.address ?? found?.location ?? "";
        builder.setLocation(address);

        builder.setCity(found?.city ?? "");
        builder.setState(found?.state ?? "");
        builder.setCountry(found?.country ?? "");
        builder.setLat(found?.lat != null ? Number(found.lat) : null);
        builder.setLng(found?.lng != null ? Number(found.lng) : null);
        builder.setBoundary(
          Array.isArray(found?.boundary) ? found.boundary : null,
        );

        // Gallery
        const images = (found?.venueImages ?? found?.images ?? []) as (
          VenueImage | string
        )[];
        if (Array.isArray(images)) {
          images.forEach((img, idx) => {
            const url = extractImageUrl(img);
            if (!url) return;
            const imgObj =
              img && typeof img === "object" ? (img as VenueImage) : null;
            builder.addGalleryItem({
              id: `venue-img-${found?.id}-${idx}`,
              url,
              caption: imgObj?.altText ?? imgObj?.caption ?? `Image ${idx + 1}`,
            });
          });
        }

        // Included/addon items
        const spaceTypes = extractArrayOfNames(
          found?.spaceType ?? found?.spaceTypes,
        );
        spaceTypes.forEach((name, idx) => {
          const item: VenueItem = {
            id: `space-${name}-${idx}`,
            name,
            value: 0,
            icon: categoryToIcon("spaces"),
            desc: "",
            category: "spaces",
          };
          builder.addIncludedItem(item);
        });

        extractArrayOfNames(found?.amenities).forEach((name, idx) => {
          builder.addAddonItem({
            id: `amenity-${name}-${idx}`,
            name,
            value: 0,
            icon: categoryToIcon("amenities"),
            desc: "",
            category: "amenities",
          });
        });

        extractArrayOfNames(found?.techAv).forEach((name, idx) => {
          builder.addAddonItem({
            id: `tech-${name}-${idx}`,
            name,
            value: 0,
            icon: categoryToIcon("tech"),
            desc: "",
            category: "tech",
          });
        });

        extractArrayOfNames(found?.staffing).forEach((name, idx) => {
          builder.addAddonItem({
            id: `staff-${name}-${idx}`,
            name,
            value: 0,
            icon: categoryToIcon("staff"),
            desc: "",
            category: "staff",
          });
        });

        extractArrayOfNames(found?.policies).forEach((name, idx) => {
          builder.addAddonItem({
            id: `policy-${name}-${idx}`,
            name,
            value: 0,
            icon: categoryToIcon("rules"),
            desc: "",
            category: "rules",
          });
        });

        builder.setBaseRate(
          Number(found?.price ?? found?.baseRate ?? builder.baseRate),
        );
        builder.setOccupancyRate(
          Number(found?.occupancyRate ?? found?.occupancy ?? 60),
        );
      } catch (err) {
        console.error("Prefill venue edit failed:", err);
        if (!cancelled) setPrefillError("Failed to load venue.");
      } finally {
        if (!cancelled) setIsPrefilling(false);
      }
    })();

    return () => {
      cancelled = true;
    };
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
