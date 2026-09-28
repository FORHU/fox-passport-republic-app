// "booking" targets a direct-venue Booking (single provider, no template) —
// a template-based, multi-provider Event Booking has no per-booking price
// formula and stays out of scope. See the API repo's booking-edit-request
// service for the full reasoning.
export type BookingKind = "asset" | "service" | "booking";

export interface ItemBookingPayment {
  id: string;
  amount: number | string;
  method: string;
  provider: string;
  providerReference: string | null;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

export interface ItemBookingRefund {
  id: string;
  amount: number | string;
  reason: string | null;
  providerReference: string | null;
  status: string;
  createdAt: string;
}

export type BookingEditRequestStatus =
  | "pending"
  | "approved"
  | "declined"
  | "withdrawn"
  | "expired";

/**
 * A citizen's proposed change (guest count/quantity, dates) to an existing
 * paid Asset/Service booking, subject to the owner's approval. The `canX`
 * flags are always computed and sent by the server per-viewer — never
 * derived on the frontend — see docs/adr/0003-booking-edit-requests.md in
 * the API repo.
 */
export interface BookingEditRequest {
  id: string;
  assetBookingId: string | null;
  serviceBookingId: string | null;
  bookingId: string | null;
  requestedById: string;
  status: BookingEditRequestStatus;

  proposedQuantity: number | null;
  proposedGuestCount: number | null;
  proposedStartDate: string | null;
  proposedEndDate: string | null;

  currentTotalAmount: number;
  proposedTotalAmount: number;
  priceDelta: number;

  reason: string | null;
  declineReason: string | null;
  expiresAt: string;
  appliedAt: string | null;
  deltaPaymentIntentId: string | null;
  deltaClientSecret?: string | null;
  deltaRefundId: string | null;

  createdAt: string;
  updatedAt: string;

  canApprove: boolean;
  canDecline: boolean;
  canWithdraw: boolean;
}
