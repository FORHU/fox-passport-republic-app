import api from "@/lib/axios";

// 1. Create Mock Draft Event (Option B Implementation)
export async function createCheckoutEventContext(payload: {
  venueId: string;
  name: string;
  totalPrice: number;
  guestCount: number;
}) {
  const eventPayload = {
    venueId: payload.venueId,
    name: payload.name, // e.g. "Private Venue Reservation"
    description: "System generated event for direct venue booking",
    eventType: "other",
    startDatetime: new Date().toISOString(),
    endDatetime: new Date(Date.now() + 86400000).toISOString(), // +1 day mock
    maxAttendees: payload.guestCount,
    totalPrice: payload.totalPrice,
    currency: "PHP"
  };

  const resp = await api.post("/events", eventPayload);
  return resp.data?.data; // Returns the generated Event
}

// 2. Draft the Booking
export async function draftBooking(payload: {
  eventId: string;
  guestCount: number;
  totalAmount: number;
}) {
  const resp = await api.post("/bookings/draft", payload);
  return resp.data?.data; // Returns the Draft Booking
}

// 3. Add Attendees to Draft
export async function appendAttendees(
  bookingId: string, 
  attendees: Array<{ firstName: string; lastName: string; email: string; phone: string }>
) {
  const resp = await api.put(`/bookings/${bookingId}/attendees`, { attendees });
  return resp.data?.data;
}

// 4. Confirm Payment (Mock until Stripe Backend is implemented)
export async function confirmBookingPaymentMock(bookingId: string, amount: number) {
  const resp = await api.post(`/bookings/${bookingId}/confirm`, {
    amount,
    method: "stripe",
    transactionId: `mock_txn_${Date.now()}`
  });
  return resp.data?.data;
}
