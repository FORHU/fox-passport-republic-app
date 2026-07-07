'use client';

import { useCallback, useMemo, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useListingBuilderStore } from "@/features/asset/store/useListingBuilderStore";
import api from "@/shared/lib/axios";
import { createAsset } from "@/features/asset/api/assets";
import type { CreateAssetPayload } from "@/shared/lib/api-types";
import {
  ASSET_CATEGORIES,
  STATUSES,
  ListingType,
} from "@/features/asset/data/listingBuilderData";
import { useFileUpload } from "@/shared/hooks/useFileUpload";

export function useInventoryBuilder() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const store = useListingBuilderStore();
  const [error, setError] = useState<string | null>(null);
  const [isNotification, setIsNotification] = useState(false);
  const [categoryMap, setCategoryMap] = useState<{ [key: string]: string }>({});
  const { uploadFile, isUploading } = useFileUpload();

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
        console.log("[useListingBuilder] Retrieved session from localStorage:", {
          userId: session.userId || session.id,
          hasAccessToken: !!session.accessToken,
          hasToken: !!session.token,
          keys: Object.keys(session),
        });
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
          const message = data?.message || data?.error || "Invalid request. Please check required fields.";
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
    []
  );

  // Handlers
  const handleBack = useCallback(() => {
    router.push("/creator-dashboard");
  }, [router]);

  const handleSaveDraft = useCallback(() => {
    console.log("Saving draft...", {
      type: store.activeType,
      title: store.title,
      description: store.description,
      category: store.category,
    });
  }, [store]);

  const handleImageUpload = useCallback((url: string) => {
    // called by preview card when user selects a file
    store.setImage(url);
  }, [store]);

  const handleCategorySelect = useCallback(
    (catId: string) => {
      store.setCategory(catId);
      if (catId !== "other") {
        store.setCustomCategory("");
      }
    },
    [store]
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
        typeof store.price === "string" ? parseFloat(store.price) : Number(store.price);
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

      // Convert local blob URL to File and upload to S3
      const response = await fetch(store.image);
      const blob = await response.blob();
      const file = new File([blob], `asset-${Date.now()}.jpg`, { type: blob.type });

      const uploadResult = await uploadFile(file);
      if (!uploadResult || !uploadResult.fileId) {
        throw new Error("Failed to upload image. Please try again.");
      }

      const assetData: CreateAssetPayload & { cancellationPolicyId?: string } = {
        name: store.title,
        description: store.description,
        condition: store.condition,
        category: store.category,
        price: parsedPrice,
        billingRate: unitMap[store.unit] || "daily",
        imgIds: [uploadResult.fileId],
        cancellationPolicyId: store.cancellationPolicyId || undefined,
      };
      
      console.log("[ListingBuilder] Publishing asset:", assetData);
      await createAssetWithAPI(assetData);

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
    uploadFile,
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
    handlePublish,
    handleImageUpload,
    handleCategorySelect,
    setError,
  };
}
