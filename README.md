# Fox Passport Republic — App

The Next.js client for Fox Passport Republic, an event-booking marketplace.
Citizens browse and book Events, Venues, Assets and Services; Foxers manage the
inventory they supply; admins approve it.

Next.js App Router + TypeScript + Tailwind. Talks to the Express API in
`../fox-passport-republic-api`, which must be running for anything past the
landing page to work.

> Domain vocabulary is in [`CONTEXT.md`](./CONTEXT.md). Engineering trackers are
> in [`docs/`](./docs/) — start at [`docs/TOMORROW.md`](./docs/TOMORROW.md) for
> what is open, [`docs/api-audit.md`](./docs/api-audit.md) for why things are the
> way they are.

---

## Running locally

```bash
pnpm install
cp .env.example .env   # then fill it in
pnpm dev               # http://localhost:6001
```

**Port 6001 is not a preference.** The API's `CORS_ORIGIN` and `FRONTEND_URL`
are pinned to it, and Stripe Connect return URLs derive from it. `pnpm dev` and
`pnpm start` both bind it explicitly.

Start the API first (`pnpm dev` in `../fox-passport-republic-api`, port 6002),
or use [its Docker setup](../fox-passport-republic-api/DOCKER_SETUP.md).

### Scripts

| Command | Does |
|---|---|
| `pnpm dev` | Next dev server on 6001 |
| `pnpm build` | Production build |
| `pnpm start` | Serve the build on 6001 |
| `pnpm test` | Vitest |
| `pnpm lint` | ESLint over `src/` |
| `pnpm format` | Prettier over `src/**/*.{ts,tsx}` |

`pnpm format` rewrites line endings on files it touches. That is expected — the
repo has a `.gitattributes` (`* text=auto eol=lf`) added without
`--renormalize`, so files normalise gradually. On a branch without it, expect a
large noise diff.

---

## Configuration

See `.env.example`. Two entries decide whether the app works at all:

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the API, including the `/api/v1` prefix |
| `ACCESS_TOKEN_SECRET` | **Server-side only.** Must be byte-identical to the API's `ACCESS_TOKEN_SECRET` — `middleware.ts` verifies access tokens the API signed. Unset, the proxy fails closed and every protected route redirects to `/` |

The rest are public client keys: `NEXT_PUBLIC_MAPBOX_TOKEN`,
`NEXT_PUBLIC_CESIUM_ION_TOKEN`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

---

## How data gets to the page

Three paths, deliberately:

1. **Server Components** call `serverFetch` (`src/shared/lib/server/data.ts`),
   reading the httpOnly cookie directly. Authenticated SSR with no flicker.
2. **Client Components** use the shared Axios client
   (`src/shared/lib/axios.ts`) with `@tanstack/react-query`.
3. **Socket.io** (`src/shared/providers/SocketProvider.tsx`) pushes
   notifications and gamification events.

### Tokens are not in `localStorage`, and that is load-bearing

The client Axios instance points at **`/api/proxy`**, not at the API. The route
handler at `src/app/api/proxy/[...path]/route.ts` reads the httpOnly `fox_token`
cookie and adds the `Authorization` header server-side.

So `axios.ts` has **no request interceptor and no token** — that is intentional,
not an omission. Three things follow:

- Tokens are unreachable from JavaScript.
- Refreshing happens in one place that can actually persist the result, so there
  is no concurrent-refresh stampede to serialise. Any "add a refresh mutex to
  `axios.ts`" suggestion is describing the old design.
- Client calls are same-origin, so they generate no CORS preflights.

`localStorage` holds `fox_user` — profile display data, no credentials.
`useAuth.ts` still calls the API directly for login, because login happens before
any cookie exists.

Route protection is enforced at the edge by `middleware.ts` (JWT verified with
`jose`) plus page-level guards. Client-side role state is a display hint, never
proof.

---

## Layout

```
src/
  app/               App Router routes, including api/proxy
  features/<name>/   components, hooks, api, store — one folder per domain area
  shared/            components, hooks, lib, providers used across features
  __tests__/         cross-cutting tests (data fetching, responsive)
middleware.ts        Edge JWT verification and route protection
```

Per-feature API calls belong in `features/<name>/api/`. That convention exists in
eight features and is being applied to the rest.

---

## Testing

```bash
pnpm test
```

Vitest + jsdom. Note what the suite does and does not cover: the data tests
assert **request counts**, and the responsive tests assert **class names**. Both
would pass if the proxy returned garbage. Anything touching the proxy, uploads,
or the 401-refresh-replay path needs a browser — see `docs/TOMORROW.md` §1.
