"use client";

import { useEffect, useState } from "react";

type Size = "comfortable" | "large" | "compact";

const KEY = "karutoki-reading-size";

const OPTIONS: { id: Size; label: string; title: string }[] = [
  { id: "compact", label: "S", title: "Compact text" },
  { id: "comfortable", label: "M", title: "Comfortable text" },
  { id: "large", label: "L", title: "Large text" },
];

/** Text-size toggle for long reads. Persisted per browser. */
export default function FontSizeToggle() {
  const [size, setSize] = useState<Size>(() => {
    if (typeof window === "undefined") return "comfortable";
    try {
      const saved = localStorage.getItem(KEY) as Size | null;
      return saved === "large" || saved === "compact" ? saved : "comfortable";
    } catch {
      return "comfortable";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.readingSize = size;
    try {
      localStorage.setItem(KEY, size);
    } catch {
      /* ignore */
    }
  }, [size]);

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Text size">
      <span className="mr-1 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-faint)]">
        Text
      </span>
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => setSize(o.id)}
          aria-pressed={size === o.id}
          title={o.title}
          className={`flex h-8 w-8 items-center justify-center rounded-full border font-sans text-xs font-semibold transition-all duration-300 ${
            size === o.id
              ? "border-[var(--text-heading)] bg-[var(--text-heading)] text-[var(--bg-primary)]"
              : "border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
