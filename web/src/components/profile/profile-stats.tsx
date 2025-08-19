/**
 * Profile statistics component
 */

interface UserStats {
    totalPredictions: number;
    accuracyRate: number;
    currentStreak: number;
    bestStreak: number;
}

interface ProfileStatsProps {
    stats: UserStats;
}

export function ProfileStats({ stats }: ProfileStatsProps) {
    return (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Your Stats</h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Predictions</span>
                    <span className="font-semibold text-gray-100">{stats.totalPredictions}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">Accuracy Rate</span>
                    <span className="font-semibold text-green-400">{stats.accuracyRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">Current Streak</span>
                    <span className="font-semibold text-blue-400">{stats.currentStreak} days</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">Best Streak</span>
                    <span className="font-semibold text-purple-400">{stats.bestStreak} days</span>
                </div>
            </div>
        </div>
    );
}
