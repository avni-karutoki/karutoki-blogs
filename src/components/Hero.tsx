"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import Link from "next/link";
import KarutokiLogo from "./KarutokiLogo";
import { CountUp, ScrollReveal, StaggerGroup, MotionLink } from "./MotionPrimitives";
import type { HeroSettings, Post } from "@/lib/types";
import { categoryLabel } from "@/lib/types";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Kinetic headline: each word springs up out of its own mask, one after another. */
function KineticTitle({ text }: { text: string }) {
  const words = text.split(/(\s+)/);
  return (
    <span aria-label={text} role="text">
      {words.map((word, i) =>
        /^\s+$/.test(word) ? (
          <span key={i}> </span>
        ) : (
          <span key={i} aria-hidden className="inline-block overflow-hidden px-[0.14em] py-[0.14em] -mx-[0.06em] -my-[0.04em] align-bottom">
            <motion.span
              className="inline-block"
              initial={{ y: "115%" }}
              animate={{ y: "0%" }}
              transition={{ type: "spring", stiffness: 110, damping: 16, mass: 0.9, delay: 0.15 + i * 0.07 }}
            >
              {word}
            </motion.span>
          </span>
        ),
      )}
    </span>
  );
}

// Collect up to 5 slides for the slideshow together with click targets.
// Priority: the admin-curated playlist → the single hero image → featured
// writings' covers. Slides open their linked writing when clicked.
function getSlideshowSlides(
  hero: HeroSettings,
  featured: Post[],
): { src: string; href?: string }[] {
  const slides: { src: string; href?: string }[] = [];
  const push = (src: string, href?: string) => {
    if (src && !slides.some((s) => s.src === src) && slides.length < 5) slides.push({ src, href });
  };

  const adminImages = (hero.slideshowImages ?? []).filter(Boolean);
  adminImages.forEach((src, i) => push(src, (hero.slideshowLinks ?? [])[i]));

  if (hero.imageUrl) push(hero.imageUrl);

  for (const post of featured) {
    if (post.cover_image) push(post.cover_image, post.slug);
    if (slides.length >= 5) break;
  }
  // Fallback so every slide is still clickable even without an explicit link.
  const latestSlug = featured[0]?.slug;
  return slides.map((s) => ({ src: s.src, href: s.href ?? latestSlug }));
}

