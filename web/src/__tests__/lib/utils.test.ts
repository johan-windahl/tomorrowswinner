/**
 * Tests for utility functions
 */

import { timeUtils, formatUtils, categoryUtils, rankUtils } from '@/lib/utils';

describe('timeUtils', () => {
    describe('getTimeRemaining', () => {
        it('should return "Ended" for past dates', () => {
            const pastDate = new Date(Date.now() - 1000).toISOString();
            expect(timeUtils.getTimeRemaining(pastDate)).toBe('Ended');
        });

        it('should format future dates correctly', () => {
            const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours
            const result = timeUtils.getTimeRemaining(futureDate);
            expect(result).toMatch(/^\d+h \d+m$/);
        });

        it('should format days correctly for long durations', () => {
            const futureDate = new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(); // 25 hours
            const result = timeUtils.getTimeRemaining(futureDate);
            expect(result).toMatch(/^\d+d \d+h$/);
        });
    });

    describe('formatDate', () => {
        it('should format dates correctly', () => {
            const date = '2024-01-15T10:30:00Z';
            const result = timeUtils.formatDate(date);
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
        });
    });
});

describe('formatUtils', () => {
    describe('currency', () => {
        it('should format currency values', () => {
            expect(formatUtils.currency(123.45)).toBe('$123.45');
            expect(formatUtils.currency(null)).toBe('—');
            expect(formatUtils.currency(undefined)).toBe('—');
        });
    });

    describe('percentage', () => {
        it('should format percentage values', () => {
            expect(formatUtils.percentage(5.25)).toBe('+5.25%');
            expect(formatUtils.percentage(-2.5)).toBe('-2.50%');
            expect(formatUtils.percentage(null)).toBe('—');
        });
    });

    describe('number', () => {
        it('should format numbers with commas', () => {
            expect(formatUtils.number(1234)).toBe('1,234');
            expect(formatUtils.number(1234567)).toBe('1,234,567');
        });
    });

    describe('getPercentageColorClass', () => {
        it('should return correct color classes', () => {
            expect(formatUtils.getPercentageColorClass(5)).toBe('text-green-400');
            expect(formatUtils.getPercentageColorClass(-5)).toBe('text-red-400');
            expect(formatUtils.getPercentageColorClass(null)).toBe('text-gray-500');
        });
    });
});

describe('categoryUtils', () => {
    describe('getConfig', () => {
        it('should return finance config', () => {
            const config = categoryUtils.getConfig('finance');
            expect(config.id).toBe('finance');
            expect(config.label).toBe('Stocks');
        });

        it('should return crypto config', () => {
            const config = categoryUtils.getConfig('crypto');
            expect(config.id).toBe('crypto');
            expect(config.label).toBe('Crypto');
        });
    });

    describe('getColorClasses', () => {
        it('should return color classes for categories', () => {
            const financeClasses = categoryUtils.getColorClasses('finance');
            expect(financeClasses).toContain('bg-blue-900');

            const cryptoClasses = categoryUtils.getColorClasses('crypto');
            expect(cryptoClasses).toContain('bg-orange-900');
        });
    });
});

describe('rankUtils', () => {
    describe('getDisplay', () => {
        it('should return emojis for top 3 ranks', () => {
            expect(rankUtils.getDisplay(1)).toBe('🥇');
            expect(rankUtils.getDisplay(2)).toBe('🥈');
            expect(rankUtils.getDisplay(3)).toBe('🥉');
            expect(rankUtils.getDisplay(4)).toBe('#4');
        });
    });

    describe('getStyle', () => {
        it('should return styling for ranks', () => {
            expect(rankUtils.getStyle(1)).toContain('border-yellow-600');
            expect(rankUtils.getStyle(2)).toContain('border-gray-500');
            expect(rankUtils.getStyle(3)).toContain('border-orange-600');
            expect(rankUtils.getStyle(4)).toBe('border-gray-600');
        });
    });
});
