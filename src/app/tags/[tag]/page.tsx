import Link from "next/link";
import Reveal from "@/components/Reveal";
import { createPublicClient as createClient } from "@/lib/supabase/server";
import { categoryLabel } from "@/lib/types";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select("tags")
      .eq("published", true)
      .limit(500);
    const tags = new Set<string>();
    ((data as { tags: string[] | null }[]) || []).forEach((p) =>
      (p.tags || []).forEach((t) => {
        const tag = t.trim();
        if (tag) tags.add(tag);
      })
    );
    return [...tags].slice(0, 100).map((tag) => ({ tag }));
  } catch {
    return [];
  }
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);

  type Row = {
    slug: string;
    title: string;
    excerpt: string | null;
    category: string;
    tags: string[] | null;
    created_at: string;
  };
  let posts: Row[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select("slug, title, excerpt, category, tags, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(500);
    posts = ((data as Row[]) || []).filter((p) =>
      (p.tags || []).some((t) => t.trim().toLowerCase() === decoded.toLowerCase())
    );
  } catch {
    posts = [];
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <Reveal>
        <p className="eyebrow text-center">Tag</p>
        <h1 className="mt-2 text-center">#{decoded}</h1>
        <p className="body-text mt-3 text-center">
          {posts.length === 0
            ? "Nothing filed under this yet."
            : `${posts.length} ${posts.length === 1 ? "writing" : "writings"}`}
        </p>
      </Reveal>

      <div className="mt-10 space-y-4">
        {posts.map((p, i) => (
          <Reveal key={p.slug} delay={Math.min(i, 5) * 0.06}>
            <Link href={`/writings/${p.slug}`} className="vintage-card group block p-6">
              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                {categoryLabel(p.category)}
              </p>
              <h3 className="mt-2 transition-colors group-hover:text-[var(--accent)]">
                {p.title}
              </h3>
              {p.excerpt && (
                <p className="mt-2 line-clamp-2 font-serif text-[0.98rem] leading-relaxed text-[var(--text-muted)]">
                  {p.excerpt}
                </p>
              )}
            </Link>
          </Reveal>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/tags"
          className="ink-link font-sans text-[12px] font-semibold uppercase tracking-[0.2em]"
        >
          ← All tags
        </Link>
      </div>
    </div>
  );
}
