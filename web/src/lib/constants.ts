/**
 * Application-wide constants
 * Centralized configuration values to avoid magic numbers and strings
 */

export const APP_CONFIG = {
    name: "Tomorrow's Winner",
    description: "Compete in daily stock and crypto prediction contests",

    // UI Configuration
    ui: {
        maxItemsPerPage: 50,
        loadingSkeletonCount: 8,
        cardAnimationDelay: 100, // ms between card animations
    },

    // API Configuration
    api: {
        batchSize: 25, // For Yahoo Finance API calls
        retryAttempts: 3,
        timeoutMs: 30000,
    },

    // Competition Configuration
    competition: {
        maxParticipants: 1000,
        minParticipants: 1,
        deadlineHour: 22, // 10 PM ET
    },

    // External URLs
    urls: {
        tradingViewBase: 'https://www.tradingview.com/symbols',
        clearbitLogo: 'https://logo.clearbit.com',
        uiAvatars: 'https://ui-avatars.com/api',
    },
} as const;

export const CATEGORY_CONFIG = {
    finance: {
        id: 'finance',
        label: 'Stocks',
        color: 'blue',
        bgClass: 'bg-blue-900',
        textClass: 'text-blue-300',
        borderClass: 'border-blue-700',
        icon: 'chart-bar',
    },
    crypto: {
        id: 'crypto',
        label: 'Crypto',
        color: 'orange',
        bgClass: 'bg-orange-900',
        textClass: 'text-orange-300',
        borderClass: 'border-orange-700',
        icon: 'currency-dollar',
    },
} as const;

export const RANK_CONFIG = {
    1: { emoji: '🥇', gradient: 'from-yellow-900/20 to-yellow-800/20', border: 'border-yellow-600' },
    2: { emoji: '🥈', gradient: 'from-gray-700/20 to-gray-600/20', border: 'border-gray-500' },
    3: { emoji: '🥉', gradient: 'from-orange-900/20 to-orange-800/20', border: 'border-orange-600' },
} as const;

export const TIME_PERIODS = {
    today: { label: "Today's Champions", icon: 'sun' },
    week: { label: "This Week's Leaders", icon: 'calendar' },
    alltime: { label: "All-Time Legends", icon: 'star' },
} as const;

// Domain mappings for better company logos
export const COMPANY_DOMAINS = {
    'GOOGL': 'alphabet.com',
    'GOOG': 'alphabet.com',
    'META': 'meta.com',
    'BRK.B': 'berkshirehathaway.com',
    'BRK.A': 'berkshirehathaway.com',
    'TSLA': 'tesla.com',
    'AAPL': 'apple.com',
    'MSFT': 'microsoft.com',
    'AMZN': 'amazon.com',
    'NVDA': 'nvidia.com',
} as const;
