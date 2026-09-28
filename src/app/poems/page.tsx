import React from "react";
import WritingCard from "@/components/WritingCard";
import DecorativeDivider from "@/components/DecorativeDivider";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PoemsPage() {
  let poems: { id: string; title: string; slug: string; excerpt: string | null; cover_image: string | null; created_at: string; reading_time?: string | null }[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select("id, title, slug, excerpt, cover_image, created_at, reading_time")
      .eq("category", "poem")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (data) poems = data;
  } catch (err) {
    console.error("Error loading poems:", err);
  }

  if (poems.length === 0) {
    poems = [
      {
        id: "p1",
        title: "Tired of the same sky.",
        slug: "tired-of-the-same-sky",
        excerpt: "A little poem about the nights when you feel everything, yet somehow feel nothing at all.",
        cover_image: null,
        created_at: new Date().toISOString(),
      },
      {
        id: "p2",
        title: "The Things We Never Said",
        slug: "the-things-we-never-said",
        excerpt: "Some feelings remain between the lines, waiting for someone to read them.",
        cover_image: null,
        created_at: new Date().toISOString(),
      },
    ];
  }

  return (
    <div className="min-h-screen pb-24">
      <section className="mx-auto max-w-4xl px-6 pt-16 text-center sm:px-8">
        <span className="font-sans text-xs font-semibold tracking-[0.25em] text-[var(--accent-pink)] uppercase">
          POETRY COLLECTION
        </span>

        <h1 className="mt-3 font-script text-5xl sm:text-6xl text-[var(--text-heading)]">
          Poems
        </h1>

        <p className="mx-auto mt-4 max-w-xl font-serif text-base sm:text-lg text-[var(--text-muted)] leading-relaxed">
          Words that found a rhythm, emotions translated into stanzas, and feelings left between lines.
        </p>

        <DecorativeDivider />
      </section>

      <section className="mx-auto max-w-[1320px] px-6 sm:px-10 lg:px-16 mt-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {poems.map((poem) => (
            <WritingCard
              key={poem.id}
              category="POEM"
              title={poem.title}
              excerpt={poem.excerpt}
              href={`/writings/${poem.slug}`}
              coverImage={poem.cover_image}
              date={new Date(poem.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              readTime={poem.reading_time ? `${poem.reading_time} read` : undefined}
            />
          ))}
        </div>
      </section>
    </div>
  );
}