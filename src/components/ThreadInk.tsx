"use client";

import { useEffect, useRef } from "react";

/**
 * The archive thread inks itself in as you scroll — an accent-coloured
 * line growing down the timeline, with a small glimmering pin travelling
 * at its tip. Sits directly on top of the page's faint thread line and
 * shares its coordinates (positioning classes are passed by the page).
 */
export default function ThreadInk({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    const wrap = el?.parentElement;
    if (!el || !wrap) return;
    let raf = 0;

    const update = () => {
      raf = 0;
      const r = wrap.getBoundingClientRect();
      const anchor = window.innerHeight * 0.45; // pin rides slightly above centre
      const p = r.height > 0 ? (anchor - r.top) / r.height : 0;
      el.style.setProperty(
        "--thread-fill",
        `${(Math.min(1, Math.max(0, p)) * 100).toFixed(1)}%`,
      );
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden
      ref={ref}
      className={`archive-thread pointer-events-none ${className}`}
    >
      <span className="archive-thread__ink" />
      <span className="archive-thread__tip" />
    </div>
  );
}
