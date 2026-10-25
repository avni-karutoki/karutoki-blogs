"use client";

import { useEffect, useRef, useState } from "react";

const WORD = "Karutoki".split("");

/**
 * First-visit overture, in the site's own style (inspired by Fraudora's logo
 * intro — reinterpreted for Karutoki's vintage, handwritten soul):
 *
 * 1. the open-book logo mark draws itself in, like ink on paper
 * 2. the mark is circled with a hand-sketched double ring, sparkles blink on
 * 3. the pages get written, line by line, and the mark starts to float
 * 4. "Karutoki" writes itself in calligraphy, letter by letter
 * 5. an ink droplet falls and seeds the accent flourish
 * 6. the page lifts away with a soft parallax, like a turned page
 *
 * Plays once per browser session (a session flag is set before the first
 * paint, so returning visitors never see a flash of it). Reduced-motion
 * visitors and no-JS visitors never see it at all.
 */
export default function IntroSplash() {
  const [done, setDone] = useState(false);
  const [lifting, setLifting] = useState(false);
  const pathsRef = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    const html = document.documentElement;
    // Skips resolved before paint by theme-init (html.intro-skip) or CSS —
    // this is just the cleanup pass so the overlay really unmounts.
    if (html.classList.contains("intro-skip")) {
      setDone(true);
      return;
    }
    try {
      sessionStorage.setItem("karutoki-intro", "done");
    } catch {
      /* storage blocked — the splash just replays each session load */
    }
    document.body.style.overflow = "hidden";

    // Ink-draw the book outlines: measure each path, set its dash to the
    // full length, then let the transition pull the offset to zero.
    pathsRef.current.forEach((path, i) => {
      if (!path) return;
      const len = path.getTotalLength();
      path.style.transition = "none";
      path.style.strokeDasharray = `${len}`;
      path.style.strokeDashoffset = `${len}`;
      void path.getBoundingClientRect(); // flush so the dash assignment sticks
      window.setTimeout(() => {
        path.style.transition = "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
        path.style.strokeDashoffset = "0";
      }, 180 + i * 110);
    });

    const liftAt = window.setTimeout(() => setLifting(true), 2900);
    const doneAt = window.setTimeout(() => {
      document.body.style.overflow = "";
      setDone(true);
    }, 3650);
    return () => {
      window.clearTimeout(liftAt);
      window.clearTimeout(doneAt);
      document.body.style.overflow = "";
    };
  }, []);

  if (done) return null;

  return (
    <div className={`intro-splash ${lifting ? "is-lifting" : ""}`} aria-live="polite">
      {/* ambient ink blooms behind everything */}
      <div className="intro-splash__bloom intro-splash__bloom--a" aria-hidden />
      <div className="intro-splash__bloom intro-splash__bloom--b" aria-hidden />

      <div className="intro-splash__inner">
        {/* the open-book mark, drawn in ink, floating inside its own halo */}
        <div className="intro-splash__stage">
          <div className="intro-splash__halo" aria-hidden />
          <span className="intro-splash__spark intro-splash__spark--a" aria-hidden>✦</span>
          <span className="intro-splash__spark intro-splash__spark--b" aria-hidden>✧</span>
          <span className="intro-splash__spark intro-splash__spark--c" aria-hidden>✦</span>
          <svg
            width="104"
            height="104"
            viewBox="0 0 44 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="intro-splash__book"
            aria-hidden
          >
            <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <path
                ref={(el) => { pathsRef.current[0] = el; }}
                d="M21 10C16 8 8 9 5 11V33C8 31 16 30 21 33V10Z"
                strokeWidth="1.6"
              />
              <path
                ref={(el) => { pathsRef.current[1] = el; }}
                d="M23 10C28 8 36 9 39 11V33C36 31 28 30 23 33V10Z"
                strokeWidth="1.6"
              />
            </g>
            {/* the writing on the pages, line by line as the ink settles */}
            <g stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="intro-faint">
              <path d="M9 16C13 15 17 15.5 19 16.5" />
              <path d="M9 21C13 20 17 20.5 19 21.5" />
              <path d="M25 16.5C27 15.5 31 15 35 16" />
              <path d="M25 21.5C27 20.5 31 20 35 21" />
            </g>
            <circle className="intro-dot" cx="22" cy="21" r="1.8" fill="var(--accent)" />
            {/* a hand-sketched ring, drawn like a soft pencil circling the mark */}
            <ellipse
              className="intro-ring"
              cx="22"
              cy="21"
              rx="20.5"
              ry="13.5"
              pathLength={100}
              strokeDasharray="100"
              strokeDashoffset="100"
              transform="rotate(-5 22 21)"
              stroke="var(--accent)"
              strokeWidth="0.8"
              fill="none"
              opacity="0.5"
            />
            {/* second pass — a lighter, offset partial stroke, like the pen redoing it */}
            <ellipse
              className="intro-ring intro-ring--second"
              cx="22"
              cy="21"
              rx="19.5"
              ry="12.5"
              pathLength={100}
              strokeDasharray="58 42"
              strokeDashoffset="58"
              transform="rotate(9 22 21)"
              stroke="var(--accent)"
              strokeWidth="0.7"
              fill="none"
              opacity="0.25"
            />
          </svg>
        </div>

        {/* the wordmark, written one letter at a time */}
        <h2 className="intro-splash__word font-script" aria-label="Karutoki">
          {WORD.map((ch, i) => (
            <span key={i} style={{ animationDelay: `${0.8 + i * 0.06}s` }}>
              {ch}
            </span>
          ))}
        </h2>

        <p className="intro-splash__sub font-sans" aria-hidden>
          Blogs
        </p>

        {/* an ink drop falls to the pen-line; the flourish grows from it */}
        <div className="intro-splash__seal" aria-hidden>
          <span className="intro-splash__inkdrop" />
          <div className="intro-splash__flourish" />
        </div>
      </div>
    </div>
  );
}
