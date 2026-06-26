import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { config } from '@/lib/config';
import { requireAuth } from './auth';

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  let token = cookieStore.get('fox_token')?.value;

  if (!token) {
    const userStr = cookieStore.get('fox_user')?.value;
    if (userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        token = user.accessToken;
      } catch {
        // ignore malformed cookie
      }
    }
  }

  return token ?? null;
}

// Calls the backend refresh endpoint and updates cookies. Returns new access token or null.
async function tryRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('fox_refresh_token')?.value;
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${config.apiUrl}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const body = await res.json();
    const newAccessToken: string = body?.accessToken ?? body?.data?.accessToken;
    const newRefreshToken: string = body?.refreshToken ?? body?.data?.refreshToken;

    if (!newAccessToken) return null;

    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    // Cookie writes are only allowed in Server Actions/Route Handlers — skip silently in Server Components
    try {
      cookieStore.set('fox_token', newAccessToken, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 });
      if (newRefreshToken) {
        cookieStore.set('fox_refresh_token', newRefreshToken, { ...cookieOpts, maxAge: 30 * 24 * 60 * 60 });
      }
      const userStr = cookieStore.get('fox_user')?.value;
      if (userStr) {
        const user = JSON.parse(decodeURIComponent(userStr));
        cookieStore.set('fox_user', JSON.stringify({ ...user, accessToken: newAccessToken }), {
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        });
      }
    } catch {
      // Cannot persist refreshed token in a Server Component context — the client will re-sync on next load
    }

    console.log('[Auth] Token refreshed successfully');
    return newAccessToken;
  } catch {
    return null;
  }
}

async function clearAuthAndRedirect() {
  // Cookie deletion is only allowed in Server Actions/Route Handlers, not Server Components.
  // The client-side auth store clears localStorage on the next request after a 401.
  redirect('/login');
}

