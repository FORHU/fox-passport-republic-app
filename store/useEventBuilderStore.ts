import { create } from "zustand";
import { ResourceItem, GalleryItem } from "@/data/eventBuilderData";

interface EventBuilderState {
  // Event Details
  eventTitle: string;
  description: string;
  category: string;
  date: string;
  location: string;
  gallery: GalleryItem[];

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

  // Actions - Gallery
  addGalleryItem: (item: GalleryItem) => void;
  removeGalleryItem: (id: string) => void;

  // Actions - Package Items
  addBaseItem: (item: ResourceItem) => void;
  removeBaseItem: (id: string) => void;
  setTargetMargin: (margin: number) => void;

  // Actions - UI State
  setActiveCategory: (cat: string) => void;
  setSearchQuery: (query: string) => void;
  setDraggedItem: (item: ResourceItem | null) => void;
  setShowGuide: (show: boolean) => void;
  setIsSubmitting: (submitting: boolean) => void;
  setIsDragOver: (over: boolean) => void;

  // Actions - Reset
  reset: () => void;
}

const initialState = {
  eventTitle: "",
  description: "",
  category: "",
  date: "",
  location: "",
  gallery: [],
  baseItems: [],
  targetMargin: 20,
  activeCategory: "venue",
  searchQuery: "",
  draggedItem: null,
  showGuide: true,
  isSubmitting: false,
  isDragOver: false,
};

export const useEventBuilderStore = create<EventBuilderState>((set) => ({
  ...initialState,

  // Event Details Actions
  setEventTitle: (title) => set({ eventTitle: title }),
  setDescription: (desc) => set({ description: desc }),
  setCategory: (cat) => set({ category: cat }),
  setDate: (date) => set({ date: date }),
  setLocation: (loc) => set({ location: loc }),

  // Gallery Actions
  addGalleryItem: (item) =>
    set((state) => ({
      gallery: [...state.gallery, item],
    })),
  removeGalleryItem: (id) =>
    set((state) => ({
      gallery: state.gallery.filter((g) => g.id !== id),
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
  setTargetMargin: (margin) => set({ targetMargin: margin }),

  // UI State Actions
  setActiveCategory: (cat) => set({ activeCategory: cat, searchQuery: "" }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setDraggedItem: (item) => set({ draggedItem: item }),
  setShowGuide: (show) => set({ showGuide: show }),
  setIsSubmitting: (submitting) => set({ isSubmitting: submitting }),
  setIsDragOver: (over) => set({ isDragOver: over }),

  // Reset
  reset: () => set(initialState),
}));

// Selectors
export const useEventData = () =>
  useEventBuilderStore((state) => ({
    eventTitle: state.eventTitle,
    description: state.description,
    category: state.category,
    date: state.date,
    location: state.location,
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
