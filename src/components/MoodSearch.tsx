"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * The "How do you feel today?" box — no suggested chips, just a blank
 * field. A typewriter keeps whispering example feelings until the reader
 * starts writing their own, then goes quiet. Enter (or the ✦ button)
 * searches writings by tag, title, or excerpt.
 */

const HINTS = [
  "rain…",
  "first love…",
  "hope…",
  "2 a.m. thoughts…",
  "longing…",
  "calm…",
  "a secret…",
  "missing someone…",
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

export default function MoodSearch({
  initial = "",
  category = "all",
  surpriseHref,
}: {
  /** the currently applied feeling, if any */
  initial?: string;
  category?: string;
  surpriseHref?: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [focused, setFocused] = useState(false);
  const showHint = value.length === 0 && !focused;

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

      {/* quiet companions under the field */}
      <div className="mt-3 flex items-center justify-center gap-5 font-sans text-[11px] font-semibold uppercase tracking-[0.18em]">
        <Link
          href={hrefFor("")}
          className={`transition hover:text-[var(--accent)] ${!value.trim() ? "text-[var(--accent)]" : "text-[var(--text-faint)]"}`}
        >
          <span aria-hidden>✧</span> All feelings
        </Link>
        {surpriseHref && (
          <Link
            href={surpriseHref}
            className="text-[var(--text-faint)] transition hover:text-[var(--accent)]"
          >
            <span aria-hidden>🎲</span> Surprise me
          </Link>
        )}
      </div>
    </div>
  );
}
