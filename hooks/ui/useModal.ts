"use client";

import { useState, useCallback } from "react";

/**
 * Generic hook for managing modal state
 * Provides open, close, and toggle functions
 *
 * @param initialState - Initial open state (default: false)
 * @returns Object with isOpen state and control functions
 */
export function useModal(initialState: boolean = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  };
}
