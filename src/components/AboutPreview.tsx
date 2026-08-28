export default function AboutPreview() {
  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-24 sm:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-8 py-16 text-center sm:px-12">
        
        {/* Decorative elements */}
        <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full border border-[var(--primary)]/10" />
        <div className="absolute -bottom-20 -right-12 h-48 w-48 rounded-full border border-[var(--primary)]/10" />

        <div className="relative z-10">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-[var(--primary)]">
            A little about me
          </p>

          <h2 className="font-[var(--font-playfair)] text-3xl font-semibold sm:text-4xl">
            Hello, I&apos;m Avni.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl font-[var(--font-cormorant)] text-xl leading-relaxed text-[var(--foreground)]/70">
            A girl who finds comfort in words, poetry, stories and the little
            things that make ordinary moments feel special.
          </p>

          <p className="mx-auto mt-4 max-w-xl font-[var(--font-cormorant)] text-lg italic text-[var(--foreground)]/60">
            This is my little corner of the internet — where thoughts become
            words and words become stories.
          </p>

          <a
            href="/about"
            className="mt-8 inline-flex items-center rounded-full border border-[var(--primary)]/40 px-6 py-3 text-sm font-medium tracking-wide text-[var(--primary)] transition-all duration-300 hover:bg-[var(--primary)]/10 hover:scale-105"
          >
            Know more about me
            <span className="ml-2">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}