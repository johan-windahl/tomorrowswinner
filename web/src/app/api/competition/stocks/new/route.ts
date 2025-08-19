import { NextRequest } from 'next/server';
import { jsonError, jsonOk, readCronSecret } from '@/lib/cron';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NASDAQ100_FALLBACK } from '@/data/nasdaq100-fallback';
import {
    getCompetitionConfig,
    generateCompetitionTiming,
    generateCompetitionSlug,
    shouldRunCompetition
} from '@/lib/competitions';
import yahooFinance from 'yahoo-finance2';

/**
 * Creates a new stocks competition and fetches required data
 * POST /api/competition/stocks/new
 */
export async function POST(req: Request | NextRequest) {
    const auth = readCronSecret(req);
    if (!auth.ok) return jsonError(403, 'forbidden', auth);
    if (!supabaseAdmin) return jsonError(500, 'admin not configured');

    const config = getCompetitionConfig('stocks');
    if (!config) return jsonError(500, 'stocks competition config not found');

    const timing = generateCompetitionTiming();
    const tomorrowDate = new Date(timing.startAt);

    // Check if competition should run (stocks only on weekdays)
    if (!shouldRunCompetition(config, tomorrowDate)) {
        return jsonOk({ skipped: true, reason: 'market closed (weekend)' });
    }

    const slug = generateCompetitionSlug('nasdaq100-best', tomorrowDate);

    try {
        // 1. Fetch fresh stock data
        const stocksProcessed = await fetchStockData();

        // 2. Create competition
        const { data: compRow, error: cErr } = await supabaseAdmin
            .from('competitions')
            .upsert([{
                category: config.category,
                title: `${config.name}`,
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

        // 3. Add stock options
        const optionsAdded = await addStockOptions(compRow.id);

        return jsonOk({
            competition: {
                id: compRow.id,
                slug,
                title: compRow.title,
                timing,
            },
            optionsAdded,
            stocksProcessed,
            dataFetched: true,
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : 'unknown error';
        return jsonError(500, 'stocks competition creation failed', { message });
    }
}

/**
 * Fetch Nasdaq 100 constituents and stock prices using Yahoo Finance
 */
async function fetchStockData(): Promise<number> {
    // 1. Use Nasdaq 100 constituents from our curated list
    // Since there's no reliable free API for Nasdaq 100 constituents,
    // we use our comprehensive fallback list which is regularly maintained
    let symbols: Array<{ symbol: string; name: string }> = [];

    // Use our curated Nasdaq 100 list as the primary source
    symbols = NASDAQ100_FALLBACK.map(s => ({ symbol: s.Symbol, name: s.Name }));

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

    // 2. Fetch stock prices using Yahoo Finance
    const batchSize = 25; // Yahoo Finance can handle reasonable batches
    const totalBatches = Math.ceil(symbols.length / batchSize);
    let processedCount = 0;

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const startIndex = batchIndex * batchSize;
        const endIndex = Math.min(startIndex + batchSize, symbols.length);
        const currentBatch = symbols.slice(startIndex, endIndex);

        const promises = currentBatch.map(async (s) => {
            const sym = s.symbol.toUpperCase();

            try {
                // Get current date in EST timezone for consistency
                const now = new Date();
                const endDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)); // Convert to UTC
                const startDate = new Date(endDate.getTime() - (7 * 24 * 60 * 60 * 1000)); // 7 days ago

                // Fetch historical data from Yahoo Finance
                const historical = await yahooFinance.historical(sym, {
                    period1: startDate,
                    period2: endDate,
                    interval: '1d',
                });

                if (!historical || historical.length === 0) {
                    return { success: false, symbol: sym };
                }

                // Get the most recent trading day data
                const latestData = historical[historical.length - 1];
                const previousData = historical.length > 1 ? historical[historical.length - 2] : null;

                if (!latestData || !latestData.close) {
                    return { success: false, symbol: sym };
                }

                // Format date as YYYY-MM-DD
                const date = latestData.date.toISOString().split('T')[0];
                const close = latestData.close;
                const previousClose = previousData?.close || null;

                // Calculate daily change percentage
                let dailyChangePercent = null;
                if (previousClose && previousClose > 0) {
                    dailyChangePercent = ((close - previousClose) / previousClose) * 100;
                }

                // Store the latest price data with additional fields
                const { error: eodErr } = await supabaseAdmin
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

                return {
                    success: true,
                    symbol: sym,
                    date,
                    close,
                    previousClose,
                    dailyChangePercent
                };
            } catch (error) {
                console.error(`Error fetching data for ${sym}:`, error);
                return { success: false, symbol: sym };
            }
        });

        const results = await Promise.allSettled(promises);
        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        processedCount += successful;

        // Small delay between batches to be respectful to Yahoo Finance
        if (batchIndex < totalBatches - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    return processedCount;
}

/**
 * Add stock options to competition
 */
async function addStockOptions(competitionId: number): Promise<number> {
    // First, clear any existing options for this competition
    await supabaseAdmin
        .from('options')
        .delete()
        .eq('competition_id', competitionId);

    // Use only the current Nasdaq 100 symbols, not all tickers from database
    // This ensures we only add the stocks we want, regardless of what's in equity_tickers
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
        const { error: upErr } = await supabaseAdmin
            .from('options')
            .upsert(chunk, { onConflict: 'competition_id,symbol' });

        if (upErr) throw new Error(`Failed to add options chunk: ${upErr.message}`);
        totalAdded += chunk.length;
    }

    return totalAdded;
}

export async function GET() {
    return new Response('Use POST with x-cron-secret header', { status: 405 });
}
