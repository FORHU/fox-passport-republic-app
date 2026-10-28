import { describe, it, expect, vi, afterEach } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * What `SocketProvider` actually does with what the server sends - the
 * behaviour `realtimeInvalidation.test.ts` only checks the shape of. On 2 Sep
 * the socket had been dead for weeks while every structural test passed: it
 * still connected with an access token that no longer existed. So these drive
 * the provider the way the server does, through a socket stand-in, and look
 * at what reaches React Query and the realtime bus.
 */

type Handler = (payload: unknown) => void;

const fake = vi.hoisted(() => {
  const handlers = new Map<string, Handler>();
  const socket = {
    connect: vi.fn(),
    on: vi.fn((event: string, fn: Handler) => handlers.set(event, fn)),
    off: vi.fn((event: string) => handlers.delete(event)),
  };
  return {
    handlers,
    socket,
    connectSocket: vi.fn((_getTicket: () => Promise<string | null>) => socket),
    disconnectSocket: vi.fn(),
    /** The server sending `event`. */
    serverSends: (event: string, payload: unknown) =>
      handlers.get(event)?.(payload),
  };
});
vi.mock("@/shared/lib/socket", () => ({
  connectSocket: fake.connectSocket,
  disconnectSocket: fake.disconnectSocket,
}));

const api = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("@/shared/lib/axios", () => ({ default: api }));

const auth = vi.hoisted(() => ({ isAuthenticated: true }));
vi.mock("@/shared/auth/useAuthStore", () => ({
  useAuthStore: (select: (s: typeof auth) => unknown) => select(auth),
}));

import { SocketProvider } from "@/shared/providers/SocketProvider";
import {
  SOCKET_EVENTS,
  TOPIC_QUERY_KEYS,
  subscribeRealtime,
} from "@/shared/lib/realtime";

function renderProvider(isAuthenticated = true) {
  auth.isAuthenticated = isAuthenticated;
  const queryClient = new QueryClient();
  const invalidate = vi.spyOn(queryClient, "invalidateQueries");
  const view = render(
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <div />
      </SocketProvider>
    </QueryClientProvider>,
  );
  return { invalidate, view };
}

afterEach(() => {
  cleanup();
  fake.handlers.clear();
  vi.clearAllMocks();
});

describe("SocketProvider", () => {
  it("connects with a ticket fetched through the proxy, not a stored token", async () => {
    api.post.mockResolvedValue({ data: { data: { ticket: "tk-1" } } });
    renderProvider();

    expect(fake.socket.connect).toHaveBeenCalledTimes(1);
    const getTicket = fake.connectSocket.mock.calls[0][0];
    await expect(getTicket()).resolves.toBe("tk-1");
    expect(api.post).toHaveBeenCalledWith("/auth/socket-ticket");
  });

  it("connects without a ticket rather than failing when the ticket request does", async () => {
    api.post.mockRejectedValue(new Error("401"));
    renderProvider();

    const getTicket = fake.connectSocket.mock.calls[0][0];
    await expect(getTicket()).resolves.toBeNull();
  });

  it("refreshes every query a topic maps to when the server invalidates it", () => {
    const { invalidate } = renderProvider();

    act(() =>
      fake.serverSends(SOCKET_EVENTS.DATA_INVALIDATE, { topic: "bookings" }),
    );

    expect(invalidate.mock.calls.map(([f]) => f?.queryKey)).toEqual(
      TOPIC_QUERY_KEYS.bookings,
    );
  });

  it("refreshes nothing for a topic it has no mapping for", () => {
    const { invalidate } = renderProvider();

    act(() =>
      fake.serverSends(SOCKET_EVENTS.DATA_INVALIDATE, { topic: "nope" }),
    );

    expect(invalidate).not.toHaveBeenCalled();
  });

  it("hands notifications and chat messages to the features that own them", () => {
    const notified = vi.fn();
    const messaged = vi.fn();
    const stop = [
      subscribeRealtime(SOCKET_EVENTS.NEW_NOTIFICATION, notified),
      subscribeRealtime(SOCKET_EVENTS.NEW_MESSAGE, messaged),
    ];
    renderProvider();

    act(() => {
      fake.serverSends(SOCKET_EVENTS.NEW_NOTIFICATION, { id: "n1" });
      fake.serverSends(SOCKET_EVENTS.NEW_MESSAGE, { id: "m1" });
    });

    expect(notified).toHaveBeenCalledWith({ id: "n1" });
    expect(messaged).toHaveBeenCalledWith({ id: "m1" });
    stop.forEach((s) => s());
  });

  it("does not connect for a signed-out visitor", () => {
    renderProvider(false);

    expect(fake.connectSocket).not.toHaveBeenCalled();
    expect(fake.disconnectSocket).toHaveBeenCalled();
  });

  it("stops listening and disconnects when it unmounts", () => {
    const { view } = renderProvider();
    view.unmount();

    expect(fake.socket.off).toHaveBeenCalledWith(SOCKET_EVENTS.DATA_INVALIDATE);
    expect(fake.disconnectSocket).toHaveBeenCalled();
    expect(fake.handlers.size).toBe(0);
  });
});
