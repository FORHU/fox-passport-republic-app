import { create } from "zustand";

interface ReviewSelectState {
  searchQuery: string;
  locationQuery: string;
  setSearchQuery: (query: string) => void;
  setLocationQuery: (query: string) => void;
}

export const useReviewSelectStore = create<ReviewSelectState>((set) => ({
  searchQuery: "",
  locationQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  setLocationQuery: (query) => set({ locationQuery: query }),
}));

interface WriteReviewState {
  rating: number;
  hoveredRating: number;
  reviewText: string;
  selectedCategories: string[];

  setRating: (rating: number) => void;
  setHoveredRating: (rating: number) => void;
  setReviewText: (text: string) => void;
  toggleCategory: (category: string) => void;
  reset: () => void;
}

export const useWriteReviewStore = create<WriteReviewState>((set) => ({
  rating: 0,
  hoveredRating: 0,
  reviewText: "",
  selectedCategories: [],

  setRating: (rating) => set({ rating }),
  setHoveredRating: (rating) => set({ hoveredRating: rating }),
  setReviewText: (text) => set({ reviewText: text }),
  toggleCategory: (category) =>
    set((state) => ({
      selectedCategories: state.selectedCategories.includes(category)
        ? state.selectedCategories.filter((c) => c !== category)
        : [...state.selectedCategories, category],
    })),
  reset: () =>
    set({
      rating: 0,
      hoveredRating: 0,
      reviewText: "",
      selectedCategories: [],
    }),
}));
