"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Ornamental swirl divider that draws itself on screen: the side lines ink
 * outward from the center, the diamond outline traces its way around, and the
 * accent dots pop in. Pure stroke animation — colors and shapes are unchanged.
 */
export default function Swirl({ className = "" }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <svg
        className={`swirl ${className}`}
        viewBox="0 0 200 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <StaticContent />
      </svg>
    );
  }

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
      {/* fading side lines — drawn from the center outward */}
      <motion.line
        x1="78" y1="12" x2="4" y2="12"
        stroke="url(#swirl-fade-left)"
        strokeWidth="1.2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
      />
      <motion.line
        x1="122" y1="12" x2="196" y2="12"
        stroke="url(#swirl-fade-right)"
        strokeWidth="1.2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
      />
      {/* inner accent dots */}
      <motion.circle
        cx="86" cy="12" r="1.4" fill="currentColor"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.55 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.45 }}
      />
      <motion.circle
        cx="114" cy="12" r="1.4" fill="currentColor"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.55 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.55 }}
      />
      {/* center diamond motif — outline traces itself */}
      <motion.rect
        x="94.5"
        y="6.5"
        width="11"
        height="11"
        rx="1.5"
        transform="rotate(45 100 12)"
        stroke="currentColor"
        strokeWidth="1.3"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
      />
      <motion.circle
        cx="100" cy="12" r="1.6"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.7 }}
        style={{ transformOrigin: "100px 12px", fill: "currentColor" }}
      />
    </svg>
  );
}

function StaticContent() {
  return (
    <>
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
      <line x1="4" y1="12" x2="78" y2="12" stroke="url(#swirl-fade-left)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="122" y1="12" x2="196" y2="12" stroke="url(#swirl-fade-right)" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="86" cy="12" r="1.4" fill="currentColor" opacity="0.55" />
      <circle cx="114" cy="12" r="1.4" fill="currentColor" opacity="0.55" />
      <rect x="94.5" y="6.5" width="11" height="11" rx="1.5" transform="rotate(45 100 12)" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="100" cy="12" r="1.6" fill="currentColor" />
    </>
  );
}
