'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useInventoryBuilder } from "@/features/asset/hooks/useInventoryBuilder";
import { fetchAssetsByOwnerId, updateAsset } from "@/features/asset/api/assets";
import type { Id } from "@/shared/lib/api-types";
import { ASSET_CATEGORIES, CONDITIONS, STATUSES, INVENTORY_UNITS } from "@/features/asset/data/listingBuilderData";

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

function mapConditionToAllowed(value: unknown): string {
  const c = normalizeLower(value);
  if ((CONDITIONS as readonly string[]).includes(c as any)) return c;
  return "good";
}

function mapStatusToInventory(value: unknown): string {
  const s = normalizeLower(value);
  if (s.includes("avail")) return "available";
  if (s.includes("reserv")) return "reserved";
  if (s.includes("unavail")) return "unavailable";
  return "available";
}

function mapBillingRateToUnitLabel(billingRate: unknown, unitField: unknown): string {
  const br = normalizeLower(billingRate);
  const uf = normalizeLower(unitField);

  if (br === "daily" || uf.includes("day")) return "Per Item / Day";
  if (br === "one_time" || uf.includes("event") || uf.includes("item / event")) {
    if (uf.includes("flat")) return "Flat Rate";
    return "Per Item / Event";
  }
  if (uf.includes("flat")) return "Flat Rate";
  return "Per Item / Day";
}

function mapCategoryToInventory(category: any): { slug: string; customCategory: string } {
  const allowed = ASSET_CATEGORIES.map((c) => c.id);
  if (!category) return { slug: "other", customCategory: "" };

  if (typeof category === "string") {
    const maybe = category;
    if (allowed.includes(maybe)) return { slug: maybe, customCategory: "" };
    return { slug: "other", customCategory: maybe };
  }

  const slug = category?.slug ?? category?.id ?? category?.name ?? "";
  const s = String(slug);
  if (allowed.includes(s)) return { slug: s, customCategory: "" };
  return { slug: "other", customCategory: category?.name ? String(category.name) : s };
}

export function useHostAssetEdit(assetId: string) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hostId = user?.id || user?.userId;

  const inventory = useInventoryBuilder();

  const [isPrefilling, setIsPrefilling] = useState(true);
  const [prefillError, setPrefillError] = useState<string | null>(null);
  const [initialImageUrl, setInitialImageUrl] = useState<string>("");

  const backHref = "/creator-dashboard/assets";

  useEffect(() => {
    if (!hostId || !assetId) return;
    let cancelled = false;

    (async () => {
      setIsPrefilling(true);
      setPrefillError(null);
      try {
        const raw = await fetchAssetsByOwnerId(hostId);
        const filtered = raw.filter((a) => belongsToHost(a, hostId));
        const found = filtered.find((a) => String(a?.id) === String(assetId));

        if (!found) {
          if (!cancelled) setPrefillError("Asset not found or not owned by you.");
          return;
        }

        if (cancelled) return;

        // Ensure correct mode.
        inventory.initializeForType("inventory");

        inventory.reset();
        inventory.setShowGuide(false);

        inventory.setTitle(found?.name ?? "");
        inventory.setDescription(found?.description ?? "");

        const { slug, customCategory } = mapCategoryToInventory(found?.category);
        inventory.setCategory(slug);
        inventory.setCustomCategory(customCategory);

        inventory.setCondition(mapConditionToAllowed(found?.condition));

        const parsedPrice = Number(found?.price ?? 0);
        inventory.setPrice(Number.isFinite(parsedPrice) ? parsedPrice : 0);

        const mappedUnit = mapBillingRateToUnitLabel(found?.billingRate, "");
        inventory.setUnit(mappedUnit);

        inventory.setStatus(mapStatusToInventory(found?.status));

        const firstImg = found?.images?.[0];
        const url = firstImg?.url ?? firstImg?.imageUrl ?? "";
        inventory.setImage(url);
        setInitialImageUrl(url);
      } catch (err: any) {
        console.error("Prefill asset edit failed:", err);
        if (!cancelled) setPrefillError("Failed to load asset.");
      } finally {
        if (!cancelled) setIsPrefilling(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetId, hostId]);

  const handleBack = useCallback(() => {
    router.push(backHref);
  }, [router]);

  const successMessage = "Asset updated successfully! Redirecting...";

  const handlePublish = useCallback(async () => {
    if (!assetId) {
      inventory.setError("Invalid asset id.");
      return;
    }

    if (!inventory.isReadyToPublish) {
      inventory.setError("Please complete all required fields before publishing");
      return;
    }

    inventory.setIsSubmitting(true);
    inventory.setIsNotification(false);
    inventory.setError(null);

    try {
      const parsedPrice =
        typeof inventory.price === "string" ? parseFloat(inventory.price) : Number(inventory.price);

      if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        throw new Error("Please enter a valid price before publishing");
      }
      if (!inventory.unit) {
        throw new Error("Please select a billing unit before publishing");
      }

      // Map unit labels to backend billing rate values.
      const unitMap: Record<string, string> = {
        "Per Item / Day": "daily",
        "Per Item / Event": "one_time",
        "Flat Rate": "one_time",
      };

      const shouldIncludeImages =
        typeof inventory.image === "string" &&
        inventory.image.trim() !== "" &&
        inventory.image !== initialImageUrl;

      const payload = {
        name: inventory.title,
        description: inventory.description,
        categorySlug: inventory.category,
        price: parsedPrice,
        ...(shouldIncludeImages
          ? {
              images: [
                { url: inventory.image, isThumbnail: true, altText: inventory.title },
              ],
            }
          : {}),
        cancellationPolicyId: inventory.cancellationPolicyId || undefined,
        status: inventory.status,
      };

      await updateAsset(assetId, payload as any);

      inventory.setIsNotification(true);
      setTimeout(() => {
        inventory.reset();
        router.push(backHref);
      }, 1500);
    } catch (err: any) {
      console.error("Error updating asset", err);
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (typeof err?.response?.data === "string" ? err.response.data : null);
      inventory.setError(backendMessage || err?.message || "Failed to update asset");
      inventory.setIsSubmitting(false);
    }
  }, [assetId, backHref, initialImageUrl, inventory, router]);

  // Hide the builder’s default “create” back/publish handlers.
  return {
    ...inventory,
    isPrefilling,
    prefillError,
    successMessage,
    handleBack,
    handlePublish,
  };
}

