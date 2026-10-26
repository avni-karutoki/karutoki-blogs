import React from "react";
import MidnightCard from "@/components/MidnightCard";
import Reveal from "@/components/Reveal";
import DecorativeDivider from "@/components/DecorativeDivider";
import { StaggerContainer } from "@/components/ScrollAnimations";
import { createPublicClient as createClient } from "@/lib/supabase/server";
import { MOOD_THEMES, moodFromTags, type MoodTheme } from "@/lib/mood";
import { formatDate } from "@/lib/date";

export const revalidate = 60;

interface Talk {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  tags: string[] | null;
  created_at: string;
  reading_time?: string | null;
}

function seeded(i: number): number {
  const x = Math.sin(i * 999.17) * 10000;
  return x - Math.floor(x);
}

const STAR_COUNT = 70;

export default async function MidnightTalksPage() {
  let talks: Talk[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select("id, title, slug, excerpt, cover_image, tags, created_at, reading_time")
      .eq("category", "midnight-talk")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (data) talks = data as Talk[];
  } catch (err) {
    console.error("Error loading midnight talks:", err);
  }

  if (talks.length === 0) {
    talks = [
      {
        id: "m1",
        title: "Maybe, it'll be different.",
        slug: "maybe-itll-be-different",
        excerpt: "A midnight thought about hope, uncertainty, and the possibility of tomorrow.",
        cover_image: null,
        tags: ["hope", "tomorrow"],
        created_at: new Date().toISOString(),
      },
      {
        id: "m2",
        title: "Dear 2 AM",
        slug: "dear-2-am",
        excerpt: "A quiet conversation with the thoughts that only seem to appear when everyone else is asleep.",
        cover_image: null,
        tags: ["2am", "secret"],
        created_at: new Date().toISOString(),
      },
    ];
  }

  // Tonight's sky leans wherever most of the talks point.
  const counts = new Map<string, number>();
  for (const t of talks) {
    const id = moodFromTags(t.tags).id;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  const dominantId = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "serene";
  const dominant: MoodTheme = MOOD_THEMES[dominantId as keyof typeof MOOD_THEMES] ?? MOOD_THEMES.serene;

  const stars = Array.from({ length: STAR_COUNT }, (_, i) => ({
    left: `${(seeded(i * 7 + 3) * 96 + 1).toFixed(1)}%`,
    top: `${(seeded(i * 13 + 5) * 80 + 4).toFixed(1)}%`,
    size: +(0.8 + seeded(i * 17 + 11) * 1.9).toFixed(1),
    delay: `${(seeded(i * 5 + 2) * 3.4).toFixed(2)}s`,
  }));

  return (
    <div className="midnight-zone relative min-h-screen overflow-hidden pb-28">
      {/* the sky */}
      <div aria-hidden className="stars absolute inset-0 pointer-events-none">
        {stars.map((s, i) => (
          <span
            key={i}
            style={{
              left: s.left,
              top: s.top,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDelay: s.delay,
            }}
          />
        ))}
      </div>
      <div aria-hidden className="moon" />
      <div aria-hidden className="meteor" />
      <div aria-hidden className="midnight-mist" />

      <section className="relative z-10 mx-auto max-w-4xl px-6 pt-20 text-center sm:px-8">
        <Reveal>
          <span className="midnight-zone__eyebrow font-sans text-xs font-semibold uppercase tracking-[0.25em]">
            Late night thoughts
          </span>

          <h1 className="midnight-zone__title mt-3 font-script text-5xl sm:text-6xl">
            Midnight Talks
          </h1>

          <p className="midnight-zone__lead mx-auto mt-4 max-w-xl font-serif text-base sm:text-lg leading-relaxed">
            The house is asleep. The sky is awake. Every window below opens onto
            a different night —{" "}
            <span className="italic">
              tonight it leans {dominant.label.toLowerCase()} {dominant.emoji}
            </span>
            .
          </p>

          <div className="midnight-zone__divider mt-6 mx-auto">
            <DecorativeDivider />
          </div>
        </Reveal>
      </section>

      <section className="relative z-10 mx-auto max-w-[1320px] px-6 sm:px-10 lg:px-16 mt-14">
        <StaggerContainer
          stagger={0.08}
          delay={0.1}
          itemClassName="h-full"
          className="group grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {talks.map((talk) => (
            <MidnightCard
              key={talk.id}
              title={talk.title}
              href={talk.slug}
              tags={talk.tags}
              excerpt={talk.excerpt}
              coverImage={talk.cover_image}
              date={formatDate(talk.created_at, { month: "long", year: "numeric" })}
              readTime={talk.reading_time ?? "a quiet while"}
            />
          ))}
        </StaggerContainer>

        <p className="midnight-zone__foot relative z-10 mx-auto mt-16 max-w-md text-center font-serif text-sm italic leading-relaxed">
          Tag your midnight thoughts with feelings in the admin — love, rain,
          hope, 2am… — and each talk opens onto its own sky.
        </p>
      </section>
    </div>
  );
}
