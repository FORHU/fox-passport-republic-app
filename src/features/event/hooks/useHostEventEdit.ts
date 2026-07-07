"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useEventBuilder } from "@/features/event/hooks/useEventBuilder";
import { fetchEventsByHostId, updateEvent, submitEventTemplate } from "@/features/event/api/events";
import { EVENT_CATEGORIES, VENUE_ICONS, TALENT_ICONS } from "@/features/event/data/eventBuilderData";
import type { Id } from "@/shared/lib/api-types";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toDatetimeLocalValue(value: unknown): string {
  if (!value) return "";
  const d = new Date(value as any);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(
    d.getHours()
  )}:${pad2(d.getMinutes())}`;
}

function normalizeLower(value: unknown) {
  return String(value ?? "").trim().toLowerCase().replace(/_/g, " ").replace(/\s+/g, " ");
}

function normalizeEventStatusToBackend(value: unknown): string {
  const raw = normalizeLower(value);

  // Backend EventStatus enum (prisma/schema.prisma): draft | pending | ongoing | completed | cancelled
  if (!raw) return "draft";
  if (raw.includes("draft")) return "draft";
  if (raw.includes("pend")) return "pending";
  if (raw.includes("ongoing")) return "ongoing";
  if (raw.includes("cancel")) return "cancelled";
  if (raw.includes("complete")) return "completed";
  return "draft";
}

function mapEventTypeToCategory(eventType: unknown): string {
  const t = normalizeLower(eventType);
  const map: Record<string, string> = {
    corporate: "Corporate",
    fair: "Celebration",
    birthday: "Private Experience",
    wedding: "Popup",
    anniversary: "Other",
    graduation: "Other",
    other: "Other",
  };

  // If backend already sent a display label (e.g. "Corporate")
  const asLabel = String(eventType ?? "").trim();
  if (EVENT_CATEGORIES.includes(asLabel as any)) return asLabel;

  return map[t] ?? "Other";
}

function belongsToHost(record: any, hostId: Id): boolean {
  const idStr = String(hostId);
  const candidates: unknown[] = [
    record?.organizerId,
    record?.organizer_id,
    record?.hostId,
    record?.host_id,
    record?.ownerId,
    record?.owner_id,
    record?.userId,
    record?.user_id,
    record?.creatorId,
    record?.createdBy,
    record?.creator?.id,
    record?.organizer?.id,
    record?.owner?.id,
    record?.host?.id,
  ];
  return candidates.some((c) => c != null && String(c) === idStr);
}

function extractImageUrl(img: any): string | null {
  if (!img) return null;
  if (typeof img === "string") return img;
  return img?.url ?? img?.imageUrl ?? img?.image ?? null;
}

function eventAssetToResourceItem(a: any) {
  const asset = a?.asset ?? a;
  const assetId = asset?.id ?? a?.assetId ?? asset?.assetId ?? a?.id;
  const name = asset?.name ?? a?.name ?? "Untitled";
  const desc = asset?.description ?? a?.description ?? "";
  const cost = Number(asset?.price ?? asset?.cost ?? a?.price ?? 0) || 0;
  const catSlug =
    (typeof asset?.category === "string" ? asset?.category : asset?.category?.slug) ??
    asset?.category?.name ??
    "";
  const slug = normalizeLower(catSlug);

  // Mirror the icon mapping used by the Event builder palette.
  let icon = "work_outline";
  if (slug === "entertainment") icon = "music_note";
  else if (["planning", "catering", "photography"].includes(slug)) {
    icon = slug === "catering" ? "restaurant" : slug === "photography" ? "camera_alt" : "event_note";
  } else if (slug === "equipment") icon = "speaker";
  else if (["decoration", "furniture"].includes(slug)) icon = slug === "furniture" ? "chair" : "brush";

  // Ensure venue + talent icons are compatible with core package calculations.
  // (We only really need this for the venue base item.)
  if (TALENT_ICONS.includes(icon)) {
    // no-op, already ok
  }

  return {
    id: `event-asset-${assetId ?? name}`,
    name,
    cost,
    icon,
    desc,
  };
}

function eventServiceToResourceItem(s: any) {
  const service = s?.service ?? s;
  const serviceId = service?.id ?? s?.serviceId ?? service?.serviceId ?? s?.id;
  const name = service?.name ?? s?.name ?? "Untitled";
  const desc = service?.description ?? s?.description ?? "";
  const cost = Number(service?.price ?? s?.price ?? 0) || 0;
  const catSlug =
    (typeof service?.category === "string" ? service?.category : service?.category?.slug) ??
    service?.category?.name ??
    "";
  const slug = normalizeLower(catSlug);

  let icon = "work_outline";
  if (slug === "entertainment") icon = "music_note";
  else if (["planning", "catering", "photography", "videography"].includes(slug)) {
    const iconMap: Record<string, string> = {
      catering: "restaurant",
      photography: "camera_alt",
      videography: "videocam",
      planning: "event_note",
    };
    icon = iconMap[slug] ?? "work_outline";
  }

  return {
    id: `event-service-${serviceId ?? name}`,
    name,
    cost,
    icon,
    desc,
  };
}

export function useHostEventEdit(eventId: string) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hostId = user?.id;

  const builder = useEventBuilder();

  const [isPrefilling, setIsPrefilling] = useState(true);
  const [prefillError, setPrefillError] = useState<string | null>(null);
  const [existingStatus, setExistingStatus] = useState<string>("draft");
  const [existingEndDatetime, setExistingEndDatetime] = useState<unknown>(null);

  const backHref = "/creator-dashboard/events";

  const handleBack = useCallback(() => {
    router.push(backHref);
  }, [router]);

  const submitEvent = async (targetStatus: string) => {
    // 1. Validation
    if (!builder.eventTitle || !builder.category) {
      toast.error("Please fill in the title and category");
      return;
    }

    builder.setIsSubmitting(true);
    try {
      const venueItemFromBase =
        builder.baseItems.find((i) => VENUE_ICONS.includes(i.icon)) ?? null;

      const startDatetime = new Date(builder.date || Date.now());
      const endDatetime = existingEndDatetime
        ? new Date(existingEndDatetime as any)
        : new Date(Date.now() + 4 * 60 * 60 * 1000);

      const safeEventTypeMapping: Record<string, string> = {
        corporate: "corporate",
        fair: "fair",
        birthday: "birthday",
        wedding: "wedding",
        anniversary: "anniversary",
        graduation: "graduation",
        other: "other",
      };

      const rawCategory = builder.category.toLowerCase().replace(/\s+/g, "_");
      const eventType = safeEventTypeMapping[rawCategory] || "other";

      const venueId =
        venueItemFromBase?.id ??
        (builder as any).existingVenueId ??
        null;

      if (!venueId) {
        toast.error("Please select a venue for your event");
        return;
      }

      const payload = {
        name: builder.eventTitle,
        description: builder.description || "Epic event created via Studio.",
        venueId,
        eventType,
        startDatetime,
        endDatetime,
        maxAttendees: Math.max(1, Math.floor(builder.maxAttendees || 100)),
        totalPrice: Number(builder.financials?.suggestedPrice) || 0,
        cancellationPolicyId: builder.cancellationPolicyId || undefined,
        images: builder.gallery.map((g, index) => ({
          imageUrl: g.url,
          isPrimary: index === 0,
          altText: g.caption,
        })),
      };

      await updateEvent(eventId, payload);

      if (targetStatus === "pending") {
        await submitEventTemplate(eventId);
      }

      toast.success(targetStatus === "draft" ? "Draft saved!" : "Event submitted for review!");
      setTimeout(() => {
        builder.reset();
        router.push(backHref);
      }, 500);
    } catch (error: any) {
      console.error("Event update error:", error);
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (typeof error?.response?.data === "string" ? error.response.data : null);
      toast.error(backendMessage || "Failed to update event");
    } finally {
      builder.setIsSubmitting(false);
    }
  };

  const handlePublish = useCallback(() => submitEvent("pending"), [
    builder,
    eventId,
    existingEndDatetime,
    router,
  ]);

  const handleSaveDraft = useCallback(() => submitEvent("draft"), [
    builder,
    eventId,
    existingEndDatetime,
    router,
  ]);

  useEffect(() => {
    if (!eventId) {
      setIsPrefilling(false);
      setPrefillError("Invalid event id.");
      return;
    }
    if (!hostId) {
      // `RequireAuth` should handle unauthenticated flows, but avoid an infinite loader.
      setIsPrefilling(false);
      setPrefillError(null);
      return;
    }

    let cancelled = false;
    (async () => {
      setIsPrefilling(true);
      setPrefillError(null);
      try {
        const raw = await fetchEventsByHostId(hostId);
        const filtered = raw.filter((ev) => belongsToHost(ev, hostId));
        const found = filtered.find((ev) => String(ev?.id) === String(eventId));

        if (!found) {
          if (!cancelled) setPrefillError("Event not found.");
          return;
        }

        if (cancelled) return;

        // Keep originals for update payload consistency.
        setExistingStatus(normalizeEventStatusToBackend(found?.status ?? "draft"));
        setExistingEndDatetime(found?.endDatetime ?? found?.end_datetime ?? null);
        (builder as any).existingVenueId = found?.venueId ?? found?.venue?.id ?? null;

        // Prefill store state.
        builder.reset();
        builder.setShowGuide(false);

        builder.setEventTitle(found?.name ?? found?.title ?? "Untitled Event");
        builder.setDescription(found?.description ?? "");
        builder.setCategory(mapEventTypeToCategory(found?.eventType ?? found?.type ?? ""));
        builder.setDate(toDatetimeLocalValue(found?.startDatetime ?? found?.start_datetime ?? found?.date));
        builder.setLocation(
          found?.location ??
            found?.loc ??
            found?.venue?.name ??
            found?.venue?.location ??
            ""
        );
        builder.setMaxAttendees(Number(found?.maxAttendees ?? found?.capacity ?? 100) || 100);

        // Prefill gallery (optional).
        const images = found?.images ?? found?.eventImages ?? (found?.image ? [found?.image] : []);
        if (Array.isArray(images)) {
          images.forEach((img: any, idx: number) => {
            const url = extractImageUrl(img);
            if (!url) return;
            const caption = img?.altText ?? img?.caption ?? img?.name ?? `Image ${idx + 1}`;
            builder.addGalleryItem({
              id: `img-${found?.id}-${idx}`,
              url,
              caption,
            });
          });
        }

        // Prefill core package items.
        const venue = found?.venue ?? found?.venueData ?? null;
        if (venue) {
          builder.addBaseItem({
            id: venue?.id ?? venue?.venueId ?? `venue-${found?.id}`,
            name: venue?.name ?? venue?.title ?? "Venue",
            cost: Number(venue?.baseRate ?? venue?.price ?? found?.venuePrice ?? 0) || 0,
            icon: VENUE_ICONS[0],
            desc: venue?.description ?? "",
          });
        }

        const eventAssets = found?.eventAssets ?? found?.assets ?? [];
        if (Array.isArray(eventAssets)) {
          eventAssets.forEach((ea: any) => {
            builder.addBaseItem(eventAssetToResourceItem(ea));
          });
        }

        const eventServices = found?.eventServices ?? found?.services ?? [];
        if (Array.isArray(eventServices)) {
          eventServices.forEach((es: any) => {
            builder.addBaseItem(eventServiceToResourceItem(es));
          });
        }
      } catch (err: any) {
        console.error("Failed to prefill event edit:", err);
        if (!cancelled) setPrefillError("Failed to load event.");
      } finally {
        if (!cancelled) setIsPrefilling(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, hostId]);

  const { handleBack: _ignoredHandleBack, handlePublish: _ignoredHandlePublish, ...rest } =
    builder as any;

  return {
    ...rest,
    handleBack,
    handlePublish,
    handleSaveDraft,
    isPrefilling,
    prefillError,
  };
}

