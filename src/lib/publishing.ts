import { createClient } from "@/lib/supabase/server";
import { notifyPendingLetters } from "@/lib/newsletter";

/**
 * Flips due scheduled posts to published. Called whenever /admin loads, so
 * scheduled pieces go live even without pg_cron. Returns how many were
 * published. Safe no-op if the `scheduled_for` column doesn't exist yet
 * (migration not run).
 */
export async function publishDuePosts(): Promise<number> {
  let publishedCount = 0;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("posts")
      .update({ published: true, scheduled_for: null, updated_at: new Date().toISOString() })
      .eq("published", false)
      .lte("scheduled_for", new Date().toISOString())
      .select("id");
    if (error) return 0;
    publishedCount = data?.length ?? 0;
  } catch {
    return 0;
  }

  // Newly-released scheduled pieces greet the newsletter right away.
  if (publishedCount > 0) {
    try {
      await notifyPendingLetters();
    } catch {
      /* letters are non-blocking for the publish flow */
    }
  }
  return publishedCount;
}
