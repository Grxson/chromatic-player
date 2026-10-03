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
   * If `tracks` is empty this is a no-op.
   */
  playTracks: (tracks: Track[]) => Promise<void>;

  /**
   * Appends `track` to the queue without changing the current cursor.
   */
  enqueue: (track: Track) => void;

  /**
   * Loads `track` into the queue as the only entry and starts playback.
   */
  playTrack: (track: Track) => Promise<void>;

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

  const enqueue = useQueueStore((state) => state.enqueue);
  const appendTrack = useQueueStore((state) => state.append);
  const moveNext = useQueueStore((state) => state.moveNext);
  const movePrevious = useQueueStore((state) => state.movePrevious);
  const clear = useQueueStore((state) => state.clear);
  const getCurrentTrack = useQueueStore((state) => state.getCurrentTrack);

  const playTrack = useCallback(
    async (track: Track) => {
      enqueue([track]);
      setCurrentTrack(track);
      setPosition(0);
      setDuration(track.duration);
      await provider.play(track);
      setStatus("playing");
    },
    [enqueue, setCurrentTrack, setDuration, setPosition, setStatus, provider],
  );

  const playTracks = useCallback(
    async (tracks: Track[]) => {
      if (tracks.length === 0) {
        return;
      }
      const first = tracks[0]!;
      enqueue(tracks);
      setCurrentTrack(first);
      setPosition(0);
      setDuration(first.duration);
      await provider.play(first);
      setStatus("playing");
    },
    [enqueue, setCurrentTrack, setDuration, setPosition, setStatus, provider],
  );

  const enqueueTrack = useCallback(
    (track: Track) => {
      appendTrack(track);
    },
    [appendTrack],
  );

  const togglePlay = useCallback(async () => {
    const { status } = usePlayerStore.getState();
    const current = usePlayerStore.getState().currentTrack ?? getCurrentTrack();
    if (!current) {
      return;
    }
    if (status === "playing") {
      await provider.pause();
      setStatus("paused");
    } else {
      if (status === "idle") {
        await provider.play(current);
      } else {
        await provider.resume();
      }
      setStatus("playing");
    }
  }, [getCurrentTrack, provider, setStatus]);

  const pause = useCallback(async () => {
    await provider.pause();
    setStatus("paused");
  }, [provider, setStatus]);

  const resume = useCallback(async () => {
    const current = usePlayerStore.getState().currentTrack ?? getCurrentTrack();
    if (!current) {
      return;
    }
    await provider.resume();
    setStatus("playing");
  }, [getCurrentTrack, provider, setStatus]);

  const next = useCallback(async () => {
    const track = moveNext();
    if (!track) {
      // End of queue: stop playback but keep the current track visible.
      await provider.pause();
      setStatus("paused");
      return;
    }
    setCurrentTrack(track);
    setPosition(0);
    setDuration(track.duration);
    await provider.play(track);
    setStatus("playing");
  }, [moveNext, provider, setCurrentTrack, setDuration, setPosition, setStatus]);

  const previous = useCallback(async () => {
    const track = movePrevious();
    if (!track) {
      // At the start of the queue: rewind current to 0.
      setPosition(0);
      await provider.seek(0);
      return;
    }
    setCurrentTrack(track);
    setPosition(0);
    setDuration(track.duration);
    await provider.play(track);
    setStatus("playing");
  }, [movePrevious, provider, setCurrentTrack, setDuration, setPosition, setStatus]);

  const seek = useCallback(
    async (position: number) => {
      setPosition(position);
      await provider.seek(position);
    },
    [provider, setPosition],
  );

  const setVolume = useCallback(
    async (volume: number) => {
      setVolumeState(volume);
      await provider.setVolume(volume);
    },
    [provider, setVolumeState],
  );

  // Exposed for completeness in case a feature surface wants to wipe the
  // playback context (e.g. when signing out). Kept here so consumers do
  // not reach into the stores directly.
  void clear;

  return {
    playTracks,
    playTrack,
    enqueue: enqueueTrack,
    togglePlay,
    pause,
    resume,
    next,
    previous,
    seek,
    setVolume,
  };
}
