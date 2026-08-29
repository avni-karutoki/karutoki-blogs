import { createClient } from "@/lib/supabase/server";

export default async function BlogsPage() {
  const supabase = await createClient();

  const { data: blogs, error } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, created_at")
    .eq("category", "blog")
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
            Could not load blogs
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
      <section className="mx-auto max-w-4xl px-5 pb-14 pt-20 text-center sm:px-8">
        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-[var(--primary)]">
          Thoughts, stories & everything in between
        </p>

        <h1 className="font-[var(--font-playfair)] text-5xl font-semibold sm:text-6xl">
          Blogs
        </h1>

        <p className="mx-auto mt-5 max-w-2xl font-[var(--font-cormorant)] text-xl leading-relaxed text-[var(--foreground)]/65">
          Things I think about, things I learn, and things I simply feel like
          writing about.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-24 sm:px-8">
        {blogs.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-[var(--font-cormorant)] text-xl text-[var(--foreground)]/60">
              No blogs published yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {blogs.map((blog) => (
              <a
                key={blog.id}
                href={`/writings/${blog.slug}`}
                className="group block"
              >
                <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-7 py-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:px-10 sm:py-9">
                  <p className="text-xs uppercase tracking-[0.25em] text-[var(--primary)]">
                    Blog
                  </p>

                  <h2 className="mt-4 font-[var(--font-playfair)] text-2xl font-semibold sm:text-3xl">
                    {blog.title}
                  </h2>

                  {blog.excerpt && (
                    <p className="mt-3 max-w-2xl font-[var(--font-cormorant)] text-xl leading-relaxed text-[var(--foreground)]/65">
                      {blog.excerpt}
                    </p>
                  )}

                  <span className="mt-5 inline-block text-[var(--primary)] transition-transform duration-300 group-hover:translate-x-1">
                    Read more →
                  </span>
                </article>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}