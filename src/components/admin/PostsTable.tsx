"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/lib/types";

export default function PostsTable({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [busyId, setBusyId] = useState<string | null>(null);
  const router = useRouter();

  async function togglePublished(post: Post) {
    setBusyId(post.id);
    const supabase = createClient();
    const { error } = await supabase
      .from("posts")
      .update({ published: !post.published })
      .eq("id", post.id);
    if (!error) {
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, published: !p.published } : p))
      );
    }
    setBusyId(null);
  }

  async function deletePost(post: Post) {
    if (!confirm(`Delete "${post.title}"? This can't be undone.`)) return;
    setBusyId(post.id);
    const supabase = createClient();
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (!error) {
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    }
    setBusyId(null);
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <a
          href="/admin/new"
          className="bg-ink text-paper text-[12px] uppercase tracking-widest2 px-4 py-2"
        >
          New writing
        </a>
        <button onClick={signOut} className="ink-link text-[12px] uppercase tracking-widest2">
          Sign out
        </button>
      </div>

      <div className="divide-y divide-line border-t border-b border-line">
        {posts.length === 0 && (
          <p className="text-ink/50 text-sm py-6">No writings yet — create your first one.</p>
        )}
        {posts.map((post) => (
          <div key={post.id} className="flex items-center justify-between gap-4 py-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest2 text-ink/50">{post.category}</p>
              <p className="font-serif text-lg">{post.title}</p>
              <p className="text-[11px] text-ink/50">
                {post.published ? "Published" : "Draft"} · /{post.slug}
              </p>
            </div>
            <div className="flex items-center gap-4 text-[12px] uppercase tracking-widest2 shrink-0">
              <button
                onClick={() => togglePublished(post)}
                disabled={busyId === post.id}
                className="ink-link"
              >
                {post.published ? "Unpublish" : "Publish"}
              </button>
              <button
                onClick={() => deletePost(post)}
                disabled={busyId === post.id}
                className="ink-link text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
