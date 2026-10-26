import Link from "next/link";
import Reveal from "@/components/Reveal";
import type { Post } from "@/lib/types";

/**
 * Fresh frames — a moving 35mm reel: the latest covers ride a projector
 * strip with sprocket holes, film grain, edge codes, and a light sweep.
 * It pans on its own on desktop (hover to pause); on touch screens it
 * becomes a normal swipeable strip.
 */

function Frame({ post, index, clone = false }: { post: Post; index: number; clone?: boolean }) {
  return (
    <Link
      href={`/writings/${post.slug}`}
      title={post.title}
      tabIndex={clone ? -1 : undefined}
      aria-hidden={clone || undefined}
      className="film-frame group relative block shrink-0"
    >
      <span className="film-frame__cell">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.cover_image ?? ""}
          alt={clone ? "" : post.title}
          loading="lazy"
          decoding="async"
        />
        <span className="film-frame__caption font-sans">{post.title}</span>
      </span>
      <span aria-hidden className="film-frame__code">
        Karutoki · 35mm · frame {String(index + 1).padStart(2, "0")}
      </span>
    </Link>
  );
}

export default function FilmRoll({ posts }: { posts: Post[] }) {
  const frames = posts.filter((p) => p.cover_image).slice(0, 8);
  if (frames.length < 3) return null;

  const loopFrames = (clone: boolean) =>
    frames.map((p, i) => <Frame key={`${clone ? "c-" : ""}${p.slug}`} post={p} index={i} clone={clone} />);

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
        <div className="film-roll">
          <div className="film-marquee">
            <div className="film-track">
              {loopFrames(false)}
              {loopFrames(true)}
            </div>
            {/* the projector's handiwork on top of the film */}
            <div aria-hidden className="film-grain" />
            <div aria-hidden className="film-glint" />
            <div aria-hidden className="film-vignette" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
