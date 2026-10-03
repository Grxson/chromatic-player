import { create } from "zustand";
import type { Track } from "@/domain/entities";

export interface QueueState {
  tracks: Track[];
  currentIndex: number;
  enqueue: (tracks: Track[]) => void;
  append: (track: Track) => void;
  removeAt: (index: number) => void;
  clear: () => void;
  setCurrentIndex: (index: number) => void;
}

export const useQueueStore = create<QueueState>((set) => ({
  tracks: [],
  currentIndex: -1,
  enqueue: (tracks) => set({ tracks, currentIndex: tracks.length > 0 ? 0 : -1 }),
  append: (track) => set((state) => ({ tracks: [...state.tracks, track] })),
  removeAt: (index) =>
    set((state) => {
      const tracks = state.tracks.filter((_, i) => i !== index);
      let currentIndex = state.currentIndex;
      if (index < currentIndex) {
        currentIndex -= 1;
      } else if (index === currentIndex) {
        currentIndex = tracks.length > 0 ? Math.min(index, tracks.length - 1) : -1;
      }
      return { tracks, currentIndex };
    }),
  clear: () => set({ tracks: [], currentIndex: -1 }),
  setCurrentIndex: (currentIndex) => set({ currentIndex }),
}));
