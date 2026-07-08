import { create } from "zustand";
import { ListingType } from "@/features/asset/data/listingBuilderData";

interface ListingBuilderState {
  // Listing Type
  activeType: ListingType;

  // Listing Details
  title: string;
  description: string;
  category: string;
  customCategory: string;
  price: number;
  unit: string;
  condition: string;
  status: string;
  image: string;

  // Cancellation Policy
  cancellationPolicyId: string | null;

  // UI State
  showGuide: boolean;
  isSubmitting: boolean;

  // Actions
  setActiveType: (type: ListingType) => void;
  setTitle: (title: string) => void;
  setDescription: (desc: string) => void;
  setCategory: (cat: string) => void;
  setCustomCategory: (cat: string) => void;
  setPrice: (price: number) => void;
  setUnit: (unit: string) => void;
  setCondition: (condition: string) => void;
  setStatus: (status: string) => void;
  setImage: (url: string) => void;
  setCancellationPolicyId: (id: string | null) => void;
  setShowGuide: (show: boolean) => void;
  setIsSubmitting: (submitting: boolean) => void;

  // Initialize based on type
  initializeForType: (type: ListingType) => void;
  reset: () => void;
}

const getInitialState = (type: ListingType = "inventory") => ({
  activeType: type,
  title: "",
  description: "",
  category: "",
  customCategory: "",
  price: 0,
  unit: type === "service" ? "Per Hour" : "Per Item / Day",
  condition: "good",
  status: "draft",
  image: "",
  cancellationPolicyId: null as string | null,
  showGuide: true,
  isSubmitting: false,
});

export const useListingBuilderStore = create<ListingBuilderState>((set) => ({
  ...getInitialState(),

  setActiveType: (type) => set({ activeType: type }),
  setTitle: (title) => set({ title }),
  setDescription: (desc) => set({ description: desc }),
  setCategory: (cat) => set({ category: cat }),
  setCustomCategory: (cat) => set({ customCategory: cat }),
  setPrice: (price) => set({ price }),
  setUnit: (unit) => set({ unit }),
  setCondition: (condition) => set({ condition }),
  setStatus: (status) => set({ status }),
  setImage: (url) => set({ image: url }),
  setCancellationPolicyId: (id) => set({ cancellationPolicyId: id }),
  setShowGuide: (show) => set({ showGuide: show }),
  setIsSubmitting: (submitting) => set({ isSubmitting: submitting }),

  initializeForType: (type) => set(getInitialState(type)),
  reset: () => set(getInitialState()),
}));

// Selectors
export const useListingDetails = () =>
  useListingBuilderStore((state) => ({
    title: state.title,
    description: state.description,
    category: state.category,
    customCategory: state.customCategory,
    price: state.price,
    unit: state.unit,
    condition: state.condition,
    status: state.status,
    image: state.image,
    cancellationPolicyId: state.cancellationPolicyId,
  }));

export const useListingUI = () =>
  useListingBuilderStore((state) => ({
    showGuide: state.showGuide,
    isSubmitting: state.isSubmitting,
    activeType: state.activeType,
  }));
