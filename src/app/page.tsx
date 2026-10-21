import Link from "next/link";
import Hero from "@/components/Hero";
import Reveal, { SpringReveal } from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import NewsletterForm from "@/components/NewsletterForm";
import { createPublicClient as createClient } from "@/lib/supabase/server";
import { DEFAULT_ABOUT, DEFAULT_HERO, getSiteSetting } from "@/lib/site";
import type { AboutSettings, HeroSettings, Post } from "@/lib/types";
import { categoryLabel } from "@/lib/types";
import { FloatingElement, Parallax } from "@/components/ScrollAnimations";
import { StaggerContainer } from "@/components/ScrollAnimations";

export const revalidate = 60;

async function getHomeData() {
  try {
    const supabase = await createClient();
    // Narrow columns: never ship the full `content` body to the homepage.
    const LIST_COLUMNS =
      "id, slug, title, excerpt, cover_image, category, reading_time, created_at";
    const [postsRes, hero, about, poemsCount, blogsCount, talksCount] = await Promise.all([
      supabase
        .from("posts")
        .select(LIST_COLUMNS)
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(8),
      getSiteSetting<HeroSettings>(supabase, "hero", DEFAULT_HERO),
      getSiteSetting<AboutSettings>(supabase, "about", DEFAULT_ABOUT),
      supabase.from("posts").select("id", { count: "exact", head: true }).eq("published", true).eq("category", "poem"),
      supabase.from("posts").select("id", { count: "exact", head: true }).eq("published", true).eq("category", "blog"),
      supabase.from("posts").select("id", { count: "exact", head: true }).eq("published", true).eq("category", "midnight-talk"),
    ]);
    const posts = (postsRes.data as Post[]) || [];
    // Featured shelf is best-effort: an older DB without the `featured`
    // column must never blank the whole homepage.
    let featuredPosts: Post[] = [];
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(LIST_COLUMNS)
        .eq("published", true)
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(4);
      if (!error) featuredPosts = (data as Post[]) || [];
    } catch {
      /* fall back to latest below */
    }
    const counts = {
      poems: poemsCount.count ?? 0,
      blogs: blogsCount.count ?? 0,
      talks: talksCount.count ?? 0,
    };
    return { posts, featuredPosts, hero, about, counts };
  } catch {
    return { posts: [], featuredPosts: [], hero: DEFAULT_HERO, about: DEFAULT_ABOUT, counts: { poems: 0, blogs: 0, talks: 0 } };
  }
}

