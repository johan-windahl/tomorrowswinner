import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { jsonError, jsonOk, readCronSecret, todayInETISODate } from '@/lib/cron';
import { SP500_FALLBACK } from '@/data/sp500-fallback';

export async function POST(req: Request | NextRequest) {
    const auth = readCronSecret(req);
    if (!auth.ok) return jsonError(403, 'forbidden', auth);
    if (!supabaseAdmin) return jsonError(500, 'admin not configured');

    // 1) Constituents (försök flera källor; sista fallback liten lista)
    let symbols: Array<{ symbol: string; name: string }> = [];
    try {
        const res = await fetch('https://datahub.io/core/s-and-p-500-companies/r/constituents.json', { headers: { 'Accept': 'application/json' } });
        if (res.ok) {
            const arr = (await res.json()) as Array<{ Symbol: string; Name: string }>;
            symbols = arr.map((a) => ({ symbol: a.Symbol, name: a.Name }));
        }
    } catch (_) { }
    if (symbols.length === 0) {
        try {
            const res2 = await fetch('https://raw.githubusercontent.com/datasets/s-and-p-500-companies/master/data/constituents.json', { headers: { 'Accept': 'application/json' } });
            if (res2.ok) {
                const arr = (await res2.json()) as Array<{ Symbol: string; Name: string }>;
                symbols = arr.map((a) => ({ symbol: a.Symbol, name: a.Name }));
            }
        } catch (_) { }
    }
    if (symbols.length === 0) {
        // Använd vår inbyggda fallback-lista med 50+ välkända aktier
        symbols = SP500_FALLBACK.map((s) => ({ symbol: s.Symbol, name: s.Name }));
    }
    const upRows = symbols.map((s) => ({ symbol: s.symbol.toUpperCase(), name: s.name }));
    const { error: tickErr } = await supabaseAdmin.from('equity_tickers').upsert(upRows, { onConflict: 'symbol' });
    if (tickErr) return jsonError(500, 'tickers upsert error', { code: tickErr.code, message: tickErr.message });

    // Remove tickers no longer in index (keep data fresh daily)
    const newSet = new Set(upRows.map((r) => r.symbol));
    const { data: existing } = await supabaseAdmin.from('equity_tickers').select('symbol');
    const toDelete = (existing ?? [])
        .map((r: any) => String(r.symbol).toUpperCase())
        .filter((sym) => !newSet.has(sym));
    if (toDelete.length > 0) {
        await supabaseAdmin.from('equity_tickers').delete().in('symbol', toDelete);
    }

    // 2) EOD prices via Stooq CSV (one by one for fallback)
    const asOf = todayInETISODate();
    const stooqMap: Record<string, string> = {
        'GOOGL': 'googl',
        'META': 'meta',
        'BRK.B': 'brk-b',
    };
    // Process stocks in batches with timeout handling
    const batch = symbols; // Process all stocks
    const batchSize = 50; // Process in chunks for better performance
    const totalBatches = Math.ceil(batch.length / batchSize);
    let processedCount = 0;

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const startIndex = batchIndex * batchSize;
        const endIndex = Math.min(startIndex + batchSize, batch.length);
        const currentBatch = batch.slice(startIndex, endIndex);

        // Process batch concurrently with promise settling
        const promises = currentBatch.map(async (s) => {
            const sym = s.symbol.toUpperCase();
            const stooqSym = stooqMap[sym] ?? sym;
            try {
                const url = `https://stooq.com/q/d/l/?s=${stooqSym}.us&i=d`;
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout per request

                const res = await fetch(url, {
                    signal: controller.signal,
                    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TomorrowsWinner/1.0)' }
                });
                clearTimeout(timeoutId);

                if (!res.ok) return { success: false, symbol: sym, error: `HTTP ${res.status}` };

                const csv = await res.text();
                const lines = csv.trim().split(/\r?\n/);
                if (lines.length < 2) return { success: false, symbol: sym, error: 'No data rows' };

                const header = lines[0].split(',');
                const dateIdx = header.indexOf('Date');
                const closeIdx = header.indexOf('Close');

                if (dateIdx === -1 || closeIdx === -1) {
                    return { success: false, symbol: sym, error: 'Missing Date or Close column' };
                }

                const rows = lines.slice(1).map((l) => l.split(','));
                const last = rows[rows.length - 1];
                const date = last?.[dateIdx];
                const close = last?.[closeIdx] ? Number(last[closeIdx]) : null;

                if (!date || close == null || Number.isNaN(close)) {
                    return { success: false, symbol: sym, error: 'Invalid date or price data' };
                }

                const { error: eodErr } = await supabaseAdmin
                    .from('equity_prices_eod')
                    .upsert({ symbol: sym, as_of_date: date, close }, { onConflict: 'symbol,as_of_date' });

                if (eodErr) {
                    return { success: false, symbol: sym, error: `DB error: ${eodErr.message}` };
                }

                return { success: true, symbol: sym, date, close };
            } catch (e) {
                return { success: false, symbol: sym, error: String(e) };
            }
        });

        // Wait for all promises in this batch to settle
        const results = await Promise.allSettled(promises);
        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        processedCount += successful;

        // Log progress for monitoring
        console.log(`Batch ${batchIndex + 1}/${totalBatches}: ${successful}/${currentBatch.length} successful, total: ${processedCount}/${batch.length}`);

        // Small delay between batches to be respectful to the API
        if (batchIndex < totalBatches - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    return jsonOk({ symbols: batch.length, processed: processedCount, asOf });
}

export async function GET() {
    return new Response('Use POST with header x-cron-secret or ?secret=...', { status: 405 });
}


