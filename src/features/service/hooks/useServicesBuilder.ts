"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { useListingBuilderStore } from "@/shared/store/useListingBuilderStore";
import { createService, updateService } from "@/features/service/api/services";
import { toast } from "sonner";
import type { CreateServicePayload } from "@/shared/lib/api-types";
import {
  SERVICE_CATEGORIES,
  PERFORMER_SERVICE_CATEGORIES,
  SERVICE_STATUSES,
  SERVICE_STATUS_TO_API,
  BILLING_RATE_MAP,
  ServiceUnit,
  type ServiceStudioMode,
} from "@/features/service/data/serviceBuilderData";
import { useFileUpload } from "@/shared/hooks/useFileUpload";
import { imageUrlToFile } from "@/shared/lib/imageFile";

/** `mode: "performer"` offers the gig categories instead of the operational ones. */
export function useServicesBuilder({
  mode = "service",
}: { mode?: ServiceStudioMode } = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const store = useListingBuilderStore();
  const [error, setError] = useState<string | null>(null);
  const [isNotification, setIsNotification] = useState(false);
  const { uploadFile } = useFileUpload();
  // Set only on the edit page (adoptDraft), so a Studio never quietly
  // updates an earlier draft.
  const savedDraftId = useRef<string | null>(null);

  // Ensure the shared store is initialized for service mode
  useEffect(() => {
    store.initializeForType("service");
    return () => {
      store.reset();
    };
  }, []);

  // Categories and statuses specifically for services
  const categories =
    mode === "performer" ? PERFORMER_SERVICE_CATEGORIES : SERVICE_CATEGORIES;
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
  }, [store.category, store.customCategory, categories]);

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
          "Failed to create service";
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
      const result = await uploadFile(await imageUrlToFile(src, "service"));
      if (!result?.fileId) {
        throw new Error("Failed to upload image. Please try again.");
      }
      uploadedImage.current = { src, fileId: result.fileId };
      return result.fileId;
    },
    [uploadFile],
  );

  const handleBack = useCallback(() => {
    router.push("/creator-dashboard");
  }, [router]);

  // A draft needs only a title. Its image, if one was picked, is saved with
  // it; the API asks for one only on publish. In the Studio a saved draft
  // clears the form for the next one (it's under My Drafts); on the edit
  // page, Save Draft keeps updating the draft that's open.
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
        await updateService(savedDraftId.current, {
          name: store.title,
          description: store.description || undefined,
          billingRate: BILLING_RATE_MAP[store.unit as ServiceUnit] || "hourly",
          // The API takes the ServiceCategory slug, not a catalog id.
          category: store.category || undefined,
          price: parsedPrice > 0 ? parsedPrice : undefined,
          cancellationPolicyId: store.cancellationPolicyId || undefined,
          status: "draft",
          ...(imgIds.length > 0 && { imgIds }),
        } as any);
        toast.success("Draft saved");
      } else {
        await createService({
          name: store.title,
          description: store.description || undefined,
          billingRate: BILLING_RATE_MAP[store.unit as ServiceUnit] || "hourly",
          category: store.category || "other",
          price: parsedPrice > 0 ? parsedPrice : 1,
          city: "N/A",
          country: "PH",
          imgIds,
          status: "draft",
          cancellationPolicyId: store.cancellationPolicyId || undefined,
        } as any);
        // Ready for the next one; this draft is under My Drafts.
        uploadedImage.current = null;
        store.initializeForType("service");
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
    if (!store.price || store.price <= 0) missing.push("Price");
    if (!store.image) missing.push("Image");
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(", ")}`);
      return;
    }
    // A new service goes up with the Initial Status the owner sees checked,
    // never as a draft. (An opened draft goes to review below instead.)
    if (
      !savedDraftId.current &&
      !(currentStatuses as readonly string[]).includes(store.status)
    ) {
      setError("Pick an Initial Status");
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

      if (!store.image) {
        throw new Error("An image is required for publishing");
      }

      const fileId = await uploadPickedImage(store.image);

      const serviceData: CreateServicePayload & {
        cancellationPolicyId?: string;
      } = {
        name: store.title,
        description: store.description,
        billingRate: BILLING_RATE_MAP[store.unit as ServiceUnit] || "hourly",
        category: store.category,
        price:
          typeof store.price === "string"
            ? parseFloat(store.price)
            : Number(store.price),
        city: store.city || "N/A",
        state: store.state || undefined,
        country: store.country || "PH",
        lat: store.lat ?? undefined,
        lng: store.lng ?? undefined,
        imgIds: [fileId],
        // Without a status the API saves a draft.
        status: SERVICE_STATUS_TO_API[store.status] ?? store.status,
        cancellationPolicyId: store.cancellationPolicyId || undefined,
      };

      console.log("[ServicesBuilder] Publishing service:", serviceData);
      // Publishing after Save Draft finishes that draft, as the Gear builder
      // does, rather than creating a second listing beside it.
      if (savedDraftId.current) {
        await updateService(savedDraftId.current, {
          ...serviceData,
          status: "pending",
        } as any);
      } else {
        await createServiceWithAPI(serviceData);
      }

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
  }, [
    isReadyToPublish,
    store,
    getUserId,
    createServiceWithAPI,
    router,
    uploadPickedImage,
    currentStatuses,
  ]);

  return {
    ...store,
    mode,
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
    adoptDraft,
    // Owned here, not derived from the store's type, which another builder
    // mounted on the same page could change.
    myDraftsHref: "/creator-dashboard/services?status=draft",
    handlePublish,
    handleImageUpload,
    handleCategorySelect,
    uploadPickedImage,
    setError,
  };
}
