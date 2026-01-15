import { useCallback, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useListingBuilderStore } from "@/store/useListingBuilderStore";
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

  // Initialize type from URL params
  useEffect(() => {
    const typeParam = searchParams.get("type");
    const initialType: ListingType =
      typeParam === "service" ? "service" : "inventory";
    store.initializeForType(initialType);
  }, [searchParams]);

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
    const { title, description, price, category, image } = store;
    return title && description && price && category && image ? 100 : 30;
  }, [
    store.title,
    store.description,
    store.price,
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
      price: store.price,
    });
  }, [store]);

  const handlePublish = useCallback(() => {
    store.setIsSubmitting(true);
    setTimeout(() => {
      router.push("/host");
    }, 2000);
  }, [store, router]);

  const handleImageUpload = useCallback(() => {
    // TODO: Implement actual image upload
    store.setImage(
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=400"
    );
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

  return {
    // State
    ...store,
    categories,
    currentStatuses,
    completionPercentage,
    isReadyToPublish,
    displayCategory,

    // Handlers
    handleBack,
    handleSaveDraft,
    handlePublish,
    handleImageUpload,
    handleCategorySelect,
  };
}
