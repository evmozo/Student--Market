import { create } from "zustand";
import { api, apiData, setAuthToken } from "../utils/api";
import { isTokenExpired } from "../utils/validators";
import type { User } from "../types";

const TOKEN_KEY = "student_marketplace_token";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  bootstrapped: boolean;
  login(email: string, password: string): Promise<void>;
  register(input: { name: string; email: string; password: string; school?: string; course?: string }): Promise<void>;
  loadMe(): Promise<void>;
  setUser(user: User): void;
  logout(): void;
}

const persistToken = (token: string | null): void => {
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
    setAuthToken(token);
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
    setAuthToken(undefined);
  }
};

const initialToken = sessionStorage.getItem(TOKEN_KEY);
if (initialToken && !isTokenExpired(initialToken)) {
  setAuthToken(initialToken);
} else {
  persistToken(null);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: initialToken && !isTokenExpired(initialToken) ? initialToken : null,
  loading: false,
  bootstrapped: false,
  async login(email, password) {
    set({ loading: true });
    try {
      const data = await apiData<{ user: User; token: string }>(api.post("/auth/login", { email, password }));
      persistToken(data.token);
      set({ user: data.user, token: data.token, loading: false, bootstrapped: true });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  async register(input) {
    set({ loading: true });
    try {
      const data = await apiData<{ user: User; token: string }>(api.post("/auth/register", input));
      persistToken(data.token);
      set({ user: data.user, token: data.token, loading: false, bootstrapped: true });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  async loadMe() {
    const token = get().token;
    if (!token || isTokenExpired(token)) {
      get().logout();
      set({ bootstrapped: true });
      return;
    }
    set({ loading: true });
    try {
      const data = await apiData<{ user: User }>(api.get("/auth/me"));
      set({ user: data.user, loading: false, bootstrapped: true });
    } catch {
      get().logout();
      set({ bootstrapped: true });
    }
  },
  setUser(user) {
    set({ user });
  },
  logout() {
    persistToken(null);
    set({ user: null, token: null, loading: false });
  }
}));
