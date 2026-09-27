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
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return (
    <>
      {/* Ink veil sweep on every route change */}
      {veilKey > 0 && (
        <motion.div
          key={veilKey}
          className="pointer-events-none fixed inset-0 z-[80]"
          initial={{ scaleY: 0, transformOrigin: "bottom" }}
          animate={{ scaleY: [0, 1, 1, 0] }}
          transition={{ duration: 0.85, ease: "easeInOut", times: [0, 0.4, 0.6, 1] }}
          style={{ background: "var(--text-heading)", opacity: 0.08 }}
        />
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 26, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -16, filter: "blur(4px)" }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          {/* soft rising glow accent */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.05 }}
          >
            {children}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
