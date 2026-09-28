import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/supabase/authorization";
import { sendLetters } from "@/lib/email";

/** POST { slug } → emails all newsletter subscribers about a published post. Admin only. */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminUser(user)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let slug: string | undefined;
  try {
    slug = (await req.json()).slug;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!slug) return NextResponse.json({ error: "Missing slug." }, { status: 400 });

  const { data: post } = await supabase
    .from("posts")
    .select("title, slug, excerpt, category, published")
    .eq("slug", slug)
    .maybeSingle();
  if (!post || !post.published) {
    return NextResponse.json({ error: "Published post not found." }, { status: 404 });
  }

  const { data: subs, error: subsError } = await supabase
    .from("newsletter_subscribers")
    .select("email");
  if (subsError) {
    return NextResponse.json(
      { error: "Could not read subscribers. Check the newsletter table exists." },
      { status: 500 }
    );
  }
  const recipients = [
    ...new Set(
      (((subs as { email: string }[]) || []).map((s) => s.email).filter(Boolean) as string[])
    ),
  ];
  if (recipients.length === 0) {
    return NextResponse.json({ sent: 0, failed: 0, message: "No subscribers yet." });
  }

  const h = await headers();
  const proto = h.get("x-forwarded-proto") || "https";
  const host = h.get("x-forwarded-host") || h.get("host") || "";
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || (host ? `${proto}://${host}` : "http://localhost:3000");

  try {
    const { sent, failed } = await sendLetters(post, recipients, baseUrl);
    return NextResponse.json({ sent, failed });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sending failed." },
      { status: 500 }
    );
  }
}
