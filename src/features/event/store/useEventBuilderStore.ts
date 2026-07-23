import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ResourceItem, GalleryItem } from "@/features/event/data/eventBuilderData";

interface EventBuilderState {
  // Event Details
  eventTitle: string;
  description: string;
  category: string;
  date: string;
  location: string;
  targetCity: string;
  targetState: string;
  targetCountry: string;
  lat: number | null;
  lng: number | null;
  maxAttendees: number;
  gallery: GalleryItem[];

  // Cancellation Policy
  cancellationPolicyId: string | null;

  // Package Items
  baseItems: ResourceItem[];
  targetMargin: number;

  // UI State
  activeCategory: string;
  searchQuery: string;
  draggedItem: ResourceItem | null;
  showGuide: boolean;
  isSubmitting: boolean;
  isDragOver: boolean;

  // Actions - Event Details
  setEventTitle: (title: string) => void;
  setDescription: (desc: string) => void;
  setCategory: (cat: string) => void;
  setDate: (date: string) => void;
  setLocation: (loc: string) => void;
  setTargetCity: (city: string) => void;
  setTargetState: (state: string) => void;
  setTargetCountry: (country: string) => void;
  setLat: (lat: number | null) => void;
  setLng: (lng: number | null) => void;
  setMaxAttendees: (count: number) => void;
  setCancellationPolicyId: (id: string | null) => void;

  // Actions - Gallery
  addGalleryItem: (item: GalleryItem) => void;
  removeGalleryItem: (id: string) => void;
  updateGalleryItemFileId: (id: string, fileId: string) => void;

  // Actions - Package Items
  addBaseItem: (item: ResourceItem) => void;
  removeBaseItem: (id: string) => void;
  updateBaseItem: (id: string, patch: Partial<Pick<ResourceItem, 'agreedPrice' | 'isOptional'>>) => void;
  setTargetMargin: (margin: number) => void;

  // Actions - UI State
  setActiveCategory: (cat: string) => void;
  setSearchQuery: (query: string) => void;
  setDraggedItem: (item: ResourceItem | null) => void;
  setShowGuide: (show: boolean) => void;
  setIsSubmitting: (submitting: boolean) => void;
  setIsDragOver: (over: boolean) => void;

  // Draft tracking
  draftId: string | null;
  setDraftId: (id: string | null) => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  setSaveStatus: (status: 'idle' | 'saving' | 'saved' | 'error') => void;

  // Actions - Reset
  reset: () => void;
}

const initialState = {
  eventTitle: "",
  description: "",
  category: "",
  date: "",
  location: "",
  targetCity: "",
  targetState: "",
  targetCountry: "",
  lat: null as number | null,
  lng: null as number | null,
  maxAttendees: 100,
  gallery: [],
  cancellationPolicyId: null as string | null,
  baseItems: [],
  targetMargin: 20,
  activeCategory: "venue",
  searchQuery: "",
  draggedItem: null,
  showGuide: true,
  isSubmitting: false,
  isDragOver: false,
  draftId: null as string | null,
  saveStatus: 'idle' as 'idle' | 'saving' | 'saved' | 'error',
};

export const useEventBuilderStore = create<EventBuilderState>()(
  persist(
    (set) => ({
      ...initialState,

      // Event Details Actions
      setEventTitle: (title) => set({ eventTitle: title }),
      setDescription: (desc) => set({ description: desc }),
      setCategory: (cat) => set({ category: cat }),
      setDate: (date) => set({ date: date }),
      setLocation: (loc) => set({ location: loc }),
      setTargetCity: (city) => set({ targetCity: city }),
      setTargetState: (state) => set({ targetState: state }),
      setTargetCountry: (country) => set({ targetCountry: country }),
      setLat: (lat) => set({ lat }),
      setLng: (lng) => set({ lng }),
      setMaxAttendees: (count) => set({ maxAttendees: count }),
      setCancellationPolicyId: (id) => set({ cancellationPolicyId: id }),

      // Gallery Actions
      addGalleryItem: (item) =>
        set((state) => ({
          gallery: [...state.gallery, item],
        })),
      removeGalleryItem: (id) =>
        set((state) => ({
          gallery: state.gallery.filter((g) => g.id !== id),
        })),
      updateGalleryItemFileId: (id, fileId) =>
        set((state) => ({
          gallery: state.gallery.map((g) => g.id === id ? { ...g, fileId } : g),
        })),

      // Package Items Actions
      addBaseItem: (item) =>
        set((state) => {
          if (state.baseItems.find((i) => i.id === item.id)) return state;
          return { baseItems: [...state.baseItems, item] };
        }),
      removeBaseItem: (id) =>
        set((state) => ({
          baseItems: state.baseItems.filter((i) => i.id !== id),
        })),
      updateBaseItem: (id, patch) =>
        set((state) => ({
          baseItems: state.baseItems.map((i) => i.id === id ? { ...i, ...patch } : i),
        })),
      setTargetMargin: (margin) => set({ targetMargin: margin }),

      // UI State Actions
      setActiveCategory: (cat) => set({ activeCategory: cat, searchQuery: "" }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setDraggedItem: (item) => set({ draggedItem: item }),
      setShowGuide: (show) => set({ showGuide: show }),
      setIsSubmitting: (submitting) => set({ isSubmitting: submitting }),
      setIsDragOver: (over) => set({ isDragOver: over }),

      // Draft tracking
      setDraftId: (id) => set({ draftId: id }),
      setSaveStatus: (status) => set({ saveStatus: status }),

      // Reset — clears localStorage so published events don't bleed into new ones
      reset: () => {
        if (typeof window !== 'undefined') localStorage.removeItem('fp-event-builder');
        set(initialState);
      },
    }),
    {
      name: 'fp-event-builder',
      storage: createJSONStorage(() => localStorage),
      // Only persist serializable state — File objects and transient UI state are excluded
      partialize: (state) => ({
        eventTitle: state.eventTitle,
        description: state.description,
        category: state.category,
        date: state.date,
        location: state.location,
        targetCity: state.targetCity,
        targetState: state.targetState,
        targetCountry: state.targetCountry,
        lat: state.lat,
        lng: state.lng,
        maxAttendees: state.maxAttendees,
        cancellationPolicyId: state.cancellationPolicyId,
        baseItems: state.baseItems,
        targetMargin: state.targetMargin,
        showGuide: state.showGuide,
        draftId: state.draftId,
        // Strip File objects — blob URLs survive same-tab navigation, not hard reloads
        gallery: state.gallery.map(({ file: _file, ...rest }) => rest),
      }),
    }
  )
);

// Selectors
export const useEventData = () =>
  useEventBuilderStore((state) => ({
    eventTitle: state.eventTitle,
    description: state.description,
    category: state.category,
    date: state.date,
    location: state.location,
    maxAttendees: state.maxAttendees,
    gallery: state.gallery,
  }));

export const usePackageItems = () =>
  useEventBuilderStore((state) => ({
    baseItems: state.baseItems,
    targetMargin: state.targetMargin,
  }));

export const useUIState = () =>
  useEventBuilderStore((state) => ({
    activeCategory: state.activeCategory,
    searchQuery: state.searchQuery,
    draggedItem: state.draggedItem,
    showGuide: state.showGuide,
    isSubmitting: state.isSubmitting,
    isDragOver: state.isDragOver,
  }));
