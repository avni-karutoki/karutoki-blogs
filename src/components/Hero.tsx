"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { HeroSettings, Post } from "@/lib/types";
import { categoryLabel } from "@/lib/types";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Hero({
  hero,
  featured,
  counts,
}: {
  hero: HeroSettings;
  featured: Post[];
  counts: { poems: number; blogs: number; talks: number };
}) {
  const latest = featured[0];
  const second = featured[1];
  const cover = hero.imageUrl || latest?.cover_image || null;

  return (
    <section className="relative overflow-hidden">
      {/* ambient glows — static, GPU-composited (no infinite repaint) */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[var(--accent-soft)] blur-2xl will-change-transform" />
        <div className="absolute -right-24 top-24 h-80 w-80 rounded-full bg-[var(--accent-soft)] blur-2xl will-change-transform" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-14 pt-14 md:grid-cols-[1.05fr_0.95fr] md:pb-20 md:pt-20">
        {/* Copy */}
        <div>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="eyebrow"
          >
            ✦ Poems · Blogs · Midnight talks
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.08, ease: EASE }}
            className="mt-4"
          >
            {hero.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18, ease: EASE }}
            className="lead mt-5 max-w-md"
          >
            {hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28, ease: EASE }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Link href="/writings" className="btn-ink">
              {hero.buttonText || "Explore writings"} →
            </Link>
            {latest && (
              <Link href={`/writings/${latest.slug}`} className="ink-link font-sans text-[12.5px] font-semibold uppercase tracking-[0.2em] text-[var(--text-primary)]">
                Read latest
              </Link>
            )}
          </motion.div>

          {/* stats */}
          <motion.dl
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.38, ease: EASE }}
            className="mt-10 flex items-center gap-8 border-t border-[var(--border-color)] pt-6"
          >
            {[
              { n: counts.poems, label: "Poems" },
              { n: counts.blogs, label: "Blogs" },
              { n: counts.talks, label: "Midnight talks" },
            ].map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-script text-4xl leading-none text-[var(--text-heading)]">
                  {s.n}
                </dd>
                <dd className="mt-1 font-sans text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[var(--text-faint)]">
                  {s.label}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.85, delay: 0.2, ease: EASE }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="photo-stack">
            <div className="layer" />
            <div className="layer" />
            <div className="layer overflow-hidden bg-[var(--bg-card)]!">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cover}
                  alt="Featured writing cover"
                  className="aspect-[4/5] w-full object-cover"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                />
              ) : (
                <div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-3 bg-[var(--bg-secondary)] p-8 text-center">
                  <span className="font-script text-5xl text-[var(--text-heading)]">K</span>
                  <p className="font-serif text-lg italic text-[var(--text-muted)]">
                    “Words for the things left unsaid.”
                  </p>
                  <p className="eyebrow">Karutoki</p>
                </div>
              )}
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: "var(--hero-veil)" }}
              />
            </div>
          </div>

          {/* floating cards — float only when motion is allowed */}
          {latest && (
            <Link
              href={`/writings/${latest.slug}`}
              className="vintage-card absolute -left-4 top-8 max-w-[210px] rounded-2xl! p-4 motion-safe:animate-float sm:-left-10"
            >
              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                {categoryLabel(latest.category)} · Latest
              </p>
              <p className="mt-1.5 font-script text-2xl leading-tight text-[var(--text-heading)]">
                {latest.title}
              </p>
            </Link>
          )}
          {second && (
            <Link
              href={`/writings/${second.slug}`}
              className="vintage-card absolute -bottom-5 -right-2 max-w-[200px] rounded-2xl! p-4 motion-safe:animate-float sm:-right-6"
            >
              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                {categoryLabel(second.category)}
              </p>
              <p className="mt-1.5 font-script text-2xl leading-tight text-[var(--text-heading)]">
                {second.title}
              </p>
            </Link>
          )}
        </motion.div>
      </div>

      {/* category marquee */}
      <div className="relative border-y border-[var(--border-color)] bg-[var(--bg-card)]/60 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-8 overflow-hidden px-6 font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-faint)]">
          <Link href="/poems" className="transition hover:text-[var(--accent)]">Poems</Link>
          <span className="text-[var(--accent)]">✦</span>
          <Link href="/blogs" className="transition hover:text-[var(--accent)]">Blogs</Link>
          <span className="text-[var(--accent)]">✦</span>
          <Link href="/midnight-talks" className="transition hover:text-[var(--accent)]">Midnight talks</Link>
          <span className="text-[var(--accent)]">✦</span>
          <Link href="/writings" className="hidden transition hover:text-[var(--accent)] sm:inline">All writings</Link>
        </div>
      </div>

      {/* gentle scroll cue into the featured writings */}
      <div className="relative mx-auto max-w-6xl px-6 pb-2 pt-6 text-center">
        <p className="font-sans text-[10.5px] font-semibold uppercase tracking-[0.28em] text-[var(--text-faint)]">
          Scroll for tonight&apos;s words
        </p>
        <p aria-hidden className="mt-1 animate-bounce text-[var(--accent)]">↓</p>
      </div>
    </section>
  );
}
