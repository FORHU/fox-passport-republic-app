import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Feed video sound. Videos start muted (browsers only allow muted autoplay);
 * unmuting one keeps sound on for the next ones while you scroll, like
 * Instagram. `muted` is memory only, so a reload starts muted again; the
 * volume level is kept in this browser.
 *
 * Like YouTube, `volume` is never 0: setting it to 0 mutes and keeps the last
 * level, so unmuting brings that level back.
 */
interface FeedVideoSound {
  muted: boolean;
  /** 0–1, never 0. */
  volume: number;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
}

export const useFeedVideoSound = create<FeedVideoSound>()(
  persist(
    (set) => ({
      muted: true,
      volume: 1,
      setMuted: (muted) => set({ muted }),
      setVolume: (volume) =>
        set(
          volume > 0
            ? { volume: Math.min(volume, 1), muted: false }
            : { muted: true },
        ),
    }),
    {
      name: "feed-video-volume",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ volume: state.volume }),
      // `video.volume` throws outside 0–1: ignore a bad saved value.
      merge: (persisted, current) => {
        const volume = (persisted as { volume?: unknown } | undefined)?.volume;
        return typeof volume === "number" && volume > 0 && volume <= 1
          ? { ...current, volume }
          : current;
      },
    },
  ),
);
