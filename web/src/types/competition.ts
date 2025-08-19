/**
 * Shared type definitions for competitions
 */

export type CompetitionCategory = 'finance' | 'crypto';

export type CompetitionStatus = 'upcoming' | 'active' | 'closed' | 'ended';

export interface Competition {
    id: number;
    title: string;
    slug: string;
    category: CompetitionCategory;
    deadline_at: string;
    start_at?: string;
    evaluation_start_at?: string;
    evaluation_end_at?: string;
    closed_at?: string | null;
    timezone?: string;
}

export interface CompetitionOption {
    id: number;
    symbol: string;
    name: string | null;
    competition_id: number;
    metadata?: Record<string, unknown>;
    coin_id?: string; // For crypto competitions
}

export interface EnrichedCompetitionItem {
    id: number;
    symbol: string;
    name: string | null;
    lastClose: number | null;
    pctPrevDay: number | null;
    logoUrl: string;
    tradingViewUrl: string;
}

export interface CompetitionGuess {
    id?: number;
    user_id: string;
    competition_id: number;
    option_id: number;
    created_at?: string;
}

export interface HistoricalCompetition extends Competition {
    winner?: {
        symbol: string;
        name: string;
        performance: number;
    };
}

export interface LeaderboardEntry {
    rank: number;
    username: string;
    score: number;
    winRate: number;
    totalPredictions: number;
    correctPredictions: number;
    bestStreak: number;
}

export type TimePeriod = 'today' | 'week' | 'alltime';

export type SortKey = 'symbol' | 'price' | 'pct';
export type SortDirection = 'asc' | 'desc';

export type AuthMode = 'signin' | 'signup';

export interface User {
    id: string;
    email?: string;
    displayName?: string;
    avatarUrl?: string;
    avatarType?: 'upload' | 'preset';
}

export interface UserProfileUpdate {
    displayName?: string;
    avatarUrl?: string;
    avatarType?: 'upload' | 'preset';
}
