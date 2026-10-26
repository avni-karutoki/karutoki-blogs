/**
 * The site clock: Indian time (IST / Asia/Kolkata), wherever the page is
 * rendered. Every user-facing date goes through here so the server
 * (UTC on Vercel) and every visitor's browser agree with India.
 */
export const SITE_TZ = "Asia/Kolkata";

export function formatDate(
  iso: string | number | Date,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: SITE_TZ, ...options }).format(
    new Date(iso),
  );
}
