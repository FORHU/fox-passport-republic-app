import { create } from "zustand";

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
  selectedFoxer: string | null;
  selectedServices: string[];
  searchQuery: string;
  isSubmitting: boolean;
  isSuccess: boolean;
  isDragOver: boolean;

  setActiveCategory: (cat: string) => void;
  setSelectedFoxer: (id: string | null) => void;
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

    // Total is calculated in the hook using live data
    calculateTotal: (venuePrice) => venuePrice * 2,

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
