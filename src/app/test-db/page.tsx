import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/supabase/authorization";

export const dynamic = "force-dynamic";

// Internal connectivity check — admins only, so drafts never leak publicly.
export default async function TestDatabase() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user)) redirect("/admin/login");

  const { data, error } = await supabase
    .from("posts")
    .select("id, slug, title, category, published, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return (
      <main className="p-10">
        <h1>Database Error</h1>
        <p>{error.message}</p>
      </main>
    );
  }

  return (
    <main className="p-10">
      <h1>Supabase Connected 🎉</h1>

      <pre className="mt-6">
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}
