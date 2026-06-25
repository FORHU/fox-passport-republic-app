"use client";

import { create } from "zustand";

interface CreateVenueModalStore {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useCreateVenueModal = create<CreateVenueModalStore>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));
