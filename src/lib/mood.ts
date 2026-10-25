/**
 * Reader moods — the bridge between writing tags and how a reader feels.
 *
 * A writing's mood is inferred from its tags (set in the admin). Each mood
 * carries its own fixed night palette: card gradients, accent glow, and a
 * pastel chip wash for the light-theme mood picker on /writings. Moods are
 * theme-independent — a rainy-night card is rainy in every palette.
 */

export interface MoodTheme {
  id: string;
  label: string;
  emoji: string;
  /* night card / sky palette */
  deep: string;
  mid: string;
  glow: string;
  /* light-theme mood-picker chip wash */
  chipA: string;
  chipB: string;
}

export const MOOD_THEMES = {
  serene: {
    id: "serene",
    label: "Serene",
    emoji: "🕯",
    deep: "#0b1026",
    mid: "#17233b",
    glow: "#7fb6d9",
    chipA: "#dde8f4",
    chipB: "#c9dcee",
  },
  hopeful: {
    id: "hopeful",
    label: "Hopeful",
    emoji: "🌅",
    deep: "#1c1508",
    mid: "#35270f",
    glow: "#d3a97e",
    chipA: "#f7ead2",
    chipB: "#efdba8",
  },
  romantic: {
    id: "romantic",
    label: "Romantic",
    emoji: "💗",
    deep: "#1d0f17",
    mid: "#362029",
    glow: "#e0a0b5",
    chipA: "#fbe3ec",
    chipB: "#f4cfda",
  },
  melancholy: {
    id: "melancholy",
    label: "Melancholy",
    emoji: "🌧",
    deep: "#0e141c",
    mid: "#1e2833",
    glow: "#93b3c9",
    chipA: "#dfe7ef",
    chipB: "#ccd8e4",
  },
  mysterious: {
    id: "mysterious",
    label: "Mysterious",
    emoji: "🌌",
    deep: "#150f24",
    mid: "#2a2045",
    glow: "#a78ee0",
    chipA: "#e6def6",
    chipB: "#d3c6ef",
  },
} as const satisfies Record<string, MoodTheme>;

export type MoodId = keyof typeof MOOD_THEMES;

/** Keyword → mood mapping, first match wins (checked in this order). */
const MOOD_KEYWORDS: [MoodId, string[]][] = [
  ["romantic", ["love", "heart", "romance", "rose", "darling", "adore", "beloved", "him", "her"]],
  ["melancholy", ["rain", "grey", "gray", "loss", "grief", "cry", "tears", "ache", "goodbye", "gone"]],
  ["hopeful", ["hope", "light", "grow", "spring", "dawn", "morning", "warm", "different", "sun"]],
  ["mysterious", ["secret", "midnight", "2am", "3am", "dark", "mystery", "dream", "shadow", "talk"]],
  ["serene", ["calm", "quiet", "soft", "sea", "moonlight", "peace"]],
];

/** Generic emojis orbiting over the chip gradients when a mood is not yet mapped. */
const FALLBACK_EMOJI = ["✦", "☾", "✧", "❀", "☁", "🕯"];

function matchMood(words: string[]): MoodTheme | null {
  const hay = words.join(" ").toLowerCase();
  for (const [id, keywords] of MOOD_KEYWORDS) {
    if (keywords.some((k) => hay.includes(k))) return MOOD_THEMES[id];
  }
  return null;
}

/** The night sky a writing deserves, based on its tags. Defaults to serene. */
export function moodFromTags(tags?: string[] | null): MoodTheme {
  return matchMood(tags ?? []) ?? MOOD_THEMES.serene;
}

function hashWord(word: string): number {
  let h = 0;
  for (let i = 0; i < word.length; i++) h = (h * 31 + word.charCodeAt(i)) >>> 0;
  return h;
}

/** Chip look for a single tag word in the /writings mood picker. */
export function chipForWord(word: string): { emoji: string; theme: MoodTheme; mapped: boolean } {
  const mood = matchMood([word]);
  if (mood) return { emoji: mood.emoji, theme: mood, mapped: true };
  return {
    emoji: FALLBACK_EMOJI[hashWord(word) % FALLBACK_EMOJI.length],
    theme: MOOD_THEMES.serene,
    mapped: false,
  };
}
