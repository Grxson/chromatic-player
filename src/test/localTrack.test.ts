import { beforeEach, describe, expect, it, vi } from "vitest";

const parseBlob = vi.hoisted(() => vi.fn());
vi.mock("music-metadata", () => ({ parseBlob }));

import { isSupportedAudioFile, mapLocalFile } from "@/infrastructure/local/localTrack";

describe("local track import", () => {
  beforeEach(() => {
    parseBlob.mockReset();
    parseBlob.mockResolvedValue({ common: {}, format: {} });
    vi.stubGlobal("crypto", { randomUUID: () => "test-track-id" });
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:local-audio"),
    });
  });

  it("accepts the requested audio file extensions and rejects unrelated files", () => {
    for (const extension of ["mp3", "flac", "wav", "m4a", "aac", "ogg"]) {
      expect(isSupportedAudioFile(new File([], `track.${extension}`))).toBe(true);
    }
    expect(isSupportedAudioFile(new File([], "cover.jpg", { type: "image/jpeg" }))).toBe(false);
  });

  it("uses filename and safe artist/album fallbacks when tags are absent", async () => {
    const imported = await mapLocalFile(new File(["audio"], "Morning.mp3", { type: "audio/mpeg" }));

    expect(imported.track).toMatchObject({
      id: "local:test-track-id",
      playbackRef: "local:test-track-id",
      title: "Morning",
      duration: 0,
      artist: { name: "Unknown Artist" },
    });
    expect(imported.track.album).toMatchObject({ title: "Unknown Album" });
    expect(imported.audioUrl).toBe("blob:local-audio");
  });

  it("maps embedded tags, duration, track number, and artwork", async () => {
    parseBlob.mockResolvedValue({
      common: {
        title: "Tagged title",
        artist: "Tagged artist",
        album: "Tagged album",
        track: { no: 3 },
        picture: [{ data: new Uint8Array([1, 2, 3]), format: "image/jpeg" }],
      },
      format: { duration: 182.5 },
    });

    const imported = await mapLocalFile(new File(["audio"], "file.flac"));

    expect(imported.track).toMatchObject({
      title: "Tagged title",
      duration: 182.5,
      trackNumber: 3,
      artist: { name: "Tagged artist" },
      album: { title: "Tagged album", artworkUrl: "blob:local-audio" },
      artworkUrl: "blob:local-audio",
    });
  });

  it("rejects unsupported file types before parsing metadata", async () => {
    await expect(mapLocalFile(new File(["not audio"], "notes.txt"))).rejects.toThrow(
      "Unsupported audio format",
    );
    expect(parseBlob).not.toHaveBeenCalled();
  });
});
