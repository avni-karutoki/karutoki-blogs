/**
 * Administrative access is assigned server-side in Supabase Auth app metadata.
 * Never use user_metadata for authorization because a signed-in user can edit it.
 */
export function isAdminUser(
  user: { app_metadata?: Record<string, unknown> } | null | undefined,
) {
  return user?.app_metadata?.role === "admin";
}
