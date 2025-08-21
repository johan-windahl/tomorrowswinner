/**
 * Leaderboard table component
 */

import { useRouter } from 'next/navigation';
import { rankUtils, formatUtils } from '@/lib/utils';
import { LeaderboardSkeleton } from '@/components/ui/loading-states';
import { Tooltip } from '@/components/ui/tooltip';
import type { LeaderboardEntry } from '@/types/competition';

interface LeaderboardTableProps {
    leaderboard: LeaderboardEntry[];
    loading: boolean;
}

/**
 * Table header component to avoid duplication
 */
function LeaderboardTableHeader() {
    return (
        <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
            <div className="grid grid-cols-12 gap-4 items-center text-sm font-medium text-gray-300">
                <div className="col-span-1 text-center">Rank</div>
                <div className="col-span-4">Player</div>
                <div className="col-span-2 text-center">
                    <Tooltip content="Total points earned. Rank #1 = 100pts, #2 = 60pts, #3 = 40pts, etc.">
                        <span className="cursor-help">Score</span>
                    </Tooltip>
                </div>
                <div className="col-span-2 text-center">
                    <Tooltip content="Percentage of competitions where you earned points (not just won)">
                        <span className="cursor-help">Win Rate</span>
                    </Tooltip>
                </div>
                <div className="col-span-3 text-center">
                    <Tooltip content="Longest consecutive streak of earning points in competitions">
                        <span className="cursor-help">Best Streak</span>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}

export function LeaderboardTable({ leaderboard, loading }: LeaderboardTableProps) {
    const router = useRouter();

    if (loading) {
        return (
            <div className="card">
                <LeaderboardTableHeader />
                <div className="divide-y divide-gray-700">
                    <LeaderboardSkeleton />
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <LeaderboardTableHeader />

            {/* Entries */}
            <div className="divide-y divide-gray-700">
                {leaderboard.map((player) => (
                    <div
                        key={player.rank}
                        onClick={() => router.push(`/users/${player.username.toLowerCase()}`)}
                        className={`px-4 py-3 hover:bg-gray-800 transition-colors duration-150 border-l-4 cursor-pointer ${rankUtils.getStyle(player.rank)}`}
                    >
                        <div className="grid grid-cols-12 gap-4 items-center">
                            {/* Rank */}
                            <div className="col-span-1 text-center">
                                <span className="text-lg font-bold">
                                    {rankUtils.getDisplay(player.rank)}
                                </span>
                            </div>

                            {/* Player */}
                            <div className="col-span-4 flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                    {player.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-semibold text-white text-sm">
                                        {player.username}
                                    </div>
                                    {player.rank <= 3 && (
                                        <div className="text-xs text-gray-400">
                                            Top Performer
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Score */}
                            <div className="col-span-2 text-center">
                                <div className="font-bold text-blue-400">
                                    {formatUtils.number(player.score)}
                                </div>
                            </div>

                            {/* Win Rate */}
                            <div className="col-span-2 text-center">
                                <div className={`font-semibold ${formatUtils.getWinRateColorClass(player.winRate)}`}>
                                    {player.winRate}%
                                </div>
                            </div>

                            {/* Best Streak */}
                            <div className="col-span-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                    <span className="text-orange-500">🔥</span>
                                    <span className="font-semibold text-white">
                                        {player.bestStreak}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
