import Link from "next/link";
import Reveal, { SpringReveal } from "@/components/Reveal";
import Swirl from "@/components/Swirl";
import { FloatingElement } from "@/components/ScrollAnimations";

/** A lost page, spoken for gently — ink, a mark, and doors back home. */

const doors = [
  { href: "/", label: "The front desk", note: "start at the beginning" },
  { href: "/writings", label: "All writings", note: "poems, blogs, everything" },
  { href: "/archive", label: "The archive", note: "every page, threaded" },
  { href: "/midnight-talks", label: "Midnight talks", note: "when the house is asleep" },
];

export default function NotFound() {
  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 py-20 text-center">
      {/* a couple of ink blooms, like every other page */}
      <FloatingElement amplitude={20} duration={10} delay={0} className="absolute top-8 -right-6 h-28 w-28 rounded-full bg-[var(--accent-soft)] blur-2xl opacity-35"><div /></FloatingElement>
      <FloatingElement amplitude={16} duration={14} delay={1.4} className="absolute bottom-6 -left-8 h-24 w-24 rounded-full bg-[var(--accent-soft)] blur-2xl opacity-30"><div /></FloatingElement>

      <Reveal>
        <p className="eyebrow">Lost ink</p>
        <h1 className="mt-3 font-script text-5xl leading-snug text-[var(--text-heading)] sm:text-6xl">
          This page wandered off.
        </h1>
        <p className="mx-auto mt-4 max-w-md font-serif text-lg italic leading-relaxed text-[var(--text-muted)]">
          That&apos;s the trouble with ink — once something&apos;s gone, there&apos;s
          nothing to find. But your page is waiting just around the corner.
        </p>
        <div className="mt-5 flex justify-center">
          <Swirl className="text-[var(--accent)]" />
        </div>
      </Reveal>

      {/* doors back home */}
      <div className="mt-10 grid w-full gap-3 sm:grid-cols-2">
        {doors.map(({ href, label, note }, i) => (
          <SpringReveal key={href} delay={0.12 + i * 0.07} y={14}>
            <Link
              href={href}
              className="group flex items-center justify-between gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-5 py-4 text-left shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)]"
            >
              <span>
                <span className="block font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-heading)] transition-colors duration-300 group-hover:text-[var(--accent)]">
                  {label}
                </span>
                <span className="mt-0.5 block font-serif text-sm italic text-[var(--text-faint)]">
                  {note}
                </span>
              </span>
              <span aria-hidden className="text-[var(--accent)] transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </SpringReveal>
        ))}
      </div>
    </div>
  );
}
