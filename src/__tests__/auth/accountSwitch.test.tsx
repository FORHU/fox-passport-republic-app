import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, render, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

/**
 * QA (Authentication / Session Management): signing in as a second user
 * without logging out first left the first user in the header, the user menu
 * and `fox_user`, while the session API reported the new one.
 *
 * Logout cleared the query cache and login did not, a profile request from the
 * old session could answer after the switch and write the old user back, and
 * `fetchProfile` merged one account's profile into another's.
 */

const api = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/shared/lib/axios", () => ({ default: api }));

const signIn = vi.hoisted(() => vi.fn());
vi.mock("@/shared/auth/auth-client", () => ({
  authClient: { signIn: { email: signIn } },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const refreshSession = vi.hoisted(() => vi.fn());
vi.mock("@/shared/auth/session-api", () => ({ refreshSession }));
vi.mock("@/shared/hooks/useUnreadMessagesCount", () => ({
  useUnreadMessagesCount: () => ({ unreadCount: 0 }),
}));

import { useLogin } from "@/features/auth/hooks/useAuth";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { fetchProfile, PROFILE_QUERY_KEY } from "@/shared/auth/profile";
import { AuthStoreProvider } from "@/shared/providers/AuthStoreProvider";
import UserMenuButton from "@/shared/components/layout/UserMenuButton";
import { useCheckoutStore } from "@/shared/store/useCheckoutStore";
import { useNotificationStore } from "@/shared/store/useNotificationStore";
import { useItemBookingStore } from "@/features/booking/store/useItemBookingStore";
import { useMessageStore } from "@/features/messages/store/useMessageStore";
import { useChatWindowsStore } from "@/features/messages/store/useChatWindowsStore";

const USER_A = {
  id: "a",
  email: "a@example.com",
  name: "Alice",
  imgId: "alice.webp",
  city: "Cebu",
};
const USER_B = { id: "b", email: "b@example.com", name: "Bea" };

const profileReply = (user: object) => ({ data: { data: user } });
const legacyCookie = () => document.cookie.includes("fox_user=");

let queryClient: QueryClient;
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
// AuthStoreProvider drops the previous account's cached responses.
const withAuth = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <AuthStoreProvider>{children}</AuthStoreProvider>
  </QueryClientProvider>
);

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  queryClient = new QueryClient();
  // Signed in as A, the old custom sign-in's cookie still in the browser.
  useAuthStore.getState().login({ user: USER_A as never });
  document.cookie = `fox_user=${encodeURIComponent(JSON.stringify(USER_A))}; path=/`;
  queryClient.setQueryData(PROFILE_QUERY_KEY, USER_A);
  queryClient.setQueryData(["conversations"], ["A's inbox"]);
});

describe("signing in as B without logging out of A", () => {
  it("replaces A everywhere and drops A's cached data", async () => {
    signIn.mockResolvedValue({
      data: { user: USER_B, session: { token: "t" } },
    });
    api.get.mockResolvedValue(profileReply({ ...USER_B, permissions: [] }));
    const { result } = renderHook(() => useLogin(), { wrapper: withAuth });

    await act(() =>
      result.current.mutateAsync({ email: USER_B.email, password: "pw" }),
    );

    expect(useAuthStore.getState().user).toMatchObject({
      id: "b",
      name: "Bea",
    });
    expect(JSON.parse(localStorage.getItem("fox_user")!).id).toBe("b");
    expect(legacyCookie()).toBe(false);
    // A's cache is gone; what's on screen refetched for B.
    expect(queryClient.getQueryData(["conversations"])).toBeUndefined();
    await waitFor(() =>
      expect(queryClient.getQueryData(PROFILE_QUERY_KEY)).toMatchObject({
        id: "b",
      }),
    );
  });
});

describe("fetchProfile", () => {
  it("replaces, not merges, when the session belongs to someone else", async () => {
    // An account switched outside the UI: the stored user is A, the cookie B.
    api.get.mockResolvedValue(profileReply(USER_B));

    await fetchProfile();

    expect(useAuthStore.getState().user).toEqual(USER_B);
    expect(JSON.parse(localStorage.getItem("fox_user")!)).toEqual(USER_B);
  });

  it("still merges into the same person", async () => {
    api.get.mockResolvedValue(profileReply({ id: "a", name: "Alice Cruz" }));

    await fetchProfile();

    expect(useAuthStore.getState().user).toMatchObject({
      id: "a",
      name: "Alice Cruz",
      city: "Cebu",
    });
  });

  it("ignores A's profile when it answers after B has signed in", async () => {
    let answer!: (reply: unknown) => void;
    api.get.mockReturnValueOnce(new Promise((resolve) => (answer = resolve)));

    const late = fetchProfile(); // started on A's session
    useAuthStore.getState().login({ user: USER_B as never });
    answer(profileReply(USER_A));
    await late;

    expect(useAuthStore.getState().user).toEqual(USER_B);
    expect(JSON.parse(localStorage.getItem("fox_user")!).id).toBe("b");
  });
});

