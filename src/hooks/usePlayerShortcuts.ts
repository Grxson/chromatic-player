import { useEffect, useRef } from "react";
import type { Route } from "@/app/router/router";
import { usePlayback } from "@/hooks/usePlayback";
import { usePlayerStore } from "@/stores/player.store";
import { useMuteMemory } from "@/hooks/useMuteMemory";

export interface PlayerShortcutsOptions {
  /** Current route. Escape priority: queue first, fullscreen second. */
  route: Route;
  /** True when the Queue drawer is open. */
  queueOpen: boolean;
  /** Open the queue drawer. */
  onOpenQueue: () => void;
  /** Close the queue drawer. */
  onCloseQueue: () => void;
  /** Open the fullscreen player. */
  onOpenFullscreen: () => void;
  /** Close the fullscreen player. */
  onCloseFullscreen: () => void;
}

const SEEK_STEP_SECONDS = 5;

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
    return true;
  }
  if (target.isContentEditable) {
    return true;
  }
  return false;
}

/**
 * Wires the desktop keyboard shortcuts to the playback layer.
 *
 * Shortcuts:
 * - Space: toggle play / pause
 * - ArrowRight: seek +5s
 * - ArrowLeft: seek -5s
 * - M: mute / unmute (remembers previous volume via {@link useMuteMemory})
 * - F: open / close fullscreen
 * - Q: open / close queue drawer
 * - Escape: close queue first, then fullscreen
 *
 * Shortcuts are ignored when the focused element is an editable control
 * so typing in Search or any future input never triggers a transport
 * action.
 *
 * The handler reads the current `queueOpen` and `route` through refs so
 * successive key presses (e.g. two Escapes in a row) always see the
 * latest values without waiting for React to re-register the effect.
 */
export function usePlayerShortcuts({
  route,
  queueOpen,
  onOpenQueue,
  onCloseQueue,
  onOpenFullscreen,
  onCloseFullscreen,
}: PlayerShortcutsOptions): void {
  const playback = usePlayback();
  const mute = useMuteMemory();

  const queueOpenRef = useRef(queueOpen);
  const routeRef = useRef(route);
  const callbacksRef = useRef({
    onOpenQueue,
    onCloseQueue,
    onOpenFullscreen,
    onCloseFullscreen,
  });

  // Sync the refs with the latest props after render so the event
  // handler always reads the freshest values.
  useEffect(() => {
    queueOpenRef.current = queueOpen;
    routeRef.current = route;
    callbacksRef.current = {
      onOpenQueue,
      onCloseQueue,
      onOpenFullscreen,
      onCloseFullscreen,
    };
  }, [queueOpen, route, onOpenQueue, onCloseQueue, onOpenFullscreen, onCloseFullscreen]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (event.key === "Escape") {
        if (queueOpenRef.current) {
          event.preventDefault();
          callbacksRef.current.onCloseQueue();
          return;
        }
        if (routeRef.current.type === "fullscreen") {
          event.preventDefault();
          callbacksRef.current.onCloseFullscreen();
          return;
        }
        return;
      }

      if (isEditableTarget(event.target)) {
        return;
      }

      const player = usePlayerStore.getState();
      const hasTrack = player.currentTrack !== null;

      switch (event.key) {
        case " ": {
          if (!hasTrack) {
            return;
          }
          event.preventDefault();
          void playback.togglePlay();
          return;
        }
        case "ArrowRight": {
          if (!hasTrack) {
            return;
          }
          event.preventDefault();
          void playback.seek(player.position + SEEK_STEP_SECONDS);
          return;
        }
        case "ArrowLeft": {
          if (!hasTrack) {
            return;
          }
          event.preventDefault();
          void playback.seek(Math.max(0, player.position - SEEK_STEP_SECONDS));
          return;
        }
        case "f":
        case "F": {
          event.preventDefault();
          if (routeRef.current.type === "fullscreen") {
            callbacksRef.current.onCloseFullscreen();
          } else {
            callbacksRef.current.onOpenFullscreen();
          }
          return;
        }
        case "m":
        case "M": {
          event.preventDefault();
          void mute.toggle();
          return;
        }
        case "q":
        case "Q": {
          event.preventDefault();
          if (queueOpenRef.current) {
            callbacksRef.current.onCloseQueue();
          } else {
            callbacksRef.current.onOpenQueue();
          }
          return;
        }
        default:
          return;
      }
    };
    window.addEventListener("keydown", handler, { capture: true });
    return () => {
      window.removeEventListener("keydown", handler, { capture: true } as EventListenerOptions);
    };
  }, [playback, mute]);
}
