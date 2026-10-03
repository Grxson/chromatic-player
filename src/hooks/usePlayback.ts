import { useCallback } from "react";
import type { Track } from "@/domain/entities";
import { useMusicProvider } from "@/app/providers/useMusicProvider";
import { usePlayerStore } from "@/stores/player.store";
import { useQueueStore } from "@/stores/queue.store";

/**
 * Hook returned by `usePlayback`.
 *
 * Methods are stable (memoised) to make them safe to pass directly to
 * presentational components without forcing re-renders.
 */
export interface PlaybackController {
  /**
   * Replaces the queue with `tracks` and starts playing `tracks[0]`.
   * Useful when callers don't have an obvious start index (e.g. flat
   * "play all" actions).
   */
  playTracks: (tracks: Track[]) => Promise<void>;

  /**
   * Sets `track` as a single-entry queue and starts playing it. Kept for
   * contexts where there is no natural continuation — isolated search
   * results, the fullscreen "play this" button, etc.
   */
  playTrack: (track: Track) => Promise<void>;

  /**
   * Contextual playback. Replaces the queue with `tracks`, starts at
   * `startIndex` and plays that track. This is what Album, Artist,
   * Playlist and most list-style sources use so that Next/Previous flow
   * naturally through the surrounding tracks.
   */
  playQueue: (tracks: Track[], startIndex: number) => Promise<void>;

  /**
   * Jumps to the track at the given index in the current queue and
   * starts playing it. Used by the Queue drawer when the user clicks a
   * row that is not the current one.
   */
  playQueueIndex: (index: number) => Promise<void>;

  /** Appends a single track to the end of the queue. */
  enqueue: (track: Track) => void;

  /** Removes a track from the queue by its index. */
  removeFromQueue: (index: number) => void;

  /** Empties the queue and stops playback. */
  clearQueue: () => Promise<void>;

  /** Toggles between `playing` and `paused` for the current track. */
  togglePlay: () => Promise<void>;

  /** Pauses the current track. */
  pause: () => Promise<void>;

  /** Resumes the current track if there is one. */
  resume: () => Promise<void>;

  /** Advances the queue by one. No-op at the end of the queue. */
  next: () => Promise<void>;

  /** Moves the queue back by one. No-op at the start of the queue. */
  previous: () => Promise<void>;

  /** Seeks the current track to `position` (seconds). */
  seek: (position: number) => Promise<void>;

  /** Sets the player volume (0..1). */
  setVolume: (volume: number) => Promise<void>;
}

/**
 * Internal helper. Centralises the synchronous pre-flight state changes
 * (track, position, duration, status -> loading) so the public methods
 * stay short and the error path is consistent.
 */
function prepareForTrack(track: Track): void {
  usePlayerStore.getState().setCurrentTrack(track);
  usePlayerStore.getState().setPosition(0);
  usePlayerStore.getState().setDuration(track.duration);
  usePlayerStore.getState().setStatus("loading");
}

/**
 * usePlayback is the single coordination layer between the UI and the
 * provider. UI components must never call `MusicProvider.play` directly
 * and must never mutate `PlayerStore.currentTrack` on their own. They go
 * through this hook so the queue + player + provider stay synchronised.
 *
 * Responsibilities:
 *
 *   UI components
 *     ↓
 *   usePlayback (this hook)
 *     ↓
 *   QueueStore  +  PlayerStore  +  MusicProvider
 *
 * The hook is intentionally simple. There is no observable layer, no
 * event bus and no DI machinery.
 */
