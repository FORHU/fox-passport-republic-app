> # ⚠️ SUPERSEDED — do not apply the fixes in section 5
>
> This is the external audit **as received** on 26 August 2026. Every claim in it
> was checked against the code the same day; the corrections are recorded in
> [`api-audit.md`](./api-audit.md) §1. It is kept as the record of what was
> received, not as guidance.
>
> **Fix 2 would reverse shipped security work.** It replaces
> `src/shared/lib/axios.ts` with a version that reads and writes `fox_token` and
> `fox_refresh_token` in `localStorage`. Tokens moved to httpOnly cookies behind
> `/api/proxy` in commit `9995312`; `axios.ts` deliberately has **no request
> interceptor and no token**, which is why it contains no refresh mutex. The
> interceptor the fix supplies also carries a bug of its own — queued retries
> never set `_retry`, so a second 401 restarts the refresh cycle per request.
>
> **Fix 1 is already done**, by a different route: a ref (`useHostVenueEdit.ts:121`)
> with honest dependencies (`:386`), not an `eslint-disable`. Its line numbers no
> longer point at the code it describes.
>
> **Other corrections:** bcrypt cost is **12**, not 10 (`api/src/utils/password.ts:18`).
> `SystemRole` is `user | admin`. The 401 refresh stampede was **wasted requests,
> not lost sessions** — refresh is idempotent (no token rotation) and the rate
> limit is 1000/15min, disabled in dev.

---

# Fox Passport Republic — Complete Engineering Audit & Code Fixes

**Generated**: August 26, 2026  
**Scope**: Full Stack (`fox-passport-republic-app` + `fox-passport-republic-api`)

---

## 1. System Architecture & Integration Map

The platform is built as a multi-tier ecosystem composed of a Next.js 14+ Frontend App and an Express / Prisma Backend API.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js Application Layer                       │
│                                                                        │
│   ┌───────────────────────────────┐  ┌───────────────────────────────┐ │
│   │    Server Components (SSR)    │  │     Client Components (CSR)   │ │
│   │   - Uses serverFetch()        │  │   - Uses Axios + React Query  │ │
│   │   - Reads httpOnly Cookies    │  │   - Reads localStorage token  │ │
│   └───────────────┬───────────────┘  └───────────────┬───────────────┘ │
└───────────────────┼──────────────────────────────────┼─────────────────┘
                    │ REST                             │ REST
                    ▼                                  ▼
         ┌──────────────────────────────────────────────────┐
         │             Express Backend API (v1)             │
         │  Routes: /venues, /service, /asset, /auth, etc.  │
         └──────────┬──────────────────────┬─────────────┬──┘
                    │                      │             │
        PostgreSQL / Prisma        Socket.io Gateway   AWS S3 (Presigned)
        (Database Operations)      (Push Notifications)(Direct Media Upload)
