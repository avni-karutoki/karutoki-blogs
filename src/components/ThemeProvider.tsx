"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Theme =
  | "cream"
  | "moonlit"
  | "blush"
  | "lavender"
  | "matcha"
  | "honey"
  | "coffee"
  | "jelly";

interface ThemeMeta {
  id: Theme;
  name: string;
  icon: string;
  previewColor: string;
  kind: "light" | "dark";
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleDark: () => void;
  isDark: boolean;
  themes: ThemeMeta[];
}

const THEMES: ThemeMeta[] = [
  { id: "cream", name: "Karutoki Cream", icon: "☼", previewColor: "#F4EFE3", kind: "light" },
  { id: "moonlit", name: "Moonlit Ink", icon: "☾", previewColor: "#141118", kind: "dark" },
  { id: "blush", name: "Blush Letter", icon: "✿", previewColor: "#FDF4F5", kind: "light" },
  { id: "lavender", name: "Lavender Dusk", icon: "✦", previewColor: "#F4F0F8", kind: "light" },
  { id: "matcha", name: "Matcha Calm", icon: "🍃", previewColor: "#EDF2E1", kind: "light" },
  { id: "honey", name: "Honeyed Paper", icon: "🐝", previewColor: "#FAF0DC", kind: "light" },
  { id: "coffee", name: "Coffeehouse Ink", icon: "☕", previewColor: "#e9dcc7", kind: "light" },
  { id: "jelly", name: "Jelly Drift", icon: "🎐", previewColor: "#c9a3e8", kind: "dark" },
];

const VALID = THEMES.map((t) => t.id);

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "coffee";
  const fromDom = document.documentElement.getAttribute("data-theme") as Theme | null;
  if (fromDom && VALID.includes(fromDom)) return fromDom;
  try {
    const saved = localStorage.getItem("karutoki-theme") as Theme | null;
    if (saved && VALID.includes(saved)) return saved;
  } catch {
    /* ignore */
  }
  /* First visit opens on Coffeehouse Ink (matches theme-init.js). */
  return "coffee";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // IMPORTANT: the initial state must be identical on the server and on the
  // first client render, otherwise React reports a hydration mismatch.
  // The saved theme is therefore resolved AFTER mount — the visual theme is
  // already correct because the inline script in layout.tsx sets
  // `data-theme` on <html> before React hydrates.
  const [theme, setThemeState] = useState<Theme>("cream");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setThemeState(getInitialTheme());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    const kind = THEMES.find((t) => t.id === theme)?.kind ?? "light";
    root.classList.add("theming");
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = kind === "dark" ? "dark" : "light";
    try {
      localStorage.setItem("karutoki-theme", theme);
    } catch {
      /* ignore */
    }
    const t = window.setTimeout(() => root.classList.remove("theming"), 500);
    return () => window.clearTimeout(t);
  }, [theme, mounted]);

  const setTheme = useCallback((next: Theme) => setThemeState(next), []);
  const toggleDark = useCallback(
    () =>
      setThemeState((prev) => {
        const kind = THEMES.find((t) => t.id === prev)?.kind ?? "light";
        return kind === "dark" ? "cream" : "moonlit";
      }),
    []
  );

  const isDark = THEMES.find((t) => t.id === theme)?.kind === "dark";

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, toggleDark, isDark, themes: THEMES }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
