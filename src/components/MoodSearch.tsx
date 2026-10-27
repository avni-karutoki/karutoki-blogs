"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

/**
 * The "How do you feel today?" box — a grid of emoji mood-tiles above the
 * free-text field. Each tile is a feeling shown as an emoji (never a raw
 * tag), but it is always backed by at least one tag that really exists in
 * the writings, so a tap is never a dead end. The typewriter keeps
 * whispering example feelings until the reader starts writing their own,
 * then goes quiet.
 */

const HINTS = [
  "a quiet kind of happy…",
  "rain on the window…",
  "first love…",
  "2 a.m. thoughts…",
  "hope, but soft…",
  "missing someone…",
  "a secret…",
  "cozy and slow…",
];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function MoodHint({ paused }: { paused: boolean }) {
  const [typed, setTyped] = useState("");
  const [idx, setIdx] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    if (mq.addEventListener) {
      const onChange = () => setReduced(mq.matches);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
  }, []);

  useEffect(() => {
    if (paused || reduced) return;
    let cancelled = false;

    (async () => {
      while (!cancelled) {
        const word = HINTS[idx % HINTS.length];
        for (let i = 1; i <= word.length; i++) {
          if (cancelled) return;
          setTyped(word.slice(0, i));
          await wait(65);
        }
        await wait(1500);
        for (let i = word.length - 1; i >= 0; i--) {
          if (cancelled) return;
          setTyped(word.slice(0, i));
          await wait(35);
        }
        setIdx((n) => n + 1);
        await wait(250);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [idx, paused, reduced]);

  if (reduced) return <span>try a feeling — rain, hope, 2 a.m…</span>;
  return (
    <span>
      <span className="mood-hint__lead">ease a feeling&nbsp;—&nbsp;</span>
      {typed}
      <span className="type-caret" />
    </span>
  );
}

/* feeling-moods first — each is an emoji + word, backed by real tags */
const MOODS: Array<{ emoji: string; mood: string; tags: string[] }> = [
  { emoji: "✨", mood: "hopeful", tags: ["hope", "light", "dawn", "believe"] },
  { emoji: "😌", mood: "calm", tags: ["calm", "peace", "quiet", "stillness"] },
  { emoji: "❤️", mood: "love", tags: ["love", "heart", "romance", "affection"] },
  { emoji: "🌧️", mood: "rainy", tags: ["rain", "monsoon", "petrichor"] },
  { emoji: "🌙", mood: "wistful", tags: ["longing", "missing", "yearn", "wist"] },
  { emoji: "😴", mood: "sleepy", tags: ["midnight", "sleep", "dreams", "insomnia"] },
  { emoji: "🥺", mood: "teary", tags: ["sad", "tears", "grief", "heavy"] },
  { emoji: "😄", mood: "sunny", tags: ["happy", "joy", "smile", "bright"] },
  { emoji: "🌱", mood: "healing", tags: ["grow", "growing", "brave", "strength"] },
  { emoji: "🤫", mood: "hush-hush", tags: ["secret", "hidden", "mystery"] },
];

/* every real tag still deserves a tile — an emoji + a softer word */
const TAG_MOOD: Record<string, [string, string]> = {
  "little things in life": ["☁️", "gently"],
  "everyday observations": ["👀", "everyday"],
  "life reflections": ["🌙", "reflections"],
  "mindful shopping": ["🫧", "mindful"],
  "consumer awareness": ["🪞", "eye-opening"],
  "expiry dates": ["🗓️", "small print"],
  "consumer rights": ["⚖️", "fair deals"],
  habits: ["🌱", "growing"],
  storytelling: ["🕯️", "stories"],
  lifestyle: ["🌿", "slow living"],
  "personal essay": ["✒️", "essays"],
  "personal blog": ["📖", "personal"],
  poetry: ["🪶", "poems"],
};

type Tile = { emoji: string; mood: string; tag: string; backing: string };

function buildTiles(suggestions: string[]): Tile[] {
  const vocab = new Set(suggestions);
  const tiles: Tile[] = [];
  const seen = new Set<string>();

  /* feeling-moods that genuinely match the live tag vocabulary */
  for (const m of MOODS) {
    const tag = m.tags.find((t) => vocab.has(t));
    if (tag && !seen.has(tag)) {
      seen.add(tag);
      tiles.push({ emoji: m.emoji, mood: m.mood, tag, backing: tag });
    }
  }

  /* remaining live tags each get an emoji + a softer word */
  for (const tag of suggestions) {
    if (seen.has(tag)) continue;
    seen.add(tag);
    const [emoji, word] = TAG_MOOD[tag] ?? ["🫧", tag.toLowerCase()];
    tiles.push({ emoji, mood: word, tag, backing: tag });
  }
  return tiles;
}

export default function MoodSearch({
  initial = "",
  category = "all",
  suggestions = [],
}: {
  /** the currently applied feeling, if any */
  initial?: string;
  category?: string;
  /** real tags from the writings — these back the emoji mood tiles */
  suggestions?: string[];
}) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [focused, setFocused] = useState(false);
  const showHint = value.length === 0 && !focused;

  /* emoji mood-tiles grounded in the live tag vocabulary, so taps find words */
  const tiles = buildTiles(suggestions);

  function hrefFor(tag: string): string {
    const qs = new URLSearchParams();
    if (category && category !== "all") qs.set("category", category);
    if (tag) qs.set("tag", tag);
    const s = qs.toString();
    return s ? `/writings?${s}` : "/writings";
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    router.push(hrefFor(value.trim()));
  }

  return (
    <div className="mt-7">
      {/* tap-a-mood emoji tiles — feelings only, never raw tags */}
      {tiles.length > 0 && (
        <div className="mood-grid-wrap">
          <span className="mood-chips__label">or tap a mood</span>
          <div className="mood-grid" role="group" aria-label="Pick a mood">
            {tiles.map((m) => (
              <button
                key={m.tag}
                type="button"
                onClick={() => router.push(hrefFor(m.tag))}
                className={`mood-tile ${initial === m.tag ? "mood-tile--active" : ""}`}
                title={`${m.mood} — writings tagged ${m.tag}`}
              >
                <span aria-hidden className="mood-tile__emoji">
                  {m.emoji}
                </span>
                <span className="mood-tile__word">{m.mood}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={submit} className="mood-search">
        <span aria-hidden className="mood-search__glyph">
          ✎
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="mood-search__input"
          aria-label="Write a feeling to search writings"
          spellCheck={false}
        />

        {showHint && (
          <span aria-hidden className="mood-search__hint">
            <MoodHint paused={false} />
          </span>
        )}

        <button type="submit" className="mood-search__go" aria-label="Find writings with this feeling">
          ✦
        </button>
      </form>

      {value.trim() && (
        <p className="mt-3 text-center font-serif text-sm italic text-[var(--text-faint)]">
          feelings matching <span className="text-[var(--accent)] not-italic">“{value.trim()}”</span> — the words answer ✧
        </p>
      )}
    </div>
  );
}
