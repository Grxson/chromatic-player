import { useCallback, useEffect, useRef } from "react";
import { usePlayerStore } from "@/stores/player.store";
import { usePlayback } from "@/hooks/usePlayback";

/**
 * useMuteMemory lets the user toggle mute without losing the previous
 * volume level. Pressing M while volume > 0 stashes the value and sets
 * volume to 0; pressing M again restores the stashed value (or the
 * store's `volume` if no prior stash exists).
 *
 * The stash lives in a ref so it survives re-renders without
 * participating in store state.
 */
export interface MuteController {
  muted: boolean;
  toggle: () => Promise<void>;
}

const DEFAULT_RESTORE_VOLUME = 0.8;

export function useMuteMemory(): MuteController {
  const playback = usePlayback();
  const previousRef = useRef<number | null>(null);

  // Keep the ref aligned with the store volume so external volume
  // changes (slider, programmatic) don't surprise the mute toggle.
  useEffect(() => {
    return usePlayerStore.subscribe((state, prev) => {
      if (state.volume !== prev.volume && state.volume > 0) {
        previousRef.current = state.volume;
      }
    });
  }, []);

  const toggle = useCallback(async () => {
    const current = usePlayerStore.getState().volume;
    if (current > 0) {
      // Going to muted.
      previousRef.current = current;
      usePlayerStore.getState().setVolume(0);
      await playback.setVolume(0);
      return;
    }
    // Restoring. We do NOT touch previousRef before reading it.
    const restore = previousRef.current ?? DEFAULT_RESTORE_VOLUME;
    previousRef.current = null;
    usePlayerStore.getState().setVolume(restore);
    await playback.setVolume(restore);
  }, [playback]);

  const muted = usePlayerStore((state) => state.volume === 0);

  return { muted, toggle };
}
