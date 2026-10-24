"use client";

import { useEffect, useRef, useState } from "react";

/** Reads the writing out loud with the browser's built-in speech engine —
 *  no API keys, works offline, and pauses when the reader navigates away. */

export default function ReadAloud({ text, title }: { text: string; title: string }) {
  const [supported, setSupported] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [busy, setBusy] = useState(false);
  // Keep the end-of-utterance handler stable while speaking continues.
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function pickVoice(): SpeechSynthesisVoice | null {
    const voices = window.speechSynthesis.getVoices();
    // Prefer a calm, small voice; fall back to any English voice.
    return (
      voices.find((v) => /en(-|_)/i.test(v.lang) && /female|samantha|zira|aria/i.test(v.name)) ||
      voices.find((v) => /^en/i.test(v.lang)) ||
      null
    );
  }

  function start() {
    if (!(typeof window !== "undefined" && "speechSynthesis" in window)) return;
    setBusy(true);
    const u = new SpeechSynthesisUtterance(`${title}. ${text}`);
    u.rate = 0.92; // a poem shouldn't be rushed
    u.pitch = 1;
    u.voice = pickVoice();
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    utterRef.current = u;
    setSpeaking(true);
    setBusy(false);
    window.speechSynthesis.speak(u);
  }

  function stop() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={speaking ? stop : start}
      title={speaking ? "Stop reading" : "Listen to this writing"}
      aria-pressed={speaking}
      className={`ink-link inline-flex items-center gap-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] transition-opacity ${
        busy ? "opacity-60" : ""
      }`}
    >
      <span aria-hidden className="text-[13px]">
        {speaking ? "◼" : "▶"}
      </span>
      {speaking ? "Stop" : "Listen"}
    </button>
  );
}
