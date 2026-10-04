import { describe, expect, it, vi } from "vitest";
import type { Track } from "@/domain/entities";
import { LocalPlaybackBackend } from "@/infrastructure/local/LocalPlaybackBackend";

function createAudio() {
  const handlers = new Map<string, EventListener>();
  const audio = {
    src: "",
    currentTime: 0,
    duration: 40,
    volume: 1,
    preload: "",
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    load: vi.fn(),
    removeAttribute: vi.fn((name: string) => {
      if (name === "src") audio.src = "";
    }),
    addEventListener: vi.fn((name: string, handler: EventListener) => handlers.set(name, handler)),
    removeEventListener: vi.fn((name: string) => handlers.delete(name)),
    emit: (name: string) => handlers.get(name)?.(new Event(name)),
  };
  return audio as unknown as HTMLAudioElement & { emit: (name: string) => void };
}

const localTrack: Track = {
  id: "local:1",
  playbackRef: "local:1",
  title: "Local song",
  duration: 38,
  artist: { id: "artist:1", name: "Artist" },
};

describe("LocalPlaybackBackend", () => {
  it("loads a local source and starts actual media playback", async () => {
    const audio = createAudio();
    const backend = new LocalPlaybackBackend(
      (ref) => (ref === "local:1" ? "blob:audio" : undefined),
      () => audio,
    );

    await backend.play(localTrack);

    expect(audio.src).toBe("blob:audio");
    expect(audio.load).toHaveBeenCalledOnce();
    expect(audio.play).toHaveBeenCalledOnce();
  });

  it("rejects tracks without a resolvable local source instead of simulating playback", async () => {
    const audio = createAudio();
    const backend = new LocalPlaybackBackend(
      () => undefined,
      () => audio,
    );

    await expect(backend.play({ ...localTrack, playbackRef: undefined })).rejects.toThrow(
      "TIDAL playback is unavailable",
    );
    expect(audio.play).not.toHaveBeenCalled();
  });

  it("delegates pause, resume, seek, and normalized volume to the audio element", async () => {
    const audio = createAudio();
    const backend = new LocalPlaybackBackend(
      () => "blob:audio",
      () => audio,
    );

    await backend.play(localTrack);
    await backend.pause();
    await backend.resume();
    await backend.seek(12);
    await backend.setVolume(0.35);

    expect(audio.pause).toHaveBeenCalledTimes(2);
    expect(audio.play).toHaveBeenCalledTimes(2);
    expect(audio.currentTime).toBe(12);
    expect(audio.volume).toBe(0.35);
  });

  it("forwards real time and ended events, and removes listeners on dispose", () => {
    const audio = createAudio();
    const backend = new LocalPlaybackBackend(
      () => "blob:audio",
      () => audio,
    );
    const listener = vi.fn();
    const unsubscribe = backend.subscribe(listener);

    audio.currentTime = 7;
    audio.emit("timeupdate");
    audio.emit("ended");
    expect(listener).toHaveBeenNthCalledWith(1, { type: "timeupdate", position: 7 });
    expect(listener).toHaveBeenNthCalledWith(2, { type: "ended" });

    unsubscribe();
    backend.dispose();
    expect(audio.removeEventListener).toHaveBeenCalled();
  });
});
