"use client";

import { motion, type TargetAndTransition } from "framer-motion";
import type { ReactNode } from "react";
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