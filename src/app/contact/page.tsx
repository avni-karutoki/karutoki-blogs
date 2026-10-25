import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import Swirl from "@/components/Swirl";
import Reveal, { SpringReveal } from "@/components/Reveal";
import { FloatingElement } from "@/components/ScrollAnimations";

export default function ContactPage() {
  return (
    <div className="relative mx-auto max-w-2xl px-6 py-14">
      {/* a couple of ink blooms, like the rest of the site */}
      <FloatingElement amplitude={22} duration={9} delay={0} className="absolute -top-12 -right-8 h-28 w-28 rounded-full bg-[var(--accent-soft)] blur-2xl opacity-35"><div /></FloatingElement>
      <FloatingElement amplitude={16} duration={13} delay={1.2} className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-[var(--accent-soft)] blur-2xl opacity-30"><div /></FloatingElement>

      {/* a small postage stamp in the corner of the page */}
      <div aria-hidden className="contact-stamp">
        <span className="contact-stamp__glyph">✦</span>
        <span className="contact-stamp__label">Karutoki · 2&nbsp;AM</span>
      </div>

      <Reveal>
        <div className="text-center">
          <p className="eyebrow">Contact</p>
          <h1 className="mt-2">Let&apos;s talk, shall we?</h1>
          <p className="lead mx-auto mt-3 max-w-md">
            Have a thought, a question, or just something you want to say? My inbox is open.
          </p>
          <div className="mt-4 flex justify-center">
            <Swirl className="text-[var(--accent)]" />
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.12}>
        <div className="mt-10">
          <ContactForm />
        </div>
      </Reveal>

      {/* other ways to reach the desk */}
      <section className="mt-14">
        <Reveal>
          <p className="eyebrow text-center">Other ways to reach the desk</p>
        </Reveal>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <SpringReveal whileHover={{ y: -6 }}>
            <Link href={`/#newsletter`} className="vintage-card group block h-full p-5 text-center">
              <span className="font-script text-2xl text-[var(--text-heading)] transition-colors group-hover:text-[var(--accent)]">By owl mail</span>
              <p className="mt-2 font-serif text-sm leading-relaxed text-[var(--text-muted)]">
                Join the newsletter — new ink lands in your inbox itself.
              </p>
              <span className="mt-3 inline-block font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Sign up →</span>
            </Link>
          </SpringReveal>
          <SpringReveal whileHover={{ y: -6 }} delay={0.08}>
            <Link href="/writings" className="vintage-card group block h-full p-5 text-center">
              <span className="font-script text-2xl text-[var(--text-heading)] transition-colors group-hover:text-[var(--accent)]">Under a writing</span>
              <p className="mt-2 font-serif text-sm leading-relaxed text-[var(--text-muted)]">
                Rather say it out loud? Every piece has a comment thread.
              </p>
              <span className="mt-3 inline-block font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Browse writings →</span>
            </Link>
          </SpringReveal>
          <SpringReveal whileHover={{ y: -6 }} delay={0.16}>
            <Link href="/feed.xml" className="vintage-card group block h-full p-5 text-center">
              <span className="font-script text-2xl text-[var(--text-heading)] transition-colors group-hover:text-[var(--accent)]">Quietly, by feed</span>
              <p className="mt-2 font-serif text-sm leading-relaxed text-[var(--text-muted)]">
                Point an RSS reader at the feed and never miss a piece.
              </p>
              <span className="mt-3 inline-block font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">RSS feed →</span>
            </Link>
          </SpringReveal>
        </div>
      </section>

      <Reveal>
        <p className="mt-12 text-center font-serif text-lg italic text-[var(--text-muted)]">
          Words are better, when they&apos;re shared.
        </p>
      </Reveal>
    </div>
  );
}
