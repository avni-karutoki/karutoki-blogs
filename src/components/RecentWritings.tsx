import WritingCard from "@/components/WritingCard";

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
];

export default function RecentWritings() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:px-10">

      {/* Section heading */}
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[var(--primary)]">
            From my little corner
          </p>

          <h2 className="font-[var(--font-playfair)] text-3xl font-semibold sm:text-4xl">
            Recent Writings
          </h2>

          <p className="mt-3 max-w-xl font-[var(--font-cormorant)] text-lg text-[var(--foreground)]/65">
            A collection of thoughts, stories and words that found their way
            onto these pages.
          </p>
        </div>

        <a
          href="/writings"
          className="hidden whitespace-nowrap text-sm font-medium tracking-wide text-[var(--primary)] transition hover:underline sm:block"
        >
          View all →
        </a>
      </div>

      {/* Writing cards */}
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

      {/* Mobile view all */}
      <div className="mt-8 text-center sm:hidden">
        <a
          href="/writings"
          className="text-sm font-medium tracking-wide text-[var(--primary)]"
        >
          View all writings →
        </a>
      </div>
    </section>
  );
}