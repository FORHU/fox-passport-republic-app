import { cookies } from "next/headers";
import { config } from "@/shared/lib/config";
import { requireAuth } from "./auth";

async function getAuthToken(): Promise<string | null> {
  // `fox_token` (httpOnly) is the only source of truth for the access token.
  // There used to be a fallback that read it out of the `fox_user` cookie,
  // which required storing the token somewhere any script could read.
  const cookieStore = await cookies();
  return cookieStore.get("fox_token")?.value ?? null;
}

// Calls the backend refresh endpoint and updates cookies. Returns new access token or null.
async function tryRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("fox_refresh_token")?.value;
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${config.apiUrl}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (!res.ok) return null;

    const body = await res.json();
    const newAccessToken: string = body?.accessToken ?? body?.data?.accessToken;
    const newRefreshToken: string =
      body?.refreshToken ?? body?.data?.refreshToken;

    if (!newAccessToken) return null;

    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };

    // Cookie writes are only allowed in Server Actions/Route Handlers — skip silently in Server Components
    try {
      cookieStore.set("fox_token", newAccessToken, {
        ...cookieOpts,
        maxAge: 7 * 24 * 60 * 60,
      });
      if (newRefreshToken) {
        cookieStore.set("fox_refresh_token", newRefreshToken, {
          ...cookieOpts,
          maxAge: 30 * 24 * 60 * 60,
        });
      }
      // `fox_user` holds profile data only and carries no token, so a refresh
      // does not need to rewrite it.
    } catch {
      // Cannot persist refreshed token in a Server Component context — the client will re-sync on next load
    }

    console.log("[Auth] Token refreshed successfully");
    return newAccessToken;
  } catch {
    return null;
  }
}

/**
 * Deliberately does NOT redirect.
 *
 * `redirect()` signals by throwing, and every one of the 27 fetchers in this
 * file wraps `serverFetch` in a try/catch - so a redirect raised here was caught
 * as if it were a fetch failure, logged as "Failed to fetch ...", and swallowed.
 * The page then rendered with empty data and returned 200 instead of sending the
 * user anywhere. It also targeted `/login`, which is not a route in this app.
 *
 * Authentication belongs to the page-level guards (`requireAuth` / `requireHost`
 * / `requireAdmin`), which run before any of this and are not inside a catch.
 */
function authFailed(): null {
  console.warn("[API] 401 and refresh failed — treating as unauthenticated");
  return null;
}

