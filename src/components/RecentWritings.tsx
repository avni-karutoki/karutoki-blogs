import { createClient } from "@/lib/supabase/server";

export default async function RecentWritings() {
  const supabase = await createClient();

  const { data: writings, error } = await supabase
    .from("posts")
    .select("id, title, slug, category, excerpt, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    return null;
  }

  if (!writings || writings.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--primary)]">
            From the journal
          </p>

          <h2 className="mt-3 font-[var(--font-playfair)] text-3xl font-semibold sm:text-4xl">
            Recent Writings
          </h2>
        </div>

        <a
          href="/writings"
          className="hidden text-sm text-[var(--primary)] transition hover:underline sm:block"
        >
          View all →
        </a>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {writings.map((writing) => {
          const category =
            writing.category === "poem"
              ? "Poem"
              : writing.category === "blog"
                ? "Blog"
                : "Midnight Talk";

          return (
            <a
              key={writing.id}
              href={`/writings/${writing.slug}`}
              className="group block"
            >
              <article className="h-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--primary)]">
                  {category}
                </p>

                <h3 className="mt-4 font-[var(--font-playfair)] text-2xl font-semibold">
                  {writing.title}
                </h3>

                {writing.excerpt && (
                  <p className="mt-3 font-[var(--font-cormorant)] text-lg leading-relaxed text-[var(--foreground)]/65">
                    {writing.excerpt}
                  </p>
                )}

                <span className="mt-6 inline-block text-sm text-[var(--primary)] transition-transform duration-300 group-hover:translate-x-1">
                  Read →
                </span>
              </article>
            </a>
          );
        })}
      </div>

      <a
        href="/writings"
        className="mt-8 block text-center text-sm text-[var(--primary)] hover:underline sm:hidden"
      >
        View all writings →
      </a>
    </section>
  );
}