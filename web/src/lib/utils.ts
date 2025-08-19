/**
 * Shared utility functions
 * Common helpers used across the application
 */

import { CATEGORY_CONFIG, RANK_CONFIG, APP_CONFIG, COMPANY_DOMAINS } from './constants';
import type { CompetitionCategory } from '../types/competition';

/**
 * Time and Date Utilities
 */
export const timeUtils = {
    /**
     * Get time remaining until a deadline
     */
    getTimeRemaining(deadline: string): string {
        const now = new Date();
        const end = new Date(deadline);
        const diff = end.getTime() - now.getTime();

        if (diff <= 0) return "Ended";

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days}d ${hours % 24}h`;
        }

        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    },

    /**
     * Format date for display
     */
    formatDate(dateString: string, options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }): string {
        return new Date(dateString).toLocaleDateString('en-US', options);
    },

    /**
     * Format date for history display
     */
    formatHistoryDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },
};

/**
 * Category-related utilities
 */
export const categoryUtils = {
    /**
     * Get category configuration
     */
    getConfig(category: CompetitionCategory) {
        return CATEGORY_CONFIG[category];
    },

    /**
     * Get category color classes
     */
    getColorClasses(category: CompetitionCategory): string {
        const config = CATEGORY_CONFIG[category];
        return `${config.bgClass} ${config.textClass} ${config.borderClass}`;
    },

    /**
     * Get category label
     */
    getLabel(category: CompetitionCategory): string {
        return CATEGORY_CONFIG[category].label;
    },
};

/**
 * Ranking utilities
 */
export const rankUtils = {
    /**
     * Get rank display (emoji for top 3, #N for others)
     */
    getDisplay(rank: number): string {
        if (rank <= 3 && rank in RANK_CONFIG) {
            return RANK_CONFIG[rank as keyof typeof RANK_CONFIG].emoji;
        }
        return `#${rank}`;
    },

    /**
     * Get rank styling classes
     */
    getStyle(rank: number): string {
        if (rank <= 3 && rank in RANK_CONFIG) {
            const config = RANK_CONFIG[rank as keyof typeof RANK_CONFIG];
            return `bg-gradient-to-r ${config.gradient} ${config.border}`;
        }
        return "border-gray-600";
    },
};

/**
 * URL and asset utilities
 */
export const assetUtils = {
    /**
     * Generate TradingView URL
     */
    getTradingViewUrl(symbol: string, exchange = 'NASDAQ'): string {
        return `${APP_CONFIG.urls.tradingViewBase}/${encodeURIComponent(exchange)}-${encodeURIComponent(symbol)}/`;
    },

    /**
     * Generate company logo URL
     */
    getLogoUrl(symbol: string): string {
        const domain = COMPANY_DOMAINS[symbol as keyof typeof COMPANY_DOMAINS] ?? `${symbol}.com`.toLowerCase();
        return `${APP_CONFIG.urls.clearbitLogo}/${domain}`;
    },

    /**
     * Generate fallback avatar URL
     */
    getFallbackAvatarUrl(name: string, background = '374151', color = 'fff', size = 40): string {
        return `${APP_CONFIG.urls.uiAvatars}/?name=${encodeURIComponent(name)}&background=${background}&color=${color}&size=${size}`;
    },
};

/**
 * Number formatting utilities
 */
export const formatUtils = {
    /**
     * Format currency value
     */
    currency(value: number | null, decimals = 2): string {
        if (value === null || value === undefined) return '—';
        return `$${value.toFixed(decimals)}`;
    },

    /**
     * Format percentage value
     */
    percentage(value: number | null, decimals = 2): string {
        if (value === null || value === undefined) return '—';
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(decimals)}%`;
    },

    /**
     * Format large numbers with commas
     */
    number(value: number): string {
        return value.toLocaleString();
    },

    /**
     * Get percentage color class
     */
    getPercentageColorClass(value: number | null): string {
        if (value === null || value === undefined) return 'text-gray-500';
        return value >= 0 ? 'text-green-400' : 'text-red-400';
    },

    /**
     * Get win rate color class
     */
    getWinRateColorClass(winRate: number): string {
        if (winRate >= 85) return 'text-green-400';
        if (winRate >= 75) return 'text-yellow-400';
        return 'text-gray-400';
    },
};

/**
 * Array and data utilities
 */
export const dataUtils = {
    /**
     * Create array for loading skeletons
     */
    createSkeletonArray(count = APP_CONFIG.ui.loadingSkeletonCount): undefined[] {
        return Array.from({ length: count });
    },

    /**
     * Deduplicate array of objects by key
     */
    dedupeByKey<T>(array: T[], keyFn: (item: T) => string): T[] {
        const seen = new Set<string>();
        return array.filter(item => {
            const key = keyFn(item);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    },

    /**
     * Chunk array into smaller arrays
     */
    chunk<T>(array: T[], size: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    },
};

/**
 * CSS class utilities
 */
export const classUtils = {
    /**
     * Conditionally join class names
     */
    cn(...classes: (string | undefined | null | false)[]): string {
        return classes.filter(Boolean).join(' ');
    },

    /**
     * Get button variant classes
     */
    getButtonClasses(variant: 'primary' | 'outline' | 'ghost' = 'primary'): string {
        const base = 'px-4 py-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-50';

        switch (variant) {
            case 'primary':
                return `${base} bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg transform hover:scale-105`;
            case 'outline':
                return `${base} border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white`;
            case 'ghost':
                return `${base} text-gray-400 hover:text-white hover:bg-gray-800`;
            default:
                return base;
        }
    },
};
