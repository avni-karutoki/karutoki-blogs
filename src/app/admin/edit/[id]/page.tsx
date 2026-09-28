"use client";

import { useEffect, useRef, useState } from "react";
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
  scheduled_for?: string | null;
};

interface EditDraft {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  tags: string;
  featured: boolean;
  coverImage: string;
  published: boolean;
  publishAt: string;
  savedAt: string;
}

function draftKey(id: string) {
  return `karutoki-draft-edit-${id}`;
}

function loadEditDraft(id: string): EditDraft | null {
  try {
    const raw = localStorage.getItem(draftKey(id));
    if (!raw) return null;
    const d = JSON.parse(raw) as EditDraft;
    if (!d || typeof d !== "object") return null;
    return d;
  } catch {
    return null;
  }
}

function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

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
  const previewRef = useRef("");
  const [published, setPublished] = useState(false);
  const [publishAt, setPublishAt] = useState("");
  const [draftInfo, setDraftInfo] = useState<EditDraft | null>(null);
  const [autosavedAt, setAutosavedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    async function loadPost() {
      const client = createClient();
      const { data, error } = await client
        .from("posts")
        .select("id, title, slug, category, excerpt, content, cover_image, tags, featured, published, scheduled_for")
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
      setPublishAt(toLocalInput(data.scheduled_for));
      setLoading(false);
      // Offer to restore autosaved edits from a previous session.
      const draft = loadEditDraft(id);
      if (draft) setDraftInfo(draft);
    }
    loadPost();
  }, [id]);

  // Autosave edits (covers picked from disk can't be persisted) after pauses.
  useEffect(() => {
    if (loading || !post) return;
    const t = window.setTimeout(() => {
      try {
        const savedAt = new Date().toISOString();
        const draft: EditDraft = {
          title, slug, category, excerpt, content, tags, featured,
          coverImage, published, publishAt, savedAt,
        };
        localStorage.setItem(draftKey(id), JSON.stringify(draft));
        setAutosavedAt(savedAt);
      } catch {
        /* ignore */
      }
    }, 800);
    return () => window.clearTimeout(t);
  }, [loading, post, id, title, slug, category, excerpt, content, tags, featured, coverImage, published, publishAt]);

  function restoreEditDraft() {
    if (!draftInfo) return;
    setTitle(draftInfo.title);
    setSlug(draftInfo.slug);
    setCategory(draftInfo.category);
    setExcerpt(draftInfo.excerpt);
    setContent(draftInfo.content);
    setTags(draftInfo.tags);
    setFeatured(draftInfo.featured);
    setCoverImage(draftInfo.coverImage);
    setPublished(draftInfo.published);
    setPublishAt(draftInfo.publishAt);
    setDraftInfo(null);
  }

  function discardEditDraft() {
    try {
      localStorage.removeItem(draftKey(id));
    } catch {
      /* ignore */
    }
    setDraftInfo(null);
  }

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
    // Revoke the previous object URL so repeated picks don't leak memory.
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const url = URL.createObjectURL(file);
    previewRef.current = url;
    setImagePreview(url);
  }

  // Clean up the preview URL when leaving the page.
  useEffect(() => {
    const ref = previewRef;
    return () => {
      if (ref.current) URL.revokeObjectURL(ref.current);
    };
  }, []);

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
    setNotice("");
    setSaving(true);
    if (!title.trim() || !slug.trim() || !content.trim()) {
      setError("Title, slug, and content are required.");
      setSaving(false);
      return;
    }
    try {
      const uploadedCoverImage = await uploadImage();
      const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
      const scheduledDate = publishAt ? new Date(publishAt) : null;
      const futureSchedule =
        scheduledDate && !Number.isNaN(scheduledDate.getTime()) && scheduledDate.getTime() > Date.now();

      const row: Record<string, unknown> = {
        title: title.trim(),
        slug: slug.trim(),
        category,
        excerpt: excerpt.trim() || null,
        content: content.trim(),
        tags: tagList.length ? tagList : null,
        cover_image: uploadedCoverImage,
        featured,
        published: futureSchedule ? false : published,
        updated_at: new Date().toISOString(),
      };
      if (futureSchedule && scheduledDate) {
        row.scheduled_for = scheduledDate.toISOString();
      } else {
        row.scheduled_for = null;
      }
      const { error } = await supabase.from("posts").update(row).eq("id", id);
      if (error) {
        // Migration not run yet → save without scheduling instead of failing.
        if (/scheduled_for/i.test(error.message)) {
          delete row.scheduled_for;
          if (futureSchedule) row.published = published;
          const { error: retryError } = await supabase.from("posts").update(row).eq("id", id);
          if (retryError) throw new Error(retryError.message);
          if (futureSchedule) {
            setNotice("Saved, but scheduling needs the DB migration — see supabase/migrate-scheduling-stats.sql.");
          }
        } else {
          throw new Error(error.message);
        }
      }
      try {
        localStorage.removeItem(draftKey(id));
      } catch {
        /* ignore */
      }
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

      {draftInfo && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--accent)] bg-[var(--accent-soft)] p-4">
          <p className="font-sans text-xs text-[var(--text-primary)]">
            Unsaved edits from {new Date(draftInfo.savedAt).toLocaleString()} found on this device.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={restoreEditDraft}
              className="secondary-button px-4 py-2 text-[11px] uppercase tracking-[0.16em]"
            >
              Restore
            </button>
            <button
              type="button"
              onClick={discardEditDraft}
              className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-red-500 hover:underline"
            >
              Discard
            </button>
          </div>
        </div>
      )}

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

        <div>
          <label className="eyebrow">Schedule for later (optional)</label>
          <input
            type="datetime-local"
            value={publishAt}
            onChange={(e) => setPublishAt(e.target.value)}
            className="field-underline mt-1"
          />
          <p className="mt-1 font-sans text-[11px] text-[var(--text-faint)]">
            A future time unpublishes this for now and publishes it automatically. Clear it to publish immediately.
          </p>
        </div>

        {autosavedAt && (
          <p className="font-sans text-[11px] text-[var(--text-faint)]">
            Edits autosaved at {new Date(autosavedAt).toLocaleTimeString()} on this device.
          </p>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/30 px-4 py-3">
            <p className="font-sans text-sm text-red-500">{error}</p>
          </div>
        )}
        {notice && (
          <div className="rounded-xl border border-amber-500/30 px-4 py-3">
            <p className="font-sans text-sm text-amber-600">{notice}</p>
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
