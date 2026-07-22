import { create } from "zustand";
import { ResourceItem, GalleryItem, INITIAL_RESOURCES } from "@/features/venue/data/venueBuilderData";

interface VenueBuilderState {
  // Resources
  resources: Record<string, ResourceItem[]>;

  // Venue Details
  venueName: string;
  description: string;
  venueType: string;
  capacity: string;
  location: string;
  country: string;
  city: string;
  state: string;
  gallery: GalleryItem[];

  // Cancellation Policy
  cancellationPolicyId: string | null;

  // Package Items
  includedItems: ResourceItem[];
  addonItems: ResourceItem[];
  baseRate: number;
  occupancyRate: number;

  // UI State
  activeCategory: string;
  searchQuery: string;
  showGuide: boolean;
  showCustomForm: boolean;
  isSubmitting: boolean;
  isDragOver: boolean;
  draggedItem: ResourceItem | null;
  newItem: { name: string; value: string; desc: string };

  lat: number | null;
  lng: number | null;

  // Actions - Venue Details
  setVenueName: (name: string) => void;
  setDescription: (desc: string) => void;
  setVenueType: (type: string) => void;
  setCapacity: (cap: string) => void;
  setLocation: (loc: string) => void;
  setCountry: (c: string) => void;
  setCity: (c: string) => void;
  setState: (s: string) => void;
  setLat: (lat: number | null) => void;
  setLng: (lng: number | null) => void;

  // Actions - Gallery
  addGalleryItem: (item: GalleryItem) => void;
  removeGalleryItem: (id: string) => void;

  // Actions - Resources
  addCustomResource: (category: string, item: ResourceItem) => void;
  removeCustomResource: (category: string, id: string) => void;

  // Actions - Cancellation Policy
  setCancellationPolicyId: (id: string | null) => void;

  // Actions - Package Items
  addIncludedItem: (item: ResourceItem) => void;
  removeIncludedItem: (id: string) => void;
  addAddonItem: (item: ResourceItem) => void;
  removeAddonItem: (id: string) => void;
  setBaseRate: (rate: number) => void;
  setOccupancyRate: (rate: number) => void;

  // Actions - UI State
  setActiveCategory: (cat: string) => void;
  setSearchQuery: (query: string) => void;
  setShowGuide: (show: boolean) => void;
  setShowCustomForm: (show: boolean) => void;
  setIsSubmitting: (submitting: boolean) => void;
  setIsDragOver: (over: boolean) => void;
  setDraggedItem: (item: ResourceItem | null) => void;
  setNewItem: (item: { name: string; value: string; desc: string }) => void;

  // Reset
  reset: () => void;
}

// Data-only fields used for reset. Never include action functions here —
// spreading them into set() would overwrite Zustand's real implementations with no-ops.
const initialData = {
  resources: INITIAL_RESOURCES,
  venueName: "",
  description: "",
  venueType: "",
  capacity: "",
  location: "",
  country: "",
  city: "",
  state: "",
  lat: null as number | null,
  lng: null as number | null,
  gallery: [] as GalleryItem[],
  cancellationPolicyId: null as string | null,
  includedItems: [] as ResourceItem[],
  addonItems: [] as ResourceItem[],
  baseRate: 15000,
  occupancyRate: 60,
  activeCategory: "spaces",
  searchQuery: "",
  showGuide: true,
  showCustomForm: false,
  isSubmitting: false,
  isDragOver: false,
  draggedItem: null as ResourceItem | null,
  newItem: { name: "", value: "", desc: "" },
};

export const useVenueBuilderStore = create<VenueBuilderState>((set) => ({
  ...initialData,

  // Venue Details Actions
  setVenueName: (name) => set({ venueName: name }),
  setDescription: (desc) => set({ description: desc }),
  setVenueType: (type) => set({ venueType: type }),
  setCapacity: (cap) => set({ capacity: cap }),
  setLocation: (loc) => set({ location: loc }),
  setCountry: (c) => set({ country: c }),
  setCity: (c) => set({ city: c }),
  setState: (s) => set({ state: s }),
  setLat: (lat) => set({ lat }),
  setLng: (lng) => set({ lng }),

  // Gallery Actions
  addGalleryItem: (item) => set((state) => ({ gallery: [...state.gallery, item] })),
  removeGalleryItem: (id) => set((state) => ({ gallery: state.gallery.filter((g) => g.id !== id) })),

  // Resources Actions
  addCustomResource: (category, item) =>
    set((state) => ({
      resources: {
        ...state.resources,
        [category]: [item, ...(state.resources[category] || [])],
      },
    })),
  removeCustomResource: (category, id) =>
    set((state) => ({
      resources: {
        ...state.resources,
        [category]: (state.resources[category] || []).filter((r) => r.id !== id),
      },
    })),

  // Cancellation Policy Actions
  setCancellationPolicyId: (id) => set({ cancellationPolicyId: id }),

  // Package Items Actions
  addIncludedItem: (item) =>
    set((state) => {
      if (state.includedItems.find((i) => i.id === item.id)) return state;
      return { includedItems: [...state.includedItems, item] };
    }),
  removeIncludedItem: (id) => set((state) => ({ includedItems: state.includedItems.filter((i) => i.id !== id) })),
  addAddonItem: (item) =>
    set((state) => {
      if (state.addonItems.find((i) => i.id === item.id)) return state;
      return { addonItems: [...state.addonItems, item] };
    }),
  removeAddonItem: (id) => set((state) => ({ addonItems: state.addonItems.filter((i) => i.id !== id) })),
  setBaseRate: (rate) => set({ baseRate: rate }),
  setOccupancyRate: (rate) => set({ occupancyRate: rate }),

  // UI State Actions
  setActiveCategory: (cat) => set({ activeCategory: cat, searchQuery: "", showCustomForm: false }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setShowGuide: (show) => set({ showGuide: show }),
  setShowCustomForm: (show) => set({ showCustomForm: show }),
  setIsSubmitting: (submitting) => set({ isSubmitting: submitting }),
  setIsDragOver: (over) => set({ isDragOver: over }),
  setDraggedItem: (item) => set({ draggedItem: item }),
  setNewItem: (item) => set({ newItem: item }),

  // Reset — only resets data fields, never action functions
  reset: () =>
    set((state) => {
      state.gallery.forEach((item) => {
        if (item.url?.startsWith('blob:')) URL.revokeObjectURL(item.url);
      });
      return { ...initialData };
    }),
}));
