import { NextRequest } from 'next/server';
import { jsonError, jsonOk, readCronSecret, todayInETISODate } from '@/lib/cron';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import {
    getCompetitionConfig,
    generateCompetitionTiming,
    generateCompetitionSlug,
    shouldRunCompetition
} from '@/lib/competitions';

type CoinCapAsset = {
    id: string;
    symbol: string;
    name: string;
    priceUsd: string;
    marketCapUsd?: string;
    rank?: string;
};

/**
 * Creates a new crypto competition and fetches required data
 * POST /api/competition/crypto/new
 */
export async function POST(req: Request | NextRequest) {
    const auth = readCronSecret(req);
    if (!auth.ok) return jsonError(403, 'forbidden', auth);
    if (!supabaseAdmin) return jsonError(500, 'admin not configured');

    const config = getCompetitionConfig('crypto');
    if (!config) return jsonError(500, 'crypto competition config not found');

    const timing = generateCompetitionTiming();
    const tomorrowDate = new Date(timing.startAt);

    // Check if competition should run (crypto runs daily)
    if (!shouldRunCompetition(config, tomorrowDate)) {
        return jsonOk({ skipped: true, reason: 'not scheduled for this date' });
    }

    const slug = generateCompetitionSlug('crypto-best', tomorrowDate);

    try {
        // 1. Fetch fresh crypto data
        await fetchCryptoData();

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

        // 3. Add crypto options
        const optionsAdded = await addCryptoOptions(compRow.id);

        return jsonOk({
            competition: {
                id: compRow.id,
                slug,
                title: compRow.title,
                timing,
            },
            optionsAdded,
            dataFetched: true,
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : 'unknown error';
        return jsonError(500, 'crypto competition creation failed', { message });
    }
}

/**
 * Fetch crypto data from external APIs
 */
async function fetchCryptoData(): Promise<void> {
    let coins: CoinCapAsset[] = [];

    try {
        // Primary: CoinCap top-100
        const urlCap = 'https://api.coincap.io/v2/assets?limit=100';
        const resCap = await fetch(urlCap, {
            headers: { 'Accept': 'application/json', 'User-Agent': 'tomorrowswinner-cron/1.0' }
        });

        if (resCap.ok) {
            const json = await resCap.json();
            coins = (json?.data ?? []) as CoinCapAsset[];
        } else {
            // Fallback: CoinPaprika
            const urlPap = 'https://api.coinpaprika.com/v1/tickers?limit=100';
            const resPaprika = await fetch(urlPap, {
                headers: { 'Accept': 'application/json', 'User-Agent': 'tomorrowswinner-cron/1.0' }
            });

            if (!resPaprika.ok) {
                throw new Error(`Both crypto APIs failed: CoinCap ${resCap.status}, CoinPaprika ${resPaprika.status}`);
            }

            const arr = await resPaprika.json() as Array<{
                id: string; name: string; symbol: string; rank?: number;
                quotes?: { USD?: { price?: number; market_cap?: number } }
            }>;

            coins = arr.map((c) => ({
                id: c.id,
                name: c.name,
                symbol: c.symbol,
                rank: c.rank ? String(c.rank) : undefined,
                priceUsd: c.quotes?.USD?.price != null ? String(c.quotes.USD.price) : '0',
                marketCapUsd: c.quotes?.USD?.market_cap != null ? String(c.quotes.USD.market_cap) : undefined,
            }));
        }
    } catch (error) {
        throw new Error(`Failed to fetch crypto data: ${error}`);
    }

    // Store price data
    const asOf = todayInETISODate();
    const priceRows = coins.map((c) => ({
        coin_id: c.id,
        as_of_date: asOf,
        price_usd: c.priceUsd ? Number(c.priceUsd) : null,
        market_cap: c.marketCapUsd ? Number(c.marketCapUsd) : null,
        rank: c.rank ? Number(c.rank) : null,
    }));

    const { error: priceErr } = await supabaseAdmin
        .from('crypto_prices_daily')
        .upsert(priceRows, { onConflict: 'coin_id,as_of_date' });

    if (priceErr) throw new Error(`Failed to store crypto prices: ${priceErr.message}`);

    // Store metadata
    const metaRows = coins.map((c) => ({
        id: c.id,
        symbol: c.symbol,
        name: c.name ?? c.id,
        rank: c.rank ? Number(c.rank) : null
    }));

    const { error: metaErr } = await supabaseAdmin
        .from('crypto_coins')
        .upsert(metaRows, { onConflict: 'id' });

    if (metaErr) throw new Error(`Failed to store crypto metadata: ${metaErr.message}`);
}

/**
 * Add crypto options to competition
 */
async function addCryptoOptions(competitionId: number): Promise<number> {
    const asOf = todayInETISODate();

    // Get top 100 coins
    const { data: topCoins, error: topErr } = await supabaseAdmin
        .from('crypto_prices_daily')
        .select('coin_id, rank')
        .eq('as_of_date', asOf)
        .order('rank', { ascending: true })
        .limit(100);

    if (topErr) throw new Error(`Failed to fetch top coins: ${topErr.message}`);

    let topList = topCoins ?? [];
    if (topList.length === 0) {
        // Fallback: use crypto_coins by rank
        const { data: fallback } = await supabaseAdmin
            .from('crypto_coins')
            .select('id, rank')
            .order('rank', { ascending: true })
            .limit(100);

        topList = (fallback ?? []).map((r) => ({
            coin_id: String(r.id),
            rank: Number(r.rank ?? 0)
        }));
    }

    // Get metadata
    const { data: meta } = await supabaseAdmin
        .from('crypto_coins')
        .select('id, symbol, name');

    const metaMap = new Map((meta ?? []).map((m) => [m.id as string, m]));

    // Create option rows
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

    // Deduplicate by symbol
    const deduped = Array.from(
        new Map(optionRows.map(r => [`${r.competition_id}|${r.symbol}`, r])).values()
    ).filter(r => r.symbol);

    if (deduped.length > 0) {
        const { error: optErr } = await supabaseAdmin
            .from('options')
            .upsert(deduped, { onConflict: 'competition_id,symbol' });

        if (optErr) throw new Error(`Failed to add options: ${optErr.message}`);
    }

    return deduped.length;
}

export async function GET() {
    return new Response('Use POST with x-cron-secret header', { status: 405 });
}
