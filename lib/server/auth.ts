import { createClient } from './supabase'
import { redirect } from 'next/navigation'

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect('/')
  }
  return user
}

export async function checkRole(userId: string, role: string) {
  // Implement role checking logic
  // For example, check user_roles table
  const supabase = await createClient()
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single()

  return data?.role === role
}

export async function requireAdmin() {
  const user = await requireAuth()
  const isAdmin = await checkRole(user.id, 'admin')
  if (!isAdmin) {
    redirect('/')
  }
  return user
}

export async function requireHost() {
  const user = await requireAuth()
  const isHost = await checkRole(user.id, 'host')
  if (!isHost) {
    redirect('/')
  }
  return user
}