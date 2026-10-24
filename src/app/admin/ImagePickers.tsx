"use client";

import React, { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/** Uploads into the existing public `post-images` bucket, under `site/<folder>`. */
async function uploadFile(file: File, folder: string): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `site/${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("post-images")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw new Error(`Image upload failed: ${error.message}`);
  return supabase.storage.from("post-images").getPublicUrl(path).data.publicUrl;
}

function validate(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Please pick an image file.";
  if (file.size > 5 * 1024 * 1024) return "Image must be smaller than 5MB.";
  return null;
}

const inputClass =
  "w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-pink)]";

/** Single image: pick from disk, or paste any image URL. */
export function ImagePicker({
  label,
  value,
  onChange,
  folder,
}: {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  folder: string;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // allow re-picking the same file
    const invalid = validate(file);
    if (invalid) return setError(invalid);
    setError("");
    setBusy(true);
    try {
      onChange(await uploadFile(file, folder));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="block font-semibold uppercase tracking-wider text-[var(--text-heading)]">
        {label}
      </label>
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste an image URL, or upload below"
        className={inputClass}
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleFile}
        disabled={busy}
        className="block w-full cursor-pointer font-sans text-[11px] text-[var(--text-muted)]"
      />
      {busy && <p className="font-sans text-[11px] text-[var(--accent-pink)]">Uploading…</p>}
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt={label}
          className="aspect-[16/9] w-full rounded-xl border border-[var(--border-color)] object-cover"
        />
      ) : null}
      <div className="flex items-center gap-3">
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="font-sans text-[11px] font-semibold uppercase tracking-wider text-red-500 hover:underline"
          >
            Remove
          </button>
        ) : null}
        {error && <p className="font-sans text-[11px] text-red-500">{error}</p>}
      </div>
    </div>
  );
}

/** List of images (hero slideshow / about gallery): add, remove, reorder. */
export function ImageListPicker({
  label,
  value,
  onChange,
  folder,
  max = 12,
  hint,
}: {
  label: string;
  value: string[];
  onChange: (urls: string[]) => void;
  folder: string;
  max?: number;
  hint?: string;
}) {
  const [urlDraft, setUrlDraft] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function update(next: string[]) {
    onChange(next.filter((u) => u.trim() !== ""));
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    for (const file of files) {
      const invalid = validate(file);
      if (invalid) return setError(invalid);
    }
    setError("");
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        if (value.length + urls.length >= max) break;
        urls.push(await uploadFile(file, folder));
      }
      update([...value, ...urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  function addUrl() {
    const url = urlDraft.trim();
    if (!url) return;
    if (value.length >= max) return setError(`Maximum is ${max} images.`);
    setError("");
    update([...value, url]);
    setUrlDraft("");
  }

  function move(index: number, delta: number) {
    const next = [...value];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    update(next);
  }

  const full = value.length >= max;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <label className="block font-semibold uppercase tracking-wider text-[var(--text-heading)]">
          {label}
        </label>
        <span className="font-sans text-[11px] text-[var(--text-faint)]">
          {value.length}/{max}
        </span>
      </div>
      {hint && <p className="font-sans text-[11px] text-[var(--text-faint)] -mt-2">{hint}</p>}

      {value.map((url, i) => (
        <div
          key={`${url}-${i}`}
          className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-2"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            className="h-12 w-16 shrink-0 rounded-lg border border-[var(--border-color)] object-cover"
          />
          <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-[var(--text-muted)]">
            {url}
          </span>
          <span className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              title="Move up"
              className="rounded-md px-1.5 py-0.5 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] disabled:opacity-30"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => move(i, +1)}
              disabled={i === value.length - 1}
              title="Move down"
              className="rounded-md px-1.5 py-0.5 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] disabled:opacity-30"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => update(value.filter((_, j) => j !== i))}
              title="Remove"
              className="rounded-md px-1.5 py-0.5 text-xs text-red-500 hover:underline"
            >
              ✕
            </button>
          </span>
        </div>
      ))}

      <div className="flex gap-2">
        <input
          type="text"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addUrl();
            }
          }}
          placeholder={full ? `List is full (${max})` : "Paste image URL and press Enter"}
          disabled={full}
          className={inputClass}
        />
        <button type="button" onClick={addUrl} disabled={full || !urlDraft.trim()} className="secondary-button shrink-0 px-3 py-2 text-[10px] uppercase tracking-wider disabled:opacity-40">
          Add
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        disabled={busy || full}
        className="block w-full cursor-pointer font-sans text-[11px] text-[var(--text-muted)]"
      />
      {busy && <p className="font-sans text-[11px] text-[var(--accent-pink)]">Uploading…</p>}
      {error && <p className="font-sans text-[11px] text-red-500">{error}</p>}
    </div>
  );
}
