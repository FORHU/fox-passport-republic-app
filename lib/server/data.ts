import { redirect } from 'next/navigation'
import { requireAuth, getAccessToken } from './auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1'

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const token = await getAccessToken()

  console.log(`[API] Fetching: ${url}`)
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    if (response.status === 401) {
      console.warn(`[API] 401 Unauthorized at ${endpoint}. Redirecting to auth...`)
      redirect('/?auth=expired')
    }

    const errorText = await response.text()
    console.error(`[API] ${response.status} ${response.statusText}: ${errorText}`)
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function getDashboardStats() {
  // For admin stats, perhaps call /admin/stats or something
  // For now, mock or call appropriate endpoint
  return {
    totalUsers: 0, // TODO: implement
    activeEvents: 0,
  }
}

export async function getUserDashboard(userId: string) {
  await requireAuth()
  // Backend endpoints use req.user.id from auth, so we don't need to pass userId
  const bookings = await apiFetch(`/bookings/user/${userId}`)
  const recommendations = await apiFetch(`/favorites/user/${userId}`)
  // Mock weather
  const weather = { temp: '22°C', condition: 'Sunny' }
  const citizenLevel = 5 // calculate based on data
  return {
    userName: 'User', // from user
    upcomingEvents: bookings.data?.length || 0,
    recommendations: recommendations.data?.length || 0,
    citizenLevel,
    weather,
  }
}

export async function getVenues() {
  const data = await apiFetch('/venues')
  // Map API response to match frontend Venue interface
  return (data.venues || []).map((venue: any) => ({
    id: venue.id,
    title: venue.name,
    location: venue.city,
    province: venue.state || venue.city,
    price: venue.price || 0,
    rating: 4.5, // TODO: calculate from reviews
    reviews: 0, // TODO: get review count
    images: venue.venueImages?.map((img: any) => img.url) || [],
    description: venue.description,
    category: venue.type,
    guestCount: venue.capacity,
    bedroomCount: 1, // TODO
    bathroomCount: 1, // TODO
    host: {
      name: venue.host?.name || 'Host',
      avatar: '', // TODO
      isCertifiedFoxer: false, // TODO
      joined: '2023', // TODO
    },
    offers: venue.amenities || [],
    activities: [], // TODO
    ratingCategories: {
      cleanliness: 4.5,
      accuracy: 4.5,
      checkIn: 4.5,
      communication: 4.5,
      location: 4.5,
      value: 4.5,
    },
  }))
}

export async function getEvents() {
  const data = await apiFetch('/events')
  return data.data || []
}

export async function getCategories() {
  const data = await apiFetch('/categories')
  return data.data || []
}

export async function getCategoryBySlug(slug: string) {
  const categories = await getCategories()
  return categories.find((cat: any) => cat.slug === slug) || null
}

export async function getEventsByCategory(categorySlug: string) {
  const data = await apiFetch(`/events?category=${categorySlug}`)
  return data.data || []
}

export async function getVenuesByCategory(categorySlug: string) {
  const data = await apiFetch(`/venues?category=${categorySlug}`)
  return data.data || []
}

export async function getVenueById(id: string) {
  const data = await apiFetch(`/venues/${id}`)
  const venue = data.venue
  return {
    id: venue.id,
    title: venue.name,
    location: venue.city,
    province: venue.state || venue.city,
    price: venue.price || 0,
    rating: 4.5,
    reviews: 0,
    images: venue.venueImages?.map((img: any) => img.url) || [],
    description: venue.description,
    category: venue.type,
    guestCount: venue.capacity,
    bedroomCount: 1,
    bathroomCount: 1,
    host: {
      name: venue.host?.name || 'Host',
      avatar: '',
      isCertifiedFoxer: false,
      joined: '2023',
    },
    offers: venue.amenities || [],
    activities: [],
    ratingCategories: {
      cleanliness: 4.5,
      accuracy: 4.5,
      checkIn: 4.5,
      communication: 4.5,
      location: 4.5,
      value: 4.5,
    },
  }
}

export async function getUsers() {
  const data = await apiFetch('/users')
  return data.data || []
}

export async function getServicesByHostId(hostId: string) {
  await requireAuth()
  const data = await apiFetch(`/services?hostId=${hostId}`)
  return data.data || []
}

export async function getHostDashboard(userId: string) {
  await requireAuth() // ensure authenticated
  const events = await apiFetch(`/events?hostId=${userId}`)
  const venues = await apiFetch(`/venues?hostId=${userId}`)
  const inventory = await apiFetch(`/assets?hostId=${userId}`)
  const services = await apiFetch(`/services?hostId=${userId}`)
  return {
    events: events.data || [],
    venues: venues.venues || [],
    inventory: inventory.data || [],
    services: services.data || [],
  }
}