async function serverFetch(endpoint: string, params?: Record<string, string>): Promise<any> {
  let token = await getAuthToken();
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
        'Content-Type': 'application/json',
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      },
      cache: 'no-store',
    });

  let res = await doFetch(token);

  if (res.status === 401) {
    // Access token expired — try to silently refresh
    const newToken = await tryRefreshToken();
    if (newToken) {
      // Retry the original request with the fresh token
      res = await doFetch(newToken);
    } else {
      // Refresh token also invalid — force re-login
      await clearAuthAndRedirect();
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error(`[API] ${res.status} ${res.statusText}: ${text}`);
    throw new Error(`API request failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// Exported for other server utilities that need a raw fetch helper
export async function getServerApi() {
  const token = await getAuthToken();
  const baseUrl = config.apiUrl;

  const request = async (endpoint: string, options: { params?: Record<string, string> } = {}) => {
    let url = `${baseUrl}${endpoint}`;
    if (options.params) {
      const qs = new URLSearchParams(options.params).toString();
      if (qs) url += `?${qs}`;
    }
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
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

const FALLBACK_IMG = '/herobackground.jpg';

function normalizeImages(images: any[]): string[] {
  if (!Array.isArray(images) || images.length === 0) return [FALLBACK_IMG];
  const urls = images
    .map((img) => (typeof img === 'string' ? img : img?.url || img?.imageUrl || ''))
    .filter(Boolean);
  return urls.length > 0 ? urls : [FALLBACK_IMG];
}

function normalizeVenue(v: any) {
  const images = normalizeImages(v.images ?? v.gallery ?? []);
  const img = images[0] || FALLBACK_IMG;
  return {
    ...v,
    title: v.title || v.name || 'Untitled Venue',
    type: v.type || v.venueType || 'Venue',
    loc: v.location || [v.city, v.province, v.country].filter(Boolean).join(', ') || '',
    cap: v.capacity ? `${v.capacity} guests` : '—',
    location: v.location || [v.city, v.province, v.country].filter(Boolean).join(', ') || '',
    province: v.province || v.country || '',
    price: Number(v.price || v.pricePerNight || 0),
    rating: Number(v.rating || v.averageRating || 0),
    reviews: Number(v.reviews || v.reviewCount || 0),
    images,
    img,
    description: v.description || '',
    category:
      typeof v.category === 'object'
        ? v.category?.name || v.category?.slug || ''
        : v.category || '',
    guestCount: Number(v.guestCount || v.capacity || 0),
    bedroomCount: Number(v.bedroomCount || v.bedrooms || 0),
    bathroomCount: Number(v.bathroomCount || v.bathrooms || 0),
    status: v.status || 'draft',
    bookings: v.bookingsCount ?? v.bookings ?? null,
    revenue: v.revenue ? `₱${Number(v.revenue).toLocaleString()}` : null,
  };
}

export async function getDashboardStats() {
  try {
    const body = await serverFetch('/admin/stats');
    return body?.data || {
      totalUsers: 0,
      activeEvents: 0,
      pendingApprovals: 0,
      totalRevenue: 0,
      totalBookings: 0,
      bookingsByDay: [0, 0, 0, 0, 0, 0, 0],
      categoryStats: [],
    };
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
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

export async function getUserDashboard(_userId: string) {
  await requireAuth();
  try {
    const body = await serverFetch('/bookings').catch(() => ({ data: [] }));
    const upcomingEvents = (body?.data || []).length;

    return {
      userName: 'User',
      upcomingEvents,
      recommendations: 0,
      citizenLevel: 5,
      weather: { temp: '22°C', condition: 'Sunny' },
    };
  } catch (error) {
    console.error('Failed to fetch user dashboard:', error);
    return {
      userName: 'User',
      upcomingEvents: 0,
      recommendations: 0,
      citizenLevel: 5,
      weather: { temp: '22°C', condition: 'Sunny' },
    };
  }
}

export async function getVenues() {
  try {
    const body = await serverFetch('/venues');
    return extractList(body).map(normalizeVenue);
  } catch (error) {
    console.error('Failed to fetch venues:', error);
    return [];
  }
}

export async function getAdminPendingVenues() {
  try {
    const body = await serverFetch('/admin/venues/pending');
    return extractList(body).map(normalizeVenue);
  } catch (error) {
    console.error('Failed to fetch admin pending venues:', error);
    return [];
  }
}

export async function getAdminPendingAssets() {
  try {
    const body = await serverFetch('/admin/assets/pending');
    return extractList(body);
  } catch (error) {
    console.error('Failed to fetch admin pending assets:', error);
    return [];
  }
}

export async function getAdminAllAssets() {
  try {
    const body = await serverFetch('/admin/assets');
    return extractList(body);
  } catch (error) {
    console.error('Failed to fetch admin all assets:', error);
    return [];
  }
}

export async function getAdminPendingServices() {
  try {
    const body = await serverFetch('/admin/services/pending');
    return extractList(body);
  } catch (error) {
    console.error('Failed to fetch admin pending services:', error);
    return [];
  }
}

export async function getAdminAllServices() {
  try {
    const body = await serverFetch('/admin/services');
    return extractList(body);
  } catch (error) {
    console.error('Failed to fetch admin all services:', error);
    return [];
  }
}

export async function getAdminEvents() {
  try {
    const body = await serverFetch('/admin/events');
    return extractList(body);
  } catch (error) {
    console.error('Failed to fetch admin events:', error);
    return [];
  }
}

export async function getAdminEventTemplates() {
  try {
    const body = await serverFetch('/admin/event-templates');
    return extractList(body);
  } catch (error) {
    console.error('Failed to fetch admin event templates:', error);
    return [];
  }
}

export async function getEvents() {
  try {
    const body = await serverFetch('/event-templates');
    return extractList(body);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return [];
  }
}

export async function getCategories() {
  try {
    const body = await serverFetch('/categories');
    return extractList(body);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

export async function getUsers() {
  try {
    const body = await serverFetch('/users');
    return extractList(body);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
}

export async function getAllAssets() {
  try {
    const body = await serverFetch('/asset');
    return extractList(body);
  } catch (error) {
    console.error('Failed to fetch assets:', error);
    return [];
  }
}

export async function getAllServices() {
  try {
    const body = await serverFetch('/service');
    return extractList(body);
  } catch (error) {
    console.error('Failed to fetch services:', error);
    return [];
  }
}

export async function getAllBookings() {
  try {
    const [serviceBody, assetBody, eventBody] = await Promise.all([
      serverFetch('/service/bookings'),
      serverFetch('/asset/bookings'),
      serverFetch('/bookings'),
    ]);
    return {
      serviceBookings: extractList(serviceBody),
      assetBookings:   extractList(assetBody),
      eventBookings:   extractList(eventBody),
    };
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    return { serviceBookings: [], assetBookings: [], eventBookings: [] };
  }
}

export async function getServicesByHostId(hostId: string) {
  try {
    const body = await serverFetch('/service', { ownerId: hostId });
    return extractList(body);
  } catch (error) {
    console.error('Failed to fetch services:', error);
    return [];
  }
}

export async function getHostDashboard(userId: string) {
  await requireAuth();
  try {
    const [eventsBody, venuesBody, assetsBody, servicesBody] = await Promise.all([
      serverFetch('/event-templates', { ownerId: userId }).catch(() => ({})),
      serverFetch('/venues', { hostId: userId }).catch(() => ({})),
      serverFetch('/asset', { ownerId: userId }).catch(() => ({})),
      serverFetch('/service', { ownerId: userId }).catch(() => ({})),
    ]);

    return {
      events: extractList(eventsBody),
      venues: extractList(venuesBody).map(normalizeVenue),
      inventory: extractList(assetsBody),
      services: extractList(servicesBody),
    };
  } catch (error) {
    console.error('Failed to fetch host dashboard:', error);
    return { events: [], venues: [], inventory: [], services: [] };
  }
}

export async function getVenueById(id: string) {
  try {
    const body = await serverFetch(`/venues/${id}`);
    const data = extractOne(body);
    if (!data) return getMockFallbackVenue(id);
    return normalizeVenue(data);
  } catch {
    return getMockFallbackVenue(id);
  }
}

function getMockFallbackVenue(id: string) {
  return {
    id,
    title: 'Neon Nights: Underground Cyberpunk Rave',
    rating: 4.92,
    reviews: 124,
    location: 'Poblacion, Makati',
    province: 'Metro Manila',
    category: 'Nightlife',
    guestCount: 200,
    bedroomCount: 1,
    bathroomCount: 4,
    price: 1500,
    offers: ['VIP Access', '2 Free Drinks', 'Pro Photography', 'Air Conditioning', 'Secure Parking', 'Meet & Greet'],
    description:
      "Step into a cyberpunk dreamscape right in the heart of Makati. This isn't just a party; it's an immersive journey through the city's hidden underground scenes.\n\nWe'll start at a secret rooftop bar for sunset drinks, then move to an exclusive retro-wave bunker that's normally members-only. Expect neon lights, synth-wave beats, and a crowd that matches your vibe.",
    images: [
      'https://images.unsplash.com/photo-1574391884720-385e66752079?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=800&auto=format&fit=crop',
    ],
  };
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
    const body = await serverFetch('/event-templates/browse', { category: categorySlug });
    return extractList(body);
  } catch (error) {
    console.error(`Failed to fetch events for category ${categorySlug}:`, error);
    return [];
  }
}

export async function getVenuesByCategory(categorySlug: string) {
  try {
    const body = await serverFetch('/venues', { category: categorySlug });
    return extractList(body).map(normalizeVenue);
  } catch (error) {
    console.error(`Failed to fetch venues for category ${categorySlug}:`, error);
    return [];
  }
}
