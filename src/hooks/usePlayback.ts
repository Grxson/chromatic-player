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
  /** Replaces the queue with `tracks` and starts playing `tracks[0]`. */
  playTracks: (tracks: Track[]) => Promise<void>;

  /** Sets `track` as a single-entry queue and starts playing it. */
  playTrack: (track: Track) => Promise<void>;

  /** Contextual playback. Replaces the queue with `tracks` and starts at `startIndex`. */
  playQueue: (tracks: Track[], startIndex: number) => Promise<void>;

  /** Jumps to the track at the given index in the current queue and plays it. */
  playQueueIndex: (index: number) => Promise<void>;

  /** Appends a single track to the end of the queue. */
  enqueue: (track: Track) => void;

  /** Removes a track from the queue by its index. Coordinates playback when removing the current track. */
  removeFromQueue: (index: number) => Promise<void>;

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

  /** Seeks the current track to `position` (seconds). Clamps to valid bounds. */
  seek: (position: number) => Promise<void>;

  /** Sets the player volume (0..1). Clamped. */
  setVolume: (volume: number) => Promise<void>;
}

/**
 * Centralises the synchronous pre-flight state changes (track, position,
 * duration, status -> loading) so the public methods stay short and the
 * error path is consistent.
 *
 * The transition is:
 *
 *   idle / paused / playing  ->  loading
 *
 * and then the caller awaits the provider and either resolves to
 * `playing` or falls back to `error` while keeping the requested track
 * visible.
 */
function prepareForTrack(track: Track): void {
  const store = usePlayerStore.getState();
  store.setCurrentTrack(track);
  store.setPosition(0);
  store.setDuration(track.duration);
  store.setStatus("loading");
  store.setError(null);
}

/**
 * Captures the relevant player state so callers can restore the
 * pre-transition snapshot if a downstream provider call fails.
 */
function snapshotPlayer(): {
  track: ReturnType<typeof usePlayerStore.getState>["currentTrack"];
  status: ReturnType<typeof usePlayerStore.getState>["status"];
  position: ReturnType<typeof usePlayerStore.getState>["position"];
  duration: ReturnType<typeof usePlayerStore.getState>["duration"];
  error: ReturnType<typeof usePlayerStore.getState>["error"];
} {
  const s = usePlayerStore.getState();
  return {
    track: s.currentTrack,
    status: s.status,
    position: s.position,
    duration: s.duration,
    error: s.error,
  };
}

function restorePlayer(snapshot: ReturnType<typeof snapshotPlayer>): void {
  const s = usePlayerStore.getState();
  s.setCurrentTrack(snapshot.track);
  s.setPosition(snapshot.position);
  s.setDuration(snapshot.duration);
  s.setStatus(snapshot.status);
  s.setError(snapshot.error);
}

/**
 * Loads `tracks[startIndex]` as the active track. The caller is
 * responsible for the initial queue swap (see {@link replaceQueueAndLoad}).
 */
async function dispatchTrack(
  track: Track,
  deps: {
    provider: ReturnType<typeof useMusicProvider>;
  },
): Promise<"ok" | "failed"> {
  prepareForTrack(track);
  try {
    await deps.provider.play(track);
    usePlayerStore.getState().setStatus("playing");
    return "ok";
  } catch (err) {
    // The requested track stays visible in the UI but `status` flips
    // to `error` so the user is not lied to about playback. The Queue
    // mutation already happened, so the cursor remains consistent with
    // what the queue actually contains.
    const message = err instanceof Error ? err.message : "Playback failed";
    usePlayerStore.getState().setError(message);
    console.error("playback.dispatchTrack failed", err);
    return "failed";
  }
}

/**
 * Replaces the queue with `tracks`, positions the cursor at
 * `startIndex` and starts playback. The two-step replace (enqueue
 * resets the cursor, then jumpTo moves it) keeps the queue store as
 * the single owner of the cursor.
 */
