import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MusicProviderContext } from "@/app/providers/useMusicProvider";
import { AppShell } from "@/components/layout/AppShell";
import type { MusicProvider } from "@/domain/ports";

const provider = {
  name: "test",
  auth: { isAuthenticated: true },
  authenticate: async () => undefined,
  signOut: async () => undefined,
  search: async () => ({ query: "" }),
  getTrack: async () => {
    throw new Error("not used");
  },
  getAlbum: async () => {
    throw new Error("not used");
  },
  getArtist: async () => {
    throw new Error("not used");
  },
  getPlaylist: async () => {
    throw new Error("not used");
  },
  getAlbumTracks: async () => [],
  getArtistAlbums: async () => [],
  getPlaylistTracks: async () => [],
  play: async () => undefined,
  pause: async () => undefined,
  resume: async () => undefined,
  seek: async () => undefined,
  setVolume: async () => undefined,
} satisfies MusicProvider;

describe("AppShell layout", () => {
  it("allows the routed page column to shrink so Content can own scrolling", () => {
    const { getByTestId } = render(
      <MusicProviderContext.Provider value={{ provider }}>
        <AppShell
          currentView="home"
          onNavigate={() => undefined}
          onExpandPlayer={() => undefined}
          onOpenQueue={() => undefined}
        >
          <div data-testid="page">Page</div>
        </AppShell>
      </MusicProviderContext.Provider>,
    );

    const page = getByTestId("page");
    expect(page.parentElement?.className).toContain("flex-col");
    expect(page.parentElement?.parentElement?.className).toContain("min-h-0");
  });
});
