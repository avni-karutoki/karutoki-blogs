"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const MOODS = [
  { id: "happy", emoji: "😊", label: "Happy" },
  { id: "sad", emoji: "😔", label: "Sad" },
  { id: "calm", emoji: "😌", label: "Calm" },
  { id: "hopeful", emoji: "✨", label: "Hopeful" },
] as const;

export default function MoodSearch({
  initial = "",
  category = "all",
}: {
  initial?: string;
  category?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");

  function hrefFor(mood: string): string {
    const qs = new URLSearchParams();
    if (category && category !== "all") qs.set("category", category);
    if (mood) qs.set("mood", mood);
    const query = qs.toString();
    return query ? `/writings?${query}` : "/writings";
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    router.push(hrefFor(value.trim()));
  }

  return (
    <div className="mood-search-panel">
      <p className="mood-search-panel__prompt">Choose what feels closest</p>
      <div className="mood-grid" role="group" aria-label="Choose a mood">
        {MOODS.map((mood) => (
          <button
            key={mood.id}
            type="button"
            onClick={() => router.push(hrefFor(mood.id))}
            className={`mood-tile ${initial === mood.id ? "mood-tile--active" : ""}`}
            aria-pressed={initial === mood.id}
            aria-label={`${mood.label} mood`}
          >
            <span aria-hidden className="mood-tile__emoji">{mood.emoji}</span>
            <span className="mood-tile__word">{mood.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mood-search">
        <span aria-hidden className="mood-search__glyph">⌕</span>
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="mood-search__input"
          aria-label="Describe how you feel"
          placeholder="Or put your feeling into words…"
          spellCheck={false}
        />
        <button type="submit" className="mood-search__go" aria-label="Find writings">→</button>
      </form>
    </div>
  );
}
