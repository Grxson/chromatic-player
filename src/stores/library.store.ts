import { create } from "zustand";
import type { Playlist } from "@/domain/entities";

export interface LibraryState {
  likedTrackIds: string[];
  savedAlbumIds: string[];
  followedArtistIds: string[];
  playlists: Playlist[];

  toggleLikeTrack: (trackId: string) => void;
  toggleSaveAlbum: (albumId: string) => void;
  toggleFollowArtist: (artistId: string) => void;
  addPlaylist: (playlist: Playlist) => void;
  removePlaylist: (playlistId: string) => void;
}

const includesId = (list: string[], id: string): boolean => list.includes(id);

export const useLibraryStore = create<LibraryState>((set) => ({
  likedTrackIds: [],
  savedAlbumIds: [],
  followedArtistIds: [],
  playlists: [],

  toggleLikeTrack: (trackId) =>
    set((state) => ({
      likedTrackIds: includesId(state.likedTrackIds, trackId)
        ? state.likedTrackIds.filter((id) => id !== trackId)
        : [...state.likedTrackIds, trackId],
    })),
  toggleSaveAlbum: (albumId) =>
    set((state) => ({
      savedAlbumIds: includesId(state.savedAlbumIds, albumId)
        ? state.savedAlbumIds.filter((id) => id !== albumId)
        : [...state.savedAlbumIds, albumId],
    })),
  toggleFollowArtist: (artistId) =>
    set((state) => ({
      followedArtistIds: includesId(state.followedArtistIds, artistId)
        ? state.followedArtistIds.filter((id) => id !== artistId)
        : [...state.followedArtistIds, artistId],
    })),
  addPlaylist: (playlist) =>
    set((state) => ({
      playlists: [...state.playlists, playlist],
    })),
  removePlaylist: (playlistId) =>
    set((state) => ({
      playlists: state.playlists.filter((p) => p.id !== playlistId),
    })),
}));
