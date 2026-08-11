// Authentication related types

/** Mirrors the API's `SystemRole` Prisma enum — there is no `super_admin` tier. */
export type SystemRole = "user" | "admin";

/** Mirrors the API's `RoleType` Prisma enum. */
export type RoleType =
  | "venueFoxer"
  | "eventFoxer"
  | "gearFoxer"
  | "serviceFoxer"
  | "investor";

export interface User {
  id: string;
  userId?: string;
  email: string;
  username: string;
  name: string;
  systemRole: SystemRole;
  roleType?: RoleType[];
  isEventFoxer?: boolean;
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
