import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useVenueBuilderStore } from "@/store/useVenueBuilderStore";
import api from "@/lib/axios";
import { toast } from "sonner";
import {
  RESOURCE_CATEGORIES,
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

  const handlePublish = useCallback(async () => {
    if (!store.venueName || !store.venueType) {
      toast.error("Please fill in the required fields (Name and Type)");
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

      const payload = {
        name: store.venueName,
        description: store.description,
        type: store.venueType.toLowerCase(),
        capacity: parseInt(store.capacity) || 0,
        address: store.location,
        city: store.city,
        state: store.state,
        country: store.country,
        price: store.baseRate,
        spaceType: allItems.filter(i => i.category === 'spaces').map(i => i.name),
        amenities: allItems.filter(i => i.category === 'amenities').map(i => i.name),
        techAv: allItems.filter(i => i.category === 'tech').map(i => i.name),
        staffing: allItems.filter(i => i.category === 'staff').map(i => i.name),
        policies: allItems.filter(i => i.category === 'rules').map(i => i.name),
        status: 'pending_review'
      };

      console.log("Publishing venue...", payload);
      const response = await api.post("/v1/venues", payload);

      // Backend now returns { message, venue } instead of { success, data }
      const createdVenue = response.data.venue;

      if (createdVenue && createdVenue.id) {
        const venueId = createdVenue.id;
        console.log("Venue created successfully with ID:", venueId);

        // Handle Image Uploads
        const galleryFiles = store.gallery.map(item => item.file).filter(file => file !== undefined) as File[];

        if (galleryFiles.length > 0) {
          console.log("🔍 Upload Debug:", {
            venueId,
            imageCount: galleryFiles.length,
            firstImageType: galleryFiles[0]?.constructor?.name,
            firstImageSize: galleryFiles[0]?.size,
            endpoint: `/v1/venues/${venueId}/images`
          });

          if (!venueId) {
            console.error("❌ Venue ID is missing - cannot upload images");
            toast.error("Venue created, but image upload failed: Venue ID missing");
            return;
          }

          console.log(`Uploading ${galleryFiles.length} images for venue ${venueId}...`);
          const formData = new FormData();
          galleryFiles.forEach(file => {
            formData.append("images", file);
          });

          try {
            const uploadUrl = `/v1/venues/${venueId}/images`;
            console.log("📤 Image Upload Attempt:", {
              url: uploadUrl,
              fullUrl: `${api.defaults.baseURL}${uploadUrl}`,
              filesCount: galleryFiles.length
            });

            const uploadResponse = await api.post(uploadUrl, formData);
            console.log("✅ Images uploaded successfully:", uploadResponse.data);
          } catch (uploadError: any) {
            console.error("❌ Image upload failed:", {
              name: uploadError.name,
              message: uploadError.message,
              status: uploadError.response?.status,
              statusText: uploadError.response?.statusText,
              data: uploadError.response?.data,
              url: uploadError.config?.url,
              code: uploadError.code
            });
            toast.error(`Venue created, but image upload failed: ${uploadError.message}`);
          }

        }

        toast.success("Venue submitted for review!");

        setTimeout(() => {
          router.push("/host");
          store.reset();
        }, 1500);
      }
    } catch (error: any) {
      console.error("Publishing error:", error);
      toast.error(error.response?.data?.message || "Failed to publish venue");
    } finally {
      store.setIsSubmitting(false);
    }
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
    handleRemoveCustomResource: store.removeCustomResource,
    addImageToGallery,
    removeImageFromGallery,
    handleBack,
    handleSaveDraft,
    handlePublish,
  };
}
