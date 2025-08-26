/**
 * Shared time utilities for cron operations
 * Consolidates all timezone and time checking logic
 */

/**
 * Get the current date/time in Eastern Time (ET) timezone
 * Automatically handles daylight saving time transitions
 */
export function getETDate(date: Date): Date {
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
    const [datePart, timePart] = etString.split(', ');
    const [month, day, year] = datePart.split('/');
    const [hour, minute, second] = timePart.split(':');

    // Create a new Date object in ET timezone
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
export function getETHour(date: Date): number {
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
export function getETMinute(date: Date): number {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        minute: '2-digit'
    });
    return parseInt(formatter.format(date));
}

/**
 * Get the current day of week in ET timezone (0 = Sunday, 1 = Monday, etc.)
 */
export function getETDayOfWeek(date: Date): number {
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

/**
 * Format date as YYYY-MM-DD string in ET timezone
 */
export function formatETDate(date: Date): string {
    const fmt = new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    const parts = fmt.formatToParts(date);
    const y = parts.find((p) => p.type === 'year')?.value ?? '1970';
    const m = parts.find((p) => p.type === 'month')?.value ?? '01';
    const dd = parts.find((p) => p.type === 'day')?.value ?? '01';
    return `${y}-${m}-${dd}`;
}

/**
 * Check if current time matches specific hour and minute in ET
 */
export function isTimeMatch(date: Date, hour: number, minute: number): boolean {
    const etHour = getETHour(date);
    const etMinute = getETMinute(date);
    return etHour === hour && etMinute === minute;
}

/**
 * Check if current date is a weekday in ET timezone
 */
export function isWeekday(date: Date): boolean {
    const etDate = getETDate(date);
    const day = etDate.getDay();
    return day >= 1 && day <= 5; // Monday = 1, Friday = 5
}

/**
 * Check if current time matches specific hour in ET
 */
export function isTime(date: Date, hour: number): boolean {
    const etHour = getETHour(date);
    return etHour === hour;
}
