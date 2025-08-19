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
 * Calculate results for a stocks competition using the new ranking-based scoring system
 * 
 * SCORING SYSTEM EXPLANATION:
 * Instead of binary correct/incorrect scoring, we now use a graduated system:
 * - Rank #1: 100 points (perfect pick)
 * - Rank #2: 60 points (very close)
 * - Rank #3: 40 points (close)
 * - Rank #4: 25 points (good)
 * - Rank #5: 20 points (decent)
 * - ... down to rank #16: 1 point (minimal participation)
 * - Rank #17+: 0 points (no reward)
 * 
 * This encourages strategic thinking and rewards users who consistently pick 
 * top-performing stocks, even if they don't get the exact #1 winner.
 */
async function calculateStockResults(competitionId: number, today: string, yesterday: string, config: { rules: { allowTies: boolean; maxScoringRank: number } }) {
    if (!supabaseAdmin) throw new Error('Supabase admin client not configured');

    // Get price data for today and yesterday
    type EodRow = {
        symbol: string;
        close: number;
        previous_close?: number;
        daily_change_percent?: number;
    };

    const { data: todayRows } = await supabaseAdmin
        .from('equity_prices_eod')
        .select('symbol, close, previous_close, daily_change_percent')
        .eq('as_of_date', today);

    const { data: yRows } = await supabaseAdmin
        .from('equity_prices_eod')
        .select('symbol, close, previous_close, daily_change_percent')
        .eq('as_of_date', yesterday);

    const mapToday = new Map((todayRows as EodRow[] ?? []).map(r => [String(r.symbol).toUpperCase(), r]));
    const mapYesterday = new Map((yRows as EodRow[] ?? []).map(r => [String(r.symbol).toUpperCase(), r]));

    // Calculate percent changes for all stocks and create ranking
    interface StockPerformance {
        symbol: string;
        changePercent: number;
        rank: number;
    }

    const stockPerformances: StockPerformance[] = [];
    let bestPct = -Infinity;

    for (const [symbol, todayRow] of mapToday) {
        const closeToday = todayRow.close;

        // Use Yahoo Finance daily_change_percent if available, otherwise calculate manually
        let pct: number;
        if (todayRow.daily_change_percent !== null && todayRow.daily_change_percent !== undefined) {
            pct = todayRow.daily_change_percent / 100; // Convert percentage to decimal
        } else {
            // Fallback to manual calculation
            const yesterdayRow = mapYesterday.get(symbol);
            const closeYesterday = yesterdayRow?.close;
            if (!closeYesterday || closeYesterday <= 0) continue;
            pct = (closeToday - closeYesterday) / closeYesterday;
        }

        stockPerformances.push({
            symbol,
            changePercent: pct,
            rank: 0 // Will be set after sorting
        });

        if (pct > bestPct) {
            bestPct = pct;
        }
    }

    // Sort stocks by performance (descending) and assign ranks
    stockPerformances.sort((a, b) => b.changePercent - a.changePercent);
    stockPerformances.forEach((stock, index) => {
        stock.rank = index + 1;
    });

    // Create symbol-to-rank mapping for quick lookup
    const symbolToRank = new Map(stockPerformances.map(s => [s.symbol, s.rank]));

    // Find winners (top performer(s) - keeping for compatibility)
    const winners = stockPerformances
        .filter(s => s.changePercent === bestPct)
        .map(s => s.symbol);

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

    // Store results for all options with ranking information
    for (const stockPerf of stockPerformances) {
        const oid = symToOpt.get(stockPerf.symbol);
        if (!oid) continue;

        const { error: rErr } = await supabaseAdmin
            .from('results')
            .upsert({
                competition_id: competitionId,
                option_id: oid,
                percent_change: stockPerf.changePercent,
                is_winner: winnerIds.includes(oid),
                // Store ranking information for future reference
                rank: stockPerf.rank,
            }, { onConflict: 'competition_id,option_id' });

        if (rErr) throw new Error(`Failed to store result: ${rErr.message}`);
    }

    // Score user guesses using the new ranking system
    const { data: guesses } = await supabaseAdmin
        .from('guesses')
        .select('user_id, option_id, options!inner(symbol)')
        .eq('competition_id', competitionId);

    let correctGuesses = 0; // Users who picked the exact winner
    let scoringGuesses = 0; // Users who earned any points
    const totalGuesses = guesses?.length ?? 0;

    for (const g of guesses ?? []) {
        const optionSymbol = (g as unknown as { options?: { symbol: string } }).options?.symbol;
        if (!optionSymbol) continue;

        let points = 0;
        let userRank = 0;

        // RANKING SYSTEM: Award points based on how close the pick was
        const rank = symbolToRank.get(optionSymbol.toUpperCase());
        if (rank && rank <= config.rules.maxScoringRank) {
            points = RANKING_POINTS[rank as ScoringRank] || 0;
            userRank = rank;
            if (points > 0) scoringGuesses++;
        }

        // Track exact winners
        if (winnerIds.includes(g.option_id as number)) {
            correctGuesses++;
        }

        // Store the score with ranking metadata
        const { error: sErr } = await supabaseAdmin
            .from('scores')
            .upsert({
                user_id: g.user_id as string,
                competition_id: competitionId,
                points,
                // Store the rank they achieved for analysis and UI display
                metadata: {
                    rank: userRank,
                    symbol: optionSymbol,
                    changePercent: stockPerformances.find(s => s.symbol === optionSymbol.toUpperCase())?.changePercent || 0,
                    totalStocks: stockPerformances.length,
                }
            }, { onConflict: 'user_id,competition_id' });

        if (sErr) throw new Error(`Failed to store score: ${sErr.message}`);
    }

    return {
        winners: winners.length,
        bestPerformance: bestPct,
        optionsEvaluated: mapToday.size,
        totalGuesses,
        correctGuesses, // Exact winners
        scoringGuesses, // Users who earned any points (ranking system only)
        accuracy: totalGuesses > 0 ? (correctGuesses / totalGuesses) * 100 : 0,
        scoringRate: totalGuesses > 0 ? (scoringGuesses / totalGuesses) * 100 : 0, // % who earned points
        winningSymbols: winners,
        // Include top 20 performers for context and UI display
        topPerformers: stockPerformances.slice(0, 20).map(s => ({
            rank: s.rank,
            symbol: s.symbol,
            changePercent: s.changePercent,
            points: s.rank <= config.rules.maxScoringRank ? RANKING_POINTS[s.rank as ScoringRank] || 0 : 0
        })),
        // All stock performances for detailed analysis
        allPerformances: stockPerformances.map(s => ({
            rank: s.rank,
            symbol: s.symbol,
            changePercent: s.changePercent,
            points: s.rank <= config.rules.maxScoringRank ? RANKING_POINTS[s.rank as ScoringRank] || 0 : 0
        })),
        scoringSystemInfo: {
            description: "Graduated scoring system rewards users based on ranking of their pick",
            maxScoringRank: config.rules.maxScoringRank,
            pointsDistribution: RANKING_POINTS,
            example: "Rank #1 = 100pts, Rank #2 = 60pts, Rank #3 = 40pts, etc."
        }
    };
}

export async function GET() {
    return new Response('Use POST with x-cron-secret header', { status: 405 });
}