export default function Hero({
  hero,
  featured,
  counts,
}: {
  hero: HeroSettings;
  featured: Post[];
  counts: { poems: number; blogs: number; talks: number };
}) {
  const slides = getSlideshowSlides(hero, featured);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const images = slides.map((s) => s.src);

  // Scroll-linked parallax: as the page scrolls, the hero image drifts and
  // zooms gently inside its frame while the copy column lifts away.
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-6%", "14%"]);
  // Admin zoom (100%–180%) scales the images inside the frame; scroll adds the parallax on top.
  const zoomPct = (hero.imageZoom ?? 100) / 100;
  const imgScale = useTransform(scrollYProgress, [0, 1], [zoomPct * 1.02, zoomPct * 1.2]);
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.45]);
  const glowDrift = useTransform(scrollYProgress, [0, 1], ["0%", "26%"]);

  // Auto-advance every 5 seconds when not hovered
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      if (!isHovered) {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length, isHovered]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const latest = featured[0];
  // Picture crop/adjust as set in the admin.
  const fit = hero.imageFit ?? "cover";
  const focus = `${hero.imagePosX ?? 50}% ${hero.imagePosY ?? 50}%`;

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* ambient glows — desktop only; mobile keeps things minimal */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
        <motion.div style={{ y: reduceMotion ? 0 : glowDrift }} className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[var(--accent-soft)] blur-2xl">
          <div style={{ animation: reduceMotion ? undefined : "float 8s ease-in-out infinite" }} />
        </motion.div>
        <motion.div style={{ y: reduceMotion ? 0 : glowDrift }} className="absolute -right-24 top-24 h-80 w-80 rounded-full bg-[var(--accent-soft)] blur-2xl">
          <div style={{ animation: reduceMotion ? undefined : "float 10s ease-in-out infinite 1s" }} />
        </motion.div>
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center justify-items-center gap-12 px-6 pb-14 pt-4 text-center md:justify-items-start md:grid-cols-[0.9fr_1.1fr] md:pb-20 md:pt-6 md:text-left">
        {/* Copy - Left side */}
        <motion.div style={{ y: reduceMotion ? 0 : copyY, opacity: reduceMotion ? 1 : copyOpacity }}>
          <StaggerGroup stagger={0.08} delay={0}>
            <ScrollReveal as="p" variant="fadeUp" className="eyebrow">
              ✦ Poems · Blogs · Midnight talks
            </ScrollReveal>
            <ScrollReveal as="h1" variant="fadeUp" className="mt-4">
              {reduceMotion ? (
                hero.title
              ) : (
                <KineticTitle text={hero.title} />
              )}
            </ScrollReveal>
            <ScrollReveal as="p" variant="fadeUp" className="lead mt-5 max-w-md md:mx-0 mx-auto">
              {hero.subtitle}
            </ScrollReveal>
            <ScrollReveal as="div" variant="fadeUp" className="mt-8 flex flex-wrap items-center justify-center gap-4 md:justify-start">
              <MotionLink href="/writings" className="btn-ink" whileHover={{ scale: 1.03 }}>
                {hero.buttonText || "Explore writings"} →
              </MotionLink>
              {latest && (
                <MotionLink href={`/writings/${latest.slug}`} className="ink-link font-sans text-[12.5px] font-semibold uppercase tracking-[0.2em] text-[var(--text-primary)]">
                  Read latest
                </MotionLink>
              )}
            </ScrollReveal>

            {/* stats */}
            <ScrollReveal as="dl" variant="fadeUp" className="mt-10 flex items-center justify-center gap-8 border-t border-[var(--border-color)] pt-6 md:justify-start md:w-auto w-full max-w-sm">
              {[
                { n: counts.poems, label: "Poems" },
                { n: counts.blogs, label: "Blogs" },
                { n: counts.talks, label: "Midnight talks" },
              ].map((s) => (
                <motion.div key={s.label} whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="font-script text-4xl leading-none text-[var(--text-heading)]">
                    {reduceMotion ? s.n : <CountUp value={s.n} duration={1.1} delay={0.5} />}
                  </dd>
                  <dd className="mt-1 font-sans text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[var(--text-faint)]">
                    {s.label}
                  </dd>
                </motion.div>
              ))}
            </ScrollReveal>
          </StaggerGroup>
        </motion.div>

        {/* Visual - Right side: Slideshow Rectangle */}
        <ScrollReveal variant="scale" delay={0.2} duration={0.85} className="relative mx-auto w-full max-w-xl md:mx-0 md:-ml-3 md:-mt-3 md:max-w-[44rem]">
          <div
            className="relative w-full aspect-[5/3] rounded-2xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[var(--shadow-card)]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Slideshow images (or an empty frame when no images exist) */}
            <div className="absolute inset-0">
              {slides.length > 0 ? (
                slides.map((slide, i) => {
                  const img = (
                    <motion.img
                      key={slide.src}
                      src={slide.src}
                      alt={`Hero slide ${i + 1}`}
                      className={`absolute inset-0 w-full h-full ${slide.href ? "cursor-pointer" : ""}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: currentIndex === i ? 1 : 0 }}
                      transition={{ duration: 0.8, ease: EASE }}
                      style={{ objectFit: fit, objectPosition: focus, y: reduceMotion ? 0 : imgY, scale: reduceMotion ? zoomPct : imgScale, willChange: "transform" }}
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                      fetchPriority={i === 0 ? "high" : "low"}
                    />
                  );
                  return slide.href ? (
                    <Link key={slide.src} href={slide.href} title="Read this piece →">
                      {img}
                    </Link>
                  ) : (
                    img
                  );
                })
              ) : (
                <div className="absolute inset-0 grid place-items-center">
                  <KarutokiLogo className="w-24 h-24 text-[var(--text-faint)]" />
                </div>
              )}
            </div>

            {/* Gradient overlay */}
            <div className="pointer-events-none absolute inset-0" style={{ background: "var(--hero-veil)" }} />

            {/* Slide indicators */}
            {images.length > 1 && (
              <div className="pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === currentIndex
                        ? "bg-[var(--accent)] w-6"
                        : "bg-[var(--text-faint)] hover:bg-[var(--text-muted)]"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                    aria-current={i === currentIndex ? "true" : "false"}
                  />
                ))}
              </div>
            )}

            {/* Previous/Next arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
                  className="pointer-events-auto absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-[var(--bg-card)]/80 backdrop-blur-sm border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-card)] hover:border-[var(--accent)] transition-colors"
                  aria-label="Previous slide"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
                  className="pointer-events-auto absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-[var(--bg-card)]/80 backdrop-blur-sm border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-card)] hover:border-[var(--accent)] transition-colors"
                  aria-label="Next slide"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </ScrollReveal>
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
        <motion.p 
          aria-hidden 
          className="mt-1 text-[var(--accent)]"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          ↓
        </motion.p>
      </div>
    </section>
  );
}
