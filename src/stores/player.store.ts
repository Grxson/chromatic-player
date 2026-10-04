import { create } from "zustand";
import type { Track } from "@/domain/entities";

export type PlayerStatus = "idle" | "loading" | "playing" | "paused" | "error";

export interface PlayerState {
  currentTrack: Track | null;
  status: PlayerStatus;
  /** Short human-readable reason when `status === "error"`. No stack traces. */
  error: string | null;
  volume: number;
  position: number; // seconds
  duration: number; // seconds
  setCurrentTrack: (track: Track | null) => void;
  setStatus: (status: PlayerStatus) => void;
  setError: (error: string | null) => void;
  setVolume: (volume: number) => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  reset: () => void;
}

const INITIAL_VOLUME = 0.8;

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTrack: null,
  status: "idle",
  error: null,
  volume: INITIAL_VOLUME,
  position: 0,
  duration: 0,
  setCurrentTrack: (currentTrack) => set({ currentTrack }),
  setStatus: (status) =>
    set((state) => ({
      status,
      error: status === "error" ? state.error : null,
    })),
  setError: (error) =>
    set((state) => ({
      error,
      status: error === null ? state.status : "error",
    })),
  setVolume: (volume) => set({ volume: Math.min(1, Math.max(0, volume)) }),
  setPosition: (position) => set({ position: Math.max(0, position) }),
  setDuration: (duration) => set({ duration: Math.max(0, duration) }),
  reset: () =>
    set({
      currentTrack: null,
      status: "idle",
      error: null,
      position: 0,
      duration: 0,
    }),
}));
