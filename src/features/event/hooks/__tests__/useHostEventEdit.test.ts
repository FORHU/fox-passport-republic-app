import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useHostEventEdit } from '../useHostEventEdit'
import { updateEvent, submitEventTemplate } from '@/features/event/api/events'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/features/auth/store/useAuthStore', () => ({
  useAuthStore: (selector: any) => selector({ user: { id: 'host-001' } }),
}))

vi.mock('@/features/event/api/events', () => ({
  fetchEventsByHostId: vi.fn().mockResolvedValue([]),
  updateEvent: vi.fn(),
  submitEventTemplate: vi.fn(),
}))

// Provide builder state that satisfies submitEvent validation
vi.mock('@/features/event/hooks/useEventBuilder', () => ({
  useEventBuilder: () => ({
    eventTitle: 'Year-end Party',
    category: 'Corporate',
    description: 'Annual company gathering',
    date: new Date('2026-12-01').toISOString(),
    baseItems: [
      { id: 'venue-001', icon: 'location_city', cost: 5000, name: 'Grand Hall', desc: '' },
    ],
    gallery: [],
    maxAttendees: 100,
    financials: { suggestedPrice: 20000 },
    setIsSubmitting: vi.fn(),
    reset: vi.fn(),
  }),
}))

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return React.createElement(QueryClientProvider, { client: qc }, children)
}

describe('useHostEventEdit — handlePublish', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(updateEvent).mockResolvedValue({} as any)
    vi.mocked(submitEventTemplate).mockResolvedValue({} as any)
  })

  it('calls submitEventTemplate after saving content when publish is clicked', async () => {
    const { result } = renderHook(() => useHostEventEdit('evt-001'), { wrapper })

    await act(async () => {
      await result.current.handlePublish()
    })

    expect(vi.mocked(submitEventTemplate)).toHaveBeenCalledWith('evt-001')
  })

  it('does not call submitEventTemplate when save draft is clicked', async () => {
    const { result } = renderHook(() => useHostEventEdit('evt-001'), { wrapper })

    await act(async () => {
      await result.current.handleSaveDraft()
    })

    expect(vi.mocked(submitEventTemplate)).not.toHaveBeenCalled()
  })

  it('does not pass status field to updateEvent — status is managed by submitEventTemplate', async () => {
    const { result } = renderHook(() => useHostEventEdit('evt-001'), { wrapper })

    await act(async () => {
      await result.current.handlePublish()
    })

    expect(vi.mocked(updateEvent)).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ status: expect.anything() })
    )
  })
})
