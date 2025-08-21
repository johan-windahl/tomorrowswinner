import { NextRequest } from 'next/server';
import { jsonError, jsonOk, readCronSecret } from '@/lib/cron';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getCompetitionConfig } from '@/lib/competitions';
import { RANKING_POINTS, type ScoringRank } from '@/lib/constants';

function etDate(d: Date) {
    const fmt = new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    const parts = fmt.formatToParts(d);
    const y = parts.find((p) => p.type === 'year')?.value ?? '1970';
    const m = parts.find((p) => p.type === 'month')?.value ?? '01';
    const dd = parts.find((p) => p.type === 'day')?.value ?? '01';
    return `${y}-${m}-${dd}`;
}

/**
 * Calculates results and scores for crypto competitions
 * POST /api/competition/crypto/end
 */
export async function POST(req: Request | NextRequest) {
    const auth = readCronSecret(req);
    if (!auth.ok) return jsonError(403, 'forbidden', auth);
    if (!supabaseAdmin) return jsonError(500, 'admin not configured');

    const config = getCompetitionConfig('crypto');
    if (!config) return jsonError(500, 'crypto competition config not found');

    try {
        const now = new Date();
        const today = etDate(now);
        const yesterday = etDate(new Date(now.getTime() - 24 * 60 * 60 * 1000));

        // Find crypto competitions that should be ended (evaluation period has passed)
        const { data: competitions, error: compErr } = await supabaseAdmin
            .from('competitions')
            .select('id, slug, evaluation_end_at, title')
            .eq('category', config.category)
            .lt('evaluation_end_at', now.toISOString())
            .is('ended_at', null); // Not already ended

        if (compErr) return jsonError(500, 'failed to fetch competitions', { code: compErr.code, message: compErr.message });

        const endedCompetitions = [];

        for (const comp of competitions ?? []) {
            try {
                const result = await calculateCryptoResults(comp.id, today, yesterday, config);

                // Mark competition as ended
                const { error: updateErr } = await supabaseAdmin
                    .from('competitions')
                    .update({ ended_at: now.toISOString() })
                    .eq('id', comp.id);

                if (updateErr) {
                    console.error(`Failed to mark competition ${comp.slug} as ended:`, updateErr.message);
                    continue;
                }

                endedCompetitions.push({
                    id: comp.id,
                    slug: comp.slug,
                    title: comp.title,
                    endedAt: now.toISOString(),
                    ...result,
                });

            } catch (error) {
                console.error(`Failed to calculate results for competition ${comp.slug}:`, error);
                continue;
            }
        }

        return jsonOk({
            ended: endedCompetitions.length,
            competitions: endedCompetitions,
            timestamp: now.toISOString(),
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : 'unknown error';
        return jsonError(500, 'crypto competition end failed', { message });
    }
}

/**
 * Calculate results for a crypto competition
 */
async function calculateCryptoResults(competitionId: number, today: string, yesterday: string, config: { rules: { allowTies: boolean; maxScoringRank: number } }) {
    if (!supabaseAdmin) throw new Error('Supabase admin not configured');

    // Get price data for today and yesterday
    type PriceRow = { coin_id: string; price_usd: number };

    const { data: todayRows } = await supabaseAdmin
        .from('crypto_prices_daily')
        .select('coin_id, price_usd')
        .eq('as_of_date', today);

    const { data: yRows } = await supabaseAdmin
        .from('crypto_prices_daily')
        .select('coin_id, price_usd')
        .eq('as_of_date', yesterday);

    const mapToday = new Map((todayRows as PriceRow[] ?? []).map(r => [r.coin_id, Number(r.price_usd)]));
    const mapYesterday = new Map((yRows as PriceRow[] ?? []).map(r => [r.coin_id, Number(r.price_usd)]));

    // Calculate percent changes and find winners
    let bestPct = -Infinity;
    const best: { coin_id: string; pct: number }[] = [];

    for (const [coin, priceToday] of mapToday) {
        const priceYesterday = mapYesterday.get(coin);
        if (!priceYesterday || priceYesterday <= 0) continue;

        const pct = (priceToday - priceYesterday) / priceYesterday;

        if (pct > bestPct) {
            bestPct = pct;
            best.length = 0;
            best.push({ coin_id: coin, pct });
        } else if (pct === bestPct && config.rules.allowTies) {
            best.push({ coin_id: coin, pct });
        }
    }

    // Get competition options
    const { data: options, error: optErr } = await supabaseAdmin
        .from('options')
        .select('id, coin_id')
        .eq('competition_id', competitionId);

    if (optErr) throw new Error(`Failed to fetch options: ${optErr.message}`);

    const coinToOption = new Map((options ?? []).map(o => [o.coin_id as string, o.id as number]));

    // Determine winner option IDs
    const winnerOptionIds: number[] = [];
    for (const b of best) {
        const oid = coinToOption.get(b.coin_id);
        if (oid) winnerOptionIds.push(oid);
    }

    // Store results for all options
    for (const [coin, priceToday] of mapToday) {
        const priceYesterday = mapYesterday.get(coin);
        if (!priceYesterday || priceYesterday <= 0) continue;

        const pct = (priceToday - priceYesterday) / priceYesterday;
        const oid = coinToOption.get(coin);
        if (!oid) continue;

        const { error: rErr } = await supabaseAdmin
            .from('results')
            .upsert({
                competition_id: competitionId,
                option_id: oid,
                percent_change: pct,
                is_winner: winnerOptionIds.includes(oid),
            }, { onConflict: 'competition_id,option_id' });

        if (rErr) throw new Error(`Failed to store result: ${rErr.message}`);
    }

    // Calculate rankings for all coins
    const coinRankings: { coin_id: string; rank: number; pct: number }[] = [];
    for (const [coin, priceToday] of mapToday) {
        const priceYesterday = mapYesterday.get(coin);
        if (!priceYesterday || priceYesterday <= 0) continue;

        const pct = (priceToday - priceYesterday) / priceYesterday;
        coinRankings.push({ coin_id: coin, rank: 0, pct });
    }

    // Sort by percentage change (highest first) and assign ranks
    coinRankings.sort((a, b) => b.pct - a.pct);
    coinRankings.forEach((coin, index) => {
        coin.rank = index + 1;
    });

    // Score user guesses using ranking system
    const { data: guesses } = await supabaseAdmin
        .from('guesses')
        .select('user_id, option_id')
        .eq('competition_id', competitionId);

    let correctGuesses = 0;
    const totalGuesses = guesses?.length ?? 0;

    for (const g of guesses ?? []) {
        const optionId = g.option_id as number;
        const coinId = Array.from(coinToOption.entries()).find(([, oid]) => oid === optionId)?.[0];

        if (!coinId) continue;

        const ranking = coinRankings.find(r => r.coin_id === coinId);
        if (!ranking) continue;

        const isCorrect = winnerOptionIds.includes(optionId);
        const points = ranking.rank <= config.rules.maxScoringRank ? RANKING_POINTS[ranking.rank as ScoringRank] || 0 : 0;

        if (isCorrect) correctGuesses++;

        const { error: sErr } = await supabaseAdmin
            .from('scores')
            .upsert({
                user_id: g.user_id as string,
                competition_id: competitionId,
                points,
            }, { onConflict: 'user_id,competition_id' });

        if (sErr) throw new Error(`Failed to store score: ${sErr.message}`);
    }

    return {
        winners: best.length,
        bestPerformance: bestPct,
        optionsEvaluated: mapToday.size,
        totalGuesses,
        correctGuesses,
        accuracy: totalGuesses > 0 ? (correctGuesses / totalGuesses) * 100 : 0,
    };
}

export async function GET() {
    return new Response('Use POST with x-cron-secret header', { status: 405 });
}
