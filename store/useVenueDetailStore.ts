import { create } from "zustand";
import { CUSTOM_SERVICES, AVAILABLE_FOXERS } from "@/data/venueDetailData";

interface VenueDetailState {
  // Gallery
  galleryOpen: boolean;
  activeImageIndex: number;

  // Custom Booking
  isCustomBookingOpen: boolean;

  // Date Selection
  checkInDate: number | null;
  checkOutDate: number | null;

  // Actions
  setGalleryOpen: (open: boolean) => void;
  setActiveImageIndex: (index: number) => void;
  openGallery: (index: number) => void;
  nextImage: (totalImages: number) => void;
  prevImage: (totalImages: number) => void;
  setCustomBookingOpen: (open: boolean) => void;
  handleDateClick: (day: number) => void;
  clearDates: () => void;
}

export const useVenueDetailStore = create<VenueDetailState>((set, get) => ({
  galleryOpen: false,
  activeImageIndex: 0,
  isCustomBookingOpen: false,
  checkInDate: 12,
  checkOutDate: 14,

  setGalleryOpen: (open) => set({ galleryOpen: open }),
  setActiveImageIndex: (index) => set({ activeImageIndex: index }),

  openGallery: (index) => set({ activeImageIndex: index, galleryOpen: true }),

  nextImage: (totalImages) =>
    set((state) => ({
      activeImageIndex: (state.activeImageIndex + 1) % totalImages,
    })),

  prevImage: (totalImages) =>
    set((state) => ({
      activeImageIndex:
        (state.activeImageIndex - 1 + totalImages) % totalImages,
    })),

  setCustomBookingOpen: (open) => set({ isCustomBookingOpen: open }),

  handleDateClick: (day) => {
    const { checkInDate, checkOutDate } = get();
    if (day <= 10) return; // Not available

    if (checkInDate === null) {
      set({ checkInDate: day });
    } else if (checkOutDate === null) {
      if (day > checkInDate) {
        set({ checkOutDate: day });
      } else {
        set({ checkInDate: day, checkOutDate: null });
      }
    } else {
      set({ checkInDate: day, checkOutDate: null });
    }
  },

  clearDates: () => set({ checkInDate: null, checkOutDate: null }),
}));

// Custom Experience Builder Store
interface ExperienceBuilderState {
  activeCategory: string;
  selectedFoxer: number | null;
  selectedServices: string[];
  searchQuery: string;
  isSubmitting: boolean;
  isSuccess: boolean;
  isDragOver: boolean;

  setActiveCategory: (cat: string) => void;
  setSelectedFoxer: (id: number | null) => void;
  toggleService: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setIsSubmitting: (submitting: boolean) => void;
  setIsSuccess: (success: boolean) => void;
  setIsDragOver: (over: boolean) => void;
  calculateTotal: (venuePrice: number) => number;
  reset: () => void;
}

export const useExperienceBuilderStore = create<ExperienceBuilderState>(
  (set, get) => ({
    activeCategory: "foxer",
    selectedFoxer: null,
    selectedServices: [],
    searchQuery: "",
    isSubmitting: false,
    isSuccess: false,
    isDragOver: false,

    setActiveCategory: (cat) => set({ activeCategory: cat, searchQuery: "" }),
    setSelectedFoxer: (id) => set({ selectedFoxer: id }),

    toggleService: (id) =>
      set((state) => ({
        selectedServices: state.selectedServices.includes(id)
          ? state.selectedServices.filter((s) => s !== id)
          : [...state.selectedServices, id],
      })),

    setSearchQuery: (query) => set({ searchQuery: query }),
    setIsSubmitting: (submitting) => set({ isSubmitting: submitting }),
    setIsSuccess: (success) => set({ isSuccess: success }),
    setIsDragOver: (over) => set({ isDragOver: over }),

    calculateTotal: (venuePrice) => {
      const { selectedFoxer, selectedServices } = get();
      let total = venuePrice * 2;

      if (selectedFoxer) {
        const foxer = AVAILABLE_FOXERS.find((f) => f.id === selectedFoxer);
        if (foxer) total += foxer.fee;
      }

      Object.values(CUSTOM_SERVICES)
        .flat()
        .forEach((svc) => {
          if (selectedServices.includes(svc.id)) total += svc.price;
        });

      return total;
    },

    reset: () =>
      set({
        activeCategory: "foxer",
        selectedFoxer: null,
        selectedServices: [],
        searchQuery: "",
        isSubmitting: false,
        isSuccess: false,
        isDragOver: false,
      }),
  })
);
