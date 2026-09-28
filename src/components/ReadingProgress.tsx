"use client";

import { useEffect, useRef } from "react";

/** Slim reading-progress bar pinned under the navbar. rAF-throttled. */
export default function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const ticking = useRef(false);

  useEffect(() => {
    const update = () => {
      ticking.current = false;
      const el = barRef.current;
      if (!el) return;
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      const progress = total > 0 ? Math.min(1, Math.max(0, doc.scrollTop / total)) : 0;
      el.style.transform = `scaleX(${progress})`;
    };
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]"
    >
      <div
        ref={barRef}
        className="h-full w-full origin-left"
        style={{
          transform: "scaleX(0)",
          background: "linear-gradient(90deg, var(--accent), var(--accent-strong))",
          willChange: "transform",
        }}
      />
    </div>
  );
}
