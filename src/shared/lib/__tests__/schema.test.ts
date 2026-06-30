import { describe, it, expect } from 'vitest'
import {
  createServiceSchema,
  createEventSchema,
  createVenueSchema,
} from '../schema'

// All status enums must mirror the backend Prisma enums exactly.
// Source of truth: fox-passport-republic-api/prisma/schema.prisma

const serviceBase = {
  name: 'Photography',
  description: 'Professional photography service',
  category: 'entertainment',
  price: 150,
}

const eventBase = {
  name: 'Birthday Bash',
  eventType: 'birthday',
  venueId: 'venue-001',
  startDatetime: new Date('2026-08-01T10:00:00'),
  endDatetime: new Date('2026-08-01T14:00:00'),
  maxAttendees: 50,
}

const venueBase = {
  name: 'The Garden',
  type: 'outdoor',
  capacity: 100,
  address: '123 Main St',
  city: 'Cebu',
  country: 'Philippines',
  price: 10000,
}

describe('createServiceSchema — ServiceStatus enum', () => {
  it('defaults status to draft', () => {
    const result = createServiceSchema.parse(serviceBase)
    expect(result.status).toBe('draft')
  })

  it('accepts all valid backend ServiceStatus values', () => {
    for (const status of ['draft', 'pending', 'available', 'paused', 'archived', 'rejected']) {
      expect(createServiceSchema.parse({ ...serviceBase, status }).status).toBe(status)
    }
  })

  it('rejects stale frontend-only values no longer in backend enum', () => {
    for (const bad of ['active', 'unavailable', 'published']) {
      expect(() => createServiceSchema.parse({ ...serviceBase, status: bad })).toThrow()
    }
  })
})

describe('createEventSchema — EventStatus enum', () => {
  it('defaults status to draft', () => {
    const result = createEventSchema.parse(eventBase)
    expect(result.status).toBe('draft')
  })

  it('accepts all valid backend EventStatus values', () => {
    for (const status of ['draft', 'pending', 'ongoing', 'completed', 'cancelled']) {
      expect(createEventSchema.parse({ ...eventBase, status }).status).toBe(status)
    }
  })

  it('rejects published — not a backend EventStatus value', () => {
    expect(() => createEventSchema.parse({ ...eventBase, status: 'published' })).toThrow()
  })

  it('rejects active — not a backend EventStatus value', () => {
    expect(() => createEventSchema.parse({ ...eventBase, status: 'active' })).toThrow()
  })
})

describe('createVenueSchema — VenueStatus enum', () => {
  it('defaults status to draft', () => {
    const result = createVenueSchema.parse(venueBase)
    expect(result.status).toBe('draft')
  })

  it('accepts all valid backend VenueStatus values', () => {
    for (const status of ['draft', 'pending', 'available', 'archived', 'rejected']) {
      expect(createVenueSchema.parse({ ...venueBase, status }).status).toBe(status)
    }
  })

  it('rejects stale frontend-only values', () => {
    for (const bad of ['pending_review', 'published', 'suspended']) {
      expect(() => createVenueSchema.parse({ ...venueBase, status: bad })).toThrow()
    }
  })
})
