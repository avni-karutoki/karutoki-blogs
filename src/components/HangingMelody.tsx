"use client";

import { useEffect, useRef, useState } from "react";

type Track = { id: string; label: string; src: string };

const BUILT_IN_TRACKS: Track[] = [
  {
    id: "calm-9",
    label: "Calm waves",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
  },
  {
    id: "calm-10",
    label: "Night drift",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
  },
  {
    id: "my-song",
    label: "My song",
    src: "/soothing.mp3",
  },
];

const TRACK_KEY = "karutoki-music-track";
const CUSTOM_KEY = "karutoki-music-custom-url";
const VOLUME_KEY = "karutoki-music-volume";

function load(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage blocked — ignore */
  }
}

export default function HangingMelody() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadedSrc = useRef<string | null>(null);
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [trackId, setTrackId] = useState<string>(() =>
    typeof window === "undefined" ? "calm-9" : (load(TRACK_KEY) || "calm-9")
  );
  const [customUrl, setCustomUrl] = useState(() =>
    typeof window === "undefined" ? "" : (load(CUSTOM_KEY) || "")
  );
  const [volume, setVolume] = useState(() => {
    if (typeof window === "undefined") return 0.5;
    const v = parseFloat(load(VOLUME_KEY) || "NaN");
    return Number.isNaN(v) ? 0.5 : Math.min(1, Math.max(0, v));
  });
  const [failed, setFailed] = useState(false);

  // The audio element mounts only when the popup opens, so apply the saved
  // volume at mount time too (the effect below only runs when volume changes).
  const attachAudio = (el: HTMLAudioElement | null) => {
    audioRef.current = el;
    if (el) el.volume = volume;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    save(VOLUME_KEY, String(volume));
  }, [volume]);

  // Escape closes the popup.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open ]);

  const activeTrack =
    trackId === "custom"
      ? null
      : (BUILT_IN_TRACKS.find((t) => t.id === trackId) ?? BUILT_IN_TRACKS[0]);
  const activeSrc = trackId === "custom" ? customUrl.trim() : (activeTrack?.src ?? "");
  const activeLabel =
    trackId === "custom" ? "My choice" : (activeTrack?.label ?? "Calm waves");
  const canPlay = activeSrc.length > 0;

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio || !canPlay) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    try {
      setFailed(false);
      // (Re)load lazily, only on user gesture — nothing downloads before this.
      if (loadedSrc.current !== activeSrc) {
        audio.src = activeSrc;
        loadedSrc.current = activeSrc;
        audio.load();
      }
      await audio.play();
      setPlaying(true);
    } catch {
      // Most likely the file isn't there yet (e.g. /soothing.mp3 missing).
      setFailed(true);
    }
  };

  const pickTrack = (id: string) => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    loadedSrc.current = null;
    setPlaying(false);
    setFailed(false);
    setTrackId(id);
    save(TRACK_KEY, id);
  };

  const saveCustom = (url: string) => {
    setCustomUrl(url);
    save(CUSTOM_KEY, url);
    // Switching the link mid-play would 404 the stream — stop and let play reload.
    if (trackId === "custom" && playing) {
      audioRef.current?.pause();
      loadedSrc.current = null;
      setPlaying(false);
    }
  };

  return (
    <div className="hanging-melody" aria-label="Background music player">
      {/* string + pendant charm */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close music player" : "Open music player"}
        className="hanging-melody__charm"
      >
        <span className="hanging-melody__string" aria-hidden />
        <span className="hanging-melody__pendant" aria-hidden>
          <span className="hanging-melody__note">♪</span>
          <span className={`hanging-melody__pulse ${playing ? "is-playing" : ""}`} />
        </span>
      </button>

      {open && (
        <div
          className="hanging-melody__card vintage-card animate-fadeIn"
          role="dialog"
          aria-label="Soothing background music"
        >
          <div className="hanging-melody__head">
            <div>
              <p className="eyebrow">Hanging melody</p>
              <p className="mt-1 font-script text-3xl leading-none text-[var(--text-heading)]">
                A song for the quiet
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close music player"
              className="hanging-melody__close"
            >
              ✕
            </button>
          </div>

          {/* now playing */}
          <div className="hanging-melody__now">
            <span className={`melody-vinyl ${playing ? "is-spinning" : ""}`} aria-hidden>
              <span className="melody-vinyl__hole" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="hanging-melody__status">
                {playing ? "Now playing" : failed ? "Couldn't play" : "Paused"}
              </p>
              <p className="hanging-melody__trackname" title={activeLabel}>
                {activeLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={toggle}
              disabled={!canPlay}
              aria-label={playing ? "Pause background song" : "Play background song"}
              className="hanging-melody__play"
            >
              {playing ? "❚❚" : "▶"}
            </button>
          </div>

          <div>
            <label
              htmlFor="melody-volume"
              className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-faint)]"
            >
              Volume
            </label>
            <input
              id="melody-volume"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="hanging-melody__slider"
            />
          </div>

          <p className="hanging-melody__section">Choose a song</p>
          <div className="space-y-2">
            {BUILT_IN_TRACKS.map((t) => {
              const isActive = trackId === t.id;
              const isLive = isActive && playing;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => pickTrack(t.id)}
                  aria-pressed={isActive}
                  className={`hanging-melody__track ${isActive ? "is-active" : ""}`}
                >
                  {isLive ? (
                    <span className="melody-eq" aria-hidden>
                      <span />
                      <span />
                      <span />
                    </span>
                  ) : (
                    <span className="hanging-melody__dot" aria-hidden />
                  )}
                  <span className="min-w-0 flex-1 truncate">{t.label}</span>
                  {isActive && (
                    <span className="hanging-melody__check" aria-hidden>
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => pickTrack("custom")}
              aria-pressed={trackId === "custom"}
              className={`hanging-melody__track ${trackId === "custom" ? "is-active" : ""}`}
            >
              <span className="hanging-melody__dot" aria-hidden />
              <span className="min-w-0 flex-1 truncate">My choice — custom link…</span>
              {trackId === "custom" && (
                <span className="hanging-melody__check" aria-hidden>
                  ✓
                </span>
              )}
            </button>
          </div>

          {trackId === "custom" && (
            <div className="mt-3">
              <label
                htmlFor="melody-custom"
                className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-faint)]"
              >
                Paste your song link (mp3)
              </label>
              <input
                id="melody-custom"
                type="url"
                inputMode="url"
                placeholder="https://…/my-soothing-song.mp3"
                value={customUrl}
                onChange={(e) => saveCustom(e.target.value)}
                className="field-box mt-2 font-sans text-sm"
              />
            </div>
          )}

          {failed ? (
            <p className="mt-3 font-sans text-xs leading-relaxed text-red-500">
              Couldn&apos;t play that file — add <code>public/soothing.mp3</code> or paste a valid mp3 link, then press play.
            </p>
          ) : (
            <p className="mt-3 font-serif text-[13px] italic leading-relaxed text-[var(--text-muted)]">
              Loops softly while you read. Press play once — browsers ask for a tap first.
            </p>
          )}

          {/* Lazily-loaded looping audio: nothing downloads until you press play. */}
          <audio
            ref={attachAudio}
            loop
            preload="none"
            onPause={() => setPlaying(false)}
            onError={() => setFailed(true)}
          />
        </div>
      )}
    </div>
  );
}
