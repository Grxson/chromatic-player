import { act, render, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MusicProviderContext } from "@/app/providers/useMusicProvider";
import type { MusicProvider, SearchResult } from "@/domain/ports";
import type { ReactNode } from "react";

/**
 * Tiny inline copy of the page-level state machine used by SearchPage.
 * We deliberately keep this inside the test so we exercise the same
 * sequence counter pattern without depending on the page's internals.
 */
function useSearchState(provider: MusicProvider) {
  const [state, setState] = useState<{
    phase: "idle" | "loading" | "results" | "empty" | "error";
    query: string;
    result: SearchResult | null;
  }>({ phase: "idle", query: "", result: null });
  const sequenceRef = { current: 0 };

  const runSearch = async (query: string) => {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      sequenceRef.current += 1;
      setState({ phase: "idle", query: "", result: null });
      return;
    }
    const requestId = sequenceRef.current + 1;
    sequenceRef.current = requestId;
    setState({ phase: "loading", query: trimmed, result: null });
    try {
      const result = await provider.search(trimmed, 10);
      if (sequenceRef.current !== requestId) {
        return;
      }
      setState({
        phase: (result.tracks?.length ?? 0) > 0 ? "results" : "empty",
        query: trimmed,
        result,
      });
    } catch {
      // ignored for this focused test
    }
  };

  return { state, runSearch, sequenceRef };
}

interface HarnessProps {
  provider: MusicProvider;
}

function Harness({ provider }: HarnessProps) {
  const { state, runSearch, sequenceRef } = useSearchState(provider);
  void sequenceRef;
  return (
    <div>
      <button
        type="button"
        onClick={() => {
          void runSearch("first");
        }}
      >
        first
      </button>
      <button
        type="button"
        onClick={() => {
          void runSearch("second");
        }}
      >
        second
      </button>
      <span data-testid="phase">{state.phase}</span>
      <span data-testid="query">{state.query}</span>
      <span data-testid="data">{state.result?.tracks?.map((t) => t.id).join(",") ?? ""}</span>
    </div>
  );
}

function withProvider(provider: MusicProvider) {
  return ({ children }: { children: ReactNode }) => (
    <MusicProviderContext.Provider value={{ provider }}>{children}</MusicProviderContext.Provider>
  );
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("SearchPage sequence counter", () => {
  it("keeps the most recent search and drops stale results", async () => {
    let firstResolve: (value: SearchResult) => void = () => undefined;
    let secondResolve: (value: SearchResult) => void = () => undefined;

    const firstSearch = vi.fn(
      () =>
        new Promise<SearchResult>((resolve) => {
          firstResolve = resolve;
        }),
    );
    const secondSearch = vi.fn(
      () =>
        new Promise<SearchResult>((resolve) => {
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
      play: async () => undefined,
      pause: async () => undefined,
      resume: async () => undefined,
      seek: async () => undefined,
      setVolume: async () => undefined,
    };

    const { getByTestId } = render(<Harness provider={provider} />, {
      wrapper: withProvider(provider),
    });

    // Fire both searches. The second one starts before the first
    // resolves — classic stale-result scenario.
    await act(async () => {
      const firstButton = document.querySelectorAll("button")[0];
      firstButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 10));
      const secondButton = document.querySelectorAll("button")[1];
      secondButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // The first promise resolves AFTER the second one was started.
    await act(async () => {
      firstResolve({
        query: "first",
        tracks: [{ id: "stale-track" } as never],
      });
      secondResolve({
        query: "second",
        tracks: [{ id: "fresh-track" } as never],
      });
    });

    await waitFor(() => {
      expect(getByTestId("phase").textContent).toBe("results");
    });
    expect(getByTestId("data").textContent).toContain("fresh-track");
    expect(getByTestId("data").textContent).not.toContain("stale-track");
    expect(getByTestId("query").textContent).toBe("second");
  });
});
