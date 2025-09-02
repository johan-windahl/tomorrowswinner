/**
 * Tests for CompetitionEnrichmentService
 */

import { CompetitionEnrichmentService } from '@/lib/services/competition-enrichment';

// Type definitions for private methods
interface CompetitionEnrichmentServicePrivate {
    generateLogoUrl(symbol: string): string;
    generateTradingViewUrl(exchange: string, symbol: string): string;
}

// Mock supabaseAdmin
jest.mock('@/lib/supabaseAdmin', () => ({
    supabaseAdmin: {
        from: jest.fn(() => ({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    single: jest.fn(() => ({
                        data: { id: 1, category: 'finance' },
                        error: null
                    }))
                })),
                order: jest.fn(() => ({
                    data: [
                        { id: 1, symbol: 'AAPL', name: 'Apple Inc.' },
                        { id: 2, symbol: 'GOOGL', name: 'Alphabet Inc.' }
                    ],
                    error: null
                })),
                limit: jest.fn(() => ({
                    data: [
                        { as_of_date: '2024-01-15' },
                        { as_of_date: '2024-01-14' }
                    ],
                    error: null
                })),
                in: jest.fn(() => ({
                    data: [
                        {
                            symbol: 'AAPL',
                            as_of_date: '2024-01-15',
                            close: 150.0,
                            previous_close: 148.0,
                            daily_change_percent: 1.35
                        }
                    ],
                    error: null
                }))
            }))
        }))
    }
}));

describe('CompetitionEnrichmentService', () => {
    let service: CompetitionEnrichmentService;

    beforeEach(() => {
        service = new CompetitionEnrichmentService();
        jest.clearAllMocks();
    });

    describe('enrichCompetition', () => {
        it('should enrich a finance competition with full data', async () => {
            const result = await service.enrichCompetition('test-slug');

            expect(result.ok).toBe(true);
            expect(result.items).toBeDefined();
            expect(result.dates).toBeDefined();
        });

        it('should handle non-finance competitions with basic data', async () => {
            // Mock non-finance competition
            const mockSupabase = supabaseAdmin;
            mockSupabase.from = jest.fn(() => ({
                select: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        single: jest.fn(() => ({
                            data: { id: 1, category: 'sports' },
                            error: null
                        })),
                        order: jest.fn(() => ({
                            data: [
                                { id: 1, symbol: 'NBA', name: 'National Basketball Association' }
                            ],
                            error: null
                        }))
                    }))
                }))
            }));

            const result = await service.enrichCompetition('test-slug');

            expect(result.ok).toBe(true);
            expect(result.items[0].logoUrl).toContain('ui-avatars.com');
            expect(result.items[0].tradingViewUrl).toBe('');
        });

        it('should throw error when competition not found', async () => {
            const mockSupabase = supabaseAdmin;
            mockSupabase.from = jest.fn(() => ({
                select: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        single: jest.fn(() => ({
                            data: null,
                            error: { code: '404', message: 'Not found' }
                        }))
                    }))
                }))
            }));

            await expect(service.enrichCompetition('invalid-slug')).rejects.toThrow('Competition not found');
        });

        it('should handle empty options gracefully', async () => {
            const mockSupabase = supabaseAdmin;
            mockSupabase.from = jest.fn((table) => {
                if (table === 'competitions') {
                    return {
                        select: jest.fn(() => ({
                            eq: jest.fn(() => ({
                                single: jest.fn(() => ({
                                    data: { id: 1, category: 'finance' },
                                    error: null
                                }))
                            }))
                        }))
                    };
                } else if (table === 'options') {
                    return {
                        select: jest.fn(() => ({
                            eq: jest.fn(() => ({
                                order: jest.fn(() => ({
                                    data: [],
                                    error: null
                                }))
                            }))
                        }))
                    };
                }
            });

            const result = await service.enrichCompetition('test-slug');

            expect(result.ok).toBe(true);
            expect(result.items).toEqual([]);
        });
    });

    describe('generateLogoUrl', () => {
        it('should generate correct logo URLs for known companies', () => {
            const service = new CompetitionEnrichmentService();

            // Access private method for testing
            const generateLogoUrl = (service as unknown as CompetitionEnrichmentServicePrivate).generateLogoUrl.bind(service);

            expect(generateLogoUrl('GOOGL')).toBe('https://logo.clearbit.com/alphabet.com');
            expect(generateLogoUrl('META')).toBe('https://logo.clearbit.com/meta.com');
            expect(generateLogoUrl('AAPL')).toBe('https://logo.clearbit.com/aapl.com');
        });
    });

    describe('generateTradingViewUrl', () => {
        it('should generate correct TradingView URLs', () => {
            const service = new CompetitionEnrichmentService();

            // Access private method for testing
            const generateTradingViewUrl = (service as unknown as CompetitionEnrichmentServicePrivate).generateTradingViewUrl.bind(service);

            expect(generateTradingViewUrl('NASDAQ', 'AAPL')).toBe('https://www.tradingview.com/symbols/NASDAQ-AAPL/');
            expect(generateTradingViewUrl('NYSE', 'GOOGL')).toBe('https://www.tradingview.com/symbols/NYSE-GOOGL/');
        });
    });
});
