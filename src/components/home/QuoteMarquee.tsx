import Link from "next/link";
import type { CSSProperties } from "react";
import type { Post } from "@/lib/types";
import { categoryLabel } from "@/lib/types";

/** #2 — a slow ticker of one-liners pulled from the newest writings.
 *  Pure CSS loop. The list is derived straight from the live `posts`
 *  table (ISR revalidate = 60), so every piece published in /admin
 *  drifts onto the strip on its own — no manual updates. */

function toQuote(post: Post): string {
  const raw = (post.excerpt || post.title || "").replace(/[#*`]/g, "").trim();
  // first complete sentence, else the whole excerpt
  const sentence = raw.split(/(?<=[.!?…])\s/)[0] ?? raw;
  const short = sentence.length > 110 ? `${sentence.slice(0, 110).trimEnd()}…` : sentence;
  return short || "words, at late hours";
}

interface MarqueeItem {
  slug: string;
  category: string;
  quote: string;
}

export default function QuoteMarquee({ writings }: { writings: Post[] }) {
  const base: MarqueeItem[] = writings
    .map((post) => ({
      slug: post.slug,
      category: categoryLabel(post.category),
      quote: toQuote(post),
    }))
    .filter((item) => item.quote.length > 0);

  if (base.length < 2) return null;

  // repeat until the strip is long enough to loop without a visible seam
  const items: MarqueeItem[] = [];
  while (items.length < Math.max(8, base.length * 2)) {
    items.push(...base);
  }
  const half = items.slice(0, Math.max(6, Math.ceil(items.length / 2)));
  // longer strips crawl slower so the pace feels constant
  const duration = Math.max(45, half.length * 7);

  return (
    <section
      aria-label="Lines from the latest writings"
      className="relative overflow-hidden border-y border-[var(--border-color)] bg-[var(--bg-card)]/60 py-4"
    >
      {/* soft vignette so lines melt in from the edges instead of popping */}
      <div className="quote-marquee-mask relative">
        <div
          className="marquee-track items-center pr-10"
          style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
        >
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className="flex shrink-0 items-center gap-10"
              aria-hidden={copy === 1}
            >
              {half.map((item, i) => (
                <span
                  key={`${item.slug}-${i}`}
                  className="flex items-center gap-10 whitespace-nowrap"
                >
                  <Link
                    href={`/writings/${item.slug}`}
                    className="marquee-quote group flex items-baseline gap-3 font-serif text-[1.05rem] italic"
                  >
                    <span className="marquee-quote-category font-sans text-[9px] font-semibold uppercase not-italic tracking-[0.25em] text-[var(--accent)] opacity-0 transition-opacity duration-300 group-hover:opacity-70">
                      {item.category}
                    </span>
                    <span className="text-[var(--text-muted)] transition-colors duration-300 group-hover:text-[var(--text-primary)]">
                      &ldquo;{item.quote}&rdquo;
                    </span>
                  </Link>
                  <span aria-hidden className="marquee-spark text-[var(--accent)]">
                    ✦
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
