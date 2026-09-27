import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Swirl from "@/components/Swirl";
import type { Post } from "@/lib/types";
import { categoryLabel } from "@/lib/types";

async function getPost(slug: string): Promise<Post | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  return data as Post | null;
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

export default async function WritingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const { prev, next } = await getNeighbours(post.created_at);

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <p className="eyebrow text-center">{categoryLabel(post.category)}</p>
      <h1 className="mt-3 text-center">{post.title}</h1>
      <p className="mt-4 text-center font-sans text-[12px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
        {new Date(post.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
        {post.reading_time ? ` · ${post.reading_time} read` : ""}
      </p>
      <div className="mt-4 flex justify-center">
        <Swirl className="text-[var(--accent)]" />
      </div>

      {post.cover_image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover_image}
          alt={post.title}
          className="mt-8 aspect-[16/9] w-full rounded-2xl border border-[var(--border-color)] object-cover shadow-[var(--shadow-card)]"
        />
      ) : null}

      {post.excerpt && (
        <p className="mt-8 text-center font-serif text-xl italic leading-relaxed text-[var(--text-muted)]">
          “{post.excerpt}”
        </p>
      )}

      {post.tags && post.tags.length > 0 && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[var(--border-color)] bg-[var(--accent-soft)] px-3 py-1 font-sans text-[11px] font-medium text-[var(--accent)]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <article className="mt-10 whitespace-pre-line font-serif text-[1.18rem] leading-[1.85] text-[var(--text-primary)]">
        {post.content}
      </article>

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
    </div>
  );
}
