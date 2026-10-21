"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring, type MotionValue } from "framer-motion";

function omitAnimationProps<T extends object>(props: T): Omit<T, "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration" | "onDragStart" | "onDrag" | "onDragEnd" | "onDragEnter" | "onDragLeave" | "onDragOver" | "onDrop" | "onHoverStart" | "onHoverEnd"> {
  const { 
    onAnimationStart, 
    onAnimationEnd, 
    onAnimationIteration, 
    onDragStart, 
    onDrag, 
    onDragEnd, 
    onDragEnter, 
    onDragLeave, 
    onDragOver, 
    onDrop, 
    onHoverStart, 
    onHoverEnd,
    ...rest 
  } = props as any;
  return rest;
}

/** Enhanced scroll progress bar with gradient and glow */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 500, damping: 30 });
  
  const gradientX = useTransform(progress, [0, 1], ["-100%", "100%"]);
  const scaleX = useTransform(progress, [0, 1], [0, 1]) as MotionValue<number>;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]"
      style={{
        background: "linear-gradient(90deg, var(--bg-primary), var(--bg-primary))",
        maskImage: "linear-gradient(90deg, black, transparent)",
      }}
    >
      <motion.div
        style={{
          height: "100%",
          width: "100%",
          transformOrigin: "left",
          background: "linear-gradient(90deg, var(--accent), var(--accent-strong), var(--accent))",
          backgroundSize: "200% 100%",
          backgroundPositionX: gradientX,
          willChange: "transform, background-position",
        }}
        animate={{ scaleX: scaleX as any }}
      />
    </motion.div>
  );
}

/** Scroll direction indicator (shows subtle arrow when scrolling down) */
export function ScrollDirectionIndicator() {
  const { scrollY } = useScroll();
  const [direction, setDirection] = useState<"down" | "up">("down");
  const lastY = useRef(0);

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      if (Math.abs(latest - lastY.current) > 10) {
        setDirection(latest > lastY.current ? "down" : "up");
        lastY.current = latest;
      }
    });
    return unsubscribe;
  }, [scrollY]);

  return (
    <motion.div
      className="pointer-events-none fixed bottom-8 right-8 z-40"
      animate={{ 
        y: direction === "down" ? 0 : -10,
        opacity: direction === "down" ? 0.6 : 0.3,
        rotate: direction === "down" ? 0 : 180
      }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ filter: "drop-shadow(0 4px 8px var(--shadow-card))" }}
      {...omitAnimationProps({})}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent)]">
        <path d="M12 5v14M19 12l-7 7-7-7" />
      </svg>
    </motion.div>
  );
}

/** Parallax wrapper for background elements */
export function Parallax({ 
  children, 
  speed = 0.3, 
  className,
  ...props 
}: { children: React.ReactNode; speed?: number; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 2000], [0, -2000 * speed]);
  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      className={className}
      style={{ 
        y: springY,
        willChange: "transform",
        ...props.style 
      }}
      {...omitAnimationProps(props)}
    >
      {children}
    </motion.div>
  );
}

/** Element that scales/fades based on scroll position */
export function ScrollScale({ 
  children, 
  className,
  from = 1,
  to = 0.8,
  ...props 
}: { children: React.ReactNode; className?: string; from?: number; to?: number } & React.HTMLAttributes<HTMLDivElement>) {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [from, to]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.7, 0.4]);

  return (
    <motion.div
      className={className}
      style={{ 
        scale, 
        opacity,
        transformOrigin: "center center",
        willChange: "transform, opacity",
        ...props.style 
      }}
      {...omitAnimationProps(props)}
    >
      {children}
    </motion.div>
  );
}

/** Element that moves horizontally based on scroll */
export function ScrollHorizontal({ 
  children, 
  className,
  distance = 100,
  ...props 
}: { children: React.ReactNode; className?: string; distance?: number } & React.HTMLAttributes<HTMLDivElement>) {
  const { scrollYProgress } = useScroll();
  const x = useTransform(scrollYProgress, [0, 1], [-distance, distance]);

  return (
    <motion.div
      className={className}
      style={{ 
        x,
        willChange: "transform",
        ...props.style 
      }}
      {...omitAnimationProps(props)}
    >
      {children}
    </motion.div>
  );
}

/** Floating animation for decorative elements */
export function FloatingElement({ 
  children, 
  className,
  amplitude = 15,
  duration = 6,
  delay = 0,
  ...props 
}: { children: React.ReactNode; className?: string; amplitude?: number; duration?: number; delay?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -amplitude, 0] }}
      transition={{ 
        duration, 
        delay,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "loop"
      }}
      style={{ willChange: "transform", ...props.style }}
      {...omitAnimationProps(props)}
    >
      {children}
    </motion.div>
  );
}

/** Magnetic hover effect - element follows cursor slightly */
export function Magnetic({ 
  children, 
  className,
  strength = 0.3,
  ...props 
}: { children: React.ReactNode; className?: string; strength?: number } & React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;
      setPosition({ x: deltaX, y: deltaY });
    };

    const handleLeave = () => {
      setPosition({ x: 0, y: 0 });
    };

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [strength]);

  return (
    <motion.div
      ref={ref}
      className={className}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{ willChange: "transform", ...props.style }}
      {...omitAnimationProps(props)}
    >
      {children}
    </motion.div>
  );
}

/** Text reveal animation - reveals text character by character or word by word */
export function TextReveal({ 
  children, 
  className,
  delay = 0,
  stagger = 0.03,
  split = "words",
  ...props 
}: { children: string; className?: string; delay?: number; stagger?: number; split?: "chars" | "words" } & React.HTMLAttributes<HTMLSpanElement>) {
  const words = split === "words" ? children.split(" ") : children.split("");
  
  return (
    <span className={`${className} inline-flex`} {...omitAnimationProps(props)}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ 
            duration: 0.5, 
            delay: delay + i * stagger,
            ease: [0.22, 1, 0.36, 1]
          }}
          style={{ display: "inline-block", willChange: "transform, opacity" }}
        >
          {split === "words" ? word + " " : word}
        </motion.span>
      ))}
    </span>
  );
}

/** Page header with parallax and scroll fade */
export function ScrollAwareHeader({ 
  children, 
  className,
  ...props 
}: { children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLElement>) {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 200, 400], [1, 0.7, 0]);
  const y = useTransform(scrollY, [0, 400], [0, 100]);
  const scale = useTransform(scrollY, [0, 400], [1, 0.95]);

  return (
    <motion.header
      className={className}
      style={{ 
        opacity, 
        y, 
        scale,
        transformOrigin: "center top",
        willChange: "transform, opacity",
        ...props.style 
      }}
      {...omitAnimationProps(props)}
    >
      {children}
    </motion.header>
  );
}

/** Intersection observer based stagger for lists */
export function StaggerContainer({ 
  children, 
  className,
  stagger = 0.1,
  delay = 0,
  ...props 
}: { children: React.ReactNode; className?: string; stagger?: number; delay?: number } & React.HTMLAttributes<HTMLDivElement>) {
  const childArray = Array.isArray(children) ? children : [children];
  
  return (
    <div className={className} {...omitAnimationProps(props)}>
      {childArray.map((child, i) => (
        <motion.div
          key={child.key || i}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ 
            duration: 0.6, 
            delay: delay + i * stagger,
            ease: [0.22, 1, 0.36, 1]
          }}
          style={{ willChange: "transform, opacity" }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}