import { createClient } from "@/lib/supabase/server";

export default async function TestDatabase() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

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