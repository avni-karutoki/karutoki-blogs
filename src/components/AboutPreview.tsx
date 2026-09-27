export default function AboutPreview() {
  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-24 sm:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] px-8 py-16 text-center sm:px-12">
        
        {/* Decorative elements */}
        <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full border border-[var(--accent)]/10" />
        <div className="absolute -bottom-20 -right-12 h-48 w-48 rounded-full border border-[var(--accent)]/10" />

        <div className="relative z-10">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            A little about me
          </p>

          <h2 className="font-script text-3xl font-semibold sm:text-4xl">
            Hello, I&apos;m Avni.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl font-serif text-xl leading-relaxed text-[var(--text-primary)]/70">
            A girl who finds comfort in words, poetry, stories and the little
            things that make ordinary moments feel special.
          </p>

          <p className="mx-auto mt-4 max-w-xl font-serif text-lg italic text-[var(--text-primary)]/60">
            This is my little corner of the internet — where thoughts become
            words and words become stories.
          </p>

          <a
            href="/about"
            className="mt-8 inline-flex items-center rounded-full border border-[var(--accent)]/40 px-6 py-3 text-sm font-medium tracking-wide text-[var(--accent)] transition-all duration-300 hover:bg-[var(--accent)]/10 hover:scale-105"
          >
            Know more about me
            <span className="ml-2">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}