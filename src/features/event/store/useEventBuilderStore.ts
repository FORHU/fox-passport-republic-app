import { create } from "zustand";
import {
  persist,
  createJSONStorage,
  type StateStorage,
} from "zustand/middleware";
import {
  ResourceItem,
  GalleryItem,
} from "@/features/event/data/eventBuilderData";
import { useAuthStore } from "@/shared/auth/useAuthStore";

const STORAGE_NAME = "fp-event-builder";

/**
 * Drafts are kept per account: `fp-event-builder:<userId>`. They used to sit
 * under one key for the whole browser, so after a sign-out the next person to
 * sign in on the same browser opened Event Studio on the previous account's
 * draft (and its autosave would then save that draft as theirs).
 *
 * With no signed-in user (or no usable id) nothing is read or written.
 */
function draftKey(name: string): string | null {
  if (typeof window === "undefined") return null;
  const id = useAuthStore.getState().user?.id;
  return typeof id === "string" && id.trim() ? `${name}:${id}` : null;
}

// Paused while the store is cleared for an account change, so clearing the
// screen doesn't overwrite the incoming account's saved draft.
let writesPaused = false;

const draftStorage: StateStorage = {
  getItem: (name) => {
    const key = draftKey(name);
    if (!key) return null;
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      JSON.parse(raw);
      return raw;
    } catch {
      // Unreadable or corrupt: start this account on a blank draft.
      try {
        localStorage.removeItem(key);
      } catch {}
      return null;
    }
  },
  setItem: (name, value) => {
    const key = draftKey(name);
    if (!key || writesPaused) return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // Full or blocked storage: the draft just isn't kept locally.
    }
  },
  removeItem: (name) => {
    const key = draftKey(name);
    if (!key) return;
    try {
      localStorage.removeItem(key);
    } catch {}
  },
};

interface EventBuilderState {
  // Event Details
  eventTitle: string;
  description: string;
  category: string;
  /** Free-text category when `category` is "Other". */
  categoryOther: string;
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
  setCategoryOther: (cat: string) => void;
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
  updateBaseItem: (
    id: string,
    patch: Partial<Pick<ResourceItem, "agreedPrice" | "isOptional">>,
  ) => void;
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
  saveStatus: "idle" | "saving" | "saved" | "error";
  setSaveStatus: (status: "idle" | "saving" | "saved" | "error") => void;

  // Actions - Reset
  reset: () => void;
}

const initialState = {
  eventTitle: "",
  description: "",
  category: "",
  categoryOther: "",
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
  saveStatus: "idle" as "idle" | "saving" | "saved" | "error",
};

export const useEventBuilderStore = create<EventBuilderState>()(
  persist(
    (set) => ({
      ...initialState,

      // Event Details Actions
      setEventTitle: (title) => set({ eventTitle: title }),
      setDescription: (desc) => set({ description: desc }),
      setCategory: (cat) => set({ category: cat }),
      setCategoryOther: (cat) => set({ categoryOther: cat }),
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
          gallery: state.gallery.map((g) =>
            g.id === id ? { ...g, fileId } : g,
          ),
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
          baseItems: state.baseItems.map((i) =>
            i.id === id ? { ...i, ...patch } : i,
          ),
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

      // Reset — clears this account's saved draft so published events don't
      // bleed into new ones
      reset: () => {
        draftStorage.removeItem(STORAGE_NAME);
        set(initialState);
      },
    }),
    {
      name: STORAGE_NAME,
      storage: createJSONStorage(() => draftStorage),
      // Only persist serializable state — File objects and transient UI state are excluded
      partialize: (state) => ({
        eventTitle: state.eventTitle,
        description: state.description,
        category: state.category,
        categoryOther: state.categoryOther,
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
        gallery: state.gallery.map((item) => {
          const copy = { ...item };
          delete copy.file;
          return copy;
        }),
      }),
    },
  ),
);

/**
 * When the signed-in account changes (sign-out, sign-in, or straight from one
 * account to another), drop whatever is on screen and load the new account's
 * own draft, if it has one. The outgoing account's draft stays saved under its
 * own key for when it signs back in.
 */
export function switchDraftAccount() {
  writesPaused = true;
  try {
    useEventBuilderStore.setState(initialState);
  } finally {
    writesPaused = false;
  }
  void useEventBuilderStore.persist.rehydrate();
}

if (typeof window !== "undefined") {
  // Before this fix every account shared one unscoped key. Whose draft that
  // is can't be known, so it isn't handed to anyone: it is removed. A draft
  // that was saved to the server (it has a draftId) is still there.
  try {
    localStorage.removeItem(STORAGE_NAME);
  } catch {}

  useAuthStore.subscribe((state, prev) => {
    if (state.user?.id !== prev.user?.id) switchDraftAccount();
  });
}

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
