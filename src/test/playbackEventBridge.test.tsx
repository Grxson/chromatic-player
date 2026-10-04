import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import type { PlaybackBackend, PlaybackEvent } from "@/domain/ports";
import type { Track } from "@/domain/entities";
import { PlaybackEventBridge } from "@/app/providers/PlaybackEventBridge";
import { MusicProviderContext, PlaybackBackendContext } from "@/app/providers/useMusicProvider";
import { MockMusicProvider } from "@/infrastructure/mock/MockMusicProvider";
import { usePlayback } from "@/hooks/usePlayback";
import { usePlayerStore } from "@/stores/player.store";
import { useQueueStore } from "@/stores/queue.store";

function track(id: string): Track {
  return {
    id,
    title: id,
    duration: 60,
    artist: { id: `${id}-artist`, name: `${id} artist` },
  };
}

function createBackend() {
  let publish: ((event: PlaybackEvent) => void) | undefined;
  const backend: PlaybackBackend = {
    play: vi.fn(async () => undefined),
    pause: vi.fn(async () => undefined),
    resume: vi.fn(async () => undefined),
    seek: vi.fn(async () => undefined),
    setVolume: vi.fn(async () => undefined),
    subscribe: (listener) => {
      publish = listener;
      return () => {
        publish = undefined;
      };
    },
  };
  return { backend, emit: (event: PlaybackEvent) => publish?.(event) };
}

function Harness() {
  const playback = usePlayback();
  return (
    <button type="button" onClick={() => void playback.playQueue([track("a"), track("b")], 0)}>
      Start queue
    </button>
  );
}

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <MusicProviderContext.Provider value={{ provider: new MockMusicProvider() }}>
      {children}
    </MusicProviderContext.Provider>
  );
}

afterEach(() => {
  usePlayerStore.getState().reset();
  useQueueStore.getState().clear();
});

describe("PlaybackEventBridge", () => {
  it("synchronizes real media events and advances the queue on ended", async () => {
    const { backend, emit } = createBackend();
    render(
      <PlaybackBackendContext.Provider value={backend}>
        <Wrapper>
          <PlaybackEventBridge>
            <Harness />
          </PlaybackEventBridge>
        </Wrapper>
      </PlaybackBackendContext.Provider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Start queue" }));
    await waitFor(() => expect(backend.play).toHaveBeenCalledTimes(1));
    expect(usePlayerStore.getState().status).toBe("playing");

    act(() => emit({ type: "timeupdate", position: 14 }));
    expect(usePlayerStore.getState().position).toBe(14);
    act(() => emit({ type: "durationchange", duration: 58 }));
    expect(usePlayerStore.getState().duration).toBe(58);

    act(() => emit({ type: "ended" }));
    await waitFor(() => expect(backend.play).toHaveBeenCalledTimes(2));
    expect(backend.play).toHaveBeenLastCalledWith(track("b"));
    expect(usePlayerStore.getState().currentTrack?.id).toBe("b");
  });

  it("surfaces backend errors as player errors", () => {
    const { backend, emit } = createBackend();
    render(
      <PlaybackBackendContext.Provider value={backend}>
        <Wrapper>
          <PlaybackEventBridge>
            <div />
          </PlaybackEventBridge>
        </Wrapper>
      </PlaybackBackendContext.Provider>,
    );

    act(() => emit({ type: "error", error: "Unable to decode this file." }));
    expect(usePlayerStore.getState().status).toBe("error");
    expect(usePlayerStore.getState().error).toBe("Unable to decode this file.");
  });
});
