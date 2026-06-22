'use server';

import { cookies } from 'next/headers';
import axios from 'axios';
import { config as appConfig } from '@/shared/lib/config';
import { LoginResponse } from '@/features/auth/types/auth';

/**
 * Server action to set authentication cookies
 * Called after successful login from client
 */
export async function setAuthCookies(loginResponse: LoginResponse) {
  const cookieStore = await cookies();

  const { accessToken, refreshToken, user } = loginResponse;

  // Set token cookie (accessible to middleware)
  cookieStore.set('fox_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });

  // Set refresh token
  if (refreshToken) {
    cookieStore.set('fox_refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });
  }

  // Set user info (not HTTP-only so client can read it)
  const userWithToken = { ...user, accessToken };
  cookieStore.set('fox_user', JSON.stringify(userWithToken), {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });

  return true;
}

/**
 * Server action to refresh the JWT and fetch the latest profile.
 * Uses the refresh token to issue a new access token so the backend
 * sees the updated roleType (e.g. after a mayor/host application is approved).
 * Returns the updated user object, or null if tokens are missing/expired.
 */
export async function refreshUserSession(): Promise<Record<string, any> | null> {
  const cookieStore = await cookies();

  const refreshToken = cookieStore.get('fox_refresh_token')?.value;
  if (!refreshToken) return null;

  try {
    // Step 1: get a brand-new access token that reflects current DB roles
    const { data: tokenData } = await axios.post(
      `${appConfig.apiUrl}/auth/refresh-token`,
      { refreshToken }
    );
    const newAccessToken: string = tokenData.accessToken;
    if (!newAccessToken) return null;

    // Step 2: update fox_token cookie with the new JWT
    cookieStore.set('fox_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    // Step 3: fetch fresh profile using the new token
    const { data: profileData } = await axios.get(`${appConfig.apiUrl}/profile`, {
      headers: { Authorization: `Bearer ${newAccessToken}` },
    });
    const freshUser = profileData?.data || profileData;
    if (!freshUser) return null;

    const userWithToken = { ...freshUser, accessToken: newAccessToken };
    cookieStore.set('fox_user', JSON.stringify(userWithToken), {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    return userWithToken;
  } catch {
    return null;
  }
}

/**
 * Server action to clear authentication cookies on logout
 */
export async function clearAuthCookies() {
  const cookieStore = await cookies();

  cookieStore.delete('fox_token');
  cookieStore.delete('fox_refresh_token');
  cookieStore.delete('fox_user');

  return true;
}
