import { NextRequest } from 'next/server';
import { jsonError, jsonOk, jsonAuthError, readCronSecret } from '@/lib/cron';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import {
    getETDate,
    getETHour,
    getETMinute,
    getETDayOfWeek,
    formatETDate,
    isTimeMatch,
    isWeekday,
    isTime
} from '@/lib/utils/time-utils';

export interface CronAction {
    type: 'create' | 'close' | 'end';
    category: 'crypto' | 'finance';
    shouldRun: (now: Date) => boolean;
    handler: (req: Request | NextRequest) => Promise<unknown>;
}

/**
 * Base cron handler with common functionality
 */
export abstract class BaseCronHandler {
    protected actions: CronAction[] = [];

    constructor() {
        this.initializeActions();
    }

    protected abstract initializeActions(): void;

    async execute(req: Request | NextRequest) {
        const auth = readCronSecret(req);
        if (!auth.ok) return jsonAuthError(auth);
        if (!supabaseAdmin) return jsonError(500, 'admin not configured');

        const now = new Date();
        const results = [];

        for (const action of this.actions) {
            if (action.shouldRun(now)) {
                console.log('ACTION: ', action.type, action.category, now);
                try {
                    const result = await action.handler(req);
                    results.push({
                        type: action.type,
                        category: action.category,
                        success: true,
                        result: result instanceof Response ? await result.json() : result
                    });
                } catch (error) {
                    results.push({
                        type: action.type,
                        category: action.category,
                        success: false,
                        error: error instanceof Error ? error.message : 'unknown error'
                    });
                }
            }
        }

        return jsonOk({
            timestamp: now.toISOString(),
            actionsExecuted: results.length,
            results
        });
    }

    protected etDate(d: Date): string {
        return formatETDate(d);
    }

    protected isWeekday(now: Date): boolean {
        return isWeekday(now);
    }

    protected isTime(now: Date, hour: number): boolean {
        return isTime(now, hour);
    }

    protected isTimeWithMinute(now: Date, hour: number, minute: number): boolean {
        return isTimeMatch(now, hour, minute);
    }

    /**
     * Get the current date/time in Eastern Time (ET) timezone
     * Automatically handles daylight saving time transitions
     */
    protected getETDate(date: Date): Date {
        return getETDate(date);
    }

    /**
     * Get the current hour in ET timezone
     */
    protected getETHour(date: Date): number {
        return getETHour(date);
    }

    /**
     * Get the current minute in ET timezone
     */
    protected getETMinute(date: Date): number {
        return getETMinute(date);
    }

    /**
     * Get the current day of week in ET timezone (0 = Sunday, 1 = Monday, etc.)
     */
    protected getETDayOfWeek(date: Date): number {
        return getETDayOfWeek(date);
    }
}
