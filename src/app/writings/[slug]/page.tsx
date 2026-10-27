import Link from "next/link";
import { notFound } from "next/navigation";
import { createPublicClient as createClient } from "@/lib/supabase/server";
import Swirl from "@/components/Swirl";
import Reveal, { SpringReveal } from "@/components/Reveal";
import LikeButton from "@/components/LikeButton";
import ViewCounter from "@/components/ViewCounter";
import ShareButtons from "@/components/ShareButtons";
import ReadingProgress from "@/components/ReadingProgress";
import FontSizeToggle from "@/components/FontSizeToggle";
import WritingComments from "@/components/WritingComments";
import ReadAloud from "@/components/ReadAloud";
import type { Post } from "@/lib/types";
import { categoryLabel } from "@/lib/types";
import { formatDate } from "@/lib/date";

// Cache rendered posts for 60s; slugs not known at build time are
// rendered on demand and then cached (no per-visit Supabase waterfall).
export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select("slug")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(100);
    return ((data as { slug: string }[]) || []).map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

async function getPost(slug: string): Promise<Post | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single();
    if (error || !data) return null;
    return data as Post;
  } catch {
    return null;
  }
}

async function getNeighbours(createdAt: string) {
  const supabase = await createClient();
  const [{ data: prev }, { data: next }] = await Promise.all([
    supabase
      .from("posts")
      .select("slug, title")
      .eq("published", true)
      .lt("created_at", createdAt)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("posts")
      .select("slug, title")
      .eq("published", true)
      .gt("created_at", createdAt)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);
  return { prev, next };
}

async function getRelated(category: string, slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("slug, title, excerpt")
    .eq("published", true)
    .eq("category", category)
    .neq("slug", slug)
    .order("created_at", { ascending: false })
    .limit(3);
  return (data as { slug: string; title: string; excerpt: string | null }[]) || [];
}

export default async function WritingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const [{ prev, next }, related] = await Promise.all([
    getNeighbours(post.created_at),
    getRelated(post.category, post.slug),
  ]);

  // The body renders block by block so each paragraph fades in as the
  // reader scrolls to it (same treatment as the About page story).
  const contentBlocks = post.content
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <ReadingProgress />
      <Reveal>
        <p className="eyebrow text-center">{categoryLabel(post.category)}</p>
        <h1 className="mt-3 text-center">{post.title}</h1>
        <p className="mt-4 text-center font-sans text-[12px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
          {formatDate(post.created_at, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
          {post.reading_time ? ` · ${post.reading_time} read` : ""}
        </p>
        <div className="mt-4 flex justify-center">
          <Swirl className="text-[var(--accent)]" />
        </div>
      </Reveal>

      {post.cover_image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <Reveal>
          <img
            src={post.cover_image}
            alt={post.title}
            className="mt-8 aspect-[16/9] w-full rounded-2xl border border-[var(--border-color)] object-cover shadow-[var(--shadow-card)]"
          />
        </Reveal>
      ) : null}

      {post.excerpt && (
        <Reveal>
          <p className="mt-8 text-center font-serif text-xl italic leading-relaxed text-[var(--text-muted)]">
            “{post.excerpt}”
          </p>
        </Reveal>
      )}

      {post.tags && post.tags.length > 0 && (
        <Reveal>
          <div
            className="writing-tags mt-6 flex flex-wrap justify-center gap-2"
            tabIndex={0}
            aria-label="Writing tags. Focus or hover to reveal all tags."
          >
            {post.tags.slice(0, 5).map((tag) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
                className="rounded-full border border-[var(--border-color)] bg-[var(--accent-soft)] px-3 py-1 font-sans text-[11px] font-medium text-[var(--accent)] transition-colors hover:border-[var(--accent)]"
              >
                #{tag}
              </Link>
            ))}
            {post.tags.length > 5 && (
              <>
                <span className="writing-tags__ellipsis" aria-hidden="true">…</span>
                {post.tags.slice(5).map((tag) => (
                  <Link
                    key={tag}
                    href={`/tags/${encodeURIComponent(tag)}`}
                    className="writing-tags__extra rounded-full border border-[var(--border-color)] bg-[var(--accent-soft)] px-3 py-1 font-sans text-[11px] font-medium text-[var(--accent)] transition-colors hover:border-[var(--accent)]"
                  >
                    #{tag}
                  </Link>
                ))}
              </>
            )}
          </div>
        </Reveal>
      )}

      <Reveal>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
          {/* keyed by slug so counts reset when navigating between posts */}
          <ViewCounter key={`v-${post.slug}`} slug={post.slug} initialViews={post.views ?? 0} />
          <LikeButton key={`l-${post.slug}`} slug={post.slug} initialLikes={post.likes ?? 0} />
          <FontSizeToggle />
          <ReadAloud
            key={`r-${post.slug}`}
            title={post.title}
            text={post.content.replace(/[#*]/g, "")}
          />
        </div>
      </Reveal>

      {/* the body, revealed paragraph by paragraph while scrolling */}
      <article className="reading-body mt-10 font-serif leading-[1.85] text-[var(--text-primary)]">
        {contentBlocks.map((block, i) => (
          <Reveal key={i}>
            <p className={`${i > 0 ? "mt-7" : ""} whitespace-pre-line`}>
              {block}
            </p>
          </Reveal>
        ))}
      </article>

      {/* extra pictures attached to the writing — each drops in as you scroll */}
      {post.gallery_images && post.gallery_images.length > 0 && (
        <section className="mt-14">
          <Reveal>
            <p className="eyebrow text-center">More moments</p>
          </Reveal>
          <div className="mt-6 flex flex-wrap justify-center gap-5">
            {post.gallery_images.map((src, i) => (
              <Reveal key={`${src}-${i}`} delay={i * 0.12} y={30} scale={0.85}>
                <div
                  className="vintage-card w-40 p-2 pb-3 transition-transform duration-300 hover:-translate-y-1 sm:w-44"
                  style={{ transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`${post.title} — moment ${i + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="aspect-square w-full rounded-sm object-cover"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <Reveal>
        <div className="mt-10">
          <ShareButtons key={`s-${post.slug}`} title={post.title} />
        </div>
      </Reveal>

      {/* Threaded comments — replies allowed, everyone reads everyone */}
      <WritingComments postId={post.id} />

      {related.length > 0 && (
        <section className="mt-14 border-t border-[var(--border-color)] pt-10">
          <Reveal>
            <p className="eyebrow text-center">Keep reading</p>
          </Reveal>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {related.map((r, i) => (
              <SpringReveal key={r.slug} delay={i * 0.08} whileHover={{ y: -6 }}>
                <Link href={`/writings/${r.slug}`} className="vintage-card group block p-5">
                  <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                    {categoryLabel(post.category)}
                  </p>
                  <p className="mt-2 font-script text-2xl leading-tight text-[var(--text-heading)] transition-colors group-hover:text-[var(--accent)]">
                    {r.title}
                  </p>
                  {r.excerpt && (
                    <p className="mt-2 line-clamp-2 font-serif text-sm leading-relaxed text-[var(--text-muted)]">
                      {r.excerpt}
                    </p>
                  )}
                </Link>
              </SpringReveal>
            ))}
          </div>
        </section>
      )}

      <Reveal>
        <div className="mt-16 grid gap-4 border-t border-[var(--border-color)] pt-8 sm:grid-cols-3 sm:items-center">
          <div>
            {prev ? (
              <Link href={`/writings/${prev.slug}`} className="group block">
                <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-faint)]">← Previous</span>
                <span className="mt-1 block font-script text-2xl leading-tight text-[var(--text-heading)] transition-colors group-hover:text-[var(--accent)]">
                  {prev.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
          </div>
          <div className="text-center">
            <Link href="/writings" className="ink-link font-sans text-[12px] font-semibold uppercase tracking-[0.2em]">
              All writings
            </Link>
          </div>
          <div className="sm:text-right">
            {next ? (
              <Link href={`/writings/${next.slug}`} className="group block">
                <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-faint)]">Next →</span>
                <span className="mt-1 block font-script text-2xl leading-tight text-[var(--text-heading)] transition-colors group-hover:text-[var(--accent)]">
                  {next.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
