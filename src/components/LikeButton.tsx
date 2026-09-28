"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function likedKey(slug: string) {
  return `karutoki-liked-${slug}`;
}

function wasLiked(slug: string): boolean {
  try {
    return localStorage.getItem(likedKey(slug)) === "1";
  } catch {
    return false;
  }
}

/**
 * Public like button. Counts live in the `likes` column (see
 * supabase/migrate-scheduling-stats.sql). If the migration hasn't been run,
 * the button hides itself instead of erroring.
 */
export default function LikeButton({
  slug,
  initialLikes = 0,
}: {
  slug: string;
  initialLikes?: number;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(() =>
    typeof window === "undefined" ? false : wasLiked(slug)
  );
  const [available, setAvailable] = useState(true);
  const [busy, setBusy] = useState(false);
  const [bursts, setBursts] = useState<number[]>([]);

  if (!available) return null;

  // Little heart burst when a like lands.
  function celebrate() {
    const id = Date.now();
    setBursts((b) => [...b.slice(-2), id]);
    window.setTimeout(() => {
      setBursts((b) => b.filter((x) => x !== id));
    }, 950);
  }

  async function toggle() {
    if (busy) return;
    setBusy(true);
    try {
      const supabase = createClient();
      const delta = liked ? -1 : 1;
      const { data, error } = await supabase.rpc("change_post_likes", {
        p_slug: slug,
        p_delta: delta,
      });
      if (error) throw error;
      if (typeof data === "number") {
        setLikes(data);
      } else {
        setLikes((n) => Math.max(0, n + delta));
      }
      const next = !liked;
      setLiked(next);
      if (next) celebrate();
      try {
        if (next) localStorage.setItem(likedKey(slug), "1");
        else localStorage.removeItem(likedKey(slug));
      } catch {
        /* ignore */
      }
    } catch {
      // Counters not set up yet (migration missing) — hide quietly.
      setAvailable(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={liked}
      aria-label={liked ? "Unlike this writing" : "Like this writing"}
      className={`pill-button relative font-sans text-xs font-semibold uppercase tracking-[0.16em] disabled:opacity-60 ${
        liked ? "active" : ""
      }`}
    >
      {bursts.map((id) => (
        <span key={id} aria-hidden className="like-burst">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className="like-burst__heart"
              style={{
                left: `${8 + i * 14}%`,
                animationDelay: `${i * 60}ms`,
                fontSize: `${10 + (i % 3) * 3}px`,
              }}
            >
              ♥
            </span>
          ))}
        </span>
      ))}
      <span aria-hidden className={liked ? "" : "opacity-70"}>
        ♥
      </span>
      {likes} {likes === 1 ? "like" : "likes"}
    </button>
  );
}
