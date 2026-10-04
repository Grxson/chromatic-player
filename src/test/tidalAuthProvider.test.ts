import { beforeEach, describe, expect, it, vi } from "vitest";

const sdk = vi.hoisted(() => ({
  init: vi.fn(),
  initializeLogin: vi.fn(),
  finalizeLogin: vi.fn(),
  logout: vi.fn(),
  getCredentials: vi.fn(),
}));
const deepLink = vi.hoisted(() => ({ getCurrent: vi.fn(), onOpenUrl: vi.fn() }));
const opener = vi.hoisted(() => ({ openUrl: vi.fn() }));

vi.mock("@tidal-music/auth", () => ({
  init: sdk.init,
  initializeLogin: sdk.initializeLogin,
  finalizeLogin: sdk.finalizeLogin,
  logout: sdk.logout,
  credentialsProvider: { getCredentials: sdk.getCredentials },
}));
vi.mock("@tauri-apps/plugin-deep-link", () => deepLink);
vi.mock("@tauri-apps/plugin-opener", () => opener);
vi.mock("@tauri-apps/api/core", () => ({ isTauri: () => true }));

import { TidalAuthProvider } from "@/infrastructure/tidal/auth/TidalAuthProvider";
import { useAuthStore } from "@/stores/auth.store";

const config = {
  clientId: "public-client-id",
  redirectUri: "https://callback.example/oauth",
  scopes: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sdk.getCredentials.mockResolvedValue({ token: "opaque-sdk-credential", userId: "user-1" });
  sdk.initializeLogin.mockResolvedValue("https://login.tidal.com/authorize");
  deepLink.getCurrent.mockResolvedValue(null);
  deepLink.onOpenUrl.mockResolvedValue(vi.fn());
  useAuthStore.getState().setState({ status: "initializing" });
});

describe("TidalAuthProvider", () => {
  it("initializes the official SDK and restores observable authenticated state", async () => {
    const provider = new TidalAuthProvider(config);

    await expect(provider.initialize()).resolves.toEqual({
      status: "authenticated",
      userId: "user-1",
    });
    expect(sdk.init).toHaveBeenCalledWith(
      expect.objectContaining({ clientId: "public-client-id", scopes: [] }),
    );
    expect(useAuthStore.getState()).toMatchObject({ status: "authenticated", userId: "user-1" });
    expect(useAuthStore.getState()).not.toHaveProperty("token");
  });

  it("starts login through the system browser without handling credentials", async () => {
    const provider = new TidalAuthProvider(config);
    await provider.initialize();

    await provider.login();

    expect(sdk.initializeLogin).toHaveBeenCalledWith(
      expect.objectContaining({
        redirectUri: config.redirectUri,
        loginConfig: expect.objectContaining({ state: expect.any(String) }),
      }),
    );
    expect(opener.openUrl).toHaveBeenCalledWith("https://login.tidal.com/authorize");
    expect(useAuthStore.getState().status).toBe("authenticating");
  });

  it("validates callback state, delegates code exchange, and logs out via the SDK", async () => {
    const provider = new TidalAuthProvider(config);
    await provider.initialize();
    localStorage.setItem("chromatic-player-tidal-oauth-state", "expected-state");

    await provider.handleCallback(
      "chromatic-player://oauth/callback?code=one-time-code&state=expected-state",
    );
    expect(sdk.finalizeLogin).toHaveBeenCalledWith("?code=one-time-code&state=expected-state");
    expect(useAuthStore.getState()).toMatchObject({ status: "authenticated", userId: "user-1" });

    await provider.logout();
    expect(sdk.logout).toHaveBeenCalledOnce();
    expect(useAuthStore.getState().status).toBe("unauthenticated");
  });

  it("rejects an untrusted callback state", async () => {
    const provider = new TidalAuthProvider(config);
    await provider.initialize();
    localStorage.setItem("chromatic-player-tidal-oauth-state", "expected-state");

    await expect(
      provider.handleCallback("chromatic-player://oauth/callback?code=abc&state=wrong"),
    ).rejects.toThrow("state validation failed");
    expect(sdk.finalizeLogin).not.toHaveBeenCalled();
    expect(useAuthStore.getState().status).toBe("error");
  });
});
