import Link from "next/link";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import { createClient } from "@/lib/supabase/server";
import { categoryLabel } from "@/lib/types";

export default async function RecentWritings() {
  let writings: { id: string; title: string; slug: string; category: string; excerpt: string | null; created_at: string }[] = [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("posts")
      .select("id, title, slug, category, excerpt, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(3);
    if (!error && data) writings = data;
  } catch {
    return null;
  }

  if (writings.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <Reveal>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="From the journal"
            title="Recent Writings"
          />
          <Link
            href="/writings"
            className="ink-link hidden font-sans text-[12px] font-semibold uppercase tracking-[0.2em] sm:block"
          >
            View all →
          </Link>
        </div>
      </Reveal>

      <div className="grid gap-6 md:grid-cols-3">
        {writings.map((writing, i) => (
          <Reveal key={writing.id} delay={i * 0.08}>
            <Link href={`/writings/${writing.slug}`} className="group block h-full">
              <article className="vintage-card h-full p-7">
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
                  {categoryLabel(writing.category)}
                </p>
                <h3 className="mt-3">{writing.title}</h3>
                {writing.excerpt && (
                  <p className="mt-3 line-clamp-3 font-serif text-[1.02rem] leading-relaxed text-[var(--text-muted)]">
                    {writing.excerpt}
                  </p>
                )}
                <span className="mt-6 inline-block font-sans text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)] transition-transform duration-300 group-hover:translate-x-1">
                  Read →
                </span>
              </article>
            </Link>
          </Reveal>
        ))}
      </div>

      <Link
        href="/writings"
        className="ink-link mt-8 block text-center font-sans text-[12px] font-semibold uppercase tracking-[0.2em] sm:hidden"
      >
        View all writings →
      </Link>
    </section>
  );
}
