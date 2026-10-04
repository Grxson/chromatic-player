import { create } from "zustand";
import type { AuthState } from "@/domain/ports";

interface AuthStore extends AuthState {
  setState: (state: AuthState) => void;
  reset: () => void;
}

const initial: AuthState = { status: "initializing" };

export const useAuthStore = create<AuthStore>((set) => ({
  ...initial,
  setState: (state) => set(state),
  reset: () => set(initial),
}));
