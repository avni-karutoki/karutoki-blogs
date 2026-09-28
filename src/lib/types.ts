export type Category = "poem" | "blog" | "midnight-talk";

export const CATEGORIES: { id: Category; label: string; plural: string }[] = [
  { id: "poem", label: "Poem", plural: "Poems" },
  { id: "blog", label: "Blog", plural: "Blogs" },
  { id: "midnight-talk", label: "Midnight Talk", plural: "Midnight Talks" },
];

export function categoryLabel(c: string): string {
  return CATEGORIES.find((x) => x.id === c)?.label ?? c;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: Category;
  cover_image: string | null;
  tags: string[] | null;
  featured: boolean | null;
  reading_time: string | null;
  published: boolean;
  created_at: string;
  updated_at?: string | null;
  scheduled_for?: string | null;
  likes?: number | null;
  views?: number | null;
}

export interface HeroSettings {
  title: string;
  subtitle: string;
  buttonText: string;
  imageUrl?: string;
}

export interface AboutSettings {
  title: string;
  subtitle: string;
  bio: string;
  imageUrl?: string;
}
