import type { Post } from "@/lib/types";

/** #2 — a slow ticker of one-liners pulled from the poems. Pure CSS loop. */

function toItem(post: Post, i: number): string {
  const raw = (post.excerpt || post.title || "").replace(/[#*`]/g, "").trim();
  const sentence = raw.split(/(?<=[.!?…])\s/)[0] ?? raw;
  const short = sentence.length > 96 ? `${sentence.slice(0, 96).trimEnd()}…` : sentence;
  return short || "words, at late hours";
}

export default function QuoteMarquee({ poems }: { poems: Post[] }) {
  if (poems.length < 2) return null;
  const base = poems.map(toItem).filter(Boolean);
  // make it long enough to loop without a visible seam
  const lines: string[] = [];
  while (lines.length < Math.max(8, base.length * 2)) {
    lines.push(...base);
  }
  const half = lines.slice(0, Math.max(6, Math.ceil(lines.length / 2)));

  return (
    <section aria-label="Lines from the poems" className="relative overflow-hidden border-y border-[var(--border-color)] bg-[var(--bg-card)]/60 py-4">
      <div className="marquee-track items-center gap-10 pr-10">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center gap-10" aria-hidden={copy === 1}>
            {half.map((line, i) => (
              <span key={i} className="flex items-center gap-10 whitespace-nowrap">
                <span className="font-serif text-[1.05rem] italic text-[var(--text-muted)]">
                  &ldquo;{line}&rdquo;
                </span>
                <span className="text-[var(--accent)]">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
