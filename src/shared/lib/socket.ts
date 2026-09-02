import { io, Socket } from "socket.io-client";
import api from "./axios";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:6002";

let socket: Socket | null = null;

// The socket can outlive the short-lived socket token (issued fresh, since
// the real access token lives in an httpOnly cookie the client never reads),
// so `auth` is a callback re-invoked on every connect/reconnect attempt
// rather than a fixed value snapshotted once at `io(...)` time.
async function fetchSocketToken(): Promise<string | undefined> {
  try {
    const res = await api.get("/auth/socket-token");
    return res.data?.token;
  } catch {
    return undefined;
  }
}

export const connectSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      auth: (cb) => {
        fetchSocketToken().then((token) => cb({ token }));
      },
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
