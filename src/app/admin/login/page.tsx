"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isAdminUser } from "@/lib/supabase/authorization";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    // A valid password alone isn't enough: non-admin accounts would otherwise
    // ping-pong between /admin and this page with no explanation. Sign them
    // back out and say why.
    if (!isAdminUser(data.user)) {
      await supabase.auth.signOut();
      setError("This account doesn't have admin access.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-24">
      <p className="eyebrow text-center">Karutoki Studio</p>
      <h1 className="mt-2 text-center">Welcome back.</h1>
      <p className="body-text mt-2 text-center text-sm">Sign in to manage your writings.</p>

      <form onSubmit={handleSubmit} className="vintage-card mt-10 space-y-6 p-7">
        <div>
          <label className="eyebrow">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="field-underline mt-1"
          />
        </div>
        <div>
          <label className="eyebrow">Password</label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="field-underline mt-1"
          />
        </div>
        {error && <p className="font-sans text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={loading} className="btn-ink w-full justify-center disabled:opacity-50">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
