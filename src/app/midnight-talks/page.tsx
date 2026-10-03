import React from "react";
import WritingCard from "@/components/WritingCard";
import DecorativeDivider from "@/components/DecorativeDivider";
import { createPublicClient as createClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function MidnightTalksPage() {
  let talks: { id: string; title: string; slug: string; excerpt: string | null; cover_image: string | null; created_at: string; reading_time?: string | null }[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select("id, title, slug, excerpt, cover_image, created_at, reading_time")
      .eq("category", "midnight-talk")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (data) talks = data;
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
        created_at: new Date().toISOString(),
      },
      {
        id: "m2",
        title: "Dear 2 AM",
        slug: "dear-2-am",
        excerpt: "A quiet conversation with the thoughts that only seem to appear when everyone else is asleep.",
        cover_image: null,
        created_at: new Date().toISOString(),
      },
    ];
  }

  return (
    <div className="min-h-screen pb-24">
      <section className="mx-auto max-w-4xl px-6 pt-16 text-center sm:px-8">
        <span className="font-sans text-xs font-semibold tracking-[0.25em] text-[var(--accent-pink)] uppercase">
          LATE NIGHT THOUGHTS
        </span>

        <h1 className="mt-3 font-script text-5xl sm:text-6xl text-[var(--text-heading)]">
          Midnight Talks
        </h1>

        <p className="mx-auto mt-4 max-w-xl font-serif text-base sm:text-lg text-[var(--text-muted)] leading-relaxed">
          Late-night thoughts, conversations with the quiet, and questions asked at 2 AM.
        </p>

        <DecorativeDivider />
      </section>

      <section className="mx-auto max-w-[1320px] px-6 sm:px-10 lg:px-16 mt-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {talks.map((talk) => (
            <WritingCard
              key={talk.id}
              category="MIDNIGHT TALK"
              title={talk.title}
              excerpt={talk.excerpt}
              href={`/writings/${talk.slug}`}
              coverImage={talk.cover_image}
              date={new Date(talk.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              readTime={talk.reading_time ? `${talk.reading_time} read` : undefined}
            />
          ))}
        </div>
      </section>
    </div>
  );
}