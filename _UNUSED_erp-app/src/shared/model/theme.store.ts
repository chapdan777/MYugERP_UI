/**
 * Zustand store для управления темой приложения
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
  /** Текущий режим темы */
  mode: ThemeMode;
  /** Переключить тему */
  toggleTheme: () => void;
  /** Установить конкретную тему */
  setTheme: (mode: ThemeMode) => void;
}

/**
 * Store для управления темой с сохранением в localStorage
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'light',
      toggleTheme: () =>
        set((state) => ({
          mode: state.mode === 'light' ? 'dark' : 'light',
        })),
      setTheme: (mode) => set({ mode }),
    }),
    {
      name: 'erp-theme-storage',
    }
  )
);