async function serverFetch(
  endpoint: string,
  params?: Record<string, string>,
): Promise<any> {
  const token = await getAuthToken();
  const baseUrl = config.apiUrl;

  let url = `${baseUrl}${endpoint}`;
  if (params) {
    const qs = new URLSearchParams(params).toString();
    if (qs) url += `?${qs}`;
  }

  console.log(`[API] Fetching: ${url}`);

  const doFetch = (t: string | null) =>
    fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      },
      cache: "no-store",
    });

  let res: Response;

  try {
    res = await doFetch(token);
  } catch {
    console.warn(`[API] Network error fetching ${url} — API may be offline`);
    return null;
  }

  if (res.status === 401) {
    // Access token expired — try to silently refresh
    const newToken = await tryRefreshToken();
    if (newToken) {
      try {
        res = await doFetch(newToken);
      } catch {
        console.warn(`[API] Network error on retry ${url}`);
        return null;
      }
    } else {
      return authFailed();
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`[API] ${res.status} ${res.statusText}: ${text}`);
    throw new Error(`API request failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// Exported for other server utilities that need a raw fetch helper
export async function getServerApi() {
  const token = await getAuthToken();
  const baseUrl = config.apiUrl;

  const request = async (
    endpoint: string,
    options: { params?: Record<string, string> } = {},
  ) => {
    let url = `${baseUrl}${endpoint}`;
    if (options.params) {
      const qs = new URLSearchParams(options.params).toString();
      if (qs) url += `?${qs}`;
    }
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });
    if (!res.ok) {
      // Attach the status so getUser can distinguish an authoritative 401 from
      // a transport failure - they call for opposite behaviour.
      const err = Object.assign(new Error(`${res.status} ${res.statusText}`), {
        status: res.status,
      });
      throw err;
    }
    const body = await res.json();
    return { data: body };
  };

  return {
    get: (endpoint: string, options?: { params?: Record<string, string> }) =>
      request(endpoint, options),
  };
}

function extractList(body: any): any[] {
  const list =
    body?.venues ??
    body?.templates ??
    body?.assets ??
    body?.services ??
    body?.events ??
    body?.users ??
    body?.categories ??
    body?.data ??
    body;
  return Array.isArray(list) ? list : [];
}

function extractOne(body: any): any {
  return (
    body?.venue ??
    body?.template ??
    body?.asset ??
    body?.service ??
    body?.event ??
    body?.category ??
    body?.user ??
    body?.data ??
    body
  );
}

const FALLBACK_IMG = "/herobackground.jpg";

function normalizeImages(images: any[]): string[] {
  if (!Array.isArray(images) || images.length === 0) return [FALLBACK_IMG];
  const urls = images
    .map((img) =>
      typeof img === "string" ? img : img?.url || img?.imageUrl || "",
    )
    .filter(Boolean);
  return urls.length > 0 ? urls : [FALLBACK_IMG];
}

function normalizeVenue(v: any) {
  const images = normalizeImages(v.images ?? v.gallery ?? []);
  const img = images[0] || FALLBACK_IMG;
  const mayor = v.mayor ?? v.host ?? null;
  return {
    ...v,
    hostId: v.hostId ?? v.mayorId ?? mayor?.id ?? null,
    host: mayor
      ? {
          id: mayor.id,
          name: mayor.name || "Venue Owner",
          avatar:
            mayor.imgId ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(mayor.name || "Owner")}&background=ccff00&color=000`,
          bio: "",
          email: mayor.email,
        }
      : null,
    title: v.title || v.name || "Untitled Venue",
    type: v.type || v.venueType || "Venue",
    loc:
      v.location ||
      [v.city, v.province, v.country].filter(Boolean).join(", ") ||
      "",
    cap: v.capacity ? `${v.capacity} guests` : "—",
    location:
      v.location ||
      [v.city, v.province, v.country].filter(Boolean).join(", ") ||
      "",
    province: v.province || v.country || "",
    price: Number(v.price || v.pricePerNight || 0),
    rating: Number(v.rating || v.averageRating || 0),
    reviews: Number(v.reviews || v.reviewCount || 0),
    images,
    img,
    description: v.description || "",
    category:
      typeof v.category === "object"
        ? v.category?.name || v.category?.slug || ""
        : v.category || "",
    guestCount: Number(v.guestCount || v.capacity || 0),
    bedroomCount: Number(v.bedroomCount || v.bedrooms || 0),
    bathroomCount: Number(v.bathroomCount || v.bathrooms || 0),
    status: v.status || "draft",
    bookings: v.bookingsCount ?? v.bookings ?? null,
    revenue: v.revenue ? `₱${Number(v.revenue).toLocaleString()}` : null,
  };
}

