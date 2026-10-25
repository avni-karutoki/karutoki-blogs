"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Local-dev replacement for the HangingMelody popup.
 *
 * A single rope charm that toggles one song: All Too Well (10 Minute Version).
 * Click the rope → the song starts and keeps playing across every page
 * (this component is mounted once in the root layout, so playback survives
 * client-side navigation) until the rope is clicked again to stop it.
 *
 * The song is copyrighted, so it is loaded from `public/all-too-well.mp3` —
 * drop the 10-minute version file there to enable playback.
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

  // Remember whether the song was on (and where it got to) so playback resumes
  // exactly where it left off after a hard reload. Client-side navigation is
  // already seamless — the <audio> stays mounted in the root layout — but a
  // fresh page load remounts everything, so the position has to be restored.
  // Autoplay needs a gesture, so a blocked resume silently waits for the next
  // rope click, which then also continues from the saved position.
  const RESUME_KEY = "karutoki-rope-playing";
  const POSITION_KEY = "karutoki-rope-position";
  useEffect(() => {
    let on = false;
    let savedAt = 0;
    try {
      on = localStorage.getItem(RESUME_KEY) === "1";
      savedAt = parseFloat(localStorage.getItem(POSITION_KEY) || "NaN") || 0;
    } catch {
      /* storage blocked — ignore */
    }
    const audio = audioRef.current;
    if (!audio) return;

    const remember = () => {
      if (audio.currentTime > 0) {
        try {
          localStorage.setItem(POSITION_KEY, String(audio.currentTime));
        } catch {}
      }
    };
    // Save the position every ~3s while playing (and every time it wraps
    // around past the last save, i.e. right after a loop restart).
    const lastSaved = { v: 0 };
    const onTime = () => {
      if (audio.currentTime - lastSaved.v >= 3 || audio.currentTime < lastSaved.v) {
        lastSaved.v = audio.currentTime;
        remember();
      }
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("pause", remember);
    const onHidden = () => {
      if (document.visibilityState === "hidden") remember();
    };
    document.addEventListener("visibilitychange", onHidden);

    if (on) {
      audio.src = SONG_SRC;
      if (savedAt > 0) {
        // currentTime can only be seeked once the file's metadata is known.
        audio.addEventListener(
          "loadedmetadata",
          () => {
            try {
              audio.currentTime = savedAt;
            } catch {
              /* seek failed — just start from the top */
            }
          },
          { once: true },
        );
      }
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => {
          /* blocked until the next rope click — that click resumes the position */
        });
    }

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("pause", remember);
      document.removeEventListener("visibilitychange", onHidden);
    };
  }, []);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      try {
        localStorage.setItem(RESUME_KEY, "0");
      } catch {}
      return;
    }
    setMissing(false);
    if (!audio.src) {
      audio.src = SONG_SRC;
      // Continue from where the song last was, instead of the very beginning.
      let savedAt = 0;
      try {
        savedAt = parseFloat(localStorage.getItem(POSITION_KEY) || "NaN") || 0;
      } catch {}
      if (savedAt > 0) {
        audio.addEventListener(
          "loadedmetadata",
          () => {
            try {
              audio.currentTime = savedAt;
            } catch {
              /* seek failed — just start from the top */
            }
          },
          { once: true },
        );
      }
    }
    try {
      await audio.play();
      setPlaying(true);
      try {
        localStorage.setItem(RESUME_KEY, "1");
      } catch {}
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
