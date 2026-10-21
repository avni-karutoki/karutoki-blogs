"use client";

import { useEffect, useState } from "react";

/**
 * Share row: post to X / WhatsApp, or copy the link.
 * The URL is read from the browser after mount — reading it during render
 * would produce different `href`s on the server and the client, which
 * React reports as a hydration mismatch.
 */
export default function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — ignore */
    }
  }

  const text = title;
  const links = [
    {
      label: "Post on X",
      href: `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-faint)]">
        Share
      </span>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="pill-button font-sans text-xs font-semibold"
        >
          {l.label} ↗
        </a>
      ))}
      <button
        type="button"
        onClick={copyLink}
        className="pill-button font-sans text-xs font-semibold"
      >
        {copied ? "Copied ✓" : "Copy link"}
      </button>
    </div>
  );
}
