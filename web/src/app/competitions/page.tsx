"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Competition = {
  id: number;
  title: string;
  slug: string;
  category: "finance" | "crypto";
  deadline_at: string;
};

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("competitions")
        .select("id,title,slug,category,deadline_at")
        .order("deadline_at", { ascending: true })
        .limit(50);
      if (!cancelled) {
        setCompetitions(data ?? []);
        setError(error?.message ?? null);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Competitions</h1>
      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}
      <ul className="space-y-3">
        {competitions.map((c) => (
          <li key={c.id} className="border rounded p-3">
            <Link className="text-blue-600 underline" href={`/competitions/${c.slug}`}>
              {c.title}
            </Link>
            <div className="text-xs text-gray-600 mt-1">
              {c.category} · closes {new Date(c.deadline_at).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
