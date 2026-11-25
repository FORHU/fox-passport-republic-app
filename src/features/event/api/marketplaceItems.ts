import api from "@/shared/lib/axios";
import type { Id } from "@/shared/lib/api-types";

/**
 * Every value `EventAssetTransaction.status`/`EventServiceTransaction.status`
 * can hold. `pending` is a pre-attached item — it never goes through
 * confirmation at all (Design A); only ad-hoc items ever reach
 * `pending_provider_confirmation`. See the api repo's
 * TransactionStatusSvc for the full transition table this mirrors.
 */
export type LineItemStatus =
  | "pending"
  | "pending_provider_confirmation"
  | "approved"
  | "rejected"
  | "cancelled";

export interface EventLineItem {
  id: string;
  kind: "asset" | "service" | "venue";
  name: string;
  providerId: string;
  providerName?: string;
  agreedPrice: number;
  status: LineItemStatus;
  confirmationDeadline?: string | null;
  rejectionReason?: string | null;
}

export interface EventLineItemsResult {
  items: EventLineItem[];
  /** The event's booking id — `addAdHocItem` needs this, not the event id.
   * `EventRequestRepo.findById` already includes `bookings: true`. */
  bookingId?: string;
  clientId?: string;
  /** Whether the page's id is an event this viewer can see. False for a
   * public template (or an event they have no access to), where there are
   * no booked items or payment to show. */
  isEvent?: boolean;
}

/**
 * Reuses the existing `GET /event-requests/:id` detail endpoint rather than
 * a new one — it already includes `assetTransactions`/`serviceTransactions`/
 * `venueTransactions` with the provider and item names, and Phase B's new
 * columns (`status` values, `confirmationDeadline`, `rejectionReason`) are
 * just additional scalars on rows that endpoint was already returning.
 */
export async function fetchEventLineItems(
  eventId: Id,
): Promise<EventLineItemsResult> {
  // The api now refuses this to anyone but the Event's client, its Owner, an
  // Organizer, or an admin (previously anyone signed in). This page is
  // reached by public browsing too, where that refusal is the expected
  // outcome, not a failure — so it reads the same as "nothing to show"
  // rather than surfacing an error state.
  let resp;
  try {
    resp = await api.get(`/event-requests/${eventId}`);
  } catch (err: any) {
    if (err?.response?.status === 404 || err?.response?.status === 403) {
      return { items: [], isEvent: false };
    }
    throw err;
  }
  const event = resp.data?.data;
  if (!event) return { items: [], isEvent: false };

  const assets: EventLineItem[] = (event.assetTransactions ?? []).map(
    (t: any) => ({
      id: t.id,
      kind: "asset" as const,
      name: t.asset?.name ?? "Gear",
      providerId: t.providerId,
      providerName: t.provider?.name,
      agreedPrice: Number(t.agreedPrice ?? 0),
      status: t.status,
      confirmationDeadline: t.confirmationDeadline ?? null,
      rejectionReason: t.rejectionReason ?? null,
    }),
  );
  const services: EventLineItem[] = (event.serviceTransactions ?? []).map(
    (t: any) => ({
      id: t.id,
      kind: "service" as const,
      name: t.service?.name ?? "Service",
      providerId: t.providerId,
      providerName: t.provider?.name,
      agreedPrice: Number(t.agreedPrice ?? 0),
      status: t.status,
      confirmationDeadline: t.confirmationDeadline ?? null,
      rejectionReason: t.rejectionReason ?? null,
    }),
  );
  const venues: EventLineItem[] = (event.venueTransactions ?? []).map(
    (t: any) => ({
      id: t.id,
      kind: "venue" as const,
      name: t.venue?.name ?? "Venue",
      providerId: t.providerId,
      providerName: t.provider?.name,
      agreedPrice: Number(t.agreedPrice ?? 0),
      status: t.status,
      confirmationDeadline: null,
      rejectionReason: null,
    }),
  );

  return {
    items: [...venues, ...assets, ...services],
    bookingId: event.bookings?.[0]?.id,
    clientId: event.clientId,
    isEvent: true,
  };
}

/**
 * Adds an ad-hoc marketplace asset/service to a booking, ahead of payment.
 * `Idempotency-Key` is generated client-side per attempt — a double-click
 * retries the exact same key, so the server returns the same result instead
 * of creating a second reservation. Requires the booking's own id (not the
 * event id) — see `useCheckoutStore`'s `draftBookingId`.
 */
