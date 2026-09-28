"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/lib/types";
import { categoryLabel } from "@/lib/types";

type SearchResult = Pick<Post, "slug" | "title" | "excerpt" | "category">;

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    try {
      const supabase = createClient();
      // Escape PostgREST `or` filter special chars so quotes/commas/parens can't break the query.
      const term = q
        .trim()
        .replace(/[%_]/g, "")
        .replace(/[,().:"]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 80);
      if (!term) {
        setResults([]);
        setSearched(true);
        return;
      }
      const { data, error } = await supabase
        .from("posts")
        .select("slug, title, excerpt, category")
        .eq("published", true)
        .or(`title.ilike.%${term}%,content.ilike.%${term}%,excerpt.ilike.%${term}%`)
        .limit(20);
      if (error) throw error;
      setResults((data as SearchResult[]) || []);
      setSearched(true);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center px-6 pt-16">
      <p className="eyebrow">Search</p>
      <h1 className="mt-2 text-center">What are you looking for?</h1>
      <form
        onSubmit={handleSubmit}
        className="mt-8 flex w-full items-end gap-3 border-b-2 border-[var(--text-heading)] pb-3"
      >
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="A title, a feeling, a word…"
          className="flex-1 bg-transparent font-serif text-2xl text-[var(--text-primary)] outline-none placeholder:text-[var(--text-faint)]"
        />
        <button
          type="submit"
          className="flex shrink-0 items-center gap-2 font-sans text-[12px] font-semibold uppercase tracking-[0.2em] text-[var(--text-primary)] transition-colors hover:text-[var(--accent)]"
        >
          {loading ? "…" : "Search"}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
            <line x1="16.2" y1="16.2" x2="21" y2="21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </form>

      <div className="mt-10 w-full space-y-2">
        {searched && !loading && results.length === 0 && (
          <p className="body-text text-center">No writings match that, yet.</p>
        )}
        {results.map((r) => (
          <Link
            key={r.slug}
            href={`/writings/${r.slug}`}
            className="group block border-b border-[var(--border-color)] py-5 transition-colors"
          >
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              {categoryLabel(r.category)}
            </p>
            <h3 className="mt-1 transition-colors group-hover:text-[var(--accent)]">{r.title}</h3>
            <p className="mt-1 line-clamp-2 font-serif text-[1rem] text-[var(--text-muted)]">{r.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
