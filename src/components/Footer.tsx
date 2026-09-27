import Link from "next/link";
import Swirl from "./Swirl";

function InstagramIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  );
}

function PinterestIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.62 0 12.017 0z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const socials = [
  { label: "Instagram", href: "https://www.instagram.com/avni.karutoki/", Icon: InstagramIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/avni-karutoki", Icon: LinkedInIcon },
  { label: "Pinterest", href: "https://pin.it/1WBBgualJ", Icon: PinterestIcon },
  { label: "X", href: "https://x.com/avnikaruroki", Icon: XIcon },
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

        <div className="flex items-center gap-4">
          {socials.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-color)] text-[var(--text-muted)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <Icon />
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
