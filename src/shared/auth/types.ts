import type { Permission } from "@/shared/constants/permissions";

// Authentication related types

/** Mirrors the API's `SystemRole` Prisma enum — there is no `super_admin` tier. */
export type SystemRole = "user" | "admin_secretary" | "admin";

/** Mirrors the API's `RoleType` Prisma enum. */
export type RoleType =
  | "venueFoxer"
  | "eventFoxer"
  | "gearFoxer"
  | "serviceFoxer"
  | "performerFoxer"
  | "investor";

export interface User {
  id: string;
  userId?: string;
  email: string;
  username: string;
  name: string;
  systemRole: SystemRole;
  roleType?: RoleType[];
  // Server-derived, carried on login, refresh, the Google exchange and
  // /profile. `hasPermission()` is the only thing that reads this.
  permissions?: readonly Permission[];
  isEventFoxer?: boolean;
  mobileNumber?: string;
  isEmailVerified?: boolean;
  imgId?: string; // profile image URL (CloudFront)
  city?: string;
  country?: string;
  // Display-only — see src/shared/lib/currency.ts. Never affects what a
  // booking actually charges, only how amounts are shown to this user.
  preferredCurrency?: string;
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
