"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [veilKey, setVeilKey] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const first = useRef(true);
  const pathHistory = useRef<string[]>([]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      pathHistory.current = [pathname];
      return;
    }

    // Determine navigation direction
    const currentIndex = pathHistory.current.indexOf(pathname);
    if (currentIndex === -1) {
      // New page - forward navigation
      setDirection("forward");
      pathHistory.current.push(pathname);
    } else {
      // Going back in history
      setDirection("backward");
      pathHistory.current = pathHistory.current.slice(0, currentIndex + 1);
    }

    setVeilKey((k) => k + 1);

    // Smooth scroll to top without jank
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
          initial={{ 
            scaleY: 0, 
            transformOrigin: direction === "forward" ? "top" : "bottom" 
          }}
          animate={{ 
            scaleY: [0, 1, 1, 0],
            transformOrigin: [direction === "forward" ? "top" : "bottom", 
                              direction === "forward" ? "top" : "bottom",
                              direction === "forward" ? "bottom" : "top",
                              direction === "forward" ? "bottom" : "top"]
          }}
          transition={{ 
            duration: 0.55, 
            ease: "easeInOut", 
            times: [0, 0.35, 0.65, 1] 
          }}
          style={{ background: "var(--text-heading)", opacity: 0.06 }}
        />
      )}

      {/* Page content transition */}
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={pathname}
          initial={{ 
            opacity: 0, 
            y: direction === "forward" ? 20 : -20,
            scale: 0.98
          }}
          animate={{ 
            opacity: 1, 
            y: 0,
            scale: 1
          }}
          exit={{ 
            opacity: 0, 
            y: direction === "forward" ? -15 : 15,
            scale: 0.98
          }}
          transition={{ 
            duration: 0.35, 
            ease: EASE 
          }}
          className="will-change-transform"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
