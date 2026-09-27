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

export default function ContactForm() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");

  function update(field: keyof FormState) {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
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
      <div className="vintage-card animate-fadeUp p-8 text-center">
        <p className="font-script text-4xl text-[var(--text-heading)]">Thank you!</p>
        <p className="mt-3 font-serif text-lg italic text-[var(--text-muted)]">
          Your message has arrived. I&apos;ll write back soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="vintage-card space-y-7 p-7 sm:p-9">
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
        <label className="eyebrow">Subject</label>
        <input
          value={form.subject}
          onChange={update("subject")}
          placeholder="What's this about?"
          className="field-underline mt-1 font-sans"
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
        {status === "loading" ? "Sending…" : "Send message →"}
      </button>
      {status === "error" && (
        <p className="font-sans text-sm text-red-500">Something went wrong — please try again.</p>
      )}
    </form>
  );
}
