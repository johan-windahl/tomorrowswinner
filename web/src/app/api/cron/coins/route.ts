import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { jsonError, jsonOk, readCronSecret, todayInETISODate } from '@/lib/cron';

type CoinCapAsset = {
    id: string;
    symbol: string;
    name: string;
    priceUsd: string;
    marketCapUsd?: string;
    rank?: string;
};

export async function POST(req: Request | NextRequest) {
    const auth = readCronSecret(req);
    if (!auth.ok) return jsonError(403, 'forbidden', auth);
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return jsonError(500, 'missing NEXT_PUBLIC_SUPABASE_URL');
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return jsonError(500, 'missing SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseAdmin) return jsonError(500, 'admin not configured');

    try {
        // Primary: CoinCap top-100
        const urlCap = 'https://api.coincap.io/v2/assets?limit=100';
        const resCap = await fetch(urlCap, { headers: { 'Accept': 'application/json', 'User-Agent': 'tomorrowswinner-cron/1.0' } });
        let coins: CoinCapAsset[] = [];
        if (resCap.ok) {
            const json = await resCap.json();
            coins = (json?.data ?? []) as CoinCapAsset[];
        } else {
            const text = await resCap.text();
            console.error('coincap non-200', resCap.status, text);
            // Fallback: CoinPaprika tickers (no key)
            const urlPap = 'https://api.coinpaprika.com/v1/tickers?limit=100';
            const resPaprika = await fetch(urlPap, { headers: { 'Accept': 'application/json', 'User-Agent': 'tomorrowswinner-cron/1.0' } });
            if (!resPaprika.ok) {
                const t2 = await resPaprika.text();
                console.error('coinpaprika non-200', resPaprika.status, t2);
                return jsonError(502, 'both sources failed', { coincapStatus: resCap.status, coinpaprikaStatus: resPaprika.status });
            }
            const arr = (await resPaprika.json()) as Array<{ id: string; name: string; symbol: string; rank?: number; quotes?: { USD?: { price?: number; market_cap?: number } } }>;
            coins = arr.map((c) => ({
                id: c.id,
                name: c.name,
                symbol: c.symbol,
                rank: c.rank ? String(c.rank) : undefined,
                priceUsd: c.quotes?.USD?.price != null ? String(c.quotes.USD.price) : '0',
                marketCapUsd: c.quotes?.USD?.market_cap != null ? String(c.quotes.USD.market_cap) : undefined,
            }));
        }

        const asOf = todayInETISODate();
        const rows = coins.map((c) => ({
            coin_id: c.id,
            as_of_date: asOf,
            price_usd: c.priceUsd ? Number(c.priceUsd) : null,
            market_cap: c.marketCapUsd ? Number(c.marketCapUsd) : null,
            rank: c.rank ? Number(c.rank) : null,
        }));

        const { error } = await supabaseAdmin
            .from('crypto_prices_daily')
            .upsert(rows, { onConflict: 'coin_id,as_of_date' });
        if (error) return jsonError(500, 'supabase upsert error', { code: error.code, message: error.message });

        // Upsert top-100 metadata
        const metaRows = coins.map((c) => ({ id: c.id, symbol: c.symbol, name: c.name ?? c.id, rank: c.rank ? Number(c.rank) : null }));
        const { error: metaErr } = await supabaseAdmin.from('crypto_coins').upsert(metaRows, { onConflict: 'id' });
        if (metaErr) return jsonError(500, 'supabase meta upsert error', { code: metaErr.code, message: metaErr.message });

        return jsonOk({ count: rows.length, asOf });
    } catch (e) {
        const msg = e instanceof Error ? e.message : 'unknown error';
        return jsonError(500, 'unexpected', { message: msg });
    }
}

export async function GET() {
    return new Response('Use POST with header x-cron-secret or ?secret=...', { status: 405 });
}


