// Authentication related types

export interface User {
  id: string;
  userId?: string;
  email: string;
  username: string;
  name: string;
  systemRole: "user" | "admin" | "super_admin" | "mayor";
  roleType?: string[];
  role?: string; // legacy — prefer systemRole
  isHost?: boolean;
  mobileNumber?: string;
  isEmailVerified?: boolean;
  imgId?: string; // profile image URL (CloudFront)
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
