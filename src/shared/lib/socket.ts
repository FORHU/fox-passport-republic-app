import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:6002";

let socket: Socket | null = null;

/**
 * The handshake credential is fetched per connection attempt, not captured
 * once.
 *
 * Tickets are single-use, and socket.io replays whatever `auth` held when it
 * reconnects - so a captured ticket would authenticate the first connection and
 * then fail every reconnection after a dropped network or a server restart,
 * which is exactly when reconnecting matters. Passing `auth` as a function
 * makes socket.io ask again each time.
 */
export const connectSocket = (getTicket: () => Promise<string | null>) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: (cb) => {
        getTicket()
          .then((ticket) => cb(ticket ? { ticket } : {}))
          // Hand back nothing rather than hanging: the server rejects the
          // handshake, socket.io backs off and retries, and the next attempt
          // asks for a fresh ticket.
          .catch(() => cb({}));
      },
      autoConnect: false,
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
