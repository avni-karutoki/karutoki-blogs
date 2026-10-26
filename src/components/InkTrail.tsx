"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { categoryLabel } from "@/lib/types";
import { formatDate } from "@/lib/date";

/**
 * A quiet horizontal ghost of the /archive page: the newest writings as
 * stops along one thread. The ink runs left → right as you scroll (or as
 * you swipe the strip on small screens), a comet spark glides the whole
 * line on its own, and each stop reveals itself when the thread reaches it.
 */

export interface TrailStop {
  slug: string;
  title: string;
  category: string;
  iso: string;
}

export default function InkTrail({ items }: { items: TrailStop[] }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const surrogate = wrap.querySelector<HTMLElement>(".trail-scroller");
    const fill = wrap.querySelector<HTMLElement>(".trail-fill");
    if (!surrogate || !fill) return;

    let raf = 0;

    const update = () => {
      raf = 0;
      let p: number;
      if (surrogate.scrollWidth > surrogate.clientWidth + 8) {
        // narrow screens: progress follows the horizontal swipe
        const max = surrogate.scrollWidth - surrogate.clientWidth;
        p = max > 0 ? surrogate.scrollLeft / max : 1;
      } else {
        // wide screens: progress follows vertical scroll
        const r = surrogate.getBoundingClientRect();
        p = r.height > 0 ? (window.innerHeight * 0.62 - r.top) / r.height : 0;
      }
      fill.style.setProperty(
        "--trail-fill",
        `${(Math.min(1, Math.max(0, p)) * 100).toFixed(1)}%`,
      );
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    surrogate.addEventListener("scroll", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      surrogate.removeEventListener("scroll", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <section ref={wrapRef} aria-label="Recent writings along one thread" className="relative overflow-x-clip py-8">
      <Reveal>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">The trip so far</p>
            <p className="mt-1 font-script text-3xl text-[var(--text-heading)]">
              Fresh ink, strung on a thread
            </p>
          </div>
          <Link
            href="/archive"
            className="ink-link shrink-0 font-sans text-[11.5px] font-semibold uppercase tracking-[0.2em]"
            title="Every writing, month by month"
          >
            the whole thread →
          </Link>
        </div>
      </Reveal>

      <div className="trail-scroller mt-6 overflow-x-auto pb-1">
        <div
          className="trail-inner relative grid w-full"
          style={{
            gridTemplateColumns: `repeat(${items.length}, minmax(205px, 1fr))`,
            minWidth: `${items.length * 218}px`,
          }}
        >
          {/* the thread: faint track, inked fill, and a comet gliding it */}
          <div aria-hidden className="trail-line absolute left-0 right-0 top-1/2">
            <span className="trail-fill" />
            <span className="trail-comet">✦</span>
          </div>

          {items.map((item, i) => {
            const even = i % 2 === 0;
            return (
              <div key={item.slug} className="trail-stop group relative h-[118px]">
                <span aria-hidden className="trail-dot" />
                {/* top half — date or title, depending on parity */}
                <Reveal y={12} delay={i * 0.08} className="trail-slot trail-slot--top">
                  {even ? (
                    <Link href={`/writings/${item.slug}`} className="trail-date block">
                      {formatDate(item.iso, { day: "numeric", month: "short" })}
                    </Link>
                  ) : (
                    <Link href={`/writings/${item.slug}`} className="trail-title block">
                      {item.title}
                    </Link>
                  )}
                </Reveal>
                {/* bottom half */}
                <Reveal y={12} delay={i * 0.08 + 0.05} className="trail-slot trail-slot--bottom">
                  {even ? (
                    <Link href={`/writings/${item.slug}`} className="trail-title block">
                      {item.title}
                    </Link>
                  ) : (
                    <Link href={`/writings/${item.slug}`} className="trail-date block">
                      {formatDate(item.iso, { day: "numeric", month: "short" })}
                    </Link>
                  )}
                </Reveal>
                <Link
                  href={`/writings/${item.slug}`}
                  className={`trail-cat absolute left-1/2 -translate-x-1/2 font-sans text-[8.5px] font-bold uppercase tracking-[0.22em] text-[var(--text-faint)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
                    even ? "top-[calc(50%+9px)]" : "bottom-[calc(50%+9px)]"
                  }`}
                >
                  {categoryLabel(item.category)}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
