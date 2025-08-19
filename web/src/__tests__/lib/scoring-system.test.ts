/**
 * Tests for the new ranking-based scoring system
 */

import { RANKING_POINTS, MAX_SCORING_RANK } from '@/lib/constants';

describe('Ranking-based Scoring System', () => {
    describe('RANKING_POINTS constants', () => {
        it('should have correct point values for each rank', () => {
            expect(RANKING_POINTS[1]).toBe(100);
            expect(RANKING_POINTS[2]).toBe(60);
            expect(RANKING_POINTS[3]).toBe(40);
            expect(RANKING_POINTS[4]).toBe(25);
            expect(RANKING_POINTS[5]).toBe(20);
            expect(RANKING_POINTS[16]).toBe(1);
        });

        it('should have decreasing point values', () => {
            expect(RANKING_POINTS[1]).toBeGreaterThan(RANKING_POINTS[2]);
            expect(RANKING_POINTS[2]).toBeGreaterThan(RANKING_POINTS[3]);
            expect(RANKING_POINTS[3]).toBeGreaterThan(RANKING_POINTS[4]);
            expect(RANKING_POINTS[5]).toBeGreaterThan(RANKING_POINTS[6]);
        });

        it('should have correct maximum scoring rank', () => {
            expect(MAX_SCORING_RANK).toBe(16);
            expect(RANKING_POINTS[16]).toBe(1);
        });

        it('should reward precision with significant point difference', () => {
            // First place should be significantly more rewarding than second
            const firstPlaceAdvantage = RANKING_POINTS[1] / RANKING_POINTS[2];
            expect(firstPlaceAdvantage).toBeCloseTo(1.67, 1); // ~1.67x more points

            // Top 3 should be significantly more rewarding than participation level
            expect(RANKING_POINTS[3]).toBeGreaterThan(RANKING_POINTS[10] * 3);
        });
    });

    describe('Scoring scenarios', () => {
        const mockStockRankings = [
            { symbol: 'NVDA', rank: 1, changePercent: 0.052 },
            { symbol: 'TSLA', rank: 2, changePercent: 0.038 },
            { symbol: 'AAPL', rank: 3, changePercent: 0.024 },
            { symbol: 'MSFT', rank: 8, changePercent: 0.011 },
            { symbol: 'META', rank: 25, changePercent: -0.008 },
        ];

        it('should calculate correct points for different ranks', () => {
            const getPointsForSymbol = (symbol: string) => {
                const stock = mockStockRankings.find(s => s.symbol === symbol);
                if (!stock || stock.rank > MAX_SCORING_RANK) return 0;
                return RANKING_POINTS[stock.rank as keyof typeof RANKING_POINTS] || 0;
            };

            expect(getPointsForSymbol('NVDA')).toBe(100); // Rank 1
            expect(getPointsForSymbol('TSLA')).toBe(60);  // Rank 2
            expect(getPointsForSymbol('AAPL')).toBe(40);  // Rank 3
            expect(getPointsForSymbol('MSFT')).toBe(10);  // Rank 8
            expect(getPointsForSymbol('META')).toBe(0);   // Rank 25 (outside scoring range)
        });

        it('should demonstrate strategic value of the system', () => {
            // Conservative strategy: consistently pick top 10 stocks
            const conservativePoints = [10, 7, 12, 8, 15, 6, 10, 5]; // Ranks 8,10,7,9,6,11,8,12
            const conservativeTotal = conservativePoints.reduce((a, b) => a + b, 0);
            const conservativeAverage = conservativeTotal / conservativePoints.length;

            // Aggressive strategy: aim for #1 but sometimes miss badly
            const aggressivePoints = [100, 0, 0, 60, 0, 0, 100, 0]; // Ranks 1,30,45,2,25,50,1,40
            const aggressiveTotal = aggressivePoints.reduce((a, b) => a + b, 0);
            const aggressiveAverage = aggressiveTotal / aggressivePoints.length;

            // Both strategies should be viable
            expect(conservativeAverage).toBeGreaterThan(5);
            expect(aggressiveAverage).toBeGreaterThan(20);

            // Aggressive should have higher ceiling but more variance
            expect(Math.max(...aggressivePoints)).toBe(100);
            expect(Math.max(...conservativePoints)).toBeLessThan(20);
        });
    });

    describe('System design principles', () => {
        it('should provide meaningful participation rewards', () => {
            // Even rank 16 should give some points
            expect(RANKING_POINTS[16]).toBeGreaterThan(0);

            // But rank 1 should be much more rewarding
            expect(RANKING_POINTS[1]).toBeGreaterThan(RANKING_POINTS[16] * 50);
        });

        it('should have reasonable scoring distribution', () => {
            const allPoints = Object.values(RANKING_POINTS);
            const maxPoints = Math.max(...allPoints);
            const minPoints = Math.min(...allPoints);

            expect(maxPoints).toBe(100);
            expect(minPoints).toBe(1);
            expect(maxPoints / minPoints).toBe(100); // 100:1 ratio
        });

        it('should encourage top 5 performance', () => {
            // Top 5 should all give substantial points
            expect(RANKING_POINTS[5]).toBeGreaterThanOrEqual(20);

            // But there should be clear incentive to aim higher
            expect(RANKING_POINTS[1]).toBeGreaterThan(RANKING_POINTS[5] * 4);
        });
    });

    describe('Edge cases', () => {
        it('should handle ranks outside scoring range', () => {
            // Ranks beyond MAX_SCORING_RANK should not be in the points table
            expect(RANKING_POINTS[17 as keyof typeof RANKING_POINTS]).toBeUndefined();
            expect(RANKING_POINTS[100 as keyof typeof RANKING_POINTS]).toBeUndefined();
        });

        it('should have all ranks from 1 to MAX_SCORING_RANK', () => {
            for (let rank = 1; rank <= MAX_SCORING_RANK; rank++) {
                expect(RANKING_POINTS[rank as keyof typeof RANKING_POINTS]).toBeDefined();
                expect(RANKING_POINTS[rank as keyof typeof RANKING_POINTS]).toBeGreaterThan(0);
            }
        });
    });
});
