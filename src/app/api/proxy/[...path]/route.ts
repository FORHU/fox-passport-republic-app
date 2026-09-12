import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { config } from "@/shared/lib/config";
import { isPreSessionAuthPath } from "@/shared/auth/public-endpoints";

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

interface RefreshResult {
  accessToken: string;
  /** Rotation makes refresh tokens single-use, so this is always a new one. */
  refreshToken: string | null;
  /**
   * The API's own `Set-Cookie` headers from the refresh, passed straight
   * through to the browser.
   *
   * This route used to compose its own cookies here, with a `SESSION_MAX_AGE`
   * that had to be kept equal by hand to a value in the API's environment.
   * Relaying what the API sent means the lifetime, flags and names are decided
   * in exactly one place and cannot drift.
   */
  setCookies: string[];
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
      setCookies: res.headers.getSetCookie(),
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

  /**
   * An explicit refresh asked for by the browser - "sync my account", after a
   * role changes - rather than one this route decided to do on a 401.
   *
   * The caller cannot supply the token: it is httpOnly, which is the entire
   * point. This route is the only place that holds it, so it fills the body in.
   * Without this the client would need a readable copy of the refresh token,
   * which is what the httpOnly cookies exist to prevent.
   */
  const isExplicitRefresh = path.join("/") === "auth/refresh-token";
  let injectedBody: string | null = null;

  if (isExplicitRefresh) {
    const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "Invalid refresh token" },
        { status: 401 },
      );
    }
    injectedBody = JSON.stringify({ refreshToken });
  }

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
    if (injectedBody) headers.set("Content-Type", "application/json");

    return fetch(target, {
      method: request.method,
      headers,
      body:
        injectedBody ??
        (rawBody && rawBody.byteLength > 0 ? rawBody : undefined),
      cache: "no-store",
      redirect: "manual",
    });
  };

  let upstream = await forward(accessToken);
  let refreshed: RefreshResult | null = null;

  // A 401 from the pre-session endpoints is "those credentials are wrong", not
  // "this access token is stale". Refreshing on one would spend a single-use
  // refresh token to no purpose and then replay the request — submitting a
  // failed sign-in a second time, which the API's per-account rate limit counts
  // as two attempts for one click.
  if (upstream.status === 401 && !isPreSessionAuthPath(path.join("/"))) {
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
    const name = key.toLowerCase();
    // `set-cookie` is handled below. `forEach` yields it as a single
    // comma-joined string when the response carries more than one, and
    // `Headers.set` would then write that back as one malformed header - a
    // login response setting three cookies would arrive as none the browser
    // could parse.
    if (name !== "set-cookie" && !HOP_BY_HOP.has(name)) {
      responseHeaders.set(key, value);
    }
  });

  // The one accessor that keeps them separate. Each value is appended, never
  // set, so the browser receives one Set-Cookie header per cookie.
  for (const cookie of upstream.headers.getSetCookie()) {
    responseHeaders.append("set-cookie", cookie);
  }

  const response = new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });

  // Persist a refresh here rather than dropping it. This is what a Server
  // Component could not do, and why SSR previously re-refreshed on every load.
  //
  // The refresh happened over an internal fetch, so the API's Set-Cookie landed
  // on this server rather than on the browser. Forwarding those headers is what
  // carries the rotated pair the rest of the way - dropping them would leave the
  // browser holding a token the API has already revoked, and the session would
  // die at the next refresh.
  if (refreshed) {
    for (const cookie of refreshed.setCookies) {
      response.headers.append("set-cookie", cookie);
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
