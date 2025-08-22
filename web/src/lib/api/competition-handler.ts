/**
 * Generic competition API handler
 * Shared logic for competition creation, closing, and ending
 */

import { NextRequest } from 'next/server';
import { jsonError, jsonOk, readCronSecret, todayInETISODate } from '@/lib/cron';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import {
    getCompetitionConfig,
    generateCompetitionTiming,
    generateCompetitionSlug,
    shouldRunCompetition
} from '@/lib/competitions';
import type { CompetitionCategory } from '@/types/competition';

/**
 * Base competition handler with common authentication and validation
 */
export abstract class CompetitionHandler {
    protected category: CompetitionCategory;

    constructor(category: CompetitionCategory) {
        this.category = category;
    }

    /**
     * Handle POST request with common validation
     */
    async handlePost(req: Request | NextRequest) {
        // Authentication
        const auth = readCronSecret(req);
        if (!auth.ok) return jsonError(403, 'forbidden', auth);
        if (!supabaseAdmin) return jsonError(500, 'admin not configured');

        // Get config
        const config = getCompetitionConfig(this.category);
        if (!config) return jsonError(500, `${this.category} competition config not found`);

        return { config };
    }

    /**
     * Handle GET request (method not allowed)
     */
    handleGet() {
        return new Response('Use POST with x-cron-secret header', { status: 405 });
    }
}

/**
 * Competition creation handler
 */
export abstract class CompetitionCreationHandler extends CompetitionHandler {
    async createCompetition(req: Request | NextRequest) {
        console.log('createCompetition');
        if (!supabaseAdmin) return jsonError(500, 'admin not configured');

        const validation = await this.handlePost(req);
        if ('status' in validation) return validation; // Error response
        const { config } = validation;

        const timing = generateCompetitionTiming();
        const tomorrowDate = new Date(timing.startAt);

        // Check if competition should run
        if (!shouldRunCompetition(config, tomorrowDate)) {
            const reason = config.runsOnWeekends ? 'not scheduled for this date' : 'market closed (weekend)';
            return jsonOk({ skipped: true, reason });
        }

        const slug = generateCompetitionSlug(`${this.category}-best`, tomorrowDate);

        try {
            // Fetch data
            const dataResult = await this.fetchData();

            // Create competition
            const { data: compRow, error: cErr } = await supabaseAdmin
                .from('competitions')
                .upsert([{
                    category: config.category,
                    title: config.name,
                    slug,
                    start_at: timing.startAt,
                    deadline_at: timing.deadlineAt,
                    evaluation_start_at: timing.evaluationStartAt,
                    evaluation_end_at: timing.evaluationEndAt,
                    timezone: timing.timezone,
                }], { onConflict: 'slug' })
                .select('*')
                .single();

            if (cErr) return jsonError(500, 'competition upsert error', { code: cErr.code, message: cErr.message });
            if (!compRow?.id) return jsonError(500, 'missing competition id');

            // Add options
            const optionsAdded = await this.addOptions(compRow.id);

            return jsonOk({
                competition: {
                    id: compRow.id,
                    slug,
                    title: compRow.title,
                    timing,
                },
                optionsAdded,
                dataFetched: dataResult.success,
                dataDetails: dataResult.details,
            });

        } catch (error) {
            const message = error instanceof Error ? error.message : 'unknown error';
            return jsonError(500, `${this.category} competition creation failed`, { message });
        }
    }

    protected abstract fetchData(): Promise<{ success: boolean; details?: unknown }>;
    protected abstract addOptions(competitionId: number): Promise<number>;
}

/**
 * Competition closing handler
 */