export async function addAdHocItem(
  bookingId: Id,
  payload: { kind: "asset" | "service"; itemId: string; quantity?: number },
): Promise<EventLineItem> {
  const idempotencyKey =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;

  const resp = await api.post(`/bookings/${bookingId}/items`, payload, {
    headers: { "Idempotency-Key": idempotencyKey },
  });
  const t = resp.data?.data;
  return {
    id: t.id,
    kind: payload.kind,
    name: t.asset?.name ?? t.service?.name ?? "Item",
    providerId: t.providerId,
    agreedPrice: Number(t.agreedPrice ?? 0),
    status: t.status,
    confirmationDeadline: t.confirmationDeadline ?? null,
    rejectionReason: t.rejectionReason ?? null,
  };
}

/** Why a Supplier declines a booked event: they have another booking then, or not. */
export type DeclineCause = "busy" | "other";

/**
 * The single endpoint every non-add marketplace-item transition goes
 * through — confirm/reject (provider-only), decline a booked event
 * (provider-only, until it is paid; ADR 0010) and cancel
 * (booking-owner-only) all route through TransactionStatusSvc server-side,
 * which authorizes each action against who's actually calling, not which UI
 * button was clicked.
 */
export async function reviewLineItem(
  transactionId: string,
  type: "asset" | "service" | "venue",
  action: "confirm" | "reject" | "cancel" | "decline",
  cause?: DeclineCause,
): Promise<EventLineItem> {
  const resp = await api.patch(`/event-transactions/${transactionId}/review`, {
    type,
    action,
    ...(action === "decline" && cause ? { cause } : {}),
  });
  return resp.data?.updated;
}

// ── Browsing for something to add ────────────────────────────────────────
// A separate, id-preserving fetch rather than reusing
// `features/search/api/search.ts`'s `fetchGearFoxers`/`fetchServiceFoxers` —
// those intentionally drop the raw asset/service id (`itemsToRows` maps to
// a display-only row), which is exactly the field `addAdHocItem` needs.

export interface BrowsableItem {
  id: string;
  name: string;
  category: string;
  price: number;
  billingRate: string;
  ownerName?: string;
  image?: string;
}

function toBrowsableItems(items: any[]): BrowsableItem[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    price: Number(item.price ?? 0),
    billingRate: item.billingRate,
    ownerName: item.owner?.name,
    image: item.images?.[0]?.url,
  }));
}

export async function browseAddableAssets(params?: {
  city?: string;
  category?: string;
}): Promise<BrowsableItem[]> {
  const resp = await api.get("/asset/browse", { params });
  return toBrowsableItems(resp.data?.data ?? []);
}

export async function browseAddableServices(params?: {
  city?: string;
  category?: string;
}): Promise<BrowsableItem[]> {
  const resp = await api.get("/service/browse", { params });
  return toBrowsableItems(resp.data?.data ?? []);
}

// ── Provider-facing dashboard ────────────────────────────────────────────

export interface ProviderLineItem {
  id: string;
  status: LineItemStatus;
  agreedPrice: number;
  confirmationDeadline?: string | null;
  /** `supplier_declined` / `supplier_declined_busy` once the Supplier declined. */
  rejectionReason?: string | null;
  /** The citizen's booking; `pending` until it is paid. */
  booking?: { status: string } | null;
  event: { name: string; startAt: string; client?: { name: string } };
  asset?: { name: string; images?: { url: string }[] };
  service?: { name: string; images?: { url: string }[] };
  /** A Mayor's venue row. */
  venue?: { name: string; images?: { url: string }[] };
}

/**
 * Whether a Supplier can still decline a booked line: it is booked
 * (`pending` or `approved`) and the citizen hasn't paid. After payment only
 * the cancellation policy applies (ADR 0010 decision 1).
 */
export const canDeclineBooked = (item: ProviderLineItem): boolean =>
  (item.status === "pending" || item.status === "approved") &&
  item.booking?.status === "pending";

/** Booked, but paid: declining is no longer offered. */
export const isPaidBooked = (item: ProviderLineItem): boolean =>
  (item.status === "pending" || item.status === "approved") &&
  !!item.booking &&
  item.booking.status !== "pending";

export interface ProviderDashboard {
  assets: ProviderLineItem[];
  services: ProviderLineItem[];
  venues: ProviderLineItem[];
  summary: { totalPending: number; totalApproved: number };
}

export async function fetchProviderMarketplaceItems(): Promise<ProviderDashboard> {
  const resp = await api.get("/event-transactions/provider");
  return (
    resp.data ?? {
      assets: [],
      services: [],
      venues: [],
      summary: { totalPending: 0, totalApproved: 0 },
    }
  );
}
