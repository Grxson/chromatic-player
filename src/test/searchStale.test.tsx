import { act, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useState, type ReactNode } from "react";
import { MusicProviderContext } from "@/app/providers/useMusicProvider";
import type { MusicProvider } from "@/domain/ports";
import { RouterContext } from "@/app/router/useRouter";
import type { Route } from "@/app/router/router";
import { SearchPage } from "@/pages/SearchPage";

function ControlledRouter({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>({ type: "view", view: "search" });
  return (
    <RouterContext.Provider
      value={{
        route,
        navigate: (next) => {
          setRoute(next);
        },
      }}
    >
      {children}
    </RouterContext.Provider>
  );
}

/**
 * We avoid exercising the real `usePlayback` against the deferred provider.
 * `SearchPage` calls `playback.playTrack(...)` when a track is clicked,
 * which would race against the deferred `provider.search`. For this test
 * we only care about the search UI, so we mount a tiny no-op
 * `usePlayback` shim via a separate provider replacement.
 */
function NoopPlaybackHarness({
  provider,
  children,
}: {
  provider: MusicProvider;
  children: ReactNode;
}) {
  // The provider we want to test, but with a no-op playTrack mock so the
  // search results UI does not call into the deferred pipeline.
  const wrapped: MusicProvider = {
    ...provider,
    play: vi.fn(async () => undefined),
  };
  return (
    <MusicProviderContext.Provider value={{ provider: wrapped }}>
      <ControlledRouter>{children}</ControlledRouter>
    </MusicProviderContext.Provider>
  );
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("SearchPage stale-result handling", () => {
  it("keeps the latest results when an earlier query resolves later", async () => {
    let firstResolve: (value: Awaited<ReturnType<MusicProvider["search"]>>) => void = () =>
      undefined;
    let secondResolve: (value: Awaited<ReturnType<MusicProvider["search"]>>) => void = () =>
      undefined;

    const firstSearch = vi.fn(
      () =>
        new Promise<Awaited<ReturnType<MusicProvider["search"]>>>((resolve) => {
          firstResolve = resolve;
        }),
    );
    const secondSearch = vi.fn(
      () =>
        new Promise<Awaited<ReturnType<MusicProvider["search"]>>>((resolve) => {
          secondResolve = resolve;
        }),
    );

    const provider: MusicProvider = {
      name: "test",
      auth: { isAuthenticated: true },
      authenticate: async () => undefined,
      signOut: async () => undefined,
      search: ((query: string) => {
        if (query === "first") {
          return firstSearch();
        }
        return secondSearch();
      }) as MusicProvider["search"],
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
      play: vi.fn(async () => undefined),
      pause: vi.fn(async () => undefined),
      resume: vi.fn(async () => undefined),
      seek: vi.fn(async () => undefined),
      setVolume: vi.fn(async () => undefined),
    };

    const { getByPlaceholderText, queryByText } = render(
      <NoopPlaybackHarness provider={provider}>
        <SearchPage />
      </NoopPlaybackHarness>,
    );

    const input = getByPlaceholderText("Search tracks, albums, artists…") as HTMLInputElement;

    // Trigger the first search by typing the first character.
    await act(async () => {
      const native = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
      native?.set?.call(input, "first");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    // Wait for the debounce + dispatch.
    await new Promise((resolve) => setTimeout(resolve, 250));

    // While the first request is still pending, type the second query.
    await act(async () => {
      const native = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
      native?.set?.call(input, "second");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await new Promise((resolve) => setTimeout(resolve, 250));

    // Resolve them in REVERSE chronological order: first the new one,
    // then the stale one. Only the fresh result must be visible.
    await act(async () => {
      secondResolve({
        query: "second",
        tracks: [
          {
            id: "fresh-track",
            title: "Fresh",
            duration: 1,
            artist: { id: "a1", name: "Fresh Artist" },
          },
        ],
        albums: [],
      });
      firstResolve({
        query: "first",
        tracks: [
          {
            id: "stale-track",
            title: "Stale",
            duration: 1,
            artist: { id: "a1", name: "Stale Artist" },
          },
        ],
        albums: [],
      });
    });

    await waitFor(() => {
      expect(queryByText("Stale")).toBeNull();
    });
    // The fresh title must surface via the search results section.
    expect(queryByText("Fresh")).not.toBeNull();

    // 4 actions of search() were called across two debounce cycles.
    expect(firstSearch).toHaveBeenCalledTimes(1);
    expect(secondSearch).toHaveBeenCalledTimes(1);
  });
});
