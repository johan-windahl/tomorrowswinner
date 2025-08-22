import { NextRequest } from 'next/server';
import { jsonError, jsonOk, jsonAuthError, readCronSecret } from '@/lib/cron';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { CryptoCronHandler } from './cron-handlers/crypto-cron-handler';
import { StocksCronHandler } from './cron-handlers/stocks-cron-handler';

/**
 * Unified cron handler that orchestrates individual competition handlers
 * Determines which actions to perform based on the current time
 */
export class UnifiedCronHandler {
    private cryptoHandler: CryptoCronHandler;
    private stocksHandler: StocksCronHandler;

    constructor() {
        this.cryptoHandler = new CryptoCronHandler();
        this.stocksHandler = new StocksCronHandler();
    }

    async execute(req: Request | NextRequest) {
        console.log('UnifiedCronHandler execute');
        const auth = readCronSecret(req);
        if (!auth.ok) return jsonAuthError(auth);
        if (!supabaseAdmin) return jsonError(500, 'admin not configured');

        const now = new Date();
        const results = [];

        // Execute crypto actions
        try {
            const cryptoResult = await this.cryptoHandler.execute(req);
            if (cryptoResult instanceof Response) {
                const cryptoData = await cryptoResult.json();
                if (cryptoData.results && cryptoData.results.length > 0) {
                    results.push(...cryptoData.results);
                }
            }
        } catch (error) {
            console.error('Crypto handler error:', error);
        }

        // Execute stocks actions
        try {
            const stocksResult = await this.stocksHandler.execute(req);
            if (stocksResult instanceof Response) {
                const stocksData = await stocksResult.json();
                if (stocksData.results && stocksData.results.length > 0) {
                    results.push(...stocksData.results);
                }
            }
        } catch (error) {
            console.error('Stocks handler error:', error);
        }

        return jsonOk({
            timestamp: now.toISOString(),
            actionsExecuted: results.length,
            results
        });
    }
}
