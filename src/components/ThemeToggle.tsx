"use client";

import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { isDark, toggleDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light" : "Switch to dark"}
      className="group relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-lg shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)]"
    >
      <span
        key={isDark ? "moon" : "sun"}
        className="animate-fadeIn transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
      >
        {isDark ? "☼" : "☾"}
      </span>
    </button>
  );
}
