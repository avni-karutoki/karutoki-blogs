"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { mutateSchemaSafe } from "@/lib/supabase/schema-safe";
import { ImagePicker } from "../ImagePickers";
import type { Category } from "@/lib/types";

const DRAFT_KEY = "karutoki-draft-new";

interface NewDraft {
  title: string;
  excerpt: string;
  content: string;
  category: Category;
  tags: string;
  featured: boolean;
  published: boolean;
  coverImage: string;
  savedAt: string;
}

function loadDraft(): NewDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as NewDraft;
    if (!d || typeof d !== "object") return null;
    return d;
  } catch {
    return null;
  }
}

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
  // The draft lives in localStorage, so it can only be restored after mount.
  // Reading it during render would make the server HTML differ from the
  // first client render and trigger a hydration mismatch.
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Category>("poem");
  const [tags, setTags] = useState("");
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);
  const [publishAt, setPublishAt] = useState("");
  const [restoredAt, setRestoredAt] = useState<string | null>(null);
  const [autosavedAt, setAutosavedAt] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [restored, setRestored] = useState(false);

  // Restore the autosaved draft once mounted (text + cover URL survive reloads).
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setTitle(draft.title ?? "");
      setExcerpt(draft.excerpt ?? "");
      setContent(draft.content ?? "");
      setCategory(draft.category ?? "poem");
      setTags(draft.tags ?? "");
      setFeatured(!!draft.featured);
      setPublished(draft.published ?? true);
      setCoverUrl(draft.coverImage ?? "");
      setRestoredAt(draft.savedAt ?? null);
    }
    setRestored(true);
  }, []);

  // Autosave everything (including the uploaded cover URL) shortly after edits.
  useEffect(() => {
    if (!restored) return;
    if (!title && !excerpt && !content && !tags && !coverUrl) return;
    const t = window.setTimeout(() => {
      try {
        const savedAt = new Date().toISOString();
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ title, excerpt, content, category, tags, featured, published, coverImage: coverUrl, savedAt })
        );
        setAutosavedAt(savedAt);
      } catch {
        /* storage full/blocked — ignore */
      }
    }, 800);
    return () => window.clearTimeout(t);
  }, [restored, title, excerpt, content, category, tags, featured, published, coverUrl]);

  function discardDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    setTitle("");
    setExcerpt("");
    setContent("");
    setTags("");
    setFeatured(false);
    setPublished(true);
    setPublishAt("");
    setRestoredAt(null);
    setAutosavedAt(null);
    setCoverUrl("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const supabase = createClient();
      const coverImage = coverUrl.trim() || null;

      const base = slugify(title);
      const slug = base || `writing-${Date.now()}`;
      const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);

      // Optional scheduling: a future time saves the piece unpublished and
      // it goes live automatically (via /admin visits or pg_cron).
      const scheduledDate = publishAt ? new Date(publishAt) : null;
      const futureSchedule =
        scheduledDate && !Number.isNaN(scheduledDate.getTime()) && scheduledDate.getTime() > Date.now();

      const row: Record<string, unknown> = {
        slug,
        title: title.trim(),
        excerpt: excerpt.trim() || null,
        content: content.trim(),
        category,
        tags: tagList.length ? tagList : null,
        cover_image: coverImage,
        featured,
        reading_time: estimateReadingTime(content),
        published: futureSchedule ? false : published,
      };
      if (futureSchedule && scheduledDate) row.scheduled_for = scheduledDate.toISOString();

      // Save; if the database is missing optional columns (tags, featured,
      // scheduling…), save what the schema supports instead of failing.
      const { error: insErr, missing: skippedColumns } = await mutateSchemaSafe(
        (payload) => supabase.from("posts").insert(payload),
        row,
      );
      if (insErr) throw new Error(insErr.message);
      if (futureSchedule && skippedColumns.includes("scheduled_for")) {
        setNotice("Saved, but scheduling needs the DB migration — see supabase/migrate-scheduling-stats.sql.");
      } else if (skippedColumns.length) {
        setNotice(`Saved without: ${skippedColumns.join(", ")} (enable with supabase/migrate-add-columns.sql).`);
      }
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
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

        <ImagePicker
          label="Cover picture (shown on cards and the writing page)"
          value={coverUrl}
          onChange={setCoverUrl}
          folder="covers"
        />

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

        <div>
          <label className="eyebrow">Schedule for later (optional)</label>
          <input
            type="datetime-local"
            value={publishAt}
            onChange={(e) => setPublishAt(e.target.value)}
            className="field-underline mt-1"
          />
          <p className="mt-1 font-sans text-[11px] text-[var(--text-faint)]">
            Leave empty to use the toggle above. A future time saves it unpublished and publishes it automatically.
          </p>
        </div>

        {(restoredAt || autosavedAt) && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border-color)] p-4">
            <p className="font-sans text-xs text-[var(--text-muted)]">
              {restoredAt
                ? `Draft restored from ${new Date(restoredAt).toLocaleString()}.`
                : ""}
              {autosavedAt ? ` Autosaved at ${new Date(autosavedAt).toLocaleTimeString()}.` : ""}
            </p>
            <button
              type="button"
              onClick={discardDraft}
              className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-red-500 hover:underline"
            >
              Discard draft
            </button>
          </div>
        )}

        {error && <p className="font-sans text-sm text-red-500">{error}</p>}
        {notice && <p className="font-sans text-sm text-amber-600">{notice}</p>}

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
