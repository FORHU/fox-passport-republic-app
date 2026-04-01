import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { useServicesBuilder } from "@/hooks/listings/useServicesBuilder";
import { fetchServicesByHostId, updateService } from "@/lib/api/services";
import type { Id } from "@/lib/api/types";
import {
  SERVICE_CATEGORIES,
  SERVICE_STATUSES,
  SERVICE_UNITS,
  BILLING_RATE_MAP,
} from "@/data/serviceBuilderData";
import { useDashboardStore } from "@/store/useDashboardStore";

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
  return String(value ?? "").trim().toLowerCase().replace(/_/g, " ").replace(/\s+/g, " ");
}

function mapCategoryToService(category: any): { slug: string; customCategory: string } {
  const allowed = SERVICE_CATEGORIES.map((c) => c.id);
  if (!category) return { slug: "other", customCategory: "" };

  if (typeof category === "string") {
    if (allowed.includes(category)) return { slug: category, customCategory: "" };
    return { slug: "other", customCategory: category };
  }

  const slug = category?.slug ?? category?.id ?? category?.name ?? "";
  const s = String(slug);
  if (allowed.includes(s)) return { slug: s, customCategory: "" };
  return { slug: "other", customCategory: category?.name ? String(category.name) : s };
}

function mapStatusToService(value: unknown): string {
  const s = normalizeLower(value);
  if (s.includes("act")) return "active";
  if (s.includes("pause")) return "paused";
  if (s.includes("unavail")) return "unavailable";
  return "active";
}

function invertBillingRateToUnitLabel(billingRate: unknown): string {
  const br = normalizeLower(billingRate);
  const entry = Object.entries(BILLING_RATE_MAP).find(([, backendValue]) => {
    return normalizeLower(backendValue) === br;
  });
  return (entry?.[0] as string) || "Per Hour";
}

export function useHostServiceEdit(serviceId: string) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hostId = (user as any)?.id || (user as any)?.userId;

  const services = useServicesBuilder();
  const dashboardStore = useDashboardStore;

  const [isPrefilling, setIsPrefilling] = useState(true);
  const [prefillError, setPrefillError] = useState<string | null>(null);
  const [initialImageUrl, setInitialImageUrl] = useState<string>("");

  const backHref = "/host/services";

  useEffect(() => {
    if (!hostId || !serviceId) return;
    let cancelled = false;

    (async () => {
      setIsPrefilling(true);
      setPrefillError(null);
      try {
        const raw = await fetchServicesByHostId(hostId);
        const filtered = raw.filter((s) => belongsToHost(s, hostId));
        const found = filtered.find((s) => String(s?.id) === String(serviceId));

        if (!found) {
          if (!cancelled) setPrefillError("Service not found or not owned by you.");
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

        services.setUnit(invertBillingRateToUnitLabel(found?.billingRate ?? found?.unit));
        services.setStatus(mapStatusToService(found?.status));

        const firstImg = found?.assetImages?.[0];
        const url = firstImg?.url ?? firstImg?.imageUrl ?? "";
        services.setImage(url);
        setInitialImageUrl(url);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      services.setError("Please complete all required fields before publishing");
      return;
    }

    services.setIsSubmitting(true);
    services.setIsNotification(false);
    services.setError(null);

    try {
      const parsedPrice =
        typeof services.price === "string" ? parseFloat(services.price) : Number(services.price);

      if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        throw new Error("Please enter a valid price before publishing");
      }

      const payload = {
        name: services.title,
        description: services.description,
        billingRate:
          BILLING_RATE_MAP[
            services.unit as keyof typeof BILLING_RATE_MAP
          ] || "hourly",
        category: services.category,
        price: parsedPrice,
        ...(typeof services.image === "string" &&
        services.image.trim() !== "" &&
        services.image !== initialImageUrl
          ? {
              images: [
                { url: services.image, isThumbnail: true, altText: services.title },
              ],
            }
          : {}),
        status: services.status,
      };

      await updateService(serviceId, payload as any);
      await dashboardStore.getState().refetchInventory();

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
      services.setError(backendMessage || err?.message || "Failed to update service");
      services.setIsSubmitting(false);
      return;
    } finally {
      services.setIsSubmitting(false);
    }
  }, [backHref, dashboardStore, initialImageUrl, serviceId, services, router]);

  return {
    ...services,
    isPrefilling,
    prefillError,
    successMessage,
    handleBack,
    handlePublish,
  };
}