export function usePlayback(): PlaybackController {
  const provider = useMusicProvider();
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const setStatus = usePlayerStore((state) => state.setStatus);
  const setPosition = usePlayerStore((state) => state.setPosition);
  const setDuration = usePlayerStore((state) => state.setDuration);
  const setVolumeState = usePlayerStore((state) => state.setVolume);

  const enqueueQueue = useQueueStore((state) => state.enqueue);
  const appendTrack = useQueueStore((state) => state.append);
  const moveNext = useQueueStore((state) => state.moveNext);
  const movePrevious = useQueueStore((state) => state.movePrevious);
  const removeAt = useQueueStore((state) => state.removeAt);
  const clearQueueStore = useQueueStore((state) => state.clear);
  const getCurrentTrack = useQueueStore((state) => state.getCurrentTrack);

  const playTrack = useCallback(
    async (track: Track) => {
      enqueueQueue([track]);
      prepareForTrack(track);
      try {
        await provider.play(track);
        setStatus("playing");
      } catch (err) {
        setStatus("error");
        // Surface the failure in the dev console without throwing.
        console.error("playback.playTrack failed", err);
      }
    },
    [enqueueQueue, setStatus, provider],
  );

  const playTracks = useCallback(
    async (tracks: Track[]) => {
      if (tracks.length === 0) {
        return;
      }
      await playTrackInternal(tracks, 0, {
        enqueueQueue,
        provider,
        setStatus,
      });
    },
    [enqueueQueue, provider, setStatus],
  );

  const playQueue = useCallback(
    async (tracks: Track[], startIndex: number) => {
      if (tracks.length === 0) {
        return;
      }
      const safeIndex = Math.min(Math.max(0, startIndex), tracks.length - 1);
      await playTrackInternal(tracks, safeIndex, {
        enqueueQueue,
        provider,
        setStatus,
      });
    },
    [enqueueQueue, provider, setStatus],
  );

  const playQueueIndex = useCallback(
    async (index: number) => {
      const track = useQueueStore.getState().tracks[index];
      if (!track) {
        return;
      }
      prepareForTrack(track);
      try {
        await provider.play(track);
        setStatus("playing");
      } catch (err) {
        setStatus("error");
        console.error("playback.playQueueIndex failed", err);
      }
    },
    [provider, setStatus],
  );

  const enqueueTrack = useCallback(
    (track: Track) => {
      appendTrack(track);
    },
    [appendTrack],
  );

  const removeFromQueue = useCallback(
    (index: number) => {
      removeAt(index);
    },
    [removeAt],
  );

  const clearQueue = useCallback(async () => {
    clearQueueStore();
    const { currentTrack } = usePlayerStore.getState();
    if (currentTrack) {
      try {
        await provider.pause();
      } catch {
        /* ignore — provider pause failure should not block UI cleanup */
      }
    }
    setCurrentTrack(null);
    setPosition(0);
    setDuration(0);
    setStatus("idle");
  }, [clearQueueStore, provider, setCurrentTrack, setDuration, setPosition, setStatus]);

  const togglePlay = useCallback(async () => {
    const { status, currentTrack } = usePlayerStore.getState();
    const track = currentTrack ?? getCurrentTrack();
    if (!track) {
      return;
    }
    try {
      if (status === "playing") {
        await provider.pause();
        setStatus("paused");
      } else {
        if (status === "idle") {
          await provider.play(track);
        } else {
          await provider.resume();
        }
        setStatus("playing");
      }
    } catch (err) {
      setStatus("error");
      console.error("playback.togglePlay failed", err);
    }
  }, [getCurrentTrack, provider, setStatus]);

  const pause = useCallback(async () => {
    try {
      await provider.pause();
      setStatus("paused");
    } catch (err) {
      setStatus("error");
      console.error("playback.pause failed", err);
    }
  }, [provider, setStatus]);

  const resume = useCallback(async () => {
    const current = usePlayerStore.getState().currentTrack ?? getCurrentTrack();
    if (!current) {
      return;
    }
    try {
      await provider.resume();
      setStatus("playing");
    } catch (err) {
      setStatus("error");
      console.error("playback.resume failed", err);
    }
  }, [getCurrentTrack, provider, setStatus]);

  const next = useCallback(async () => {
    const track = moveNext();
    if (!track) {
      try {
        await provider.pause();
      } catch (err) {
        console.error("playback.next pause failed", err);
      }
      setStatus("paused");
      return;
    }
    prepareForTrack(track);
    try {
      await provider.play(track);
      setStatus("playing");
    } catch (err) {
      setStatus("error");
      console.error("playback.next failed", err);
    }
  }, [moveNext, provider, setStatus]);

  const previous = useCallback(async () => {
    const track = movePrevious();
    if (!track) {
      setPosition(0);
      try {
        await provider.seek(0);
      } catch (err) {
        console.error("playback.previous seek failed", err);
      }
      return;
    }
    prepareForTrack(track);
    try {
      await provider.play(track);
      setStatus("playing");
    } catch (err) {
      setStatus("error");
      console.error("playback.previous failed", err);
    }
  }, [movePrevious, provider, setStatus, setPosition]);

  const seek = useCallback(
    async (position: number) => {
      setPosition(position);
      try {
        await provider.seek(position);
      } catch (err) {
        console.error("playback.seek failed", err);
      }
    },
    [provider, setPosition],
  );

  const setVolume = useCallback(
    async (volume: number) => {
      setVolumeState(volume);
      try {
        await provider.setVolume(volume);
      } catch (err) {
        console.error("playback.setVolume failed", err);
      }
    },
    [provider, setVolumeState],
  );

  return {
    playTracks,
    playTrack,
    playQueue,
    playQueueIndex,
    enqueue: enqueueTrack,
    removeFromQueue,
    clearQueue,
    togglePlay,
    pause,
    resume,
    next,
    previous,
    seek,
    setVolume,
  };
}

/**
 * Internal: shared path used by `playTracks` and `playQueue`. Encapsulates
 * the queue swap, the pre-flight state and the provider call with error
 * handling so both entry points behave identically.
 */
async function playTrackInternal(
  tracks: Track[],
  startIndex: number,
  deps: {
    enqueueQueue: (tracks: Track[]) => void;
    provider: ReturnType<typeof useMusicProvider>;
    setStatus: (status: "idle" | "loading" | "playing" | "paused" | "error") => void;
  },
): Promise<void> {
  const first = tracks[startIndex];
  if (!first) {
    return;
  }
  deps.enqueueQueue(tracks);
  // After enqueue, currentIndex is 0. Jump to the requested startIndex
  // BEFORE preparing the track so the queue store stays consistent.
  useQueueStore.setState({ currentIndex: startIndex });
  prepareForTrack(first);
  try {
    await deps.provider.play(first);
    deps.setStatus("playing");
  } catch (err) {
    deps.setStatus("error");
    console.error("playback.playQueue failed", err);
  }
}
