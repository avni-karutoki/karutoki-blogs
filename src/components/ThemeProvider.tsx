"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Theme =
  | "cream"
  | "moonlit"
  | "blush"
  | "lavender"
  | "matcha"
  | "honey"
  | "ocean"
  | "sakura";

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
  { id: "ocean", name: "Deep Ocean", icon: "🌊", previewColor: "#0E1622", kind: "dark" },
  { id: "sakura", name: "Sakura Night", icon: "🌸", previewColor: "#1D1218", kind: "dark" },
];

const VALID = THEMES.map((t) => t.id);

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "cream";
  const fromDom = document.documentElement.getAttribute("data-theme") as Theme | null;
  if (fromDom && VALID.includes(fromDom)) return fromDom;
  try {
    const saved = localStorage.getItem("karutoki-theme") as Theme | null;
    if (saved && VALID.includes(saved)) return saved;
  } catch {
    /* ignore */
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "moonlit" : "cream";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Mount marker only (avoids applying theme transitions during SSR hydration).
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
