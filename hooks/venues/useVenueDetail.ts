"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useVenueDetailStore,
  useExperienceBuilderStore,
} from "@/store/useVenueDetailStore";
import {
  SERVICE_CATEGORIES,
  CUSTOM_SERVICES,
  AVAILABLE_FOXERS,
} from "@/data/venueDetailData";
import { useCheckoutStore } from "@/store/useCheckoutStore";

export function useVenueDetail(venueData?: any) {
  const router = useRouter();
  const store = useVenueDetailStore();

  const nights = useMemo(() => {
    return store.checkInDate && store.checkOutDate
      ? store.checkOutDate - store.checkInDate
      : 0;
  }, [store.checkInDate, store.checkOutDate]);

  const handleReserve = useCallback(() => {
    // 1. Setup checkout state before routing
    const checkoutStore = useCheckoutStore.getState();
    checkoutStore.setConfig({
      venueId: venueData?.id || null,
      venueName: venueData?.title || "Fox Passport Republic Venue",
      venueImage: venueData?.images?.[0] || null,
      checkInDate: store.checkInDate,
      nights: nights > 0 ? nights : 1,
      totalAmount: venueData?.price ? venueData.price * (nights > 0 ? nights : 1) : 0,
      guestCount: 1 // Default to 1 guest, can be expanded later
    });
    
    // 2. Navigate to checkout config
    router.push("/booking/config");
  }, [router, store.checkInDate, nights, venueData]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return {
    ...store,
    nights,
    handleReserve,
    handleBack,
  };
}

export function useExperienceBuilder(venuePrice: number, onClose: () => void, isOpen: boolean) {
  const router = useRouter();
  const store = useExperienceBuilderStore();

  // Prevent background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const filteredServices = useMemo(() => {
    const categoryServices =
      CUSTOM_SERVICES[store.activeCategory as keyof typeof CUSTOM_SERVICES] ||
      [];
    if (!store.searchQuery) return categoryServices;
    return categoryServices.filter((s) =>
      s.name.toLowerCase().includes(store.searchQuery.toLowerCase())
    );
  }, [store.activeCategory, store.searchQuery]);

  const currentCategoryLabel = useMemo(() => {
    return (
      SERVICE_CATEGORIES.find((c) => c.id === store.activeCategory)?.label || ""
    );
  }, [store.activeCategory]);

  const total = useMemo(
    () => store.calculateTotal(venuePrice),
    [store, venuePrice]
  );

  const selectedFoxerData = useMemo(() => {
    if (!store.selectedFoxer) return null;
    return AVAILABLE_FOXERS.find((f) => f.id === store.selectedFoxer) || null;
  }, [store.selectedFoxer]);

  const selectedServicesData = useMemo(() => {
    return Object.values(CUSTOM_SERVICES)
      .flat()
      .filter((s) => store.selectedServices.includes(s.id));
  }, [store.selectedServices]);

  // Drag handlers
  const handleDragStart = useCallback(
    (e: React.DragEvent, id: string | number, type: "foxer" | "service") => {
      e.dataTransfer.setData("id", id.toString());
      e.dataTransfer.setData("type", type);
      e.dataTransfer.effectAllowed = "copy";
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      store.setIsDragOver(true);
      e.dataTransfer.dropEffect = "copy";
    },
    [store]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      store.setIsDragOver(false);
    },
    [store]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      store.setIsDragOver(false);
      const id = e.dataTransfer.getData("id");
      const type = e.dataTransfer.getData("type");

      if (type === "foxer") {
        store.setSelectedFoxer(Number(id));
      } else if (type === "service") {
        if (!store.selectedServices.includes(id)) {
          store.toggleService(id);
        }
      }
    },
    [store]
  );

  const handleSubmit = useCallback(() => {
    store.setIsSubmitting(true);
    setTimeout(() => {
      store.setIsSubmitting(false);
      store.setIsSuccess(true);
    }, 2000);
  }, [store]);

  const handleClose = useCallback(() => {
    store.reset();
    onClose();
  }, [store, onClose]);

  return {
    ...store,
    filteredServices,
    currentCategoryLabel,
    total,
    selectedFoxerData,
    selectedServicesData,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleSubmit,
    handleClose,
  };
}
