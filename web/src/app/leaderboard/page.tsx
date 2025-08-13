"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type TimePeriod = "today" | "week" | "alltime";

type LeaderboardEntry = {
  rank: number;
  username: string;
  score: number;
  winRate: number;
  totalPredictions: number;
  correctPredictions: number;
  bestStreak: number;
};

export default function LeaderboardPage() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("today");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [selectedPeriod]);

  // Mock data for different time periods
  const mockLeaderboards = {
    today: [
      { rank: 1, username: "TechTrader", score: 125, winRate: 92, totalPredictions: 12, correctPredictions: 11, bestStreak: 8 },
      { rank: 2, username: "MarketMaster", score: 118, winRate: 89, totalPredictions: 9, correctPredictions: 8, bestStreak: 6 },
      { rank: 3, username: "CryptoKing", score: 112, winRate: 87, totalPredictions: 15, correctPredictions: 13, bestStreak: 7 },
      { rank: 4, username: "BullRider", score: 108, winRate: 85, totalPredictions: 13, correctPredictions: 11, bestStreak: 5 },
      { rank: 5, username: "StockSeer", score: 102, winRate: 83, totalPredictions: 11, correctPredictions: 9, bestStreak: 4 },
      { rank: 6, username: "TradeWiz", score: 98, winRate: 81, totalPredictions: 16, correctPredictions: 13, bestStreak: 6 },
      { rank: 7, username: "InvestorPro", score: 95, winRate: 79, totalPredictions: 14, correctPredictions: 11, bestStreak: 3 },
      { rank: 8, username: "DataDriven", score: 92, winRate: 77, totalPredictions: 10, correctPredictions: 8, bestStreak: 5 },
    ],
    week: [
      { rank: 1, username: "MarketMaster", score: 890, winRate: 88, totalPredictions: 67, correctPredictions: 59, bestStreak: 15 },
      { rank: 2, username: "TechTrader", score: 875, winRate: 86, totalPredictions: 72, correctPredictions: 62, bestStreak: 12 },
      { rank: 3, username: "StockSeer", score: 850, winRate: 84, totalPredictions: 64, correctPredictions: 54, bestStreak: 11 },
      { rank: 4, username: "CryptoKing", score: 820, winRate: 82, totalPredictions: 78, correctPredictions: 64, bestStreak: 14 },
      { rank: 5, username: "BullRider", score: 795, winRate: 81, totalPredictions: 69, correctPredictions: 56, bestStreak: 9 },
      { rank: 6, username: "TradeWiz", score: 770, winRate: 79, totalPredictions: 71, correctPredictions: 56, bestStreak: 8 },
      { rank: 7, username: "InvestorPro", score: 745, winRate: 77, totalPredictions: 65, correctPredictions: 50, bestStreak: 7 },
      { rank: 8, username: "DataDriven", score: 720, winRate: 75, totalPredictions: 60, correctPredictions: 45, bestStreak: 6 },
    ],
    alltime: [
      { rank: 1, username: "MarketMaster", score: 12450, winRate: 87, totalPredictions: 892, correctPredictions: 776, bestStreak: 28 },
      { rank: 2, username: "StockSeer", score: 11980, winRate: 85, totalPredictions: 856, correctPredictions: 728, bestStreak: 25 },
      { rank: 3, username: "TechTrader", score: 11750, winRate: 84, totalPredictions: 823, correctPredictions: 691, bestStreak: 22 },
      { rank: 4, username: "CryptoKing", score: 11200, winRate: 82, totalPredictions: 945, correctPredictions: 775, bestStreak: 31 },
      { rank: 5, username: "BullRider", score: 10890, winRate: 81, totalPredictions: 789, correctPredictions: 639, bestStreak: 19 },
      { rank: 6, username: "TradeWiz", score: 10560, winRate: 79, totalPredictions: 734, correctPredictions: 580, bestStreak: 17 },
      { rank: 7, username: "InvestorPro", score: 10230, winRate: 78, totalPredictions: 712, correctPredictions: 555, bestStreak: 16 },
      { rank: 8, username: "DataDriven", score: 9890, winRate: 76, totalPredictions: 698, correctPredictions: 530, bestStreak: 15 },
    ]
  };

  const currentLeaderboard = mockLeaderboards[selectedPeriod];

  const getPeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case "today": return "Today's Champions";
      case "week": return "This Week's Leaders";
      case "alltime": return "All-Time Legends";
    }
  };

  const getPeriodIcon = (period: TimePeriod) => {
    switch (period) {
      case "today":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case "week":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case "alltime":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
    }
  };

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700";
    if (rank === 2) return "bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700/30 dark:to-gray-600/20 border-gray-200 dark:border-gray-600";
    if (rank === 3) return "bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/20 border-orange-200 dark:border-orange-700";
    return "border-gray-200 dark:border-gray-700";
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          <span className="gradient-text">Global Leaderboards</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          See who made the best predictions across all competitions. Rankings based on accuracy and performance.
        </p>
      </div>

      {/* Period Selector */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(["today", "week", "alltime"] as TimePeriod[]).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${selectedPeriod === period
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
            >
              {getPeriodIcon(period)}
              {period === "today" ? "Today" : period === "week" ? "This Week" : "All Time"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {/* Period Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {getPeriodLabel(selectedPeriod)}
          </h2>
        </div>

        {/* Leaderboard */}
        <div className="card overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-12 gap-4 items-center text-sm font-medium text-gray-700 dark:text-gray-300">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-3">Player</div>
              <div className="col-span-2 text-center">Score</div>
              <div className="col-span-2 text-center">Win Rate</div>
              <div className="col-span-2 text-center">Predictions</div>
              <div className="col-span-2 text-center">Best Streak</div>
            </div>
          </div>

          {/* Entries */}
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {loading ? (
              // Loading skeletons
              [...Array(8)].map((_, i) => (
                <div key={i} className="px-4 py-3 animate-pulse">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-1 flex justify-center">
                      <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                    <div className="col-span-2 text-center">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto"></div>
                    </div>
                    <div className="col-span-2 text-center">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto"></div>
                    </div>
                    <div className="col-span-2 text-center">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto"></div>
                    </div>
                    <div className="col-span-2 text-center">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              currentLeaderboard.map((player) => (
                <div
                  key={player.rank}
                  onClick={() => router.push(`/users/${player.username.toLowerCase()}`)}
                  className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150 border-l-4 cursor-pointer ${getRankStyle(player.rank)}`}
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Rank */}
                    <div className="col-span-1 text-center">
                      <span className="text-lg font-bold">
                        {getRankDisplay(player.rank)}
                      </span>
                    </div>

                    {/* Player */}
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {player.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                          {player.username}
                        </div>
                        {player.rank <= 3 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Top Performer
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="col-span-2 text-center">
                      <div className="font-bold text-blue-600 dark:text-blue-400">
                        {player.score.toLocaleString()}
                      </div>
                    </div>

                    {/* Win Rate */}
                    <div className="col-span-2 text-center">
                      <div className={`font-semibold ${player.winRate >= 85
                        ? "text-green-600 dark:text-green-400"
                        : player.winRate >= 75
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-gray-600 dark:text-gray-400"
                        }`}>
                        {player.winRate}%
                      </div>
                    </div>

                    {/* Predictions */}
                    <div className="col-span-2 text-center">
                      <div className="text-gray-900 dark:text-gray-100 font-medium">
                        {player.correctPredictions}/{player.totalPredictions}
                      </div>
                    </div>

                    {/* Best Streak */}
                    <div className="col-span-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-orange-500">🔥</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {player.bestStreak}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {currentLeaderboard[0]?.username || "Loading..."}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {selectedPeriod === "today" ? "Today's Champion" : selectedPeriod === "week" ? "Weekly Leader" : "All-Time Legend"}
            </div>
          </div>

          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {currentLeaderboard[0]?.winRate || 0}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Best Win Rate</div>
          </div>

          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {Math.max(...currentLeaderboard.map(p => p.bestStreak))}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Longest Streak</div>
          </div>
        </div>
      </div>
    </div>
  );
}