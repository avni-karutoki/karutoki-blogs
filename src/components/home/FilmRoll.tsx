import Link from "next/link";
import Reveal from "@/components/Reveal";
import type { Post } from "@/lib/types";

/** A rolling film strip of the most recent covers — the credits reel of the desk. */

export default function FilmRoll({ posts }: { posts: Post[] }) {
  const frames = posts.filter((p) => p.cover_image).slice(0, 8);
  if (frames.length < 3) return null;

  return (
    <section aria-label="Recent covers" className="py-16">
      <Reveal className="mb-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[1.6rem]!">Fresh frames</h2>
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--text-faint)]">
            the latest, on 35mm
          </p>
        </div>
      </Reveal>
      <Reveal>
        <div className="film-roll overflow-hidden p-3">
          {/* scrollable by an actual drag/swipe; scrollbar stays invisible */}
          <div className="flex gap-3 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {frames.map((p) => (
              <Link
                key={p.slug}
                href={`/writings/${p.slug}`}
                title={p.title}
                className="film-frame group block shrink-0 scroll-ml-3 first:scroll-pl-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.cover_image ?? ""}
                  alt={p.title}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[16/11] w-40 rounded-lg object-cover transition-transform duration-500 group-hover:scale-[1.04] sm:w-48"
                />
              </Link>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
