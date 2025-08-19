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

            {/* Scoring System Info */}
            <div className="mt-6 pt-4 border-t border-gray-700">
                <div className="text-xs text-gray-500 mb-2">Scoring System</div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="text-center">
                        <div className="text-yellow-400 font-bold">100</div>
                        <div className="text-gray-500">#1</div>
                    </div>
                    <div className="text-center">
                        <div className="text-gray-400 font-bold">60</div>
                        <div className="text-gray-500">#2</div>
                    </div>
                    <div className="text-center">
                        <div className="text-orange-400 font-bold">40</div>
                        <div className="text-gray-500">#3</div>
                    </div>
                    <div className="text-center">
                        <div className="text-blue-400 font-bold">25</div>
                        <div className="text-gray-500">#4</div>
                    </div>
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                    Points based on stock ranking
                </div>
            </div>
        </div>
    );
}
