import Link from "next/link";
import Reveal from "@/components/Reveal";
import { createPublicClient as createClient } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";
import { categoryLabel } from "@/lib/types";

const tabs = [
  { key: "all", label: "All" },
  { key: "poem", label: "Poems" },
  { key: "blog", label: "Blogs" },
  { key: "midnight-talk", label: "Midnight Talks" },
];

async function getPosts(category: string): Promise<Post[]> {
  try {
    const supabase = await createClient();
    // Narrow columns: the list view never needs the full `content` body.
    let query = supabase
      .from("posts")
      .select("id, slug, title, excerpt, cover_image, category, reading_time, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (error) return [];
    return (data as Post[]) || [];
  } catch {
    return [];
  }
}

export default async function WritingsPage({  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const active = params?.category || "all";
  const posts = await getPosts(active);

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <Reveal>
        <p className="eyebrow">My writings</p>
        <h1 className="mt-2">Words, I have left behind.</h1>
        <p className="lead mt-3 max-w-md">
          Poems, blogs, midnight thoughts, and everything in between.
        </p>
      </Reveal>

      <div className="mt-10 flex gap-7 border-b border-[var(--border-color)] font-sans text-[12px] font-semibold uppercase tracking-[0.2em]">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.key === "all" ? "/writings" : `/writings?category=${encodeURIComponent(t.key)}`}
            className={`-mb-px border-b pb-3 transition-colors ${
              active === t.key
                ? "border-[var(--accent)] text-[var(--text-heading)]"
                : "border-transparent text-[var(--text-faint)] hover:text-[var(--text-heading)]"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.length === 0 && (
          <p className="body-text col-span-full">Nothing here yet under this theme.</p>
        )}
        {posts.map((post, i) => (
          <Reveal key={post.slug} delay={Math.min(i, 5) * 0.06}>
            <Link href={`/writings/${post.slug}`} className="vintage-card group block h-full p-5">
              {post.cover_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="mb-4 aspect-[16/10] w-full rounded-xl border border-[var(--border-color)] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              ) : null}
              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                {categoryLabel(post.category)}
              </p>
              <h3 className="mt-2 text-[1.65rem]! leading-snug transition-colors group-hover:text-[var(--accent)]">
                {post.title}
              </h3>
              <p className="mt-2 line-clamp-3 font-serif text-[0.98rem] leading-relaxed text-[var(--text-muted)]">
                {post.excerpt}
              </p>
              <p className="mt-4 font-sans text-[11px] text-[var(--text-faint)]">
                {post.reading_time ? `${post.reading_time} read` : ""}
              </p>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
