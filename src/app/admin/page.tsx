import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--primary)]">
          Karutoki
        </p>

        <h1 className="mt-3 font-[var(--font-playfair)] text-5xl font-semibold">
          Admin Dashboard
        </h1>

        <p className="mt-4 text-[var(--foreground)]/60">
          Welcome back, {user.email}
        </p>

        <div className="mt-10 rounded-3xl border border-[var(--border)] p-8">
          <p className="font-[var(--font-playfair)] text-2xl">
            Your writing space ✍️
          </p>

          <p className="mt-2 text-sm text-[var(--foreground)]/60">
            Your posts, drafts and published writings will live here.
          </p>
        </div>
      </div>
    </main>
  );
}