"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

/**
 * Thin site-wide scroll progress bar. Fills with the theme's accent as the
 * user scrolls down — a quiet sense of "how far through the page am I".
 */
export default function ScrollProgressBar() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.3 });

  if (reduceMotion) return null;

  return (
    <motion.div
      aria-hidden
      className="fixed left-0 top-0 z-[60] h-[2.5px] w-full origin-left bg-[var(--accent)]"
      style={{ scaleX }}
    />
  );
}
