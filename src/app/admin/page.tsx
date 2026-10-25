import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/supabase/authorization";
import { publishDuePosts } from "@/lib/publishing";
import { notifyPendingLetters } from "@/lib/newsletter";
import DashboardClient from "./DashboardClient";
import { DEFAULT_ABOUT, DEFAULT_HERO, getSiteSetting } from "@/lib/site";
import type { AboutSettings, HeroSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");
  if (!isAdminUser(user)) redirect("/admin/login");

  // Auto-publish any scheduled pieces whose time has come.
  await publishDuePosts();

  // Sweep: email subscribers about anything published-but-not-yet-announced.
  // Covers writing saved straight from "New writing" with the toggle on.
  try {
    await notifyPendingLetters();
  } catch {
    /* letters are non-blocking for the dashboard */
  }

  const [{ data: posts }, { data: messages }, { data: comments }, hero, about] = await Promise.all([
    supabase.from("posts").select("*").order("created_at", { ascending: false }),
    supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
    // Comments with the post title attached (migrate-comments.sql); if the
    // table isn't there yet the dashboard keeps loading without the tab.
    supabase
      .from("comments")
      .select("id, post_id, author_name, content, created_at, parent_id, posts(title)")
      .order("created_at", { ascending: false })
      .limit(200),
    getSiteSetting<HeroSettings>(supabase, "hero", DEFAULT_HERO),
    getSiteSetting<AboutSettings>(supabase, "about", DEFAULT_ABOUT),
  ]);

  return (
    <DashboardClient
      userEmail={user.email || "admin"}
      posts={posts || []}
      messages={messages || []}
      comments={comments || []}
      initialHeroSettings={hero}
      initialAboutSettings={about}
    />
  );
}
