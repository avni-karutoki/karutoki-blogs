import Link from "next/link";
import Swirl from "@/components/Swirl";
import Reveal from "@/components/Reveal";
import { createPublicClient as createClient } from "@/lib/supabase/server";
import { DEFAULT_ABOUT, getSiteSetting } from "@/lib/site";
import type { AboutSettings } from "@/lib/types";
import { FloatingElement, Parallax } from "@/components/ScrollAnimations";
import { StaggerContainer } from "@/components/ScrollAnimations";

export default async function AboutPage() {
  let about = DEFAULT_ABOUT;
  try {
    const supabase = await createClient();
    about = await getSiteSetting<AboutSettings>(supabase, "about", DEFAULT_ABOUT);
  } catch {
    /* fallback */
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-14 text-center relative">
      <FloatingElement amplitude={25} duration={10} delay={0} className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[var(--accent-soft)] blur-2xl opacity-30"><div /></FloatingElement>
      <FloatingElement amplitude={20} duration={14} delay={1.5} className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-[var(--accent-soft)] blur-2xl opacity-30"><div /></FloatingElement>
      
      <Reveal>
        <p className="eyebrow">{about.subtitle}</p>
        <h1 className="mt-2">{about.title}</h1>
        <div className="mt-4 flex justify-center">
          <Swirl className="text-[var(--accent)]" />
        </div>
      </Reveal>

      <div className="mt-12 grid items-center gap-10 text-left md:grid-cols-2">
        <div className="relative order-2 md:order-1">
          <Parallax speed={0.1} className="mx-auto max-w-xs">
            <Reveal>
              <div className="photo-stack">
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
            </Reveal>
          </Parallax>
          <FloatingElement amplitude={15} duration={6} delay={0} className="pointer-events-none absolute -right-6 -top-10 h-16 w-16 rounded-full bg-[var(--accent-soft)] blur-xl"><div /></FloatingElement>
          <FloatingElement amplitude={10} duration={8} delay={0.5} className="pointer-events-none absolute -bottom-10 -left-8 h-12 w-12 rounded-full bg-[var(--accent-soft)] blur-xl"><div /></FloatingElement>
        </div>
        <Reveal delay={0.2} className="order-1 md:order-2">
          <p className="lead">{about.bio}</p>
        </Reveal>
      </div>

      <StaggerContainer stagger={0.12} delay={0.3} className="mx-auto mt-16 max-w-xl text-left">
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
            <Link
              key={item.href}
              href={item.href}
              className="vintage-card hover-lift group flex items-center justify-between gap-4 p-5"
            >
              <span className="font-serif text-lg leading-relaxed">{item.label}</span>
              <span className="shrink-0 font-sans text-[var(--accent)] transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          ))}
        </ul>
      </StaggerContainer>
    </div>
  );
}
