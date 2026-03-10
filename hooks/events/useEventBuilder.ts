import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useEventBuilderStore } from "@/store/useEventBuilderStore";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  AVAILABLE_RESOURCES,
  VENUE_ICONS,
  TALENT_ICONS,
  ResourceItem,
} from "@/data/eventBuilderData";

export function useEventBuilder() {
  const router = useRouter();
  const store = useEventBuilderStore();

  const [realVenues, setRealVenues] = useState<ResourceItem[]>([]);

  // Fetch real venues on mount
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await api.get("/v1/venues?status=published");
        if (response.data.success) {
          const venues = response.data.data.map((v: any) => ({
            id: v.id,
            name: v.name,
            cost: v.baseRate || 10000, // Fallback cost
            icon: "location_city",
            desc: v.description || "Real venue from your gallery."
          }));
          setRealVenues(venues);
        }
      } catch (error) {
        console.error("Error fetching venues:", error);
      }
    };
    fetchVenues();
  }, []);

  // Get filtered resources based on active category and search
  const filteredResources = useMemo(() => {
    let resources = AVAILABLE_RESOURCES[store.activeCategory] || [];

    // Use real venues if in venue category
    if (store.activeCategory === "venue" && realVenues.length > 0) {
      resources = realVenues;
    }

    if (!store.searchQuery) return resources;
    return resources.filter((r) =>
      r.name.toLowerCase().includes(store.searchQuery.toLowerCase())
    );
  }, [store.activeCategory, store.searchQuery, realVenues]);

  // Calculate financials
  const financials = useMemo(() => {
    const baseCost = store.baseItems.reduce((acc, item) => acc + item.cost, 0);
    const suggestedPrice = baseCost * (1 + store.targetMargin / 100);

    const venueCost = store.baseItems
      .filter((i) => VENUE_ICONS.includes(i.icon))
      .reduce((a, b) => a + b.cost, 0);

    const talentCost = store.baseItems
      .filter((i) => TALENT_ICONS.includes(i.icon))
      .reduce((a, b) => a + b.cost, 0);

    return { baseCost, suggestedPrice, venueCost, talentCost };
  }, [store.baseItems, store.targetMargin]);

  // Calculate blueprint health
  const blueprintHealth = useMemo(() => {
    if (financials.baseCost > 0 && store.gallery.length >= 5) return 100;
    if (financials.baseCost > 0) return 60;
    return 10;
  }, [financials.baseCost, store.gallery.length]);

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
    (e: React.DragEvent) => {
      e.preventDefault();
      store.setIsDragOver(false);
      if (store.draggedItem) {
        store.addBaseItem(store.draggedItem);
      }
      store.setDraggedItem(null);
    },
    [store]
  );

  // Gallery handlers
  const addImageToGallery = useCallback((files: File[]) => {
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      store.addGalleryItem({
        id: Math.random().toString(36).substr(2, 9),
        url: url,
        caption: file.name,
      });
    });
  }, [store]);

  // Navigation handlers
  const handleBack = useCallback(() => {
    router.push("/host");
  }, [router]);

  const handleSaveDraft = useCallback(() => {
    // TODO: Implement save draft API call
    console.log("Saving draft...", {
      eventTitle: store.eventTitle,
      description: store.description,
      category: store.category,
      date: store.date,
      location: store.location,
      gallery: store.gallery,
      baseItems: store.baseItems,
    });
  }, [store]);

  const handlePublish = useCallback(async () => {
    // 1. Validation
    if (!store.eventTitle || !store.category) {
      toast.error("Please fill in the title and category");
      return;
    }

    const venueItem = store.baseItems.find(i => VENUE_ICONS.includes(i.icon)) || realVenues[0];
    if (!venueItem) {
      toast.error("Please select a venue for your event");
      return;
    }

    store.setIsSubmitting(true);
    try {
      // 2. Prepare Payload
      const payload = {
        name: store.eventTitle,
        description: store.description || "Epic event created via Studio.",
        venueId: venueItem.id, // Use real UUID
        eventType: store.category.toLowerCase().replace(" ", "_").replace("experience", "experience"), // Map to enum
        startDatetime: new Date(store.date || Date.now()),
        endDatetime: new Date(Date.now() + 4 * 60 * 60 * 1000), // Default 4 hours later
        maxAttendees: 100,
        totalPrice: financials.suggestedPrice,
        status: 'published'
      };

      // 3. Create Event
      const response = await api.post("/v1/events", payload);

      if (response.data.success) {
        toast.success("Event blueprint published!");

        // 4. Link Assets and Services (optional follow-up)
        // Here we would ideally call addAssetToEvent for each baseItem

        setTimeout(() => {
          router.push("/host");
          store.reset();
        }, 1500);
      }
    } catch (error: any) {
      console.error("Publishing error:", error);
      toast.error(error.response?.data?.message || "Failed to publish event");
    } finally {
      store.setIsSubmitting(false);
    }
  }, [store, router, financials, realVenues]);

  return {
    // State
    ...store,
    filteredResources,
    financials,
    blueprintHealth,

    // Handlers
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    addImageToGallery,
    handleBack,
    handleSaveDraft,
    handlePublish,
  };
}
