import React from "react";

export default function KarutokiLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width="34"
        height="34"
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 text-[var(--text-heading)]"
        aria-hidden
      >
        <path
          d="M21 10C16 8 8 9 5 11V33C8 31 16 30 21 33V10Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M23 10C28 8 36 9 39 11V33C36 31 28 30 23 33V10Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M9 16C13 15 17 15.5 19 16.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        <path d="M9 21C13 20 17 20.5 19 21.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        <path d="M25 16.5C27 15.5 31 15 35 16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        <path d="M25 21.5C27 20.5 31 20 35 21" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        <circle cx="22" cy="21" r="1.6" fill="var(--accent)" />
      </svg>
      <span className="flex flex-col justify-center leading-none">
        {/* Brand wordmark in calligraphy — the one non-heading exception */}
        <span className="font-script text-[26px] font-semibold leading-none text-[var(--text-heading)]">
          Karutoki
        </span>
        <span className="mt-1 font-sans text-[9px] font-semibold uppercase tracking-[0.34em] text-[var(--accent)]">
          Blogs
        </span>
      </span>
    </span>
  );
}
