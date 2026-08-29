import WritingCard from "@/components/WritingCard";
import RecentWritings from "@/components/RecentWritings";

const writings = [
  {
    category: "Poem",
    title: "The Things We Never Said",
    excerpt:
      "Some feelings remain between the lines, waiting for someone to read them.",
    date: "August 2026",
    href: "/poems",
  },
  {
    category: "Blog",
    title: "A Little Bit of Everything",
    excerpt:
      "Thoughts, stories, little observations and everything that crosses my mind.",
    date: "August 2026",
    href: "/blogs",
  },
  {
    category: "Midnight Talk",
    title: "Things I Think About at 2 AM",
    excerpt:
      "When the world gets quiet, somehow the mind decides to get louder.",
    date: "August 2026",
    href: "/midnight-talks",
  },
  {
    category: "Poem",
    title: "Between The Lines",
    excerpt:
      "For all the words that stayed in drafts, notebooks and somewhere between thought and expression.",
    date: "August 2026",
    href: "/poems",
  },
  {
    category: "Blog",
    title: "Things Worth Remembering",
    excerpt:
      "A collection of little thoughts, lessons and moments that deserve a place in words.",
    date: "August 2026",
    href: "/blogs",
  },
  {
    category: "Midnight Talk",
    title: "Dear 2 AM",
    excerpt:
      "A quiet conversation with the thoughts that only seem to appear when everyone else is asleep.",
    date: "August 2026",
    href: "/midnight-talks",
  },
];

export default function WritingsPage() {
  return (
    <main className="min-h-screen">
      {/* Page Header */}
      <section className="mx-auto max-w-5xl px-5 pb-12 pt-20 text-center sm:px-8">
        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-[var(--primary)]">
          A collection of words
        </p>

        <h1 className="font-[var(--font-playfair)] text-4xl font-semibold sm:text-5xl lg:text-6xl">
          Writings
        </h1>

        <p className="mx-auto mt-5 max-w-2xl font-[var(--font-cormorant)] text-xl leading-relaxed text-[var(--foreground)]/65">
          Poems, stories, thoughts and midnight conversations — all the little
          pieces of writing that found their way here.
        </p>
      </section>

      {/* Category Navigation */}
      <div className="mx-auto mb-12 flex max-w-7xl flex-wrap justify-center gap-3 px-5 sm:px-8 lg:px-10">
        <a
          href="/writings"
          className="rounded-full border border-[var(--primary)] bg-[var(--primary)] px-5 py-2 text-sm text-white transition hover:scale-105"
        >
          All
        </a>

        <a
          href="/poems"
          className="rounded-full border border-[var(--border)] px-5 py-2 text-sm transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
        >
          Poems
        </a>

        <a
          href="/blogs"
          className="rounded-full border border-[var(--border)] px-5 py-2 text-sm transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
        >
          Blogs
        </a>

        <a
          href="/midnight-talks"
          className="rounded-full border border-[var(--border)] px-5 py-2 text-sm transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
        >
          Midnight Talks
        </a>
      </div>

      {/* Writings Grid */}
      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:px-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {writings.map((writing) => (
            <WritingCard
              key={writing.title}
              category={writing.category}
              title={writing.title}
              excerpt={writing.excerpt}
              date={writing.date}
              href={writing.href}
            />
          ))}
        </div>
      </section>
    </main>
  );
}