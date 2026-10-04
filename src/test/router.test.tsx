import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RouterProvider } from "@/app/router/RouterProvider";
import { useRouter } from "@/app/router/useRouter";

function RouteProbe() {
  const { route, navigate } = useRouter();
  return (
    <div>
      <output>{route.type === "album" ? `${route.type}:${route.id}` : route.type}</output>
      <button type="button" onClick={() => navigate({ type: "album", id: "white pony" })}>
        Open album
      </button>
    </div>
  );
}

afterEach(() => {
  window.history.replaceState(null, "", window.location.pathname);
});

describe("RouterProvider deep routes", () => {
  it("restores an album route from the URL hash", () => {
    window.history.replaceState(null, "", "#/album/white-pony");
    render(
      <RouterProvider>
        <RouteProbe />
      </RouterProvider>,
    );
    expect(screen.getByText("album:white-pony")).toBeTruthy();
  });

  it("encodes album ids into a directly reloadable URL hash", () => {
    render(
      <RouterProvider>
        <RouteProbe />
      </RouterProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open album" }));
    expect(window.location.hash).toBe("#/album/white%20pony");
    expect(screen.getByText("album:white pony")).toBeTruthy();
  });
});
