import type { AuthState, MusicAuthProvider } from "@/domain/ports";
import { useAuthStore } from "@/stores/auth.store";

export class MockAuthProvider implements MusicAuthProvider {
  readonly name = "mock-auth";

  async initialize(): Promise<AuthState> {
    const state: AuthState = { status: "authenticated", userId: "mock-user" };
    useAuthStore.getState().setState(state);
    return state;
  }

  async login(): Promise<void> {
    await this.initialize();
  }

  async handleCallback(): Promise<void> {
    await this.initialize();
  }

  async logout(): Promise<void> {
    useAuthStore.getState().setState({ status: "unauthenticated" });
  }
}
