import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Attendee {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface CheckoutState {
  // Step Management
  step: 1 | 2 | 3;
  setStep: (step: 1 | 2 | 3) => void;

  // Booking details mapped from Venue/Template config
  venueId: string | null;
  templateId: string | null;
  venueName: string;
  venueImage: string | null;
  venueLocation: string | null;
  checkInDate: number | null;
  checkInTime: string | null;
  nights: number;
  totalAmount: number;
  
  // Attendee Form State
  guestCount: number;
  attendees: Attendee[];
  
  // Backend Draft IDs
  draftEventId: string | null;
  draftBookingId: string | null;
  clientSecret: string | null; // Stripe
  
  // Setters
  setConfig: (config: {
    venueId?: string;
    templateId?: string;
    venueName: string;
    venueImage: string | null;
    venueLocation?: string | null;
    checkInDate: number | null;
    checkInTime: string | null;
    nights: number;
    totalAmount: number;
    guestCount: number;
  }) => void;
  
  setAttendees: (attendees: Attendee[]) => void;
  setDraftIds: (eventId: string, bookingId: string) => void;
  setClientSecret: (secret: string) => void;
  resetCheckout: () => void;
}

const initialAttendees = [{ firstName: "", lastName: "", email: "", phone: "" }];

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      step: 1,
      setStep: (step) => set({ step }),

      venueId: null,
      templateId: null,
      venueName: "",
      venueImage: null,
      venueLocation: null,
      checkInDate: null,
      checkInTime: "09:00 PM",
      nights: 0,
      totalAmount: 0,
      guestCount: 1,

      attendees: initialAttendees,
      draftEventId: null,
      draftBookingId: null,
      clientSecret: null,

      setConfig: (config) => set((state) => ({
        ...config,
        attendees: Array(config.guestCount).fill(null).map((_, i) => state.attendees[i] || { firstName: "", lastName: "", email: "", phone: "" }),
      })),

      setAttendees: (attendees) => set({ attendees }),
      setDraftIds: (draftEventId, draftBookingId) => set({ draftEventId, draftBookingId }),
      setClientSecret: (clientSecret) => set({ clientSecret }),

      resetCheckout: () => set({
        step: 1,
        venueId: null,
        templateId: null,
        venueName: "",
        venueImage: null,
        venueLocation: null,
        checkInDate: null,
        checkInTime: "09:00 PM",
        nights: 0,
        totalAmount: 0,
        guestCount: 1,
        attendees: initialAttendees,
        draftEventId: null,
        draftBookingId: null,
        clientSecret: null,
      }),
    }),
    {
      name: "foxpassport-checkout",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
