import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:3002/api/v1';

const MOCK_BOOKING = {
  id: 'booking_123',
  status: 'confirmed',
  totalAmount: 15000,
  guestCount: 10,
  startAt: new Date(Date.now() + 86400000 * 7).toISOString(),
  endAt: new Date(Date.now() + 86400000 * 8).toISOString(),
  event: { name: 'Corporate Team Building' },
  payments: [
    { id: 'pay_1', amount: 15000, status: 'succeeded', method: 'stripe', createdAt: new Date().toISOString() },
  ],
};

export const handlers = [
  http.get(`${BASE}/bookings/:id`, ({ params }) => {
    if (params.id === 'notfound') return HttpResponse.json({ data: null }, { status: 404 });
    return HttpResponse.json({ data: MOCK_BOOKING });
  }),

  http.post(`${BASE}/bookings/:id/cancel/check`, () => {
    return HttpResponse.json({
      data: {
        eligible: true,
        refundPercent: 50,
        totalPaid: 15000,
        estimatedRefund: 7500,
        message: 'Standard cancellation policy: 50% refund if cancelled more than 7 days before event start.',
        hoursUntilStart: 168,
      },
    });
  }),

  http.post(`${BASE}/bookings/:id/cancel`, () => {
    return HttpResponse.json({
      data: {
        booking: { ...MOCK_BOOKING, status: 'cancelled' },
        refunds: [
          {
            id: 'ref_1',
            amount: 7500,
            status: 'succeeded',
            method: 'stripe',
            adminNotes: 'Standard Refund Policy (50% within 7+ days)',
          },
        ],
      },
    });
  }),
];
