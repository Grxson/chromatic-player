import { create } from "zustand";
import type { User } from "@/domain/entities";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: user !== null,
    }),
  setLoading: (isLoading) => set({ isLoading }),
  signOut: () => set({ user: null, isAuthenticated: false }),
}));
