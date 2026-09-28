import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/supabase/authorization";
import { publishDuePosts } from "@/lib/publishing";
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

  const [{ data: posts }, { data: messages }, hero, about] = await Promise.all([
    supabase.from("posts").select("*").order("created_at", { ascending: false }),
    supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
    getSiteSetting<HeroSettings>(supabase, "hero", DEFAULT_HERO),
    getSiteSetting<AboutSettings>(supabase, "about", DEFAULT_ABOUT),
  ]);

  return (
    <DashboardClient
      userEmail={user.email || "admin"}
      posts={posts || []}
      messages={messages || []}
      initialHeroSettings={hero}
      initialAboutSettings={about}
    />
  );
}
