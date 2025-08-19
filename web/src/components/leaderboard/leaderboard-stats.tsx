/**
 * Leaderboard summary statistics
 */

import { StarIcon, CheckCircleIcon, BoltIcon } from '@/components/ui/icons';
import type { LeaderboardEntry, TimePeriod } from '@/types/competition';

interface LeaderboardStatsProps {
    leaderboard: LeaderboardEntry[];
    period: TimePeriod;
}

export function LeaderboardStats({ leaderboard, period }: LeaderboardStatsProps) {
    if (leaderboard.length === 0) return null;

    const topPlayer = leaderboard[0];
    const bestWinRate = Math.max(...leaderboard.map(p => p.winRate));
    const longestStreak = Math.max(...leaderboard.map(p => p.bestStreak));

    const getPeriodLabel = () => {
        switch (period) {
            case "today": return "Today's Champion";
            case "week": return "Weekly Leader";
            case "alltime": return "All-Time Legend";
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {/* Top Player */}
            <div className="text-center p-6 bg-gray-800 rounded-xl border border-gray-700">
                <div className="w-12 h-12 bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <StarIcon size={24} className="text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                    {topPlayer.username}
                </div>
                <div className="text-sm text-gray-400">
                    {getPeriodLabel()}
                </div>
            </div>

            {/* Best Win Rate */}
            <div className="text-center p-6 bg-gray-800 rounded-xl border border-gray-700">
                <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircleIcon size={24} className="text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                    {bestWinRate}%
                </div>
                <div className="text-sm text-gray-400">Best Win Rate</div>
            </div>

            {/* Longest Streak */}
            <div className="text-center p-6 bg-gray-800 rounded-xl border border-gray-700">
                <div className="w-12 h-12 bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BoltIcon size={24} className="text-orange-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                    {longestStreak}
                </div>
                <div className="text-sm text-gray-400">Longest Streak</div>
            </div>
        </div>
    );
}
