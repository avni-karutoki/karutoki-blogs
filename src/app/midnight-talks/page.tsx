import { createClient } from "@/lib/supabase/server";

export default async function MidnightTalksPage() {
  const supabase = await createClient();

  const { data: talks, error } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, created_at")
    .eq("category", "midnight-talk")
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
            Could not load midnight talks
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-4xl px-5 pb-14 pt-20 text-center sm:px-8">
        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-[var(--primary)]">
          Conversations with myself
        </p>

        <h1 className="font-[var(--font-playfair)] text-5xl font-semibold sm:text-6xl">
          Midnight Talks
        </h1>

        <p className="mx-auto mt-5 max-w-2xl font-[var(--font-cormorant)] text-xl leading-relaxed text-[var(--foreground)]/65">
          For the thoughts that arrive a little louder after midnight, when
          everything else finally gets quiet.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-24 sm:px-8">
        {talks.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-[var(--font-cormorant)] text-xl text-[var(--foreground)]/60">
              No midnight talks published yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {talks.map((talk, index) => (
              <a
                key={talk.id}
                href={`/writings/${talk.slug}`}
                className="group block"
              >
                <article className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-9">
                  <span className="absolute right-6 top-4 font-[var(--font-playfair)] text-6xl font-semibold text-[var(--primary)]/5">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="relative">
                    <p className="text-xs uppercase tracking-[0.25em] text-[var(--primary)]">
                      Midnight Talk
                    </p>

                    <h2 className="mt-5 font-[var(--font-playfair)] text-2xl font-semibold sm:text-3xl">
                      {talk.title}
                    </h2>

                    {talk.excerpt && (
                      <p className="mt-4 max-w-2xl font-[var(--font-cormorant)] text-xl leading-relaxed text-[var(--foreground)]/65">
                        {talk.excerpt}
                      </p>
                    )}

                    <span className="mt-6 inline-block text-sm text-[var(--primary)] transition-transform duration-300 group-hover:translate-x-1">
                      Read the conversation →
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