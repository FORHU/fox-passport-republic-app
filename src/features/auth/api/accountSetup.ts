import api from "@/shared/lib/axios";
import type { User } from "@/shared/auth/types";

/** Where a Google account without a username or password is sent (api#419). */
export const ACCOUNT_SETUP_PATH = "/account-setup";

/** Whether nobody else uses this username; the caller's own counts as free. */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const { data } = await api.get("/profile/username-availability", {
    params: { username },
  });
  return Boolean(data?.data?.available);
}

/**
 * Sets the username and password the account lacks. Answers with the fresh
 * profile, which no longer needs setup.
 */
export async function submitAccountSetup(body: {
  username?: string;
  password?: string;
  confirmPassword?: string;
}): Promise<User> {
  const { data } = await api.post("/profile/credentials", body);
  return data.data as User;
}