export async function getDashboardStats() {
  try {
    const body = await serverFetch("/admin/stats");
    return (
      body?.data || {
        totalUsers: 0,
        activeEvents: 0,
        pendingApprovals: 0,
        totalRevenue: 0,
        totalBookings: 0,
        bookingsByDay: [0, 0, 0, 0, 0, 0, 0],
        categoryStats: [],
      }
    );
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return {
      totalUsers: 0,
      activeEvents: 0,
      pendingApprovals: 0,
      totalRevenue: 0,
      totalBookings: 0,
      bookingsByDay: [0, 0, 0, 0, 0, 0, 0],
      categoryStats: [],
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getUserDashboard(_userId: string) {
  await requireAuth();
  try {
    const body = await serverFetch("/bookings").catch(() => ({ data: [] }));
    const upcomingEvents = (body?.data || []).length;
    return { userName: "User", upcomingEvents, recommendations: 0 };
  } catch (error) {
    console.error("Failed to fetch user dashboard:", error);
    return { userName: "User", upcomingEvents: 0, recommendations: 0 };
  }
}

export async function getVenues() {
  try {
    const body = await serverFetch("/venues");
    return extractList(body).map(normalizeVenue);
  } catch (error) {
    console.error("Failed to fetch venues:", error);
    return [];
  }
}

export async function getAdminPendingVenues() {
  try {
    const body = await serverFetch("/admin/venues/pending");
    return extractList(body).map(normalizeVenue);
  } catch (error) {
    console.error("Failed to fetch admin pending venues:", error);
    return [];
  }
}

export async function getAdminPendingAssets() {
  try {
    const body = await serverFetch("/admin/assets/pending");
    return extractList(body);
  } catch (error) {
    console.error("Failed to fetch admin pending assets:", error);
    return [];
  }
}

export async function getAdminAllAssets() {
  try {
    const body = await serverFetch("/admin/assets");
    return extractList(body);
  } catch (error) {
    console.error("Failed to fetch admin all assets:", error);
    return [];
  }
}

export async function getAdminPendingServices() {
  try {
    const body = await serverFetch("/admin/services/pending");
    return extractList(body);
  } catch (error) {
    console.error("Failed to fetch admin pending services:", error);
    return [];
  }
}

export async function getAdminAllServices() {
  try {
    const body = await serverFetch("/admin/services");
    return extractList(body);
  } catch (error) {
    console.error("Failed to fetch admin all services:", error);
    return [];
  }
}

export async function getAdminEvents() {
  try {
    const body = await serverFetch("/admin/events");
    return extractList(body);
  } catch (error) {
    console.error("Failed to fetch admin events:", error);
    return [];
  }
}

export async function getAdminEventTemplates() {
  try {
    const body = await serverFetch("/admin/event-templates");
    return extractList(body);
  } catch (error) {
    console.error("Failed to fetch admin event templates:", error);
    return [];
  }
}

export async function getEvents(ownerId?: string) {
  try {
    const params = ownerId ? { ownerId } : undefined;
    const body = await serverFetch("/event-templates", params);
    return extractList(body);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return [];
  }
}

export async function getCategories() {
  try {
    const body = await serverFetch("/categories");
    return extractList(body);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function getUsers() {
  try {
    const body = await serverFetch("/users");
    return extractList(body);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

export async function getAllAssets() {
  try {
    const body = await serverFetch("/asset");
    return extractList(body);
  } catch (error) {
    console.error("Failed to fetch assets:", error);
    return [];
  }
}

export async function getAllServices() {
  try {
    const body = await serverFetch("/service");
    return extractList(body);
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return [];
  }
}

export async function getAllBookings() {
  try {
    const [serviceBody, assetBody, eventBody] = await Promise.all([
      serverFetch("/service/bookings"),
      serverFetch("/asset/bookings"),
      serverFetch("/bookings"),
    ]);
    return {
      serviceBookings: extractList(serviceBody),
      assetBookings: extractList(assetBody),
      eventBookings: extractList(eventBody),
    };
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return { serviceBookings: [], assetBookings: [], eventBookings: [] };
  }
}

export async function getServicesByHostId(hostId: string) {
  try {
    const body = await serverFetch("/service", { ownerId: hostId });
    return extractList(body);
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return [];
  }
}

export async function getAssetsByHostId(ownerId: string) {
  try {
    const body = await serverFetch("/asset", { ownerId });
    return extractList(body);
  } catch (error) {
    console.error("Failed to fetch assets:", error);
    return [];
  }
}

export async function getVenuesByHostId(hostId: string) {
  try {
    const body = await serverFetch("/venues", { hostId });
    return extractList(body).map(normalizeVenue);
  } catch (error) {
    console.error("Failed to fetch venues:", error);
    return [];
  }
}

// The aggregate for the dashboard landing page, which genuinely renders all four
// resources. Pages that show only one should call the single-resource fetcher
// above instead - calling this for one list costs four requests and discards
// three of them.
//
// Composed from those same fetchers so each resource has one definition of its
// endpoint, params and shaping. Each already returns [] on failure, so a single
// dead resource degrades that section rather than blanking the dashboard, which
// the previous per-call `.catch(() => ({}))` was doing by hand.
export async function getHostDashboard(userId: string) {
  await requireAuth();

  const [events, venues, inventory, services] = await Promise.all([
    getEvents(userId),
    getVenuesByHostId(userId),
    getAssetsByHostId(userId),
    getServicesByHostId(userId),
  ]);

  return { events, venues, inventory, services };
}

export async function getBookingById(id: string) {
  try {
    const body = await serverFetch(`/bookings/${id}`);
    return extractOne(body);
  } catch {
    return null;
  }
}

export async function getVenueById(id: string) {
  try {
    const body = await serverFetch(`/venues/${id}`);
    const data = extractOne(body);
    if (!data) return null;
    return normalizeVenue(data);
  } catch {
    return null;
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    const body = await serverFetch(`/categories/slug/${slug}`);
    return extractOne(body);
  } catch (error) {
    console.error(`Failed to fetch category ${slug}:`, error);
    return null;
  }
}

export async function getEventsByCategory(categorySlug: string) {
  try {
    const body = await serverFetch("/event-templates/browse", {
      category: categorySlug,
    });
    return extractList(body);
  } catch (error) {
    console.error(
      `Failed to fetch events for category ${categorySlug}:`,
      error,
    );
    return [];
  }
}

export async function getFeaturedEventTemplates(limit = 4) {
  try {
    const body = await serverFetch("/event-templates/browse", {
      limit: String(limit),
    });
    return extractList(body);
  } catch (error) {
    console.error("Failed to fetch featured event templates:", error);
    return [];
  }
}

export async function getTrendingEventsByCategory(categorySlug: string) {
  try {
    const body = await serverFetch("/event-templates/trending", {
      category: categorySlug,
    });
    return extractList(body);
  } catch (error) {
    console.error(
      `Failed to fetch trending events for category ${categorySlug}:`,
      error,
    );
    return [];
  }
}

export async function getVenuesByCategory(categorySlug: string) {
  try {
    const body = await serverFetch("/venues", { category: categorySlug });
    return extractList(body).map(normalizeVenue);
  } catch (error) {
    console.error(
      `Failed to fetch venues for category ${categorySlug}:`,
      error,
    );
    return [];
  }
}

export interface SearchResult {
  id: string;
  name: string;
  description?: string;
  category?: string;
  city?: string;
  targetCity?: string;
  price?: number;
  currency?: string;
  images?: { url: string }[];
}

export async function getAdminDisputes() {
  try {
    const body = await serverFetch("/admin/disputes");
    return extractList(body);
  } catch (error) {
    console.error("Failed to fetch admin disputes:", error);
    return [];
  }
}

export async function getAdminRefunds() {
  try {
    const body = await serverFetch("/admin/refunds");
    return extractList(body);
  } catch (error) {
    console.error("Failed to fetch admin refunds:", error);
    return [];
  }
}

export async function getSearchResults(params: {
  type?: string;
  city?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  q?: string;
}): Promise<SearchResult[]> {
  try {
    const queryParams: Record<string, string> = {};
    if (params.type) queryParams.type = params.type;
    if (params.city) queryParams.city = params.city;
    if (params.category) queryParams.category = params.category;
    if (params.startDate) queryParams.startDate = params.startDate;
    if (params.endDate) queryParams.endDate = params.endDate;
    if (params.q) queryParams.q = params.q;
    const body = await serverFetch("/search", queryParams);
    return body?.data?.results ?? [];
  } catch (error) {
    console.error("Failed to fetch search results:", error);
    return [];
  }
}
