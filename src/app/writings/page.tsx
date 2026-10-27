import Link from "next/link";
import Reveal, { SpringReveal } from "@/components/Reveal";
import { createPublicClient as createClient } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";
import { categoryLabel } from "@/lib/types";
import { FloatingElement } from "@/components/ScrollAnimations";
import { StaggerContainer } from "@/components/ScrollAnimations";
import MoodSearch from "@/components/MoodSearch";

const tabs = [
  { key: "all", label: "All" },
  { key: "poem", label: "Poems" },
  { key: "blog", label: "Blogs" },
  { key: "midnight-talk", label: "Midnight Talks" },
];

const MOOD_WORDS: Record<string, string[]> = {
  happy: ["happy", "happiness", "joy", "joyful", "smile", "sunny", "delight", "cheerful", "laughter"],
  sad: ["sad", "sorrow", "grief", "tears", "cry", "lonely", "loss", "ache", "goodbye", "heartbreak", "melancholy"],
  calm: ["calm", "peace", "quiet", "stillness", "gentle", "soft", "serene", "rest", "slow", "mindful"],
  hopeful: ["hope", "hopeful", "light", "dawn", "believe", "grow", "healing", "brave", "strength", "tomorrow", "new beginning"],
};

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

    // Match a selected human mood (or a reader's own words) against the
    // writing's tags, title, and excerpt.
    if (mood) {
      const terms = MOOD_WORDS[mood.toLowerCase()] ?? [mood.toLowerCase()];
      posts = posts.filter((p) => {
        const haystack = [
          (p.tags ?? []).join(" "),
          p.title ?? "",
          p.excerpt ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return terms.some((term) => haystack.includes(term));
      });
    }

    return posts;
  } catch {
    return [];
  }
}

export default async function WritingsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; mood?: string }>;
}) {
  const params = await searchParams;
  const active = params?.category || "all";
  const activeMood = params?.mood?.trim() ?? "";

  const posts = await getPosts(active, activeMood || undefined);

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

      {/* A compact mood selector for readers */}
      <Reveal className="mood-picker mt-8">
        <div className="mood-picker__head">
          <p className="eyebrow">Reader mode</p>
          <h2 className="mood-picker__title font-script">How do you feel today?</h2>
          <p className="mood-picker__sub font-serif">Find a little something that meets you where you are.</p>
        </div>

        <MoodSearch initial={activeMood} category={active} />
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

      {activeMood && (
        <Reveal>
          <p className="mt-8 font-serif text-[1.05rem] italic text-[var(--accent)]">
            {MOOD_WORDS[activeMood.toLowerCase()] ? `Words for when you feel ${activeMood}.` : `Words close to “${activeMood}”.`} ✧
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
            No writings match that feeling yet. Try another mood.
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
