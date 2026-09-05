"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEventBuilderStore } from "@/features/event/store/useEventBuilderStore";
import { InclusionItem } from "../_components/EventInclusions";

export function formatEventDate(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return (
    d.toLocaleDateString("en-PH", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }) +
    " · " +
    d.toLocaleTimeString("en-PH", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  );
}

export function useEventDetail(
  eventId: string | undefined,
  isPreview: boolean,
) {
  const router = useRouter();
  const [template, setTemplate] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cancellationPolicy, setCancellationPolicy] = useState<{
    name: string;
    description: string;
  } | null>(null);
  const [clientMounted, setClientMounted] = useState(false);
  const storeItems = useEventBuilderStore((s) => s.baseItems);

  useEffect(() => {
    setClientMounted(true);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!eventId) return;
    const id = eventId;
    if (isPreview) {
      import("@/features/booking/api/bookings").then(({ getOwnTemplate }) => {
        getOwnTemplate(id)
          .then((data) => {
            if (!data) {
              setLoadError("Template not found.");
              return;
            }
            setTemplate(data);
          })
          .catch((err) =>
            setLoadError(
              err?.response?.data?.message ?? "Failed to load preview.",
            ),
          );
      });
    } else {
      import("@/features/booking/api/bookings").then(
        ({ getPublicTemplate }) => {
          getPublicTemplate(id)
            .then((data) => {
              if (!data) {
                setLoadError("Template not found.");
                return;
              }
              setTemplate(data);
            })
            .catch((err) =>
              setLoadError(
                err?.response?.data?.message ?? "Failed to load event.",
              ),
            );
        },
      );
    }
  }, [eventId, isPreview]);

  // Fetch cancellation policy details when the template has one
  useEffect(() => {
    const policyId = template?.cancellationPolicyId;
    if (!policyId) {
      setCancellationPolicy(null);
      return;
    }
    import("@/features/cancellation-policy/api/cancellation-policies").then(
      ({ fetchCancellationPolicyById }) => {
        fetchCancellationPolicyById(policyId)
          .then((p) =>
            setCancellationPolicy({ name: p.name, description: p.description }),
          )
          .catch(() =>
            setCancellationPolicy({
              name: "Custom Policy",
              description: "A cancellation policy applies to this event.",
            }),
          );
      },
    );
  }, [template?.cancellationPolicyId]);

  /* ── Derived data ── */
  const location =
    [template?.targetCity, template?.targetState].filter(Boolean).join(", ") ||
    null;
  const firstVenue = template?.templateVenues?.[0]?.venue;
  const mapLat: number | null = firstVenue?.lat ?? template?.lat ?? null;
  const mapLng: number | null = firstVenue?.lng ?? template?.lng ?? null;

  const storePrice = storeItems.reduce(
    (acc, item) => acc + (item.agreedPrice ?? item.cost),
    0,
  );
  const price: number =
    isPreview && storePrice > 0
      ? storePrice
      : template?.estimatedTotal > 0
        ? template.estimatedTotal
        : 0;

  const eventDate = formatEventDate(template?.date);
  const isDraft =
    template?.status === "draft" || template?.status === "pending";

  const dbInclusions: InclusionItem[] = [
    ...(template?.templateVenues ?? []).map((v: any) => ({
      name: v.venue?.name ?? "Venue",
      icon: "apartment",
      desc: v.venue?.description ?? "",
      imageUrl: v.venue?.images?.[0]?.url ?? undefined,
    })),
    ...(template?.templateAssets ?? []).map((a: any) => ({
      name: a.asset?.name ?? "Asset",
      icon: "category",
      desc: a.asset?.description ?? "",
      imageUrl: a.asset?.images?.[0]?.url ?? undefined,
    })),
    ...(template?.templateServices ?? []).map((s: any) => ({
      name: s.service?.name ?? "Service",
      icon: "star",
      desc: s.service?.description ?? "",
      imageUrl: s.service?.images?.[0]?.url ?? undefined,
    })),
  ];

  const inclusions: InclusionItem[] =
    isPreview && clientMounted && storeItems.length > 0
      ? storeItems.map((item) => ({
          name: item.name,
          icon: item.icon,
          desc: item.desc ?? "",
          imageUrl: item.imageUrl,
        }))
      : dbInclusions;

  return {
    template,
    loadError,
    price,
    inclusions,
    cancellationPolicy,
    eventDate,
    location,
    mapLat,
    mapLng,
    isDraft,
    router,
  };
}
