import { useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboardStore } from "@/store/useDashboardStore";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { VenueItem, EventItem } from "@/data/dashboardData";

export function useDashboard() {
  const router = useRouter();
  const store = useDashboardStore();
  const user = useAuthStore((state) => state.user);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch real data on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      const hostId = user.id || (user as any).userId;
      if (!hostId) return;

      try {
        // Fetch User's Venues
        try {
          const venueResponse = await api.get("/v1/venues", {
            params: { hostId }
          });
          const rawVenues = venueResponse.data.venues || venueResponse.data.data || (Array.isArray(venueResponse.data) ? venueResponse.data : []);

          if (rawVenues && Array.isArray(rawVenues)) {
            const mappedVenues: VenueItem[] = rawVenues
              .slice(0, 2)
              .map((v: any) => ({
                id: v.id,
                title: v.name,
                type: v.type?.toUpperCase() || "VENUE",
                loc: v.city ? `${v.city}, ${v.country || 'PH'}` : "Location TBD",
                cap: v.capacity ? `${v.capacity} Cap` : "N/A",
                status: v.status ? v.status.charAt(0).toUpperCase() + v.status.slice(1).replace("_", " ") : "Draft",
                bookings: "New",
                revenue: "₱0",
                img: v.venueImages?.[0]?.url || "https://images.unsplash.com/photo-1574391884720-385e66752079?q=80&w=2072"
              }));
            store.setVenues(mappedVenues);
          }
        } catch (venueError) {
          console.warn("Dashboard fetch venues error:", venueError);
        }

        // Fetch User's Events
        try {
          const eventResponse = await api.get("/v1/events", {
            params: { organizerId: hostId }
          });
          const rawEvents = eventResponse.data.events || eventResponse.data.data || (Array.isArray(eventResponse.data) ? eventResponse.data : []);

          if (rawEvents && Array.isArray(rawEvents)) {
            const mappedEvents: EventItem[] = rawEvents
              .slice(0, 2)
              .map((e: any) => ({
                id: e.id,
                title: e.name,
                date: e.startDatetime ? new Date(e.startDatetime).toLocaleDateString() : "Date TBD",
                loc: e.venue?.name || "Venue TBD",
                type: e.eventType?.toUpperCase() || "EVENT",
                status: e.status?.charAt(0).toUpperCase() + e.status?.slice(1) || "Draft",
                booked: 0,
                capacity: e.maxAttendees || 100,
                revenue: e.totalPrice ? `₱${(e.totalPrice / 1000).toFixed(1)}k` : "₱0",
                img: e.image || "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=2072"
              }));
            store.setEvents(mappedEvents);
          }
        } catch (eventError) {
          console.warn("Dashboard fetch events error:", eventError);
        }
      } catch (error) {
        console.error("Dashboard fetch overall error:", error);
      }
    };

    fetchData();
  }, [user, store.setVenues, store.setEvents]);

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
