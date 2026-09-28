export default function Swirl({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`swirl ${className}`}
      viewBox="0 0 200 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="swirl-fade-left" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="currentColor" stopOpacity="0" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="swirl-fade-right" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.7" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* fading side lines */}
      <line x1="4" y1="12" x2="78" y2="12" stroke="url(#swirl-fade-left)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="122" y1="12" x2="196" y2="12" stroke="url(#swirl-fade-right)" strokeWidth="1.2" strokeLinecap="round" />
      {/* inner accent dots */}
      <circle cx="86" cy="12" r="1.4" fill="currentColor" opacity="0.55" />
      <circle cx="114" cy="12" r="1.4" fill="currentColor" opacity="0.55" />
      {/* center diamond motif */}
      <rect
        x="94.5"
        y="6.5"
        width="11"
        height="11"
        rx="1.5"
        transform="rotate(45 100 12)"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle cx="100" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}
