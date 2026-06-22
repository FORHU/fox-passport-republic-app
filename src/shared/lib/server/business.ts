// Business logic functions
import { createClient } from './supabase'
import { requireAuth } from './auth'
import { z } from 'zod'

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
  const supabase = await createClient()
  const { data: event } = await supabase
    .from('events')
    .insert({ ...validated, host_id: user.id })
    .select()
    .single()
  return event
}

export async function createVenue(data: any) {
  const user = await requireAuth()
  const validated = createVenueSchema.parse(data)
  const supabase = await createClient()
  const { data: venue } = await supabase
    .from('venues')
    .insert({ ...validated, host_id: user.id })
    .select()
    .single()
  return venue
}

export async function cancelBooking(bookingId: string) {
  const user = await requireAuth()
  const supabase = await createClient()
  // Check ownership
  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single()
  if (booking.user_id !== user.id) {
    throw new Error('Not authorized')
  }
  await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
}

// Add more business logic functions