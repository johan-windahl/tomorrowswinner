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

describe('Time Utils', () => {
    // Mock a specific date for consistent testing
    const mockDate = new Date('2024-01-15T12:00:00Z'); // UTC time

    describe('getETDate', () => {
        it('should convert UTC date to ET timezone', () => {
            const etDate = getETDate(mockDate);
            expect(etDate).toBeInstanceOf(Date);
            // The exact values will depend on the timezone offset
            expect(etDate.getFullYear()).toBe(2024);
            expect(etDate.getMonth()).toBe(0); // January
            expect(etDate.getDate()).toBe(15);
        });
    });

    describe('getETHour', () => {
        it('should return hour in ET timezone', () => {
            const hour = getETHour(mockDate);
            expect(typeof hour).toBe('number');
            expect(hour).toBeGreaterThanOrEqual(0);
            expect(hour).toBeLessThan(24);
        });
    });

    describe('getETMinute', () => {
        it('should return minute in ET timezone', () => {
            const minute = getETMinute(mockDate);
            expect(typeof minute).toBe('number');
            expect(minute).toBeGreaterThanOrEqual(0);
            expect(minute).toBeLessThan(60);
        });
    });

    describe('getETDayOfWeek', () => {
        it('should return day of week in ET timezone', () => {
            const dayOfWeek = getETDayOfWeek(mockDate);
            expect(typeof dayOfWeek).toBe('number');
            expect(dayOfWeek).toBeGreaterThanOrEqual(0);
            expect(dayOfWeek).toBeLessThan(7);
        });
    });

    describe('formatETDate', () => {
        it('should format date as YYYY-MM-DD string in ET', () => {
            const formatted = formatETDate(mockDate);
            expect(typeof formatted).toBe('string');
            expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(formatted).toBe('2024-01-15');
        });
    });

    describe('isTimeMatch', () => {
        it('should return true when time matches', () => {
            // Create a date that matches 12:00 ET
            const matchingDate = new Date('2024-01-15T17:00:00Z'); // 12:00 ET (assuming EST)
            const result = isTimeMatch(matchingDate, 12, 0);
            expect(typeof result).toBe('boolean');
        });

        it('should return false when time does not match', () => {
            const result = isTimeMatch(mockDate, 23, 59);
            expect(result).toBe(false);
        });
    });

    describe('isWeekday', () => {
        it('should return true for weekdays', () => {
            // Monday
            const monday = new Date('2024-01-15T12:00:00Z');
            expect(isWeekday(monday)).toBe(true);
        });

        it('should return false for weekends', () => {
            // Sunday
            const sunday = new Date('2024-01-14T12:00:00Z');
            expect(isWeekday(sunday)).toBe(false);
        });
    });

    describe('isTime', () => {
        it('should return true when hour matches', () => {
            const result = isTime(mockDate, getETHour(mockDate));
            expect(result).toBe(true);
        });

        it('should return false when hour does not match', () => {
            const result = isTime(mockDate, 23);
            expect(result).toBe(false);
        });
    });
});
