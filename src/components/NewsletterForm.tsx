"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "loading" | "done" | "error";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    const supabase = createClient();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: email.trim().toLowerCase() });
    if (error) {
      // already subscribed counts as done
      if (error.code === "23505") {
        setStatus("done");
        setEmail("");
        return;
      }
      setStatus("error");
      return;
    }
    setStatus("done");
    setEmail("");
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mt-6 flex gap-2 justify-center">
        <input
          type="email"
          required
          placeholder="Enter your email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field-box flex-1 max-w-[240px] rounded-full! px-5! font-sans text-sm"
        />
        <button type="submit" disabled={status === "loading"} className="btn-ink px-5!">
          {status === "loading" ? "…" : status === "done" ? "Joined ✓" : "Sign up"}
        </button>
      </form>
      {status === "done" && (
        <p className="animate-fadeIn mt-3 font-serif text-sm italic text-[var(--accent)]">
          Welcome in — you&apos;ll hear from me soon.
        </p>
      )}
      {status === "error" && (
        <p className="mt-3 font-sans text-xs text-red-500">
          Something went wrong — please try again.
        </p>
      )}
    </div>
  );
}
