'use client';

import { useCallback, useMemo, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useListingBuilderStore } from "@/features/asset/store/useListingBuilderStore";
import api from "@/shared/lib/axios";
import { createService } from "@/features/service/api/services";
import type { CreateServicePayload } from "@/shared/lib/api-types";
import {
  SERVICE_CATEGORIES,
  SERVICE_STATUSES,
  BILLING_RATE_MAP,
  ServiceUnit,
} from "@/features/service/data/serviceBuilderData";
import { useFileUpload } from "@/shared/hooks/useFileUpload";

export function useServicesBuilder() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const store = useListingBuilderStore();
  const [error, setError] = useState<string | null>(null);
  const [isNotification, setIsNotification] = useState(false);
  const [categoryMap, setCategoryMap] = useState<{ [key: string]: string }>({});
  const { uploadFile, isUploading } = useFileUpload();

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
        console.warn("[useServicesBuilder] Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Categories and statuses specifically for services
  const categories = SERVICE_CATEGORIES;
  const currentStatuses = SERVICE_STATUSES;

  // Completion percentage
  const completionPercentage = useMemo(() => {
    const { title, description, category, price } = store;
    // For services, image might be optional, but title/desc/cat/price are usually core
    return title && description && category && price > 0 ? 100 : 30;
  }, [store.title, store.description, store.category, store.price]);

  const isReadyToPublish = useMemo(() => {
    return completionPercentage === 100;
  }, [completionPercentage]);

  const displayCategory = useMemo(() => {
    if (store.category === "other" && store.customCategory) {
      return store.customCategory;
    }
    return (
      categories.find((c) => c.id === store.category)?.label || "Uncategorized"
    );
  }, [store.category, store.customCategory]);

  const getUserId = useCallback(() => {
    try {
      const stored = localStorage.getItem("fox_user");
      if (stored) {
        const session = JSON.parse(stored);
        return session.userId || session.id;
      }
    } catch (e) {
      console.error("[useServicesBuilder] Error getting user ID", e);
    }
    return null;
  }, []);

  const createServiceWithAPI = useCallback(
    async (serviceData: CreateServicePayload) => {
      try {
        return await createService(serviceData);
      } catch (err: any) {
        const { status, data } = err?.response || {};
        console.error("[useServicesBuilder] createService API error:", {
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
          "Failed to create service";
        setError(message);
        throw new Error(message);
      }
    },
    []
  );

  const handleBack = useCallback(() => {
    router.push("/creator-dashboard");
  }, [router]);

  const handleSaveDraft = useCallback(() => {
    console.log("Saving service draft...", {
      title: store.title,
      description: store.description,
      category: store.category,
      price: store.price,
      unit: store.unit
    });
  }, [store]);

  const handleImageUpload = useCallback((url: string) => {
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
    if (!store.price || store.price <= 0) missing.push("Price");
    if (!store.image) missing.push("Image");
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    store.setIsSubmitting(true);
    setError(null);

    try {
      // Verify user is logged in
      const userId = getUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }
      const stringHostId = String(userId);

      if (!store.image) {
        throw new Error("An image is required for publishing");
      }

      // Convert local blob URL to File and upload to S3
      const response = await fetch(store.image);
      const blob = await response.blob();
      const file = new File([blob], `service-${Date.now()}.jpg`, { type: blob.type });

      const uploadResult = await uploadFile(file);
      if (!uploadResult || !uploadResult.fileId) {
        throw new Error("Failed to upload image. Please try again.");
      }

      const serviceData: CreateServicePayload = {
        name: store.title,
        description: store.description,
        billingRate: BILLING_RATE_MAP[store.unit as ServiceUnit] || "hourly",
        category: store.category,
        price:
          typeof store.price === "string" ? parseFloat(store.price) : Number(store.price),
        city: (store as any).city || 'N/A',
        country: (store as any).country || 'PH',
        imgIds: [uploadResult.fileId],
      };

      console.log("[ServicesBuilder] Publishing service:", serviceData);
      await createServiceWithAPI(serviceData);

      // Invalidate queries to ensure real-time update
      queryClient.invalidateQueries({ queryKey: ["host-data", "services"] });
      queryClient.invalidateQueries({ queryKey: ["admin-data", "services"] });

      setIsNotification(true);
      setTimeout(() => {
        router.push("/creator-dashboard");
        store.reset();
      }, 1500);
    } catch (err: any) {
      console.error("Error publishing service", err);
      setError(err.message || "Failed to publish service");
      store.setIsSubmitting(false);
    }
  }, [isReadyToPublish, store, getUserId, createServiceWithAPI, router, uploadFile]);

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
