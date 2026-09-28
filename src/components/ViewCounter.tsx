"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function viewedKey(slug: string) {
  return `karutoki-viewed-${slug}`;
}

/**
 * Counts one read per browser session via `increment_post_views`
 * (see supabase/migrate-scheduling-stats.sql). Hides itself if the
 * migration hasn't been run.
 */
export default function ViewCounter({
  slug,
  initialViews = 0,
}: {
  slug: string;
  initialViews?: number;
}) {
  const [views, setViews] = useState(initialViews);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    let cancelled = false;
    try {
      if (sessionStorage.getItem(viewedKey(slug))) return;
    } catch {
      return;
    }
    (async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.rpc("increment_post_views", { p_slug: slug });
        if (error) throw error;
        if (!cancelled) {
          setViews((n) => n + 1);
          try {
            sessionStorage.setItem(viewedKey(slug), "1");
          } catch {
            /* ignore */
          }
        }
      } catch {
        if (!cancelled) setAvailable(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!available) return null;

  return (
    <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-faint)]">
      👁 {views} {views === 1 ? "read" : "reads"}
    </span>
  );
}
