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

function buildTemplate(templateId: string, claimedOverride = false) {
  const isClaimed = claimedOverride || claimedTemplateIds.has(templateId);
  const isFull = !isClaimed && (templateId === 'full-event' || templateId === 'on-waitlist-event');
  const base = {
    id: templateId,
    name: 'Corporate Team Building',
    description: 'A full-day team building experience with professional facilitators.',
    category: 'corporate',
    isPublic: true,
    targetCity: 'Manila',
    targetState: 'Metro Manila',
    targetCountry: 'Philippines',
    createdAt: new Date().toISOString(),
    images: [{ id: 'img_1', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800', name: 'Event' }],
    templateVenues: [{ venue: { city: 'Manila', price: 5000 } }],
    owner: { id: 'host_1', name: 'Event Host' },
    templateAssets: [],
    templateServices: [
      {
        id: 'ts_1',
        isOptional: false,
        agreedPrice: 5000,
        service: { id: 'svc_1', name: 'Professional Photography', description: 'Full-day event photography coverage' },
      },
    ],
    estimatedTotal: 25000,
  };
  if (isFull) {
    return { ...base, maxAttendees: 20, currentAttendees: 20 };
  }
  if (isClaimed) {
    return { ...base, maxAttendees: 20, currentAttendees: 19 };
  }
  return { ...base };
}

const waitlistDb: Record<string, { id: string; templateId: string; userId: string; position: number }> = {};
const claimedTemplateIds = new Set<string>();
let mockSpotOpenedCounter = 0;

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

  // ── Event Template (for capacity check) ─────────────────────────────────
  http.get(`${BASE}/event-templates/browse/:templateId`, ({ params, request }) => {
    const url = new URL(request.url);
    const claimed = url.searchParams.get('claimed') === '1';
    return HttpResponse.json({ data: buildTemplate(params.templateId as string, claimed) });
  }),

  // ── Waitlist ────────────────────────────────────────────────────────────
  http.get(`${BASE}/waitlist`, ({ request }) => {
    const url = new URL(request.url);
    const templateId = url.searchParams.get('templateId') ?? '';
    const isOnWaitlist = templateId === 'on-waitlist-event';
    const entryId = isOnWaitlist ? 'wl_123' : null;
    return HttpResponse.json({
      success: true,
      data: {
        isOnWaitlist,
        position: isOnWaitlist ? 3 : null,
        entryId,
        totalWaiting: 5,
      },
    });
  }),

  http.post(`${BASE}/waitlist`, async ({ request }) => {
    const body = (await request.json()) as { templateId: string };
    const entryId = 'wl_' + Date.now();
    waitlistDb[entryId] = { id: entryId, templateId: body.templateId, userId: 'user_123', position: 6 };
    return HttpResponse.json({
      success: true,
      data: {
        entry: waitlistDb[entryId],
        position: 6,
        totalWaiting: 6,
      },
    });
  }),

  http.delete(`${BASE}/waitlist/:id`, ({ params }) => {
    delete waitlistDb[params.id as string];
    return HttpResponse.json({
      success: true,
      message: 'Removed from waitlist',
    });
  }),

  // ── Waitlist: user entries (all templates) ──────────────────────────
  http.get(`${BASE}/waitlist/user`, () => {
    const entries = Object.values(waitlistDb).filter((e) => e.userId === 'user_123');
    const mockTemplates: Record<string, any> = {
      'full-event': {
        name: 'Corporate Team Building',
        category: 'corporate',
        image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400',
        location: 'Manila, Metro Manila',
        maxAttendees: 20,
        currentAttendees: 20,
      },
      'on-waitlist-event': {
        name: 'Weekend Beach Retreat',
        category: 'leisure',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
        location: 'Batangas, Philippines',
        maxAttendees: 30,
        currentAttendees: 30,
      },
    };
    const data = entries.length > 0
      ? entries.map((e) => ({
          id: e.id,
          templateId: e.templateId,
          position: e.position,
          totalWaiting: Object.values(waitlistDb).length || 5,
          template: mockTemplates[e.templateId] ?? {
            name: 'Event',
            category: 'general',
            image: null,
            location: 'Philippines',
            maxAttendees: 20,
            currentAttendees: 20,
          },
        }))
      : [
          {
            id: 'wl_mock_1',
            templateId: 'full-event',
            position: 3,
            totalWaiting: 5,
            template: mockTemplates['full-event'],
          },
        ];
    return HttpResponse.json({ success: true, data });
  }),

  // ── Waitlist: spot-opened notification ──────────────────────────────
  http.get(`${BASE}/waitlist/notification`, () => {
    const hasSpotOpened = mockSpotOpenedCounter >= 3 && !claimedTemplateIds.has('full-event');
    mockSpotOpenedCounter++;
    return HttpResponse.json({
      success: true,
      data: {
        hasSpotOpened,
        templateId: hasSpotOpened ? 'full-event' : null,
        templateName: hasSpotOpened ? 'Corporate Team Building' : null,
        entryId: hasSpotOpened ? 'wl_open_001' : null,
      },
    });
  }),

  // ── Waitlist: claim a spot ──────────────────────────────────────────
  http.post(`${BASE}/waitlist/claim`, async ({ request }) => {
    const body = (await request.json()) as { templateId: string; entryId: string };
    if (claimedTemplateIds.has(body.templateId)) {
      return HttpResponse.json(
        { success: false, message: 'This spot has already been claimed by someone else.' },
        { status: 409 },
      );
    }
    claimedTemplateIds.add(body.templateId);
    // Remove the waitlist entry
    Object.keys(waitlistDb).forEach((key) => {
      if (waitlistDb[key].templateId === body.templateId) {
        delete waitlistDb[key];
      }
    });
    return HttpResponse.json({
      success: true,
      data: { message: 'Spot claimed! You have 15 minutes to complete your booking.' },
    });
  }),
];