export default async function HomePage() {
  const { posts, featuredPosts, hero, about, counts } = await getHomeData();
  // Editor's picks first; fall back to the latest when nothing is featured.
  const shelf = featuredPosts.length > 0 ? featuredPosts : posts.slice(0, 4);
  const shelfEyebrow = featuredPosts.length > 0 ? "Handpicked" : "Fresh from the desk";
  const shelfSub =
    featuredPosts.length > 0
      ? "The pieces I'd press into your hands."
      : "A few words, no longer than they need to be.";

  return (
    <div>
      <Hero hero={hero} featured={posts} counts={counts} />

      <div className="mx-auto max-w-6xl px-6">
        {/* Featured writings */}
        <section className="py-16">
          <Reveal className="mb-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                eyebrow={shelfEyebrow}
                title="Featured writings"
                sub={shelfSub}
              />
              <Link
                href="/writings"
                className="ink-link font-sans text-[12px] font-semibold uppercase tracking-[0.2em]"
              >
                See all writings →
              </Link>
            </div>
          </Reveal>

          <StaggerContainer
            stagger={0.1}
            delay={0.15}
            itemClassName="h-full"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {shelf.length === 0 && (
              <p className="body-text col-span-full">
                No writings yet — the admin can publish the first piece from{" "}
                <Link href="/admin" className="ink-link text-[var(--accent)]">/admin</Link>.
              </p>
            )}
            {shelf.map((post, i) => (
              <SpringReveal
                key={post.slug}
                delay={i * 0.08}
                className="vintage-card group flex h-full flex-col p-5"
              >
                <Link
                  href={`/writings/${post.slug}`}
                  className="flex h-full flex-col"
                >
                  {post.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      loading="lazy"
                      decoding="async"
                      className="mb-4 aspect-[16/10] w-full rounded-xl border border-[var(--border-color)] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  ) : null}
                  <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                    {categoryLabel(post.category)}
                  </p>
                  <h3 className="mt-2 text-[1.7rem]! leading-tight transition-colors group-hover:text-[var(--accent)]">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 font-serif text-[0.98rem] leading-relaxed text-[var(--text-muted)]">
                    {post.excerpt}
                  </p>
                  <p className="mt-4 font-sans text-[11px] text-[var(--text-faint)]">
                    {post.reading_time ? `${post.reading_time} read` : ""}
                  </p>
                </Link>
              </SpringReveal>
            ))}
          </StaggerContainer>
        </section>

        {/* About teaser */}
        <section className="grid items-center gap-10 border-t border-[var(--border-color)] py-16 md:grid-cols-2">
          <div className="relative order-2 md:order-1">
            <Parallax speed={0.1} className="mx-auto max-w-xs">
              <Reveal>
                <div className="photo-stack">
                  <div className="layer" />
                  <div className="layer" />
                  <div className="layer flex aspect-square items-center justify-center p-8 text-center">
                    {about.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={about.imageUrl} alt="About" className="absolute inset-0 h-full w-full rounded-md object-cover" />
                    ) : (
                      <p className="font-script text-4xl text-[var(--text-heading)]">{about.title}</p>
                    )}
                  </div>
                </div>
              </Reveal>
            </Parallax>
            <FloatingElement amplitude={20} duration={8} delay={0} className="pointer-events-none absolute -right-6 -top-10 h-24 w-24 rounded-full bg-[var(--accent-soft)] blur-xl"><div /></FloatingElement>
            <FloatingElement amplitude={15} duration={10} delay={1} className="pointer-events-none absolute -bottom-10 -left-8 h-20 w-20 rounded-full bg-[var(--accent-soft)] blur-xl"><div /></FloatingElement>
          </div>
          <Reveal delay={0.12} className="order-1 md:order-2">
            <p className="eyebrow">{about.subtitle}</p>
            <h2 className="mt-2">{about.title}</h2>
            <p className="lead mt-4 max-w-md">{about.bio}</p>
            <Link
              href="/about"
              className="ink-link mt-6 inline-block font-sans text-[12.5px] font-semibold uppercase tracking-[0.2em]"
            >
              Read more →
            </Link>
          </Reveal>
        </section>

        {/* Newsletter */}
        <section id="newsletter" className="scroll-mt-24 border-t border-[var(--border-color)] py-16 text-center relative">
          <FloatingElement amplitude={30} duration={12} delay={0} className="absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full bg-[var(--accent-soft)] blur-2xl opacity-50"><div /></FloatingElement>
          <FloatingElement amplitude={25} duration={15} delay={2} className="absolute -bottom-20 right-10 h-32 w-32 rounded-full bg-[var(--accent-soft)] blur-2xl opacity-50"><div /></FloatingElement>
          <StaggerContainer stagger={0.12} className="relative z-10">
            <Reveal>
              <div className="mx-auto max-w-md">
                <SectionHeading
                  align="center"
                  eyebrow="Letters, occasionally"
                  title="Stay a little longer..."
                  sub="New poems and midnight thoughts, delivered only when there's something worth sending."
                />
                <NewsletterForm />
                <p className="mt-3 font-sans text-[11px] text-[var(--text-faint)]">No spam. Just words.</p>
              </div>
            </Reveal>
          </StaggerContainer>
        </section>
      </div>
    </div>
  );
}
