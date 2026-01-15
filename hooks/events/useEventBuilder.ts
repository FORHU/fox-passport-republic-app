import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useEventBuilderStore } from "@/store/useEventBuilderStore";
import {
  AVAILABLE_RESOURCES,
  VENUE_ICONS,
  TALENT_ICONS,
  ResourceItem,
} from "@/data/eventBuilderData";

export function useEventBuilder() {
  const router = useRouter();
  const store = useEventBuilderStore();

  // Get filtered resources based on active category and search
  const filteredResources = useMemo(() => {
    const resources = AVAILABLE_RESOURCES[store.activeCategory] || [];
    if (!store.searchQuery) return resources;
    return resources.filter((r) =>
      r.name.toLowerCase().includes(store.searchQuery.toLowerCase())
    );
  }, [store.activeCategory, store.searchQuery]);

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
  const addImageToGallery = useCallback(() => {
    const urls = [
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000",
      "https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=1000",
    ];
    store.addGalleryItem({
      id: Date.now().toString(),
      url: urls[store.gallery.length % urls.length],
      caption: "",
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

  const handlePublish = useCallback(() => {
    store.setIsSubmitting(true);
    // TODO: Replace with actual API call
    setTimeout(() => {
      router.push("/host");
    }, 2000);
  }, [store, router]);

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
