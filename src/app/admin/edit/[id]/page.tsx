"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Post = {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  published: boolean;
};

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const supabase = createClient();

  const [post, setPost] = useState<Post | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("poem");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [published, setPublished] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPost() {
      const { data, error } = await supabase
        .from("posts")
        .select(
          "id, title, slug, category, excerpt, content, cover_image, published"
        )
        .eq("id", id)
        .single();

      if (error || !data) {
        setError(error?.message || "Writing not found.");
        setLoading(false);
        return;
      }

      setPost(data);

      setTitle(data.title);
      setSlug(data.slug);
      setCategory(data.category);
      setExcerpt(data.excerpt || "");
      setContent(data.content);
      setCoverImage(data.cover_image || "");
      setPublished(data.published);

      setLoading(false);
    }

    loadPost();
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setSaving(true);

    const { error } = await supabase
      .from("posts")
      .update({
        title: title.trim(),
        slug: slug.trim(),
        category,
        excerpt: excerpt.trim() || null,
        content: content.trim(),
        cover_image: coverImage.trim() || null,
        published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-[var(--foreground)]/50">
          Loading writing...
        </p>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-[var(--font-playfair)] text-4xl font-semibold">
            Writing not found
          </h1>

          <p className="mt-3 text-sm text-red-500">
            {error}
          </p>

          <button
            onClick={() => router.push("/admin")}
            className="mt-6 text-sm text-[var(--primary)] hover:underline"
          >
            ← Back to dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-10">
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="text-sm text-[var(--foreground)]/50 hover:text-[var(--primary)]"
          >
            ← Back to dashboard
          </button>

          <p className="mt-8 text-xs uppercase tracking-[0.3em] text-[var(--primary)]">
            Karutoki
          </p>

          <h1 className="mt-3 font-[var(--font-playfair)] text-5xl font-semibold">
            Edit Writing
          </h1>
        </div>

        <form onSubmit={handleSave} className="space-y-7">

          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-2xl border border-[var(--border)] bg-transparent px-5 py-4 font-[var(--font-playfair)] text-xl outline-none focus:border-[var(--primary)]"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Slug
            </label>

            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 text-sm outline-none focus:border-[var(--primary)]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Category
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)]"
            >
              <option value="poem">Poem</option>
              <option value="blog">Blog</option>
              <option value="midnight-talk">Midnight Talk</option>
            </select>
          </div>

          {/* Excerpt */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Excerpt
            </label>

            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-2xl border border-[var(--border)] bg-transparent px-5 py-4 outline-none focus:border-[var(--primary)]"
            />
          </div>

          {/* Content */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Content
            </label>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={18}
              required
              className="w-full resize-y rounded-2xl border border-[var(--border)] bg-transparent px-5 py-4 font-[var(--font-cormorant)] text-xl leading-relaxed outline-none focus:border-[var(--primary)]"
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Cover Image URL
            </label>

            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 text-sm outline-none focus:border-[var(--primary)]"
            />
          </div>

          {/* Published */}
          <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] p-5">
            <div>
              <p className="font-medium">
                Published
              </p>

              <p className="mt-1 text-sm text-[var(--foreground)]/50">
                Published writings are visible on the website.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setPublished(!published)}
              className={`relative h-7 w-12 rounded-full transition ${
                published
                  ? "bg-[var(--primary)]"
                  : "bg-[var(--foreground)]/20"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                  published ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-500/30 px-4 py-3">
              <p className="text-sm text-red-500">
                {error}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="rounded-xl border border-[var(--border)] px-6 py-3 text-sm hover:bg-[var(--foreground)]/5"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[var(--foreground)] px-7 py-3 text-sm font-medium text-[var(--background)] hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}