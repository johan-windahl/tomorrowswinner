/**
 * Achievements display component
 */

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt: string;
}

interface AchievementsCardProps {
    achievements: Achievement[];
    onViewAll?: () => void;
}

export function AchievementsCard({ achievements, onViewAll }: AchievementsCardProps) {
    return (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Recent Achievements</h3>
            <div className="space-y-3">
                {achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-sm">{achievement.icon}</span>
                        </div>
                        <div>
                            <div className="font-medium text-gray-100">{achievement.title}</div>
                            <div className="text-xs text-gray-400">{achievement.description}</div>
                        </div>
                    </div>
                ))}
                {achievements.length === 0 && (
                    <div className="text-center py-4">
                        <div className="text-gray-500 mb-2">🎯</div>
                        <div className="text-sm text-gray-400">No achievements yet</div>
                        <div className="text-xs text-gray-500">Start making predictions to unlock achievements!</div>
                    </div>
                )}
                {onViewAll && achievements.length > 0 && (
                    <div className="text-center mt-4">
                        <button
                            onClick={onViewAll}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium rounded-lg transition-colors duration-200"
                        >
                            View All Achievements
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
