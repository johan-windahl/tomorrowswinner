import { NextRequest } from 'next/server';
import { jsonError, jsonOk, readCronSecret } from '@/lib/cron';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getCompetitionConfig } from '@/lib/competitions';

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
 * Calculates results and scores for stocks competitions
 * POST /api/competition/stocks/end
 */
export async function POST(req: Request | NextRequest) {
    const auth = readCronSecret(req);
    if (!auth.ok) return jsonError(403, 'forbidden', auth);
    if (!supabaseAdmin) return jsonError(500, 'admin not configured');

    const config = getCompetitionConfig('stocks');
    if (!config) return jsonError(500, 'stocks competition config not found');

    try {
        const now = new Date();
        const today = etDate(now);
        const yesterday = etDate(new Date(now.getTime() - 24 * 60 * 60 * 1000));

        // Find stocks competitions that should be ended (evaluation period has passed)
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
                const result = await calculateStockResults(comp.id, today, yesterday, config);

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
        return jsonError(500, 'stocks competition end failed', { message });
    }
}

/**
 * Calculate results for a stocks competition
 */
async function calculateStockResults(competitionId: number, today: string, yesterday: string, config: { rules: { correctPoints: number; incorrectPoints: number; allowTies: boolean } }) {
    // Get price data for today and yesterday
    type EodRow = { symbol: string; close: number };

    const { data: todayRows } = await supabaseAdmin
        .from('equity_prices_eod')
        .select('symbol, close')
        .eq('as_of_date', today);

    const { data: yRows } = await supabaseAdmin
        .from('equity_prices_eod')
        .select('symbol, close')
        .eq('as_of_date', yesterday);

    const mapToday = new Map((todayRows as EodRow[] ?? []).map(r => [String(r.symbol).toUpperCase(), Number(r.close)]));
    const mapYesterday = new Map((yRows as EodRow[] ?? []).map(r => [String(r.symbol).toUpperCase(), Number(r.close)]));

    // Calculate percent changes and find winners
    let bestPct = -Infinity;
    const winners: string[] = [];

    for (const [symbol, closeToday] of mapToday) {
        const closeYesterday = mapYesterday.get(symbol);
        if (!closeYesterday || closeYesterday <= 0) continue;

        const pct = (closeToday - closeYesterday) / closeYesterday;

        if (pct > bestPct) {
            bestPct = pct;
            winners.length = 0;
            winners.push(symbol);
        } else if (pct === bestPct && config.rules.allowTies) {
            winners.push(symbol);
        }
    }

    // Get competition options
    const { data: options, error: optErr } = await supabaseAdmin
        .from('options')
        .select('id, symbol')
        .eq('competition_id', competitionId);

    if (optErr) throw new Error(`Failed to fetch options: ${optErr.message}`);

    const symToOpt = new Map((options ?? []).map(o => [String(o.symbol).toUpperCase(), o.id as number]));

    // Determine winner option IDs
    const winnerIds = winners
        .map(s => symToOpt.get(s))
        .filter((v): v is number => v !== undefined);

    // Store results for all options
    for (const [symbol, closeToday] of mapToday) {
        const closeYesterday = mapYesterday.get(symbol);
        if (!closeYesterday || closeYesterday <= 0) continue;

        const pct = (closeToday - closeYesterday) / closeYesterday;
        const oid = symToOpt.get(symbol);
        if (!oid) continue;

        const { error: rErr } = await supabaseAdmin
            .from('results')
            .upsert({
                competition_id: competitionId,
                option_id: oid,
                percent_change: pct,
                is_winner: winnerIds.includes(oid),
            }, { onConflict: 'competition_id,option_id' });

        if (rErr) throw new Error(`Failed to store result: ${rErr.message}`);
    }

    // Score user guesses
    const { data: guesses } = await supabaseAdmin
        .from('guesses')
        .select('user_id, option_id')
        .eq('competition_id', competitionId);

    let correctGuesses = 0;
    const totalGuesses = guesses?.length ?? 0;

    for (const g of guesses ?? []) {
        const isCorrect = winnerIds.includes(g.option_id as number);
        const points = isCorrect ? config.rules.correctPoints : config.rules.incorrectPoints;

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
        winners: winners.length,
        bestPerformance: bestPct,
        optionsEvaluated: mapToday.size,
        totalGuesses,
        correctGuesses,
        accuracy: totalGuesses > 0 ? (correctGuesses / totalGuesses) * 100 : 0,
        winningSymbols: winners,
    };
}

export async function GET() {
    return new Response('Use POST with x-cron-secret header', { status: 405 });
}
