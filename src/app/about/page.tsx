import Link from "next/link";
import Swirl from "@/components/Swirl";
import Reveal from "@/components/Reveal";
import RichText, { InlineText } from "@/components/RichText";
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

  // First block of the bio is the lead next to the portrait; everything else
  // flows below with its ###/​**​/* markdown rendered.
  const blocks = about.bio
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter((b) => b !== "" && b !== ".");
  const rest = blocks.slice(1).join("\n\n");
  const gallery = (about.images ?? []).filter(Boolean);
  // Portrait crop/adjust from the admin.
  const portraitZoom = (about.imageZoom ?? 100) / 100;
  const portraitPos = `${about.imagePosX ?? 50}% ${about.imagePosY ?? 50}%`;

  return (
    <div className="relative mx-auto max-w-4xl px-6 pb-20 pt-14">
      <FloatingElement amplitude={25} duration={10} delay={0} className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[var(--accent-soft)] blur-2xl opacity-30"><div /></FloatingElement>
      <FloatingElement amplitude={20} duration={14} delay={1.5} className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-[var(--accent-soft)] blur-2xl opacity-30"><div /></FloatingElement>

      {/* Header */}
      <Reveal>
        <div className="text-center">
          <p className="eyebrow">{about.subtitle}</p>
          <h1 className="mt-2">{about.title}</h1>
          <div className="mt-4 flex justify-center">
            <Swirl className="text-[var(--accent)]" />
          </div>
        </div>
      </Reveal>

      {/* Portrait + opening lines */}
      <div className="mt-12 grid items-center gap-10 text-left md:grid-cols-[0.85fr_1.15fr]">
        {/* Portrait — round frame with layered rings */}
        <div className="relative order-2 md:order-1">
          <Parallax speed={0.1} className="mx-auto w-fit">
            <Reveal>
              <div className="relative mx-auto w-64 sm:w-72 md:w-80">
                {/* offset accent ring behind */}
                <div aria-hidden className="absolute inset-0 translate-x-3 translate-y-3 rounded-full border-2 border-[var(--accent)] opacity-40" />
                {/* slow dashed orbit + star riding its rim */}
                <div aria-hidden className="portrait-orbit absolute -inset-4">
                  <div className="h-full w-full rounded-full border border-dashed border-[var(--accent)] opacity-45" />
                  <span className="absolute left-1/2 -top-2 -translate-x-1/2 text-[var(--accent)]">✦</span>
                </div>
                {/* the circle itself */}
                <div className="relative aspect-square overflow-hidden rounded-full border-4 border-[var(--bg-card)] shadow-[var(--shadow-card)] ring-1 ring-[var(--accent)]/50">
                  {about.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={about.imageUrl}
                      alt="Karutoki"
                      className="absolute inset-0 h-full w-full"
                      style={{
                        objectFit: about.imageFit ?? "cover",
                        objectPosition: portraitPos,
                        ...(portraitZoom !== 1
                          ? { transform: `scale(${portraitZoom})`, transformOrigin: portraitPos }
                          : {}),
                      }}
                    />
                  ) : (
                    <span className="font-script text-7xl text-[var(--text-heading)]">K</span>
                  )}
                </div>
              </div>
            </Reveal>
          </Parallax>
          <FloatingElement amplitude={15} duration={6} delay={0} className="pointer-events-none absolute -right-6 -top-10 h-16 w-16 rounded-full bg-[var(--accent-soft)] blur-xl"><div /></FloatingElement>
          <FloatingElement amplitude={10} duration={8} delay={0.5} className="pointer-events-none absolute -bottom-10 -left-8 h-12 w-12 rounded-full bg-[var(--accent-soft)] blur-xl"><div /></FloatingElement>
        </div>
        <Reveal delay={0.2} className="order-1 md:order-2">
          <p className="lead whitespace-pre-line">
            <InlineText text={blocks[0] ?? ""} />
          </p>
        </Reveal>
      </div>

      {/* The story, in readable rhythm */}
      {rest && (
        <div className="mx-auto mt-16 max-w-2xl text-left">
          <RichText text={rest} />
        </div>
      )}

      {/* Gallery of pictures managed from the admin */}
      {gallery.length > 0 && (
        <Reveal className="mt-16">
          <p className="eyebrow text-center">Scraps from the desk</p>
          <div className="mt-6 flex flex-wrap justify-center gap-5">
            {gallery.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="vintage-card w-40 p-2 pb-3 transition-transform duration-300 hover:-translate-y-1 sm:w-44"
                style={{ transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Karutoki ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="aspect-square w-full rounded-sm object-cover"
                />
              </div>
            ))}
          </div>
        </Reveal>
      )}

      {/* Where everything lives */}
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
