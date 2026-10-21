"use client";

import { useEffect, useRef, useState } from "react";

const SIZE = 32;
const FOLLOW_OFFSET = { x: 18, y: 22 };

const INK = "var(--text-heading)";
const PAPER = "var(--bg-primary)";

type TrailDot = { id: number; x: number; y: number };

/* ————— Pixel-art sprites (4px grid, faces right; flipped via scaleX) ————— */

function SitDog({ blink }: { blink: boolean }) {
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 72 64" fill="none" shapeRendering="crispEdges" aria-hidden>
      {/* ground shadow */}
      <rect x="12" y="56" width="40" height="4" fill={INK} opacity="0.2" />
      {/* wagging tail */}
      <rect x="8" y="40" width="8" height="4" fill={INK} />
      <rect x="4" y="44" width="8" height="8" fill={INK} />
      {/* body + haunch */}
      <rect x="16" y="36" width="32" height="16" fill={INK} />
      <rect x="12" y="40" width="8" height="12" fill={INK} />
      {/* legs */}
      <rect x="16" y="48" width="12" height="12" fill={INK} />
      <rect x="40" y="48" width="8" height="12" fill={INK} />
      {/* chest up to head */}
      <rect x="40" y="28" width="12" height="12" fill={INK} />
      {/* head */}
      <rect x="36" y="12" width="24" height="20" fill={INK} />
      {/* pointy ear */}
      <rect x="44" y="4" width="8" height="12" fill={INK} />
      {/* snout */}
      <rect x="56" y="24" width="8" height="8" fill={INK} />
      {/* nose */}
      <rect x="60" y="24" width="4" height="4" fill={PAPER} />
      {/* tongue */}
      <rect x="56" y="32" width="4" height="8" fill={PAPER} />
      {/* eye (shuts when blinking) */}
      <rect x="44" y="20" width="4" height="4" fill={blink ? INK : PAPER} />
    </svg>
  );
}

function RunDog({ blink, legsApart }: { blink: boolean; legsApart: boolean }) {
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 72 64" fill="none" shapeRendering="crispEdges" aria-hidden>
      {/* ground shadow */}
      <rect x="12" y="56" width="44" height="4" fill={INK} opacity="0.2" />
      {/* tail raised */}
      <rect x="4" y="24" width="4" height="12" fill={INK} />
      <rect x="8" y="32" width="12" height="4" fill={INK} />
      {/* stretched body */}
      <rect x="16" y="36" width="40" height="12" fill={INK} />
      {/* legs: stride frames */}
      {legsApart ? (
        <>
          <rect x="56" y="48" width="8" height="12" fill={INK} />
          <rect x="16" y="48" width="8" height="12" fill={INK} />
        </>
      ) : (
        <>
          <rect x="44" y="48" width="8" height="12" fill={INK} />
          <rect x="28" y="48" width="8" height="12" fill={INK} />
        </>
      )}
      {/* ear flying back */}
      <rect x="28" y="20" width="16" height="4" fill={INK} />
      {/* head */}
      <rect x="44" y="16" width="20" height="16" fill={INK} />
      {/* snout + nose */}
      <rect x="60" y="28" width="8" height="8" fill={INK} />
      <rect x="64" y="28" width="4" height="4" fill={PAPER} />
      {/* tongue out */}
      <rect x="60" y="36" width="4" height="8" fill={PAPER} />
      {/* eye */}
      <rect x="52" y="24" width="4" height="4" fill={blink ? INK : PAPER} />
    </svg>
  );
}

/* ————— Companion ————— */

export default function CursorDog() {
  const [enabled, setEnabled] = useState(false);
  const [trail, setTrail] = useState<TrailDot[]>([]);

  const cursor = useRef({ x: -200, y: -200 });
  const lastDot = useRef({ x: -1000, y: -1000 });
  const dotId = useRef(0);
  const dotTimers = useRef<number[]>([]);

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
      cursor.current = { x: e.clientX, y: e.clientY };

      // leave a short dotted trail while moving (capped for perf)
      const fx = e.clientX;
      const fy = e.clientY;
      const pdx = fx - lastDot.current.x;
      const pdy = fy - lastDot.current.y;
      if (pdx * pdx + pdy * pdy > 28 * 28) {
        lastDot.current = { x: fx, y: fy };
        const id = ++dotId.current;
        setTrail((prev) => [...prev.slice(-11), { id, x: fx, y: fy }]);
        const timer = window.setTimeout(() => {
          setTrail((prev) => prev.filter((d) => d.id !== id));
          dotTimers.current = dotTimers.current.filter((t) => t !== timer);
        }, 800);
        dotTimers.current.push(timer);
        if (dotTimers.current.length > 12) {
          const oldest = dotTimers.current.shift();
          if (oldest !== undefined) window.clearTimeout(oldest);
        }
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    const timers = dotTimers.current;
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("mousemove", onMove);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      {/* dotted paw trail */}
      {trail.map((dot) => (
        <span key={dot.id} aria-hidden className="paw-trail-dot" style={{ left: dot.x, top: dot.y }} />
      ))}
    </>
  );
}
