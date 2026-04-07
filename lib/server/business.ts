'use server';

// Business logic functions
import { requireAuth } from './auth'
import { z } from 'zod'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1'

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`)
  }

  return response.json()
}

const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
  // add more fields
})

const createVenueSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  // etc.
})

export async function createEvent(data: any) {
  const user = await requireAuth()
  const validated = createEventSchema.parse(data)
  const response = await apiFetch('/events', {
    method: 'POST',
    body: JSON.stringify({ ...validated, hostId: user.id }),
  })
  return response.data
}

export async function createVenue(data: any) {
  const user = await requireAuth()
  const validated = createVenueSchema.parse(data)
  const response = await apiFetch('/venues', {
    method: 'POST',
    body: JSON.stringify({ ...validated, hostId: user.id }),
  })
  return response.data
}

export async function cancelBooking(bookingId: string) {
  const user = await requireAuth()
  // First get the booking to check ownership
  const booking = await apiFetch(`/bookings/${bookingId}`)
  if (booking.data.userId !== user.id) {
    throw new Error('Not authorized')
  }
  await apiFetch(`/bookings/${bookingId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'cancelled' }),
  })
}

// Add more business logic functions