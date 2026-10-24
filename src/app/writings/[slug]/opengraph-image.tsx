import { ImageResponse } from "next/og";
import { createPublicClient } from "@/lib/supabase/server";

/** Auto-generated social card for every writing — shared links get a
 *  typeset "letter card": paper cream, ink title, the section eyebrow. */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Karutoki writing";

export const revalidate = 3600;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let title = "Words that were never said.";
  let category = "writing";
  let created_at = "";
  try {
    const supabase = await createPublicClient();
    const { data } = await supabase
      .from("posts")
      .select("title, category, created_at")
      .eq("slug", slug)
      .eq("published", true)
      .single();
    if (data) {
      title = (data as { title: string }).title;
      category = (data as { category: string }).category;
      created_at = (data as { created_at: string }).created_at;
    }
  } catch {
    /* fall back to the default title */
  }

  const label = category === "midnight-talk" ? "midnight talks" : `${category}`;
  const date = created_at
    ? new Date(created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "karutoki";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#f4efe3",
          backgroundImage: "radial-gradient(circle at 85% -10%, rgba(154,106,79,0.16), transparent 55%)",
          padding: "72px 88px",
          border: "3px solid #1c1a16",
        }}
      >
        {/* eyebrow row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: "#9a6a4f",
              fontWeight: 700,
            }}
          >
            Karutoki ✦ {label}
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "#9a6a4f" }}>{date}</div>
        </div>

        {/* the title */}
        <div
          style={{
            display: "flex",
            fontSize: title.length > 64 ? 56 : 74,
            lineHeight: 1.18,
            color: "#1c1a16",
            maxWidth: 960,
            fontWeight: 600,
          }}
        >
          {title}
        </div>

        {/* footer */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            borderTop: "1.5px solid rgba(28,26,22,0.25)",
            paddingTop: 26,
          }}
        >
          <div style={{ display: "flex", fontSize: 26, color: "#1c1a16", fontWeight: 600 }}>
            Avni Goel
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "#9a6a4f", fontStyle: "italic" }}>
            words for the things left unsaid
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
