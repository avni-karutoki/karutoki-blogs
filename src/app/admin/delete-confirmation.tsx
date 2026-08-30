"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePost } from "./actions";

type DeleteConfirmationProps = {
  postId: string;
  title: string;
};

export default function DeleteConfirmation({
  postId,
  title,
}: DeleteConfirmationProps) {
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    startTransition(async () => {
      await deletePost(postId);

      setShowModal(false);
      router.refresh();
    });
  }

  return (
    <>
      {/* Delete Button */}
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="rounded-xl border border-red-500/30 px-4 py-2.5 text-sm text-red-500 transition hover:bg-red-500/10"
      >
        Delete
      </button>

      {/* Confirmation Popup */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-5 backdrop-blur-sm"
          onClick={() => {
            if (!isPending) {
              setShowModal(false);
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--background)] p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
              <span className="text-2xl">⚠️</span>
            </div>

            {/* Heading */}
            <div className="mt-5 text-center">
              <h2 className="font-[var(--font-playfair)] text-2xl font-semibold">
                Delete this writing?
              </h2>

              <p className="mt-3 break-words text-sm leading-relaxed text-[var(--foreground)]/60">
                Are you sure you want to delete{" "}
                <span className="font-medium text-[var(--foreground)]">
                  “{title}”
                </span>
                ?
              </p>

              <p className="mt-2 text-xs text-[var(--foreground)]/40">
                This action cannot be undone.
              </p>
            </div>

            {/* Buttons */}
            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={isPending}
                className="flex-1 rounded-xl border border-[var(--border)] px-5 py-3 text-sm transition hover:bg-[var(--foreground)]/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 rounded-xl bg-red-500 px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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