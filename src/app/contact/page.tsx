"use client";

import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSubmitted(true);
  }

  return (
    <main className="min-h-screen px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <section className="pt-10 text-center sm:pt-16">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--primary)]">
            Get in touch
          </p>

          <h1 className="mt-4 font-[var(--font-playfair)] text-5xl font-semibold sm:text-6xl">
            Contact Me
          </h1>

          <p className="mx-auto mt-5 max-w-2xl font-[var(--font-cormorant)] text-xl leading-relaxed text-[var(--foreground)]/60 sm:text-2xl">
            Have something to say, share, ask, or simply want to say hi?
            I&apos;d love to hear from you.
          </p>
        </section>

        {/* Contact Content */}
        <section className="mt-16 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">

          {/* Left Side */}
          <div className="rounded-3xl border border-[var(--border)] p-7 sm:p-9">
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--primary)]">
              Say hello
            </p>

            <h2 className="mt-4 font-[var(--font-playfair)] text-3xl font-semibold">
              Let&apos;s talk.
            </h2>

            <p className="mt-4 text-sm leading-7 text-[var(--foreground)]/60">
              Whether it&apos;s about my writings, collaborations, ideas,
              feedback, or just a random thought you want to share —
              my inbox is open.
            </p>

            {/* Social Links */}
            <div className="mt-8 border-t border-[var(--border)] pt-7">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--foreground)]/40">
                Find me elsewhere
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="https://www.instagram.com/avni.karutoki/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[var(--border)] px-4 py-2 text-sm transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                >
                  Instagram
                </a>

                <a
                  href="https://pin.it/1WBBgualJ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[var(--border)] px-4 py-2 text-sm transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                >
                  Pinterest
                </a>

                <a
                  href="https://www.linkedin.com/in/avni-karutoki"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[var(--border)] px-4 py-2 text-sm transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                >
                  LinkedIn
                </a>

                <a
                  href="https://x.com/avnikaruroki"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[var(--border)] px-4 py-2 text-sm transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                >
                  X
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-3xl border border-[var(--border)] p-7 sm:p-9">

            {submitted ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)]/10 text-2xl">
                  ✓
                </div>

                <h2 className="mt-6 font-[var(--font-playfair)] text-3xl font-semibold">
                  Message received.
                </h2>

                <p className="mt-3 max-w-sm text-sm leading-7 text-[var(--foreground)]/60">
                  Thank you for reaching out. Your message has been noted.
                  I&apos;ll get back to you soon.
                </p>

                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-7 rounded-xl border border-[var(--border)] px-5 py-3 text-sm transition hover:bg-[var(--foreground)]/5"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    placeholder="Your name"
                    required
                    className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3.5 text-sm outline-none transition placeholder:text-[var(--foreground)]/30 focus:border-[var(--primary)]"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3.5 text-sm outline-none transition placeholder:text-[var(--foreground)]/30 focus:border-[var(--primary)]"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Subject
                  </label>

                  <input
                    type="text"
                    name="subject"
                    placeholder="What&apos;s on your mind?"
                    required
                    className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3.5 text-sm outline-none transition placeholder:text-[var(--foreground)]/30 focus:border-[var(--primary)]"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Message
                  </label>

                  <textarea
                    name="message"
                    rows={7}
                    placeholder="Write your message..."
                    required
                    className="w-full resize-y rounded-xl border border-[var(--border)] bg-transparent px-4 py-3.5 text-sm leading-7 outline-none transition placeholder:text-[var(--foreground)]/30 focus:border-[var(--primary)]"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[var(--foreground)] px-6 py-3.5 text-sm font-medium text-[var(--background)] transition hover:opacity-90"
                >
                  Send Message →
                </button>

              </form>
            )}
          </div>
        </section>

        {/* Bottom Quote */}
        <section className="mt-20 border-t border-[var(--border)] pt-10 text-center">
          <p className="font-[var(--font-cormorant)] text-lg italic text-[var(--foreground)]/40">
            &quot;Some conversations begin with nothing more than a hello.&quot;
          </p>
        </section>

      </div>
    </main>
  );
}