"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isAdminUser } from "@/lib/supabase/authorization";

type Post = {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  tags: string[] | null;
  featured: boolean | null;
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
  const [tags, setTags] = useState("");
  const [featured, setFeatured] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPost() {
      const client = createClient();
      const { data, error } = await client
        .from("posts")
        .select("id, title, slug, category, excerpt, content, cover_image, tags, featured, published")
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
      setTags((data.tags || []).join(", "));
      setFeatured(!!data.featured);
      setCoverImage(data.cover_image || "");
      setPublished(data.published);
      setLoading(false);
    }
    loadPost();
  }, [id]);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!isAdminUser(user)) router.replace("/admin/login");
    });
  }, [router]);

  function createSlug(value: string) {
    return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please select an image file.");
    if (file.size > 5 * 1024 * 1024) return setError("Image must be smaller than 5MB.");
    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImage() {
    if (!imageFile) return coverImage.trim() || null;
    const extension = imageFile.name.split(".").pop() || "jpg";
    const filePath = `${category}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("post-images").upload(filePath, imageFile, { cacheControl: "3600", upsert: false });
    if (uploadError) throw new Error(uploadError.message);
    return supabase.storage.from("post-images").getPublicUrl(filePath).data.publicUrl;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    if (!title.trim() || !slug.trim() || !content.trim()) {
      setError("Title, slug, and content are required.");
      setSaving(false);
      return;
    }
    try {
      const uploadedCoverImage = await uploadImage();
      const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
      const { error } = await supabase
        .from("posts")
        .update({
          title: title.trim(),
          slug: slug.trim(),
          category,
          excerpt: excerpt.trim() || null,
          content: content.trim(),
          tags: tagList.length ? tagList : null,
          cover_image: uploadedCoverImage,
          featured,
          published,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw new Error(error.message);
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this writing.");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="animate-fadeIn font-serif text-lg italic text-[var(--text-muted)]">Loading writing…</p>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="text-center">
          <h1>Writing not found</h1>
          <p className="mt-3 font-sans text-sm text-red-500">{error}</p>
          <button onClick={() => router.push("/admin")} className="ink-link mt-6 font-sans text-[12px] font-semibold uppercase tracking-[0.2em]">
            ← Back to dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <button type="button" onClick={() => router.push("/admin")} className="ink-link font-sans text-[12px] font-semibold uppercase tracking-[0.2em]">
        ← Back to dashboard
      </button>
      <p className="eyebrow mt-8">Karutoki Studio</p>
      <h1 className="mt-2">Edit writing</h1>

      <form onSubmit={handleSave} className="vintage-card mt-10 space-y-7 p-7 sm:p-9">
        <div>
          <label className="eyebrow">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setSlug(createSlug(e.target.value)); }}
            required
            className="field-underline mt-1 font-script text-3xl!"
          />
        </div>

        <div className="grid gap-7 sm:grid-cols-2">
          <div>
            <label className="eyebrow">Slug</label>
            <input type="text" value={slug} onChange={(e) => setSlug(createSlug(e.target.value))} required className="field-underline mt-1 font-mono text-sm" />
          </div>
          <div>
            <label className="eyebrow">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="field-underline mt-1">
              <option value="poem">Poem</option>
              <option value="blog">Blog</option>
              <option value="midnight-talk">Midnight Talk</option>
            </select>
          </div>
        </div>

        <div>
          <label className="eyebrow">Tags (comma separated)</label>
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="night, love, rain" className="field-underline mt-1" />
        </div>

        <div>
          <label className="eyebrow">Excerpt</label>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className="field-box mt-2 font-serif text-[1.05rem]" />
        </div>

        <div>
          <label className="eyebrow">Content</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={14} required className="field-box mt-2 font-serif text-[1.1rem] leading-relaxed" />
        </div>

        <div>
          <label className="eyebrow">Cover image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} className="field-box mt-2 cursor-pointer font-sans text-sm" />
          {(imagePreview || coverImage) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagePreview || coverImage} alt="Cover preview" className="mt-4 aspect-[16/9] w-full rounded-xl border border-[var(--border-color)] object-cover" />
          )}
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border-color)] p-5">
          <div>
            <p className="font-sans text-sm font-semibold">Published</p>
            <p className="body-text text-sm">Published writings are visible on the website.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={published}
            onClick={() => setPublished(!published)}
            className={`relative h-7 w-12 shrink-0 rounded-full transition ${published ? "bg-[var(--accent)]" : "bg-[var(--text-faint)]/30"}`}
          >
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${published ? "left-6" : "left-1"}`} />
          </button>
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 font-sans text-[12px] font-semibold uppercase tracking-[0.18em]">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
          Feature on home
        </label>

        {error && (
          <div className="rounded-xl border border-red-500/30 px-4 py-3">
            <p className="font-sans text-sm text-red-500">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => router.push("/admin")} className="secondary-button px-6 py-3 text-xs uppercase tracking-[0.18em]">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-ink disabled:opacity-50">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </main>
  );
}
