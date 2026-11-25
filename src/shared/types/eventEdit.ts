/**
 * Booked-event repairs (api ADR 0010): a Supplier declining, conflicts, and the
 * Event Foxer's proposals to swap a Supplier or move the date. Shared because
 * the host side (`features/event`) and the citizen side (`features/booking`)
 * read the same API shapes. Prices arrive as decimal strings and are numbers
 * here.
 */

export type SupplierKind = "asset" | "service" | "venue";

/** Why a booked Supplier needs replacing. */
export type ConflictReason = "declined" | "date_blocked" | "unavailable";

export interface ConflictIssue {
  kind: SupplierKind;
  transactionId: string;
  supplierName: string;
  itemName: string;
  reason: ConflictReason;
  /** "busy" when a declining Supplier has another booking then. */
  cause: "busy" | null;
  pendingProposalId: string | null;
  /** After this, the citizen may cancel for a full refund. */
  replaceBy: string | null;
}

export interface NeedsAttentionEvent {
  eventId: string;
  eventName: string;
  startAt: string;
  issues: ConflictIssue[];
}

export interface BookedSupplierRow {
  kind: SupplierKind;
  transactionId: string;
  supplierName: string;
  itemName: string;
  status: string;
  reason: ConflictReason | null;
  cause: "busy" | null;
  pendingProposalId: string | null;
  replaceBy: string | null;
}

export interface PendingReschedule {
  proposalId: string;
  proposedStartAt: string;
  proposedEndAt: string;
  expiresAt: string;
}

export interface BookedEventDetail {
  eventId: string;
  eventName: string;
  startAt: string;
  endAt: string;
  eventStatus: string;
  suppliers: BookedSupplierRow[];
  /** The unpaid booking the host may still decline (ADR 0011). */
  declinableBookingId: string | null;
  /** The booking that can still change (unpaid, or paid and to come). */
  editableBookingId: string | null;
  /** The citizen, for the event's chat with them. */
  clientId?: string;
  pendingReschedule?: PendingReschedule | null;
}

export interface ReplacementCandidate {
  itemId: string;
  name: string;
  supplierName: string;
  category?: string;
  /** The Supplier's price, before the host's commission and fees. */
  price: number;
  partner: boolean;
}

export type EventEditProposalStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "withdrawn"
  | "expired";

export interface EventEditProposal {
  id: string;
  eventId: string;
  bookingId: string;
  type: "swap" | "reschedule";
  status: EventEditProposalStatus;
  kind: SupplierKind | null;
  /** The replacement (swap). */
  itemName: string;
  /** The Supplier it replaces (swap). */
  replacesName: string;
  /** Totals including fees. */
  currentPrice: number;
  proposedPrice: number;
  priceDelta: number;
  note: string | null;
  expiresAt: string;
  /** Accepted on a paid booking, with the difference still to pay. */
  awaitingPayment: boolean;
  proposedStartAt: string | null;
  proposedEndAt: string | null;
  previousStartAt: string | null;
  previousEndAt: string | null;
}

export interface ReschedulePreviewLine {
  kind: SupplierKind;
  transactionId: string;
  itemName: string;
  supplierName: string;
  status: string;
  available: boolean;
  /** Must confirm the new date (not a partner). */
  reconfirm: boolean;
}

export interface ReschedulePreview {
  eventId: string;
  bookingId: string;
  currentStartAt: string;
  currentEndAt: string;
  proposedStartAt: string;
  proposedEndAt: string;
  available: boolean;
  lines: ReschedulePreviewLine[];
  skipped: {
    kind: SupplierKind;
    transactionId: string;
    itemName: string;
    supplierName: string;
    reason: ConflictReason;
  }[];
  currentPrice: number;
  proposedPrice: number;
  priceDelta: number;
}

/** A booking's replacement deadline, for its citizen. */
export interface BookingReplacementStatus {
  items: {
    kind: SupplierKind;
    itemName: string;
    reason: ConflictReason;
    replaceBy: string | null;
    pendingProposalId: string | null;
  }[];
  replaceBy: string | null;
  fullRefund: boolean;
  awaitingConfirmation: number;
  unpaid: boolean;
  totalAmount: number;
}

/** What accepting a proposal returns: applied, or a difference to pay first. */
export type AcceptProposalResult =
  | { proposalId: string; paymentRequired?: false }
  | {
      proposalId: string;
      paymentRequired: true;
      amount: number;
      clientSecret: string | null;
      /** Already paid (the app was closed mid-payment): just confirm. */
      paid: boolean;
    };
