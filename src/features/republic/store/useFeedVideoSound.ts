import { create } from "zustand";

/**
 * Whether feed videos play with sound. They start muted (browsers only allow
 * muted autoplay); unmuting one keeps sound on for the next ones while you
 * scroll, like Instagram. Memory only, so a reload starts muted again.
 */
interface FeedVideoSound {
  muted: boolean;
  setMuted: (muted: boolean) => void;
}

export const useFeedVideoSound = create<FeedVideoSound>((set) => ({
  muted: true,
  setMuted: (muted) => set({ muted }),
}));
