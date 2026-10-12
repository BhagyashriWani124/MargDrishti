/**
 * MargDrishti Theme Store
 *
 * Controls the application color scheme (light | dark).
 * Preference is persisted to localStorage and applied by toggling the
 * `dark` class on `document.documentElement` — no full page reload.
 * The initial value respects OS preference when no stored preference exists.
 */
"use client";

import { create } from "zustand";

export type ColorScheme = "light" | "dark";

const LS_KEY = "md.theme.v1";

function readPreference(): ColorScheme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(LS_KEY) as ColorScheme | null;
  if (stored === "light" || stored === "dark") return stored;
  // Fall back to OS preference.
  if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}

function applyTheme(scheme: ColorScheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (scheme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

interface ThemeStore {
  scheme: ColorScheme;
  /** Toggle between light and dark. */
  toggle: () => void;
  /** Explicitly set a scheme. */
  setScheme: (scheme: ColorScheme) => void;
  /** Call once on mount to sync DOM with stored preference. */
  hydrate: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  // Default to light; hydrate() will fix it on the client.
  scheme: "light",

  toggle() {
    set((state) => {
      const next: ColorScheme = state.scheme === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(LS_KEY, next);
      } catch {
        // Quota / private mode — ignore.
      }
      return { scheme: next };
    });
  },

  setScheme(scheme) {
    applyTheme(scheme);
    try {
      localStorage.setItem(LS_KEY, scheme);
    } catch {
      // ignore
    }
    set({ scheme });
  },

  hydrate() {
    const pref = readPreference();
    applyTheme(pref);
    set({ scheme: pref });
  },
}));
