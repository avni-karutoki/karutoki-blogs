"use client";

/** Picture crop & adjust controls, shared by the Hero and About managers.
 *  Emits a partial patch; callers merge it into their form state and save. */

export interface PictureValues {
  fit: "cover" | "contain";
  zoom: number;
  posX: number;
  posY: number;
}

const labelClass = "block font-semibold uppercase tracking-wider text-[var(--text-heading)]";
const valueClass = "font-sans text-[10.5px] text-[var(--text-faint)]";
const rangeClass = "w-full accent-[var(--accent)] cursor-pointer";
const selectClass =
  "rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 font-sans text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-pink)]";

export default function PictureAdjuster({
  label = "Crop & adjust the picture",
  fit,
  zoom,
  posX,
  posY,
  onPatch,
  previewSrc,
  previewAspect = "aspect-[16/9]",
}: {
  label?: string;
  fit: "cover" | "contain";
  zoom: number;
  posX: number;
  posY: number;
  onPatch: (patch: Partial<PictureValues>) => void;
  /** Shows the current image inside a live cropping preview, if set. */
  previewSrc?: string;
  previewAspect?: string;
}) {
  const pos = `${posX}% ${posY}%`;
  return (
    <div className="space-y-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4">
      <p className="font-script text-xl text-[var(--text-heading)]">{label}</p>

      {/* live preview of the crop */}
      {previewSrc ? (
        <div
          className={`relative overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-[var(--shadow-card)] ${previewAspect}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt="Crop preview"
            className="absolute inset-0 h-full w-full"
            style={{
              objectFit: fit,
              objectPosition: pos,
              ...(zoom !== 100
                ? { transform: `scale(${zoom / 100})`, transformOrigin: pos }
                : {}),
            }}
          />
        </div>
      ) : null}

      {/* how the picture sits in the frame */}
      <div>
        <label className={labelClass}>Crop mode</label>
        <select
          value={fit}
          onChange={(e) => onPatch({ fit: e.target.value as "cover" | "contain" })}
          className={`${selectClass} mt-1`}
        >
          <option value="cover">Fill the frame (crop edges)</option>
          <option value="contain">Show the whole picture</option>
        </select>
      </div>

      {/* zoom */}
      <div>
        <div className="flex items-baseline justify-between">
          <label className={labelClass}>Zoom (crop tighter)</label>
          <span className={valueClass}>{zoom}%</span>
        </div>
        <input
          type="range"
          min={100}
          max={180}
          step={5}
          value={zoom}
          onChange={(e) => onPatch({ zoom: Number(e.target.value) })}
          className={`${rangeClass} mt-1`}
        />
      </div>

      {/* focal point = which part of the picture stays visible */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-baseline justify-between">
            <label className={labelClass}>Focus X</label>
            <span className={valueClass}>{posX}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={posX}
            onChange={(e) => onPatch({ posX: Number(e.target.value) })}
            className={`${rangeClass} mt-1`}
          />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <label className={labelClass}>Focus Y</label>
            <span className={valueClass}>{posY}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={posY}
            onChange={(e) => onPatch({ posY: Number(e.target.value) })}
            className={`${rangeClass} mt-1`}
          />
        </div>
      </div>
      <p className="font-sans text-[10.5px] text-[var(--text-faint)]">
        Focus picks the part of the picture that stays in view: 50/50 centered, 50/0 top, 100/100 bottom-right. Remember to click Save below.
      </p>
    </div>
  );
}
