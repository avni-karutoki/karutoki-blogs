"use client";

import { useEffect, useRef, useState } from "react";

const SIZE = 54;
const EDGE = 20;
const FOLLOW_OFFSET = { x: 24, y: 28 };
const IDLE_HOME_MS = 8000;

const INK = "var(--text-heading)";
const PAPER = "var(--bg-primary)";

function homeSpot() {
  if (typeof window === "undefined") return { x: EDGE, y: 600 };
  return { x: EDGE, y: window.innerHeight - EDGE - SIZE };
}

/* ————— Artwork (faces right; flipped via scaleX when heading left) ————— */

function SitRabbit({ blink }: { blink: boolean }) {
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 72 64" fill="none" aria-hidden>
      <ellipse cx="32" cy="57" rx="14" ry="4.5" fill={INK} />
      <circle cx="13" cy="42" r="6.5" fill={PAPER} stroke={INK} strokeWidth="2.5" />
      <ellipse cx="34" cy="42" rx="17" ry="13" fill={INK} />
      <ellipse cx="26" cy="46" rx="10" ry="9" fill={INK} />
      <rect x="45" y="40" width="6" height="15" rx="3" fill={INK} />
      <path d="M43 17 C39 8 39 1 43.5 1.5 C47.5 2 47.5 9 47 16 Z" fill={INK} />
      <path d="M50 15 C48.5 6 50.5 -1 54.5 0.5 C57.5 1.8 55.5 9 54 15 Z" fill={INK} />
      <path d="M51.5 12 C51 7 51.8 3.5 53.4 3.8 C54.8 4 54 8 53.4 12 Z" fill={PAPER} opacity="0.8" />
      <circle cx="50" cy="25" r="11" fill={INK} />
      <ellipse cx="58" cy="29" rx="5.5" ry="4.5" fill={INK} />
      <circle cx="62.5" cy="27.5" r="1.6" fill={PAPER} />
      <ellipse cx="52.5" cy="23" rx="2" ry={blink ? 0.4 : 2.6} fill={PAPER} />
    </svg>
  );
}

function RunRabbit({ blink, legsApart }: { blink: boolean; legsApart: boolean }) {
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 72 64" fill="none" aria-hidden>
      <path
        d={legsApart ? "M26 46 L14 57" : "M26 46 L37 57"}
        stroke={INK}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d={legsApart ? "M48 46 L60 55" : "M48 46 L38 57"}
        stroke={INK}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="16" cy="36" r="5" fill={PAPER} stroke={INK} strokeWidth="2.5" />
      <ellipse cx="36" cy="40" rx="19" ry="10" fill={INK} />
      <path d="M50 21 C44 14 37 10 31 10 C37 13 43 17 48 23 Z" fill={INK} />
      <path d="M52 22 C47 16 41 13 36 12.5 C41 15 47 18 51 24 Z" fill={INK} />
      <circle cx="55" cy="27" r="9" fill={INK} />
      <ellipse cx="62" cy="30" rx="4.5" ry="3.8" fill={INK} />
      <circle cx="65.5" cy="28.5" r="1.4" fill={PAPER} />
      <ellipse cx="57" cy="25" rx="1.8" ry={blink ? 0.4 : 2.4} fill={PAPER} />
    </svg>
  );
}

/* ————— Companion ————— */

export default function CursorRabbit() {
  const [enabled, setEnabled] = useState(false);
  const [seen, setSeen] = useState(false);
  const [frame, setFrame] = useState(0); // 0 = sit, 1/2 = run cycle
  const [facing, setFacing] = useState(1); // 1 = right, -1 = left
  const [blink, setBlink] = useState(false);

  const nodeRef = useRef<HTMLDivElement>(null);
  const pos = useRef(homeSpot());
  const cursor = useRef({ x: -200, y: -200 });
  const lastMove = useRef(0);
  const homing = useRef(true);
  const frameRef = useRef(0);
  const facingRef = useRef(1);

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
    pos.current = homeSpot();

    const onMove = (e: MouseEvent) => {
      cursor.current = { x: e.clientX, y: e.clientY };
      lastMove.current = performance.now();
      homing.current = false;
      setSeen(true);
    };
    const onLeave = () => setSeen(false);

    // gentle blink every few seconds
    const blinkTimer = window.setInterval(() => {
      setBlink(true);
      window.setTimeout(() => setBlink(false), 160);
    }, 3800);

    let raf = 0;
    const loop = (now: number) => {
      const home = homeSpot();
      const t = homing.current
        ? home
        : { x: cursor.current.x + FOLLOW_OFFSET.x, y: cursor.current.y + FOLLOW_OFFSET.y };

      const c = pos.current;
      const dx = t.x - c.x;
      const dy = t.y - c.y;
      const dist = Math.hypot(dx, dy);
      const speed = homing.current ? 4.5 : 6.5;
      if (dist > 0.5) {
        const step = Math.min(dist, speed);
        c.x += (dx / dist) * step;
        c.y += (dy / dist) * step;
      }

      const running = dist > 7;
      const f = running ? 1 + (Math.floor(now / 150) % 2) : 0;
      if (f !== frameRef.current) {
        frameRef.current = f;
        setFrame(f);
      }

      // face the cursor (or travel direction while homing)
      const faceTarget = homing.current ? (dx >= 0 ? 1 : -1) : cursor.current.x >= c.x ? 1 : -1;
      if (faceTarget !== facingRef.current) {
        facingRef.current = faceTarget;
        setFacing(faceTarget);
      }

      // hop bob while running
      const bob = running ? -Math.abs(Math.sin(now / 110)) * 5 : 0;
      if (nodeRef.current) {
        nodeRef.current.style.transform = `translate3d(${c.x}px, ${c.y + bob}px, 0)`;
      }

      // wander home after a long idle
      if (!homing.current && now - lastMove.current > IDLE_HOME_MS) {
        homing.current = true;
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(blinkTimer);
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={nodeRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9999] select-none"
      style={{ opacity: seen ? 1 : 0, transition: "opacity 0.5s ease" }}
    >
      <div style={{ transform: `scaleX(${facing})`, width: SIZE, height: SIZE }}>
        {frame === 0 ? (
          <SitRabbit blink={blink} />
        ) : (
          <RunRabbit blink={blink} legsApart={frame === 1} />
        )}
      </div>
      <div className="mx-auto -mt-3 h-2 w-10 rounded-full bg-black/15 blur-[2px]" />
    </div>
  );
}
