/**
 * Competition list item for history and other list views
 */

import Link from 'next/link';
import { timeUtils } from '@/lib/utils';
import { CategoryBadge } from '../ui/category-badge';
import { ArrowRightIcon } from '../ui/icons';
import type { Competition, HistoricalCompetition } from '@/types/competition';

interface CompetitionListItemProps {
    competition: Competition | HistoricalCompetition;
    showWinner?: boolean;
    className?: string;
}

export function CompetitionListItem({
    competition,
    showWinner = false,
    className = ""
}: CompetitionListItemProps) {
    const historicalCompetition = competition as HistoricalCompetition;

    return (
        <Link
            href={`/competitions/${competition.slug}`}
            className={`group block ${className}`}
        >
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 group-hover:shadow-xl group-hover:border-gray-600 transition-all duration-200">
                <div className="flex items-center justify-between">
                    {/* Left side - Competition info */}
                    <div className="flex items-center gap-6">
                        <CategoryBadge category={competition.category} />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-100 group-hover:text-blue-400 transition-colors duration-200">
                                {competition.title}
                            </h3>
                            <div className="text-sm text-gray-400">
                                Ended {timeUtils.formatHistoryDate(competition.deadline_at)}
                            </div>
                        </div>
                    </div>

                    {/* Right side - Winner info or action */}
                    <div className="flex items-center gap-4">
                        {showWinner && historicalCompetition.winner ? (
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Winner</div>
                                <div className="font-mono text-sm font-semibold text-gray-300">
                                    {historicalCompetition.winner.symbol}
                                </div>
                                <div className="text-xs text-green-400">
                                    +{historicalCompetition.winner.performance.toFixed(2)}%
                                </div>
                            </div>
                        ) : (
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Winner</div>
                                <div className="font-mono text-sm font-semibold text-gray-300">
                                    To be calculated
                                </div>
                            </div>
                        )}
                        <ArrowRightIcon
                            size={20}
                            className="text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-200"
                        />
                    </div>
                </div>
            </div>
        </Link>
    );
}