function replaceQueueAndLoad(
  tracks: Track[],
  startIndex: number,
  enqueueQueue: (tracks: Track[]) => void,
  jumpTo: (index: number) => Track | null,
  deps: {
    provider: ReturnType<typeof useMusicProvider>;
  },
): void {
  enqueueQueue(tracks);
  jumpTo(startIndex);
  // `jumpTo` returns the resulting track; if it is null we bail
  // out — `replaceQueueAndLoad` is only called when we already know
  // `startIndex` is valid for `tracks`.
  const first = tracks[startIndex];
  if (!first) {
    return;
  }
  void dispatchTrack(first, deps);
}

/**
 * usePlayback is the single coordination layer between the UI and the
 * provider. UI components must never call `MusicProvider.play` directly
 * and must never mutate `PlayerStore.currentTrack` on their own. They go
 * through this hook so the queue + player + provider stay synchronised.
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
  const setError = usePlayerStore((state) => state.setError);
  const setPosition = usePlayerStore((state) => state.setPosition);
  const setDuration = usePlayerStore((state) => state.setDuration);
  const setVolumeState = usePlayerStore((state) => state.setVolume);

  const enqueueQueue = useQueueStore((state) => state.enqueue);
  const jumpTo = useQueueStore((state) => state.jumpTo);
  const appendTrack = useQueueStore((state) => state.append);
  const moveNext = useQueueStore((state) => state.moveNext);
  const movePrevious = useQueueStore((state) => state.movePrevious);
  const removeAt = useQueueStore((state) => state.removeAt);
  const clearQueueStore = useQueueStore((state) => state.clear);
  const getCurrentTrack = useQueueStore((state) => state.getCurrentTrack);

  const playTrack = useCallback(
    async (track: Track) => {
      replaceQueueAndLoad([track], 0, enqueueQueue, jumpTo, { provider });
    },
    [enqueueQueue, jumpTo, provider],
  );

  const playTracks = useCallback(
    async (tracks: Track[]) => {
      if (tracks.length === 0) {
        return;
      }
      replaceQueueAndLoad(tracks, 0, enqueueQueue, jumpTo, { provider });
    },
    [enqueueQueue, jumpTo, provider],
  );

  const playQueue = useCallback(
    async (tracks: Track[], startIndex: number) => {
      if (tracks.length === 0) {
        return;
      }
      const safeIndex = Math.min(Math.max(0, startIndex), tracks.length - 1);
      replaceQueueAndLoad(tracks, safeIndex, enqueueQueue, jumpTo, { provider });
    },
    [enqueueQueue, jumpTo, provider],
  );

  const playQueueIndex = useCallback(
    async (index: number) => {
      const track = jumpTo(index);
      if (!track) {
        return;
      }
      await dispatchTrack(track, { provider });
    },
    [jumpTo, provider],
  );

  const enqueueTrack = useCallback(
    (track: Track) => {
      appendTrack(track);
    },
    [appendTrack],
  );

  const removeFromQueue = useCallback(
    async (index: number) => {
      const queue = useQueueStore.getState();
      const wasCurrent = index === queue.currentIndex;

      // Snapshot only the player state. The queue store mutation is
      // not rolled back; the removed track stays removed and the UI
      // adapts to the new shape.
      const snapshot = snapshotPlayer();
      removeAt(index);

      if (!wasCurrent) {
        // The cursor simply shifted (or stayed) inside the queue. The
        // player store already reflects the current track, so no
        // provider call is needed.
        return;
      }

      const afterQueue = useQueueStore.getState();
      const nextCurrent = afterQueue.getCurrentTrack();

      if (nextCurrent) {
        await dispatchTrack(nextCurrent, { provider });
        return;
      }

      // Queue is now empty. Pause the provider, reset the player.
      try {
        await provider.pause();
      } catch (err) {
        console.error("removeFromQueue pause failed", err);
      }
      void snapshot; // snapshot retained for potential future rollback paths
      setCurrentTrack(null);
      setPosition(0);
      setDuration(0);
      setError(null);
      setStatus("idle");
    },
    [provider, removeAt, setCurrentTrack, setDuration, setError, setPosition, setStatus],
  );

  const clearQueue = useCallback(async () => {
    const snapshot = snapshotPlayer();
    clearQueueStore();
    if (snapshot.track) {
      try {
        await provider.pause();
      } catch {
        /* ignore — provider pause failure should not block UI cleanup */
      }
    }
    setCurrentTrack(null);
    setPosition(0);
    setDuration(0);
    setError(null);
    setStatus("idle");
  }, [clearQueueStore, provider, setCurrentTrack, setDuration, setError, setPosition, setStatus]);

  const togglePlay = useCallback(async () => {
    const { status, currentTrack } = usePlayerStore.getState();
    const track = currentTrack ?? getCurrentTrack();
    if (!track) {
      return;
    }
    const before = snapshotPlayer();
    try {
      if (status === "playing") {
        await provider.pause();
        setStatus("paused");
        setError(null);
      } else {
        if (status === "idle") {
          await provider.play(track);
        } else {
          await provider.resume();
        }
        setStatus("playing");
        setError(null);
      }
    } catch (err) {
      restorePlayer(before);
      const message = err instanceof Error ? err.message : "Playback failed";
      setError(message);
      console.error("playback.togglePlay failed", err);
    }
  }, [getCurrentTrack, provider, setError, setStatus]);

  const pause = useCallback(async () => {
    const before = snapshotPlayer();
    try {
      await provider.pause();
      setStatus("paused");
      setError(null);
    } catch (err) {
      restorePlayer(before);
      const message = err instanceof Error ? err.message : "Playback failed";
      setError(message);
      console.error("playback.pause failed", err);
    }
  }, [provider, setError, setStatus]);

  const resume = useCallback(async () => {
    const before = snapshotPlayer();
    const current = usePlayerStore.getState().currentTrack ?? getCurrentTrack();
    if (!current) {
      return;
    }
    try {
      await provider.resume();
      setStatus("playing");
      setError(null);
    } catch (err) {
      restorePlayer(before);
      const message = err instanceof Error ? err.message : "Playback failed";
      setError(message);
      console.error("playback.resume failed", err);
    }
  }, [getCurrentTrack, provider, setError, setStatus]);

  const next = useCallback(async () => {
    const before = snapshotPlayer();
    const track = moveNext();
    if (!track) {
      // End of queue: pause the provider and keep the current track
      // visible — the cursor does not move past the end.
      try {
        await provider.pause();
      } catch (err) {
        console.error("playback.next pause failed", err);
      }
      setStatus("paused");
      setError(null);
      return;
    }
    await dispatchTrack(track, { provider });
    // dispatchTrack already handles success/failure for the provider call.
    void before;
  }, [moveNext, provider, setError, setStatus]);

  const previous = useCallback(async () => {
    const track = movePrevious();
    if (!track) {
      // At the start of the queue: rewind current position to 0.
      const before = snapshotPlayer();
      setPosition(0);
      try {
        await provider.seek(0);
        setError(null);
      } catch (err) {
        restorePlayer(before);
        const message = err instanceof Error ? err.message : "Seek failed";
        setError(message);
        console.error("playback.previous seek failed", err);
      }
      return;
    }
    await dispatchTrack(track, { provider });
  }, [movePrevious, provider, setError, setPosition]);

  const seek = useCallback(
    async (position: number) => {
      const { duration } = usePlayerStore.getState();
      // Clamp to [0, duration] when duration is known, otherwise >= 0.
      const clamped = Math.max(0, duration > 0 ? Math.min(position, duration) : position);
      const before = snapshotPlayer();
      setPosition(clamped);
      try {
        await provider.seek(clamped);
        setError(null);
      } catch (err) {
        // For seek we restore position so the UI does not pretend
        // the seek succeeded.
        setPosition(before.position);
        const message = err instanceof Error ? err.message : "Seek failed";
        setError(message);
        console.error("playback.seek failed", err);
      }
    },
    [provider, setError, setPosition],
  );

  const setVolume = useCallback(
    async (volume: number) => {
      const clamped = Math.min(1, Math.max(0, volume));
      setVolumeState(clamped);
      try {
        await provider.setVolume(clamped);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Volume failed";
        setError(message);
        console.error("playback.setVolume failed", err);
      }
    },
    [provider, setError, setVolumeState],
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
