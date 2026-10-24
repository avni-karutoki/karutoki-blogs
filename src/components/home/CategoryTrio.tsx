import Link from "next/link";
import Reveal from "@/components/Reveal";
import { StaggerContainer } from "@/components/ScrollAnimations";

/** #3 — three browsing cards, one per category. Midnight talks gets the dark card. */

const CARDS = [
  {
    href: "/poems",
    label: "Poems",
    countKey: "poems" as const,
    blurb: "Verses written at hours that don't need explaining.",
    mark: "❀",
  },
  {
    href: "/blogs",
    label: "Blogs",
    countKey: "blogs" as const,
    blurb: "The small things that quietly shape a day.",
    mark: "✎",
  },
];

export default function CategoryTrio({ counts }: { counts: { poems: number; blogs: number; talks: number } }) {
  return (
    <section aria-label="Browse by category" className="border-t border-[var(--border-color)] py-16">
      <Reveal className="mb-10">
        <h2 className="text-center">Pick a mood</h2>
      </Reveal>
      <StaggerContainer stagger={0.1} className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
        {CARDS.map((card) => (
          <Reveal key={card.href} className="h-full">
            <Link
              href={card.href}
              className="vintage-card hover-lift group flex h-full flex-col items-center p-6 text-center"
            >
              <span aria-hidden className="text-2xl text-[var(--accent)]">{card.mark}</span>
              <span className="mt-3 font-script text-3xl text-[var(--text-heading)]">{card.label}</span>
              <span className="mt-1 font-sans text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
                {counts[card.countKey]} {counts[card.countKey] === 1 ? "piece" : "pieces"}
              </span>
              <span className="mt-3 font-serif text-[0.95rem] leading-relaxed text-[var(--text-muted)]">
                {card.blurb}
              </span>
              <span className="ink-link mt-4 font-sans text-[11.5px] font-semibold uppercase tracking-[0.2em]">
                Browse →
              </span>
            </Link>
          </Reveal>
        ))}
        {/* the dark island card */}
        <Reveal className="h-full">
          <Link
            href="/midnight-talks"
            className="group night relative flex h-full flex-col items-center overflow-hidden rounded-2xl border border-white/10 p-6 text-center shadow-[var(--shadow-card)] transition-transform duration-300 hover:-translate-y-2"
          >
            <span aria-hidden className="text-2xl text-[#d3a97e]">☾</span>
            <span className="mt-3 font-script text-3xl text-[#efe4d3]">Midnight talks</span>
            <span className="mt-1 font-sans text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#efe4d3]/50">
              {counts.talks} {counts.talks === 1 ? "piece" : "pieces"}
            </span>
            <span className="mt-3 font-serif text-[0.95rem] leading-relaxed text-[#efe4d3]/70">
              The thoughts that only show up after everyone&apos;s asleep.
            </span>
            <span className="mt-4 font-sans text-[11.5px] font-semibold uppercase tracking-[0.2em] text-[#d3a97e]">
              Browse →
            </span>
          </Link>
        </Reveal>
      </StaggerContainer>
    </section>
  );
}
