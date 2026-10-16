# Verification Checklist

**Started:** 16 October 2026  
**Source:** the review of [`BUSINESS-STRATEGY-MASTER.md`](./BUSINESS-STRATEGY-MASTER.md), [`foxpassport-feature-audit.md`](./foxpassport-feature-audit.md) and [`mobile-ux-consolidation-strategy.md`](./mobile-ux-consolidation-strategy.md) against the code, plus a quality review of Redis (API) and TanStack Query (web).

Paths below are relative to each repo: **API** = `fox-passport-republic-api`, **Web** = `fox-passport-republic-app`. Line numbers are as of 16 Oct 2026.

**Status:** ❌ open · 🟡 in progress · ✅ done

---

## Summary

| # | Item | Type | Status |
|---|---|---|---|
| 1 | Lock down the payment routes | 🚨 Security fix | ❌ |
| 2 | Pick the real fee system; decide on the 0% Passport perk | Team decision | ❌ |
| 3 | Redis in production: TLS support and outage visibility | Fix + decision | ❌ |
| 4 | Merge the duplicate venue cache keys | Bug fix | ❌ |
| 5 | Confirm the dispute flow end to end | Check | ❌ |
| 6 | Decide whether a booking can be reviewed before it's attended | Team decision | ❌ |
| 7 | Decide whether a wrong login code should delete the right one | UX decision | ❌ |
| 8 | Doc fixes for items 2, 5 and 6, plus small corrections | Docs | ❌ |
| 9 | Check the strategy doc's "Current State" notes section by section | Check | ❌ |
| 10 | Run the `VERIFY.md` browser pass | Manual testing | ❌ |

---

## 1. 🚨 Lock down the payment routes

Any logged-in user can tamper with any payment. The routes check `authenticate` only; no handler checks that the payment or booking belongs to the caller.

| Route | What any logged-in user can do | Evidence |
|---|---|---|
| `PUT /v1/payments/:id` | Set anyone's payment to `refunded`, `failed`, `cancelled` or `pending` | API `src/modules/payment/payment.routes.ts:29`, `payment.controller.ts` `updatePayment` |
| `POST /v1/payments/create` | Create a payment record for any booking, with any amount and status | API `payment.routes.ts:28`, `payment.controller.ts` `createPayment` |
| `GET /v1/payments/booking/:bookingId`, `/booking/:bookingId/balance`, `/transaction/:transactionId` | Read any booking's payments and balance | API `payment.routes.ts:17–27` |

Setting `paid` is blocked only by accident: the validator allows `"completed"`, which isn't a `PaymentStatus` value (`prisma/schema/common.prisma:47`).

The web app calls only `/payments/create-intent` (Web `src/features/booking/api/bookings.ts:111`), so restricting the others shouldn't break it.

**Fix:** require an admin permission on `create` and `PUT /:id` (or remove them). Add ownership checks on the reads, the same way bookings already do (`getBookingForViewer`, API `src/modules/booking/booking.service.ts:899`). Add tests.

## 2. Pick the real fee system; decide on the 0% Passport perk

- The strategy doc (§1a item 4, §15) says the fee comes from `EventTemplate.platformFeePct`. **No API code reads that column.**
- Live fees come from two systems:
  - the `PLATFORM_FEE_PERCENT` env var (default 5; API `src/config.ts:134`), used by bookings, asset bookings and edit requests;
  - admin `PlatformFeeConfig` rules via `PricingSvc.resolvePricingRule` (API `src/modules/pricing/pricing.service.ts:45`), used by event checkout, invoices and part of asset booking.
  
  A comment calls the first "a separate, older system" (API `src/modules/asset-booking/asset-booking.service.ts:75`).
- The doc says "there is no current fee-free mode." There is: the Passport level-3 perks `lower_fees` and `service_lower_fees` set a provider's fee to **0%** (API `src/modules/passport/passport.service.ts:32`, `asset-booking.service.ts:137`, `src/modules/booking-edit-request/booking-edit-request.service.ts:77`).

**Decide:** which fee system is the one to keep, and whether the 0% perk is intended. Then update §1a item 4 and §15.

## 3. Redis in production: TLS support and outage visibility

- **Redis isn't really optional.** Caching and rate limiting degrade gracefully without it, but these stop working:
  - email codes and password reset (API `src/utils/otp.utils.ts:40`)
  - Google and Facebook login (`src/modules/auth/google-auth.service.ts`, `facebook-auth.service.ts`)
  - realtime socket tickets (`src/modules/auth/socket-ticket.service.ts:28`)
