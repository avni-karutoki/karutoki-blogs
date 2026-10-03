import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Cookie-free client for PUBLIC reads (posts, site_settings).
// The cookie-based client calls cookies(), which opts every page that uses
// it out of static rendering and ISR caching — forcing a live Supabase
// query on every single visit. Public content needs no session, so it
// must use this client to stay prerendered / cached.
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

// Use inside Server Components, Server Actions, and Route Handlers only.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll can be called from a Server Component during render,
            // where cookies can't be written. Safe to ignore when you have
            // middleware refreshing the session (see middleware.ts).
          }
        }
      }
    }
  );
}
