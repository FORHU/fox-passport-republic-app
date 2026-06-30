import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useVenueBuilder } from '../useVenueBuilder'
import { useVenueBuilderStore } from '@/features/venue/store/useVenueBuilderStore'
import api from '@/shared/lib/axios'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/shared/lib/axios', () => ({
  default: { post: vi.fn(), get: vi.fn() },
}))

vi.mock('@/shared/hooks/useFileUpload', () => ({
  useFileUpload: () => ({ uploadFile: vi.fn(), isUploading: false }),
}))

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return React.createElement(QueryClientProvider, { client: qc }, children)
}

describe('useVenueBuilder — handleSaveDraft', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useVenueBuilderStore.getState().reset()
  })

  it('posts to /venues/create with status draft', async () => {
    useVenueBuilderStore.setState({
      venueName: 'The Garden',
      description: 'A beautiful outdoor space',
      venueType: 'outdoor',
      location: '123 Main St',
      city: 'Cebu City',
      country: 'Philippines',
      capacity: '80',
      baseRate: 8000,
      includedItems: [],
      addonItems: [],
      gallery: [],
    })

    vi.mocked(api.post).mockResolvedValue({ data: { venue: { id: 'venue-001' } } })

    const { result } = renderHook(() => useVenueBuilder(), { wrapper })

    await act(async () => {
      await result.current.handleSaveDraft()
    })

    expect(vi.mocked(api.post)).toHaveBeenCalledWith(
      '/venues/create',
      expect.objectContaining({ status: 'draft' })
    )
  })

  it('does not post when venue name is missing', async () => {
    useVenueBuilderStore.setState({ venueName: '' })

    const { result } = renderHook(() => useVenueBuilder(), { wrapper })

    await act(async () => {
      await result.current.handleSaveDraft()
    })

    expect(vi.mocked(api.post)).not.toHaveBeenCalled()
  })
})
