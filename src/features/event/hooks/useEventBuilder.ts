'use client';

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useEventBuilderStore } from "@/features/event/store/useEventBuilderStore";
import api from "@/shared/lib/axios";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  VENUE_ICONS,
  TALENT_ICONS,
  ResourceItem,
} from "@/features/event/data/eventBuilderData";

export function useEventBuilder() {
  const router = useRouter();
  const store = useEventBuilderStore();

  const [realResources, setRealResources] = useState<Record<string, ResourceItem[]>>({
    venue: [],
    talent: [],
    service: [],
    equipment: [],
    vibe: [],
  });

  // Fetch real data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Venues
        const venueResp = await api.get("/venues");
        let venues: ResourceItem[] = [];
        const rawVenues = venueResp.data.venues || venueResp.data.data || (Array.isArray(venueResp.data) ? venueResp.data : []);
        
        if (rawVenues && Array.isArray(rawVenues)) {
          venues = rawVenues
            .filter((v: Record<string, unknown>) => (v.status as string)?.toLowerCase() === "published")
            .map((v: Record<string, unknown>) => ({
               id: String(v.id),
               name: String(v.name ?? ""),
               cost: Number(v.baseRate || 10000),
               icon: "location_city",
               desc: String(v.description || "Real venue from your gallery."),
               resourceType: "venue"
             }));
        }

        // Fetch Assets/Services
        const [assetResp, serviceResp] = await Promise.all([
          api.get("/assets"),
          api.get("/services")
        ]);

        const talent: ResourceItem[] = [];
        const service: ResourceItem[] = [];
        const equipment: ResourceItem[] = [];
        const vibe: ResourceItem[] = [];

        // Process Assets
        if (assetResp.data.assets) {
          assetResp.data.assets.forEach((a: Record<string, unknown>) => {
            const item: ResourceItem = {
              id: a.id,
              name: a.name,
              cost: a.price || 5000,
              icon: a.category?.icon || "inventory_2",
              desc: a.description || "Real asset from the database.",
              resourceType: "asset"
            };

            const slug = a.category?.slug?.toLowerCase();
            if (slug === "entertainment") {
              talent.push({ ...item, icon: "music_note" });
            } else if (["planning", "catering", "photography"].includes(slug)) {
              service.push({ ...item, icon: slug === "catering" ? "restaurant" : slug === "photography" ? "camera_alt" : "event_note" });
            } else if (slug === "equipment") {
              equipment.push({ ...item, icon: "speaker" });
            } else if (["decoration", "furniture"].includes(slug)) {
              vibe.push({ ...item, icon: slug === "furniture" ? "chair" : "brush" });
            } else {
              service.push(item);
            }
          });
        }

        // Process Services
        const rawServices = serviceResp.data.services || serviceResp.data.data || [];
        if (Array.isArray(rawServices)) {
          rawServices.forEach((s: Record<string, unknown>) => {
            const item: ResourceItem = {
              id: s.id,
              name: s.name,
              cost: s.price || 7500,
              icon: "work_outline",
              desc: s.description || "Premium service for your event.",
              resourceType: "service"
            };

            // Services have category as a string
            const category = typeof s.category === 'string' ? s.category.toLowerCase() : s.category?.slug?.toLowerCase();
            
             if (category === "entertainment") {
               talent.push({ ...item, icon: "music_note" });
             } else if (["planning", "catering", "photography", "videography"].includes(category)) {
               const iconMap: Record<string, string> = { 
                 catering: "restaurant", 
                 photography: "camera_alt", 
                 videography: "videocam",
                 planning: "event_note" 
               };
               service.push({ ...item, icon: iconMap[category] || "work_outline" });
             } else {
              service.push(item);
            }
          });
        }

        setRealResources({
          venue: venues,
          talent,
          service,
          equipment,
          vibe,
        });
      } catch (error) {
        console.error("Error fetching event builder data:", error);
      }
    };
    fetchData();
  }, []);

  // Get filtered resources based on active category and search
  const filteredResources = useMemo(() => {
    const resources = realResources[store.activeCategory] || [];

    if (!store.searchQuery) return resources;
    return resources.filter((r) =>
      r.name.toLowerCase().includes(store.searchQuery.toLowerCase())
    );
  }, [store.activeCategory, store.searchQuery, realResources]);

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
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          store.addGalleryItem({
            id: Math.random().toString(36).substr(2, 9),
            url: reader.result as string,
            caption: file.name,
          });
        }
      };
      reader.readAsDataURL(file);
    });
  }, [store]);

  // Navigation handlers
  const handleBack = useCallback(() => {
    router.push("/creator-dashboard");
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
    const missing: string[] = [];
    if (!store.eventTitle) missing.push("Event Title");
    if (!store.category) missing.push("Category");
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    const venueItem = store.baseItems.find(i => VENUE_ICONS.includes(i.icon)) || realResources.venue[0];
    if (!venueItem) {
      toast.error("Please select a venue for your event");
      return;
    }

    store.setIsSubmitting(true);
    try {
      // 2. Prepare Payload
      const safeEventTypeMapping: Record<string, string> = {
        corporate: 'corporate',
        birthday: 'birthday',
        wedding: 'wedding',
        social: 'social',
        other: 'other',
      };

      const rawCategory = store.category.toLowerCase().replace(/\s+/g, '_');
      const eventType = safeEventTypeMapping[rawCategory] || 'other';

      const payload = {
        name: store.eventTitle,
        description: store.description || "Event created via Creator Studio.",
        category: eventType,
        isPublic: false,
        cancellationPolicyId: store.cancellationPolicyId || undefined,
      };

      // 3. Create event template
      const response = await api.post("/event-templates", payload);
      const created = response.data?.template ?? response.data?.data ?? response.data;

      if (created?.id) {
        // 4. Attach venue, assets, and services via association endpoints
        try {
          if (venueItem?.id) {
            await api.post(`/event-templates/${created.id}/venues`, {
              venueId: venueItem.id,
              agreedPrice: venueItem.agreedPrice ?? venueItem.cost,
              isOptional: venueItem.isOptional ?? false,
            });
          }
          for (const item of store.baseItems) {
            if (item.resourceType === 'asset' && item.id) {
              await api.post(`/event-templates/${created.id}/assets`, {
                assetId: item.id,
                quantity: 1,
                agreedPrice: item.agreedPrice ?? item.cost,
                isOptional: item.isOptional ?? false,
              });
            } else if (item.resourceType === 'service' && item.id) {
              await api.post(`/event-templates/${created.id}/services`, {
                serviceId: item.id,
                agreedPrice: item.agreedPrice ?? item.cost,
                isOptional: item.isOptional ?? false,
              });
            }
              service.push(item);
            }
          });
        }

        setRealResources({
          venue: venues,
          talent,
          service,
          equipment,
          vibe,
        });
      } catch (error) {
        console.error("Error fetching event builder data:", error);
      }
    };
    fetchData();
  }, []);

  // Get filtered resources based on active category and search
  const filteredResources = useMemo(() => {
    const resources = realResources[store.activeCategory] || [];

    if (!store.searchQuery) return resources;
    return resources.filter((r) =>
      r.name.toLowerCase().includes(store.searchQuery.toLowerCase())
    );
  }, [store.activeCategory, store.searchQuery, realResources]);

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
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          store.addGalleryItem({
            id: Math.random().toString(36).substr(2, 9),
            url: reader.result as string,
            caption: file.name,
          });
        }
      };
      reader.readAsDataURL(file);
    });
  }, [store]);

  // Navigation handlers
  const handleBack = useCallback(() => {
    router.push("/creator-dashboard");
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
    const missing: string[] = [];
    if (!store.eventTitle) missing.push("Event Title");
    if (!store.category) missing.push("Category");
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    const venueItem = store.baseItems.find(i => VENUE_ICONS.includes(i.icon)) || realResources.venue[0];
    if (!venueItem) {
      toast.error("Please select a venue for your event");
      return;
    }

    store.setIsSubmitting(true);
    try {
      // 2. Prepare Payload
      const safeEventTypeMapping: Record<string, string> = {
        corporate: 'corporate',
        birthday: 'birthday',
        wedding: 'wedding',
        social: 'social',
        other: 'other',
      };

      const rawCategory = store.category.toLowerCase().replace(/\s+/g, '_');
      const eventType = safeEventTypeMapping[rawCategory] || 'other';

      const payload = {
        name: store.eventTitle,
        description: store.description || "Event created via Creator Studio.",
        category: eventType,
        isPublic: false,
        cancellationPolicyId: store.cancellationPolicyId || undefined,
      };

      // 3. Create event template
      const response = await api.post("/event-templates", payload);
      const created = response.data?.template ?? response.data?.data ?? response.data;

      if (created?.id) {
        // 4. Attach venue, assets, and services via association endpoints
        try {
          if (venueItem?.id) {
            await api.post(`/event-templates/${created.id}/venues`, {
              venueId: venueItem.id,
              agreedPrice: venueItem.agreedPrice ?? venueItem.cost,
              isOptional: venueItem.isOptional ?? false,
            });
          }
          for (const item of store.baseItems) {
            if (item.resourceType === 'asset' && item.id) {
              await api.post(`/event-templates/${created.id}/assets`, {
                assetId: item.id,
                quantity: 1,
                agreedPrice: item.agreedPrice ?? item.cost,
                isOptional: item.isOptional ?? false,
              });
            } else if (item.resourceType === 'service' && item.id) {
              await api.post(`/event-templates/${created.id}/services`, {
                serviceId: item.id,
                agreedPrice: item.agreedPrice ?? item.cost,
                isOptional: item.isOptional ?? false,
              });
            }
          }
        } catch {
          // Associations are best-effort — template was created successfully
        }

        toast.success("Event template published!");
        setTimeout(() => {
          router.push("/creator-dashboard");
          store.reset();
        }, 1500);
      }
    } catch (error: unknown) {
      console.error("Publishing error:", error);
      const errMsg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to publish event";
      toast.error(errMsg);
    } finally {
      store.setIsSubmitting(false);
    }
  }, [store, router, realResources]);

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
