import React from "react";
import Link from "next/link";

interface WritingCardProps {
  category: string;
  title: string;
  excerpt?: string | null;
  date?: string;
  readTime?: string;
  href: string;
  coverImage?: string | null;
}

export default function WritingCard({
  category,
  title,
  excerpt,
  date = "August 2026",
  readTime = "3 min read",
  href,
  coverImage,
}: WritingCardProps) {
  return (
    <article className="vintage-card group flex flex-col justify-between p-6 sm:p-8 h-full">
      <div>
        {/* Cover Image if available */}
        {coverImage ? (
          <div className="mb-7 overflow-hidden rounded-xl border border-[var(--border-color)] aspect-[16/10]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImage}
              alt={title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="mb-7 flex h-40 w-full items-center justify-center rounded-xl border border-[var(--border-pink)] bg-[var(--bg-secondary)] text-center p-4">
            <span className="font-sans text-[11px] font-medium tracking-[0.2em] text-[var(--text-muted)] uppercase">
              {category} JOURNAL
            </span>
          </div>
        )}

        {/* Category Tag */}
        <span className="font-sans text-xs font-semibold tracking-[0.18em] text-[var(--accent-pink)] uppercase">
          {category}
        </span>

        {/* Handwritten Title */}
        <h3 className="mt-3 font-script text-3xl sm:text-4xl leading-[1.1] text-[var(--text-heading)] group-hover:text-[var(--accent-pink)] transition-colors">
          {title}
        </h3>

        {/* Excerpt */}
        {excerpt && (
          <p className="mt-4 font-serif text-[1.02rem] leading-relaxed text-[var(--text-muted)] line-clamp-3">
            {excerpt}
          </p>
        )}
      </div>

      {/* Meta & Action */}
      <div className="mt-7 border-t border-[var(--border-light)] pt-5">
        <div className="flex items-center justify-between text-xs font-sans text-[var(--text-muted)]">
          <div className="flex items-center gap-3">
            <span>📅 {date}</span>
            <span>•</span>
            <span>🕒 {readTime}</span>
          </div>
        </div>

        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-1 font-sans text-xs font-semibold tracking-wider text-[var(--accent-pink)] transition-all group-hover:translate-x-1 group-hover:text-[var(--text-heading)]"
        >
          READ MORE →
        </Link>
      </div>
    </article>
  );
}
