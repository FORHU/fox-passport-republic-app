import { redirect } from 'next/navigation'
import { getServerApi } from './data'

export async function getUser() {
  try {
    const api = await getServerApi()
    const { data } = await api.get('/profile')
    return data?.data || null
  } catch (error) {
    return null
  }
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect('/')
  }
  return user
}

export async function checkRole(userId: string, role: string) {
  // If role checking requires fetching the user again or looking at the current user obj
  const user = await getUser()
  return user?.role === role
}

export async function requireAdmin() {
  const user = await requireAuth()
  if (user?.role !== 'admin') {
    redirect('/')
  }
  return user
}

export async function requireHost() {
  const user = await requireAuth()
  const hostRoles = ['host', 'mayor', 'foxer', 'admin', 'super_admin'];
  if (!hostRoles.includes(user?.role?.toLowerCase())) {
    redirect('/')
  }
  return user
}