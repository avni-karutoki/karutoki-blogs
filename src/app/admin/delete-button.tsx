"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePost } from "./actions";

export default function DeleteButton({
  postId,
}: {
  postId: string;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    startTransition(async () => {
      await deletePost(postId);
      setShowConfirm(false);
      router.refresh();
    });
  }

  return (
    <>
      {/* Delete Button */}
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="rounded-xl border border-red-500/30 px-4 py-2.5 text-sm text-red-500 transition hover:bg-red-500/10"
      >
        Delete
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--background)] p-7 shadow-2xl">
            
            {/* Icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
              <span className="text-2xl">⚠️</span>
            </div>

            {/* Text */}
            <div className="mt-5 text-center">
              <h2 className="font-[var(--font-playfair)] text-2xl font-semibold">
                Delete this writing?
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-[var(--foreground)]/60">
                This action cannot be undone. The writing will be permanently
                removed from your dashboard.
              </p>
            </div>

            {/* Buttons */}
            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={isPending}
                className="flex-1 rounded-xl border border-[var(--border)] px-5 py-3 text-sm transition hover:bg-[var(--foreground)]/5 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 rounded-xl bg-red-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}