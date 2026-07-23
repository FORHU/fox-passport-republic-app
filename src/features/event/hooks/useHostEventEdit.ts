"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useEventBuilder } from "@/features/event/hooks/useEventBuilder";
import { fetchEventsByHostId, updateEvent, submitEventTemplate } from "@/features/event/api/events";
import api from "@/shared/lib/axios";
import { EVENT_CATEGORIES, VENUE_ICONS, TALENT_ICONS } from "@/features/event/data/eventBuilderData";
import type { Id } from "@/shared/lib/api-types";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toDatetimeLocalValue(value: unknown): string {
  if (!value) return "";
  const d = new Date(value as string | number | Date);
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
  if (EVENT_CATEGORIES.includes(asLabel as string)) return asLabel;

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

function extractImageUrl(img: unknown): string | null {
  if (!img) return null;
  if (typeof img === "string") return img;
  const obj = img as any;
  return obj?.url ?? obj?.imageUrl ?? obj?.image ?? null;
}

function eventAssetToResourceItem(a: any) {
  const asset = (a as Record<string, unknown>)?.asset ?? a;
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
  const service = (s as Record<string, unknown>)?.service ?? s;
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
  const [existingEndDatetime, setExistingEndDatetime] = useState<unknown>(null);

  const backHref = "/creator-dashboard/events";

  const handleBack = useCallback(() => {
    router.push(backHref);
  }, [router]);

  const submitEvent = async (targetStatus: string) => {
    if (!builder.eventTitle) {
      toast.error("Please add an event title");
      return;
    }

    builder.setIsSubmitting(true);
    try {
      const safeEventTypeMapping: Record<string, string> = {
        corporate: "corporate",
        fair: "other",
        birthday: "birthday",
        wedding: "wedding",
        anniversary: "other",
        graduation: "other",
        other: "other",
        celebration: "other",
        "private experience": "other",
        popup: "other",
      };

      const rawCategory = builder.category.toLowerCase().replace(/\s+/g, "_").replace(/_/g, " ");
      const eventType = safeEventTypeMapping[rawCategory] || "other";

      const payload: Record<string, unknown> = {
        name: builder.eventTitle,
        description: builder.description || undefined,
        category: eventType,
        isPublic: false,
        maxAttendees: builder.maxAttendees > 0 ? builder.maxAttendees : undefined,
        cancellationPolicyId: builder.cancellationPolicyId || undefined,
        targetCity: builder.targetCity || undefined,
        targetState: builder.targetState || undefined,
        targetCountry: builder.targetCountry || undefined,
        lat: builder.lat ?? undefined,
        lng: builder.lng ?? undefined,
      };

      await updateEvent(eventId, payload);

      if (targetStatus === "pending") {
        // Attach venue separately if one is in the package
        const venueItem = builder.baseItems.find((i) => VENUE_ICONS.includes(i.icon));
        const venueId = venueItem?.id ?? (builder as any).existingVenueId ?? null;
        if (venueId) {
          try {
            await api.post(`/event-templates/${eventId}/venues`, {
              venueId,
              agreedPrice: venueItem?.agreedPrice ?? venueItem?.cost ?? 0,
              isOptional: venueItem?.isOptional ?? false,
            });
          } catch {
            // venue attachment is best-effort
          }
        }
        await submitEventTemplate(eventId);
      }

      toast.success(targetStatus === "draft" ? "Draft saved!" : "Event submitted for review!");
      if (targetStatus === "pending") {
        setTimeout(() => {
          builder.reset();
          router.push(backHref);
        }, 500);
      }
    } catch (error: any) {
      console.error("Event update error:", error);
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (typeof error?.response?.data === "string" ? error.response.data : null);
      toast.error(backendMessage || "Failed to save event");
    } finally {
      builder.setIsSubmitting(false);
    }
  };

  const handlePublish = useCallback(() => submitEvent("pending"), [
    builder,
    eventId,
    router,
  ]);

  const handleSaveDraft = useCallback(() => submitEvent("draft"), [
    builder,
    eventId,
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
        setExistingEndDatetime(found?.endDatetime ?? found?.end_datetime ?? null);
        (builder as { existingVenueId?: string | null }).existingVenueId = found?.venueId ?? (found?.venue as Record<string, unknown>)?.id ?? null;

        // Prefill store state.
        builder.reset();
        // Set draftId immediately so the auto-save in useEventBuilder PUTs to
        // this template instead of POSTing a new draft while the form is filling in.
        builder.setDraftId(String(found.id));
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
      } catch (error) {
        console.error("Failed to prefill event edit:", error);
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

  return {
    ...builder,
    handleBack,
    handlePublish,
    handleSaveDraft,
    isPrefilling,
    prefillError,
  };
}

