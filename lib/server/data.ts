import axios from 'axios';
import { cookies } from 'next/headers';
import { config } from '@/lib/config';
import { requireAuth } from './auth';

// Helper to create a server-side axios instance with the token from cookies
export async function getServerApi() {
  const cookieStore = await cookies();
  const token = cookieStore.get('fox_token')?.value;
  
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

export async function getUserDashboard(userId: string) {
  await requireAuth();
  const api = await getServerApi();
  try {
    const bookingsRes = await api.get('/bookings');
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
    const response = await api.get('/events');
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
    return extractData(response, false);
  } catch (error) {
    console.error(`Failed to fetch venue ${id}:`, error);
    return null;
  }
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