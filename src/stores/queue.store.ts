import { create } from "zustand";
import type { Track } from "@/domain/entities";

/**
 * QueueStore owns the playback queue. It is the single source of truth for
 * "what comes next". The provider has no knowledge of `next` / `previous`
 * — sequencing happens here so the application can stay in control
 * regardless of which backend is active.
 */
export interface QueueState {
  tracks: Track[];
  currentIndex: number;

  /** Replaces the queue with the given tracks. Starts at the first one. */
  enqueue: (tracks: Track[]) => void;

  /** Appends a single track to the end of the queue. */
  append: (track: Track) => void;

  /** Removes a track at the given index, keeping `currentIndex` valid. */
  removeAt: (index: number) => void;

  /** Empties the queue and resets the cursor. */
  clear: () => void;

  /** Advances the cursor by one if possible. Returns the new track, if any. */
  moveNext: () => Track | null;

  /** Moves the cursor back by one if possible. Returns the new track, if any. */
  movePrevious: () => Track | null;

  /** Skips to the track at the given index. Returns the track if valid. */
  jumpTo: (index: number) => Track | null;

  /** Returns true when there is a track after the cursor. */
  hasNext: () => boolean;

  /** Returns true when there is a track before the cursor. */
  hasPrevious: () => boolean;

  /** Returns the current track or null when the queue is empty. */
  getCurrentTrack: () => Track | null;
}

const EMPTY_TRACK: Track | null = null;

export const useQueueStore = create<QueueState>((set, get) => ({
  tracks: [],
  currentIndex: -1,

  enqueue: (tracks) =>
    set({
      tracks,
      currentIndex: tracks.length > 0 ? 0 : -1,
    }),

  append: (track) =>
    set((state) => ({
      tracks: [...state.tracks, track],
    })),

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

  moveNext: () => {
    const state = get();
    const nextIndex = state.currentIndex + 1;
    if (nextIndex >= state.tracks.length) {
      return EMPTY_TRACK;
    }
    set({ currentIndex: nextIndex });
    return state.tracks[nextIndex] ?? null;
  },

  movePrevious: () => {
    const state = get();
    const prevIndex = state.currentIndex - 1;
    if (prevIndex < 0) {
      return EMPTY_TRACK;
    }
    set({ currentIndex: prevIndex });
    return state.tracks[prevIndex] ?? null;
  },

  jumpTo: (index) => {
    const state = get();
    const track = state.tracks[index];
    if (!track) {
      return EMPTY_TRACK;
    }
    set({ currentIndex: index });
    return track;
  },

  hasNext: () => {
    const state = get();
    return state.currentIndex + 1 < state.tracks.length;
  },

  hasPrevious: () => {
    const state = get();
    return state.currentIndex > 0;
  },

  getCurrentTrack: () => {
    const state = get();
    if (state.currentIndex < 0 || state.currentIndex >= state.tracks.length) {
      return null;
    }
    return state.tracks[state.currentIndex] ?? null;
  },
}));
