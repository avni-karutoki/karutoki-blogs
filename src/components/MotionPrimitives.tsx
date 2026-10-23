"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef, useEffect, useRef, useState, type Ref } from "react";
import { flattenChildren } from "@/lib/flatten-children";

// Types that remove problematic framer-motion event handler props
type CleanAnchorProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration" | "onDragStart" | "onDrag" | "onDragEnd" | "onDragEnter" | "onDragLeave" | "onDragOver" | "onDrop" | "onHoverStart" | "onHoverEnd" | "whileHover" | "whileTap" | "whileFocus" | "whileDrag" | "animate" | "initial" | "exit" | "transition" | "variants"
>;

type CleanButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration" | "onDragStart" | "onDrag" | "onDragEnd" | "onDragEnter" | "onDragLeave" | "onDragOver" | "onDrop" | "onHoverStart" | "onHoverEnd" | "whileHover" | "whileTap" | "whileFocus" | "whileDrag" | "animate" | "initial" | "exit" | "transition" | "variants"
>;

type CleanInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration" | "onDragStart" | "onDrag" | "onDragEnd" | "onDragEnter" | "onDragLeave" | "onDragOver" | "onDrop" | "onHoverStart" | "onHoverEnd" | "whileHover" | "whileTap" | "whileFocus" | "whileDrag" | "animate" | "initial" | "exit" | "transition" | "variants"
>;

type CleanTextareaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration" | "onDragStart" | "onDrag" | "onDragEnd" | "onDragEnter" | "onDragLeave" | "onDragOver" | "onDrop" | "onHoverStart" | "onHoverEnd" | "whileHover" | "whileTap" | "whileFocus" | "whileDrag" | "animate" | "initial" | "exit" | "transition" | "variants"
>;

type CleanDivProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration" | "onDragStart" | "onDrag" | "onDragEnd" | "onDragEnter" | "onDragLeave" | "onDragOver" | "onDrop" | "onHoverStart" | "onHoverEnd" | "whileHover" | "whileTap" | "whileFocus" | "whileDrag" | "animate" | "initial" | "exit" | "transition" | "variants"
>;

type CleanSpanProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration" | "onDragStart" | "onDrag" | "onDragEnd" | "onDragEnter" | "onDragLeave" | "onDragOver" | "onDrop" | "onHoverStart" | "onHoverEnd" | "whileHover" | "whileTap" | "whileFocus" | "whileDrag" | "animate" | "initial" | "exit" | "transition" | "variants"
>;

