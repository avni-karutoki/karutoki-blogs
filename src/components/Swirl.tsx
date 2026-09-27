export default function Swirl({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`swirl ${className}`}
      viewBox="0 0 140 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M2 14C10 4 18 4 24 12C30 20 38 20 44 10C50 0 58 2 62 10C66 18 74 18 80 10C86 2 96 4 100 12C104 20 114 18 120 10C124 5 130 4 138 8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
