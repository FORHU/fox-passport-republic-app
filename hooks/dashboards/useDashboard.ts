import { useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboardStore } from "@/store/useDashboardStore";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { VenueItem } from "@/data/dashboardData";

export function useDashboard() {
  const router = useRouter();
  const store = useDashboardStore();
  const user = useAuthStore((state) => state.user);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch real data on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch User's Venues
        const venueResponse = await api.get("/v1/venues?hostId=" + user.id);
        const rawVenues = venueResponse.data.venues || venueResponse.data.data;

        if (rawVenues) {
          const mappedVenues: VenueItem[] = rawVenues
            .slice(0, 2) // Fetch first 2 venues as requested
            .map((v: any) => ({
              id: v.id,
              title: v.name,
              type: v.type.toUpperCase(),
              loc: `${v.city}, ${v.country}`,
              cap: `${v.capacity} Cap`,
              status: v.status.charAt(0).toUpperCase() + v.status.slice(1).replace("_", " "),
              bookings: "New",
              revenue: "₱0",
              img: v.venueImages?.[0]?.url || "https://images.unsplash.com/photo-1574391884720-385e66752079?q=80&w=2072"
            }));
          store.setVenues(mappedVenues);
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      }
    };

    fetchData();
  }, [user, store.setVenues]);

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
