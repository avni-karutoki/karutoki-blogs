import type { AboutSettings, HeroSettings } from "@/lib/types";

export const DEFAULT_HERO: HeroSettings = {
  title: "Words that were never said.",
  subtitle:
    "Poems, blogs, and midnight thoughts — a little corner for everything in between.",
  buttonText: "Explore writings",
};

export const DEFAULT_ABOUT: AboutSettings = {
  title: "A little, about me!",
  subtitle: "The girl behind the words",
  bio: "Hi, I'm Avni aka Karutoki. I write in between the moments when words feel like the only thing that makes sense.",
};

export async function getSiteSetting<T>(
  supabase: { from: (t: string) => any },
  key: string,
  fallback: T
): Promise<T> {
  try {
    const { data, error } = await supabase.from("site_settings").select("value").eq("key", key).maybeSingle();
    if (error || !data?.value) return fallback;
    return { ...fallback, ...(data.value as object) } as T;
  } catch {
    return fallback;
  }
}
