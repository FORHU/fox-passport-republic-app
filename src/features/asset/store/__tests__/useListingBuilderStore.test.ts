import { describe, it, expect, beforeEach } from 'vitest'
import { useListingBuilderStore } from '../useListingBuilderStore'

// On create, both inventory and service listings must start as "draft"
// so they go through admin pending_review before becoming visible.
// Source: CONTEXT.md — Asset/Service status: draft → pending → available

describe('useListingBuilderStore — initial status', () => {
  beforeEach(() => {
    useListingBuilderStore.getState().reset()
  })

  it('initializes inventory listing with status draft', () => {
    useListingBuilderStore.getState().initializeForType('inventory')
    expect(useListingBuilderStore.getState().status).toBe('draft')
  })

  it('initializes service listing with status draft', () => {
    useListingBuilderStore.getState().initializeForType('service')
    expect(useListingBuilderStore.getState().status).toBe('draft')
  })

  it('resets to draft status', () => {
    useListingBuilderStore.getState().setStatus('available')
    useListingBuilderStore.getState().reset()
    expect(useListingBuilderStore.getState().status).toBe('draft')
  })
})
