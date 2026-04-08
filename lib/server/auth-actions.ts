'use server';

import { cookies } from 'next/headers';
import { LoginResponse } from '@/types/auth';

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
 * Server action to clear authentication cookies on logout
 */
export async function clearAuthCookies() {
  const cookieStore = await cookies();

  cookieStore.delete('fox_token');
  cookieStore.delete('fox_refresh_token');
  cookieStore.delete('fox_user');

  return true;
}
