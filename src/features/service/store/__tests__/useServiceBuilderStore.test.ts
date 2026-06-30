import { describe, it, expect, beforeEach } from 'vitest'
import { useServiceBuilderStore } from '../useServiceBuilderStore'

describe('useServiceBuilderStore — initial status', () => {
  beforeEach(() => {
    useServiceBuilderStore.getState().reset()
  })

  it('initializes service listing with status draft', () => {
    useServiceBuilderStore.getState().initializeForType('service')
    expect(useServiceBuilderStore.getState().status).toBe('draft')
  })

  it('initializes inventory listing with status draft', () => {
    useServiceBuilderStore.getState().initializeForType('inventory')
    expect(useServiceBuilderStore.getState().status).toBe('draft')
  })

  it('resets to draft status', () => {
    useServiceBuilderStore.getState().setStatus('available')
    useServiceBuilderStore.getState().reset()
    expect(useServiceBuilderStore.getState().status).toBe('draft')
  })
})
