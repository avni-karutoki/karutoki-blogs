import ContactForm from "@/components/ContactForm";
import Swirl from "@/components/Swirl";
import Reveal, { SpringReveal } from "@/components/Reveal";
import { FloatingElement } from "@/components/ScrollAnimations";

/* the same doorways as the footer, given their own rail here */
function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  );
}

function SubstackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24l11.04-9.193L22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2.5" y="5" width="19" height="14" rx="3" />
      <path d="M3.5 6.5 12 13l8.5-6.5" />
    </svg>
  );
}

const socials = [
  { label: "Instagram", handle: "@avni.karutoki", href: "https://www.instagram.com/avni.karutoki/", Icon: InstagramIcon },
  { label: "LinkedIn", handle: "in/avni-karutoki", href: "https://www.linkedin.com/in/avni-karutoki", Icon: LinkedInIcon },
  { label: "Substack", handle: "@karutoki", href: "https://substack.com/@karutoki", Icon: SubstackIcon },
  { label: "X", handle: "@avnikaruroki", href: "https://x.com/avnikaruroki", Icon: XIcon },
];

export default function ContactPage() {
  return (
    <div className="relative mx-auto max-w-5xl px-6 py-14">
      {/* a couple of ink blooms, like the rest of the site */}
      <FloatingElement amplitude={22} duration={9} delay={0} className="absolute -top-12 -right-8 h-28 w-28 rounded-full bg-[var(--accent-soft)] blur-2xl opacity-35"><div /></FloatingElement>
      <FloatingElement amplitude={16} duration={13} delay={1.2} className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-[var(--accent-soft)] blur-2xl opacity-30"><div /></FloatingElement>

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

      {/* the desk: who is on the left, the letter box to the right */}
      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        {/* ————— left rail: the who behind the desk ————— */}
        <Reveal delay={0.06}>
          <div className="vintage-card relative p-7 text-center lg:text-left">
            {/* the mark, drifting gently */}
            <div className="flex items-center justify-center gap-3 lg:justify-start">
              <span className="animate-float inline-flex h-11 w-11 rotate-45 items-center justify-center border border-[var(--text-heading)] shadow-sm">
                <span className="-rotate-45 font-script text-base text-[var(--text-heading)]">K</span>
              </span>
              <span className="text-left">
                <span className="block font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-heading)]">
                  Karutoki Blogs
                </span>
                <span className="block font-script text-xl leading-tight text-[var(--text-muted)]">
                  words for the things left unsaid
                </span>
              </span>
            </div>

            <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-[var(--border-color)] to-transparent lg:via-[var(--border-color)]" />

            <p className="eyebrow text-center lg:text-left">Find me here</p>

            {/* social buttons */}
            <div className="mt-4 flex justify-center gap-3 lg:justify-start">
              {socials.map(({ label, href, Icon }, i) => (
                <SpringReveal
                  key={label}
                  delay={0.15 + i * 0.07}
                  y={12}
                  whileHover={{ y: -3 }}
                  viewportMargin="0px"
                >
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)] hover:text-[var(--accent)] hover:shadow-[var(--shadow-card)]"
                  >
                    <Icon />
                  </a>
                </SpringReveal>
              ))}
            </div>

            {/* the account ids, one quiet row each */}
            <ul className="mt-5 space-y-2.5">
              {socials.map(({ label, handle, href, Icon }, i) => (
                <li key={label}>
                  <SpringReveal delay={0.3 + i * 0.06} y={10} viewportMargin="0px">
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-center gap-2.5 rounded-lg border border-transparent px-2 py-1.5 font-sans text-[12.5px] text-[var(--text-muted)] transition-all duration-300 hover:border-[var(--border-color)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-heading)] lg:justify-start"
                    >
                      <span className="text-[var(--accent)] transition-transform duration-300 group-hover:scale-110">
                        <Icon />
                      </span>
                      <span className="font-semibold">{label}</span>
                      <span aria-hidden className="text-[var(--text-faint)]">·</span>
                      <span className="transition-colors duration-300 group-hover:text-[var(--accent)]">{handle}</span>
                    </a>
                  </SpringReveal>
                </li>
              ))}
              <li>
                <SpringReveal delay={0.55} y={10} viewportMargin="0px">
                  <a
                    href="mailto:karutokiblogs@gmail.com"
                    className="group flex items-center justify-center gap-2.5 rounded-lg border border-transparent px-2 py-1.5 font-sans text-[12.5px] text-[var(--text-muted)] transition-all duration-300 hover:border-[var(--border-color)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-heading)] lg:justify-start"
                  >
                    <span className="text-[var(--accent)] transition-transform duration-300 group-hover:scale-110">
                      <MailIcon />
                    </span>
                    <span className="font-semibold">Email</span>
                    <span aria-hidden className="text-[var(--text-faint)]">·</span>
                    <span className="transition-colors duration-300 group-hover:text-[var(--accent)]">karutokiblogs@gmail.com</span>
                  </a>
                </SpringReveal>
              </li>
            </ul>

            <p className="mt-6 border-t border-[var(--border-color)] pt-4 text-center font-serif text-sm italic text-[var(--text-muted)] lg:text-left">
              A quiet desk, a cup of coffee, and a little time to write back.
            </p>
          </div>
        </Reveal>

        {/* ————— right: the letter box, nudged a little right ————— */}
        <Reveal delay={0.14} className="lg:ml-3">
          <ContactForm className="desk-letter" />
        </Reveal>
      </div>

      <Reveal>
        <p className="mt-12 text-center font-serif text-lg italic text-[var(--text-muted)]">
          Words are better, when they&apos;re shared.
        </p>
      </Reveal>
    </div>
  );
}
