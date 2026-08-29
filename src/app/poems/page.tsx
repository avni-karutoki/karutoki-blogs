import { createClient } from "@/lib/supabase/server";

export default async function PoemsPage() {
  const supabase = await createClient();

  const { data: poems, error } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, created_at")
    .eq("category", "poem")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-6">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--primary)]">
            Something went wrong
          </p>

          <h1 className="mt-4 font-[var(--font-playfair)] text-3xl font-semibold">
            Could not load poems
          </h1>

          <p className="mt-3 text-sm text-[var(--foreground)]/60">
            {error.message}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="mx-auto max-w-4xl px-5 pb-14 pt-20 text-center sm:px-8">
        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-[var(--primary)]">
          Words that found a rhythm
        </p>

        <h1 className="font-[var(--font-playfair)] text-5xl font-semibold sm:text-6xl">
          Poems
        </h1>

        <p className="mx-auto mt-5 max-w-2xl font-[var(--font-cormorant)] text-xl leading-relaxed text-[var(--foreground)]/65">
          Little pieces of emotion, imagination and everything that feels
          better when put into words.
        </p>
      </section>

      {/* Poems */}
      <section className="mx-auto max-w-5xl px-5 pb-24 sm:px-8">
        {poems.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-[var(--font-cormorant)] text-xl text-[var(--foreground)]/60">
              No poems published yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {poems.map((poem) => (
              <a
                key={poem.id}
                href={`/writings/${poem.slug}`}
                className="group block"
              >
                <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-7 py-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:px-10 sm:py-9">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="max-w-2xl">
                      <p className="mb-3 text-xs uppercase tracking-[0.25em] text-[var(--primary)]">
                        Poem
                      </p>

                      <h2 className="font-[var(--font-playfair)] text-2xl font-semibold sm:text-3xl">
                        {poem.title}
                      </h2>

                      {poem.excerpt && (
                        <p className="mt-3 font-[var(--font-cormorant)] text-xl leading-relaxed text-[var(--foreground)]/65">
                          {poem.excerpt}
                        </p>
                      )}
                    </div>

                    <span className="shrink-0 text-[var(--primary)] transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </article>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}