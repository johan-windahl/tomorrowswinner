"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Option = { id: number; symbol: string; name: string };

export default function CompetitionDetailPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const [title, setTitle] = useState<string>("");
    const [options, setOptions] = useState<Option[]>([]);
    const [message, setMessage] = useState<string | null>(null);
    const [loadingId, setLoadingId] = useState<number | null>(null);

    useEffect(() => {
        if (!slug) return;
        let cancelled = false;
        (async () => {
            const { data: comp, error } = await supabase
                .from("competitions")
                .select("id,title")
                .eq("slug", slug)
                .single();
            if (error || !comp) return setMessage(error?.message ?? "Not found");
            const { data: opts, error: err2 } = await supabase
                .from("options")
                .select("id,symbol,name")
                .eq("competition_id", comp.id)
                .order("symbol");
            if (!cancelled) {
                setTitle(comp.title);
                setOptions(opts ?? []);
                setMessage(err2?.message ?? null);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [slug]);

    async function submitGuess(optionId: number) {
        setLoadingId(optionId);
        setMessage(null);
        const { data: comp, error } = await supabase
            .from("competitions")
            .select("id,deadline_at")
            .eq("slug", slug)
            .single();
        if (error || !comp) {
            setLoadingId(null);
            return setMessage(error?.message ?? "Not found");
        }
        if (new Date() > new Date(comp.deadline_at)) {
            setLoadingId(null);
            return setMessage("Deadline passed");
        }

        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            setLoadingId(null);
            return setMessage("Not authenticated");
        }

        const { error: upsertErr } = await supabase.from("guesses").upsert(
            { user_id: user.id, competition_id: comp.id, option_id: optionId },
            { onConflict: "user_id,competition_id" }
        );
        setLoadingId(null);
        if (upsertErr) return setMessage(upsertErr.message);
        setMessage("Guess submitted");
    }

    return (
        <main className="p-8 space-y-4">
            <h1 className="text-2xl font-semibold">{title || "…"}</h1>
            {message && <div className="text-sm text-gray-700">{message}</div>}
            <ul className="space-y-2">
                {options.map((o) => (
                    <li key={o.id} className="flex items-center gap-2">
                        <span className="w-24 font-mono">{o.symbol}</span>
                        <span className="text-gray-700 flex-1">{o.name}</span>
                        <button
                            onClick={() => submitGuess(o.id)}
                            disabled={loadingId === o.id}
                            className="border px-3 py-1 rounded text-sm"
                        >
                            {loadingId === o.id ? "Submitting…" : "Guess"}
                        </button>
                    </li>
                ))}
            </ul>
        </main>
    );
}

