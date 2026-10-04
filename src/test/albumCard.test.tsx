import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Album } from "@/domain/entities";
import { AlbumCard } from "@/components/music/AlbumCard";

const album: Album = {
  id: "white-pony",
  title: "White Pony",
  artists: [{ id: "deftones", name: "Deftones" }],
  trackCount: 12,
  duration: 720,
  releaseDate: "2000-06-20",
};

afterEach(() => {
  document.body.innerHTML = "";
});

describe("AlbumCard", () => {
  it("renders album metadata and a non-broken artwork fallback", () => {
    render(<AlbumCard album={album} />);

    expect(screen.getByRole("button", { name: "Open album White Pony" })).toBeTruthy();
    expect(screen.getByText("Deftones · 2000")).toBeTruthy();
    expect(screen.getByRole("img", { name: "White Pony" })).toBeTruthy();
    expect(screen.queryByRole("img", { name: /broken/i })).toBeNull();
  });

  it("opens the album from the card and keeps Play as a separate action", () => {
    const onOpen = vi.fn();
    const onPlay = vi.fn();
    render(<AlbumCard album={album} onOpen={onOpen} onPlay={onPlay} />);

    fireEvent.click(screen.getByRole("button", { name: "Play White Pony" }));
    expect(onPlay).toHaveBeenCalledWith(album);
    expect(onOpen).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Open album White Pony" }));
    expect(onOpen).toHaveBeenCalledWith(album);
  });

  it("exposes album navigation as a keyboard-focusable button", () => {
    render(<AlbumCard album={album} onOpen={() => undefined} />);
    const openButton = screen.getByRole("button", { name: "Open album White Pony" });
    openButton.focus();
    expect(document.activeElement).toBe(openButton);
  });
});
