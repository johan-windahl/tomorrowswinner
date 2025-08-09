"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type User = {
  id: string;
  email?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!cancelled) {
        setUser(data.user ? { id: data.user.id, email: data.user.email ?? undefined } : null);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="p-8">
        <p>Loading…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-gray-600">You are not signed in.</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <div className="mt-4 space-y-2">
        <div className="text-sm text-gray-700">User ID: {user.id}</div>
        <div className="text-sm text-gray-700">Email: {user.email ?? "-"}</div>
      </div>
    </main>
  );
}
