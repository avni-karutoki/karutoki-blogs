import React from "react";
import WritingCard from "@/components/WritingCard";
import DecorativeDivider from "@/components/DecorativeDivider";
import { createPublicClient as createClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function BlogsPage() {
  let blogs: { id: string; title: string; slug: string; excerpt: string | null; cover_image: string | null; created_at: string; reading_time?: string | null }[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select("id, title, slug, excerpt, cover_image, created_at, reading_time")
      .eq("category", "blog")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (data) blogs = data;
  } catch (err) {
    console.error("Error loading blogs:", err);
  }

  if (blogs.length === 0) {
    blogs = [
      {
        id: "b1",
        title: "The quiet in between.",
        slug: "the-quiet-in-between",
        excerpt: "Sometimes the moments between everything are the ones worth remembering.",
        cover_image: null,
        created_at: new Date().toISOString(),
      },
      {
        id: "b2",
        title: "A Little Bit of Everything",
        slug: "a-little-bit-of-everything",
        excerpt: "Thoughts, stories, little observations and everything that crosses my mind.",
        cover_image: null,
        created_at: new Date().toISOString(),
      },
    ];
  }

  return (
    <div className="min-h-screen pb-24">
      <section className="mx-auto max-w-4xl px-6 pt-16 text-center sm:px-8">
        <span className="font-sans text-xs font-semibold tracking-[0.25em] text-[var(--accent-pink)] uppercase">
          STORIES & ESSAYS
        </span>

        <h1 className="mt-3 font-script text-5xl sm:text-6xl text-[var(--text-heading)]">
          Blogs
        </h1>

        <p className="mx-auto mt-4 max-w-xl font-serif text-base sm:text-lg text-[var(--text-muted)] leading-relaxed">
          Reflections on life, stories, observations, and little moments worth remembering.
        </p>

        <DecorativeDivider />
      </section>

      <section className="mx-auto max-w-[1320px] px-6 sm:px-10 lg:px-16 mt-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <WritingCard
              key={blog.id}
              category="BLOG"
              title={blog.title}
              excerpt={blog.excerpt}
              href={`/writings/${blog.slug}`}
              coverImage={blog.cover_image}
              date={new Date(blog.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              readTime={blog.reading_time ? `${blog.reading_time} read` : undefined}
            />
          ))}
        </div>
      </section>
    </div>
  );
}