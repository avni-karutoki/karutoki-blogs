"use client";

import React, { useEffect, useState } from "react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  // 0 → just got here, 1 → reached the bottom. The ring around the button
  // traces this live, so the outline literally fills as you scroll.
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
        setVisible(window.scrollY > 300);
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Ring geometry: a 48px button leaves a 42px circle → r = 21.
  const r = 21;
  const circumference = 2 * Math.PI * r;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      title={`Back to top — ${Math.round(progress * 100)}% through the page`}
      className={`fixed bottom-6 right-6 z-40 relative flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-card)] text-[var(--text-heading)] shadow-lg transition-all duration-300 hover:bg-[var(--accent-pink)] hover:text-white hover:-translate-y-1 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      {/* The outline doubles as a scroll-progress dial: the soft track sits
          beneath, the accent arc traces closed as the page is read. */}
      <svg
        aria-hidden
        viewBox="0 0 48 48"
        className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
      >
        <circle cx="24" cy="24" r={r} fill="none" stroke="var(--accent-soft)" strokeWidth="2.5" />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
        />
      </svg>

      <svg
        className="relative"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}
