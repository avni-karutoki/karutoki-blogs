"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ContactPage() {
  const supabase = createClient();

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    const { error } = await supabase
      .from("contact_messages")
      .insert({
        name,
        email,
        subject,
        message,
      });

    setLoading(false);

    if (error) {
      console.error(error);
      setError("Something went wrong. Please try again.");
      return;
    }

    setSubmitted(true);
    form.reset();
  }

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-xl text-center">
          <p className="text-sm uppercase tracking-[0.25em] opacity-60">
            Contact Me
          </p>

          <h1 className="mt-4 text-4xl font-semibold">
            Message received ✨
          </h1>

          <p className="mt-4 opacity-70">
            Thank you for reaching out. I&apos;ll get back to you soon.
          </p>

          <button
            onClick={() => setSubmitted(false)}
            className="mt-8 rounded-full border px-6 py-3 text-sm transition hover:opacity-70"
          >
            Send another message
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-16 md:px-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.25em] opacity-60">
            Contact Me
          </p>

          <h1 className="mt-4 text-5xl font-semibold tracking-tight">
            Get in touch
          </h1>

          <p className="mt-5 text-base leading-7 opacity-70">
            Have something to say, share, collaborate on, or simply want to
            say hello? I&apos;d love to hear from you.
          </p>
        </div>

        <div className="mt-16 grid gap-12 md:grid-cols-2">
          {/* Left */}
          <div>
            <h2 className="text-2xl font-medium">Say hello</h2>

            <p className="mt-4 max-w-md leading-7 opacity-70">
              Whether it&apos;s about writing, ideas, projects, collaborations,
              or just a random thought — my inbox is open.
            </p>

            <div className="mt-10 space-y-4">
              <a
                href="https://www.instagram.com/avni.karutoki/"
                target="_blank"
                rel="noopener noreferrer"
                className="block transition hover:opacity-60"
              >
                Instagram ↗
              </a>

              <a
                href="https://pin.it/1WBBgualJ"
                target="_blank"
                rel="noopener noreferrer"
                className="block transition hover:opacity-60"
              >
                Pinterest ↗
              </a>

              <a
                href="https://www.linkedin.com/in/avni-karutoki"
                target="_blank"
                rel="noopener noreferrer"
                className="block transition hover:opacity-60"
              >
                LinkedIn ↗
              </a>

              <a
                href="https://x.com/avnikaruroki"
                target="_blank"
                rel="noopener noreferrer"
                className="block transition hover:opacity-60"
              >
                X (Twitter) ↗
              </a>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm opacity-70"
              >
                Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full border-b bg-transparent px-0 py-3 outline-none transition focus:border-opacity-100"
                placeholder="Your name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm opacity-70"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full border-b bg-transparent px-0 py-3 outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="subject"
                className="mb-2 block text-sm opacity-70"
              >
                Subject
              </label>

              <input
                id="subject"
                name="subject"
                type="text"
                required
                className="w-full border-b bg-transparent px-0 py-3 outline-none"
                placeholder="What&apos;s this about?"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="mb-2 block text-sm opacity-70"
              >
                Message
              </label>

              <textarea
                id="message"
                name="message"
                required
                rows={6}
                className="w-full resize-none border-b bg-transparent px-0 py-3 outline-none"
                placeholder="Write your message..."
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="rounded-full border px-7 py-3 text-sm transition hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send message ↗"}
            </button>
          </form>
        </div>

        <div className="mt-20 border-t pt-8">
          <p className="text-sm italic opacity-60">
            &quot;Some conversations begin with nothing more than a hello.&quot;
          </p>
        </div>
      </div>
    </main>
  );
}
