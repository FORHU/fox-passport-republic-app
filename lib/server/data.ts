import { createClient } from './supabase'
import { requireAuth } from './auth'

export async function getDashboardStats() {
  const supabase = await createClient()
  // Implement fetching stats
  // For example:
  const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true })
  const { count: eventsCount } = await supabase.from('events').select('*', { count: 'exact', head: true })
  // etc.
  return {
    totalUsers: usersCount || 0,
    activeEvents: eventsCount || 0,
    // add more
  }
}

export async function getUserDashboard(userId: string) {
  await requireAuth()
  const supabase = await createClient()
  const { data: upcomingEvents } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .gte('date', new Date().toISOString())
  const { data: recommendations } = await supabase
    .from('recommendations')
    .select('*')
    .eq('user_id', userId)
  // Mock weather
  const weather = { temp: '22°C', condition: 'Sunny' }
  const citizenLevel = 5 // calculate based on data
  return {
    userName: 'User', // from user
    upcomingEvents: upcomingEvents?.length || 0,
    recommendations: recommendations?.length || 0,
    citizenLevel,
    weather,
  }
}

export async function getVenues() {
  const supabase = await createClient()
  const { data } = await supabase.from('venues').select('*')
  return data || []
}

export async function getEvents() {
  const supabase = await createClient()
  const { data } = await supabase.from('events').select('*')
  return data || []
}

export async function getCategories() {
  const supabase = await createClient()
  const { data } = await supabase.from('categories').select('*')
  return data || []
}

export async function getUsers() {
  const supabase = await createClient()
  const { data } = await supabase.from('users').select('*')
  return data || []
}

export async function getHostDashboard(userId: string) {
  await requireAuth() // ensure authenticated
  const supabase = await createClient()
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('host_id', userId)
  const { data: venues } = await supabase
    .from('venues')
    .select('*')
    .eq('host_id', userId)
  const { data: inventory } = await supabase
    .from('inventory')
    .select('*')
    .eq('host_id', userId)
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('host_id', userId)
  return {
    events: events || [],
    venues: venues || [],
    inventory: inventory || [],
    services: services || [],
  }
}