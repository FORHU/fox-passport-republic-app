import axios from 'axios';
import { cookies } from 'next/headers';
import { config } from '@/lib/config';
import { requireAuth } from './auth';

// Helper to create a server-side axios instance with the token from cookies
export async function getServerApi() {
  const cookieStore = await cookies();
  let token = cookieStore.get('fox_token')?.value;

  // fox_token is httpOnly — if not found, fall back to the accessToken embedded in fox_user
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

  return axios.create({
    baseURL: config.apiUrl,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
}

function extractData(response: any, arrayFallback = false) {
  if (!response?.data) return arrayFallback ? [] : null;
  const body = response.data;
  
  if (arrayFallback) {
    const list = body.data ?? body.venues ?? body.events ?? body.users ?? body.categories ?? body.services ?? body;
    return Array.isArray(list) ? list : [];
  } else {
    return body.data ?? body.venue ?? body.event ?? body.category ?? body.user ?? body.service ?? body;
  }
}

export async function getDashboardStats() {
  const api = await getServerApi();
  try {
    const { data } = await api.get('/admin/stats');
    return data?.data || { totalUsers: 0, activeEvents: 0 };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return { totalUsers: 0, activeEvents: 0 };
  }
}

export async function getUserDashboard(_userId: string) {
  await requireAuth();
  const api = await getServerApi();
  try {
    // Catch the 404 locally since this endpoint doesn't exist yet in the backend
    const bookingsRes = await api.get('/bookings').catch(() => ({ data: { data: [] } }));
    const upcomingEvents = (bookingsRes.data?.data || []).length;
    
    // Mock weather
    const weather = { temp: '22°C', condition: 'Sunny' };
    const citizenLevel = 5;
    
    return {
      userName: 'User',
      upcomingEvents,
      recommendations: 0,
      citizenLevel,
      weather,
    };
  } catch (error) {
    console.error("Failed to fetch user dashboard:", error);
    return {
      userName: 'User',
      upcomingEvents: 0,
      recommendations: 0,
      citizenLevel: 5,
      weather: { temp: '22°C', condition: 'Sunny' }
    };
  }
}

export async function getVenues() {
  const api = await getServerApi();
  try {
    const response = await api.get('/venues');
    return extractData(response, true);
  } catch (error) {
    console.error("Failed to fetch venues:", error);
    return [];
  }
}

export async function getEvents() {
  const api = await getServerApi();
  try {
    const response = await api.get('/event-templates');
    return extractData(response, true);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return [];
  }
}

export async function getCategories() {
  const api = await getServerApi();
  try {
    const response = await api.get('/categories');
    return extractData(response, true);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function getUsers() {
  const api = await getServerApi();
  try {
    const response = await api.get('/users');
    return extractData(response, true);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

export async function getServicesByHostId(hostId: string) {
  const api = await getServerApi();
  try {
    const response = await api.get('/service', { params: { ownerId: hostId } });
    return extractData(response, true);
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return [];
  }
}

export async function getHostDashboard(userId: string) {
  await requireAuth();
  const api = await getServerApi();
  try {
    const [eventsRes, venuesRes, servicesRes] = await Promise.all([
      api.get('/events', { params: { hostId: userId } }).catch(() => ({ data: { events: [] } })),
      api.get('/venues', { params: { hostId: userId } }).catch(() => ({ data: { venues: [] } })),
      api.get('/services', { params: { ownerId: userId } }).catch(() => ({ data: { services: [] } }))
    ]);
    
    return {
      events: extractData(eventsRes, true),
      venues: extractData(venuesRes, true),
      inventory: [],
      services: extractData(servicesRes, true),
    };
  } catch (error) {
    console.error("Failed to fetch host dashboard:", error);
    return { events: [], venues: [], inventory: [], services: [] };
  }
}

export async function getVenueById(id: string) {
  const api = await getServerApi();
  try {
    const response = await api.get(`/venues/${id}`);
    const data = extractData(response, false);
    if (!data) return getMockFallbackVenue(id);
    return data;
  } catch (error) {
    return getMockFallbackVenue(id);
  }
}

function getMockFallbackVenue(id: string) {
  return {
    id: id,
    title: "Neon Nights: Underground Cyberpunk Rave",
    rating: 4.92,
    reviews: 124,
    location: "Poblacion, Makati",
    province: "Metro Manila",
    category: "Nightlife",
    guestCount: 200,
    bedroomCount: 1, 
    bathroomCount: 4,
    price: 1500,
    offers: ["VIP Access", "2 Free Drinks", "Pro Photography", "Air Conditioning", "Secure Parking", "Meet & Greet"],
    description: "Step into a cyberpunk dreamscape right in the heart of Makati. This isn't just a party; it's an immersive journey through the city's hidden underground scenes.\n\nWe'll start at a secret rooftop bar for sunset drinks, then move to an exclusive retro-wave bunker that's normally members-only. Expect neon lights, synth-wave beats, and a crowd that matches your vibe.",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAmLMhfBavcKVkOWHaS4TPPk-NHIcut_ZhBBEe8lYdYR3H4t2yqSZKN4kaK-4daM6PVExafzgFu6-ETEkTvY3iOkNq3VyaKMs5jeDTMhhkOITtl93afJOgej_LM-nwJ4slOZvjY9jUaO0XJczNgnvj21yuB3eVwQrWu2qU4kFoFm9oertAy6N8vnz-DcYaCFbk-2wqIYps1HbNWSCB5TBISWObKfniMTbMOzf964UcanLKD2UIOD2M5IRj5kXf1kvppEdNzUJY4S3U",
      "https://images.unsplash.com/photo-1574391884720-385e66752079?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=800&auto=format&fit=crop"
    ]
  };
}

export async function getCategoryBySlug(slug: string) {
  const api = await getServerApi();
  try {
    const response = await api.get(`/categories/slug/${slug}`);
    return extractData(response, false);
  } catch (error) {
    console.error(`Failed to fetch category ${slug}:`, error);
    return null;
  }
}

export async function getEventsByCategory(categorySlug: string) {
  const api = await getServerApi();
  try {
    const response = await api.get('/events', { params: { category: categorySlug } });
    return extractData(response, true);
  } catch (error) {
    console.error(`Failed to fetch events for category ${categorySlug}:`, error);
    return [];
  }
}

export async function getVenuesByCategory(categorySlug: string) {
  const api = await getServerApi();
  try {
    const response = await api.get('/venues', { params: { category: categorySlug } });
    return extractData(response, true);
  } catch (error) {
    console.error(`Failed to fetch venues for category ${categorySlug}:`, error);
    return [];
  }
}