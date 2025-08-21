/**
 * Leaderboard data fetching hook
 * Handles leaderboard data with proper loading states
 */

import { useState, useEffect } from 'react';
import type { LeaderboardEntry, TimePeriod } from '@/types/competition';

interface UseLeaderboardResult {
    leaderboard: LeaderboardEntry[];
    loading: boolean;
    error: string | null;
}

// Mock data for different time periods - in a real app this would come from an API
const MOCK_LEADERBOARDS = {
    today: [
        { rank: 1, username: "TechTrader", score: 125, winRate: 92, bestStreak: 8 },
        { rank: 2, username: "MarketMaster", score: 118, winRate: 89, bestStreak: 6 },
        { rank: 3, username: "CryptoKing", score: 112, winRate: 87, bestStreak: 7 },
        { rank: 4, username: "BullRider", score: 108, winRate: 85, bestStreak: 5 },
        { rank: 5, username: "StockSeer", score: 102, winRate: 83, bestStreak: 4 },
        { rank: 6, username: "TradeWiz", score: 98, winRate: 81, bestStreak: 6 },
        { rank: 7, username: "InvestorPro", score: 95, winRate: 79, bestStreak: 3 },
        { rank: 8, username: "DataDriven", score: 92, winRate: 77, bestStreak: 5 },
    ],
    week: [
        { rank: 1, username: "MarketMaster", score: 890, winRate: 88, bestStreak: 15 },
        { rank: 2, username: "TechTrader", score: 875, winRate: 86, bestStreak: 12 },
        { rank: 3, username: "StockSeer", score: 850, winRate: 84, bestStreak: 11 },
        { rank: 4, username: "CryptoKing", score: 820, winRate: 82, bestStreak: 14 },
        { rank: 5, username: "BullRider", score: 795, winRate: 81, bestStreak: 9 },
        { rank: 6, username: "TradeWiz", score: 770, winRate: 79, bestStreak: 8 },
        { rank: 7, username: "InvestorPro", score: 745, winRate: 77, bestStreak: 7 },
        { rank: 8, username: "DataDriven", score: 720, winRate: 75, bestStreak: 6 },
    ],
    alltime: [
        { rank: 1, username: "MarketMaster", score: 12450, winRate: 87, bestStreak: 28 },
        { rank: 2, username: "StockSeer", score: 11980, winRate: 85, bestStreak: 25 },
        { rank: 3, username: "TechTrader", score: 11750, winRate: 84, bestStreak: 22 },
        { rank: 4, username: "CryptoKing", score: 11200, winRate: 82, bestStreak: 31 },
        { rank: 5, username: "BullRider", score: 10890, winRate: 81, bestStreak: 19 },
        { rank: 6, username: "TradeWiz", score: 10560, winRate: 79, bestStreak: 17 },
        { rank: 7, username: "InvestorPro", score: 10230, winRate: 78, bestStreak: 16 },
        { rank: 8, username: "DataDriven", score: 9890, winRate: 76, bestStreak: 15 },
    ]
} as const;

export function useLeaderboard(period: TimePeriod): UseLeaderboardResult {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        // Simulate API call
        const timer = setTimeout(() => {
            try {
                const data = MOCK_LEADERBOARDS[period];
                setLeaderboard(data);
            } catch (err) {
                setError('Failed to load leaderboard data');
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [period]);

    return {
        leaderboard,
        loading,
        error,
    };
}
