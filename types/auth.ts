// Authentication related types

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  role: "user" | "host" | "admin" | "super_admin";
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
