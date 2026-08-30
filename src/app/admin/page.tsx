import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { togglePublished } from "./actions";
import LogoutButton from "./logout-button";
import DeleteButton from "./delete-button";
import DeleteConfirmation from "./delete-confirmation";

export default async function AdminPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Fetch all posts
  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      "id, title, slug, category, excerpt, content, cover_image, published, created_at, updated_at"
    )
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
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

          {/* New Post */}
          <div className="flex flex-wrap gap-3">
  <a
    href="/admin/new"
    className="inline-flex items-center justify-center rounded-xl bg-[var(--foreground)] px-5 py-3 text-sm font-medium text-[var(--background)] transition hover:opacity-90"
  >
    + New Post
  </a>

  <LogoutButton />
</div>
        </header>

        {/* Divider */}
        <div className="mt-10 border-t border-[var(--border)]" />

        {/* Posts */}
        <section className="mt-10">

          {/* Database Error */}
          {error ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6">
              <p className="text-sm font-medium text-red-500">
                Could not load writings.
              </p>

              <p className="mt-2 text-sm text-red-500/80">
                {error.message}
              </p>
            </div>

          ) : !posts || posts.length === 0 ? (

            /* Empty State */
            <div className="rounded-3xl border border-[var(--border)] p-12 text-center">
              <p className="font-[var(--font-playfair)] text-3xl font-semibold">
                No writings yet.
              </p>

              <p className="mx-auto mt-3 max-w-md text-sm text-[var(--foreground)]/60">
                Your poems, blogs and midnight talks will appear here once
                you create them.
              </p>

              <a
                href="/admin/new"
                className="mt-7 inline-flex rounded-xl bg-[var(--foreground)] px-6 py-3 text-sm font-medium text-[var(--background)] transition hover:opacity-90"
              >
                Create your first writing
              </a>
            </div>

          ) : (

            /* Post List */
            <div className="space-y-5">
              {posts.map((post) => {

                const category =
                  post.category === "poem"
                    ? "Poem"
                    : post.category === "blog"
                      ? "Blog"
                      : "Midnight Talk";

                return (
                  <article
                    key={post.id}
                    className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 transition hover:shadow-md sm:p-7"
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                      {/* Post Information */}
                      <div className="min-w-0">

                        {/* Category + Status */}
                        <div className="flex flex-wrap items-center gap-3">

                          <span className="text-xs uppercase tracking-[0.25em] text-[var(--primary)]">
                            {category}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs ${
                              post.published
                                ? "bg-green-500/10 text-green-600"
                                : "bg-yellow-500/10 text-yellow-600"
                            }`}
                          >
                            {post.published
                              ? "Published"
                              : "Draft"}
                          </span>

                        </div>

                        {/* Title */}
                        <h2 className="mt-3 truncate font-[var(--font-playfair)] text-2xl font-semibold">
                          {post.title}
                        </h2>

                        {/* Slug */}
                        <p className="mt-2 text-xs text-[var(--foreground)]/40">
                          /{post.slug}
                        </p>

                        {/* Excerpt */}
                        {post.excerpt && (
                          <p className="mt-4 line-clamp-2 max-w-2xl text-sm leading-relaxed text-[var(--foreground)]/60">
                            {post.excerpt}
                          </p>
                        )}

                        {/* Content Preview */}
                        {post.content && (
                          <p className="mt-3 line-clamp-2 max-w-2xl font-[var(--font-cormorant)] text-lg leading-relaxed text-[var(--foreground)]/50">
                            {post.content}
                          </p>
                        )}

                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 flex-wrap gap-3">

                        {/* View / Preview */}
                        {post.published ? (
                          <a
                            href={`/writings/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm transition hover:bg-[var(--foreground)]/5"
                          >
                            View
                          </a>
                        ) : (
                          <a
                            href={`/admin/edit/${post.id}`}
                            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm transition hover:bg-[var(--foreground)]/5"
                          >
                            Preview
                          </a>
                        )}

                        {/* Edit */}
                        <a
                          href={`/admin/edit/${post.id}`}
                          className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm transition hover:bg-[var(--foreground)]/5"
                        >
                          Edit
                        </a>

                        {/* Publish / Unpublish */}
                        <form
                          action={async () => {
                            "use server";

                            await togglePublished(
                              post.id,
                              post.published
                            );
                          }}
                        >
                          <button
                            type="submit"
                            className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                              post.published
                                ? "border border-[var(--border)] hover:bg-yellow-500/10"
                                : "bg-[var(--foreground)] text-[var(--background)] hover:opacity-90"
                            }`}
                          >
                            {post.published
                              ? "Unpublish"
                              : "Publish"}
                          </button>
                        </form>

                        {/* Delete */}
                        
<DeleteConfirmation
  postId={post.id}
  title={post.title}
/>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

        </section>

        {/* Footer */}
        <footer className="mt-16 border-t border-[var(--border)] pt-6">
          <p className="text-center text-xs text-[var(--foreground)]/40">
            Karutoki Admin Dashboard
          </p>
        </footer>

      </div>
    </main>
  );
}