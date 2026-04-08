import { useCallback, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useServiceBuilderStore } from "@/store/useServiceBuilderStore";
import { useDashboardStore } from "@/store/useDashboardStore";
import api from "@/lib/axios";
import { createService } from "@/lib/api/services";
import type { CreateServicePayload } from "@/lib/api/types";
import {
  SERVICE_CATEGORIES,
  SERVICE_STATUSES,
  BILLING_RATE_MAP,
  ServiceUnit,
} from "@/data/serviceBuilderData";

export function useServiceBuilder() {
  const router = useRouter();
  const store = useServiceBuilderStore();
  const [error, setError] = useState<string | null>(null);
  const [isNotification, setIsNotification] = useState(false);
  const [categoryMap, setCategoryMap] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/v1/categories");
        if (response.data?.data) {
          const map: { [key: string]: string } = {};
          response.data.data.forEach((cat: any) => {
            if (cat.slug) map[cat.slug] = String(cat.id);
          });
          setCategoryMap(map);
        }
      } catch (err) {
        console.warn("[useServiceBuilder] Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const categories = SERVICE_CATEGORIES;
  const currentStatuses = SERVICE_STATUSES;

  const completionPercentage = useMemo(() => {
    const { title, description, category, price } = store;
    return title && description && category && price > 0 ? 100 : 30;
  }, [store.title, store.description, store.category, store.price]);

  const isReadyToPublish = useMemo(() => completionPercentage === 100, [completionPercentage]);

  const displayCategory = useMemo(() => {
    if (store.category === "other" && store.customCategory) return store.customCategory;
    return categories.find((c) => c.id === store.category)?.label || "Uncategorized";
  }, [store.category, store.customCategory]);

  const getUserId = useCallback(() => {
    try {
      const stored = localStorage.getItem("fox_user");
      if (stored) {
        const session = JSON.parse(stored);
        return session.userId || session.id;
      }
    } catch (e) {
      console.error("[useServiceBuilder] Error getting user ID", e);
    }
    return null;
  }, []);

  const handleBack = useCallback(() => router.push("/host"), [router]);

  const handleSaveDraft = useCallback(() => {
    console.log("Saving service draft...", store);
  }, [store]);

  const handleImageUpload = useCallback((url: string) => store.setImage(url), [store]);

  const handleCategorySelect = useCallback(
    (catId: string) => {
      store.setCategory(catId);
      if (catId !== "other") store.setCustomCategory("");
    },
    [store]
  );

  const createServiceWithAPI = useCallback(
    async (serviceData: CreateServicePayload) => {
      try {
        return await createService(serviceData);
      } catch (err: any) {
        const { status, data } = err?.response || {};
        console.error("[useServiceBuilder] createService API error:", {
          status,
          message: err?.message,
          data,
        });

        // If payload too large and we included images, try again without images
        if (status === 413 && serviceData.images) {
          console.warn("[ServiceBuilder] Payload too large (413), retrying without images");
          const retryData = { ...serviceData };
          delete retryData.images;
          try {
            return await createService(retryData);
          } catch (err2: any) {
            console.error("[ServiceBuilder] Retry without images failed:", err2);
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
          "Failed to create service";
        setError(message);
        throw new Error(message);
      }
    },
    []
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
      if (!userId) throw new Error("User not authenticated");

      const serviceData: CreateServicePayload = {
        name: store.title,
        description: store.description,
        billingRate: BILLING_RATE_MAP[store.unit as ServiceUnit] || "hourly",
        category: store.category,
        price: typeof store.price === "string" ? parseFloat(store.price) : Number(store.price),
        ...(store.image && {
          images: [{ url: store.image, isThumbnail: true, altText: store.title }],
        }),
      };

      await createServiceWithAPI(serviceData);
      
      const dashboardStore = useDashboardStore.getState();
      await dashboardStore.refetchInventory();
      
      setIsNotification(true);
      setTimeout(() => {
        router.push("/host");
        store.reset();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to publish service");
      store.setIsSubmitting(false);
    }
  }, [isReadyToPublish, store, getUserId, createServiceWithAPI, router]);

  return {
    ...store,
    categories,
    currentStatuses,
    completionPercentage,
    isReadyToPublish,
    displayCategory,
    error,
    isNotification,
    setIsNotification,
    handleBack,
    handleSaveDraft,
    handlePublish,
    handleImageUpload,
    handleCategorySelect,
    setError,
  };
}
