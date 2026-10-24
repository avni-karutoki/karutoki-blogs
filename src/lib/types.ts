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
  /** Extra pictures attached to a single writing (needs the gallery migration). */
  gallery_images?: string[] | null;
}

export interface HeroSettings {
  title: string;
  subtitle: string;
  buttonText: string;
  imageUrl?: string;
  /** Ordered slideshow pictures; the first five are shown on the homepage. */
  slideshowImages?: string[];
  /** Optional link (e.g. /writings/slug) opened when that slide is clicked. */
  slideshowLinks?: string[];
  /** How the picture is cropped/positioned inside the frame. */
  imageFit?: "cover" | "contain";
  imageZoom?: number;
  imagePosX?: number;
  imagePosY?: number;
}

export interface AboutSettings {
  title: string;
  subtitle: string;
  bio: string;
  /** Main portrait used in the photo stack. */
  imageUrl?: string;
  /** Extra pictures for the about-page gallery. */
  images?: string[];
  /** How the portrait is cropped/positioned inside the circle frame. */
  imageFit?: "cover" | "contain";
  imageZoom?: number;
  imagePosX?: number;
  imagePosY?: number;
}
