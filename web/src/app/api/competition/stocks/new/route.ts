import { NextRequest } from 'next/server';
import { jsonError, jsonOk, readCronSecret } from '@/lib/cron';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { SP500_FALLBACK } from '@/data/sp500-fallback';
import {
    getCompetitionConfig,
    generateCompetitionTiming,
    generateCompetitionSlug,
    shouldRunCompetition
} from '@/lib/competitions';

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

    const slug = generateCompetitionSlug('sp500-best', tomorrowDate);

    try {
        // 1. Fetch fresh stock data
        const stocksProcessed = await fetchStockData();

        // 2. Create competition
        const { data: compRow, error: cErr } = await supabaseAdmin
            .from('competitions')
            .upsert([{
                category: config.category,
                title: `${config.name} ${tomorrowDate.toISOString().split('T')[0]}`,
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
 * Fetch S&P 500 constituents and stock prices
 */
async function fetchStockData(): Promise<number> {
    // 1. Fetch S&P 500 constituents
    let symbols: Array<{ symbol: string; name: string }> = [];

    try {
        const res = await fetch('https://datahub.io/core/s-and-p-500-companies/r/constituents.json', {
            headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
            const arr = await res.json() as Array<{ Symbol: string; Name: string }>;
            symbols = arr.map(a => ({ symbol: a.Symbol, name: a.Name }));
        }
    } catch {
        // Ignore error, try fallback
    }

    if (symbols.length === 0) {
        try {
            const res2 = await fetch('https://raw.githubusercontent.com/datasets/s-and-p-500-companies/master/data/constituents.json', {
                headers: { 'Accept': 'application/json' }
            });

            if (res2.ok) {
                const arr = await res2.json() as Array<{ Symbol: string; Name: string }>;
                symbols = arr.map(a => ({ symbol: a.Symbol, name: a.Name }));
            }
        } catch {
            // Ignore error, use built-in fallback
        }
    }

    if (symbols.length === 0) {
        // Use fallback list
        symbols = SP500_FALLBACK.map(s => ({ symbol: s.Symbol, name: s.Name }));
    }

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

    // 2. Fetch stock prices
    const stooqMap: Record<string, string> = {
        'GOOGL': 'googl',
        'META': 'meta',
        'BRK.B': 'brk-b',
    };

    const batchSize = 50;
    const totalBatches = Math.ceil(symbols.length / batchSize);
    let processedCount = 0;

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const startIndex = batchIndex * batchSize;
        const endIndex = Math.min(startIndex + batchSize, symbols.length);
        const currentBatch = symbols.slice(startIndex, endIndex);

        const promises = currentBatch.map(async (s) => {
            const sym = s.symbol.toUpperCase();
            const stooqSym = stooqMap[sym] ?? sym;

            try {
                const url = `https://stooq.com/q/d/l/?s=${stooqSym}.us&i=d`;
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);

                const res = await fetch(url, {
                    signal: controller.signal,
                    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TomorrowsWinner/1.0)' }
                });
                clearTimeout(timeoutId);

                if (!res.ok) return { success: false, symbol: sym };

                const csv = await res.text();
                const lines = csv.trim().split(/\r?\n/);
                if (lines.length < 2) return { success: false, symbol: sym };

                const header = lines[0].split(',');
                const dateIdx = header.indexOf('Date');
                const closeIdx = header.indexOf('Close');

                if (dateIdx === -1 || closeIdx === -1) {
                    return { success: false, symbol: sym };
                }

                const rows = lines.slice(1).map(l => l.split(','));
                const last = rows[rows.length - 1];
                const date = last?.[dateIdx];
                const close = last?.[closeIdx] ? Number(last[closeIdx]) : null;

                if (!date || close == null || Number.isNaN(close)) {
                    return { success: false, symbol: sym };
                }

                const { error: eodErr } = await supabaseAdmin
                    .from('equity_prices_eod')
                    .upsert({ symbol: sym, as_of_date: date, close }, { onConflict: 'symbol,as_of_date' });

                if (eodErr) return { success: false, symbol: sym };

                return { success: true, symbol: sym, date, close };
            } catch {
                return { success: false, symbol: sym };
            }
        });

        const results = await Promise.allSettled(promises);
        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        processedCount += successful;

        // Small delay between batches
        if (batchIndex < totalBatches - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    return processedCount;
}

/**
 * Add stock options to competition
 */
async function addStockOptions(competitionId: number): Promise<number> {
    const { data: tickers } = await supabaseAdmin
        .from('equity_tickers')
        .select('symbol, name');

    if (!tickers || tickers.length === 0) {
        throw new Error('No stock tickers available');
    }

    const deduped = Array.from(new Map(tickers.map(t => [t.symbol.toUpperCase(), t])).values());
    const rows = deduped.map(t => ({
        competition_id: competitionId,
        symbol: t.symbol.toUpperCase(),
        name: t.name ?? t.symbol,
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
