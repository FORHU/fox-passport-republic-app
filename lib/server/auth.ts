/**
 * Server-side utility for authentication checks
 * Use in Server Components and Server Actions
 */

import { cookies } from "next/headers";

interface StoredUser {
  id: string;
  email: string;
  username: string;
  name: string;
  role: "user" | "host" | "admin" | "super_admin" | "mayor";
  isHost: boolean;
  mobileNumber?: string;
}

/**
 * Get the current user from cookies (server-side)
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<StoredUser | null> {
  const cookieStore = await cookies();
  const userJson = cookieStore.get("fox_user")?.value;

  if (!userJson) return null;

  try {
    return JSON.parse(userJson) as StoredUser;
  } catch {
    return null;
  }
}

/**
 * Get the access token from cookies (server-side)
 */
export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("fox_token")?.value || null;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  const token = await getAccessToken();
  return !!user && !!token;
}

/**
 * Check if user has a specific role
 */
export async function hasRole(role: string | string[]): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(user.role);
}

/**
 * Check if user is a host (can create events, venues, services, assets)
 */
export async function isHost(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  return (
    user.isHost ||
    ["host", "mayor", "admin", "super_admin"].includes(user.role)
  );
}

/**
 * Check if user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole(["admin", "super_admin"]);
}

/**
 * Check if user is a mayor (can create venues)
 */
export async function isMayor(): Promise<boolean> {
  return hasRole(["mayor", "admin", "super_admin"]);
}

/**
 * Get user ID for database queries
 */
export async function getUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id || null;
}

/**
 * Require authentication - throws if user is not authenticated
 */
export async function requireAuth(): Promise<StoredUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
}

/**
 * Require host role - throws if user is not a host
 */
export async function requireHost(): Promise<StoredUser> {
  const user = await requireAuth();
  const hostCheck = await isHost();
  if (!hostCheck) {
    throw new Error("Host access required");
  }
  return user;
}

/**
 * Require admin role - throws if user is not an admin
 */
export async function requireAdmin(): Promise<StoredUser> {
  const user = await requireAuth();
  const adminCheck = await isAdmin();
  if (!adminCheck) {
    throw new Error("Admin access required");
  }
  return user;
}

