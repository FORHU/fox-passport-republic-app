"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { serviceQueryKey } from "@/features/service/hooks/useService";
import {} from "sonner";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { useServicesBuilder } from "@/features/service/hooks/useServicesBuilder";
import {
  fetchServicesByOwnerId,
  updateService,
} from "@/features/service/api/services";
import type { Id } from "@/shared/lib/api-types";
import {
  SERVICE_CATEGORIES,
  BILLING_RATE_MAP,
} from "@/features/service/data/serviceBuilderData";

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
    record?.creator_id,
    record?.creator?.id,
    record?.host?.id,
    record?.owner?.id,
  ];
  return candidates.some((c) => c != null && String(c) === idStr);
}

function normalizeLower(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\s+/g, " ");
}

function mapCategoryToService(category: any): {
  slug: string;
  customCategory: string;
} {
  const allowed = SERVICE_CATEGORIES.map((c) => c.id);
  if (!category) return { slug: "other", customCategory: "" };

  if (typeof category === "string") {
    if (allowed.includes(category))
      return { slug: category, customCategory: "" };
    return { slug: "other", customCategory: category };
  }

  const slug = category?.slug ?? category?.id ?? category?.name ?? "";
  const s = String(slug);
  if (allowed.includes(s)) return { slug: s, customCategory: "" };
  return {
    slug: "other",
    customCategory: category?.name ? String(category.name) : s,
  };
}

/** Statuses that go to admin review on publish, whatever the owner picked. */
const NEEDS_REVIEW = ["draft", "pending", "rejected"];

function mapStatusToService(value: unknown): string {
  const s = normalizeLower(value);
  if (s.includes("act")) return "active";
  if (s.includes("pause")) return "paused";
  if (s.includes("unavail") || s.includes("archiv")) return "unavailable";
  return "active";
}

/** The owner's choices back to the API's ServiceStatus, which has no
 * "active" or "unavailable". */
const SERVICE_STATUS_TO_API: Record<string, string> = {
  active: "available",
  unavailable: "archived",
};

function invertBillingRateToUnitLabel(billingRate: unknown): string {
  const br = normalizeLower(billingRate);
  const entry = Object.entries(BILLING_RATE_MAP).find(([, backendValue]) => {
    return normalizeLower(backendValue) === br;
  });
  return (entry?.[0] as string) || "Per Hour";
}

export function useHostServiceEdit(serviceId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const hostId = user?.id;

  const services = useServicesBuilder();

  const [isPrefilling, setIsPrefilling] = useState(true);
  const [prefillError, setPrefillError] = useState<string | null>(null);
  const [initialImageUrl, setInitialImageUrl] = useState<string>("");
  // The status as the API has it, before mapping to the owner's choices.
  const [listingStatus, setListingStatus] = useState<string>("");

  const backHref = "/creator-dashboard/services";

  useEffect(() => {
    if (!hostId || !serviceId) return;
    let cancelled = false;

    (async () => {
      setIsPrefilling(true);
      setPrefillError(null);
      try {
        const raw = await fetchServicesByOwnerId(hostId);
        const filtered = raw.filter((s) => belongsToHost(s, hostId));
        const found = filtered.find((s) => String(s?.id) === String(serviceId));

        if (!found) {
          if (!cancelled)
            setPrefillError("Service not found or not owned by you.");
          return;
        }
        if (cancelled) return;

        services.reset();
        services.initializeForType("service");
        services.setShowGuide(false);

        services.setTitle(found?.name ?? "");
        services.setDescription(found?.description ?? "");

        const { slug, customCategory } = mapCategoryToService(found?.category);
        services.setCategory(slug);
        services.setCustomCategory(customCategory);

        const parsedPrice = Number(found?.price ?? 0);
        services.setPrice(Number.isFinite(parsedPrice) ? parsedPrice : 0);

        services.setUnit(invertBillingRateToUnitLabel(found?.billingRate));
        // Only a live listing's status maps onto the owner's choices; one
        // still on its way to approval keeps the store's "draft" and goes to
        // review on publish (it used to come back as "active").
        const rawStatus = String(found?.status ?? "").toLowerCase();
        setListingStatus(rawStatus);
        if (!NEEDS_REVIEW.includes(rawStatus)) {
          services.setStatus(mapStatusToService(found?.status));
        }

        const firstImg = found?.images?.[0];
        const url = firstImg?.url ?? firstImg?.imageUrl ?? "";
        services.setImage(url);
        setInitialImageUrl(url);
        // Save Draft then updates this draft instead of creating another.
        if (rawStatus === "draft") services.adoptDraft(String(found.id), url);
      } catch (err: any) {
        console.error("Prefill service edit failed:", err);
        if (!cancelled) setPrefillError("Failed to load service.");
      } finally {
        if (!cancelled) setIsPrefilling(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [serviceId, hostId]);

  const handleBack = useCallback(() => {
    router.push(backHref);
  }, [router]);

  const successMessage = "Service updated successfully! Redirecting...";

  const handlePublish = useCallback(async () => {
    if (!serviceId) {
      services.setError("Invalid service id.");
      return;
    }

    if (!services.isReadyToPublish) {
      services.setError(
        "Please complete all required fields before publishing",
      );
      return;
    }

    services.setIsSubmitting(true);
    services.setIsNotification(false);
    services.setError(null);

    try {
      const parsedPrice =
        typeof services.price === "string"
          ? parseFloat(services.price)
          : Number(services.price);

      if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        throw new Error("Please enter a valid price before publishing");
      }

      // A changed image is uploaded and sent as a file id; the API replaces
      // the listing's image with it. (An `images: [{ url }]` body is ignored.)
      const imageChanged =
        typeof services.image === "string" &&
        services.image.trim() !== "" &&
        services.image !== initialImageUrl;
      const imgIds = imageChanged
        ? [await services.uploadPickedImage(services.image)]
        : undefined;

      const payload = {
        name: services.title,
        description: services.description,
        billingRate:
          BILLING_RATE_MAP[services.unit as keyof typeof BILLING_RATE_MAP] ||
          "hourly",
        category: services.category,
        price: parsedPrice,
        ...(imgIds && { imgIds }),
        cancellationPolicyId: services.cancellationPolicyId || undefined,
        status: NEEDS_REVIEW.includes(listingStatus)
          ? "pending"
          : (SERVICE_STATUS_TO_API[services.status] ?? services.status),
      };

      await updateService(serviceId, payload as any);
      // The public booking page reads this cache entry.
      queryClient.invalidateQueries({ queryKey: serviceQueryKey(serviceId) });

      services.setIsNotification(true);
      setTimeout(() => {
        services.reset();
        router.push(backHref);
      }, 1500);
    } catch (err: any) {
      console.error("Error updating service", err);
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (typeof err?.response?.data === "string" ? err.response.data : null);
      services.setError(
        backendMessage || err?.message || "Failed to update service",
      );
      services.setIsSubmitting(false);
      return;
    } finally {
      services.setIsSubmitting(false);
    }
  }, [backHref, initialImageUrl, listingStatus, serviceId, services, router]);

  return {
    ...services,
    isPrefilling,
    prefillError,
    successMessage,
    handleBack,
    handlePublish,
    // Save Draft is offered only on a draft: a live listing mustn't drop
    // back to draft by accident.
    isDraft: listingStatus === "draft",
  };
}
