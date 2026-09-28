"use client";

import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearch } from "./SearchContext";
import { createClient } from "@/lib/supabase/client";

interface WritingPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string | null;
  content: string;
  created_at: string;
}

// Fallback items if Supabase table is empty during development
const defaultWritings: WritingPost[] = [
  {
    id: "1",
    title: "Tired of the same sky.",
    slug: "tired-of-the-same-sky",
    category: "poem",
    excerpt: "A little poem about the nights when you feel everything, yet somehow feel nothing at all.",
    content: "Some nights feel strangely familiar...",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "The quiet in between.",
    slug: "the-quiet-in-between",
    category: "blog",
    excerpt: "Sometimes the moments between everything are the ones worth remembering.",
    content: "There is a quietness to early mornings...",
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Maybe, it'll be different.",
    slug: "maybe-itll-be-different",
    category: "midnight-talk",
    excerpt: "A midnight thought about hope, uncertainty, and the possibility of tomorrow.",
    content: "When the clock strikes 2 AM...",
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    title: "The Things We Never Said",
    slug: "the-things-we-never-said",
    category: "poem",
    excerpt: "Some feelings remain between the lines, waiting for someone to read them.",
    content: "Words spoken in silence...",
    created_at: new Date().toISOString(),
  },
];

export default function SearchOverlay() {
  const { isOpen, closeSearch } = useSearch();
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<WritingPost[]>(defaultWritings);
  const [loading, setLoading] = useState(false);

  // Fetch posts from Supabase when search opens (capped + no heavy content field)
  useEffect(() => {
    if (!isOpen) return;

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("posts")
          .select("id, title, slug, category, excerpt, created_at")
          .eq("published", true)
          .order("created_at", { ascending: false })
          .limit(100);

        if (!error && data && data.length > 0) {
          setPosts(
            data.map((p) => ({ ...p, content: "" })) as WritingPost[]
          );
        }
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeSearch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeSearch]);

  const deferredQuery = useDeferredValue(query);

  const filteredPosts = useMemo(() => {
    const q = deferredQuery.toLowerCase().trim();
    if (!q) return posts.slice(0, 12);
    return posts
      .filter(
        (post) =>
          post.title.toLowerCase().includes(q) ||
          (post.excerpt && post.excerpt.toLowerCase().includes(q)) ||
          post.category.toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [posts, deferredQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[var(--bg-primary)] px-6 py-10 sm:px-12 md:px-20 overflow-y-auto animate-fadeIn">
      {/* Top Header with Close Control */}
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between border-b border-[var(--border-color)] pb-6">
        <span className="font-sans text-xs uppercase tracking-[0.25em] text-[var(--accent-pink)] font-medium">
          KARUTOKI SEARCH
        </span>

        <button
          type="button"
          onClick={closeSearch}
          aria-label="Close search screen"
          className="flex h-10 w-10 items-center justify-center rounded-full text-2xl text-[var(--text-primary)] transition hover:bg-[var(--bg-secondary)] hover:text-[var(--accent-pink)]"
        >
          ✕
        </button>
      </div>

      {/* Figma Screen 6 Header & Search Input */}
      <div className="mx-auto mt-12 w-full max-w-4xl text-center sm:mt-16">
        <h2 className="font-script text-4xl sm:text-5xl md:text-6xl text-[var(--text-heading)] font-normal">
          What are you looking for???
        </h2>

        {/* Minimal Search Bar Line */}
        <div className="relative mx-auto mt-10 max-w-2xl border-b-2 border-[var(--text-heading)] pb-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a title, category, or thought..."
            autoFocus
            className="w-full bg-transparent font-serif text-xl sm:text-2xl text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none pr-16"
          />

          <div className="absolute right-0 bottom-3 flex items-center gap-2">
            <span className="font-sans text-xs uppercase tracking-[0.15em] text-[var(--text-muted)] hidden sm:inline">
              SEARCH
            </span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[var(--text-heading)]"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>
      </div>

      {/* Search Results Grid */}
      <div className="mx-auto mt-12 w-full max-w-4xl pb-16">
        {loading ? (
          <p className="text-center font-serif text-lg text-[var(--text-muted)]">
            Searching the quiet archives...
          </p>
        ) : filteredPosts.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-script text-3xl text-[var(--text-heading)]">
              No words found matching &ldquo;{query}&rdquo;
            </p>
            <p className="mt-3 font-serif text-sm text-[var(--text-muted)]">
              Try searching for &ldquo;poem&rdquo;, &ldquo;quiet&rdquo;, &ldquo;night&rdquo;, or browse all writings.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {filteredPosts.map((post) => (
              <Link
                key={post.id}
                href={`/writings/${post.slug}`}
                onClick={closeSearch}
                className="group vintage-card p-6 block hover:-translate-y-1 transition-all duration-300"
              >
                <span className="font-sans text-xs uppercase tracking-[0.15em] text-[var(--accent-pink)] font-medium">
                  {post.category}
                </span>

                <h3 className="mt-2 font-script text-3xl text-[var(--text-heading)] group-hover:text-[var(--accent-pink)] transition-colors">
                  {post.title}
                </h3>

                {post.excerpt && (
                  <p className="mt-3 font-serif text-sm text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                )}

                <span className="mt-4 inline-flex items-center text-xs font-sans font-medium text-[var(--accent-pink)] tracking-wider group-hover:translate-x-1 transition-transform">
                  READ THIS PIECE →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
