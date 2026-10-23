"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { flattenChildren } from "@/lib/flatten-children";

type CleanHTMLProps<Element extends HTMLElement> = Omit<
  React.HTMLAttributes<Element>,
  "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration" | "onDragStart" | "onDrag" | "onDragEnd" | "onDragEnter" | "onDragLeave" | "onDragOver" | "onDrop" | "onHoverStart" | "onHoverEnd"
>;

interface RevealProps extends CleanHTMLProps<HTMLDivElement> {
  children: ReactNode;
  delay?: number;
  y?: number;
  x?: number;
  scale?: number;
  rotate?: number;
  duration?: number;
  stagger?: number;
  once?: boolean;
  viewportMargin?: string;
  className?: string;
}

/**
 * CSS + IntersectionObserver scroll reveals.
 *
 * Elements start hidden via the `.reveal` class (only active when
 * `document.documentElement` has the `js` class, added by the inline head
 * script), and gain `.is-revealed` the first time they scroll into view.
 * This deliberately avoids framer-motion's whileInView — it works reliably
 * regardless of hydration state, and no-JS visitors still see all content.
 */
function useReveal(once: boolean, rootMargin: string) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            if (once) io.disconnect();
          } else if (!once) {
            setRevealed(false);
          }
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, rootMargin]);

  return { ref, revealed };
}

function revealStyle(opts: {
  delay?: number;
  y?: number;
  x?: number;
  scale?: number;
}): CSSProperties {
  const style: Record<string, string | number> = {
    transitionDelay: `${Math.max(opts.delay ?? 0, 0)}s`,
    "--reveal-y": `${opts.y ?? 0}px`,
    "--reveal-x": `${opts.x ?? 0}px`,
    "--reveal-scale": String(opts.scale ?? 1),
  };
  return style as CSSProperties;
}

export default function Reveal({
  children,
  delay = 0,
  y = 20,
  x = 0,
  scale = 1,
  rotate = 0,
  duration = 0.6,
  stagger = 0,
  once = true,
  viewportMargin = "-100px",
  className,
  ...props
}: RevealProps) {
  const { ref, revealed } = useReveal(once, viewportMargin);
  const { style: styleProp, ...rest } = props;

  return (
    <div
      ref={ref}
      className={`reveal ${revealed ? "is-revealed" : ""} ${className ?? ""}`}
      style={{ ...revealStyle({ delay, y, x, scale }), ...((styleProp as CSSProperties) ?? {}) }}
      {...rest}
    >
      {children}
    </div>
  );
}

// Staggered reveal for lists
export function StaggeredReveal({
  children,
  delay = 0,
  stagger = 0.08,
  ...props
}: { children: ReactNode; delay?: number; stagger?: number } & Omit<RevealProps, "children" | "delay" | "stagger">) {
  const childArray = flattenChildren(children);

  return (
    <>
      {childArray.map((child, i) => (
        <Reveal
          key={i}
          delay={delay + i * stagger}
          {...props}
        >
          {child}
        </Reveal>
      ))}
    </>
  );
}

// Reveal with a hover lift for cards. `whileHover` is kept for API
// compatibility with previous framer-motion-based call sites; when provided
// the element also gets the `.hover-lift` CSS micro-interaction.
export function SpringReveal({
  children,
  delay = 0,
  y = 30,
  whileHover,
  viewportMargin = "-60px",
  className,
  ...props
}: Omit<RevealProps, "duration" | "ease"> & { whileHover?: unknown }) {
  const { ref, revealed } = useReveal(true, viewportMargin);
  const { style: styleProp, ...rest } = props;

  return (
    <div
      ref={ref}
      className={`reveal ${revealed ? "is-revealed" : ""} ${whileHover ? "hover-lift" : ""} ${className ?? ""}`}
      style={{ ...revealStyle({ delay, y }), ...((styleProp as CSSProperties) ?? {}) }}
      {...rest}
    >
      {children}
    </div>
  );
}
