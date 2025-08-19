/**
 * Competition results display with ranking information
 */

// Ranking results display component

interface StockPerformance {
    rank: number;
    symbol: string;
    changePercent: number;
    points: number;
}

interface UserResult {
    rank: number;
    symbol: string;
    points: number;
    changePercent: number;
}

interface RankingResultsProps {
    topPerformers: StockPerformance[];
    userResult?: UserResult;
    totalParticipants?: number;
    scoringRate?: number;
}

export function RankingResults({
    topPerformers,
    userResult,
    totalParticipants,
    scoringRate
}: RankingResultsProps) {
    const getRankEmoji = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        if (rank <= 5) return '🏆';
        if (rank <= 10) return '⭐';
        return '📊';
    };

    const getRankColor = (rank: number) => {
        if (rank === 1) return 'text-yellow-400';
        if (rank === 2) return 'text-gray-400';
        if (rank === 3) return 'text-orange-400';
        if (rank <= 5) return 'text-blue-400';
        if (rank <= 10) return 'text-green-400';
        return 'text-gray-500';
    };

    const getPointsColor = (points: number) => {
        if (points >= 60) return 'text-yellow-400 font-bold';
        if (points >= 25) return 'text-green-400 font-semibold';
        if (points >= 10) return 'text-blue-400';
        if (points > 0) return 'text-gray-300';
        return 'text-gray-500';
    };

    return (
        <div className="space-y-6">
            {/* User Result Banner */}
            {userResult && (
                <div className={`rounded-lg p-6 border-2 ${userResult.points > 0
                        ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30'
                        : 'bg-gray-800/50 border-gray-600/30'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{getRankEmoji(userResult.rank)}</span>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-100">Your Result</h3>
                                <p className="text-gray-300">
                                    <span className="font-medium">{userResult.symbol}</span> finished
                                    <span className={`ml-1 font-bold ${getRankColor(userResult.rank)}`}>
                                        #{userResult.rank}
                                    </span>
                                    {userResult.changePercent >= 0 ? (
                                        <span className="text-green-400 ml-2">
                                            +{(userResult.changePercent * 100).toFixed(2)}%
                                        </span>
                                    ) : (
                                        <span className="text-red-400 ml-2">
                                            {(userResult.changePercent * 100).toFixed(2)}%
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`text-2xl font-bold ${getPointsColor(userResult.points)}`}>
                                {userResult.points} pts
                            </div>
                            {userResult.points > 0 && (
                                <p className="text-sm text-gray-400">
                                    {userResult.rank <= 5 ? 'Excellent!' :
                                        userResult.rank <= 10 ? 'Great job!' :
                                            'Good participation!'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Competition Statistics */}
            {totalParticipants && scoringRate !== undefined && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <div className="text-2xl font-bold text-gray-100">{totalParticipants}</div>
                        <div className="text-sm text-gray-400">Total Participants</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <div className="text-2xl font-bold text-green-400">{scoringRate.toFixed(1)}%</div>
                        <div className="text-sm text-gray-400">Earned Points</div>
                    </div>
                </div>
            )}

            {/* Top Performers Table */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-100">Today's Top Performers</h3>
                    <p className="text-sm text-gray-400">See how all stocks ranked and what points they earned</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-700/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Rank
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Symbol
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Change
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Points
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {topPerformers.map((stock) => (
                                <tr
                                    key={stock.symbol}
                                    className={`hover:bg-gray-700/30 ${userResult?.symbol === stock.symbol ? 'bg-blue-900/20' : ''
                                        }`}
                                >
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{getRankEmoji(stock.rank)}</span>
                                            <span className={`font-medium ${getRankColor(stock.rank)}`}>
                                                #{stock.rank}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="font-medium text-gray-100">{stock.symbol}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right">
                                        {stock.changePercent >= 0 ? (
                                            <span className="text-green-400 font-medium">
                                                +{(stock.changePercent * 100).toFixed(2)}%
                                            </span>
                                        ) : (
                                            <span className="text-red-400 font-medium">
                                                {(stock.changePercent * 100).toFixed(2)}%
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right">
                                        <span className={`font-medium ${getPointsColor(stock.points)}`}>
                                            {stock.points}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Scoring System Explanation */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-6 border border-gray-600">
                <h3 className="text-lg font-semibold text-gray-100 mb-3">How Scoring Works</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                        <div className="text-yellow-400 font-bold text-lg">100</div>
                        <div className="text-gray-300">Rank #1</div>
                    </div>
                    <div className="text-center">
                        <div className="text-gray-400 font-bold text-lg">60</div>
                        <div className="text-gray-300">Rank #2</div>
                    </div>
                    <div className="text-center">
                        <div className="text-orange-400 font-bold text-lg">40</div>
                        <div className="text-gray-300">Rank #3</div>
                    </div>
                    <div className="text-center">
                        <div className="text-blue-400 font-bold text-lg">25</div>
                        <div className="text-gray-300">Rank #4</div>
                    </div>
                </div>
                <p className="text-gray-400 text-sm mt-4 text-center">
                    Points decrease gradually down to rank #16 (1 point). Ranks #17+ earn 0 points.
                </p>
            </div>
        </div>
    );
}
