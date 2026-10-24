import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/server";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://karutoki-blogs.vercel.app";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/writings`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/poems`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/blogs`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/midnight-talks`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/tags`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE}/archive`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/contact`, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const supabase = await createPublicClient();
    const { data } = await supabase
      .from("posts")
      .select("slug, updated_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(500);
    const writings: MetadataRoute.Sitemap = (data || []).map((p) => ({
      url: `${BASE}/writings/${(p as { slug: string }).slug}`,
      lastModified: (p as { updated_at?: string }).updated_at
        ? new Date((p as { updated_at: string }).updated_at)
        : undefined,
      changeFrequency: "monthly",
      priority: 0.8,
    }));
    return [...writings, ...staticRoutes];
  } catch {
    return staticRoutes;
  }
}
