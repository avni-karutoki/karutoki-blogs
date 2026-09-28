"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const DISMISS_KEY = "karutoki-fresh-dismissed";
const FRESH_DAYS = 14;

type FreshPost = { slug: string; title: string; created_at: string };

/**
 * "Fresh ink" banner for returning readers. Fetches the latest piece on the
 * client (no SSR cost) and only shows it while it's fresh and undismissed.
 */
export default function AnnouncementBar() {
  const [post, setPost] = useState<FreshPost | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("posts")
          .select("slug, title, created_at")
          .eq("published", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (error || !data || cancelled) return;
        const fresh = data as FreshPost;
        const ageDays = (Date.now() - new Date(fresh.created_at).getTime()) / 86400000;
        if (ageDays > FRESH_DAYS) return;
        try {
          if (localStorage.getItem(DISMISS_KEY) === fresh.slug) return;
        } catch {
          /* ignore */
        }
        if (!cancelled) setPost(fresh);
      } catch {
        /* offline / DB unreachable — stay silent */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!post) return null;

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, post!.slug);
    } catch {
      /* ignore */
    }
    setPost(null);
  }

  return (
    <div className="relative z-40 flex items-center justify-center gap-3 border-b border-[var(--border-color)] bg-[var(--bg-card)] px-10 py-2 text-center">
      <p className="min-w-0 truncate font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
        <span className="mr-2 text-[var(--accent)]">✦ Fresh ink</span>
        <Link
          href={`/writings/${post.slug}`}
          className="ink-link normal-case tracking-normal text-[var(--text-heading)]"
        >
          <span className="font-script text-lg normal-case tracking-normal">{post.title}</span>
        </Link>
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-full text-xs text-[var(--text-faint)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
      >
        ✕
      </button>
    </div>
  );
}
