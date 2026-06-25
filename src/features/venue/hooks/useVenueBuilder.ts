'use client';

import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useVenueBuilderStore } from "@/features/venue/store/useVenueBuilderStore";
import api from "@/shared/lib/axios";
import { toast } from "sonner";
import {
  RESOURCE_CATEGORIES,
  ResourceItem,
} from "@/features/venue/data/venueBuilderData";
import { useFileUpload } from "@/shared/hooks/useFileUpload";


export function useVenueBuilder() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const store = useVenueBuilderStore();
  const { uploadFile, isUploading } = useFileUpload();

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
      category: store.activeCategory,
    };
    store.addCustomResource(store.activeCategory, newResource);
    store.setNewItem({ name: "", value: "", desc: "" });
    store.setShowCustomForm(false);
  }, [store]);

  // Gallery handlers
  const addImageToGallery = useCallback((files: File[]) => {
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      store.addGalleryItem({
        id: Math.random().toString(36).substr(2, 9),
        url,
        caption: file.name,
        file
      });
    });
  }, [store]);

  const removeImageFromGallery = useCallback((id: string) => {
    store.removeGalleryItem(id);
  }, [store]);

  // Navigation handlers
  const handleBack = useCallback(() => {
    router.push("/creator-dashboard");
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

  const handlePublish = useCallback(async () => {
    const missing: string[] = [];
    if (!store.venueName) missing.push("Venue Name");
    if (!store.venueType) missing.push("Category");
    if (!store.description) missing.push("Description");
    if (!store.location) missing.push("Address");
    if (!store.city) missing.push("City");
    if (!store.country) missing.push("Country");

    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    const capacityNum = parseInt(store.capacity);
    if (isNaN(capacityNum) || capacityNum < 1) {
      toast.error("Capacity must be at least 1");
      return;
    }

    store.setIsSubmitting(true);
    try {
      const allItems = [...store.includedItems, ...store.addonItems];
      const galleryFiles = store.gallery.map(item => item.file).filter(file => file !== undefined) as File[];

      if (galleryFiles.length === 0) {
        toast.error("At least one image is required for your venue.");
        return;
      }

      const imgIds: string[] = [];
      for (const file of galleryFiles) {
        const uploadResult = await uploadFile(file);
        if (uploadResult && uploadResult.fileId) {
          imgIds.push(uploadResult.fileId);
        } else {
          throw new Error("One or more images failed to upload.");
        }
      }

      const payload = {
        name: store.venueName,
        description: store.description,
        category: store.venueType.toLowerCase().replace(/\s+/g, "_"),
        capacity: parseInt(store.capacity) || 1,
        address: store.location,
        city: store.city,
        state: store.state || undefined,
        country: store.country,
        price: store.baseRate,
        spaceType: allItems.filter(i => i.category === 'spaces').map(i => i.name),
        amenities: allItems.filter(i => i.category === 'amenities').map(i => i.name),
        techAv: allItems.filter(i => i.category === 'tech').map(i => i.name),
        staffing: allItems.filter(i => i.category === 'staff').map(i => i.name),
        policies: allItems.filter(i => i.category === 'rules').map(i => i.name),
        imgIds,
        status: 'pending',
      };

      const response = await api.post("/venues/create", payload);
      const createdVenue = response.data.venue;

      if (createdVenue && createdVenue.id) {
        toast.success("Venue submitted for review!");

        // Invalidate queries to ensure real-time update
        queryClient.invalidateQueries({ queryKey: ["host-data", "venues"] });
        queryClient.invalidateQueries({ queryKey: ["admin-data", "venues"] });

        setTimeout(() => {
          router.push("/creator-dashboard");
          store.reset();
        }, 1500);
      }
    } catch (error: any) {
      console.error("Publishing error:", error.response?.data || error.message || error);
      toast.error(error.response?.data?.message || error.message || "Failed to publish venue");
    } finally {
      store.setIsSubmitting(false);
    }
  }, [store, router, uploadFile]);

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
    handleRemoveCustomResource: store.removeCustomResource,
    addImageToGallery,
    removeImageFromGallery,
    handleBack,
    handleSaveDraft,
    handlePublish,
  };
}
