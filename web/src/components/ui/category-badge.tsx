/**
 * Reusable category badge component
 * Displays competition category with consistent styling
 */

import { categoryUtils } from '@/lib/utils';
import { ChartBarIcon, CurrencyDollarIcon } from './icons';
import type { CompetitionCategory } from '@/types/competition';

interface CategoryBadgeProps {
    category: CompetitionCategory;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function CategoryBadge({ category, size = 'md', className = "" }: CategoryBadgeProps) {
    const config = categoryUtils.getConfig(category);
    const colorClasses = categoryUtils.getColorClasses(category);

    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-2 text-base',
    };

    const iconSizes = {
        sm: 16,
        md: 20,
        lg: 24,
    };

    const IconComponent = category === 'finance' ? ChartBarIcon : CurrencyDollarIcon;

    return (
        <div className={`inline-flex items-center gap-2 rounded-full font-medium border ${colorClasses} ${sizeClasses[size]} ${className}`}>
            <IconComponent size={iconSizes[size]} />
            {config.label}
        </div>
    );
}
