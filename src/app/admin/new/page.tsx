"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function createSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function NewPostPage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("poem");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");

  const [coverImage, setCoverImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [published, setPublished] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleTitleChange(value: string) {
    setTitle(value);
    setSlug(createSlug(value));
  }

  function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    // Allow only images
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }

    setError("");
    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  }

  async function uploadImage(): Promise<string | null> {
    if (!imageFile) {
      return coverImage.trim() || null;
    }

    const fileExtension =
      imageFile.name.split(".").pop() || "jpg";

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExtension}`;

    const filePath = `${category}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(filePath, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage
      .from("post-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }

    if (!content.trim()) {
      setError("Please write some content.");
      return;
    }

    if (!slug.trim()) {
      setError("Please enter a slug.");
      return;
    }

    setLoading(true);

    try {
      // Upload image first
      const imageUrl = await uploadImage();

      // Create post
      const { error: insertError } = await supabase
        .from("posts")
        .insert({
          title: title.trim(),
          slug: slug.trim(),
          category,
          excerpt: excerpt.trim() || null,
          content: content.trim(),
          cover_image: imageUrl,
          published,
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving."
      );

      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-10">
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="text-sm text-[var(--foreground)]/50 transition hover:text-[var(--primary)]"
          >
            ← Back to dashboard
          </button>

          <p className="mt-8 text-xs uppercase tracking-[0.3em] text-[var(--primary)]">
            Karutoki
          </p>

          <h1 className="mt-3 font-[var(--font-playfair)] text-5xl font-semibold">
            New Writing
          </h1>

          <p className="mt-3 text-[var(--foreground)]/60">
            Put your thoughts into words.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-7">

          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) =>
                handleTitleChange(e.target.value)
              }
              placeholder="The Things We Never Said"
              required
              className="w-full rounded-2xl border border-[var(--border)] bg-transparent px-5 py-4 font-[var(--font-playfair)] text-xl outline-none transition focus:border-[var(--primary)]"
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
              onChange={(e) =>
                setSlug(createSlug(e.target.value))
              }
              placeholder="the-things-we-never-said"
              required
              className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)]"
            />

            <p className="mt-2 text-xs text-[var(--foreground)]/40">
              Your writing will appear at /writings/
              {slug || "your-slug"}
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Category
            </label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none transition focus:border-[var(--primary)]"
            >
              <option value="poem">Poem</option>
              <option value="blog">Blog</option>
              <option value="midnight-talk">
                Midnight Talk
              </option>
            </select>
          </div>

          {/* Excerpt */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Excerpt
            </label>

            <textarea
              value={excerpt}
              onChange={(e) =>
                setExcerpt(e.target.value)
              }
              rows={3}
              placeholder="A short introduction to this piece..."
              className="w-full resize-none rounded-2xl border border-[var(--border)] bg-transparent px-5 py-4 outline-none transition focus:border-[var(--primary)]"
            />
          </div>

          {/* Content */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Content
            </label>

            <textarea
              value={content}
              onChange={(e) =>
                setContent(e.target.value)
              }
              rows={18}
              placeholder="Write your piece here..."
              required
              className="w-full resize-y rounded-2xl border border-[var(--border)] bg-transparent px-5 py-4 font-[var(--font-cormorant)] text-xl leading-relaxed outline-none transition focus:border-[var(--primary)]"
            />

            <p className="mt-2 text-xs text-[var(--foreground)]/40">
              Line breaks will be preserved on the reading page.
            </p>
          </div>

          {/* Cover Image */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Cover Image
              <span className="ml-2 text-xs text-[var(--foreground)]/40">
                optional
              </span>
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full cursor-pointer rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 text-sm"
            />

            <p className="mt-2 text-xs text-[var(--foreground)]/40">
              Maximum size: 5MB
            </p>

            {/* Preview */}
            {imagePreview && (
              <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--border)]">
                <img
                  src={imagePreview}
                  alt="Cover preview"
                  className="h-64 w-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Publish */}
          <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] p-5">
            <div>
              <p className="font-medium">
                Publish this writing
              </p>

              <p className="mt-1 text-sm text-[var(--foreground)]/50">
                Published writings are visible on the website.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setPublished(!published)
              }
              className={`relative h-7 w-12 rounded-full transition ${
                published
                  ? "bg-[var(--primary)]"
                  : "bg-[var(--foreground)]/20"
              }`}
              aria-label="Toggle publish"
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
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3">
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
              className="rounded-xl border border-[var(--border)] px-6 py-3 text-sm transition hover:bg-[var(--foreground)]/5"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[var(--foreground)] px-7 py-3 text-sm font-medium text-[var(--background)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Uploading & Saving..."
                : published
                  ? "Publish Writing"
                  : "Save Draft"}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}