"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type CommentRow = {
  id: string;
  post_id: string;
  parent_id: string | null;
  author_name: string;
  content: string;
  created_at: string;
  likes?: number;
};

const NAME_KEY = "karutoki-commenter-name";

function heartKey(id: string) {
  return `karutoki-comment-heart-${id}`;
}

function wasHearted(id: string): boolean {
  try {
    return localStorage.getItem(heartKey(id)) === "1";
  } catch {
    return false;
  }
}

/* Relative timestamp ("just now", "3 days ago", … after that a short date). */
function relTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "a while ago";
  const sec = Math.max(1, Math.round((Date.now() - then) / 1000));
  if (sec < 60) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} minute${min === 1 ? "" : "s"} ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day} day${day === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString("en-US", { timeZone: "Asia/Kolkata", month: "short", day: "numeric", year: "numeric" });
}

/* A soft per-commenter tint from their name, so voices feel distinct. */
const TINTS = ["#e8b4a8", "#b8c7d9", "#c9b8d9", "#a8c9bb", "#d9c9a8", "#d9a8c4"];
function tintOf(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 997;
  return TINTS[h % TINTS.length];
}

export default function WritingComments({ postId }: { postId: string }) {
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  // Hearts live in a separate column (migrate-comment-hearts.sql); without
  // it the thread still works, the little hearts just stay hidden.
  const [heartsAvailable, setHeartsAvailable] = useState(false);
  const [heartedIds, setHeartedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const ids: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith("karutoki-comment-heart-")) ids.push(k.slice("karutoki-comment-heart-".length));
      }
      setHeartedIds(new Set(ids));
    } catch {
      /* ignore */
    }
  }, []);

  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<CommentRow | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [heartBusy, setHeartBusy] = useState<string | null>(null);
  // Little flourishes: a brief "Sent ✦" on the button, and a pop on freshly-hearted bubbles.
  const [justSent, setJustSent] = useState(false);
  const [justHearted, setJustHearted] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Replying means "come back up here": the write box scrolls into view and the
  // message field takes focus, so the pen is already in hand.
  useEffect(() => {
    if (!replyTo) return;
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    const t = setTimeout(() => textareaRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, [replyTo]);

  // Remember the visitor's name between sessions.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(NAME_KEY);
      if (saved) setName(saved);
    } catch {
      /* storage blocked — fine */
    }
  }, []);

  // Load the whole thread. Runs client-side so comment sections stay fresh
  // even on cached pages.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const supabase = createClient();
        // First attempt includes hearts; if the column isn't there yet,
        // fall back to plain fetch so the thread still loads.
        const base =
          "id, post_id, parent_id, author_name, content, created_at";
        let raw: CommentRow[] = [];
        const fullRes = await supabase
          .from("comments")
          .select(`${base}, likes`)
          .eq("post_id", postId)
          .order("created_at", { ascending: true });
        if (fullRes.error || !fullRes.data) {
          const plainRes = await supabase
            .from("comments")
            .select(base)
            .eq("post_id", postId)
            .order("created_at", { ascending: true });
          if (plainRes.error) {
            if (alive) setUnavailable(true);
            return;
          }
          raw = (plainRes.data as unknown as CommentRow[]) || [];
        } else {
          raw = (fullRes.data as unknown as CommentRow[]) || [];
        }
        if (!alive) return;
        setComments(raw);
        setHeartsAvailable(raw.some((r) => typeof r.likes === "number"));
      } catch {
        if (alive) setUnavailable(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [postId]);

  const childrenByParent = useMemo(() => {
    const map = new Map<string, CommentRow[]>();
    for (const c of comments) {
      if (!c.parent_id) continue;
      const list = map.get(c.parent_id);
      if (list) list.push(c);
      else map.set(c.parent_id, [c]);
    }
    return map;
  }, [comments]);

  const roots = comments.filter((c) => !c.parent_id);

  async function submit() {
    const trimmed = content.trim();
    const authorName = name.trim() || "Anonymous";
    if (trimmed.length === 0) {
      setError("Write something first ✍️");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          parent_id: replyTo?.id ?? null,
          author_name: authorName,
          content: trimmed,
        })
        .select()
        .single();
      if (error) {
        setError(error.message);
      } else if (data) {
        setComments((prev) => [...prev, data as CommentRow]);
        setContent("");
        setReplyTo(null);
        setJustSent(true);
        setTimeout(() => setJustSent(false), 1800);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  function rememberName(next: string) {
    setName(next);
    try {
      localStorage.setItem(NAME_KEY, next.trim());
    } catch {
      /* ignore */
    }
  }

  // Hearts go through the SECURITY DEFINER RPC so anonymous visitors can
  // only bump the counter (mirror of the post-likes pattern).
  async function toggleHeart(c: CommentRow) {
    if (heartBusy) return;
    const liked = heartedIds.has(c.id);
    setHeartBusy(c.id);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("change_comment_likes", {
        p_comment_id: c.id,
        p_delta: liked ? -1 : 1,
      });
      if (error) {
        // Function not migrated yet → hide hearts quietly.
        setHeartsAvailable(false);
        return;
      }
      const fallbackCount = Math.max(0, (c.likes ?? 0) + (liked ? -1 : 1));
      const nextCount = typeof data === "number" ? data : fallbackCount;
      setComments((prev) => prev.map((x) => (x.id === c.id ? { ...x, likes: nextCount } : x)));
      setHeartedIds((prev) => {
        const next = new Set(prev);
        if (liked) next.delete(c.id);
        else {
          next.add(c.id);
          setJustHearted(c.id);
        }
        return next;
      });
      try {
        localStorage.setItem(heartKey(c.id), liked ? "0" : "1");
      } catch {
        /* ignore */
      }
    } finally {
      setHeartBusy(null);
    }
  }

  const commentForm = (
    <div
      ref={formRef}
      className="pen-form rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)] sm:p-5"
    >
      {replyTo && (
        <div className="reply-pill mb-3 flex items-center justify-between gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1.5">
          <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Replying to {replyTo.author_name}
          </span>
          <button
            type="button"
            onClick={() => setReplyTo(null)}
            className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)] hover:underline"
          >
            cancel
          </button>
        </div>
      )}
      <input
        type="text"
        value={name}
        onChange={(e) => rememberName(e.target.value)}
        maxLength={40}
        placeholder="Your name (optional)"
        className="field-box font-sans text-sm"
      />
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={1000}
        rows={3}
        placeholder={replyTo ? `Add a reply…` : "Leave a thought on this page…"}
        className="field-box mt-3 font-serif text-[1.05rem] leading-relaxed"
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="comment-charcount">
          <span className="comment-charcount__bar">
            <span
              style={{ width: `${(content.length / 1000) * 100}%` }}
              className={content.length > 900 ? "is-hot" : ""}
            />
          </span>
          <span className="tabular-nums">{content.length}/1000</span>
        </span>
        <button
          type="button"
          onClick={submit}
          disabled={submitting || content.trim().length === 0}
          className={`primary-button px-5 py-2 text-[11px] uppercase tracking-wider disabled:opacity-40 ${justSent ? "comment-sent" : ""}`}
        >
          {submitting ? "Sending…" : justSent ? "Sent ✦" : replyTo ? "Reply" : "Comment"}
        </button>
      </div>
      {error && (
        <p className="pen-shake mt-2 font-sans text-[11px] text-red-500">{error}</p>
      )}
    </div>
  );

  function renderComment(c: CommentRow, depth: number) {
    const replies = childrenByParent.get(c.id) ?? [];
    return (
      <div key={c.id} className={`comment-row ${depth > 0 ? "border-l-2 border-[var(--accent-soft)] pl-4" : ""}`}>
        <div className="group rounded-xl px-1 py-2">
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className="comment-avatar mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full font-sans text-[11px] font-bold text-[var(--text-heading)]"
              style={{ background: tintOf(c.author_name) }}
            >
              {c.author_name.trim().charAt(0).toUpperCase() || "✦"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-sans text-[12px] font-semibold text-[var(--text-heading)]">
                  {c.author_name}
                </span>
                <span className="font-sans text-[10px] text-[var(--text-faint)]">
                  {relTime(c.created_at)}
                </span>
              </p>
              <p className="mt-1 whitespace-pre-line font-serif text-[1.02rem] leading-relaxed text-[var(--text-primary)]">
                {c.content}
              </p>
              <span className="mt-1.5 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setReplyTo(c)}
                  className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)] hover:underline"
                >
                  Reply
                </button>
                {heartsAvailable && (
                  <button
                    type="button"
                    onClick={() => toggleHeart(c)}
                    onAnimationEnd={() => setJustHearted(null)}
                    disabled={heartBusy === c.id}
                    title={heartedIds.has(c.id) ? "Take back the heart" : "Heart this thought"}
                    className={`comment-heart flex items-center gap-1 font-sans text-[10px] font-bold tracking-wide transition-transform active:scale-125 ${
                      justHearted === c.id ? "comment-heart--pop" : ""
                    } ${
                      heartedIds.has(c.id) ? "text-[var(--accent-pink)]" : "text-[var(--text-faint)] hover:text-[var(--accent-pink)]"
                    }`}
                  >
                    <span aria-hidden className="text-[12px]">
                      {heartedIds.has(c.id) ? "❤" : "♡"}
                    </span>
                    {(c.likes ?? 0) > 0 && <span>{c.likes}</span>}
                  </button>
                )}
              </span>
            </div>
          </div>
        </div>
        {replies.length > 0 && (
          <div className="ml-4 space-y-1.5 pb-1 sm:ml-6">
            {replies.map((r) => renderComment(r, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="mt-16">
      <p className="eyebrow">In the margins</p>
      <h2 className="mt-2 flex flex-wrap items-baseline gap-x-3">
        Comments
        {!loading && comments.length > 0 && (
          <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--text-faint)]">
            {comments.length} {comments.length === 1 ? "thought" : "thoughts"}
          </span>
        )}
      </h2>

      {/* Write box lives up top — like writing in the margin right away */}
      <div className="mt-6">{commentForm}</div>

      {loading && <p className="gather mt-6 font-sans text-[12px] text-[var(--text-faint)]">Gathering thoughts…</p>}

      {unavailable && (
        <p className="mt-6 font-sans text-[12px] text-[var(--text-faint)]">
          Comments aren&apos;t set up yet — run <code>supabase/migrate-comments.sql</code> in the
          Supabase SQL editor to switch them on.
        </p>
      )}

      {!loading && !unavailable && comments.length > 0 && (
        <div className="mt-8 space-y-5">{roots.map((c) => renderComment(c, 0))}</div>
      )}

      {!loading && !unavailable && comments.length === 0 && (
        <p className="mt-8 font-script text-2xl text-[var(--text-faint)]">
          Not a single scribble yet. Be the first to leave your mark.
        </p>
      )}
    </section>
  );
}
