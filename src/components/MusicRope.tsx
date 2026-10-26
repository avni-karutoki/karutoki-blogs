"use client";

import { useRef, useState } from "react";

/**
 * Replacement for the HangingMelody popup.
 *
 * A single rope charm that toggles one song: All Too Well (10 Minute Version).
 * Click the rope → the song starts and keeps playing across every page
 * (this component is mounted once in the root layout, so the <audio> element
 * — its position and pause state — survives client-side navigation) until
 * the rope is clicked again to stop it. Pausing then clicking later resumes
 * from the same spot. A page refresh rebuilds everything from scratch, so
 * the song begins from the beginning — nothing is remembered across reloads.
 *
 * The song is copyrighted, so it is loaded from `public/all-too-well.mp3`.
 */

const SONG_SRC = "/all-too-well.mp3";

export default function MusicRope() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [missing, setMissing] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const attachAudio = (el: HTMLAudioElement | null) => {
    audioRef.current = el;
    // Kept low on purpose — ambient background level that stays out of the way
    if (el) el.volume = 0.4;
  };

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    setMissing(false);
    if (!audio.src) {
      audio.src = SONG_SRC;
    }
    // No seek here on purpose: as long as this <audio> element lives (the
    // whole browsing session, page changes included), pause keeps
    // currentTime and play() resumes from it. A refresh starts fresh.
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      // Most likely `public/all-too-well.mp3` hasn't been added yet.
      setMissing(true);
      setShowHint(true);
      window.setTimeout(() => setShowHint(false), 6000);
    }
  };

  return (
    <div className="hanging-melody" aria-label="Background music player">
      {/* string + pendant charm — one song, one toggle */}
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? "Stop the music" : "Play the music"}
        className="hanging-melody__charm"
      >
        <span className="hanging-melody__string" aria-hidden />
        <span className="hanging-melody__pendant" aria-hidden>
          <span className="hanging-melody__note">♪</span>
          <span className={`hanging-melody__pulse ${playing ? "is-playing" : ""}`} />
        </span>
      </button>

      {missing && showHint && (
        <div className="rope-song-chip animate-fadeIn" role="status">
          <span className="rope-song-chip__name" title="Missing song file">
            Add <code>public/all-too-well.mp3</code> to hear the song
          </span>
        </div>
      )}


      {/* Always-mounted audio. Nothing downloads until the first rope click. */}
      <audio
        ref={attachAudio}
        loop
        preload="none"
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        onError={() => setMissing(true)}
      />
    </div>
  );
}
