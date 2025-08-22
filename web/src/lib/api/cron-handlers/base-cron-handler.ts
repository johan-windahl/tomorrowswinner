import { NextRequest } from 'next/server';
import { jsonError, jsonOk, jsonAuthError, readCronSecret } from '@/lib/cron';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export interface CronAction {
    type: 'create' | 'close' | 'end';
    category: 'crypto' | 'stocks';
    shouldRun: (now: Date) => boolean;
    handler: () => Promise<unknown>;
}

/**
 * Base cron handler with common functionality
 */
export abstract class BaseCronHandler {
    protected actions: CronAction[] = [];

    constructor() {
        console.log('BaseCronHandler constructor');
        this.initializeActions();
    }

    protected abstract initializeActions(): void;

    async execute(req: Request | NextRequest) {
        console.log('BaseCronHandler execute');
        const auth = readCronSecret(req);
        if (!auth.ok) return jsonAuthError(auth);
        console.log('auth ok');
        if (!supabaseAdmin) return jsonError(500, 'admin not configured');
        console.log('supabaseAdmin ok');
        const now = new Date();
        const results = [];
        console.log('actions', this.actions);
        for (const action of this.actions) {
            if (action.shouldRun(now)) {
                try {
                    const result = await action.handler();
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
        const fmt = new Intl.DateTimeFormat('sv-SE', {
            timeZone: 'America/New_York',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        const parts = fmt.formatToParts(d);
        const y = parts.find((p) => p.type === 'year')?.value ?? '1970';
        const m = parts.find((p) => p.type === 'month')?.value ?? '01';
        const dd = parts.find((p) => p.type === 'day')?.value ?? '01';
        return `${y}-${m}-${dd}`;
    }

    protected isWeekday(now: Date): boolean {
        // Convert to ET timezone for weekday check
        const etDate = this.getETDate(now);
        return etDate.getDay() >= 1 && etDate.getDay() <= 5;
    }

    protected isTime(now: Date, hour: number): boolean {
        // Convert to ET timezone for hour check
        const etDate = this.getETDate(now);
        return etDate.getHours() === hour;
    }

    protected isTimeWithMinute(now: Date, hour: number, minute: number): boolean {
        // Convert to ET timezone for hour and minute check
        const eHour = this.getETHour(now);
        const eMinute = this.getETMinute(now);
        console.log('eHour', eHour, 'eMinute', eMinute, 'hour', hour, 'minute', minute);
        return eHour === hour && eMinute === minute;
    }

    /**
     * Get the current date/time in Eastern Time (ET) timezone
     * Automatically handles daylight saving time transitions
     */
    protected getETDate(date: Date): Date {
        // Create a formatter to get the ET time
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/New_York',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        // Format the date in ET timezone
        const etString = formatter.format(date);

        // Parse the ET string back to a Date object
        // This creates a Date object that represents the ET time
        const [datePart, timePart] = etString.split(', ');
        const [month, day, year] = datePart.split('/');
        const [hour, minute, second] = timePart.split(':');

        // Create a new Date object in ET timezone
        // Note: This creates a Date object that will be interpreted as ET time
        return new Date(
            parseInt(year),
            parseInt(month) - 1, // Month is 0-indexed
            parseInt(day),
            parseInt(hour),
            parseInt(minute),
            parseInt(second)
        );
    }

    /**
     * Get the current hour in ET timezone
     */
    protected getETHour(date: Date): number {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/New_York',
            hour: '2-digit',
            hour12: false
        });
        return parseInt(formatter.format(date));
    }

    /**
     * Get the current minute in ET timezone
     */
    protected getETMinute(date: Date): number {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/New_York',
            minute: '2-digit'
        });
        return parseInt(formatter.format(date));
    }

    /**
     * Get the current day of week in ET timezone (0 = Sunday, 1 = Monday, etc.)
     */
    protected getETDayOfWeek(date: Date): number {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/New_York',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        // Get the ET date string and create a Date object to get day of week
        const etDateString = formatter.format(date);
        const [month, day, year] = etDateString.split('/');
        const etDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return etDate.getDay();
    }
}
