import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ItemBookingType = 'service' | 'asset';

interface ItemBookingState {
  itemType: ItemBookingType | null;
  itemId: string | null;
  itemName: string;
  itemImage: string | null;
  providerName: string;
  billingRate: string;
  pricePerUnit: number;
  totalAmount: number;
  bookingId: string | null;
  clientSecret: string | null;
  scheduledDate: string | null;
  location: string | null;

  setBookingDetails: (details: {
    itemType: ItemBookingType;
    itemId: string;
    itemName: string;
    itemImage?: string | null;
    providerName: string;
    billingRate: string;
    pricePerUnit: number;
    totalAmount: number;
    scheduledDate?: string;
    location?: string;
  }) => void;
  setBookingId: (id: string) => void;
  setClientSecret: (secret: string) => void;
  reset: () => void;
}

export const useItemBookingStore = create<ItemBookingState>()(
  persist(
    (set) => ({
      itemType: null,
      itemId: null,
      itemName: '',
      itemImage: null,
      providerName: '',
      billingRate: '',
      pricePerUnit: 0,
      totalAmount: 0,
      bookingId: null,
      clientSecret: null,
      scheduledDate: null,
      location: null,

      setBookingDetails: (details) => set({
        itemType: details.itemType,
        itemId: details.itemId,
        itemName: details.itemName,
        itemImage: details.itemImage ?? null,
        providerName: details.providerName,
        billingRate: details.billingRate,
        pricePerUnit: details.pricePerUnit,
        totalAmount: details.totalAmount,
        scheduledDate: details.scheduledDate ?? null,
        location: details.location ?? null,
        bookingId: null,
        clientSecret: null,
      }),

      setBookingId: (id) => set({ bookingId: id }),
      setClientSecret: (secret) => set({ clientSecret: secret }),

      reset: () => set({
        itemType: null,
        itemId: null,
        itemName: '',
        itemImage: null,
        providerName: '',
        billingRate: '',
        pricePerUnit: 0,
        totalAmount: 0,
        bookingId: null,
        clientSecret: null,
        scheduledDate: null,
        location: null,
      }),
    }),
    {
      name: 'foxpassport-item-booking',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
