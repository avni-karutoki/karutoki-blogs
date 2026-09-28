import Link from "next/link";
import Reveal from "@/components/Reveal";
import { createClient } from "@/lib/supabase/server";
import { categoryLabel } from "@/lib/types";

export const revalidate = 60;

export const metadata = {
  title: "Archive — Karutoki",
  description: "Every writing, month by month.",
};

type Row = {
  slug: string;
  title: string;
  category: string;
  created_at: string;
};

export default async function ArchivePage() {
  let posts: Row[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select("slug, title, category, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(500);
    posts = (data as Row[]) || [];
  } catch {
    posts = [];
  }

  const groups = new Map<string, { label: string; items: Row[] }>();
  posts.forEach((p) => {
    const d = new Date(p.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!groups.has(key)) groups.set(key, { label, items: [] });
    groups.get(key)!.items.push(p);
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <Reveal>
        <p className="eyebrow text-center">The archive</p>
        <h1 className="mt-2 text-center">Everything, in order.</h1>
        <p className="body-text mt-3 text-center">
          {posts.length === 0 ? "Nothing here yet." : `${posts.length} ${posts.length === 1 ? "writing" : "writings"}, month by month.`}
        </p>
      </Reveal>

      <div className="mt-12 space-y-10">
        {[...groups.entries()].map(([key, g], gi) => (
          <Reveal key={key} delay={Math.min(gi, 4) * 0.05}>
            <section>
              <h2 className="border-b border-[var(--border-color)] pb-3">{g.label}</h2>
              <ul className="mt-4 space-y-1">
                {g.items.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/writings/${p.slug}`}
                      className="group flex items-baseline justify-between gap-4 rounded-xl px-3 py-2.5 transition-colors hover:bg-[var(--accent-soft)]"
                    >
                      <span className="min-w-0 truncate font-serif text-[1.1rem] text-[var(--text-heading)] transition-colors group-hover:text-[var(--accent)]">
                        {p.title}
                      </span>
                      <span className="shrink-0 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-faint)]">
                        {categoryLabel(p.category)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
