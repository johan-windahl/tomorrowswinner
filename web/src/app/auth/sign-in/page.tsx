"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    setMessage(error ? error.message : "Check your email to confirm your account.");
  }

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    setMessage(error ? error.message : "Signed in.");
  }

  async function signOut() {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    setMessage(error ? error.message : "Signed out.");
  }

  return (
    <main className="p-8 max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      <form className="space-y-3" onSubmit={signIn}>
        <input
          type="email"
          placeholder="Email"
          className="border rounded px-3 py-2 w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border rounded px-3 py-2 w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="flex gap-2">
          <button disabled={loading} className="bg-black text-white px-4 py-2 rounded" type="submit">
            {loading ? "…" : "Sign in"}
          </button>
          <button disabled={loading} className="border px-4 py-2 rounded" onClick={signUp}>
            Sign up
          </button>
          <button disabled={loading} className="border px-4 py-2 rounded" type="button" onClick={signOut}>
            Sign out
          </button>
        </div>
      </form>
      {message && <p className="text-sm text-gray-600 mt-4">{message}</p>}
    </main>
  );
}
