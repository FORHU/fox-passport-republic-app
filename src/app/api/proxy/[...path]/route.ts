import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { config } from "@/shared/lib/config";
import { SESSION_COOKIES } from "@/shared/auth/session-cookies";

/**
 * Authenticated pass-through to the backend API.
 *
 * The session is Better Auth's, held in an httpOnly cookie the browser's
 * JavaScript cannot read. This route reads it server-side and sends it as
 * `Authorization: Bearer` (the API's `bearer` plugin), so the token never
 * reaches client code. There is nothing to refresh: a Better Auth session
 * renews itself while it is used, and a 401 means it is over.
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

async function handler(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  const target = `${config.apiUrl}/${path.join("/")}${request.nextUrl.search}`;

  const cookieStore = await cookies();
  const token =
    SESSION_COOKIES.map((name) => cookieStore.get(name)?.value).find(Boolean) ??
    null;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    // Content-Type carries the multipart boundary, so it must survive intact.
    if (!HOP_BY_HOP.has(key.toLowerCase()) && key.toLowerCase() !== "cookie") {
      headers.set(key, value);
    }
  });
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body: body && body.byteLength > 0 ? body : undefined,
      cache: "no-store",
      redirect: "manual",
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn(`[proxy] Upstream unreachable for ${target}:`, errorMsg);
    return NextResponse.json(
      {
        success: false,
        message:
          "Backend API service is currently unreachable. Please ensure the API is running.",
      },
      { status: 503 },
    );
  }

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const name = key.toLowerCase();
    // `set-cookie` is handled below. `forEach` yields it as a single
    // comma-joined string when the response carries more than one, and
    // `Headers.set` would write that back as one malformed header.
    if (name !== "set-cookie" && !HOP_BY_HOP.has(name)) {
      responseHeaders.set(key, value);
    }
  });
  // The one accessor that keeps them separate; append, never set.
  for (const cookie of upstream.headers.getSetCookie()) {
    responseHeaders.append("set-cookie", cookie);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;

// Auth is per-request from cookies; nothing here may be cached or prerendered.
export const dynamic = "force-dynamic";