export class CompetitionClosingHandler extends CompetitionHandler {
    async closeCompetitions(req: Request | NextRequest) {
        if (!supabaseAdmin) return jsonError(500, 'admin not configured');

        const validation = await this.handlePost(req);
        if ('status' in validation) return validation; // Error response
        const { config } = validation;

        try {
            const now = new Date();

            // Find competitions that should be closed
            const { data: competitions, error: compErr } = await supabaseAdmin
                .from('competitions')
                .select('id, slug, deadline_at, title')
                .eq('category', config.category)
                .lt('deadline_at', now.toISOString())
                .is('closed_at', null);

            if (compErr) return jsonError(500, 'failed to fetch competitions', { code: compErr.code, message: compErr.message });

            const closedCompetitions = [];

            for (const comp of competitions ?? []) {
                // Mark competition as closed
                const { error: updateErr } = await supabaseAdmin
                    .from('competitions')
                    .update({ closed_at: now.toISOString() })
                    .eq('id', comp.id);

                if (updateErr) {
                    console.error(`Failed to close competition ${comp.slug}:`, updateErr.message);
                    continue;
                }

                // Get voting statistics
                const { data: stats } = await supabaseAdmin
                    .from('guesses')
                    .select('id')
                    .eq('competition_id', comp.id);

                closedCompetitions.push({
                    id: comp.id,
                    slug: comp.slug,
                    title: comp.title,
                    deadline: comp.deadline_at,
                    totalVotes: stats?.length ?? 0,
                    closedAt: now.toISOString(),
                });
            }

            return jsonOk({
                closed: closedCompetitions.length,
                competitions: closedCompetitions,
                timestamp: now.toISOString(),
            });

        } catch (error) {
            const message = error instanceof Error ? error.message : 'unknown error';
            return jsonError(500, `${this.category} competition close failed`, { message });
        }
    }
}

/**
 * Stocks-specific creation handler
 */
export class StocksCompetitionCreationHandler extends CompetitionCreationHandler {
    constructor() {
        super('finance');
    }

    protected async fetchData() {
        try {
            const stocksProcessed = await this.fetchStockData();
            return { success: true, details: { stocksProcessed } };
        } catch (error) {
            throw error;
        }
    }

    protected async addOptions(competitionId: number) {
        return await this.addStockOptions(competitionId);
    }

