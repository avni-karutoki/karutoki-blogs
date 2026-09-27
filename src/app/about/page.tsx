import Link from "next/link";
import Swirl from "@/components/Swirl";
import Reveal from "@/components/Reveal";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_ABOUT, getSiteSetting } from "@/lib/site";
import type { AboutSettings } from "@/lib/types";

export default async function AboutPage() {
  let about = DEFAULT_ABOUT;
  try {
    const supabase = await createClient();
    about = await getSiteSetting<AboutSettings>(supabase, "about", DEFAULT_ABOUT);
  } catch {
    /* fallback */
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-14 text-center">
      <Reveal>
        <p className="eyebrow">{about.subtitle}</p>
        <h1 className="mt-2">{about.title}</h1>
        <div className="mt-4 flex justify-center">
          <Swirl className="text-[var(--accent)]" />
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-12 grid items-center gap-10 text-left md:grid-cols-2">
          <div className="relative order-2 md:order-1">
            <div className="photo-stack mx-auto max-w-xs">
              <div className="layer" />
              <div className="layer" />
              <div className="layer flex aspect-square items-center justify-center overflow-hidden p-8 text-center">
                {about.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={about.imageUrl} alt="Karutoki" className="absolute inset-0 h-full w-full rounded-md object-cover" />
                ) : (
                  <span className="font-script text-6xl text-[var(--text-heading)]">K</span>
                )}
              </div>
            </div>
          </div>
          <p className="lead order-1 text-left md:order-2">{about.bio}</p>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mx-auto mt-16 max-w-xl text-left">
          <h2 className="text-center">What you&apos;ll find here</h2>
          <p className="body-text mt-2 text-center">
            A little bit of everything I couldn&apos;t say out loud.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              { href: "/poems", label: "Poems written at hours that don't make sense to anyone else." },
              { href: "/blogs", label: "Blogs about the small things that quietly shape a day." },
              { href: "/midnight-talks", label: "Midnight talks — the thoughts that only show up after everyone's asleep." },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="vintage-card group flex items-center justify-between gap-4 p-5"
                >
                  <span className="font-serif text-lg leading-relaxed">{item.label}</span>
                  <span className="shrink-0 font-sans text-[var(--accent)] transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </div>
  );
}
