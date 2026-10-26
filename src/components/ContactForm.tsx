"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "loading" | "done" | "error";

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/** Quick chips that pre-fill the subject line. */
const SUBJECT_CHIPS: Array<{ label: string; subject: string }> = [
  { label: "Just hello", subject: "Hello, Karutoki!" },
  { label: "A thought on a writing", subject: "About one of your writings" },
  { label: "Working together", subject: "A collaboration idea" },
  { label: "Something heavy", subject: "Something I needed to get off my chest" },
];

export default function ContactForm() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");

  function update(field: keyof FormState) {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function applyChip(subject: string) {
    setForm((f) => ({ ...f, subject }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const supabase = createClient();
    const { error } = await supabase.from("contact_messages").insert({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      subject: form.subject.trim() || "New message from Karutoki",
      message: form.message.trim(),
    });
    if (error) {
      setStatus("error");
    } else {
      setStatus("done");
      setForm({ name: "", email: "", subject: "", message: "" });
    }
  }

  if (status === "done") {
    return (
      <div className="vintage-card contact-seal-card relative animate-fadeUp overflow-visible p-8 text-center sm:p-10">
        {/* the wax seal, stamped down as the card arrives */}
        <div className="contact-seal" aria-hidden>
          <span className="contact-seal__glyph">✦</span>
        </div>
        <p className="font-script text-4xl text-[var(--text-heading)]">Sealed &amp; sent.</p>
        <p className="mt-3 font-serif text-lg italic text-[var(--text-muted)]">
          Your letter has arrived at the desk. I&apos;ll write back soon.
        </p>
        <p className="contact-postmark mt-4 font-sans text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--text-muted)]">
          Received · {new Date().toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata", day: "numeric", month: "long", year: "numeric" })}
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 font-sans text-xs font-semibold uppercase tracking-wider text-[var(--accent)] underline-offset-4 hover:underline"
        >
          Write another
        </button>
      </div>
    );
  }

  const activeChip = SUBJECT_CHIPS.find((c) => c.subject === form.subject);

  return (
    <form onSubmit={handleSubmit} className="vintage-card pen-form space-y-7 p-7 sm:p-9">
      <div className="grid gap-7 sm:grid-cols-2">
        <div>
          <label className="eyebrow">Name</label>
          <input
            required
            value={form.name}
            onChange={update("name")}
            placeholder="Your name"
            className="field-underline mt-1 font-sans"
          />
        </div>
        <div>
          <label className="eyebrow">Email</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={update("email")}
            placeholder="you@example.com"
            className="field-underline mt-1 font-sans"
          />
        </div>
      </div>

      <div>
        <label className="eyebrow">What&apos;s this about?</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {SUBJECT_CHIPS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => applyChip(chip.subject)}
              className={`contact-chip ${activeChip?.subject === chip.subject ? "contact-chip--active" : ""}`}
            >
              {chip.label}
            </button>
          ))}
        </div>
        <input
          value={form.subject}
          onChange={update("subject")}
          placeholder="…or write your own subject"
          className="field-underline mt-3 font-sans"
        />
      </div>

      <div>
        <label className="eyebrow">Message</label>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={update("message")}
          placeholder="Write what you couldn't say out loud…"
          className="field-box mt-2 font-serif text-[1.05rem] leading-relaxed"
        />
      </div>

      <button type="submit" disabled={status === "loading"} className="btn-ink w-full justify-center sm:w-auto">
        {status === "loading" ? "Sealing the envelope…" : "Send message →"}
      </button>
      {status === "error" && (
        <p className="pen-shake font-sans text-sm text-red-500">The letter wouldn&apos;t leave — please try again in a moment.</p>
      )}
    </form>
  );
}
