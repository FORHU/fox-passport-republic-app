import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useVenueBuilderStore } from "@/store/useVenueBuilderStore";
import {
  RESOURCE_CATEGORIES,
  SAMPLE_GALLERY_URLS,
  ResourceItem,
} from "@/data/venueBuilderData";

export function useVenueBuilder() {
  const router = useRouter();
  const store = useVenueBuilderStore();

  // Get filtered resources based on active category and search
  const filteredResources = useMemo(() => {
    const resources = store.resources[store.activeCategory] || [];
    if (!store.searchQuery) return resources;
    return resources.filter((r) =>
      r.name.toLowerCase().includes(store.searchQuery.toLowerCase())
    );
  }, [store.resources, store.activeCategory, store.searchQuery]);

  // Calculate revenue
  const revenue = useMemo(() => {
    const monthlyBase = store.baseRate * 30 * (store.occupancyRate / 100);
    const monthlyAddons =
      store.addonItems.reduce((acc, item) => acc + item.value, 0) *
      30 *
      (store.occupancyRate / 100) *
      0.2;
    return { monthlyBase, monthlyAddons, total: monthlyBase + monthlyAddons };
  }, [store.baseRate, store.occupancyRate, store.addonItems]);

  // Get current category label
  const currentCategoryLabel = useMemo(() => {
    return (
      RESOURCE_CATEGORIES.find((c) => c.id === store.activeCategory)?.label ||
      ""
    );
  }, [store.activeCategory]);

  // Drag handlers
  const handleDragStart = useCallback(
    (e: React.DragEvent, item: ResourceItem) => {
      store.setDraggedItem(item);
      e.dataTransfer.effectAllowed = "copy";
    },
    [store]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      store.setIsDragOver(true);
    },
    [store]
  );

  const handleDragLeave = useCallback(() => {
    store.setIsDragOver(false);
  }, [store]);

  const handleDrop = useCallback(
    (e: React.DragEvent, zone: "included" | "addon") => {
      e.preventDefault();
      store.setIsDragOver(false);
      if (store.draggedItem) {
        if (zone === "included") {
          store.addIncludedItem(store.draggedItem);
        } else {
          store.addAddonItem(store.draggedItem);
        }
      }
      store.setDraggedItem(null);
    },
    [store]
  );

  // Custom item handlers
  const handleAddCustomItem = useCallback(() => {
    if (!store.newItem.name) return;
    const newResource: ResourceItem = {
      id: `custom-${Date.now()}`,
      name: store.newItem.name,
      value: Number(store.newItem.value) || 0,
      icon:
        RESOURCE_CATEGORIES.find((c) => c.id === store.activeCategory)?.icon ||
        "star",
      desc: store.newItem.desc || "Custom item added by host.",
    };
    store.addCustomResource(store.activeCategory, newResource);
    store.setNewItem({ name: "", value: "", desc: "" });
    store.setShowCustomForm(false);
  }, [store]);

  // Gallery handlers
  const addImageToGallery = useCallback(() => {
    store.addGalleryItem({
      id: Date.now().toString(),
      url: SAMPLE_GALLERY_URLS[
        store.gallery.length % SAMPLE_GALLERY_URLS.length
      ],
      caption: "",
    });
  }, [store]);

  // Navigation handlers
  const handleBack = useCallback(() => {
    router.push("/host");
  }, [router]);

  const handleSaveDraft = useCallback(() => {
    console.log("Saving draft...", {
      venueName: store.venueName,
      description: store.description,
      venueType: store.venueType,
      capacity: store.capacity,
      location: store.location,
      includedItems: store.includedItems,
      addonItems: store.addonItems,
    });
  }, [store]);

  const handlePublish = useCallback(() => {
    store.setIsSubmitting(true);
    setTimeout(() => {
      router.push("/host");
    }, 2000);
  }, [store, router]);

  return {
    // State
    ...store,
    filteredResources,
    revenue,
    currentCategoryLabel,

    // Handlers
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleAddCustomItem,
    addImageToGallery,
    handleBack,
    handleSaveDraft,
    handlePublish,
  };
}
