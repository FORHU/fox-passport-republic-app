import { useCallback, useMemo, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useListingBuilderStore } from "@/store/useListingBuilderStore";
import { useDashboardStore } from "@/store/useDashboardStore";
import api from "@/lib/axios";
import { createAsset } from "@/lib/api/assets";
import type { CreateAssetPayload } from "@/lib/api/types";
import {
  ASSET_CATEGORIES,
  STATUSES,
  ListingType,
} from "@/data/listingBuilderData";

export function useInventoryBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const store = useListingBuilderStore();
  const [error, setError] = useState<string | null>(null);
  const [isNotification, setIsNotification] = useState(false);
  const [categoryMap, setCategoryMap] = useState<{ [key: string]: string }>({});

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
        const response = await api.get("/v1/categories");
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
        
        // If payload too large and we included images, try again without images
        if (status === 413 && assetData.images) {
          console.warn("[InventoryBuilder] Payload too large (413), retrying without images");
          const retryData = { ...assetData };
          delete retryData.images;
          try {
            return await createAsset(retryData);
          } catch (err2: any) {
            console.error("[InventoryBuilder] Retry without images failed:", err2);
          }
        }
        
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
    router.push("/host");
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
    if (!isReadyToPublish) {
      setError("Please complete all required fields before publishing");
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

      const assetData: CreateAssetPayload = {
        name: store.title,
        description: store.description,
        condition: store.condition,
        categorySlug: store.category,
        price: parsedPrice,
        billingRate: unitMap[store.unit] || "daily",
        ...(store.image && {
          images: [{ url: store.image, isThumbnail: true, altText: store.title }],
        }),
      };
      
      console.log("[ListingBuilder] Publishing asset:", assetData);
      await createAssetWithAPI(assetData);
      
      // Refetch dashboard data
      const dashboardStore = useDashboardStore.getState();
      await dashboardStore.refetchInventory();
      
      // Show success notification
      setIsNotification(true);
      setTimeout(() => {
        router.push("/host");
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
