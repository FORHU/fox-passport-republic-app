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
  status: string;
  paymentStatus: PaymentStatus;
}

export interface CheckoutResponse {
  invoiceId: string;
  checkoutId: string;
  url: string;
  status: string;
}

export interface PaymentSummaryResponse {
  eventId: string;
  currency: string;
  subtotalAmount: number;
  discountAmount: number;
  platformFeeAmount: number;
  grossAmount: number;
}
