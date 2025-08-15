"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type UserPick = {
    id: number;
    competition: string;
    asset: string;
    assetName: string;
    prediction: number;
    actualPerformance: number | null;
    date: string;
    status: "pending" | "won" | "lost";
    rank?: number;
    totalParticipants?: number;
};

type UserStats = {
    username: string;
    totalPredictions: number;
    correctPredictions: number;
    winRate: number;
    bestStreak: number;
    currentStreak: number;
    totalScore: number;
    averageRank: number;
    joinDate: string;
};

export default function UserProfilePage({ params }: { params: { username: string } }) {
    const router = useRouter();
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [userPicks, setUserPicks] = useState<UserPick[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState<"all" | "won" | "lost" | "pending">("all");

    const username = decodeURIComponent(params.username);

    useEffect(() => {
        // Simulate loading user data
        const timer = setTimeout(() => {
            // Mock user stats
            setUserStats({
                username: username.charAt(0).toUpperCase() + username.slice(1),
                totalPredictions: 45,
                correctPredictions: 32,
                winRate: 71,
                bestStreak: 8,
                currentStreak: 3,
                totalScore: 2840,
                averageRank: 12,
                joinDate: "2024-01-15"
            });

            // Mock user picks
            setUserPicks([
                {
                    id: 1,
                    competition: "S&P 500 Best Tomorrow",
                    asset: "AAPL",
                    assetName: "Apple Inc.",
                    prediction: 2.5,
                    actualPerformance: 3.2,
                    date: "2024-01-25",
                    status: "won",
                    rank: 3,
                    totalParticipants: 156
                },
                {
                    id: 2,
                    competition: "Crypto Best Tomorrow",
                    asset: "BTC",
                    assetName: "Bitcoin",
                    prediction: 1.8,
                    actualPerformance: -0.5,
                    date: "2024-01-24",
                    status: "lost",
                    rank: 89,
                    totalParticipants: 134
                },
                {
                    id: 3,
                    competition: "S&P 500 Best Tomorrow",
                    asset: "TSLA",
                    assetName: "Tesla Inc.",
                    prediction: 4.1,
                    actualPerformance: 5.8,
                    date: "2024-01-23",
                    status: "won",
                    rank: 1,
                    totalParticipants: 167
                },
                {
                    id: 4,
                    competition: "Crypto Best Tomorrow",
                    asset: "ETH",
                    assetName: "Ethereum",
                    prediction: 3.2,
                    actualPerformance: null,
                    date: "2024-01-26",
                    status: "pending"
                },
                {
                    id: 5,
                    competition: "S&P 500 Best Tomorrow",
                    asset: "MSFT",
                    assetName: "Microsoft Corp.",
                    prediction: 1.9,
                    actualPerformance: 1.1,
                    date: "2024-01-22",
                    status: "lost",
                    rank: 78,
                    totalParticipants: 145
                },
                {
                    id: 6,
                    competition: "S&P 500 Best Tomorrow",
                    asset: "GOOGL",
                    assetName: "Alphabet Inc.",
                    prediction: 2.8,
                    actualPerformance: 4.2,
                    date: "2024-01-21",
                    status: "won",
                    rank: 8,
                    totalParticipants: 152
                }
            ]);

            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, [username]);

    const filteredPicks = userPicks.filter(pick => {
        if (selectedFilter === "all") return true;
        return pick.status === selectedFilter;
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "won":
                return <span className="text-green-500">✅</span>;
            case "lost":
                return <span className="text-red-500">❌</span>;
            case "pending":
                return <span className="text-yellow-500">⏳</span>;
            default:
                return null;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "won":
                return "bg-green-100  text-green-800  border-green-200 ";
            case "lost":
                return "bg-red-100  text-red-800  border-red-200 ";
            case "pending":
                return "bg-yellow-100  text-yellow-800  border-yellow-200 ";
            default:
                return "bg-gray-100  text-gray-800  border-gray-200 ";
        }
    };

    const getRankDisplay = (rank?: number, total?: number) => {
        if (!rank || !total) return null;
        if (rank === 1) return "🥇 #1";
        if (rank === 2) return "🥈 #2";
        if (rank === 3) return "🥉 #3";
        return `#${rank}`;
    };

    if (loading) {
        return (
            <div className="container py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="animate-pulse">
                        {/* Header skeleton */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-gray-200  rounded-full"></div>
                            <div>
                                <div className="h-8 bg-gray-200  rounded w-48 mb-2"></div>
                                <div className="h-4 bg-gray-200  rounded w-32"></div>
                            </div>
                        </div>

                        {/* Stats skeleton */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="card">
                                    <div className="card-body text-center">
                                        <div className="h-8 bg-gray-200  rounded w-16 mx-auto mb-2"></div>
                                        <div className="h-4 bg-gray-200  rounded w-20 mx-auto"></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Picks skeleton */}
                        <div className="card">
                            <div className="card-body space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-16 bg-gray-200  rounded"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!userStats) {
        return (
            <div className="container py-8">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="w-16 h-16 bg-red-100  rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-red-600 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.168 13.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900  mb-4">User Not Found</h1>
                    <p className="text-lg text-gray-600  mb-8">
                        We couldn't find a user with the username "{username}".
                    </p>
                    <Link href="/leaderboard" className="btn btn-primary">
                        Back to Leaderboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 text-gray-400  hover:text-gray-600  rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">
                                {userStats.username.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 ">
                                {userStats.username}
                            </h1>
                            <p className="text-gray-600 ">
                                Member since {new Date(userStats.joinDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="card text-center">
                        <div className="card-body">
                            <div className="text-2xl font-bold text-blue-600  mb-1">
                                {userStats.totalScore.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600 ">Total Score</div>
                        </div>
                    </div>

                    <div className="card text-center">
                        <div className="card-body">
                            <div className="text-2xl font-bold text-green-600  mb-1">
                                {userStats.winRate}%
                            </div>
                            <div className="text-sm text-gray-600 ">Win Rate</div>
                        </div>
                    </div>

                    <div className="card text-center">
                        <div className="card-body">
                            <div className="text-2xl font-bold text-orange-600  mb-1">
                                {userStats.currentStreak}
                            </div>
                            <div className="text-sm text-gray-600 ">Current Streak</div>
                        </div>
                    </div>

                    <div className="card text-center">
                        <div className="card-body">
                            <div className="text-2xl font-bold text-purple-600  mb-1">
                                #{userStats.averageRank}
                            </div>
                            <div className="text-sm text-gray-600 ">Avg Rank</div>
                        </div>
                    </div>
                </div>

                {/* Picks Section */}
                <div className="card">
                    <div className="card-header">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900 ">
                                Prediction History ({userStats.correctPredictions}/{userStats.totalPredictions})
                            </h2>

                            {/* Filter Buttons */}
                            <div className="flex gap-2">
                                {(["all", "won", "lost", "pending"] as const).map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setSelectedFilter(filter)}
                                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${selectedFilter === filter
                                            ? "bg-blue-100  text-blue-700 "
                                            : "text-gray-500  hover:text-gray-700 "
                                            }`}
                                    >
                                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="card-body p-0">
                        {filteredPicks.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-gray-400  mb-4">
                                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 ">No predictions found for this filter.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 ">
                                {filteredPicks.map((pick) => (
                                    <div key={pick.id} className="p-4 hover:bg-gray-50  transition-colors">
                                        <div className="flex items-center justify-between">
                                            {/* Left side - Pick info */}
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(pick.status)}
                                                    <div>
                                                        <div className="font-semibold text-gray-900 ">
                                                            {pick.asset} - {pick.assetName}
                                                        </div>
                                                        <div className="text-sm text-gray-600 ">
                                                            {pick.competition}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Center - Performance */}
                                            <div className="text-center">
                                                <div className="text-sm text-gray-500  mb-1">
                                                    Predicted: <span className="font-medium">+{pick.prediction}%</span>
                                                </div>
                                                {pick.actualPerformance !== null ? (
                                                    <div className={`text-sm font-medium ${pick.actualPerformance >= 0
                                                        ? "text-green-600 "
                                                        : "text-red-600 "
                                                        }`}>
                                                        Actual: {pick.actualPerformance >= 0 ? "+" : ""}{pick.actualPerformance}%
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-400 ">
                                                        Pending...
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right side - Result */}
                                            <div className="text-right">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(pick.status)}`}>
                                                    {pick.status.toUpperCase()}
                                                </div>
                                                {pick.rank && pick.totalParticipants && (
                                                    <div className="text-sm text-gray-600  mt-1">
                                                        {getRankDisplay(pick.rank, pick.totalParticipants)} of {pick.totalParticipants}
                                                    </div>
                                                )}
                                                <div className="text-xs text-gray-500  mt-1">
                                                    {new Date(pick.date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
