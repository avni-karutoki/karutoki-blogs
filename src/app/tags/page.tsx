import Link from "next/link";
import Reveal from "@/components/Reveal";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

export const metadata = {
  title: "Tags — Karutoki",
  description: "Browse every writing by tag.",
};

export default async function TagsPage() {
  const counts = new Map<string, number>();
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select("tags")
      .eq("published", true)
      .limit(500);
    ((data as { tags: string[] | null }[]) || []).forEach((p) => {
      (p.tags || []).forEach((t) => {
        const tag = t.trim();
        if (tag) counts.set(tag, (counts.get(tag) ?? 0) + 1);
      });
    });
  } catch {
    /* empty state below */
  }

  const tags = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  return (
    <div className="mx-auto max-w-3xl px-6 py-14 text-center">
      <Reveal>
        <p className="eyebrow">Browse by tag</p>
        <h1 className="mt-2">Little labels.</h1>
        <p className="lead mx-auto mt-3 max-w-md">
          Every label I&apos;ve ever pinned to a feeling.
        </p>
      </Reveal>

      {tags.length === 0 ? (
        <p className="body-text mt-12">No tags yet — they appear here once writings use them.</p>
      ) : (
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {tags.map(([tag, n], i) => (
            <Reveal key={tag} delay={Math.min(i, 8) * 0.04}>
              <Link
                href={`/tags/${encodeURIComponent(tag)}`}
                className="vintage-card group inline-flex items-center gap-2 px-5 py-3"
              >
                <span className="font-serif text-lg text-[var(--text-heading)] transition-colors group-hover:text-[var(--accent)]">
                  #{tag}
                </span>
                <span className="font-sans text-[11px] text-[var(--text-faint)]">
                  {n}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
