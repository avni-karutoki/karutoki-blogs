import Link from "next/link";
import Swirl from "./Swirl";

const socials = [
  { label: "Instagram", short: "IG", href: "https://www.instagram.com/avni.karutoki/" },
  { label: "LinkedIn", short: "IN", href: "https://www.linkedin.com/in/avni-karutoki" },
  { label: "Pinterest", short: "PIN", href: "https://pin.it/1WBBgualJ" },
  { label: "X", short: "X", href: "https://x.com/avnikaruroki" },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--border-color)] bg-[var(--bg-card)]/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 px-6 py-12 md:flex-row">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 rotate-45 items-center justify-center border border-[var(--text-heading)]">
            <span className="-rotate-45 font-script text-sm text-[var(--text-heading)]">K</span>
          </span>
          <span>
            <span className="block font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-heading)]">
              Karutoki Blogs
            </span>
            <span className="block font-script text-2xl leading-tight text-[var(--text-muted)]">
              Words for the things left unsaid.
            </span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 font-sans text-[11.5px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          <Link href="/writings" className="ink-link">Writings</Link>
          <Link href="/poems" className="ink-link">Poems</Link>
          <Link href="/blogs" className="ink-link">Blogs</Link>
          <Link href="/midnight-talks" className="ink-link">Midnight Talks</Link>
          <Link href="/about" className="ink-link">About</Link>
        </nav>

        <div className="flex items-center gap-5">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
            >
              {s.short}
            </a>
          ))}
        </div>
      </div>
      <div className="pb-8 text-center">
        <Swirl className="mx-auto text-[var(--text-faint)]" />
        <p className="mt-2 font-sans text-xs text-[var(--text-faint)]">
          Made with love by Avni Goel aka Karutoki © {new Date().getFullYear()}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
