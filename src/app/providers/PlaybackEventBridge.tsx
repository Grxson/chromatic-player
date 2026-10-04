import { useEffect, type ReactNode } from "react";
import { usePlaybackBackend } from "./useMusicProvider";
import { usePlayback } from "@/hooks/usePlayback";
import { usePlayerStore } from "@/stores/player.store";

export function PlaybackEventBridge({ children }: { children: ReactNode }) {
  const backend = usePlaybackBackend();
  const { next } = usePlayback();

  useEffect(() => {
    if (!backend.subscribe) return;
    return backend.subscribe((event) => {
      const player = usePlayerStore.getState();
      if (event.type === "timeupdate" && event.position !== undefined) {
        player.setPosition(event.position);
      } else if (event.type === "durationchange" && event.duration !== undefined) {
        player.setDuration(event.duration);
      } else if (event.type === "play") {
        player.setStatus("playing");
      } else if (event.type === "pause" && player.status !== "loading" && player.currentTrack) {
        player.setStatus("paused");
      } else if (event.type === "ended") {
        void next();
      } else if (event.type === "error") {
        player.setError(event.error ?? "This track could not be played.");
      }
    });
  }, [backend, next]);

  return children;
}
