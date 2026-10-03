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
  const [seen, setSeen] = useState(false);
  const [frame, setFrame] = useState(0); // 0 = sit, 1/2 = run cycle
  const [facing, setFacing] = useState(1); // 1 = right, -1 = left
  const [blink, setBlink] = useState(false);
  const [trail, setTrail] = useState<TrailDot[]>([]);

  const nodeRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const cursor = useRef({ x: -200, y: -200 });
  const hasCursor = useRef(false);
  const seenRef = useRef(false);
  const frameRef = useRef(0);
  const facingRef = useRef(1);
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
      // On first appearance, start slightly behind the cursor so the dog
      // visibly runs in slowly instead of popping in or gliding from a corner.
      if (!hasCursor.current) {
        hasCursor.current = true;
        pos.current = {
          x: e.clientX + FOLLOW_OFFSET.x - 90,
          y: e.clientY + FOLLOW_OFFSET.y - 50,
        };
        if (nodeRef.current) {
          nodeRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
        }
      }
      // Always visible once the cursor has moved — including while running.
      // Guard with a ref so the rAF loop doesn't schedule a React render.
      if (!seenRef.current) {
        seenRef.current = true;
        setSeen(true);
      }
    };
    const onLeave = () => {
      seenRef.current = false;
      setSeen(false);
    };

    // gentle blink every few seconds
    const blinkTimer = window.setInterval(() => {
      setBlink(true);
      window.setTimeout(() => setBlink(false), 160);
    }, 3800);

    let raf = 0;
    const loop = (now: number) => {
      // Skip work when the tab is hidden — saves battery and avoids jumps.
      if (document.hidden) {
        raf = requestAnimationFrame(loop);
        return;
      }
      // Stay with the cursor. When the user is idle the dog simply
      // sits where the cursor is — it never wanders back to a corner.
      const t = hasCursor.current
        ? { x: cursor.current.x + FOLLOW_OFFSET.x, y: cursor.current.y + FOLLOW_OFFSET.y }
        : null;

      if (t) {
        const c = pos.current;
        const dx = t.x - c.x;
        const dy = t.y - c.y;
        const dist = Math.hypot(dx, dy);
        // Slow chase — the dog trots after the cursor so the run is visible.
        const speed = 2.6;
        if (dist > 0.5) {
          const step = Math.min(dist, speed);
          c.x += (dx / dist) * step;
          c.y += (dy / dist) * step;
        }

        const running = dist > 4;
        // Slower stride cycle to match the slow run.
        const f = running ? 1 + (Math.floor(now / 300) % 2) : 0;
        if (f !== frameRef.current) {
          frameRef.current = f;
          setFrame(f);
        }
        // Keep it visible for the whole run, even if a mouseleave fired mid-chase.
        if (running && !seenRef.current) {
          seenRef.current = true;
          setSeen(true);
        }

        // leave a short dotted trail while trotting along (capped for perf)
        if (running && hasCursor.current) {
          const fx = c.x + SIZE / 2;
          const fy = c.y + SIZE - 10;
          const pdx = fx - lastDot.current.x;
          const pdy = fy - lastDot.current.y;
          if (pdx * pdx + pdy * pdy > 28 * 28) {
            lastDot.current = { x: fx, y: fy };
            const id = ++dotId.current;
            setTrail((prev) => [...prev.slice(-11), { id, x: fx, y: fy }]);
            const timer = window.setTimeout(() => {
              setTrail((prev) => prev.filter((d) => d.id !== id));
              // drop the fired timer id so the array doesn't grow forever
              dotTimers.current = dotTimers.current.filter((t) => t !== timer);
            }, 800);
            dotTimers.current.push(timer);
            // hard cap: never hold more than ~12 pending timers
            if (dotTimers.current.length > 12) {
              const oldest = dotTimers.current.shift();
              if (oldest !== undefined) window.clearTimeout(oldest);
            }
          }
        }

        // face the cursor
        const faceTarget = cursor.current.x >= c.x ? 1 : -1;
        if (faceTarget !== facingRef.current) {
          facingRef.current = faceTarget;
          setFacing(faceTarget);
        }

        if (nodeRef.current) {
          nodeRef.current.style.transform = `translate3d(${c.x}px, ${c.y}px, 0)`;
        }
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    const timers = dotTimers.current;
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(blinkTimer);
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      {/* dotted paw trail */}
      {trail.map((dot) => (
        <span key={dot.id} aria-hidden className="paw-trail-dot" style={{ left: dot.x, top: dot.y }} />
      ))}

      <div
        ref={nodeRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] select-none will-change-transform"
        style={{ opacity: seen ? 1 : 0, transition: "opacity 0.5s ease" }}
      >
      <div style={{ transform: `scaleX(${facing})`, width: SIZE, height: SIZE }}>
        {frame === 0 ? (
          <SitDog blink={blink} />
        ) : (
          <RunDog blink={blink} legsApart={frame === 1} />
        )}
      </div>
      <div className="mx-auto -mt-2 h-1.5 w-6 rounded-full bg-black/15 blur-[2px]" />
      </div>
    </>
  );
}
