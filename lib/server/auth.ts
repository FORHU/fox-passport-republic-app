import { redirect } from 'next/navigation'
import { getServerApi } from './data'

export async function getUser() {
  try {
    const api = await getServerApi()
    const { data } = await api.get('/profile')
    return data?.data || data || null
  } catch (error) {
    // Fallback: If API is down or rejects, try to read user from cookies directly
    // This prevents a redirect loop if the backend is temporarily slow
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const userStr = cookieStore.get('fox_user')?.value;
      if (userStr) return JSON.parse(decodeURIComponent(userStr));
    } catch (e) {
      return null;
    }
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