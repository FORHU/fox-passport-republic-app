import { createAuthClient } from "better-auth/react";
import { getBrowserApiUrl, config } from "@/shared/lib/config";

export function getBetterAuthBaseUrl(): string {
  const url =
    typeof window !== "undefined"
      ? getBrowserApiUrl()
      : config.apiUrl || "http://localhost:6002";
  return url ? url.replace(/\/api\/v1\/?$/, "") : "http://localhost:6002";
}

export const authClient = createAuthClient({
  baseURL: getBetterAuthBaseUrl(),
});

export const { signIn, signUp, signOut, useSession } = authClient;
