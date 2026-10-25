import type { CSSProperties } from "react";
import { moodFromTags, type MoodTheme } from "@/lib/mood";
import { categoryLabel } from "@/lib/types";

interface MidnightCardProps {
  title: string;
  href: string;
  tags?: string[] | null;
  excerpt?: string | null;
  coverImage?: string | null;
  date?: string;
  readTime?: string;
}

/** Deterministic mini-star positions — SSR/client markup always match. */
function seeded(i: number): number {
  const x = Math.sin(i * 991.7) * 10000;
  return x - Math.floor(x);
}

/**
 * A midnight writing as a window into its own night: the mood (from the
 * writing's tags) decides which sky the card carries — serene blue, rainy
 * grey, hopeful amber, romantic rose or mysterious violet.
 */
export default function MidnightCard({
  title,
  href,
  tags,
  excerpt,
  coverImage,
  date,
  readTime,
}: MidnightCardProps) {
  const mood: MoodTheme = moodFromTags(tags);
  const moodTags = (tags ?? []).slice(0, 2);
  const miniStars = Array.from({ length: 6 }, (_, i) => ({
    left: `${(seeded(i * 7 + 3) * 88 + 4).toFixed(1)}%`,
    top: `${(seeded(i * 13 + 5) * 62 + 8).toFixed(1)}%`,
    size: +(1 + seeded(i * 17 + 11) * 1.4).toFixed(1),
    delay: `${(seeded(i * 5 + 2) * 3.2).toFixed(2)}s`,
  }));

  const moodVars = {
    "--mood-deep": mood.deep,
    "--mood-mid": mood.mid,
    "--mood-glow": mood.glow,
  } as CSSProperties;

  return (
    <article className="midnight-card" style={moodVars}>
      <a href={`/writings/${href}`} className="block h-full focus-visible:outline-2">
        {/* the window — cover photo or this writing's own patch of night */}
        {coverImage ? (
          <div className="midnight-card__window midnight-card__window--photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImage}
              alt={title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="midnight-card__tint" aria-hidden />
          </div>
        ) : (
          <div className="midnight-card__window" aria-hidden>
            {miniStars.map((s, i) => (
              <span
                key={i}
                className="midnight-card__star"
                style={{
                  left: s.left,
                  top: s.top,
                  width: `${s.size}px`,
                  height: `${s.size}px`,
                  animationDelay: s.delay,
                }}
              />
            ))}
            <span className="midnight-card__moon-glyph">☾</span>
          </div>
        )}

        <div className="midnight-card__body">
          {/* mood + category */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="midnight-card__mood" title="The mood of this writing">
              {mood.emoji} {mood.label} night
            </span>
            <span className="midnight-card__cat">{categoryLabel("midnight-talk")}</span>
          </div>

          {/* the mood tags themselves */}
          {moodTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {moodTags.map((t) => (
                <span key={t} className="midnight-card__tag">
                  {t}
                </span>
              ))}
            </div>
          )}

          <h3 className="midnight-card__title">{title}</h3>
          {excerpt && <p className="midnight-card__excerpt">{excerpt}</p>}

          <div className="midnight-card__foot">
            <span>
              📅 {date} <span aria-hidden>•</span> 🕒 {readTime}
            </span>
            <span className="midnight-card__more">
              Read <span aria-hidden>→</span>
            </span>
          </div>
        </div>
      </a>
    </article>
  );
}
