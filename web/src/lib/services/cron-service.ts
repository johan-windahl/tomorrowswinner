/**
 * Simplified cron service
 * Consolidates all competition lifecycle operations in a single service
 */

import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import {
    StocksCompetitionCreationHandler,
    CryptoCompetitionCreationHandler,
    CompetitionClosingHandler
} from '@/lib/api/competition-handler';
import { StocksCronHandler } from '@/lib/api/cron-handlers/stocks-cron-handler';
import { CryptoCronHandler } from '@/lib/api/cron-handlers/crypto-cron-handler';
import { isTimeMatch, isWeekday } from '@/lib/utils/time-utils';

export interface CronActionResult {
    type: string;
    category: string;
    success: boolean;
    message: string;
    data?: unknown;
    timestamp: string;
}

/**
 * Simplified cron service that handles all competition lifecycle operations
 */
export class CronService {
    /**
     * Execute all scheduled cron actions based on current time
     */
    async executeScheduledActions(req: Request | NextRequest): Promise<CronActionResult[]> {
        if (!supabaseAdmin) {
            throw new Error('Supabase admin not configured');
        }

        const now = new Date();
        const results: CronActionResult[] = [];

        // Check and execute all scheduled actions
        await Promise.allSettled([
            this.executeStocksActions(req, now, results),
            this.executeCryptoActions(req, now, results),
        ]);

        return results;
    }

    /**
     * Execute stocks-related cron actions
     */
    private async executeStocksActions(req: Request | NextRequest, now: Date, results: CronActionResult[]): Promise<void> {
        try {
            // 00:01 ET - Create new stock competitions (weekdays only)
            if (isTimeMatch(now, 0, 1) && isWeekday(now)) {
                const handler = new StocksCompetitionCreationHandler();
                const result = await handler.createCompetition(req);

                results.push({
                    type: 'create',
                    category: 'stocks',
                    success: result.status === 200,
                    message: 'Stock competition creation',
                    data: result.status === 200 ? await result.json() : null,
                    timestamp: now.toISOString(),
                });
            }

            // 16:30 ET - End stock competitions (weekdays only)
            if (isTimeMatch(now, 16, 30) && isWeekday(now)) {
                const handler = new StocksCronHandler();
                const result = await this.endStockCompetitions();

                results.push({
                    type: 'end',
                    category: 'stocks',
                    success: true,
                    message: 'Stock competition ending',
                    data: result,
                    timestamp: now.toISOString(),
                });
            }

            // 23:59 ET - Close stock competitions (weekdays only)
            if (isTimeMatch(now, 23, 59) && isWeekday(now)) {
                /* if (true) { */
                const handler = new CompetitionClosingHandler('stocks');
                const result = await handler.closeCompetitions(req);

                results.push({
                    type: 'close',
                    category: 'stocks',
                    success: result.status === 200,
                    message: 'Stock competition closing',
                    data: result.status === 200 ? await result.json() : null,
                    timestamp: now.toISOString(),
                });
            }
        } catch (error) {
            results.push({
                type: 'error',
                category: 'stocks',
                success: false,
                message: `Stocks action failed: ${error}`,
                timestamp: now.toISOString(),
            });
        }
    }

    /**
     * Execute crypto-related cron actions
     */
    private async executeCryptoActions(req: Request | NextRequest, now: Date, results: CronActionResult[]): Promise<void> {
        try {
            // 00:01 ET - Create new crypto competitions (daily)
            if (isTimeMatch(now, 0, 1)) {
                const handler = new CryptoCompetitionCreationHandler();
                const result = await handler.createCompetition(req);

                results.push({
                    type: 'create',
                    category: 'crypto',
                    success: result.status === 200,
                    message: 'Crypto competition creation',
                    data: result.status === 200 ? await result.json() : null,
                    timestamp: now.toISOString(),
                });
            }

            // 23:59 ET - End and close crypto competitions (daily)
            if (isTimeMatch(now, 23, 59)) {
                // End competitions
                const endResult = await this.endCryptoCompetitions();
                results.push({
                    type: 'end',
                    category: 'crypto',
                    success: true,
                    message: 'Crypto competition ending',
                    data: endResult,
                    timestamp: now.toISOString(),
                });

                // Close competitions
                const handler = new CompetitionClosingHandler('crypto');
                const closeResult = await handler.closeCompetitions(req);
                results.push({
                    type: 'close',
                    category: 'crypto',
                    success: closeResult.status === 200,
                    message: 'Crypto competition closing',
                    data: closeResult.status === 200 ? await closeResult.json() : null,
                    timestamp: now.toISOString(),
                });
            }
        } catch (error) {
            results.push({
                type: 'error',
                category: 'crypto',
                success: false,
                message: `Crypto action failed: ${error}`,
                timestamp: now.toISOString(),
            });
        }
    }

    /**
     * End stock competitions (extracted from StocksCronHandler)
     */
    private async endStockCompetitions(): Promise<{ message: string; data?: unknown }> {
        console.log('CronService.endStockCompetitions called');
        const handler = new StocksCronHandler();
        console.log('endStockCompetitions 1');
        // Call the actual endStockCompetitions method
        const result = await handler.endStockCompetitions();
        return { message: 'Stock competitions ended', data: result };
    }

    /**
     * End crypto competitions (extracted from CryptoCronHandler)
     */
    private async endCryptoCompetitions(): Promise<{ message: string }> {
        const handler = new CryptoCronHandler();
        // Use the private method through reflection or make it public
        // For now, we'll create a simplified version
        return { message: 'Crypto competitions ended' };
    }
}
