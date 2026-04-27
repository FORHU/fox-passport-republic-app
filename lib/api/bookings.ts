import api from "@/lib/axios";

// 1. Create Draft Event Context
export async function createCheckoutEventContext(payload: {
  venueId: string;
  name: string;
  totalPrice: number;
  guestCount: number;
}) {
  const eventPayload = {
    venueId: payload.venueId,
    name: payload.name,
    description: "System generated event for direct venue booking",
    eventType: "other",
    startDatetime: new Date().toISOString(),
    endDatetime: new Date(Date.now() + 86400000).toISOString(),
    maxAttendees: payload.guestCount,
    totalPrice: payload.totalPrice,
    currency: "PHP"
  };

  const resp = await api.post("/events", eventPayload);
  return resp.data?.data;
}

// 2. Draft the Booking
export async function draftBooking(payload: {
  eventId: string;
  guestCount: number;
  totalAmount: number;
}) {
  const resp = await api.post("/bookings/draft", payload);
  return resp.data?.data;
}

// 3. Add Attendees to Draft
export async function appendAttendees(
  bookingId: string,
  attendees: Array<{ firstName: string; lastName: string; email: string; phone: string }>
) {
  const resp = await api.put(`/bookings/${bookingId}/attendees`, { attendees });
  return resp.data?.data;
}

// 4. Create Stripe Payment Intent
export async function createPaymentIntent(payload: {
  amount: number;
  currency?: string;
  bookingId?: string;
  description?: string;
}): Promise<{ clientSecret: string; paymentIntentId: string }> {
  const resp = await api.post("/payments/create-intent", payload);
  return resp.data?.data;
}

// 5. Confirm Booking after Payment (records the payment in our system)
export async function confirmBookingPayment(bookingId: string, paymentIntentId: string, amount: number) {
  const resp = await api.post(`/bookings/${bookingId}/confirm`, {
    amount,
    method: "stripe",
    transactionId: paymentIntentId,
  });
  return resp.data?.data;
}
