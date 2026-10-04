import {
  credentialsProvider,
  finalizeLogin,
  init,
  initializeLogin,
  logout,
} from "@tidal-music/auth";
import { getCurrent, onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { openUrl } from "@tauri-apps/plugin-opener";
import { isTauri } from "@tauri-apps/api/core";
import type { AuthState, MusicAuthProvider } from "@/domain/ports";
import { useAuthStore } from "@/stores/auth.store";

const STORAGE_KEY = "chromatic-player-tidal";
const PENDING_STATE_KEY = "chromatic-player-tidal-oauth-state";
const CALLBACK_SCHEME = "chromatic-player";
const CALLBACK_HOST = "oauth";
const CALLBACK_PATH = "/callback";

interface TidalAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

function safeError(error: unknown): string {
  if (error instanceof Error && /network|fetch/i.test(error.message)) {
    return "TIDAL is unavailable. Check your connection and try again.";
  }
  return "TIDAL authentication could not be completed.";
}

function createState(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** TIDAL Auth SDK adapter. Tokens/refresh data stay inside the SDK. */
export class TidalAuthProvider implements MusicAuthProvider {
  readonly name = "tidal-auth";
  private initialization: Promise<AuthState> | null = null;

  constructor(private readonly config: TidalAuthConfig) {}

  initialize(): Promise<AuthState> {
    this.initialization ??= this.initializeOnce();
    return this.initialization;
  }

  private async initializeOnce(): Promise<AuthState> {
    useAuthStore.getState().setState({ status: "initializing" });
    if (!this.config.clientId || !this.config.redirectUri) {
      const state: AuthState = {
        status: "error",
        error: "Configure the TIDAL Client ID and HTTPS redirect URI to connect.",
      };
      useAuthStore.getState().setState(state);
      return state;
    }

    try {
      await init({
        clientId: this.config.clientId,
        credentialsStorageKey: STORAGE_KEY,
        scopes: this.config.scopes,
      });
      await this.listenForCallback();
      return await this.refreshUiState();
    } catch (error) {
      const state: AuthState = { status: "error", error: safeError(error) };
      useAuthStore.getState().setState(state);
      return state;
    }
  }

  async login(): Promise<void> {
    useAuthStore.getState().setState({ status: "authenticating" });
    try {
      const state = createState();
      localStorage.setItem(PENDING_STATE_KEY, state);
      const url = await initializeLogin({
        redirectUri: this.config.redirectUri,
        loginConfig: { state },
      });
      if (isTauri()) {
        await openUrl(url);
      } else {
        window.location.assign(url);
      }
    } catch (error) {
      localStorage.removeItem(PENDING_STATE_KEY);
      useAuthStore.getState().setState({ status: "error", error: safeError(error) });
      throw new Error(safeError(error), { cause: error });
    }
  }

  async handleCallback(rawUrl: string): Promise<void> {
    const callback = new URL(rawUrl);
    if (
      callback.protocol !== `${CALLBACK_SCHEME}:` ||
      callback.hostname !== CALLBACK_HOST ||
      callback.pathname !== CALLBACK_PATH
    ) {
      throw new Error("Unexpected authentication callback.");
    }

    const expectedState = localStorage.getItem(PENDING_STATE_KEY);
    const returnedState = callback.searchParams.get("state");
    if (!expectedState || !returnedState || returnedState !== expectedState) {
      localStorage.removeItem(PENDING_STATE_KEY);
      useAuthStore.getState().setState({
        status: "error",
        error: "The TIDAL sign-in response could not be verified. Please try again.",
      });
      throw new Error("TIDAL callback state validation failed.");
    }

    if (callback.searchParams.has("error")) {
      localStorage.removeItem(PENDING_STATE_KEY);
      useAuthStore.getState().setState({ status: "unauthenticated" });
      return;
    }

    useAuthStore.getState().setState({ status: "authenticating" });
    try {
      await finalizeLogin(callback.search);
      localStorage.removeItem(PENDING_STATE_KEY);
      await this.refreshUiState();
    } catch (error) {
      localStorage.removeItem(PENDING_STATE_KEY);
      useAuthStore.getState().setState({ status: "error", error: safeError(error) });
      throw new Error(safeError(error), { cause: error });
    }
  }

  async logout(): Promise<void> {
    await logout();
    localStorage.removeItem(PENDING_STATE_KEY);
    useAuthStore.getState().setState({ status: "unauthenticated" });
  }

  private async refreshUiState(): Promise<AuthState> {
    const credentials = await credentialsProvider.getCredentials();
    const state: AuthState = credentials.token
      ? { status: "authenticated", userId: credentials.userId }
      : { status: "unauthenticated" };
    useAuthStore.getState().setState(state);
    return state;
  }

  private async listenForCallback(): Promise<void> {
    if (!isTauri()) return;
    const accept = (urls: string[]) => {
      for (const url of urls) {
        if (url.startsWith(`${CALLBACK_SCHEME}://`)) {
          void this.handleCallback(url).catch(() => undefined);
        }
      }
    };
    const initialUrls = await getCurrent();
    if (initialUrls) accept(initialUrls);
    await onOpenUrl(accept);
  }
}
