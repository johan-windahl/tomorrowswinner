/**
 * Score display component with ranking context
 */

interface ScoreDisplayProps {
    points: number;
    rank?: number;
    symbol?: string;
    changePercent?: number;
    totalStocks?: number;
    size?: 'sm' | 'md' | 'lg';
    showDetails?: boolean;
}

export function ScoreDisplay({
    points,
    rank,
    symbol,
    changePercent,
    totalStocks,
    size = 'md',
    showDetails = false
}: ScoreDisplayProps) {
    const sizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
    };

    const pointsSizeClasses = {
        sm: 'text-lg',
        md: 'text-xl',
        lg: 'text-2xl'
    };

    const getPointsColor = (points: number) => {
        if (points >= 60) return 'text-yellow-400';
        if (points >= 25) return 'text-green-400';
        if (points >= 10) return 'text-blue-400';
        if (points > 0) return 'text-gray-300';
        return 'text-gray-500';
    };

    const getRankEmoji = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        if (rank <= 5) return '🏆';
        if (rank <= 10) return '⭐';
        if (rank <= 16) return '📊';
        return '📉';
    };

    const getPerformanceMessage = (rank?: number, points?: number) => {
        if (!rank || !points) return null;

        if (rank === 1) return 'Perfect pick!';
        if (rank <= 3) return 'Excellent choice!';
        if (rank <= 5) return 'Great pick!';
        if (rank <= 10) return 'Good choice!';
        if (rank <= 16) return 'Nice participation!';
        return 'Better luck next time!';
    };

    return (
        <div className={`${sizeClasses[size]}`}>
            <div className="flex items-center gap-2">
                {rank && (
                    <span className="text-xl">{getRankEmoji(rank)}</span>
                )}
                <div className="flex-1">
                    <div className={`font-bold ${getPointsColor(points)} ${pointsSizeClasses[size]}`}>
                        {points} {points === 1 ? 'point' : 'points'}
                    </div>

                    {showDetails && rank && (
                        <div className="text-gray-400 text-sm">
                            {symbol && (
                                <span className="font-medium text-gray-300">{symbol}</span>
                            )}
                            {rank && (
                                <span className="ml-2">
                                    Rank #{rank}
                                    {totalStocks && ` of ${totalStocks}`}
                                </span>
                            )}
                            {changePercent !== undefined && (
                                <span className={`ml-2 ${changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {changePercent >= 0 ? '+' : ''}{(changePercent * 100).toFixed(2)}%
                                </span>
                            )}
                        </div>
                    )}

                    {showDetails && (
                        <div className="text-xs text-gray-500 mt-1">
                            {getPerformanceMessage(rank, points)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
