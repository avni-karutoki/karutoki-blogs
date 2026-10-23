"use client";

import { motion, useScroll, useTransform, useReducedMotion, type TargetAndTransition } from "framer-motion";
import { useRef, type ReactNode } from "react";
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
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, x, scale, rotate }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1, rotate: 0 }}
      viewport={{ once, margin: viewportMargin }}
      transition={{ 
        duration, 
        delay: Math.min(delay, 0.4), 
        ease: [0.22, 1, 0.36, 1] 
      }}
      {...props}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
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

// Reveal with spring animation for more organic feel
export function SpringReveal({
  children,
  delay = 0,
  y = 30,
  whileHover,
  className,
  ...props
}: Omit<RevealProps, "duration" | "ease"> & { whileHover?: TargetAndTransition }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      whileHover={whileHover}
      transition={{ 
        type: "spring", 
        damping: 20, 
        stiffness: 120, 
        delay: Math.min(delay, 0.3) 
      }}
      {...props}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Scroll-linked fade in/out: content fades up as it enters the viewport and
 * gently fades away again as it leaves, so scrolling through a page always
 * feels animated. Pure opacity — transform work is left to the layout, so
 * scrolling stays smooth.
 */
export function ScrollFade({
  children,
  className,
  range = 0.12,
}: {
  children: ReactNode;
  className?: string;
  /** How much of the viewport passage is spent fading at each edge. */
  range?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const hi = Math.min(1 - range, 0.8);
  const opacity = useTransform(scrollYProgress, [range * 0.5, hi, 1 - range, 1], [0, 1, 1, 0.25]);

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div ref={ref} style={{ opacity, willChange: "opacity" }} className={className}>
      {children}
    </motion.div>
  );
}