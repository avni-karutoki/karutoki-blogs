type WritingCardProps = {
  category: string;
  title: string;
  excerpt: string;
  date: string;
  href?: string;
};

export default function WritingCard({
  category,
  title,
  excerpt,
  date,
  href = "#",
}: WritingCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* Decorative top area */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-[var(--primary-dark)] via-[var(--primary)] to-[var(--secondary)]">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full border border-white/50" />
          <div className="absolute -bottom-16 -left-8 h-40 w-40 rounded-full border border-white/30" />
        </div>

        <div className="relative flex h-full items-center justify-center">
          <span className="font-[var(--font-cormorant)] text-3xl italic text-white/90">
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">

        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--primary)]">
            {category}
          </span>

          <span className="text-xs text-[var(--foreground)]/50">
            {date}
          </span>
        </div>

        <h3 className="font-[var(--font-playfair)] text-xl font-semibold leading-snug">
          {title}
        </h3>

        <p className="mt-3 flex-1 font-[var(--font-cormorant)] text-lg leading-relaxed text-[var(--foreground)]/70">
          {excerpt}
        </p>

        <a
          href={href}
          className="mt-6 inline-flex items-center text-sm font-medium tracking-wide text-[var(--primary)] transition-all duration-300 group-hover:gap-2"
        >
          Read more
          <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </a>

      </div>
    </article>
  );
}