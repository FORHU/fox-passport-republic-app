import { useCallback, useMemo, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useListingBuilderStore } from "@/store/useListingBuilderStore";
import { useDashboardStore } from "@/store/useDashboardStore";
import api from "@/lib/axios";
import {
  ASSET_CATEGORIES,
  SERVICE_CATEGORIES,
  STATUSES,
  ListingType,
} from "@/data/listingBuilderData";

export function useListingBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const store = useListingBuilderStore();
  const [error, setError] = useState<string | null>(null);
  const [isNotification, setIsNotification] = useState(false);
  const [categoryMap, setCategoryMap] = useState<{ [key: string]: number }>({});

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
          const map: { [key: string]: number } = {};
          response.data.data.forEach((cat: any) => {
            if (cat.slug) {
              map[cat.slug] = cat.id;
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

  // Get categories based on type
  const categories = useMemo(() => {
    return store.activeType === "inventory"
      ? ASSET_CATEGORIES
      : SERVICE_CATEGORIES;
  }, [store.activeType]);

  // Get statuses based on type
  const currentStatuses = useMemo(() => {
    return store.activeType === "inventory"
      ? STATUSES.inventory
      : STATUSES.service;
  }, [store.activeType]);

  // Completion percentage
  const completionPercentage = useMemo(() => {
    const { title, description, category, image } = store;
    return title && description && category && image ? 100 : 30;
  }, [
    store.title,
    store.description,
    store.category,
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
    async (assetData: any) => {
      try {
        const response = await api.post("/v1/assets/create", assetData);
        return response.data.asset;
      } catch (err: any) {
        console.error("createAsset API error", err);
        const status = err?.response?.status;
        
        // if payload too large and we included image, try again without image
        if (status === 413 && assetData.images) {
          console.log("[Asset] Payload 413, retrying without images");
          delete assetData.images;
          try {
            const resp2 = await api.post("/v1/assets/create", assetData);
            return resp2.data.asset;
          } catch (err2) {
            console.error("[Asset] Retry without image failed", err2);
          }
        }
        
        // Handle auth error
        if (status === 401) {
          const message = "Not authenticated. Please log in again.";
          setError(message);
          throw new Error(message);
        }
        
        const message =
          err?.response?.data?.message || err.message || "Failed to create asset";
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
      if (store.activeType === "inventory") {
        // Create asset
        const userId = getUserId();
        let hostId = getHostId();
        
        if (!userId || hostId == null) {
          throw new Error("User not authenticated");
        }
        // ensure number type
        hostId = typeof hostId === "string" ? parseInt(hostId, 10) : hostId;

        // Map frontend category slug to backend category ID
        // try to look up numeric id from slug map; fall back to sending slug itself
        let categoryId: number | null = null;
        let categorySlug: string | undefined;
        if (store.category && store.category !== "other") {
          categoryId = categoryMap[store.category] || null;
          if (categoryId === null) {
            // map not ready or slug not found, send the slug for the server
            categorySlug = store.category;
            console.warn("[ListingBuilder] categoryId not found for slug", store.category);
          }
        }

        const assetData: any = {
          name: store.title,
          description: store.description,
          condition: store.condition as "new" | "good" | "fair" | "refurbished",
          hostId: hostId,
          // attach whichever field we were able to resolve
          ...(categoryId !== null && { categoryId }),
          ...(categorySlug && { categorySlug }),
          // Add image if available
          ...(store.image && {
            images: [
              {
                url: store.image,
                isThumbnail: true,
              },
            ],
          }),
        };
        console.log("creating asset with data", assetData);
        await createAssetWithAPI(assetData);
        
        // Refetch dashboard inventory to show the new asset
        const dashboardStore = useDashboardStore.getState();
        await dashboardStore.refetchInventory();
        
        // Show success notification
        setIsNotification(true);
        setTimeout(() => {
          router.push("/host");
        }, 1500);
      } else {
        // Service creation would go here in future
        console.log("Service creation not yet implemented");
        setTimeout(() => {
          router.push("/host");
        }, 2000);
      }
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

    // Handlers
    handleBack,
    handleSaveDraft,
    handlePublish,
    handleImageUpload,
    handleCategorySelect,
    setError,
  };
}
