# Central Payment: frontend implementation plan

**Status:** Built and reviewed, 13 Sep — see "Built and reviewed" below for exactly what shipped, what the review found and fixed, and the one deliberately-deferred piece.
**Scope:** `event`, `partnership` features, plus new checkout API clients
**Prepared:** 2026-09-13
**Depends on:** `fox-passport-republic-api`'s Central Payment backend getting an HTTP surface — landed the same day, commit `09e893e` (`fox-passport-republic-api`).

## Built and reviewed — 13 Sep

All of the implementation order below shipped except item 5's accepted-transactions
panel (see "Deliberately not done" below). Reviewed against this plan's own
contracts and testing checklist; two real bugs were found and fixed, not just
theoretical risks the checklist happened to name in advance.

**Found and fixed — the exact "redirect race" this plan's own testing
checklist warned about, and it was real:**

- `useInvoiceStatusPoll`'s polling condition, and `CentralPaymentStatusClient`'s
  "Confirming Payment..." branch, both checked `status === "processing"`.
  **Nothing in the API ever sets that value** — the real pre-webhook state is
  `"pending"` (`InvoiceSvc.getInvoiceStatus`'s `paymentStatus` falls back to
  `invoice.status`, which starts and stays `"pending"` until the webhook lands).
  So the success page would load once immediately after the Stripe redirect,
  read `"pending"`, match neither the paid/failed branches nor the
  (unreachable) processing branch, and fall into a raw `Status: pending` line
  with **no further polling** — exactly "shows a false state instead of
  confirming", the one thing the plan said was most likely to be skipped.
  Fixed: both now key off `paymentStatus` (not `status` — the two can
  legitimately disagree, since a failed attempt leaves the invoice `"pending"`
  for retry while `paymentStatus` reports the attempt's own `"failed"`) and
  treat anything non-terminal, not just a hardcoded `"processing"`, as "still
  confirming".
- Same fix surfaced a second gap: `"refunded"`/`"partially_refunded"` weren't
  handled as terminal at all and would have fallen into the same
  "still confirming" bucket forever. Now their own branch.

**Found and fixed — a viewer-scoping gap in `ProposalActions.tsx`:** the "Pay
Now" button was gated only on `proposal.payment?.required`, which is a
proposal-level fact, not a viewer-scoped one — the *organizer* who just
accepted a sponsorship would see the same "Pay Now" button as the partner who
actually owes the money. Not a security hole (`POST .../checkout` already
403s anyone but `proposal.partnerId`, per the api's Step 1 review), but
confusing UI. Fixed: gated on `proposal.partnerId === currentUser.id` too.

**Deliberately not done — item 5's accepted-transactions panel.** `EventPaymentPanel.tsx`
shows the pricing summary (subtotal/discount/fee/total) and the Pay Now
action, but not the per-vendor breakdown (which venue, which gear, which
service the citizen is actually paying for) this plan called "the bigger of
the two frontend pieces" and explicitly said to build *before* the Pay
button. A citizen sees a total with no line items behind it. Not fixed here —
it's new UI work, not a bug in what exists, and out of scope for a review
pass.

## Why this exists

Backend audit (12-13 Sep) found the whole Central Payment system — Invoice, Checkout, Payment, Payout, Voucher, PricingEngine, plus bidding and partnership, all landed and tested — has **zero frontend integration**. Grepped this app for `createEventCheckout`/`createSponsorshipCheckout`/`/v1/invoices`/`/v1/checkouts`: nothing.

## The one rule everything else follows

**The frontend is a thin integration layer, not a second payment engine.**

Frontend owns: displaying pricing/state, initiating checkout, redirecting to Stripe, showing payment state, success/cancel pages.
Backend owns: pricing, voucher validation, platform fees, invoices, checkout sessions, payment processing, webhooks, payment status, allocation, payout, refunds.

**The frontend must never calculate or trust its own financial totals, and must never infer payment/redemption state from a Stripe redirect alone** — a redirect only means the browser came back, not that the webhook (the actual authority) has finished. See "Success page" below.

## Two entry points, one shared pattern

Both flows: user clicks Pay → API creates an Invoice + Checkout → returns a Stripe-hosted URL → browser navigates there → Stripe redirects back to a success/cancel page → the page confirms against the backend (polling briefly if needed, since the webhook may not have landed yet).

```
Event / Partnership UI
        ↓
Frontend API Client
        ↓
Backend HTTP Controller
        ↓
Pricing Engine → Invoice → Checkout → Stripe Hosted Checkout
        ↓
Stripe Webhook → Payment = paid → Allocation → Payout
```

**Do not reuse `CheckoutClient.tsx` / `ItemCheckoutClient.tsx` / `VenueCheckoutClient.tsx`.** Those embed Stripe Elements in-page (PaymentIntent-based) — a different integration than the new backend's hosted Checkout Sessions. Leave that flow alone; it still serves direct item/venue bookings. The new flow is simpler: POST, get a `url`, navigate.

## Backend contracts this plan requires (decided here, must be honored by the api-repo plan)

These aren't open questions anymore — pin them down when writing the controllers tomorrow:

1. **`GET /v1/invoices/:invoiceId`** returns enough for the frontend to render state without interpreting raw payment records itself:
   ```json
   { "invoiceId": "...", "status": "paid", "paymentStatus": "paid" }
   ```
   `status`/`paymentStatus` values: `pending | processing | paid | failed | cancelled | refunded | partially_refunded`. If an invoice can have multiple payment attempts, **the backend resolves the effective state** — the frontend never reduces a list of payments itself.

2. **A partnership proposal's response includes a computed `payment` sub-object**, not just `status`:
   ```json
   {
     "status": "accepted",
     "partnershipType": "sponsorship",
     "payment": { "required": true, "invoiceId": "invoice-id", "status": "pending" }
   }
   ```
   This replaces the two options my earlier draft left open (embed vs. second call) — embed it. `payment.required` is `false`/absent for non-sponsorship types (investment, resource_contribution, business_partnership) unless the backend later creates an explicit payable transaction for them.

3. **`POST /v1/events/:eventId/checkout`** response:
   ```json
   { "invoiceId": "...", "checkoutId": "...", "url": "https://checkout.stripe.com/...", "status": "active" }
   ```
   Exact shape follows whatever the controller actually returns — verify against the real response before writing the client, don't assume.
   **Must handle retry gracefully, not by erroring**: `InvoiceSvc.createInvoice`'s existing "prevent double invoicing" check throws if an active invoice already exists for a sourceId — correct for stopping a genuine duplicate, but wrong UX for a double-click/refresh/lost-response retry, which would surface as a hard error instead of just handing back the same checkout. `createEventCheckout`/`createSponsorshipCheckout` should check for an existing unpaid invoice for this event/proposal first and reuse it (create a fresh `Checkout` row against it if the old one expired) rather than letting the throw bubble up. Backend-side fix, but the frontend plan below assumes this endpoint is safe to call again after a failed/uncertain first attempt.

4. **`GET /v1/events/:eventId/payment-summary`** — a read-only preview, separate from #3. The event payment panel needs to *show* subtotal/discount/fee/total before the user commits to Pay Now, and calling the checkout-creation endpoint just to preview pricing would create an Invoice prematurely (and trip the double-invoicing guard on a second real attempt). This one only reads:
   ```json
   { "eventId": "...", "currency": "PHP", "subtotalAmount": 55000, "discountAmount": 0, "platformFeeAmount": 3850, "grossAmount": 58850 }
   ```

## 1. Event side — the bigger piece

`EventDetailView.tsx` currently shows **no vendor transactions at all** (zero matches for `accepted|transaction|Transaction` in `src/features/event/`). Build the panel, not just a button:

```
Event
 ├── Event Information
 ├── Venue / Accepted Gear / Accepted Talent   (only backend-authorized transactions — no manual selection)
 └── Payment
       ├── Subtotal / Discount / Platform Fee / Total   (all from the backend response, never computed client-side)
       └── Pay Now (disabled while the mutation is in flight — the backend's own duplicate-request guard is the real protection, this just stops an accidental double-click)
```

New section in the left column (near `EventVenueOverview`, after line 333, or a new `EventBookingSidebar` section), matching the file's `glass-panel`/`rounded-[2rem]`/`material-symbols-outlined` conventions. Loads the payment-summary endpoint (contract #4) on mount/panel-open to show live numbers before Pay Now is ever clicked.

- New API client: `src/features/event/api/checkout.ts` (feature-owned — see the Shared Kernel fix in api-repo commit `6b289d8`).
- New hook: `src/features/event/hooks/useEventCheckout.ts`.

## 2. Partnership side

`ProposalActions.tsx` is the right home — same `flex gap-2` row, same `disabled={isLoading}` pattern as Accept/Reject/Withdraw. Driven entirely by the `payment` sub-object from contract #2 above, not by inferring from `status` alone:

```
proposal.status === 'accepted'
  && proposal.partnershipType === 'sponsorship'
  && proposal.payment.required
  && proposal.payment.status !== 'paid'
      ↓
  show "Pay Sponsorship"

proposal.payment.status === 'paid'
      ↓
  show "Paid" (no button)
```

Shown only on the partner's own view — the *other* party (event organizer/venue owner) is who calls `accept`, so the partner is who still owes payment.

- New API client: `src/features/partnership/api/checkout.ts` (separate file from the existing `partnerships.ts` — checkout is a distinct concern).
- New hook: `src/features/partnership/hooks/usePartnershipCheckout.ts`.
- `resource_contribution`/`business_partnership`/`investment`: no payment button unless/until the backend explicitly marks `payment.required`. Investment stays out of this pass entirely (per the product doc: separate financial/legal model).

## Success page — must confirm, never assume

A Stripe redirect back to `success_url` does not mean payment is confirmed — the webhook might still be in flight. The page must ask the backend, not trust the URL it arrived on:

```
Stripe → success_url (/checkout/success?invoiceId=...)
       → GET /v1/invoices/:invoiceId
       → status === "paid"?  → "Payment Confirmed"
       → status === "processing"? → "Confirming your payment…" + poll briefly
       → status === "failed"/"cancelled"? → show that state, no false positive
```

**Bounded polling, not indefinite**: immediate `GET` on load, then every 1-2s while `processing`, stop after ~10-15s and show "Payment is still being confirmed" rather than spinning forever. The webhook is still the real authority — this is just how long the page waits before telling the user to stop watching it.

Decide whether to generalize the existing `src/app/checkout/` pages to read `invoiceId` and do this, or build a small dedicated pair — check what the existing pages currently assume before choosing. `success_url`/`cancel_url` are already built server-side as `${FRONTEND_URL}/checkout/success?invoiceId=...` / `.../checkout/cancel?invoiceId=...` (`checkout.service.ts`).

**Cancel page**: a cancelled/abandoned checkout must not have redeemed a voucher — redemption only happens backend-side on confirmed payment (already true in `webhook.service.ts`'s `handlePaymentSuccess`; nothing for the frontend to enforce here beyond not claiming success).

## Vouchers

Event checkout may optionally send `{ "voucherCode": "FOX2026" }`. The frontend **only collects and submits the code** — existence, active/expired, usage limits, category restrictions, discount calculation, all backend. Nothing to validate client-side beyond maybe a non-empty check before submit.

## Conventions confirmed from the existing codebase (not guesses — verified 13 Sep)

- **Mutation hook**: copy `usePartnerships.ts`'s shape — `useMutation({ mutationFn, onSuccess, onError: (error: any) => toast.error(error?.response?.data?.message || "fallback") })`. On success, `window.location.href = data.url` (must be `window.location.href`, not `router.push` — Stripe's page is off-origin).
- **Loading state**: reuse the spinner block used identically in all three old checkout clients (`<span className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />`), copy changed to "Redirecting to secure checkout…"
- **Error state**: reuse the red `bg-red-500/10 border-red-500/30` + `material-symbols-outlined error` box from `CheckoutClient.tsx:253-291`. Show the backend message when it's safe to (`error?.response?.data?.message`), never raw Stripe/provider internals.
- **No `any`** on checkout response types — write real interfaces matching contracts #1-4 above.
- **One shared `PaymentStatus` type**, not duplicated between the event and partnership code:
  ```ts
  export type PaymentStatus = "pending" | "processing" | "paid" | "failed" | "cancelled" | "refunded" | "partially_refunded";
  ```
  A plain type with no feature-specific dependency is fine in `src/shared/` (the boundary rule that bit `shared/api/partnerships.ts` yesterday was about `shared/` importing a *feature's* type — this is the reverse, a shared primitive both features import, which is exactly what `shared/` is for).
- **`src/shared/lib/axios.ts`**: no manual auth header — the Next.js proxy handles it server-side from an httpOnly cookie. Relative paths only.

## Terminology — do not conflate these

- `paid` — the financial state of an Invoice/Payment. This is what checkout UI shows.
- `completed` — the business/lifecycle state of the underlying transaction (an `EventAssetTransaction`/booking reaching `completed`, e.g. after check-in). A separate axis, separate enum, never a substitute for `paid` in payment UI.

## Implementation order

```
1. [x] Finalize backend HTTP contracts (the 4 above) — api commit 09e893e
2. [x] GET /v1/invoices/:id
3. [x] GET /v1/events/:eventId/payment-summary
4. [x] POST /v1/events/:eventId/checkout (graceful retry — api's advisory-lock fix, see that repo's Step 1 review)
5. [ ] Event frontend: payment summary + Pay Now done; accepted-transactions panel NOT built — see "Deliberately not done" above
6. [x] Generalized checkout success/cancel pages (CheckoutSuccessRouter/CheckoutCancelRouter branch on ?invoiceId)
7. [x] POST sponsorship checkout endpoint
8. [x] Partnership frontend: Pay Sponsorship action (viewer-scoping bug found + fixed in review)
9. [x] Voucher code input on event checkout (not built for sponsorship — was never in scope, see "Vouchers" above)
10. [x] Integration tests (both repos) — 26 new frontend tests, 29 new api tests
11. [ ] Manual Stripe-test-mode pass, staging verification — not run; no staging environment exists yet
```

## Testing checklist

**Event**: accepted Venue/Gear/Talent displayed correctly — **not covered, see above, no such list exists yet**; total matches backend ✓; Pay Now → real checkout URL ✓; button disabled during request ✓; voucher code submit (valid + invalid) ✓; paid/failed/cancelled states render correctly ✓ (refunded/partially_refunded added during review — they weren't handled at all before).

**Sponsorship**: payment action shows only for accepted sponsorships ✓; not shown for other partnership types ✓; not shown once already paid ✓; not shown to the non-partner party — **found broken in review, fixed**; checkout redirects correctly ✓; state updates after payment ✓.

**Redirect race** (the one most likely to be skipped and cause a real bug): pay successfully → browser redirects → **webhook hasn't finished yet** → success page must show "confirming", not a false "paid". **This was skipped, and it did cause a real bug** — see "Built and reviewed" above. Fixed and now covered by `CentralPaymentStatusClient.test.tsx`'s "falls through to the confirming spinner for pending" case.

**Voucher redemption timing**: abandoned checkout → not redeemed. Failed payment → not redeemed. Successful payment → redeemed exactly once. Duplicate webhook delivery → still redeemed exactly once (this one's actually already covered — `WebhookSvc.processEventWithIdempotency` + the `voucherRedemption` unique-per-invoice check in `handlePaymentSuccess` — but worth a frontend-triggered end-to-end check too).

## Out of scope here

- The backend HTTP layer itself (see the api-repo plan file).
- `PartnershipOpportunity` — real next step after this, but a distinct feature (new model, discovery UI).
- Any redesign of the old PaymentIntent/Stripe-Elements checkout flow — it stays as-is for the flows it already serves.
