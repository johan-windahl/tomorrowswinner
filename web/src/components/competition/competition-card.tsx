/**
 * Reusable competition card component
 * Used in competition listings and grids
 */

import Link from 'next/link';
import { timeUtils } from '@/lib/utils';
import { CategoryBadge } from '../ui/category-badge';
import { ClockIcon, ArrowRightIcon } from '../ui/icons';
import type { Competition } from '@/types/competition';

interface CompetitionCardProps {
    competition: Competition;
    showTimeRemaining?: boolean;
    className?: string;
}

export function CompetitionCard({
    competition,
    showTimeRemaining = true,
    className = ""
}: CompetitionCardProps) {
    return (
        <Link
            href={`/competitions/${competition.slug}`}
            className={`group block ${className}`}
        >
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 group-hover:shadow-xl group-hover:border-gray-600 transition-all duration-300 transform group-hover:-translate-y-1">
                {/* Header with category and time */}
                <div className="flex items-center justify-between mb-4">
                    <CategoryBadge category={competition.category} />
                    {showTimeRemaining && (
                        <div className="text-sm font-medium text-gray-400">
                            {timeUtils.getTimeRemaining(competition.deadline_at)}
                        </div>
                    )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-100 mb-3 group-hover:text-blue-400 transition-colors duration-200">
                    {competition.title}
                </h3>

                {/* Deadline */}
                <div className="flex items-center text-sm text-gray-400 mb-6">
                    <ClockIcon size={16} className="mr-2" />
                    Closes {timeUtils.formatDate(competition.deadline_at)}
                </div>

                {/* Action */}
                <div className="flex items-center justify-between">
                    <span className="text-blue-400 font-medium group-hover:text-blue-300 transition-colors duration-200">
                        Join Competition
                    </span>
                    <ArrowRightIcon
                        size={20}
                        className="text-blue-400 group-hover:translate-x-1 transition-transform duration-200"
                    />
                </div>
            </div>
        </Link>
    );
}