it("drops A's cached data however the switch is noticed (a profile poll)", async () => {
  render(<AuthStoreProvider>page</AuthStoreProvider>, { wrapper });
  api.get.mockResolvedValue(profileReply(USER_B));

  await act(() => fetchProfile());

  expect(queryClient.getQueryData(["conversations"])).toBeUndefined();
});

it("logging out drops the legacy cookie too", () => {
  useAuthStore.getState().logout();
  expect(legacyCookie()).toBe(false);
  expect(localStorage.getItem("fox_user")).toBeNull();
});

/**
 * What lives outside the query cache: the checkout and item-booking stores
 * (kept in sessionStorage: contact details, booking ids, Stripe secrets) and
 * the notification, message and chat-window stores in memory. Email sign-in
 * and logout navigate client-side, so all of it used to outlive the account.
 */
describe("per-account stores", () => {
  const fillAsA = () => {
    useCheckoutStore.setState({
      attendees: [
        { firstName: "Alice", lastName: "A", email: USER_A.email, phone: "1" },
      ],
      clientSecret: "pi_A_secret",
    });
    useItemBookingStore.setState({ bookingId: "bkA", clientSecret: "pi_A2" });
    useNotificationStore.setState({
      notifications: [{ id: "n1" } as never],
      unreadCount: 1,
    });
    useMessageStore.setState({ messagesByConversation: { c1: [] } });
    useChatWindowsStore.setState({
      windows: [{ id: "alice-friend" } as never],
    });
    sessionStorage.setItem("foxpassport_draft_investment_wizard", "{}");
  };

  const expectEmpty = () => {
    expect(useCheckoutStore.getState().attendees[0].firstName).toBe("");
    expect(useCheckoutStore.getState().clientSecret).toBeNull();
    expect(useItemBookingStore.getState().bookingId).toBeNull();
    expect(useNotificationStore.getState().notifications).toEqual([]);
    expect(useNotificationStore.getState().unreadCount).toBe(0);
    expect(useMessageStore.getState().messagesByConversation).toEqual({});
    expect(useChatWindowsStore.getState().windows).toEqual([]);
    expect(
      sessionStorage.getItem("foxpassport_draft_investment_wizard"),
    ).toBeNull();
    expect(
      JSON.parse(sessionStorage.getItem("foxpassport-checkout") ?? "{}").state
        ?.clientSecret ?? null,
    ).toBeNull();
  };

  it("are emptied when B signs in over A", () => {
    fillAsA();
    useAuthStore.getState().login({ user: USER_B as never });
    expectEmpty();
  });

  it("are emptied on logout", () => {
    fillAsA();
    useAuthStore.getState().logout();
    expectEmpty();
  });

  it("are kept when the page reloads as the same person", () => {
    useAuthStore.getState().logout();
    sessionStorage.setItem("foxpassport-checkout", '{"state":{"step":2}}');
    localStorage.setItem("fox_user", JSON.stringify(USER_A));

    useAuthStore.getState().initialize();

    expect(useAuthStore.getState().user?.id).toBe("a");
    expect(sessionStorage.getItem("foxpassport-checkout")).toContain(
      '"step":2',
    );
  });
});

describe("UserMenuButton's session sync", () => {
  it("ignores A's reply when it answers after B has signed in", async () => {
    let answer!: (user: unknown) => void;
    refreshSession.mockReturnValueOnce(new Promise((r) => (answer = r)));
    render(<UserMenuButton />, { wrapper });

    act(() => useAuthStore.getState().login({ user: USER_B as never }));
    await act(async () => answer(USER_A));

    expect(useAuthStore.getState().user?.id).toBe("b");
  });
});

describe("another tab", () => {
  const reload = vi.fn();
  beforeEach(() => {
    reload.mockClear();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, reload },
    });
  });

  const otherTabWrites = (user: object | null) =>
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "fox_user",
        newValue: user ? JSON.stringify(user) : null,
      }),
    );

  it("reloads this tab when someone else signs in there, or signs out", () => {
    render(<AuthStoreProvider>page</AuthStoreProvider>, { wrapper });
    otherTabWrites(USER_B);
    expect(reload).toHaveBeenCalledTimes(1);
    otherTabWrites(null);
    expect(reload).toHaveBeenCalledTimes(2);
  });

  it("leaves it alone when the same person's profile is updated there", () => {
    render(<AuthStoreProvider>page</AuthStoreProvider>, { wrapper });
    otherTabWrites({ ...USER_A, name: "Alice Cruz" });
    expect(reload).not.toHaveBeenCalled();
  });
});
