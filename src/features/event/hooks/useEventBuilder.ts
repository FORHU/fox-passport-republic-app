'use client';

import { useCallback, useMemo, useRef } from "react";
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
import { useFileUpload } from "@/shared/hooks/useFileUpload";

export function useEventBuilder() {
  const router = useRouter();
  const store = useEventBuilderStore();
  const { uploadFile } = useFileUpload();

  const [realResources, setRealResources] = useState<Record<string, ResourceItem[]>>({
    venue: [],
    talent: [],
    service: [],
    equipment: [],
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
            .filter((v: Record<string, unknown>) => (v.status as string)?.toLowerCase() === "available")
            .map((v: Record<string, unknown>) => ({
               id: String(v.id),
               name: String(v.name ?? ""),
               cost: Number((v.price as number) || (v.baseRate as number) || 10000),
               icon: "location_city",
               desc: String(v.description || "Real venue from your gallery."),
               imageUrl: ((v.images as any[])?.[0]?.url) ?? undefined,
               resourceType: "venue" as const,
               city: v.city as string | undefined,
               state: v.state as string | undefined,
               country: v.country as string | undefined,
               lat: v.lat as number | null | undefined,
               lng: v.lng as number | null | undefined,
             }));
        }

        // Fetch Assets/Services
        const [assetResp, serviceResp] = await Promise.all([
          api.get("/asset"),
          api.get("/service")
        ]);

        const talent: ResourceItem[] = [];
        const service: ResourceItem[] = [];
        const equipment: ResourceItem[] = [];

        // Process Assets
        if (assetResp.data.assets) {
          assetResp.data.assets.forEach((a: any) => {
            const item: ResourceItem = {
              id: a.id,
              name: a.name,
              cost: a.price || 5000,
              icon: "inventory_2",
              desc: a.description || "Real asset from the database.",
              imageUrl: a.images?.[0]?.url ?? undefined,
              resourceType: "asset"
            };

            // category is returned as a plain enum string (e.g. "sound_system"), not an object
            const slug = (typeof a.category === 'string' ? a.category : a.category?.slug ?? '').toLowerCase();
            if (slug === "entertainment") {
              talent.push({ ...item, icon: "music_note" });
            } else if (["planning", "catering", "photography"].includes(slug)) {
              service.push({ ...item, icon: slug === "catering" ? "restaurant" : slug === "photography" ? "camera_alt" : "event_note" });
            } else if (slug === "equipment" || slug === "sound_system") {
              equipment.push({ ...item, icon: "speaker" });
            } else if (["decorations", "decoration", "furnitures", "furniture"].includes(slug)) {
              service.push({ ...item, icon: "brush" });
            } else {
              service.push(item);
            }
          });
        }

        // Process Services
        const rawServices = serviceResp.data.services || serviceResp.data.data || [];
        if (Array.isArray(rawServices)) {
          rawServices.forEach((s: any) => {
            const item: ResourceItem = {
              id: s.id,
              name: s.name,
              cost: s.price || 7500,
              icon: "work_outline",
              desc: s.description || "Premium service for your event.",
              imageUrl: s.images?.[0]?.url ?? undefined,
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
        const item = store.draggedItem;

        // Only one venue allowed in the Core Package
        if (item.resourceType === 'venue') {
          const alreadyHasVenue = store.baseItems.some(
            (i) => i.resourceType === 'venue' || VENUE_ICONS.includes(i.icon)
          );
          if (alreadyHasVenue) {
            toast.error("Only one venue can be in the Core Package. Remove the existing venue first.");
            store.setDraggedItem(null);
            store.setIsDragOver(false);
            return;
          }
        }

        store.addBaseItem(item);
        // Auto-fill location fields when the first venue is dropped and location is empty
        if (item.resourceType === 'venue' && !store.location) {
          const label = [item.city, item.state].filter(Boolean).join(', ');
          if (label) store.setLocation(label);
          if (item.city) store.setTargetCity(item.city);
          if (item.state) store.setTargetState(item.state);
          if (item.country) store.setTargetCountry(item.country);
          if (item.lat != null) store.setLat(item.lat);
          if (item.lng != null) store.setLng(item.lng);
        }
      }
      store.setDraggedItem(null);
    },
    [store]
  );

  // Gallery handlers
  const addImageToGallery = useCallback((files: File[]) => {
    files.forEach(file => {
      store.addGalleryItem({
        id: Math.random().toString(36).substring(2, 11),
        url: URL.createObjectURL(file),
        caption: file.name,
        file,
      });
    });
  }, [store]);

  // Navigation handlers
  const handleBack = useCallback(() => {
    router.push("/creator-dashboard");
  }, [router]);

  const handleSaveDraft = useCallback(async (opts?: { silent?: boolean; syncInclusions?: boolean }) => {
    if (store.isSubmitting) return;
    if (!store.eventTitle) {
      if (!opts?.silent) toast.error("Add an event title before saving");
      return;
    }

    const safeEventTypeMapping: Record<string, string> = {
      corporate: 'corporate', birthday: 'birthday',
      wedding: 'wedding', social: 'social', other: 'other',
    };
    const rawCategory = store.category.toLowerCase().replace(/\s+/g, '_');
    const eventType = safeEventTypeMapping[rawCategory] || 'other';

    store.setIsSubmitting(true);
    store.setSaveStatus('saving');
    try {
      // Upload any gallery images that haven't been uploaded yet
      const uploadedIds: string[] = [];
      for (const item of store.gallery) {
        if (item.fileId) {
          uploadedIds.push(item.fileId);
        } else if (item.file) {
          const result = await uploadFile(item.file);
          if (result) {
            store.updateGalleryItemFileId(item.id, result.fileId);
            uploadedIds.push(result.fileId);
          }
        }
      }

      const payload: Record<string, unknown> = {
        name: store.eventTitle,
        description: store.description || undefined,
        category: eventType,
        isPublic: false,
        maxAttendees: store.maxAttendees > 0 ? store.maxAttendees : undefined,
        targetCity: store.targetCity || undefined,
        targetState: store.targetState || undefined,
        targetCountry: store.targetCountry || undefined,
        lat: store.lat ?? undefined,
        lng: store.lng ?? undefined,
        cancellationPolicyId: store.cancellationPolicyId || undefined,
        ...(uploadedIds.length > 0 ? { imgIds: uploadedIds } : {}),
      };

      // Capture template ID before/after create so we can use it for inclusions sync
      let templateId = store.draftId;

      if (store.draftId) {
        try {
          await api.put(`/event-templates/${store.draftId}`, payload);
        } catch (putErr: any) {
          // Stale draftId (template was deleted or user lost ownership) — create fresh
          if (putErr?.response?.status === 404 || putErr?.response?.status === 403) {
            store.setDraftId(null);
            templateId = null;
          } else {
            throw putErr;
          }
        }
      }

      if (!templateId) {
        const resp = await api.post("/event-templates", payload);
        const created = resp.data?.template ?? resp.data?.data ?? resp.data;
        if (created?.id) {
          store.setDraftId(created.id);
          templateId = created.id;
        }
      }

      // Sync Core Package inclusions (venue / assets / services) when explicitly requested.
      // Only called before preview — NOT during auto-save to avoid excessive API calls.
      if (opts?.syncInclusions && templateId) {
        try {
          const currentResp = await api.get(`/event-templates/${templateId}`);
          const current = currentResp.data?.template ?? currentResp.data;

          // ── Venue ────────────────────────────────────────────────────────────
          const existingVenueIds: string[] = (current?.templateVenues ?? [])
            .map((tv: any) => tv.venueId).filter(Boolean);
          const desiredVenue = store.baseItems.find(
            i => i.resourceType === 'venue' || VENUE_ICONS.includes(i.icon)
          );
          for (const vId of existingVenueIds) {
            if (vId !== desiredVenue?.id) {
              try { await api.delete(`/event-templates/${templateId}/venues/${vId}`); } catch (e) { console.error('[syncInclusions] remove venue failed', e); }
            }
          }
          if (desiredVenue && !existingVenueIds.includes(desiredVenue.id)) {
            try {
              await api.post(`/event-templates/${templateId}/venues`, {
                venueId: desiredVenue.id,
                agreedPrice: desiredVenue.agreedPrice ?? desiredVenue.cost,
                isOptional: desiredVenue.isOptional ?? false,
              });
            } catch (e: any) {
              console.error('[syncInclusions] attach venue failed', e?.response?.data ?? e);
            }
          }

          // ── Assets ───────────────────────────────────────────────────────────
          const existingAssetIds: string[] = (current?.templateAssets ?? [])
            .map((ta: any) => ta.assetId).filter(Boolean);
          // Fallback: treat items with talent/equipment icons as assets when resourceType is missing
          const desiredAssets = store.baseItems.filter(i =>
            i.resourceType === 'asset' ||
            (!i.resourceType && (TALENT_ICONS.includes(i.icon) || i.icon === 'speaker' || i.icon === 'inventory_2'))
          );
          const desiredAssetIds = desiredAssets.map(a => a.id);
          for (const aId of existingAssetIds) {
            if (!desiredAssetIds.includes(aId)) {
              try { await api.delete(`/event-templates/${templateId}/assets/${aId}`); } catch (e) { console.error('[syncInclusions] remove asset failed', e); }
            }
          }
          for (const asset of desiredAssets) {
            if (!existingAssetIds.includes(asset.id)) {
              try {
                await api.post(`/event-templates/${templateId}/assets`, {
                  assetId: asset.id,
                  quantity: 1,
                  agreedPrice: asset.agreedPrice ?? asset.cost,
                  isOptional: asset.isOptional ?? false,
                });
              } catch (e: any) {
                console.error('[syncInclusions] attach asset failed', asset.name, e?.response?.data ?? e);
              }
            }
          }

          // ── Services ─────────────────────────────────────────────────────────
          const existingServiceIds: string[] = (current?.templateServices ?? [])
            .map((ts: any) => ts.serviceId).filter(Boolean);
          // Fallback: treat items with service icons as services when resourceType is missing
          const desiredServices = store.baseItems.filter(i =>
            i.resourceType === 'service' ||
            (!i.resourceType && !VENUE_ICONS.includes(i.icon) && !TALENT_ICONS.includes(i.icon) && i.icon !== 'speaker' && i.icon !== 'inventory_2')
          );
          const desiredServiceIds = desiredServices.map(s => s.id);
          for (const sId of existingServiceIds) {
            if (!desiredServiceIds.includes(sId)) {
              try { await api.delete(`/event-templates/${templateId}/services/${sId}`); } catch (e) { console.error('[syncInclusions] remove service failed', e); }
            }
          }
          for (const service of desiredServices) {
            if (!existingServiceIds.includes(service.id)) {
              try {
                await api.post(`/event-templates/${templateId}/services`, {
                  serviceId: service.id,
                  agreedPrice: service.agreedPrice ?? service.cost,
                  isOptional: service.isOptional ?? false,
                });
              } catch (e: any) {
                console.error('[syncInclusions] attach service failed', service.name, e?.response?.data ?? e);
              }
            }
          }
        } catch (e: any) {
          console.error('[syncInclusions] outer error', e?.response?.data ?? e);
        }
      }

      store.setSaveStatus('saved');
      if (!opts?.silent) toast.success("Draft saved");
    } catch (error: unknown) {
      store.setSaveStatus('error');
      const errMsg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to save draft";
      if (!opts?.silent) toast.error(errMsg);
    } finally {
      store.setIsSubmitting(false);
    }
  }, [store, uploadFile]);

  // Keep a stable ref to handleSaveDraft so the auto-save timer always calls the latest version
  const saveDraftRef = useRef(handleSaveDraft);
  useEffect(() => {
    saveDraftRef.current = handleSaveDraft;
  });

  // Auto-save: fire 2 seconds after the user stops editing any tracked field
  useEffect(() => {
    if (!store.eventTitle) return;
    const timer = setTimeout(() => {
      saveDraftRef.current({ silent: true });
    }, 2000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    store.eventTitle, store.description, store.category, store.date,
    store.location, store.maxAttendees, store.cancellationPolicyId,
    store.targetCity, store.targetState, store.targetCountry, store.lat, store.lng,
    store.baseItems,
  ]);

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

      // Upload gallery images
      const uploadedIds: string[] = [];
      for (const item of store.gallery) {
        if (item.fileId) {
          uploadedIds.push(item.fileId);
        } else if (item.file) {
          const result = await uploadFile(item.file);
          if (result) {
            store.updateGalleryItemFileId(item.id, result.fileId);
            uploadedIds.push(result.fileId);
          }
        }
      }

      const payload: Record<string, unknown> = {
        name: store.eventTitle,
        description: store.description || "Event created via Creator Studio.",
        category: eventType,
        isPublic: false,
        targetCity: store.targetCity || undefined,
        targetState: store.targetState || undefined,
        targetCountry: store.targetCountry || undefined,
        lat: store.lat ?? undefined,
        lng: store.lng ?? undefined,
        cancellationPolicyId: store.cancellationPolicyId || undefined,
        ...(uploadedIds.length > 0 ? { imgIds: uploadedIds } : {}),
      };

      // 3. Create or update event template
      const response = store.draftId
        ? await api.put(`/event-templates/${store.draftId}`, { ...payload, isPublic: false })
        : await api.post("/event-templates", payload);
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
  }, [store, router, realResources, uploadFile]);

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
