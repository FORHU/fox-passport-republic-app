import api from "@/shared/lib/axios";

// 0. Fetch a single public (approved) EventTemplate
export async function getPublicTemplate(templateId: string) {
  const resp = await api.get(`/event-templates/browse/${templateId}`);
  return resp.data?.data;
}

// 0b. Book directly from an approved EventTemplate
export async function bookFromTemplate(payload: {
  templateId: string;
  guestCount: number;
  totalAmount: number;
  startAt: string;
  endAt: string;
  excludedAssetIds?: string[];
  excludedServiceIds?: string[];
  excludedVenueIds?: string[];
}): Promise<{ booking: { id: string }; eventId: string }> {
  const resp = await api.post("/bookings/from-template", payload);
  return resp.data?.data;
}

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

  const resp = await api.post("/event-requests", eventPayload);
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

// --- Service & Asset Booking Flow ---

export async function bookService(payload: {
  serviceId: string | number;
  scheduledDate: string;
  endDate?: string;
  guestCount?: number;
  location: string;
  notes?: string;
  totalAmount: number;
}): Promise<{ id: string }> {
  const resp = await api.post('/service/bookings', payload);
  return resp.data?.data ?? resp.data;
}

export async function bookAsset(payload: {
  assetId: string | number;
  startDate: string;
  endDate: string;
  quantity: number;
  fulfillmentType: 'delivery' | 'pickup';
  deliveryAddress?: string;
  notes?: string;
  totalAmount: number;
}): Promise<{ id: string }> {
  const resp = await api.post('/asset/bookings', payload);
  return resp.data?.data ?? resp.data;
}

export async function confirmServiceBooking(bookingId: string, paymentIntentId: string, amount: number) {
  const resp = await api.post(`/service/bookings/${bookingId}/confirm`, {
    amount,
    method: 'stripe',
    transactionId: paymentIntentId,
  });
  return resp.data?.data;
}

export async function confirmAssetBooking(bookingId: string, paymentIntentId: string, amount: number) {
  const resp = await api.post(`/asset/bookings/${bookingId}/confirm`, {
    amount,
    method: 'stripe',
    transactionId: paymentIntentId,
  });
  return resp.data?.data;
}

export async function fetchServiceBooking(id: string) {
  const resp = await api.get(`/service/bookings/${id}`);
  return resp.data?.data;
}

export async function fetchAssetBooking(id: string) {
  const resp = await api.get(`/asset/bookings/${id}`);
  return resp.data?.data;
}

export async function confirmArrival(type: 'service' | 'asset', id: string) {
  const resp = await api.patch(`/${type}/bookings/${id}/confirm-arrival`);
  return resp.data?.data;
}

export async function reportNoShow(type: 'service' | 'asset', id: string) {
  const resp = await api.patch(`/${type}/bookings/${id}/dispute`);
  return resp.data?.data;
}

export async function fetchTemplateAvailability(templateId: string): Promise<{ bookedDates: string[] }> {
  const resp = await api.get(`/bookings/availability?templateId=${templateId}`);
  return resp.data?.data ?? { bookedDates: [] };
}

export async function fetchServiceAvailability(serviceId: string): Promise<{ bookedDates: string[] }> {
  const resp = await api.get(`/service/bookings/availability?serviceId=${serviceId}`);
  return resp.data?.data ?? { bookedDates: [] };
}

export async function fetchAssetAvailability(assetId: string): Promise<{
  bookedRanges: { startDate: string; endDate: string; bookedQty: number }[];
  totalQty: number;
}> {
  const resp = await api.get(`/asset/bookings/availability?assetId=${assetId}`);
  return resp.data?.data ?? { bookedRanges: [], totalQty: 0 };
}

// 6. Direct Venue Booking — creates Event + VenueTransaction + Booking in one call
export async function bookVenueDraft(payload: {
  venueId: string;
  startDate: string;
  endDate: string;
  guestCount: number;
  totalAmount: number;
  specialRequests?: string;
}): Promise<{ bookingId: string }> {
  const resp = await api.post("/bookings/draft", payload);
  return { bookingId: resp.data?.data?.id };
}

export async function cancelBooking(bookingId: string): Promise<void> {
  await api.patch(`/bookings/${bookingId}/cancel`);
}

export async function fetchBookingById(
  id: string
): Promise<any> {
  const resp = await api.get(`/bookings/${id}`);
  return resp.data?.data ?? resp.data;
}

export async function fetchUserBookings(
  userId: string,
  page = 1,
  limit = 4
): Promise<{ bookings: any[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  const resp = await api.get(`/bookings/user/${userId}?page=${page}&limit=${limit}`);
  return {
    bookings: resp.data?.data ?? [],
    pagination: resp.data?.pagination ?? { page, limit, total: 0, totalPages: 0 },
  };
}

export async function fetchFoxerBookings(ownerId: string) {
  const [svcResp, assetResp] = await Promise.all([
    api.get(`/service/bookings?ownerId=${ownerId}`),
    api.get(`/asset/bookings?ownerId=${ownerId}`),
  ]);
  return {
    services: svcResp.data?.data ?? [],
    assets: assetResp.data?.data ?? [],
  };
}
