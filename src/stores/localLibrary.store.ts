import { create } from "zustand";
import type { Track } from "@/domain/entities";
import type { ImportedLocalTrack } from "@/infrastructure/local/localTrack";

interface LocalLibraryState {
  tracks: Track[];
  sources: Record<string, string>;
  addImported: (items: ImportedLocalTrack[]) => void;
  clear: () => void;
}

export const useLocalLibraryStore = create<LocalLibraryState>((set, get) => ({
  tracks: [],
  sources: {},
  addImported: (items) => {
    const existingIds = new Set(get().tracks.map((track) => track.id));
    const accepted = items.filter(({ track }) => !existingIds.has(track.id));
    set((state) => ({
      tracks: [...state.tracks, ...accepted.map(({ track }) => track)],
      sources: {
        ...state.sources,
        ...Object.fromEntries(
          accepted.map(({ track, audioUrl }) => [track.playbackRef!, audioUrl]),
        ),
      },
    }));
  },
  clear: () => {
    for (const source of Object.values(get().sources)) URL.revokeObjectURL(source);
    for (const track of get().tracks) {
      if (track.artworkUrl) URL.revokeObjectURL(track.artworkUrl);
    }
    set({ tracks: [], sources: {} });
  },
}));
