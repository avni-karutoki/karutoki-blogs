"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import KarutokiLogo from "./KarutokiLogo";
import { useTheme } from "./ThemeProvider";
import { useSearch } from "./SearchContext";
import { MotionLink, MotionButton, MotionIcon, ScrollReveal, StaggerGroup } from "./MotionPrimitives";

function NavPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <MotionLink
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full px-4 py-2 font-sans text-[11.5px] font-semibold uppercase tracking-[0.18em] transition-all duration-300 ${
        active
          ? "bg-[var(--text-heading)] text-[var(--bg-primary)] shadow"
          : "text-[var(--text-muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-heading)]"
      }`}
      whileHover={active ? undefined : { y: -2 }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </MotionLink>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme, themes, toggleDark, isDark } = useTheme();
  const { openSearch } = useSearch();

  const [menuOpen, setMenuOpen] = useState(false);
  const [themesOpen, setThemesOpen] = useState(false);

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(path + "/");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-color)] bg-[var(--bg-primary)]/85 backdrop-blur-md transition-colors duration-300">
      <nav className="relative mx-auto flex h-16 md:h-[72px] max-w-6xl items-center justify-between px-4 md:px-6">
        <MotionLink href="/" className="relative z-10 flex items-center" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <KarutokiLogo />
        </MotionLink>

        {/* Desktop — centered pill links */}
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
          <div className="flex items-center gap-1 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)]/70 p-1.5 shadow-[var(--shadow-card)] backdrop-blur-md">
            <NavPill href="/" active={isActive("/")}>Home</NavPill>
            <NavPill href="/writings" active={isActive("/writings")}>Writings</NavPill>

            <div className="relative">
              <MotionButton
                type="button"
                onClick={() => setThemesOpen((p) => !p)}
                onBlur={() => window.setTimeout(() => setThemesOpen(false), 180)}
                aria-expanded={themesOpen}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 font-sans text-[11.5px] font-semibold uppercase tracking-[0.18em] outline-none transition-all duration-300 hover:-translate-y-px ${
                  themesOpen
                    ? "bg-[var(--text-heading)] text-[var(--bg-primary)] shadow"
                    : "text-[var(--text-muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-heading)]"
                }`}
              >
                <span>Themes</span>
                <MotionIcon animateOnHover="rotate" className={`text-[9px] transition-transform duration-300 ${themesOpen ? "rotate-180" : ""}`}>
                  ▼
                </MotionIcon>
              </MotionButton>

              {themesOpen && (
                <StaggerGroup stagger={0.04} className="absolute left-1/2 top-full z-50 mt-3 w-56 -translate-x-1/2 animate-fadeIn rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-2 shadow-[var(--shadow-card)]">
                  <p className="px-3 pb-1 pt-2 font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">Select aesthetic</p>
                  {themes.map((t) => (
                    <MotionButton
                      key={t.id}
                      type="button"
                      onClick={() => { setTheme(t.id); setThemesOpen(false); }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 font-sans text-[13px] transition-colors duration-200 ${
                        theme === t.id
                          ? "bg-[var(--accent-soft)] font-semibold text-[var(--accent)]"
                          : "text-[var(--text-primary)] hover:bg-[var(--accent-soft)]"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="inline-block h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: t.previewColor }} />
                        {t.icon} {t.name}
                      </span>
                      {theme === t.id && <MotionIcon animateOnHover="pulse">✓</MotionIcon>}
                    </MotionButton>
                  ))}
                  <p className="px-3 pb-1 pt-2 font-sans text-[10px] text-[var(--text-faint)]">{isDark ? "Dark" : "Light"} mode active</p>
                </StaggerGroup>
              )}
            </div>

            <NavPill href="/about" active={isActive("/about")}>About</NavPill>
            <NavPill href="/contact" active={isActive("/contact")}>Contact</NavPill>
          </div>
        </div>

        {/* Desktop — right controls */}
        <div className="relative z-10 hidden items-center gap-2 md:flex">
          <MotionButton
            type="button"
            onClick={openSearch}
            aria-label="Open search"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-[var(--text-primary)] transition-all duration-300 hover:-translate-y-px hover:border-[var(--border-color)] hover:bg-[var(--bg-card)] hover:text-[var(--accent)]"
            whileHover={{ scale: 1.1, rotate: 12 }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
              <line x1="16.2" y1="16.2" x2="21" y2="21" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </MotionButton>
          <MotionButton
            type="button"
            onClick={openSearch}
            title="Search (⌘K)"
            aria-label="Open search with Control K"
            className="hidden items-center gap-1 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)]/70 px-2.5 py-1.5 font-sans text-[10px] font-semibold tracking-[0.08em] text-[var(--text-faint)] shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-px hover:border-[var(--accent)] hover:text-[var(--accent)] lg:inline-flex"
            whileHover={{ scale: 1.05 }}
          >
            <kbd className="font-sans">⌘</kbd>
            <kbd className="font-sans">K</kbd>
          </MotionButton>

          <MotionButton
            type="button"
            onClick={toggleDark}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Light mode" : "Dark mode"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-card)]/70 text-[15px] shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-px hover:rotate-12 hover:border-[var(--accent)] hover:text-[var(--accent)]"
            whileHover={{ scale: 1.1, rotate: 15 }}
          >
            <span key={isDark ? "sun" : "moon"} className="animate-fadeIn">{isDark ? "☼" : "☾"}</span>
          </MotionButton>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={openSearch}
            aria-label="Open search"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-primary)] touch-manipulation"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
              <line x1="16.2" y1="16.2" x2="21" y2="21" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={toggleDark}
            aria-label="Toggle dark mode"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[15px] touch-manipulation"
          >
            {isDark ? "☼" : "☾"}
          </button>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full transition hover:bg-[var(--accent-soft)] touch-manipulation"
          >
            <span className="block h-0.5 w-5 bg-[var(--text-primary)]" />
            <span className="block h-0.5 w-5 bg-[var(--text-primary)]" />
            <span className="block h-0.5 w-3.5 self-end mr-2.5 bg-[var(--accent)]" />
          </button>
        </div>
      </nav>

      {/* Mobile drawer backdrop */}
      <div
        onClick={() => setMenuOpen(false)}
        onTouchStart={(e) => e.stopPropagation()}
        aria-hidden
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden touch-none ${menuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <aside className={`fixed right-0 top-0 z-[70] flex h-full w-[300px] max-w-[85vw] flex-col overflow-y-auto border-l border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-2xl transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${menuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
          <KarutokiLogo />
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-lg transition hover:bg-[var(--accent-soft)] touch-manipulation"
          >
            ✕
          </button>
        </div>

        <StaggerGroup stagger={0.06} className="mt-6 flex flex-col gap-1">
          {[
            { href: "/", label: "Home" },
            { href: "/writings", label: "Writings" },
            { href: "/about", label: "About" },
            { href: "/contact", label: "Contact" },
          ].map((l) => (
            <MotionLink
              key={l.label}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className={`rounded-xl px-3 py-3 font-sans text-[13px] font-medium uppercase tracking-[0.2em] transition hover:bg-[var(--accent-soft)] ${isActive(l.href) ? "text-[var(--accent)]" : "text-[var(--text-primary)]"}`}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              {l.label}
            </MotionLink>
          ))}
        </StaggerGroup>

        <div className="mt-6 border-t border-[var(--border-color)] pt-5">
          <p className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">Theme palette</p>
          <StaggerGroup stagger={0.04} className="grid grid-cols-2 gap-2">
            {themes.map((t) => (
              <MotionButton
                key={t.id}
                type="button"
                onClick={() => { setTheme(t.id); setMenuOpen(false); }}
                className={`flex items-center gap-2 rounded-xl border p-2.5 font-sans text-xs transition ${theme === t.id ? "border-[var(--accent)] bg-[var(--accent-soft)] font-semibold text-[var(--accent)]" : "border-[var(--border-color)] text-[var(--text-primary)]"}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ backgroundColor: t.previewColor }} />
                {t.icon} {t.name.split(" ")[0]}
              </MotionButton>
            ))}
          </StaggerGroup>
        </div>

        <div className="mt-auto border-t border-[var(--border-color)] pt-5">
          <p className="mb-3 font-sans text-[11px] uppercase tracking-[0.22em] text-[var(--text-faint)]">Follow</p>
          <div className="flex gap-4 font-sans text-[11px] font-semibold tracking-[0.14em] text-[var(--accent)]">
            <MotionLink href="https://www.instagram.com/avni.karutoki/" target="_blank" rel="noreferrer" whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }}>IG</MotionLink>
            <MotionLink href="https://substack.com/@karutoki" target="_blank" rel="noreferrer" whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }}>SUB</MotionLink>
            <MotionLink href="https://www.linkedin.com/in/avni-karutoki" target="_blank" rel="noreferrer" whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }}>IN</MotionLink>
            <MotionLink href="https://x.com/avnikaruroki" target="_blank" rel="noreferrer" whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }}>X</MotionLink>
          </div>
        </div>
      </aside>
    </header>
  );
}