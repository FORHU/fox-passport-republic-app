"use client";

import { useCallback, useMemo, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useListingBuilderStore } from "@/features/asset/store/useListingBuilderStore";
import api from "@/shared/lib/axios";
import { createAsset, updateAsset } from "@/features/asset/api/assets";
import { toast } from "sonner";
import type { CreateAssetPayload } from "@/shared/lib/api-types";
import {
  ASSET_CATEGORIES,
  STATUSES,
  ListingType,
} from "@/features/asset/data/listingBuilderData";
import { useFileUpload } from "@/shared/hooks/useFileUpload";
import { imageUrlToFile } from "@/shared/lib/imageFile";

export function useInventoryBuilder() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const store = useListingBuilderStore();
  const [error, setError] = useState<string | null>(null);
  const [isNotification, setIsNotification] = useState(false);
  const [, setCategoryMap] = useState<{ [key: string]: string }>({});
  const { uploadFile } = useFileUpload();
  // Set only on the edit page (adoptDraft), so a Studio never quietly
  // updates an earlier draft.
  const savedDraftId = useRef<string | null>(null);

  // Initialize type from URL params
  useEffect(() => {
    const typeParam = searchParams.get("type");
    const initialType: ListingType =
      typeParam === "service" ? "service" : "inventory";
    store.initializeForType(initialType);
  }, [searchParams]);

  // Fetch categories from API to map slugs to IDs
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        if (response.data?.data) {
          const map: { [key: string]: string } = {};
          response.data.data.forEach((cat: any) => {
            if (cat.slug) {
              map[cat.slug] = String(cat.id);
            }
          });
          setCategoryMap(map);
        }
      } catch (err) {
        console.warn("[useListingBuilder] Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Get categories (Inventory only)
  const categories = ASSET_CATEGORIES;

  // Get statuses (Inventory only)
  const currentStatuses = STATUSES.inventory;

  // Completion percentage
  const completionPercentage = useMemo(() => {
    const { title, description, category, image } = store;
    return title && description && category && image ? 100 : 30;
  }, [
    store.title,
    store.description,
    store.category,
    store.condition,
    store.price,
    store.status,
    store.unit,
    store.image,
  ]);

  // Is ready to publish
  const isReadyToPublish = useMemo(() => {
    return completionPercentage === 100;
  }, [completionPercentage]);

  // Get display category name
  const displayCategory = useMemo(() => {
    if (store.category === "other" && store.customCategory) {
      return store.customCategory;
    }
    return (
      categories.find((c) => c.id === store.category)?.label || "Uncategorized"
    );
  }, [store.category, store.customCategory, categories]);

  // Get user from localStorage
  const getUserId = useCallback(() => {
    try {
      const stored = localStorage.getItem("fox_user");
      if (stored) {
        const session = JSON.parse(stored);
        console.log(
          "[useListingBuilder] Retrieved session from localStorage:",
          {
            userId: session.userId || session.id,
            hasAccessToken: !!session.accessToken,
            hasToken: !!session.token,
            keys: Object.keys(session),
          },
        );
        return session.userId || session.id;
      } else {
        console.warn("[useListingBuilder] No fox_user found in localStorage");
      }
    } catch (e) {
      console.error("[useListingBuilder] Error getting user ID", e);
    }
    return null;
  }, []);

  // Get host id for asset - for now use userId
  const getHostId = useCallback(() => {
    return getUserId();
  }, [getUserId]);

  // Create asset via API
  const createAssetWithAPI = useCallback(
    async (assetData: CreateAssetPayload) => {
      try {
        return await createAsset(assetData);
      } catch (err: any) {
        const { status, data } = err?.response || {};
        console.error("[useInventoryBuilder] createAsset API error:", {
          status,
          message: err?.message,
          data,
        });

        // Handle specific status codes
        if (status === 401) {
          const message = "Not authenticated. Please log in again.";
          setError(message);
          throw new Error(message);
        }

        if (status === 400) {
          const message =
            data?.message ||
            data?.error ||
            "Invalid request. Please check required fields.";
          setError(message);
          throw new Error(message);
        }

        const message =
          data?.message ||
          data?.error ||
          err.message ||
          "Failed to create asset";
        setError(message);
        throw new Error(message);
      }
    },
    [],
  );

  // The picked image is uploaded once: a draft saved with it and then
  // published reuses the same file instead of uploading it twice.
  const uploadedImage = useRef<{ src: string; fileId: string } | null>(null);
  // An opened draft's image, already on the listing: not re-uploaded.
  const keptImage = useRef<string | null>(null);
  const uploadPickedImage = useCallback(
    async (src: string) => {
      if (uploadedImage.current?.src === src) {
        return uploadedImage.current.fileId;
      }
      const result = await uploadFile(await imageUrlToFile(src, "asset"));
      if (!result?.fileId) {
        throw new Error("Failed to upload image. Please try again.");
      }
      uploadedImage.current = { src, fileId: result.fileId };
      return result.fileId;
    },
    [uploadFile],
  );

  // Handlers
  const handleBack = useCallback(() => {
    router.push("/creator-dashboard");
  }, [router]);

  // A draft needs only a title. Its image, if one was picked, is saved with
  // it; the API asks for one only on publish.
  const handleSaveDraft = useCallback(async (): Promise<boolean> => {
    // Read live, not from this render: a second click mustn't start a
    // second save before the first has flipped the flag in a re-render.
    if (useListingBuilderStore.getState().isSubmitting) return false;
    if (!store.title.trim()) {
      setError("Add a title before saving a draft");
      return false;
    }
    store.setIsSubmitting(true);
    setError(null);
    try {
      const userId = getUserId();
      if (!userId) throw new Error("Not authenticated");

      const unitMap: Record<string, string> = {
        "Per Item / Day": "daily",
        "Per Item / Event": "one_time",
        "Flat Rate": "one_time",
      };
      const parsedPrice = Number(store.price) || 0;
      // A failed upload mustn't cost the user their progress: save the draft
      // without the image and say so.
      let imgIds: string[] = [];
      if (store.image && store.image !== keptImage.current) {
        try {
          imgIds = [await uploadPickedImage(store.image)];
        } catch {
          toast.error("Couldn't upload the image; saving the draft without it");
        }
      }

      if (savedDraftId.current) {
        await updateAsset(savedDraftId.current, {
          name: store.title,
          description: store.description || undefined,
          condition: store.condition || undefined,
          price: parsedPrice > 0 ? parsedPrice : undefined,
          billingRate: unitMap[store.unit] || "daily",
          city: store.city || undefined,
          state: store.state || undefined,
          country: store.country || undefined,
          lat: store.lat ?? undefined,
          lng: store.lng ?? undefined,
          cancellationPolicyId: store.cancellationPolicyId || undefined,
          status: "draft",
          ...(imgIds.length > 0 && { imgIds }),
        } as any);
        toast.success("Draft saved");
      } else {
        await createAsset({
          name: store.title,
          description: store.description || " ",
          condition: store.condition || "good",
          category: store.category || "other",
          price: parsedPrice > 0 ? parsedPrice : 1,
          billingRate: unitMap[store.unit] || "daily",
          city: store.city || undefined,
          state: store.state || undefined,
          country: store.country || undefined,
          lat: store.lat ?? undefined,
          lng: store.lng ?? undefined,
          imgIds,
          status: "draft",
          cancellationPolicyId: store.cancellationPolicyId || undefined,
        } as any);
        // Ready for the next one; this draft is under My Drafts.
        uploadedImage.current = null;
        store.initializeForType("inventory");
        toast.success("Draft saved. Find it under My Drafts.");
      }
      return true;
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to save draft";
      setError(msg);
      return false;
    } finally {
      store.setIsSubmitting(false);
    }
  }, [store, getUserId, uploadPickedImage]);

  // For the edit page: Save Draft updates the draft that's open rather than
  // creating a new one, and leaves its current image alone unless replaced.
  const adoptDraft = useCallback((id: string, currentImage?: string) => {
    savedDraftId.current = id;
    keptImage.current = currentImage || null;
  }, []);

  const handleImageUpload = useCallback(
    (url: string) => {
      // called by preview card when user selects a file
      store.setImage(url);
    },
    [store],
  );

  const handleCategorySelect = useCallback(
    (catId: string) => {
      store.setCategory(catId);
      if (catId !== "other") {
        store.setCustomCategory("");
      }
    },
    [store],
  );

  const handlePublish = useCallback(async () => {
    const missing: string[] = [];
    if (!store.title) missing.push("Title");
    if (!store.description) missing.push("Description");
    if (!store.category) missing.push("Category");
    if (!store.image) missing.push("Image");
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    store.setIsSubmitting(true);
    setError(null);

    try {
      const userId = getUserId();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Map unit to backend unit/rate value
      const unitMap: Record<string, string> = {
        "Per Item / Day": "daily",
        "Per Item / Event": "one_time",
        "Flat Rate": "one_time",
      };

      const parsedPrice =
        typeof store.price === "string"
          ? parseFloat(store.price)
          : Number(store.price);
      if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        throw new Error("Please enter a valid price before publishing");
      }
      if (!store.condition) {
        throw new Error("Please select an item condition before publishing");
      }
      if (!store.unit) {
        throw new Error("Please select a billing unit before publishing");
      }
      if (!store.image) {
        throw new Error("An image is required for publishing");
      }

      const fileId = await uploadPickedImage(store.image);

      // "unavailable" is a UI-only concept; the API's AssetStatus enum has no
      // such value, so map it to the closest backend equivalent.
      const statusMap: Record<string, string> = { unavailable: "archived" };
      const status = statusMap[store.status] ?? store.status;

      const assetData: CreateAssetPayload & { cancellationPolicyId?: string } =
        {
          name: store.title,
          description: store.description,
          condition: store.condition,
          category: store.category,
          price: parsedPrice,
          billingRate: unitMap[store.unit] || "daily",
          city: store.city || undefined,
          state: store.state || undefined,
          country: store.country || undefined,
          lat: store.lat ?? undefined,
          lng: store.lng ?? undefined,
          imgIds: [fileId],
          status,
          cancellationPolicyId: store.cancellationPolicyId || undefined,
        };

      console.log("[ListingBuilder] Publishing asset:", assetData);
      if (savedDraftId.current) {
        await updateAsset(savedDraftId.current, {
          ...assetData,
          status: "pending",
        } as any);
      } else {
        await createAssetWithAPI(assetData);
      }

      // Invalidate queries to ensure real-time update
      queryClient.invalidateQueries({ queryKey: ["host-data", "assets"] });
      queryClient.invalidateQueries({ queryKey: ["admin-data", "assets"] });

      // Show success notification
      setIsNotification(true);
      setTimeout(() => {
        router.push("/creator-dashboard");
        store.reset();
      }, 1500);
    } catch (err: any) {
      console.error("Error publishing listing", err);
      setError(err.message || "Failed to publish listing");
      store.setIsSubmitting(false);
    }
  }, [
    isReadyToPublish,
    store,
    getUserId,
    getHostId,
    createAssetWithAPI,
    router,
    uploadPickedImage,
  ]);

  return {
    // State
    ...store,
    categories,
    currentStatuses,
    completionPercentage,
    isReadyToPublish,
    displayCategory,
    error,
    isNotification,
    setIsNotification,

    // Handlers
    handleBack,
    handleSaveDraft,
    adoptDraft,
    // Owned here, not derived from the store's type, which another builder
    // mounted on the same page could change.
    myDraftsHref: "/creator-dashboard/assets?status=draft",
    handlePublish,
    handleImageUpload,
    handleCategorySelect,
    uploadPickedImage,
    setError,
  };
}
