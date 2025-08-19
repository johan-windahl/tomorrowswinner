/**
 * Competition Configuration System
 * 
 * This module defines the rules, timing, and parameters for each competition type.
 * These configurations are used across the UI and API endpoints for consistency.
 */

export type CompetitionPhase = 'setup' | 'voting' | 'closed' | 'evaluation' | 'ended';

export interface CompetitionTiming {
    /** When the competition starts (voting opens) */
    startAt: string;
    /** When voting closes */
    deadlineAt: string;
    /** When evaluation period starts */
    evaluationStartAt: string;
    /** When evaluation period ends */
    evaluationEndAt: string;
    /** Timezone for all times */
    timezone: string;
}

export interface CompetitionRules {
    /** Points awarded for correct prediction */
    correctPoints: number;
    /** Points awarded for incorrect prediction */
    incorrectPoints: number;
    /** Whether ties are allowed (multiple winners) */
    allowTies: boolean;
    /** How winners are determined */
    winnerCriteria: 'highest_change' | 'lowest_change' | 'highest_volume';
    /** Minimum number of participants required */
    minParticipants?: number;
}

export interface CompetitionConfig {
    /** Unique identifier for competition type */
    id: string;
    /** Display name */
    name: string;
    /** Competition category */
    category: 'crypto' | 'finance';
    /** Description for users */
    description: string;
    /** Competition rules */
    rules: CompetitionRules;
    /** Whether this competition runs on weekends */
    runsOnWeekends: boolean;
    /** Data sources and refresh requirements */
    dataSources: {
        /** What data needs to be fetched before competition starts */
        required: string[];
        /** How often data should be refreshed during competition */
        refreshInterval?: string;
    };
}

/**
 * Get Eastern Time parts for a given date
 */
function etParts(d: Date) {
    const tz = 'America/New_York';
    const fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZoneName: 'shortOffset',
    });
    const parts = fmt.formatToParts(d);
    const y = parts.find((p) => p.type === 'year')?.value ?? '1970';
    const m = parts.find((p) => p.type === 'month')?.value ?? '01';
    const dd = parts.find((p) => p.type === 'day')?.value ?? '01';
    const tzName = parts.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT-04';
    const match = tzName.match(/GMT([+-])(\d{1,2})/);
    const sign = match ? match[1] : '-';
    const hh = match ? match[2].padStart(2, '0') : '04';
    const offset = `${sign}${hh}:00`;
    return { y, m, dd, offset };
}

/**
 * Check if a date is a weekday (Monday-Friday)
 */
function isWeekday(date: Date): boolean {
    const day = date.getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday
    return day >= 1 && day <= 5;
}

/**
 * Generate competition timing for tomorrow
 */
export function generateCompetitionTiming(): CompetitionTiming {
    const now = new Date();
    const today = etParts(now);
    const todayDate = new Date(`${today.y}-${today.m}-${today.dd}T00:00:00${today.offset}`);
    const tomorrowDate = new Date(todayDate.getTime() + 24 * 60 * 60 * 1000);
    const tmr = etParts(tomorrowDate);

    return {
        startAt: `${tmr.y}-${tmr.m}-${tmr.dd}T00:00:00${tmr.offset}`,
        deadlineAt: `${today.y}-${today.m}-${today.dd}T22:00:00${today.offset}`, // 10 PM today
        evaluationStartAt: `${tmr.y}-${tmr.m}-${tmr.dd}T00:00:00${tmr.offset}`,
        evaluationEndAt: `${tmr.y}-${tmr.m}-${tmr.dd}T23:59:59${tmr.offset}`,
        timezone: 'America/New_York',
    };
}

/**
 * Generate competition slug for a given date
 */
export function generateCompetitionSlug(competitionId: string, date: Date): string {
    const { y, m, dd } = etParts(date);
    return `${competitionId}-${y}-${m}-${dd}`;
}

/**
 * Check if competition should run on given date
 */
export function shouldRunCompetition(config: CompetitionConfig, date: Date): boolean {
    if (config.runsOnWeekends) {
        return true; // Always run (crypto)
    }
    return isWeekday(date); // Only weekdays (stocks)
}

// Competition Configurations
export const COMPETITION_CONFIGS: Record<string, CompetitionConfig> = {
    crypto: {
        id: 'crypto',
        name: 'Crypto Best Performer',
        category: 'crypto',
        description: 'Predict which cryptocurrency will have the highest percentage gain in the next 24 hours.',
        rules: {
            correctPoints: 100,
            incorrectPoints: 0,
            allowTies: true,
            winnerCriteria: 'highest_change',
            minParticipants: 1,
        },
        runsOnWeekends: true, // Crypto markets are 24/7
        dataSources: {
            required: ['crypto_prices', 'crypto_metadata'],
            refreshInterval: '4h', // Refresh every 4 hours
        },
    },
    stocks: {
        id: 'stocks',
        name: 'Nasdaq 100 Best Performer',
        category: 'finance',
        description: 'Predict which Nasdaq 100 stock will have the highest percentage gain during market hours.',
        rules: {
            correctPoints: 100,
            incorrectPoints: 0,
            allowTies: true,
            winnerCriteria: 'highest_change',
            minParticipants: 1,
        },
        runsOnWeekends: false, // Stock markets are closed on weekends
        dataSources: {
            required: ['stock_prices', 'nasdaq100_constituents'],
            refreshInterval: '1d', // Refresh daily
        },
    },
};

/**
 * Get competition configuration by ID
 */
export function getCompetitionConfig(id: string): CompetitionConfig | null {
    return COMPETITION_CONFIGS[id] || null;
}

/**
 * Get all available competition configurations
 */
export function getAllCompetitionConfigs(): CompetitionConfig[] {
    return Object.values(COMPETITION_CONFIGS);
}

/**
 * Determine current competition phase based on timing
 */
export function getCompetitionPhase(timing: CompetitionTiming): CompetitionPhase {
    const now = new Date();
    const start = new Date(timing.startAt);
    const deadline = new Date(timing.deadlineAt);
    const evalStart = new Date(timing.evaluationStartAt);
    const evalEnd = new Date(timing.evaluationEndAt);

    if (now < start) {
        return 'setup';
    } else if (now >= start && now < deadline) {
        return 'voting';
    } else if (now >= deadline && now < evalStart) {
        return 'closed';
    } else if (now >= evalStart && now < evalEnd) {
        return 'evaluation';
    } else {
        return 'ended';
    }
}

/**
 * Get next action time for a competition phase
 */
export function getNextActionTime(timing: CompetitionTiming): { phase: CompetitionPhase; time: Date } | null {
    const now = new Date();
    const start = new Date(timing.startAt);
    const deadline = new Date(timing.deadlineAt);
    const evalStart = new Date(timing.evaluationStartAt);
    const evalEnd = new Date(timing.evaluationEndAt);

    if (now < start) {
        return { phase: 'voting', time: start };
    } else if (now >= start && now < deadline) {
        return { phase: 'closed', time: deadline };
    } else if (now >= deadline && now < evalStart) {
        return { phase: 'evaluation', time: evalStart };
    } else if (now >= evalStart && now < evalEnd) {
        return { phase: 'ended', time: evalEnd };
    }

    return null; // Competition is ended
}
