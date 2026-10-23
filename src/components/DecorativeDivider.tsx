"use client";

import { motion, useReducedMotion } from "framer-motion";

interface DecorativeDividerProps {
  className?: string;
  variant?: "flourish" | "simple" | "star";
}

/**
 * Flourish divider whose line-art inks itself in: the two swirls draw outward
 * from the center star, the star traces its sparkle, the dots fade in.
 */
export default function DecorativeDivider({
  className = "",
  variant = "flourish",
}: DecorativeDividerProps) {
  if (variant === "simple") {
    return (
      <div className={`flex items-center justify-center py-6 text-[var(--border-color)] ${className}`}>
        <span className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[var(--border-color)] to-transparent" />
        <span className="px-4 font-script text-lg text-[var(--accent-pink)]">✦</span>
        <span className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[var(--border-color)] to-transparent" />
      </div>
    );
  }

  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <StaticFlourish className={className} />;
  }

  return (
    <div className={`my-8 flex items-center justify-center text-[var(--border-pink)] select-none ${className}`}>
      <svg
        width="220"
        height="24"
        viewBox="0 0 220 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="max-w-full text-[var(--border-pink)]"
      >
        {/* Left flourish swirl — drawn from the center outward */}
        <motion.path
          d="M102 12C95 12 85 14.5 75 12C50 6 30 18 10 12"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        />
        {/* Center Star / Sparkle — traces itself */}
        <motion.path
          d="M110 5V19M103 12H117M105 7L115 17M115 7L105 17"
          stroke="var(--accent-pink)"
          strokeWidth="1.2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Right flourish swirl — drawn from the center outward */}
        <motion.path
          d="M118 12C125 12 135 14.5 145 12C170 6 190 18 210 12"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        />
        {/* Side accent dots */}
        <motion.circle
          cx="2" cy="12" r="1.5" fill="currentColor"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.65 }}
        />
        <motion.circle
          cx="218" cy="12" r="1.5" fill="currentColor"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.65 }}
        />
      </svg>
    </div>
  );
}

function StaticFlourish({ className = "" }: { className?: string }) {
  return (
    <div className={`my-8 flex items-center justify-center text-[var(--border-pink)] select-none ${className}`}>
      <svg width="220" height="24" viewBox="0 0 220 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="max-w-full text-[var(--border-pink)]">
        <path d="M10 12C30 18 50 6 75 12C85 14.5 95 12 102 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M110 5V19M103 12H117M105 7L115 17M115 7L105 17" stroke="var(--accent-pink)" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M118 12C125 12 135 14.5 145 12C170 6 190 18 210 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="2" cy="12" r="1.5" fill="currentColor" />
        <circle cx="218" cy="12" r="1.5" fill="currentColor" />
      </svg>
    </div>
  );
}