- **No TLS support.** The client takes only host, port and password (API `src/utils/redis.util.ts`). Most managed Redis services need TLS or a `rediss://` URL.
- When Redis is down, the API logs one warning and keeps running. Nothing alerts anyone.

**Fix:** add `REDIS_URL` or `REDIS_TLS` support. **Decide:** how the team will find out when production Redis is unavailable (a health check, an alert, or failing startup in production).

## 4. Merge the duplicate venue cache keys

The same data is cached under two key spellings:

| Hook | Keys |
|---|---|
| Web `src/features/dashboard/hooks/useHostDashboard.ts:37,50` | `["host-venues", userId]`, `["host-venue-stats", userId]` |
| Web `src/features/venue/hooks/useHostVenues.ts:66,73` | `["hostVenues", hostId]`, `["hostVenueStats"]` (no user id) |

The realtime "venues changed" event refreshes only the first spelling (Web `src/shared/lib/realtime.ts:79`), so the venue management screens don't update live.

**Fix:** use one key per piece of data, with the user id in it. A shared key factory would stop this recurring; only 2 of 91 query files use one today.

## 5. Confirm the dispute flow end to end

The docs (strategy §26 and §1b B item 7, audit §2 H) say there's no dispute workflow. There is a partial one:

- users can dispute asset and service bookings (API `src/modules/asset-booking/asset-booking.service.ts:524`)
- `disputed` is a booking status (API `prisma/schema/booking.prisma:202`)
- admins have `/admin/asset-bookings/disputes`, `/admin/service-bookings/disputes` and `/admin/disputes`, behind `disputes:resolve` (API `src/modules/admin/admin.routes.ts:168–198`)
- the web admin refunds screen handles disputed refunds (Web `src/app/admin/refunds/_components/AdminRefundsClient.tsx`)

**Check:** walk through raise → admin review → resolve for an asset booking and a service booking. Note what's missing (for example, event bookings).

## 6. Decide whether a booking can be reviewed before it's attended

The docs say reviews require a completed booking. The code blocks only `pending` and `cancelled` (API `src/modules/review/review.service.ts:88`), so a `confirmed` booking can be reviewed before the event happens.

**Decide:** doc error or bug. If it's a bug, allow only `completed`.

## 7. Decide whether a wrong login code should delete the right one

`verifyOTP` uses `getDel`, so any attempt, right or wrong, deletes the stored code (API `src/utils/otp.utils.ts:59`). One mistyped digit means the user has to request a new code.

**Decide:** keep it (strictest), or delete only on success and rely on the per-account rate limiter to stop guessing.

## 8. Doc fixes

- Items 2, 5 and 6, once decided.
- `BUSINESS-STRATEGY-MASTER.md` refers to `DYNAMIC-EVENTS-PRODUCT-MASTER.md`, `DYNAMIC-EVENTS-PROJECT-MASTER.md` and `DYNAMIC-EVENTS-PLAN.md` by bare name. They're in `docs/`, one level up; make them links to `../`.
- `BUSINESS-STRATEGY-MASTER.md` §1a item 1 describes `performerFoxer` as planned. It's now a built RoleType (API `prisma/schema/common.prisma:32`).
- API `src/utils/cache.util.ts` (around line 87): the comment still describes the old reconnect behaviour.

## 9. Check the strategy doc's "Current State" notes

Go through each note against the code, the same way as items 2, 5 and 6: §12, §15, §18, §19, §20, §24, §26.

## 10. Run the `VERIFY.md` browser pass

Web `docs/VERIFY.md` is a manual browser runbook for realtime: socket connection, single-use tickets, live admin queues, and reconnection. There's no record of a full run.

---

## Already verified (no action needed)

- "Talent Foxer" is the live label for `serviceFoxer` (Web `src/shared/constants/roles.ts:72`).
- Host Markup fields exist (API `prisma/schema/event.prisma:17`, `booking.prisma:9`).
- Facebook sign-in exists (API `src/modules/auth/facebook-auth.service.ts`).
- The feed has polls and media tags (`Poll`, `PollOption`, `PollVote`, `PostMediaTag` models).
- There's no `EventRegistration` anywhere in the API.
- Redis cache keys are scoped correctly: per-user data includes the user id, and filtered lists hash the full filter.
- Booking reads check access after the cached read (API `booking.service.ts:899`).
- The web query cache is cleared on logout (Web `src/shared/auth/useLogout.ts:27`), session expiry reloads the page, and nothing persists the cache to storage.
- All 23 web files with mutations refresh or update the cache afterwards.
