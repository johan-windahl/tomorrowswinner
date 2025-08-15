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
      // Only show active and upcoming competitions (deadline not passed)
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("competitions")
        .select("id,title,slug,category,deadline_at")
        .gte("deadline_at", now)  // Greater than or equal to now
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

  const getCategoryIcon = (category: "finance" | "crypto") => {
    if (category === "finance") {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    }
    return (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    );
  };

  const getCategoryColor = (category: "finance" | "crypto") => {
    return category === "finance"
      ? "bg-blue-100 text-blue-800 border-blue-200"
      : "bg-orange-100 text-orange-800 border-orange-200";
  };

  const getTimeRemaining = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }

    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-6">
          <span className="text-gray-700  font-medium">Active Competitions</span>
          <span className="text-gray-400 ">|</span>
          <Link
            href="/competitions/history"
            className="text-blue-600  hover:text-blue-700  font-medium flex items-center gap-2"
          >
            History
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900  mb-4">
          <span className="gradient-text">Active Competitions</span>
        </h1>
        <p className="text-xl text-gray-600  max-w-2xl mx-auto">
          Join live prediction contests and test your market knowledge against traders worldwide.
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="card-body">
                <div className="h-4 bg-gray-200  rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200  rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200  rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.168 13.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load competitions</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Competitions Grid */}
      {!loading && !error && (
        <>
          {competitions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100  rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-600 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900  mb-2">No active competitions</h3>
              <p className="text-gray-600 ">Check back soon for new prediction contests!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {competitions.map((competition, index) => (
                <Link
                  key={competition.id}
                  href={`/competitions/${competition.slug}`}
                  className="group"
                >
                  <div className="card group-hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-1">
                    <div className="card-body">
                      {/* Category Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(competition.category)}`}>
                          {getCategoryIcon(competition.category)}
                          {competition.category === "finance" ? "Stocks" : "Crypto"}
                        </div>
                        <div className="text-sm font-medium text-gray-500">
                          {getTimeRemaining(competition.deadline_at)}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200">
                        {competition.title}
                      </h3>

                      {/* Deadline */}
                      <div className="flex items-center text-sm text-gray-600 mb-4">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Closes {new Date(competition.deadline_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>

                      {/* Action Button */}
                      <div className="flex items-center justify-between">
                        <span className="text-blue-600 font-medium group-hover:text-blue-700 transition-colors duration-200">
                          Join Competition
                        </span>
                        <svg className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center mt-16 py-12 bg-gradient-to-r from-blue-50  to-purple-50  rounded-2xl">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900  mb-4">
              Want to create your own competition?
            </h2>
            <p className="text-gray-600  mb-6 max-w-2xl mx-auto">
              Premium users can create custom prediction contests and invite friends to compete.
            </p>
            <Link href="/auth/sign-in" className="btn btn-primary">
              Learn More
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
