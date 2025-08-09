import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type CoinCapAsset = {
    id: string;
    symbol: string;
    name: string;
    priceUsd: string;
    marketCapUsd?: string;
    rank?: string;
};

function todayInETISODate(): string {
    const now = new Date();
    const fmt = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' });
    const parts = fmt.formatToParts(now);
    const y = parts.find((p) => p.type === 'year')?.value ?? '1970';
    const m = parts.find((p) => p.type === 'month')?.value ?? '01';
    const d = parts.find((p) => p.type === 'day')?.value ?? '01';
    return `${y}-${m}-${d}`;
}

export async function POST(req: NextRequest) {
    const envSecretRaw = process.env.CRON_SECRET ?? '';
    const expected = envSecretRaw.replace(/^['"]|['"]$/g, '');
    const providedHeader = req.headers.get('x-cron-secret');
    const providedQuery = new URL(req.url).searchParams.get('secret');
    let providedBody: string | null = null;
    try {
        const ct = req.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
            const body = await req.json().catch(() => null);
            if (body && typeof body.secret === 'string') providedBody = body.secret;
        }
    } catch (_) { }
    const provided = providedHeader ?? providedQuery ?? providedBody ?? '';
    console.log('cron coins auth', {
        hasHeader: !!providedHeader,
        hasQuery: !!providedQuery,
        hasBody: !!providedBody,
        expectedLen: expected.length,
        providedLen: provided.length,
    });
    if (!expected || provided !== expected) return new Response('forbidden', { status: 403 });
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return new Response('missing NEXT_PUBLIC_SUPABASE_URL', { status: 500 });
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return new Response('missing SUPABASE_SERVICE_ROLE_KEY', { status: 500 });
    if (!supabaseAdmin) return new Response('admin not configured', { status: 500 });

    try {
        // Primary: CoinCap top-100
        const urlCap = 'https://api.coincap.io/v2/assets?limit=100';
        let res = await fetch(urlCap, { headers: { 'Accept': 'application/json', 'User-Agent': 'tomorrowswinner-cron/1.0' } });
        let coins: CoinCapAsset[] = [];
        if (res.ok) {
            const json = await res.json();
            coins = (json?.data ?? []) as CoinCapAsset[];
        } else {
            const text = await res.text();
            console.error('coincap non-200', res.status, text);
            // Fallback: CoinPaprika tickers (no key)
            const urlPap = 'https://api.coinpaprika.com/v1/tickers?limit=100';
            const resPap = await fetch(urlPap, { headers: { 'Accept': 'application/json', 'User-Agent': 'tomorrowswinner-cron/1.0' } });
            if (!resPap.ok) {
                const t2 = await resPap.text();
                console.error('coinpaprika non-200', resPap.status, t2);
                return new Response(`both sources failed: coincap ${res.status}, coinpaprika ${resPap.status}`, { status: 502 });
            }
            const arr = (await resPap.json()) as Array<{ id: string; name: string; symbol: string; rank?: number; quotes?: { USD?: { price?: number; market_cap?: number } } }>;
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
        if (error) return new Response(`supabase upsert error: ${error.message}`, { status: 500 });

        // Upsert top-100 metadata
        const metaRows = coins.map((c) => ({ id: c.id, symbol: c.symbol, name: c.name ?? c.id, rank: c.rank ? Number(c.rank) : null }));
        const { error: metaErr } = await supabaseAdmin.from('crypto_coins').upsert(metaRows, { onConflict: 'id' });
        if (metaErr) return new Response(`supabase meta upsert error: ${metaErr.message}`, { status: 500 });

        return Response.json({ ok: true, count: rows.length, asOf });
    } catch (e) {
        const msg = e instanceof Error ? e.message : 'unknown error';
        console.error('coins route fatal error', e);
        return new Response(`unexpected: ${msg}`, { status: 500 });
    }
}

export async function GET() {
    return new Response('Use POST with header x-cron-secret or ?secret=...', { status: 405 });
}


