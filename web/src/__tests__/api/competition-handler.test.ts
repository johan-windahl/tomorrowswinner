/**
 * Tests for competition handlers
 */

import { CompetitionClosingHandler } from '@/lib/api/competition-handler';

// Mock the dependencies
jest.mock('@/lib/cron');
jest.mock('@/lib/supabaseAdmin');
jest.mock('@/lib/competitions');

describe('CompetitionClosingHandler', () => {
    let handler: CompetitionClosingHandler;

    beforeEach(() => {
        handler = new CompetitionClosingHandler('crypto');
    });

    describe('handleGet', () => {
        it('should return method not allowed response', () => {
            const response = handler.handleGet();

            expect(response).toBeInstanceOf(Response);
            expect(response.status).toBe(405);
        });
    });

    describe('constructor', () => {
        it('should set category correctly', () => {
            const cryptoHandler = new CompetitionClosingHandler('crypto');
            const financeHandler = new CompetitionClosingHandler('finance');

            expect(cryptoHandler['category']).toBe('crypto');
            expect(financeHandler['category']).toBe('finance');
        });
    });
});
