"use client";

import { motion } from "framer-motion";
import type { ReactNode, HTMLAttributes } from "react";

interface RevealProps extends HTMLAttributes<HTMLDivElement> {
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
      style={{ willChange: "transform, opacity" }}
      {...props}
    >
      {typeof children === "function" ? children({ stagger }) : 
       Array.isArray(children) ? children.map((child, i) => 
         React.cloneElement(child as React.ReactElement<any>, {
           style: { ...child.props.style, transitionDelay: `${delay + i * stagger}s` }
         })) : 
       children}
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
  const childArray = Array.isArray(children) ? children : [children];
  
  return (
    <>
      {childArray.map((child, i) => (
        <Reveal 
          key={child.key || i} 
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
  className,
  ...props
}: Omit<RevealProps, "duration" | "ease">) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        type: "spring", 
        damping: 20, 
        stiffness: 120, 
        delay: Math.min(delay, 0.3) 
      }}
      style={{ willChange: "transform, opacity" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