    private async fetchStockData(): Promise<number> {
        if (!supabaseAdmin) throw new Error('Supabase admin not configured');

        // Import the NASDAQ100_FALLBACK data
        const { NASDAQ100_FALLBACK } = await import('@/data/nasdaq100-fallback');
        const yahooFinance = await import('yahoo-finance2');

        const symbols = NASDAQ100_FALLBACK.map(s => ({ symbol: s.Symbol, name: s.Name }));

        // Update equity tickers
        const upRows = symbols.map(s => ({ symbol: s.symbol.toUpperCase(), name: s.name }));
        const { error: tickErr } = await supabaseAdmin
            .from('equity_tickers')
            .upsert(upRows, { onConflict: 'symbol' });

        if (tickErr) throw new Error(`Failed to update tickers: ${tickErr.message}`);

        // Remove tickers no longer in index
        const newSet = new Set(upRows.map(r => r.symbol));
        const { data: existing } = await supabaseAdmin.from('equity_tickers').select('symbol');
        const toDelete = (existing ?? [])
            .map((r: { symbol: string }) => String(r.symbol).toUpperCase())
            .filter(sym => !newSet.has(sym));

        if (toDelete.length > 0) {
            await supabaseAdmin.from('equity_tickers').delete().in('symbol', toDelete);
        }

        // Fetch stock prices using Yahoo Finance
        const batchSize = 25;
        const totalBatches = Math.ceil(symbols.length / batchSize);
        let processedCount = 0;

        for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
            const startIndex = batchIndex * batchSize;
            const endIndex = Math.min(startIndex + batchSize, symbols.length);
            const currentBatch = symbols.slice(startIndex, endIndex);

            const promises = currentBatch.map(async (s) => {
                const sym = s.symbol.toUpperCase();

                try {
                    const now = new Date();
                    const endDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
                    const startDate = new Date(endDate.getTime() - (7 * 24 * 60 * 60 * 1000));

                    const historical = await yahooFinance.default.historical(sym, {
                        period1: startDate,
                        period2: endDate,
                        interval: '1d',
                    });

                    if (!historical || historical.length === 0) {
                        return { success: false, symbol: sym };
                    }

                    const latestData = historical[historical.length - 1];
                    const previousData = historical.length > 1 ? historical[historical.length - 2] : null;

                    if (!latestData || !latestData.close) {
                        return { success: false, symbol: sym };
                    }

                    const date = latestData.date.toISOString().split('T')[0];
                    const close = latestData.close;
                    const previousClose = previousData?.close || null;

                    let dailyChangePercent = null;
                    if (previousClose && previousClose > 0) {
                        dailyChangePercent = ((close - previousClose) / previousClose) * 100;
                    }

                    const { error: eodErr } = await supabaseAdmin!
                        .from('equity_prices_eod')
                        .upsert({
                            symbol: sym,
                            as_of_date: date,
                            close,
                            previous_close: previousClose,
                            daily_change_percent: dailyChangePercent
                        }, { onConflict: 'symbol,as_of_date' });

                    if (eodErr) {
                        console.error(`Failed to store EOD data for ${sym}:`, eodErr);
                        return { success: false, symbol: sym };
                    }

                    return { success: true, symbol: sym, date, close, previousClose, dailyChangePercent };
                } catch (error) {
                    console.error(`Error fetching data for ${sym}:`, error);
                    return { success: false, symbol: sym };
                }
            });

            const results = await Promise.allSettled(promises);
            const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
            processedCount += successful;

            if (batchIndex < totalBatches - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        return processedCount;
    }

    private async addStockOptions(competitionId: number): Promise<number> {
        const { NASDAQ100_FALLBACK } = await import('@/data/nasdaq100-fallback');

        // Clear existing options
        await supabaseAdmin!
            .from('options')
            .delete()
            .eq('competition_id', competitionId);

        const symbols = NASDAQ100_FALLBACK.map(s => ({ symbol: s.Symbol, name: s.Name }));

        const rows = symbols.map(s => ({
            competition_id: competitionId,
            symbol: s.symbol.toUpperCase(),
            name: s.name,
            metadata: {},
        }));

        const chunkSize = 200;
        let totalAdded = 0;

        for (let i = 0; i < rows.length; i += chunkSize) {
            const chunk = rows.slice(i, i + chunkSize);
            const { error: upErr } = await supabaseAdmin!
                .from('options')
                .upsert(chunk, { onConflict: 'competition_id,symbol' });

            if (upErr) throw new Error(`Failed to add options chunk: ${upErr.message}`);
            totalAdded += chunk.length;
        }

        return totalAdded;
    }
}

/**
 * Crypto-specific creation handler
 */
export class CryptoCompetitionCreationHandler extends CompetitionCreationHandler {
    constructor() {
        super('crypto');
    }

    protected async fetchData() {
        try {
            await this.fetchCryptoData();
            return { success: true };
        } catch (error) {
            throw error;
        }
    }

    protected async addOptions(competitionId: number) {
        return await this.addCryptoOptions(competitionId);
    }

