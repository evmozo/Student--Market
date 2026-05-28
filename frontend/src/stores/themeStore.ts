import { create } from "zustand";

interface ThemeState {
  compactMode: boolean;
  toggleCompactMode(): void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  compactMode: false,
  toggleCompactMode: () => set((state) => ({ compactMode: !state.compactMode }))
}));
