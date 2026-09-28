"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [veilKey, setVeilKey] = useState(0);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setVeilKey((k) => k + 1);
    // Use instant scrolling and temporarily suspend CSS smooth-scroll so
    // route changes don't trigger a long animated scroll-to-top (jank).
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    window.setTimeout(() => {
      root.style.scrollBehavior = prev;
    }, 50);
  }, [pathname]);

  return (
    <>
      {/* Ink veil sweep on every route change */}
      {veilKey > 0 && (
        <motion.div
          key={veilKey}
          className="pointer-events-none fixed inset-0 z-[80] will-change-transform"
          initial={{ scaleY: 0, transformOrigin: "bottom" }}
          animate={{ scaleY: [0, 1, 1, 0] }}
          transition={{ duration: 0.6, ease: "easeInOut", times: [0, 0.4, 0.6, 1] }}
          style={{ background: "var(--text-heading)", opacity: 0.08 }}
        />
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="will-change-transform"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
