import { afterEach, beforeEach } from "vitest";
import { act } from "react";

// Reset Zustand stores between tests by clearing the module cache.
beforeEach(() => {
  // jsdom does not provide matchMedia; provide a no-op implementation.
  if (typeof window !== "undefined" && !window.matchMedia) {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
      }),
    });
  }
});

afterEach(async () => {
  await act(async () => {
    // No-op: store resets happen in individual test files.
  });
});
