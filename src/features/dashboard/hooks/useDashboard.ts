'use client';

import { useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboardStore } from "@/features/dashboard/store/useDashboardStore";

export function useDashboard() {
  const router = useRouter();
  const store = useDashboardStore();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close create menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        store.setCreateMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [store]);

  // Navigation handlers
  const handleOpenCalendar = useCallback(() => {
    store.setCalendarOpen(true);
  }, [store]);

  const handleCloseCalendar = useCallback(() => {
    store.setCalendarOpen(false);
  }, [store]);

  const handleToggleCreateMenu = useCallback(() => {
    store.setCreateMenuOpen(!store.isCreateMenuOpen);
  }, [store]);

  const handleNavigateToCreateEvent = useCallback(() => {
    router.push("/foxer/create-event");
    store.setCreateMenuOpen(false);
  }, [router, store]);

  const handleNavigateToCreateVenue = useCallback(() => {
    router.push("/mayor/create-venue");
    store.setCreateMenuOpen(false);
  }, [router, store]);

  const handleNavigateToCreateInventory = useCallback(() => {
    router.push("/foxer/create-listing?type=inventory");
    store.setCreateMenuOpen(false);
  }, [router, store]);

  const handleNavigateToCreateService = useCallback(() => {
    router.push("/foxer/create-listing?type=service");
    store.setCreateMenuOpen(false);
  }, [router, store]);

  return {
    // State
    ...store,
    menuRef,

    // Handlers
    handleOpenCalendar,
    handleCloseCalendar,
    handleToggleCreateMenu,
    handleNavigateToCreateEvent,
    handleNavigateToCreateVenue,
    handleNavigateToCreateInventory,
    handleNavigateToCreateService,
  };
}
