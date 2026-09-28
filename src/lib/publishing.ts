import { createClient } from "@/lib/supabase/server";

/**
 * Flips due scheduled posts to published. Called whenever /admin loads, so
 * scheduled pieces go live even without pg_cron. Returns how many were
 * published. Safe no-op if the `scheduled_for` column doesn't exist yet
 * (migration not run).
 */
export async function publishDuePosts(): Promise<number> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("posts")
      .update({ published: true, scheduled_for: null, updated_at: new Date().toISOString() })
      .eq("published", false)
      .lte("scheduled_for", new Date().toISOString())
      .select("id");
    if (error) return 0;
    return data?.length ?? 0;
  } catch {
    return 0;
  }
}
