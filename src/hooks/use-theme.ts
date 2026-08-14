"use client";

import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "trialgptbot-theme";

/**
 * Read the stored theme from localStorage, falling back to the OS preference.
 * Safe to call only in effects / event handlers (touches `window`).
 */
function readInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* ignore — private mode etc. */
  }
  const prefersDark =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

/**
 * Lightweight theme hook (no external deps). Persists the choice in
 * localStorage, applies the `dark` class to <html>, and stays in sync
 * across tabs. Returns the current theme plus a stable toggle function.
 */
export function useTheme() {
  // SSR renders light by default; we sync to the real value in an effect to
  // avoid hydration mismatches while still avoiding a white flash on load.
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // On mount, read the real preferred theme and apply it.
  useEffect(() => {
    const initial = readInitialTheme();
    setThemeState(initial);
    applyThemeClass(initial);
    setMounted(true);
  }, []);

  // Cross-tab sync: if another tab changes the theme, mirror it here.
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const next = e.newValue === "dark" ? "dark" : "light";
      setThemeState(next);
      applyThemeClass(next);
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyThemeClass(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme, mounted };
}

function applyThemeClass(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  root.style.colorScheme = theme;
}
