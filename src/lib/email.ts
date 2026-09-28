/**
 * Sends letters through Resend (https://resend.com).
 * Needs RESEND_API_KEY in .env.local. RESEND_FROM is optional
 * (defaults to Resend's test sender — note it only delivers to your own
 * address until you verify a domain).
 */

interface LetterPost {
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function letterHtml(post: LetterPost, baseUrl: string): string {
  const url = `${baseUrl.replace(/\/$/, "")}/writings/${post.slug}`;
  return `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1c1a16;">
      <p style="font-size: 12px; letter-spacing: 3px; text-transform: uppercase; color: #9a6a4f;">Karutoki · a new writing</p>
      <h1 style="font-size: 30px; margin: 8px 0;">${escapeHtml(post.title)}</h1>
      ${post.excerpt ? `<p style="font-style: italic; color: #555;">“${escapeHtml(post.excerpt)}”</p>` : ""}
      <a href="${url}" style="display: inline-block; margin-top: 16px; padding: 12px 28px; border-radius: 999px; background: #1c1a16; color: #f4efe3; text-decoration: none; font-size: 14px;">Read it →</a>
      <p style="margin-top: 24px; font-size: 12px; color: #999;">Words for the things left unsaid.</p>
    </div>
  `;
}

export async function sendLetters(
  post: LetterPost,
  recipients: string[],
  baseUrl: string
): Promise<{ sent: number; failed: number }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set.");
  const from = process.env.RESEND_FROM || "Karutoki <onboarding@resend.dev>";

  let sent = 0;
  let failed = 0;
  // Resend batch endpoint takes max 100 messages per call.
  for (let i = 0; i < recipients.length; i += 100) {
    const chunk = recipients.slice(i, i + 100);
    const res = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        chunk.map((to) => ({
          from,
          to,
          subject: `${post.title} — Karutoki`,
          html: letterHtml(post, baseUrl),
        }))
      ),
    });
    if (!res.ok) {
      failed += chunk.length;
    } else {
      sent += chunk.length;
    }
  }
  return { sent, failed };
}