```

### Communication Channels:
1. **Client-Side REST**: Axios client (`src/shared/lib/axios.ts`) orchestrated with `@tanstack/react-query` for query caching, background prefetching, and state synchronization.
2. **Server-Side SSR**: Server actions and server components fetch data via `serverFetch` (`src/shared/lib/server/data.ts`) with cookies for zero-flicker authenticated rendering.
3. **Real-Time Push**: Socket.io gateway (`SocketProvider.tsx` & `socket.gateway.ts`) for real-time notifications and gamification badge alerts.
4. **Cloud Storage**: Three-step AWS S3 presigned PUT workflow (`useFileUpload.ts`).

---

## 2. Critical API & Infinite Loop Hazards

### 🔴 Bug 1: Infinite API Re-fetch Loop in `useHostVenueEdit.ts`
* **File**: `fox-passport-republic-app/src/features/venue/hooks/useHostVenueEdit.ts` (Line 369)
* **Cause**: `builder` from `useVenueBuilder()` is an unstable object reference recreated on every render. Because it is in the `useEffect` dependency array `[hostId, venueId, builder]`, every state update inside the effect (`builder.setVenueName(...)`) re-renders the component, creates a new `builder` reference, and re-triggers the `useEffect` in an **infinite loop of `GET /venues` calls**.
* **Impact**: Page hangs, high client CPU usage, and triggers API rate limiters.

### 🔴 Bug 2: Concurrent 401 Silent Refresh Stampede in `axios.ts`
* **File**: `fox-passport-republic-app/src/shared/lib/axios.ts` (Lines 24–81)
* **Cause**: When an access token expires while multiple parallel queries execute, all requests return `401 Unauthorized` at once. Without an interceptor lock, each failing request simultaneously calls `POST /auth/refresh-token`.
* **Impact**: Token invalidation race conditions trigger the error block, wiping `localStorage` and prematurely logging out active users.

### 🟡 Bug 3: Aggressive Polling Loops on Dashboards
* **Locations**:
  - `useHostData.ts` (Line 87): Polls **every 10 seconds** across 4 parallel queries (`/service`, `/asset`, `/event-templates`, `/venues`) $\rightarrow$ **24 req/min continuously**.
  - `useHostDashboard.ts` (Line 50): Polls `/venues` every 10 seconds.
  - `useAdminData.ts` (Line 84): Polls every 5 seconds.
  - `useUserDashboard.ts` (Line 86): Polls every 15–30 seconds.
* **Impact**: Unnecessary backend compute and high database connection usage when data has not changed.

### 🟡 Bug 4: Duplicate `/profile` API Requests
* **Locations**: `useSessionManager.ts` & `useProfile.ts`
* **Cause**: `useSessionManager` polls `/profile` on a 5-minute React Query interval `["me"]`, while `useProfile` independently executes an uncached `useEffect` on mount, causing duplicate network requests.

### 🟢 Bug 5: Missing Request Cancellation on Mapbox Geocoding
* **Locations**: `MapboxLocationInput.tsx` and `MapboxLocationPicker.tsx`
* **Cause**: While 400ms debouncing is present, in-flight `fetch` requests lack `AbortController` cancellation, risking out-of-order response overwrites when typing rapidly.

---

## 3. Authentication & Security Audit

| Security Domain | Status | Details |
| :--- | :---: | :--- |
| **Password Hashing** | ✅ **Strong** | Bcrypt (10 salt rounds) with automatic transparent re-hashing of legacy passwords on successful login. |
| **Role Permissions (RBAC)** | ✅ **Strong** | Strict separation between administrative `SystemRole` (`user` \| `admin`) and supply-side `RoleType` (`venueFoxer`, `eventFoxer`, etc.). Enforced by `requireRole` and `requireOwnerOrAdmin`. |
| **Edge Route Protection** | ✅ **Strong** | Next.js Edge Middleware validates JWTs via `jose` before SSR page execution. |
| **Session Experience** | ✅ **Good** | Proactive silent refresh (2 min before expiration) + user activity idle tracking with warning modals. |
| **Dual Storage Sync** | ⚠️ **Needs Fix** | Client `localStorage` and Server `cookies` can fall out of sync during client-side silent refreshes. |
| **Token Invalidation** | ⚠️ **Needs Fix** | `POST /auth/logout` is client-side only; refresh tokens are not tracked or revoked in the database. |

---

## 4. File-by-File Detailed Engineering Evaluation

### 📁 Frontend App (`fox-passport-republic-app`)

#### 1. Core & Network Layer
* `src/shared/lib/axios.ts`: Handles CSR requests and `Bearer` token injection. Needs concurrency mutex on silent refresh to prevent token race conditions.
* `src/shared/lib/server/data.ts`: Efficient SSR data fetching using `Promise.all`. Needs cookie synchronization for silent refreshes in Server Actions.
* `middleware.ts`: High-performance JWT edge verification using `jose`. Correctly enforces `/admin` role restriction and protects citizen routes.
* `src/shared/providers/SocketProvider.tsx`: Clean Socket.io lifecycle management with complete cleanup listeners on token change or unmount.

#### 2. Authentication & Session
* `src/features/auth/store/useAuthStore.ts`: Hydrates auth state from `localStorage` on initial boot and isolates tokens from profile data.
* `src/features/auth/hooks/useSessionManager.ts`: Handles proactive token refresh (2m prior to expiry), idle activity tracking, and 5m role polling.
* `src/features/user/hooks/useProfile.ts`: Fetches and updates user profile; should share the `["me"]` query cache with `useSessionManager`.

#### 3. Venue & Inventory Modules
* `src/features/venue/hooks/useHostVenueEdit.ts`: Contains **critical infinite loop** on Line 369 due to `builder` in `useEffect` dependency array.
* `src/features/venue/hooks/useVenueBuilder.ts`: Stable wizard state and S3 upload handler for venue creation.
* `src/features/venue/hooks/useVenuePage.ts`: Unified fallback data normalizer for events and venues.
* `src/features/venue/hooks/useExperienceBuilderData.ts`: Efficient parallel queries for talent, services, and gear bundles.

#### 4. Service, Asset & Event Modules
* `src/features/service/hooks/useHostServiceEdit.ts`: Properly implemented edit controller with excluded builder dependencies.
* `src/features/event/hooks/useHostEventEdit.ts`: Properly implemented event package editor.
* `src/features/service/hooks/useServicesBuilder.ts` & `src/features/asset/hooks/useInventoryBuilder.ts`: Robust multi-step creation wizards with pre-validation.

#### 5. Dashboards & Polling Hooks
* `src/features/dashboard/hooks/useHostData.ts`: 10-second polling interval across 4 parallel queries creates heavy traffic; recommended to increase to 60s.
* `src/features/dashboard/hooks/useHostDashboard.ts` & `useUserDashboard.ts`: Polls counters every 10s–30s.

#### 6. Search, Gamification & Notifications
* `src/features/search/hooks/useSearch.ts`: Solid query caching and pagination with placeholder preservation.
* `src/shared/components/ui/MapboxLocationInput.tsx` & `MapboxLocationPicker.tsx`: 400ms debounce prevents keystroke flooding; add `AbortController` for clean aborts.
* `src/features/gamification/hooks/usePassport.ts`: Well-cached queries for stamps, badges, leaderboard, and match requests.
* `src/features/notifications/hooks/useNotifications.ts`: Optimistic state updates synced with Socket.io push events.

---

### 📁 Backend API (`fox-passport-republic-api`)

#### 1. Server Core & Middleware
* `src/app.ts` & `src/server.ts`: Dynamic dev/LAN CORS origin regex, raw body parsing for Stripe webhooks, and centralized error handling.
* `src/middleware/auth.middleware.ts`: Complete JWT decoding, `TokenExpiredError` detection, RBAC (`requireRole`), and owner validation (`requireOwnerOrAdmin`).
* `src/infrastructure/socket/socket.gateway.ts`: Authenticates connections via JWT handshake and assigns private rooms per `userId`.

#### 2. Auth Controllers & Services
* `src/controllers/auth.controller.ts` & `src/services/auth.service.ts`: Bcrypt hashing with automatic re-hashing of legacy algorithms, OTP email verification, and refresh token issuance.
* `src/routes/index.ts`: Standardized `/api/v1/*` routing structure with sub-routes mounted before generic ID paths.
* `prisma/schema.prisma`: Normalized schema with matching enums (`SystemRole`, `RoleType`, `RequestStatus`) and relational cascading rules.

---

## 5. Ready-to-Apply Code Fixes

### Fix 1: Stop Infinite Loop in `useHostVenueEdit.ts`
**Target File**: `fox-passport-republic-app/src/features/venue/hooks/useHostVenueEdit.ts`

Replace lines 366–370 with:
```typescript
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hostId, venueId]);
```

---

### Fix 2: Thread-Safe Refresh Token Lock in `axios.ts`
**Target File**: `fox-passport-republic-app/src/shared/lib/axios.ts`

Replace the entire file with:
```typescript
// src/shared/lib/axios.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { config } from "@/shared/lib/config";

const api = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
});

// Request interceptor to attach auth token
api.interceptors.request.use(
  (reqConfig) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("fox_token") : null;
    if (token) {
      reqConfig.headers.Authorization = `Bearer ${token.replace(/"/g, "")}`;
    }
    return reqConfig;
  },
  (error) => Promise.reject(error),
);

// Concurrency control variables for silent refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Response interceptor with mutex lock
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // If 401 error and not already retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh-token") &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      if (isRefreshing) {
        // Queue parallel requests until token refresh finishes
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject: (err) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("fox_refresh_token");
        if (!refreshToken) throw new Error("No refresh token available");

        console.log("[Axios] Token expired, executing synchronized silent refresh...");

        const { data } = await axios.post(`${config.apiUrl}/auth/refresh-token`, {
          refreshToken: refreshToken.replace(/"/g, ""),
        });

        const { accessToken, user } = data;

        localStorage.setItem("fox_token", accessToken);
        if (user) {
          localStorage.setItem("fox_user", JSON.stringify(user));
        }

        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        console.error("[Axios] Silent refresh failed:", refreshError);

        localStorage.removeItem("fox_token");
        localStorage.removeItem("fox_refresh_token");
        localStorage.removeItem("fox_user");

        if (typeof window !== "undefined") {
          window.location.href = "/?auth=expired";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
```

---

## 6. Scorecard & Roadmap

| Subsystem | Stability | Security | Performance | Immediate Action |
| :--- | :---: | :---: | :---: | :--- |
| **Venue Edit Module** | 🔴 Critical | ✅ High | 🔴 Poor | Apply Fix 1 in `useHostVenueEdit.ts:369`. |
| **Axios Token Interceptor** | 🔴 High | ⚠️ Medium | ✅ High | Apply Fix 2 in `axios.ts`. |
| **Dashboard Polling** | ✅ Stable | ✅ High | 🟡 Medium | Increase `refetchInterval` from 10s to 60s. |
| **Authentication & RBAC** | ✅ Stable | ✅ Strong | ✅ High | Add server-side refresh token revocation table. |
| **WebSocket Push** | ✅ Stable | ✅ Strong | ✅ High | None (lifecycle cleanly managed). |
| **SSR Data Layer** | ✅ Stable | ✅ Strong | ✅ High | Synchronize refresh tokens to cookie headers. |
