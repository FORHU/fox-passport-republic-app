// Authentication related types

export interface User {
  id: string;
  userId?: string; // Fallback for legacy/inconsistent backend responses
  email: string;
  username: string;
  name: string;
  role: "user" | "host" | "admin" | "super_admin" | "mayor";
  isHost: boolean;
  mobileNumber?: string;
  isEmailVerified?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
