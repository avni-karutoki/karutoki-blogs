export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">

        {/* Main Footer Content */}
        <div className="grid gap-10 md:grid-cols-3">

          {/* Brand */}
          <div>
            <a
              href="/"
              className="font-[var(--font-playfair)] text-2xl font-semibold"
            >
              Karutoki
            </a>

            <p className="mt-3 max-w-sm font-[var(--font-cormorant)] text-lg leading-relaxed text-[var(--foreground)]/65">
              A little corner of thoughts, poetry, stories and words.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.25em] text-[var(--primary)]">
              Explore
            </h3>

            <div className="mt-4 flex flex-col gap-3">
              <a
                href="/"
                className="text-sm transition hover:text-[var(--primary)]"
              >
                Home
              </a>

              <a
                href="/writings"
                className="text-sm transition hover:text-[var(--primary)]"
              >
                Writings
              </a>

              <a
                href="/themes"
                className="text-sm transition hover:text-[var(--primary)]"
              >
                Themes
              </a>

              <a
                href="/about"
                className="text-sm transition hover:text-[var(--primary)]"
              >
                About
              </a>

              <a
                href="/contact"
                className="text-sm transition hover:text-[var(--primary)]"
              >
                Contact Us
              </a>
            </div>
          </div>

          {/* Socials */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.25em] text-[var(--primary)]">
              Follow Me
            </h3>

            <div className="mt-4 flex flex-col gap-3">
              <a
                href="#"
                className="text-sm transition hover:text-[var(--primary)]"
              >
                Instagram
              </a>

              <a
                href="#"
                className="text-sm transition hover:text-[var(--primary)]"
              >
                Pinterest
              </a>

              <a
                href="#"
                className="text-sm transition hover:text-[var(--primary)]"
              >
                LinkedIn
              </a>

              <a
                href="#"
                className="text-sm transition hover:text-[var(--primary)]"
              >
                Twitter / X
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-[var(--border)] pt-8 text-center">

          <p className="font-[var(--font-cormorant)] text-lg text-[var(--foreground)]/75">
            Made with ❤️ by{" "}
            <span className="font-semibold text-[var(--primary)]">
              Avni Goel aka Karutoki
            </span>
          </p>

          <p className="mt-2 text-xs tracking-wide text-[var(--foreground)]/45">
            © 2026. All rights reserved.
          </p>

        </div>
      </div>
    </footer>
  );
}