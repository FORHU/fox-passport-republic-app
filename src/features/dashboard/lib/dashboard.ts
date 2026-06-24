/**
 * Server-side dashboard data fetching utilities
 * These should be called from server components or server actions
 *
 * Replaces client-side useInventoryFetch, useDashboard API calls
 */

import api from "@/shared/lib/axios";
import type { Id } from "@/shared/lib/api-types";

interface DashboardDataFetch {
  success: boolean;
  data: any;
  error?: string;
}

/**
 * Fetch user's venues on the server
 * Used by host dashboard
 */
export async function fetchHostVenues(userId: Id): Promise<any[]> {
  try {
    const response = await api.get("/venues", {
      params: { hostId: userId },
    });

    const rawVenues =
      response.data.venues ||
      response.data.data ||
      (Array.isArray(response.data) ? response.data : []);

    return Array.isArray(rawVenues) ? rawVenues : [];
  } catch (error) {
    console.error("Failed to fetch host venues:", error);
    throw error;
  }
}

/**
 * Fetch user's events on the server
 * Used by host dashboard
 */
export async function fetchHostEvents(userId: Id): Promise<any[]> {
  try {
    const response = await api.get("/events", {
      params: { organizerId: userId },
    });

    const rawEvents =
      response.data.events ||
      response.data.data ||
      (Array.isArray(response.data) ? response.data : []);

    return Array.isArray(rawEvents) ? rawEvents : [];
  } catch (error) {
    console.error("Failed to fetch host events:", error);
    throw error;
  }
}

/**
 * Fetch admin dashboard stats
 */
export async function fetchAdminStats() {
  try {
    const response = await api.get("/admin/stats");
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    throw error;
  }
}

/**
 * Fetch admin data by type (venues, events, categories, citizens)
 */
export async function fetchAdminData(type: "venues" | "events" | "categories" | "citizens") {
  try {
    let endpoint = "";
    switch (type) {
      case "venues":
        endpoint = "/venues";
        break;
      case "events":
        endpoint = "/events";
        break;
      case "categories":
        endpoint = "/categories";
        break;
      case "citizens":
        endpoint = "/users";
        break;
      default:
        throw new Error(`Unknown admin data type: ${type}`);
    }

    const response = await api.get(endpoint);
    const raw =
      response.data?.data?.users ??
      response.data?.data ??
      response.data?.users ??
      response.data?.citizens ??
      response.data?.venues ??
      response.data?.events ??
      response.data?.categories ??
      response.data?.results ??
      (Array.isArray(response.data) ? response.data : []);

    return Array.isArray(raw) ? raw : [];
  } catch (error) {
    console.error(`Failed to fetch admin data (${type}):`, error);
    throw error;
  }
}

/**
 * Fetch foxer/talent dashboard stats
 */
export async function fetchFoxerStats() {
  try {
    const response = await api.get("/foxers/me/stats");
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch foxer stats:", error);
    throw error;
  }
}
