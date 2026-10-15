/**
 * The api's `InvoiceStatus` and `PaymentStatus` Prisma enums (money.prisma,
 * common.prisma) both carry exactly this set of values — but they are two
 * different fields answering two different questions, and code in this app
 * must not conflate them:
 *
 * - `InvoiceStatusResponse.status` — the *invoice's* lifecycle. It stays
 *   `"pending"` even after a failed payment attempt, deliberately, so the
 *   payer can retry against the same invoice.
 * - `InvoiceStatusResponse.paymentStatus` — the *most recent payment
 *   attempt's* own outcome. This is what actually reports `"failed"` — the
 *   invoice's own `status` never will, for a still-retryable invoice.
 *
 * Anything deciding "is this thing still waiting, or is it done" — polling,
 * rendering a final state, gating a Pay button — must read `paymentStatus`.
 * `status` alone cannot tell a failed-but-retryable invoice apart from one
 * nobody has attempted to pay yet; both read `"pending"`.
 */
export type PaymentStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded"
  | "partially_refunded";

export interface InvoiceStatusResponse {
  invoiceId: string;
  /** Invoice lifecycle — see the module doc comment above. Not what decides
   *  whether a payment succeeded or failed; read `paymentStatus` for that. */
  status: PaymentStatus;
  /** The latest payment attempt's own outcome — see the module doc comment
   *  above. This is the field to poll/branch on. */
  paymentStatus: PaymentStatus;
}

/**
 * The Checkout *session's* own status — a third, distinct enum from
 * `PaymentStatus`/`InvoiceStatus` above (the api's `CheckoutStatus`
 * Prisma enum). `CheckoutResponse.status` is always `"active"` on a
 * freshly-created or reused session; it is not a payment outcome.
 */
export type CheckoutStatus = "active" | "completed" | "expired" | "failed";

export interface CheckoutResponse {
  invoiceId: string;
  checkoutId: string;
  url: string;
  status: CheckoutStatus;
}

/** One payable vendor line — which venue/gear/talent this payment actually
 *  covers. Purely for display; the backend's aggregate fields on
 *  `PaymentSummaryResponse` (subtotal/discount/fee/gross) remain the only
 *  source of truth for totals. `discountAmount` is that line's own
 *  discount when a Foxer-owned voucher (typed or auto-applied) matched it
 *  specifically — 0 when it didn't, even if other lines or a platform-wide
 *  code discounted the checkout overall. */
export interface PaymentLineItem {
  type: "venue" | "asset" | "service";
  name: string;
  providerName: string;
  amount: number;
  discountAmount: number;
}

export interface PaymentSummaryResponse {
  eventId: string;
  currency: string;
  items: PaymentLineItem[];
  subtotalAmount: number;
  discountAmount: number;
  platformFeeAmount: number;
  grossAmount: number;
}

/**
 * The two Phase B marketplace error shapes `POST /events/:eventId/checkout`
 * can return, in addition to the plain `{ success: false, message }` every
 * other checkout error uses. Both carry structured data beyond the message
 * string because a generic error toast can't tell the citizen which item to
 * act on — read `error.response.data` against this shape (via the `code`
 * discriminant) before falling back to the plain message.
 */
export interface ItemsAwaitingConfirmationError {
  success: false;
  message: string;
  code: "ITEMS_AWAITING_CONFIRMATION";
  blockingItemIds: string[];
}

export interface AvailabilityConflictErrorResponse {
  success: false;
  message: string;
  code: "AVAILABILITY_CONFLICT";
  kind: "asset" | "service";
  itemId: string;
}

export type CheckoutErrorResponse =
  | ItemsAwaitingConfirmationError
  | AvailabilityConflictErrorResponse
  | { success: false; message: string; code?: undefined };
