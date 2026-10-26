import { createPublicClient } from "@/lib/supabase/server";

export const revalidate = 3600;

type Row = {
  slug: string;
  title: string;
  excerpt: string | null;
  created_at: string;
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || url.host;
  const proto = request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
  const base = process.env.NEXT_PUBLIC_SITE_URL || `${proto}://${host}`;

  let items: Row[] = [];
  try {
    const supabase = await createPublicClient();
    const { data } = await supabase
      .from("posts")
      .select("slug, title, excerpt, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(50);
    items = (data as Row[]) || [];
  } catch {
    items = [];
  }

  const lastBuildDate = new Date(items[0]?.created_at ?? new Date().toISOString()).toUTCString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Karutoki Blogs ✦</title>
    <link>${esc(base)}/</link>
    <description>Poems, stories, and pieces of me, tucked between the lines. Words for the things left unsaid.</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${esc(base)}/feed.xml" rel="self" type="application/rss+xml" />
${items
  .map(
    (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${esc(base)}/writings/${esc(p.slug)}</link>
      <guid isPermaLink="true">${esc(base)}/writings/${esc(p.slug)}</guid>
      <pubDate>${new Date(p.created_at).toUTCString()}</pubDate>
      ${p.excerpt ? `<description>${esc(p.excerpt)}</description>` : ""}
    </item>`
  )
  .join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
