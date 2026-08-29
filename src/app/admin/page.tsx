import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, title, slug, category, published, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--primary)]">
              Karutoki
            </p>

            <h1 className="mt-3 font-[var(--font-playfair)] text-5xl font-semibold">
              Your Writings
            </h1>

            <p className="mt-3 text-sm text-[var(--foreground)]/60">
              {user.email}
            </p>
          </div>

          <a
            href="/admin/new"
            className="inline-flex items-center justify-center rounded-xl bg-[var(--foreground)] px-5 py-3 text-sm font-medium text-[var(--background)] transition hover:opacity-90"
          >
            + New Post
          </a>
        </div>

        {/* Posts */}
        <section className="mt-12">
          {error ? (
            <div className="rounded-2xl border border-red-500/30 p-6">
              <p className="text-sm text-red-500">
                Could not load posts: {error.message}
              </p>
            </div>
          ) : !posts || posts.length === 0 ? (
            <div className="rounded-3xl border border-[var(--border)] p-10 text-center">
              <p className="font-[var(--font-playfair)] text-2xl">
                No writings yet.
              </p>

              <p className="mt-2 text-sm text-[var(--foreground)]/60">
                Start by creating your first post.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="flex flex-col gap-5 rounded-2xl border border-[var(--border)] p-6 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs uppercase tracking-[0.2em] text-[var(--primary)]">
                        {post.category}
                      </span>

                      <span className="text-xs text-[var(--foreground)]/40">
                        {post.published ? "Published" : "Draft"}
                      </span>
                    </div>

                    <h2 className="mt-2 font-[var(--font-playfair)] text-2xl font-semibold">
                      {post.title}
                    </h2>

                    <p className="mt-1 text-xs text-[var(--foreground)]/40">
                      /{post.slug}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <a
                      href={`/writings/${post.slug}`}
                      target="_blank"
                      className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm transition hover:bg-[var(--secondary)]/20"
                    >
                      View
                    </a>

                    <button
                      type="button"
                      className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm transition hover:bg-[var(--secondary)]/20"
                    >
                      Edit
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}