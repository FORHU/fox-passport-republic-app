import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { config } from "@/shared/lib/config";

/**
 * Authenticated pass-through to the backend API.
 *
 * The backend accepts only `Authorization: Bearer` (no cookie-parser), so the
 * browser used to need the access token in `localStorage` to call it — which
 * defeated the point of storing `fox_token` httpOnly in the first place, and
 * left two copies of the token that drifted apart on every client-side refresh.
 *
 * Routing client calls through here means the token never reaches JavaScript:
 * the cookie is read server-side and turned into the header. A Route Handler
 * (unlike a Server Component) may also *write* cookies, so this is the one
 * place a refreshed token can actually be persisted.
 */

const HOP_BY_HOP = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "keep-alive",
  "transfer-encoding",
  "upgrade",
  "host",
]);

const ACCESS_COOKIE = "fox_token";
const REFRESH_COOKIE = "fox_refresh_token";

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

// Must match SESSION_MAX_AGE in auth-actions.ts, which derives it from
// REFRESH_TOKEN_EXPIRY. A refreshed cookie that outlives the token inside it
// puts the browser back to holding a credential the server stopped honouring.
const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

interface RefreshResult {
  accessToken: string;
  /** Rotation makes refresh tokens single-use, so this is always a new one. */
  refreshToken: string | null;
}

/**
 * In-flight refreshes, keyed by the refresh token being spent.
 *
 * Refresh tokens are single-use. Two parallel requests that both 401 would
 * otherwise both spend the same token — the first rotates it, the second
 * presents one that is already dead. The API tolerates that inside a 60-second
 * window rather than treating it as theft, but relying on the grace window for
 * something this predictable is wrong: collapse the race here instead, so each
 * token is spent exactly once per process.
 *
 * Process-local. It cannot cover two instances refreshing at the same instant —
 * that case is what the API's grace window is actually for.
 */
const inFlight = new Map<string, Promise<RefreshResult | null>>();

/** Exchange the refresh cookie for a new token pair, or null if it cannot. */
async function refreshAccessToken(
  refreshToken: string,
): Promise<RefreshResult | null> {
  const existing = inFlight.get(refreshToken);
  if (existing) return existing;

  const pending = (async (): Promise<RefreshResult | null> => {
    const res = await fetch(`${config.apiUrl}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!res.ok) return null;

    const body = await res.json().catch(() => null);
    const accessToken: string | undefined =
      body?.accessToken ?? body?.data?.accessToken;
    if (!accessToken) return null;

    return {
      accessToken,
      refreshToken: body?.refreshToken ?? body?.data?.refreshToken ?? null,
    };
  })().finally(() => {
    inFlight.delete(refreshToken);
  });

  inFlight.set(refreshToken, pending);
  return pending;
}

async function handler(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  const target = `${config.apiUrl}/${path.join("/")}${request.nextUrl.search}`;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value ?? null;

  // Read the body once — it may need replaying after a refresh. Methods without
  // a body give an empty buffer, which we pass as undefined.
  const rawBody =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  const forward = (token: string | null) => {
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      // Content-Type carries the multipart boundary, so it must survive intact.
      if (
        !HOP_BY_HOP.has(key.toLowerCase()) &&
        key.toLowerCase() !== "cookie"
      ) {
        headers.set(key, value);
      }
    });
    if (token) headers.set("Authorization", `Bearer ${token}`);

    return fetch(target, {
      method: request.method,
      headers,
      body: rawBody && rawBody.byteLength > 0 ? rawBody : undefined,
      cache: "no-store",
      redirect: "manual",
    });
  };

  let upstream = await forward(accessToken);
  let refreshed: RefreshResult | null = null;

  if (upstream.status === 401) {
    const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
    if (refreshToken) {
      refreshed = await refreshAccessToken(refreshToken);
      if (refreshed) {
        upstream = await forward(refreshed.accessToken);
      }
    }
  }

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) responseHeaders.set(key, value);
  });

  const response = new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });

  // Persist a refresh here rather than dropping it. This is what a Server
  // Component could not do, and why SSR previously re-refreshed on every load.
  //
  // Both cookies must be written. Refresh tokens are single-use since rotation
  // landed, so keeping the old one would leave the browser holding a token the
  // API has already revoked — the session would die at the next refresh.
  if (refreshed) {
    response.cookies.set(ACCESS_COOKIE, refreshed.accessToken, {
      ...cookieOpts,
      maxAge: SESSION_MAX_AGE,
    });
    if (refreshed.refreshToken) {
      response.cookies.set(REFRESH_COOKIE, refreshed.refreshToken, {
        ...cookieOpts,
        maxAge: SESSION_MAX_AGE,
      });
    }
  }

  return response;
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;

// Auth is per-request from cookies; nothing here may be cached or prerendered.
export const dynamic = "force-dynamic";