    private async fetchCryptoData(): Promise<void> {
        // Implementation from original crypto/new/route.ts
        interface CoinCapCoin {
            id: string;
            name: string;
            symbol: string;
            rank: string;
            priceUsd: string;
            marketCapUsd?: string;
        }

        interface CoinPaprikaCoin {
            id: string;
            name: string;
            symbol: string;
            rank?: number;
            quotes?: {
                USD?: {
                    price?: number;
                    market_cap?: number;
                };
            };
        }

        let coins: CoinCapCoin[] = [];

        try {
            const urlCap = 'https://api.coincap.io/v2/assets?limit=100';
            const resCap = await fetch(urlCap, {
                headers: { 'Accept': 'application/json', 'User-Agent': 'tomorrowswinner-cron/1.0' }
            });

            if (resCap.ok) {
                const json = await resCap.json();
                coins = (json?.data ?? []);
            } else {
                // Fallback: CoinPaprika
                const urlPap = 'https://api.coinpaprika.com/v1/tickers?limit=100';
                const resPaprika = await fetch(urlPap, {
                    headers: { 'Accept': 'application/json', 'User-Agent': 'tomorrowswinner-cron/1.0' }
                });

                if (!resPaprika.ok) {
                    throw new Error(`Both crypto APIs failed: CoinCap ${resCap.status}, CoinPaprika ${resPaprika.status}`);
                }

                const arr = await resPaprika.json() as CoinPaprikaCoin[];
                coins = arr.map((c: CoinPaprikaCoin) => ({
                    id: c.id,
                    name: c.name,
                    symbol: c.symbol,
                    rank: c.rank ? String(c.rank) : '',
                    priceUsd: c.quotes?.USD?.price != null ? String(c.quotes.USD.price) : '0',
                    marketCapUsd: c.quotes?.USD?.market_cap != null ? String(c.quotes.USD.market_cap) : '',
                }));
            }
        } catch (error) {
            throw new Error(`Failed to fetch crypto data: ${error}`);
        }

        // Store data (implementation from original)
        const asOf = todayInETISODate();
        const priceRows = coins.map((c) => ({
            coin_id: c.id,
            as_of_date: asOf,
            price_usd: c.priceUsd ? Number(c.priceUsd) : null,
            market_cap: c.marketCapUsd ? Number(c.marketCapUsd) : null,
            rank: c.rank ? Number(c.rank) : null,
        }));

        const { error: priceErr } = await supabaseAdmin!
            .from('crypto_prices_daily')
            .upsert(priceRows, { onConflict: 'coin_id,as_of_date' });

        if (priceErr) throw new Error(`Failed to store crypto prices: ${priceErr.message}`);

        const metaRows = coins.map((c) => ({
            id: c.id,
            symbol: c.symbol,
            name: c.name ?? c.id,
            rank: c.rank ? Number(c.rank) : null
        }));

        const { error: metaErr } = await supabaseAdmin!
            .from('crypto_coins')
            .upsert(metaRows, { onConflict: 'id' });

        if (metaErr) throw new Error(`Failed to store crypto metadata: ${metaErr.message}`);
    }

    private async addCryptoOptions(competitionId: number): Promise<number> {
        const asOf = todayInETISODate();

        const { data: topCoins, error: topErr } = await supabaseAdmin!
            .from('crypto_prices_daily')
            .select('coin_id, rank')
            .eq('as_of_date', asOf)
            .order('rank', { ascending: true })
            .limit(100);

        if (topErr) throw new Error(`Failed to fetch top coins: ${topErr.message}`);

        let topList = topCoins ?? [];
        if (topList.length === 0) {
            const { data: fallback } = await supabaseAdmin!
                .from('crypto_coins')
                .select('id, rank')
                .order('rank', { ascending: true })
                .limit(100);

            topList = (fallback ?? []).map((r) => ({
                coin_id: String(r.id),
                rank: Number(r.rank ?? 0)
            }));
        }

        const { data: meta } = await supabaseAdmin!
            .from('crypto_coins')
            .select('id, symbol, name');

        const metaMap = new Map((meta ?? []).map((m) => [m.id as string, m]));

        const optionRows = topList.map((c) => {
            const m = metaMap.get(c.coin_id);
            return {
                competition_id: competitionId,
                symbol: (m?.symbol ?? c.coin_id).toUpperCase(),
                name: m?.name ?? c.coin_id,
                coin_id: c.coin_id,
                metadata: {},
            };
        });

        const deduped = Array.from(
            new Map(optionRows.map(r => [`${r.competition_id}|${r.symbol}`, r])).values()
        ).filter(r => r.symbol);

        if (deduped.length > 0) {
            const { error: optErr } = await supabaseAdmin!
                .from('options')
                .upsert(deduped, { onConflict: 'competition_id,symbol' });

            if (optErr) throw new Error(`Failed to add options: ${optErr.message}`);
        }

        return deduped.length;
    }
}
