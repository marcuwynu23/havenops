import { create } from "zustand";
import { authLogin, authMe, authRegister, setAuthToken } from "../api";
import type { AuthUser } from "../types/auth";
import type { Role } from "../types/auth";

export function roleHome(role: Role): string {
  switch (role) {
    case "admin":
      return "/dashboard";
    case "employee":
      return "/app";
    case "client":
      return "/portal";
    default:
      return "/login";
  }
}

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (body: {
    email: string;
    password: string;
    name: string;
    phone: string;
    address: string;
  }) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrated: false,

  hydrate: async () => {
    const t =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("havenops_token")
        : null;
    setAuthToken(t);
    set({ token: t });
    if (t) {
      try {
        const user = await authMe();
        set({ user, hydrated: true });
      } catch {
        setAuthToken(null);
        set({ token: null, user: null, hydrated: true });
      }
    } else {
      set({ user: null, hydrated: true });
    }
  },

  login: async (email, password) => {
    const { token, user } = await authLogin({ email, password });
    setAuthToken(token);
    set({ token, user });
  },

  register: async (body) => {
    const { token, user } = await authRegister(body);
    setAuthToken(token);
    set({ token, user });
  },

  logout: () => {
    setAuthToken(null);
    set({ token: null, user: null });
  },
}));
