import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";
import { getBrowserApiUrl, config } from "@/shared/lib/config";

export function getBetterAuthBaseUrl(): string {
  try {
    let url = "";
    if (
      typeof window !== "undefined" &&
      window.location?.protocol &&
      window.location?.hostname
    ) {
      url = getBrowserApiUrl();
    } else {
      url = config.apiUrl || "http://localhost:6002";
    }
    const sanitized = url ? url.replace(/\/api\/v1\/?$/, "") : "http://localhost:6002";
    // Validate it can be parsed as a valid URL
    new URL(sanitized);
    return sanitized;
  } catch {
    return "http://localhost:6002";
  }
}

export const authClient = createAuthClient({
  baseURL: getBetterAuthBaseUrl(),
  // Email verification and password-reset codes (API: emailOTP plugin).
  plugins: [emailOTPClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
