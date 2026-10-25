import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { sendLetters } from "@/lib/email";

/**
 * Automatic newsletter letters.
 *
 * Whenever a writing becomes live (publish toggle, scheduled release, or the
 * first save of a published piece), pending letters are sent to every
 * subscriber automatically — no manual button needed.
 *
 * Each writing is mailed exactly once: the record of what has been sent
 * lives in the `site_settings` table under the key below (admin-writable
 * JSONB, no extra columns or migrations). The manual "Email subscribers"
 * button in the dashboard still bypasses this for a deliberate re-send.
 */

const SENT_KEY = "newsletter_letters";

interface SentRecord {
  [slug: string]: string;
}

function sentUrl(post: { slug: string }, baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/writings/${post.slug}`;
}

export { sentUrl as letterUrl };

async function getSentSlugs(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<SentRecord> {
  try {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", SENT_KEY)
      .maybeSingle();
    return ((data as { value: SentRecord } | null)?.value ?? {}) as SentRecord;
  } catch {
    return {};
  }
}

async function markSent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  slugs: string[]
): Promise<void> {
  const sent = await getSentSlugs(supabase);
  const now = new Date().toISOString();
  for (const slug of slugs) sent[slug] = now;
  try {
    await supabase
      .from("site_settings")
      .upsert({ key: SENT_KEY, value: sent, updated_at: now });
  } catch {
    /* marking is best-effort; failed sends would retry */
  }
}

async function getBaseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  try {
    const h = await headers();
    const proto = h.get("x-forwarded-proto") || "https";
    const host = h.get("x-forwarded-host") || h.get("host") || "";
    if (host) return `${proto}://${host}`;
  } catch {
    /* no request context */
  }
  return "http://localhost:3000";
}

export interface NotifyResult {
  sent: number;
  /** Why nothing was sent, when sent is 0. */
  reason?: "no-api-key" | "no-subscribers" | "no-subscribers-table" | "nothing-pending" | "error";
}

/**
 * Sends a letter for every published writing that hasn't been mailed yet.
 * Safe to call often — it short-circuits when everything is already sent.
 */
export async function notifyPendingLetters(): Promise<NotifyResult> {
  if (!process.env.RESEND_API_KEY) {
    return { sent: 0, reason: "no-api-key" };
  }

  const supabase = await createClient();
  try {
    const { data: posts } = await supabase
      .from("posts")
      .select("title, slug, excerpt, category")
      .eq("published", true)
      .order("created_at", { ascending: false });

    const sent = await getSentSlugs(supabase);
    const pending = ((posts as { title: string; slug: string; excerpt: string | null; category: string }[]) ?? []).filter(
      (p) => p.slug && !sent[p.slug]
    );
    if (pending.length === 0) {
      return { sent: 0, reason: "nothing-pending" };
    }

    const { data: subs, error: subsError } = await supabase
      .from("newsletter_subscribers")
      .select("email");
    if (subsError) {
      return { sent: 0, reason: "no-subscribers-table" };
    }
    const recipients = [
      ...new Set(((subs as { email: string }[]) ?? []).map((s) => s.email).filter(Boolean)),
    ];
    if (recipients.length === 0) {
      return { sent: 0, reason: "no-subscribers" };
    }

    const baseUrl = await getBaseUrl();
    let total = 0;
    const delivered: string[] = [];
    for (const post of pending) {
      try {
        const { sent: sentCount } = await sendLetters(post, recipients, baseUrl);
        total += sentCount;
        delivered.push(post.slug);
      } catch {
        // Leave the slug unmarked — the next trigger retries this letter.
      }
    }

    if (delivered.length > 0) {
      await markSent(supabase, delivered);
    }
    return { sent: total, reason: delivered.length === 0 ? "error" : undefined };
  } catch {
    return { sent: 0, reason: "error" };
  }
}
