import { create } from "zustand";
import type { Role, User } from "../types";
import { authClient } from "../lib/authClient";
import { api } from "../lib/api";

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthState {
  currentUser: User | null;
  initializing: boolean;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (input: { name: string; email: string; password: string; role: Role; phone?: string }) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<User, "name" | "phone">>) => Promise<void>;
}

async function fetchCurrentUser(): Promise<User | null> {
  try {
    const { user } = await api.get<{ user: User }>("/users/me");
    return user;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  initializing: true,

  init: async () => {
    const user = await fetchCurrentUser();
    set({ currentUser: user, initializing: false });
  },

  login: async (email, password) => {
    const { error } = await authClient.signIn.email({ email, password });
    if (error) {
      return { success: false, error: error.message || "Invalid email or password." };
    }
    const user = await fetchCurrentUser();
    set({ currentUser: user });
    return { success: true };
  },

  register: async ({ name, email, password, role, phone }) => {
    const { error } = await authClient.signUp.email({ name, email, password, role, phone });
    if (error) {
      return { success: false, error: error.message || "Could not create account." };
    }
    const user = await fetchCurrentUser();
    set({ currentUser: user });
    return { success: true };
  },

  logout: async () => {
    await authClient.signOut();
    set({ currentUser: null });
  },

  updateProfile: async (updates) => {
    await authClient.updateUser(updates);
    const user = await fetchCurrentUser();
    set({ currentUser: user });
  },
}));
