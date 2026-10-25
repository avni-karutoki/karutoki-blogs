import Link from "next/link";
import Reveal from "@/components/Reveal";
import Swirl from "@/components/Swirl";
import ThreadInk from "@/components/ThreadInk";
import { FloatingElement } from "@/components/ScrollAnimations";
import { createPublicClient as createClient } from "@/lib/supabase/server";
import { categoryLabel } from "@/lib/types";

export const revalidate = 60;

export const metadata = {
  title: "Archive — Karutoki",
  description: "Every writing, month by month, on one long thread.",
};

type Row = {
  slug: string;
  title: string;
  category: string;
  created_at: string;
  cover_image: string | null;
};

export default async function ArchivePage() {
  let posts: Row[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select("slug, title, category, created_at, cover_image")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(500);
    posts = (data as Row[]) || [];
  } catch {
    posts = [];
  }

  // Group newest-first: year → month → posts.
  const years = new Map<number, Map<string, { label: string; short: string; items: Row[] }>>();
  posts.forEach((p) => {
    const d = new Date(p.created_at);
    const y = d.getFullYear();
    if (!years.has(y)) years.set(y, new Map());
    const key = `${y}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const yearMap = years.get(y)!;
    if (!yearMap.has(key)) {
      yearMap.set(key, {
        label: d.toLocaleDateString("en-US", { month: "long" }),
        short: d.toLocaleDateString("en-US", { month: "short" }),
        items: [],
      });
    }
    yearMap.get(key)!.items.push(p);
  });

  return (
    <div className="relative mx-auto max-w-5xl px-6 pb-24 pt-14">
      {/* quiet desk — blooms, dust motes, sparkles, near the top only */}
      <FloatingElement amplitude={24} duration={11} delay={0} className="absolute -top-10 left-[8%] h-28 w-28 rounded-full bg-[var(--accent-soft)] blur-2xl opacity-40"><div /></FloatingElement>
      <FloatingElement amplitude={18} duration={14} delay={1.5} className="absolute top-40 -right-6 h-24 w-24 rounded-full bg-[var(--accent-soft)] blur-2xl opacity-35"><div /></FloatingElement>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[560px] overflow-hidden">
        <span className="archive-mote archive-mote--a" />
        <span className="archive-mote archive-mote--b" />
        <span className="archive-mote archive-mote--c" />
        <span className="archive-mote archive-mote--d" />
        <span className="twinkle twinkle--a">✦</span>
        <span className="twinkle twinkle--b">✦</span>
        <span className="archive-spark archive-spark--a">✦</span>
        <span className="archive-spark archive-spark--b">✦</span>
      </div>
      {/* ── Header ─────────────────────────────────────────────── */}
      <Reveal>
        <div className="relative text-center">
          <p className="eyebrow">The archive</p>
          <h1 className="mt-2">Everything, in order.</h1>
          <div className="mt-4 flex justify-center">
            <Swirl className="text-[var(--accent)]" />
          </div>
          <p className="body-text mt-3">
            {posts.length === 0
              ? "The desk is empty for now."
              : `${posts.length} ${posts.length === 1 ? "writing" : "writings"}, ${years.size === 1 ? "one month to the next" : "month by month"}, strung on one long thread.`}
          </p>
        </div>
      </Reveal>

      {posts.length > 0 && (
        <div className="relative mt-12">
          {/* ── The thread (faint track, then the ink Drawing down it) ── */}
          <div
            aria-hidden
            className="absolute bottom-0 left-[11px] top-0 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[var(--border-color)] to-transparent md:left-1/2"
          />
          <ThreadInk className="absolute bottom-0 left-[11px] top-0 w-[2px] -translate-x-1/2 md:left-1/2" />

          {[...years.entries()].map(([year, months], yi) => (
            <section key={year} className={yi > 0 ? "mt-16" : ""}>
              {/* Year medallion on the thread */}
              <Reveal>
                <div className="relative z-10 flex items-center gap-4 pl-10 md:justify-center md:pl-0">
                  <span className="h-px flex-1 bg-[var(--border-color)]" />
                  <span className="archive-year flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--accent-soft)] px-6 py-1.5 font-sans text-[11px] font-bold uppercase tracking-[0.4em] text-[var(--accent)] shadow-[var(--shadow-card)]">
                    {year}
                  </span>
                  <span className="h-px flex-1 bg-[var(--border-color)]" />
                </div>
              </Reveal>

              {[...months.entries()].map(([mkey, m], mi) => (
                <div key={mkey} className="mt-10">
                  {/* Month seal nodding on the thread */}
                  <Reveal delay={Math.min(mi, 3) * 0.04}>
                    <div className="relative z-10 flex justify-center">
                      <span className="archive-month flex items-center gap-2.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-5 py-2 shadow-[var(--shadow-card)]">
                        <span className="font-script text-xl leading-none text-[var(--accent)]">
                          {m.label}
                        </span>
                        <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--text-faint)]">
                          {m.items.length} {m.items.length === 1 ? "piece" : "pieces"}
                        </span>
                      </span>
                    </div>
                  </Reveal>

                  {/* Entries alternate around the thread (desktop) */}
                  <div className="mt-7 space-y-5">
                    {m.items.map((p, pi) => {
                      const gi = pi; // parity within the month is enough for alternation
                      const isLeft = gi % 2 === 0;
                      const d = new Date(p.created_at);
                      const day = d.toLocaleDateString("en-US", { day: "numeric" });
                      const initial = p.title.trim().charAt(0).toUpperCase() || "✦";
                      const card = (
                        <Link
                          href={`/writings/${p.slug}`}
                          className="vintage-card hover-lift flex items-center gap-4 p-4"
                        >
                          <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--accent-soft)]">
                            {p.cover_image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={p.cover_image}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <span className="grid h-full w-full place-items-center font-script text-2xl text-[var(--accent)]">
                                {initial}
                              </span>
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-serif text-[1.05rem] text-[var(--text-heading)] transition-colors group-hover:text-[var(--accent)]">
                              {p.title}
                            </span>
                            {/* compact meta — mobile */}
                            <span className="mt-1.5 flex items-center gap-2 md:hidden">
                              <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
                                {categoryLabel(p.category)}
                              </span>
                              <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]">
                                {m.short} {day}
                              </span>
                            </span>
                          </span>
                          {/* category — desktop tail */}
                          <span className="hidden shrink-0 rounded-full bg-[var(--accent-soft)] px-3 py-1 font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] md:block">
                            {categoryLabel(p.category)}
                          </span>
                        </Link>
                      );
                      return (
                        <div key={p.slug} className="group relative pl-10 md:pl-0 md:grid md:grid-cols-2">
                          {/* dot pinning this entry to the thread */}
                          <span aria-hidden className="timeline-dot left-[11px] top-8 md:left-1/2 md:top-9" />
                          <Reveal delay={Math.min(pi, 4) * 0.04} x={isLeft ? -26 : 26} y={16}>
                            <div className={isLeft ? "md:col-start-1 md:pr-12" : "md:col-start-2 md:pl-12"}>
                              {card}
                            </div>
                          </Reveal>
                          {/* big vintage day stamp on the off side — desktop */}
                          <div
                            className={`hidden md:block ${isLeft ? "md:col-start-2 md:pl-12" : "md:col-start-1 md:pr-12 md:text-right"}`}
                          >
                            <Reveal delay={Math.min(pi, 4) * 0.04 + 0.08} x={isLeft ? 22 : -22} y={16}>
                              <span className="archive-day font-script text-4xl leading-none text-[var(--text-heading)] transition-colors duration-300 group-hover:text-[var(--accent)]">
                                {day}
                              </span>
                              <span className="mt-1 block font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--text-faint)]">
                                {m.short} · {year}
                              </span>
                            </Reveal>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </section>
          ))}

          {/* End of the thread */}
          <div className="relative z-10 mt-14 flex justify-center">
            <Reveal>
              <span className="archive-end font-script text-2xl text-[var(--text-faint)]">— the end, for now —</span>
            </Reveal>
          </div>
        </div>
      )}

      {posts.length === 0 && (
        <div className="mt-16 text-center">
          <Reveal>
            <p className="font-script text-3xl text-[var(--text-faint)]">
              Nothing has been pinned up yet — check back soon.
            </p>
          </Reveal>
        </div>
      )}
    </div>
  );
}
