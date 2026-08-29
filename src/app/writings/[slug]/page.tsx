import { createClient } from "@/lib/supabase/server";

export default async function WritingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();

  const { data: writing, error } = await supabase
    .from("posts")
    .select("id, title, slug, category, excerpt, content, created_at")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error || !writing) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--primary)]">
            Nothing here
          </p>

          <h1 className="mt-4 font-[var(--font-playfair)] text-4xl font-semibold">
            Writing not found
          </h1>

          <a
            href="/writings"
            className="mt-6 inline-block text-sm text-[var(--primary)] hover:underline"
          >
            ← Back to writings
          </a>
        </div>
      </main>
    );
  }

  const categoryName =
    writing.category === "poem"
      ? "Poem"
      : writing.category === "blog"
        ? "Blog"
        : "Midnight Talk";

  const formattedDate = new Date(writing.created_at).toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    },
  );

  return (
    <main className="min-h-screen">
      <article className="mx-auto max-w-4xl px-5 pb-24 pt-20 sm:px-8">
        {/* Category */}
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--primary)]">
            {categoryName}
          </p>

          {/* Title */}
          <h1 className="mt-5 font-[var(--font-playfair)] text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            {writing.title}
          </h1>

          {/* Date */}
          <p className="mt-4 text-sm text-[var(--foreground)]/45">
            {formattedDate}
          </p>

          {/* Excerpt */}
          {writing.excerpt && (
            <p className="mx-auto mt-6 max-w-2xl font-[var(--font-cormorant)] text-xl italic leading-relaxed text-[var(--foreground)]/60">
              {writing.excerpt}
            </p>
          )}
        </div>

        {/* FULL CONTENT */}
        <div className="mx-auto mt-16 max-w-2xl border-y border-[var(--border)] py-12">
          <div className="whitespace-pre-wrap font-[var(--font-cormorant)] text-xl leading-[2] text-[var(--foreground)]/80 sm:text-2xl">
            {writing.content}
          </div>
        </div>

        {/* Back */}
        <div className="mt-10 text-center">
          <a
            href={`/${writing.category === "poem" ? "poems" : writing.category === "blog" ? "blogs" : "midnight-talks"}`}
            className="text-sm font-medium text-[var(--primary)] transition hover:underline"
          >
            ← Back to {categoryName}s
          </a>
        </div>
      </article>
    </main>
  );
}