/** Button with press/tap animation */
export const MotionButton = forwardRef<HTMLButtonElement, CleanButtonProps & { whileTap?: any; whileHover?: any }>(
  ({ children, className = "", whileTap, whileHover, ...props }, ref) => (
    <motion.button
      ref={ref}
      className={className}
      whileTap={whileTap ?? { scale: 0.97 }}
      whileHover={whileHover ?? { scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
      style={{ willChange: "transform", ...(props.style as React.CSSProperties) }}
    >
      {children}
    </motion.button>
  )
);
MotionButton.displayName = "MotionButton";

/** Link with press/tap animation */
export const MotionLink = forwardRef<HTMLAnchorElement, CleanAnchorProps & { whileTap?: any; whileHover?: any }>(
  ({ children, className = "", whileTap, whileHover, ...props }, ref) => (
    <motion.a
      ref={ref}
      className={className}
      whileTap={whileTap ?? { scale: 0.98 }}
      whileHover={whileHover ?? { scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
      style={{ willChange: "transform", ...(props.style as React.CSSProperties) }}
    >
      {children}
    </motion.a>
  )
);
MotionLink.displayName = "MotionLink";

/** Card with hover lift and shadow */
interface MotionCardProps extends CleanDivProps {
  lift?: number;
  whileHover?: any;
}

export const MotionCard = forwardRef<HTMLDivElement, MotionCardProps>(
  ({ children, className = "", lift = 8, whileHover, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={className}
      whileHover={whileHover ?? { 
        y: -lift,
        boxShadow: "var(--shadow-card)",
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
      {...props}
      style={{ willChange: "transform, box-shadow", ...(props.style as React.CSSProperties) }}
    >
      {children}
    </motion.div>
  )
);
MotionCard.displayName = "MotionCard";

/** Input with focus animation */
export const MotionInput = forwardRef<HTMLInputElement, CleanInputProps & { whileFocus?: any }>(
  ({ className = "", whileFocus, ...props }, ref) => (
    <motion.input
      ref={ref}
      className={className}
      whileFocus={whileFocus ?? { scale: 1.01, borderColor: "var(--accent)" }}
      transition={{ duration: 0.2 }}
      {...props}
      style={{ willChange: "transform, border-color", ...(props.style as React.CSSProperties) }}
    />
  )
);
MotionInput.displayName = "MotionInput";

/** Textarea with focus animation */
export const MotionTextarea = forwardRef<HTMLTextAreaElement, CleanTextareaProps & { whileFocus?: any }>(
  ({ className = "", whileFocus, ...props }, ref) => (
    <motion.textarea
      ref={ref}
      className={className}
      whileFocus={whileFocus ?? { scale: 1.01, borderColor: "var(--accent)" }}
      transition={{ duration: 0.2 }}
      {...props}
      style={{ willChange: "transform, border-color", ...(props.style as React.CSSProperties) }}
    />
  )
);
MotionTextarea.displayName = "MotionTextarea";

/** Icon with spin/pulse on hover */
export function MotionIcon({ 
  children, 
  className = "", 
  animateOnHover = "rotate",
  ...props 
}: { children: React.ReactNode; className?: string; animateOnHover?: "rotate" | "pulse" | "bounce" } & CleanSpanProps) {
  const hoverVariants = {
    rotate: { rotate: 180, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
    pulse: { scale: [1, 1.2, 1], transition: { duration: 0.5, ease: "easeInOut" } },
    bounce: { y: [-5, 0, -5, 0], transition: { duration: 0.6, ease: "easeInOut" } },
  };

  return (
    <motion.span
      className={className}
      whileHover={hoverVariants[animateOnHover]}
      {...props}
      style={{ display: "inline-block", willChange: "transform", ...props.style }}
    >
      {children}
    </motion.span>
  );
}

/** Reveal on scroll — CSS-class based (IntersectionObserver in Reveal.tsx).
 *  Works reliably without framer-motion hydration; no-JS visitors see all
 *  content because the hidden state is gated behind the html `js` class. */
interface ScrollRevealProps extends CleanDivProps {
  children: React.ReactNode;
  variant?: "fadeUp" | "fadeDown" | "fadeLeft" | "fadeRight" | "scale" | "flip" | "blur";
  delay?: number;
  duration?: number;
  /** Render as a different element (e.g. "h1", "p", "dl"). */
  as?: "div" | "h1" | "h2" | "h3" | "p" | "span" | "section" | "ul" | "ol" | "dl" | "figure";
}

const VARIANT_OFFSETS: Record<
  "fadeUp" | "fadeDown" | "fadeLeft" | "fadeRight" | "scale" | "flip" | "blur",
  { y: number; x: number; scale: number; css?: string }
> = {
  fadeUp: { y: 30, x: 0, scale: 1, css: "" },
  fadeDown: { y: -30, x: 0, scale: 1, css: "" },
  fadeLeft: { y: 0, x: 30, scale: 1, css: "" },
  fadeRight: { y: 0, x: -30, scale: 1, css: "" },
  scale: { y: 0, x: 0, scale: 0.92, css: "" },
  flip: { y: 30, x: 0, scale: 1, css: "" },
  blur: { y: 20, x: 0, scale: 1, css: "sr-blur" },
};

export function ScrollReveal({
  children,
  className = "",
  variant = "fadeUp",
  delay = 0,
  duration = 0.6,
  as = "div",
  ...props
}: ScrollRevealProps) {
  const [revealed, setRevealed] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  // JSX typing: cast the intrinsic element union.
  const Tag = as as "div";

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
            io.disconnect();
          }
        }
      },
      { rootMargin: "-60px 0px -60px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const { style: styleProp, ...rest } = props;
  const offset = VARIANT_OFFSETS[variant];

  return (
    <Tag
      ref={ref}
      className={`reveal ${revealed ? "is-revealed" : ""} ${offset.css} ${className}`}
      style={{
        transitionDelay: `${delay}s`,
        "--reveal-y": `${offset.y}px`,
        "--reveal-x": `${offset.x}px`,
        "--reveal-scale": String(offset.scale),
        ...((styleProp as React.CSSProperties) ?? {}),
      } as React.CSSProperties}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Staggered children reveal */
interface StaggerGroupProps extends CleanDivProps {
  children: React.ReactNode;
  stagger?: number;
  delay?: number;
  variant?: "fadeUp" | "fadeDown" | "fadeLeft" | "fadeRight" | "scale" | "flip" | "blur";
}

export function StaggerGroup({
  children,
  className = "",
  stagger = 0.08,
  delay = 0,
  variant = "fadeUp",
  ...props
}: StaggerGroupProps) {
  const childArray = flattenChildren(children);

  return (
    <div className={className} {...props}>
      {childArray.map((child, i) => (
        <ScrollReveal
          key={i}
          delay={delay + i * stagger}
          variant={variant}
        >
          {child}
        </ScrollReveal>
      ))}
    </div>
  );
}

/** Page entrance animation */
export function PageEntrance({ 
  children, 
  className = "",
  delay = 0,
  ...props 
}: { children: React.ReactNode; className?: string; delay?: number } & CleanDivProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.22, 1, 0.36, 1] 
      }}
      {...props}
      style={{ willChange: "transform, opacity", ...props.style }}
    >
      {children}
    </motion.div>
  );
}

/** Loading skeleton with shimmer */
export function Skeleton({ 
  className = "", 
  width = "100%", 
  height = "1rem",
  borderRadius = "0.5rem",
  ...props 
}: { className?: string; width?: string; height?: string; borderRadius?: string } & CleanDivProps) {
  return (
    <motion.div
      className={className}
      animate={{ backgroundPositionX: ["-200%", "200%"] }}
      transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
      {...props}
      style={{ 
        width, 
        height, 
        borderRadius,
        background: "linear-gradient(90deg, var(--border-color) 25%, var(--accent-soft) 50%, var(--border-color) 75%)",
        backgroundSize: "200% 100%",
        willChange: "background-position",
        ...props.style 
      }}
    />
  );
}

/** Number counter animation */
export function CountUp({ 
  value, 
  className = "",
  duration = 1,
  delay = 0,
  formatter = (v: number) => v.toLocaleString(),
  ...props 
}: { value: number; className?: string; duration?: number; delay?: number; formatter?: (v: number) => string } & CleanSpanProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frame = 0;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(value * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
      else setCount(value);
    };
    const timeout = setTimeout(() => { frame = requestAnimationFrame(animate); }, delay * 1000);
    return () => { cancelAnimationFrame(frame); clearTimeout(timeout); };
  }, [value, duration, delay]);

  return <span className={className} {...props}>{formatter(count)}</span>;
}

/** Typing animation for text */
export function Typewriter({ 
  text, 
  className = "",
  speed = 30,
  delay = 0,
  cursor = true,
  ...props 
}: { text: string; className?: string; speed?: number; delay?: number; cursor?: boolean } & CleanSpanProps) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return (
    <span className={className} {...props}>
      {displayText}
      {cursor && <span className="ml-1 animate-pulse">|</span>}
    </span>
  );
}

/** Floating label input */
export function FloatingLabelInput({
  label,
  value,
  onChange,
  className = "",
  ...props
}: { label: string; value: string; onChange: (v: string) => void; className?: string } & CleanInputProps) {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;

  return (
    <div className="relative" {...props}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`
          w-full bg-transparent border-b border-[var(--border-color)] 
          px-0 py-3 text-[var(--text-primary)] placeholder-transparent
          outline-none transition-all duration-300
          ${focused || hasValue ? "border-[var(--accent)]" : ""}
          ${className}
        `}
        placeholder=" "
      />
      <label className={`
        absolute left-0 pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
        text-[var(--text-muted)]
        ${focused || hasValue 
          ? "top-0 text-[11px] text-[var(--accent)]" 
          : "top-3 text-[var(--text-primary)]"
        }
      `}>
        {label}
      </label>
    </div>
  );
}