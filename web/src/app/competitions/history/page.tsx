"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type HistoricalCompetition = {
    id: number;
    title: string;
    slug: string;
    category: "finance" | "crypto";
    deadline_at: string;
    evaluation_end_at: string;
    winner?: {
        symbol: string;
        name: string;
        performance: number;
    };
};

export default function CompetitionHistoryPage() {
    const [competitions, setCompetitions] = useState<HistoricalCompetition[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            // Show past competitions (deadline has passed)
            const now = new Date().toISOString();
            const { data, error } = await supabase
                .from("competitions")
                .select(`
          id,
          title,
          slug,
          category,
          deadline_at,
          evaluation_end_at
        `)
                .lt("deadline_at", now)  // Less than now (past competitions)
                .order("deadline_at", { ascending: false })
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

    const getCategoryIcon = (category: "finance" | "crypto") => {
        if (category === "finance") {
            return (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            );
        }
        return (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
        );
    };

    const getCategoryColor = (category: "finance" | "crypto") => {
        return category === "finance"
            ? "bg-blue-100  text-blue-800  border-blue-200 "
            : "bg-orange-100  text-orange-800  border-orange-200 ";
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="container py-12">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-4 mb-6">
                    <Link
                        href="/competitions"
                        className="text-blue-600  hover:text-blue-700  font-medium flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Active Competitions
                    </Link>
                    <span className="text-gray-400 ">|</span>
                    <span className="text-gray-600  font-medium">History</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900  mb-4">
                    <span className="gradient-text">Competition History</span>
                </h1>
                <p className="text-xl text-gray-600  max-w-2xl mx-auto">
                    Browse past prediction contests and see which assets performed best.
                </p>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="space-y-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="card animate-pulse">
                            <div className="card-body">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-4 bg-gray-200  rounded w-16"></div>
                                        <div className="h-5 bg-gray-200  rounded w-48"></div>
                                    </div>
                                    <div className="h-4 bg-gray-200  rounded w-24"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-red-100  rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.168 13.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900  mb-2">Failed to load history</h3>
                    <p className="text-gray-600  mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn btn-primary"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Competitions List */}
            {!loading && !error && (
                <>
                    {competitions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100  rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-600 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900  mb-2">No past competitions</h3>
                            <p className="text-gray-600 ">Historical data will appear here after competitions end.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {competitions.map((competition) => (
                                <Link
                                    key={competition.id}
                                    href={`/competitions/${competition.slug}`}
                                    className="group block"
                                >
                                    <div className="card group-hover:shadow-md transition-all duration-200">
                                        <div className="card-body">
                                            <div className="flex items-center justify-between">
                                                {/* Left side - Competition info */}
                                                <div className="flex items-center gap-6">
                                                    {/* Category badge */}
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(competition.category)}`}>
                                                        {getCategoryIcon(competition.category)}
                                                        {competition.category === "finance" ? "Stocks" : "Crypto"}
                                                    </div>

                                                    {/* Title and date */}
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900  group-hover:text-blue-600  transition-colors duration-200">
                                                            {competition.title}
                                                        </h3>
                                                        <div className="text-sm text-gray-600 ">
                                                            Ended {formatDate(competition.deadline_at)}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right side - Winner info (placeholder for now) */}
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <div className="text-sm text-gray-500 ">Winner</div>
                                                        <div className="font-mono text-sm font-semibold text-gray-900 ">
                                                            To be calculated
                                                        </div>
                                                    </div>
                                                    <svg className="w-5 h-5 text-gray-400  group-hover:text-blue-600  group-hover:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
