/**
 * Time period selector for leaderboard
 */

import { TIME_PERIODS } from '@/lib/constants';
import { SunIcon, CalendarIcon, StarIcon } from '@/components/ui/icons';
import type { TimePeriod } from '@/types/competition';

interface PeriodSelectorProps {
    selectedPeriod: TimePeriod;
    onPeriodChange: (period: TimePeriod) => void;
}

const PERIOD_ICONS = {
    today: SunIcon,
    week: CalendarIcon,
    alltime: StarIcon,
} as const;

export function PeriodSelector({ selectedPeriod, onPeriodChange }: PeriodSelectorProps) {
    const periods = Object.entries(TIME_PERIODS) as Array<[TimePeriod, typeof TIME_PERIODS[TimePeriod]]>;

    return (
        <div className="flex justify-center mb-8">
            <div className="inline-flex bg-gray-800 rounded-lg p-1">
                {periods.map(([period, config]) => {
                    const IconComponent = PERIOD_ICONS[period];
                    const isSelected = selectedPeriod === period;

                    return (
                        <button
                            key={period}
                            onClick={() => onPeriodChange(period)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isSelected
                                    ? "bg-gray-700 text-blue-400 shadow-sm"
                                    : "text-gray-300 hover:text-white"
                                }`}
                        >
                            <IconComponent size={20} />
                            {period === "today" ? "Today" : period === "week" ? "This Week" : "All Time"}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
