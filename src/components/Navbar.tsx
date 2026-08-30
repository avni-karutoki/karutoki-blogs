"use client";

import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [writingsOpen, setWritingsOpen] = useState(false);

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-md">
        <nav className="mx-auto flex h-20 max-w-7xl items-center px-5 sm:px-8 lg:px-10">

          {/* Hamburger */}
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="mr-5 flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full transition hover:bg-[var(--secondary)]/20"
          >
            <span className="block h-0.5 w-6 bg-[var(--foreground)]" />
            <span className="block h-0.5 w-6 bg-[var(--foreground)]" />
            <span className="block h-0.5 w-6 bg-[var(--foreground)]" />
          </button>

          {/* Logo */}
          <a href="/" className="flex items-center">
            <Image
              src="/logo/karutoki-logo.png"
              alt="Karutoki Blogs"
              width={190}
              height={65}
              priority
              className="h-auto w-[150px] sm:w-[175px]"
            />
          </a>

          {/* Main Navigation */}
          <div className="ml-auto hidden items-center gap-8 md:flex">
            <a
              href="/"
              className="text-sm font-medium tracking-wide transition hover:text-[var(--primary)]"
            >
              Home
            </a>

            <a
              href="/poems"
              className="text-sm font-medium tracking-wide transition hover:text-[var(--primary)]"
            >
              Poetry
            </a>

            <a
              href="/blogs"
              className="text-sm font-medium tracking-wide transition hover:text-[var(--primary)]"
            >
              Blogs
            </a>

            <a
              href="/about"
              className="text-sm font-medium tracking-wide transition hover:text-[var(--primary)]"
            >
              About
            </a>

            <button
              type="button"
              aria-label="Search"
              className="flex h-9 w-9 items-center justify-center rounded-full text-lg transition hover:bg-[var(--secondary)]/20"
            >
              🔍
            </button>
          </div>
        </nav>
      </header>

      {/* ================= OVERLAY ================= */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px]"
        />
      )}

      {/* ================= SIDE MENU ================= */}
      <aside
       className={`fixed left-0 top-0 z-[70] h-full w-[320px] max-w-[88vw] overflow-y-auto border-r border-[var(--border)] bg-[var(--background)] shadow-2xl transition-transform duration-300 ease-in-out ${
       menuOpen ? "translate-x-0" : "-translate-x-full"
       }`}
       >
        <div className="flex h-full flex-col px-7 py-6">

          {/* Menu Header */}
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-5">
            <div>
              <p className="font-[var(--font-playfair)] text-xl font-semibold">
                Karutoki
              </p>

              <p className="text-xs tracking-[0.25em] text-[var(--primary)]">
                BLOGS
              </p>
            </div>

            {/* Close */}
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-2xl transition hover:bg-[var(--secondary)]/20"
            >
              ×
            </button>
          </div>

          {/* ================= MENU ITEMS ================= */}
          <div className="mt-7 flex flex-col">

            {/* Home */}
            <a
              href="/"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-3 text-[15px] transition hover:bg-[var(--secondary)]/15 hover:text-[var(--primary)]"
            >
              Home
            </a>

            {/* Writings */}
            <div className="mt-1">
              <button
                type="button"
                onClick={() => setWritingsOpen(!writingsOpen)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-[15px] transition hover:bg-[var(--secondary)]/15 hover:text-[var(--primary)]"
              >
                <span>Writings</span>

               <span
               className={`text-xs transition-transform duration-300 ${
               writingsOpen ? "rotate-180" : ""
              }`}
              >
              ▼
              </span>
              </button>

              {/* Writings Submenu */}
              <div
                className={`ml-4 overflow-hidden border-l border-[var(--secondary)]/40 pl-3 transition-all duration-300 ${
                  writingsOpen
                    ? "max-h-60 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <a
                  href="/poems"
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 text-sm text-[var(--foreground)]/70 transition hover:text-[var(--primary)]"
                >
                  Poems
                </a>

                <a
                  href="/blogs"
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 text-sm text-[var(--foreground)]/70 transition hover:text-[var(--primary)]"
                >
                  Blogs
                </a>

                <a
                  href="/midnight-talks"
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 text-sm text-[var(--foreground)]/70 transition hover:text-[var(--primary)]"
                >
                  Midnight Talks
                </a>

                {/* Future categories can be added here */}
                <a
                  href="/writings"
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 text-sm text-[var(--foreground)]/70 transition hover:text-[var(--primary)]"
                >
                  More...
                </a>
              </div>
            </div>

            {/* Themes */}
            <a
              href="/themes"
              onClick={() => setMenuOpen(false)}
              className="mt-1 rounded-lg px-3 py-3 text-[15px] transition hover:bg-[var(--secondary)]/15 hover:text-[var(--primary)]"
            >
              Themes
            </a>

            {/* About */}
            <a
              href="/about"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-3 text-[15px] transition hover:bg-[var(--secondary)]/15 hover:text-[var(--primary)]"
            >
              About
            </a>

            {/* Contact */}
            <a
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-3 text-[15px] transition hover:bg-[var(--secondary)]/15 hover:text-[var(--primary)]"
            >
              Contact Us
            </a>
          </div>

{/* ================= FOLLOW ME ================= */}
<div className="mt-auto border-t border-[var(--border)] pt-6">

  <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[var(--foreground)]/50">
    Follow Me
  </p>

  <div className="flex flex-col gap-3">

    <a
      href="https://www.instagram.com/avni.karutoki/"
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm transition hover:text-[var(--primary)]"
    >
      Instagram
    </a>

    <a
      href="https://pin.it/1WBBgualJ"
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm transition hover:text-[var(--primary)]"
    >
      Pinterest
    </a>

    <a
      href="https://www.linkedin.com/in/avni-karutoki"
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm transition hover:text-[var(--primary)]"
    >
      LinkedIn
    </a>

    <a
      href="https://x.com/avnikaruroki"
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm transition hover:text-[var(--primary)]"
    >
      X (Twitter)
    </a>

  </div>
</div>
        </div>
      </aside>
    </>
  );
}