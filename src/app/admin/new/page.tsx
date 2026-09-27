"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/types";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function estimateReadingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min`;
}

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Category>("poem");
  const [tags, setTags] = useState("");
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please select an image file.");
    if (file.size > 5 * 1024 * 1024) return setError("Image must be smaller than 5MB.");
    setError(null);
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      let coverImage: string | null = null;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop() || "jpg";
        const path = `${category}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("post-images")
          .upload(path, imageFile, { cacheControl: "3600", upsert: false });
        if (upErr) throw new Error(`Image upload failed: ${upErr.message}`);
        coverImage = supabase.storage.from("post-images").getPublicUrl(path).data.publicUrl;
      }

      const base = slugify(title);
      const slug = base || `writing-${Date.now()}`;
      const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);

      const { error: insErr } = await supabase.from("posts").insert({
        slug,
        title: title.trim(),
        excerpt: excerpt.trim() || null,
        content: content.trim(),
        category,
        tags: tagList.length ? tagList : null,
        cover_image: coverImage,
        featured,
        reading_time: estimateReadingTime(content),
        published,
      });
      if (insErr) throw new Error(insErr.message);
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this writing.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <button type="button" onClick={() => router.push("/admin")} className="ink-link font-sans text-[12px] font-semibold uppercase tracking-[0.2em]">
        ← Back to dashboard
      </button>
      <p className="eyebrow mt-8">New piece</p>
      <h1 className="mt-2">New writing</h1>
      <p className="body-text mt-2">Draft it here — publish now or save it for later.</p>

      <form onSubmit={handleSubmit} className="vintage-card mt-10 space-y-7 p-7 sm:p-9">
        <div>
          <label className="eyebrow">Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give it a name it deserves…"
            className="field-underline mt-1 font-script text-3xl!"
          />
          {title && <p className="mt-1 font-mono text-[11px] text-[var(--text-faint)]">/writings/{slugify(title)}</p>}
        </div>

        <div className="grid gap-7 sm:grid-cols-2">
          <div>
            <label className="eyebrow">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className="field-underline mt-1">
              <option value="poem">Poem</option>
              <option value="blog">Blog</option>
              <option value="midnight-talk">Midnight Talk</option>
            </select>
          </div>
          <div>
            <label className="eyebrow">Tags (comma separated)</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="night, love, rain" className="field-underline mt-1" />
          </div>
        </div>

        <div>
          <label className="eyebrow">Excerpt</label>
          <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="One line for cards and previews" className="field-underline mt-1 font-serif text-[1.05rem]" />
        </div>

        <div>
          <label className="eyebrow">Content</label>
          <textarea required rows={12} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write what you couldn't say out loud…" className="field-box mt-2 font-serif text-[1.1rem] leading-relaxed" />
          <p className="mt-1 font-sans text-[11px] text-[var(--text-faint)]">~{estimateReadingTime(content)} read · {content.trim().split(/\s+/).filter(Boolean).length} words</p>
        </div>

        <div>
          <label className="eyebrow">Cover image (optional)</label>
          <input type="file" accept="image/*" onChange={handleImage} className="field-box mt-2 cursor-pointer font-sans text-sm" />
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Cover preview" className="mt-4 aspect-[16/9] w-full rounded-xl border border-[var(--border-color)] object-cover" />
          )}
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-2.5 font-sans text-[12px] font-semibold uppercase tracking-[0.18em]">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
            Publish immediately
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 font-sans text-[12px] font-semibold uppercase tracking-[0.18em]">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
            Feature on home
          </label>
        </div>

        {error && <p className="font-sans text-sm text-red-500">{error}</p>}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => router.push("/admin")} className="secondary-button px-6 py-3 text-xs uppercase tracking-[0.18em]">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-ink disabled:opacity-50">
            {loading ? "Saving…" : "Save writing"}
          </button>
        </div>
      </form>
    </div>
  );
}
