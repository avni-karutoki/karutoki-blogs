"use client";

import { useEffect, useRef, useState } from "react";

type Dot = { id: number; x: number; y: number };

export default function CursorRabbit() {
  const [enabled, setEnabled] = useState(false);
  const [seen, setSeen] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [dots, setDots] = useState<Dot[]>([]);

  const nodeRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const lastDot = useRef({ x: -100, y: -100 });
  const idRef = useRef(0);

  useEffect(() => {
    const hoverQuery = window.matchMedia("(hover: none)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const check = () => {
      setEnabled(!hoverQuery.matches && !motionQuery.matches && window.innerWidth >= 768);
    };
    check();
    window.addEventListener("resize", check);
    hoverQuery.addEventListener?.("change", check);
    motionQuery.addEventListener?.("change", check);
    return () => {
      window.removeEventListener("resize", check);
      hoverQuery.removeEventListener?.("change", check);
      motionQuery.removeEventListener?.("change", check);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      setSeen(true);

      const dx = e.clientX - lastDot.current.x;
      const dy = e.clientY - lastDot.current.y;
      if (dx * dx + dy * dy > 28 * 28) {
        lastDot.current = { x: e.clientX, y: e.clientY };
        const id = ++idRef.current;
        setDots((d) => [...d.slice(-11), { id, x: e.clientX, y: e.clientY }]);
        window.setTimeout(() => {
          setDots((d) => d.filter((dot) => dot.id !== id));
        }, 750);
      }
    };

    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      setHovering(
        !!el?.closest?.("a, button, [role='button'], input, textarea, select, label")
      );
    };

    const onLeave = () => setSeen(false);

    let raf = 0;
    const loop = () => {
      const t = target.current;
      const c = pos.current;
      c.x += (t.x - c.x) * 0.16;
      c.y += (t.y - c.y) * 0.16;
      if (nodeRef.current) {
        nodeRef.current.style.transform = `translate3d(${c.x}px, ${c.y}px, 0)`;
      }
      const dx = t.x - c.x;
      if (svgRef.current) {
        if (dx < -2) svgRef.current.style.transform = "scaleX(-1)";
        else if (dx > 2) svgRef.current.style.transform = "scaleX(1)";
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      {/* sparkle trail */}
      {dots.map((dot) => (
        <span
          key={dot.id}
          aria-hidden
          className="cursor-trail-dot"
          style={{ left: dot.x, top: dot.y }}
        />
      ))}

      {/* rabbit companion */}
      <div
        ref={nodeRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] select-none"
        style={{ opacity: seen ? 1 : 0, transition: "opacity 0.4s ease" }}
      >
        <div
          className="relative translate-x-4 translate-y-4 transition-transform duration-300 ease-out"
          style={{ transform: `translate(16px, 16px) scale(${hovering ? 1.4 : 1})` }}
        >
          {/* hover glow ring */}
          <span
            className="absolute inset-0 -m-2 rounded-full transition-opacity duration-300"
            style={{
              background: "var(--accent-soft)",
              opacity: hovering ? 1 : 0,
            }}
          />
          <svg
            ref={svgRef}
            width="28"
            height="28"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative text-[var(--accent)] drop-shadow-sm"
            style={{ transition: "transform 0.15s ease-out" }}
          >
            <path
              d="M12 12C11 7 9 2 12 3C15 4 14 8 15 11"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 11C16 6 16 1 18.5 2C21 3 19 8 18 11"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 16C10 13 13 11 17 12C20 13 22 15 22 18C22 21 20 23 16 23C12 23 10 20 10 16Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="18" cy="15" r="1" fill="currentColor" />
            <circle cx="21" cy="16.5" r="0.8" fill="var(--accent)" />
            <path d="M12 23C11 25 11 26 13 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M17 23C16 25 17 26 19 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M25 8L26 10L28 11L26 12L25 14L24 12L22 11L24 10L25 8Z" fill="var(--accent)" opacity="0.8" />
          </svg>
        </div>
      </div>
    </>
  );
}
