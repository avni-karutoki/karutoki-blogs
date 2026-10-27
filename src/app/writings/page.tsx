import Link from "next/link";
import Reveal, { SpringReveal } from "@/components/Reveal";
import { createPublicClient as createClient } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";
import { categoryLabel } from "@/lib/types";
import { FloatingElement } from "@/components/ScrollAnimations";
import { StaggerContainer } from "@/components/ScrollAnimations";
import { chipForWord } from "@/lib/mood";
import MoodSearch from "@/components/MoodSearch";

const tabs = [
  { key: "all", label: "All" },
  { key: "poem", label: "Poems" },
  { key: "blog", label: "Blogs" },
  { key: "midnight-talk", label: "Midnight Talks" },
];

async function getPosts(category: string, mood?: string): Promise<Post[]> {
  try {
    const supabase = await createClient();
    // Narrow columns: the list view never needs the full `content` body,
    // but tags are needed to match a feeling against.
    let query = supabase
      .from("posts")
      .select("id, slug, title, excerpt, cover_image, category, reading_time, created_at, tags")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (error) return [];

    let posts = (data as Post[]) || [];

    // The feeling is whatever the visitor wrote — match it loosely against
    // tags (the mood vocabulary), titles, and excerpts, case-insensitively.
    if (mood) {
      const m = mood.toLowerCase();
      posts = posts.filter((p) => {
        const haystack = [
          (p.tags ?? []).join(" "),
          p.title ?? "",
          p.excerpt ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(m);
      });
    }

    return posts;
  } catch {
    return [];
  }
}

/** The live mood vocabulary — every tag on a published piece, most-used
 *  first. Feeds the tappable emoji chips so a tap is never a dead end. */
async function getTagSuggestions(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("posts").select("tags").eq("published", true);
    if (error) return [];
    const counts = new Map<string, number>();
    for (const p of (data as { tags: string[] | null }[]) ?? []) {
      for (const tag of p.tags ?? []) {
        const t = tag.trim();
        if (!t) continue;
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([t]) => t);
  } catch {
    return [];
  }
}

export default async function WritingsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string }>;
}) {
  const params = await searchParams;
  const active = params?.category || "all";
  const activeTag = params?.tag?.trim() ?? "";

  const [posts, suggestions] = await Promise.all([
    getPosts(active, activeTag || undefined),
    getTagSuggestions(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-14 relative">
      <FloatingElement amplitude={20} duration={8} delay={0} className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[var(--accent-soft)] blur-2xl opacity-30"><div /></FloatingElement>
      <FloatingElement amplitude={15} duration={12} delay={1} className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-[var(--accent-soft)] blur-2xl opacity-30"><div /></FloatingElement>

      <Reveal>
        <p className="eyebrow">My writings</p>
        <h1 className="mt-2">A little piece of me, in every word.</h1>
        <p className="lead mt-3 max-w-md">
          Poems, blogs, midnight thoughts, and everything in between.
        </p>
      </Reveal>

      {/* reader mode — write your own feeling, the words answer */}
      <Reveal className="mood-picker mt-10">
        <div className="mood-picker__head">
          <p className="eyebrow">Reader mode</p>
          <h2 className="mood-picker__title font-script">How do you feel today?</h2>
          <p className="mood-picker__sub font-serif">
            A mood, or your own two words - either will find you the right kind of reading.
          </p>
        </div>

        <MoodSearch initial={activeTag} category={active} suggestions={suggestions} />

        {activeTag && (
          <p className="mood-picker__note mt-4 text-center font-serif text-sm italic text-[var(--text-muted)]">
            Moods grow from the words inside the pieces - a tag, a title, a line. Try
            the same feeling differently and a different sky may answer.
          </p>
        )}
      </Reveal>

      <div className="mt-10 flex gap-7 border-b border-[var(--border-color)] font-sans text-[12px] font-semibold uppercase tracking-[0.2em] relative z-10">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.key === "all" ? "/writings" : `/writings?category=${encodeURIComponent(t.key)}`}
            className={`-mb-px border-b pb-3 transition-colors ${active === t.key ? "border-[var(--accent)] text-[var(--text-heading)]" : "border-transparent text-[var(--text-faint)] hover:text-[var(--text-heading)]"}`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {activeTag && (
        <Reveal>
          <p className="mt-8 font-serif text-[1.05rem] italic text-[var(--accent)]">
            Tonight&apos;s words are wearing “{activeTag}”. ✧
          </p>
        </Reveal>
      )}

      <StaggerContainer
        stagger={0.08}
        delay={0.1}
        itemClassName="h-full"
        className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {posts.length === 0 && (
          <p className="body-text col-span-full">
            Nothing wearing that feeling yet - try another mood.
          </p>
        )}
        {posts.map((post, i) => (
          <SpringReveal
            key={post.slug}
            delay={Math.min(i, 5) * 0.06}
            whileHover={{ y: -8, boxShadow: "var(--shadow-card)" }}
            className="vintage-card group flex h-full flex-col p-5"
          >
            <Link href={`/writings/${post.slug}`} className="flex h-full flex-col">
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
          </SpringReveal>
        ))}
      </StaggerContainer>
    </div>
  );
}
