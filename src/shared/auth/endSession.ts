import { authClient } from "@/shared/auth/auth-client";
import { clearAuthCookies } from "@/shared/lib/server/auth-actions";
import { useAuthStore } from "@/shared/auth/useAuthStore";

export async function endSession(): Promise<void> {
  // End Better Auth session on server and client
  await authClient.signOut().catch(() => {});
  // Clear any residual server-side cookies
  await clearAuthCookies().catch(() => {});
  useAuthStore.getState().logout();
}
