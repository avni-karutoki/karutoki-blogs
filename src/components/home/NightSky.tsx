import Link from "next/link";
import Reveal from "@/components/Reveal";

/** A fixed-midnight band with twinkling stars — the poetry of late hours.
 *  Deterministic star positions so SSR and client markup always match. */

const STAR_COUNT = 30;

function seeded(i: number): number {
  const x = Math.sin(i * 999.17) * 10000;
  return x - Math.floor(x);
}

export default function NightSky() {
  const stars = Array.from({ length: STAR_COUNT }, (_, i) => ({
    left: `${(seeded(i * 7 + 3) * 94 + 2).toFixed(1)}%`,
    top: `${(seeded(i * 13 + 5) * 72 + 6).toFixed(1)}%`,
    size: +(0.9 + seeded(i * 17 + 11) * 1.8).toFixed(1),
    delay: `${(seeded(i * 5 + 2) * 3.4).toFixed(2)}s`,
  }));

  return (
    <section className="night relative overflow-hidden py-20">
      {/* the sky */}
      <div aria-hidden className="stars absolute inset-0">
        {stars.map((s, i) => (
          <span
            key={i}
            style={{
              left: s.left,
              top: s.top,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDelay: s.delay,
            }}
          />
        ))}
      </div>

      <Reveal className="relative z-10 mx-auto max-w-2xl px-6 text-center">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.35em] text-[#d3a97e]">
          After midnight
        </p>
        <h2 className="mt-3 font-script text-4xl leading-snug text-[#efe4d3] sm:text-5xl">
          The talks that only happen when the house is asleep.
        </h2>
        <p className="mt-4 font-serif text-[1.05rem] italic leading-relaxed text-[#efe4d3]/70">
          &ldquo;Everything means more after 1 a.m. — even the quiet.&rdquo;
        </p>
        <Link
          href="/midnight-talks"
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#d3a97e]/40 px-6 py-2.5 font-sans text-[11px] font-semibold uppercase tracking-[0.25em] text-[#d3a97e] transition-colors hover:bg-[#d3a97e]/10"
        >
          Walk in ☾
        </Link>
      </Reveal>
    </section>
  );
}
