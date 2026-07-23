import { redirect } from 'next/navigation'
import { getServerApi } from './data'

export async function getUser() {
  try {
    const api = await getServerApi()
    const { data } = await api.get('/profile')
    return data?.data || data || null
  } catch {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const userStr = cookieStore.get('fox_user')?.value;
      if (userStr) return JSON.parse(decodeURIComponent(userStr));
    } catch {
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

export async function checkRole(_userId: string, role: string) {
  const user = await getUser()
  return user?.systemRole === role
}

export async function requireAdmin() {
  const user = await requireAuth()
  const adminRoles = ['admin', 'super_admin'];
  if (!adminRoles.includes(user?.systemRole)) {
    redirect('/')
  }
  return user
}

export async function requireHost() {
  const user = await requireAuth()
  const systemRole = (user?.systemRole ?? user?.role ?? '').toLowerCase();
  const roleType: string[] = user?.roleType ?? [];
  const hostSystemRoles = ['host', 'mayor', 'foxer', 'admin', 'super_admin'];
  const hostRoleTypes = ['eventFoxer', 'venueFoxer', 'gearFoxer', 'serviceFoxer'];

  const hasAccess =
    hostSystemRoles.includes(systemRole) ||
    roleType.some((r) => hostRoleTypes.includes(r));

  if (!hasAccess) {
    redirect('/')
  }
  return user
}