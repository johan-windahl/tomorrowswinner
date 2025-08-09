import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function etDate(d: Date) {
    const fmt = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' });
    const parts = fmt.formatToParts(d);
    const y = parts.find((p) => p.type === 'year')?.value ?? '1970';
    const m = parts.find((p) => p.type === 'month')?.value ?? '01';
    const dd = parts.find((p) => p.type === 'day')?.value ?? '01';
    return `${y}-${m}-${dd}`;
}

export async function POST(req: NextRequest) {
    const envSecretRaw = process.env.CRON_SECRET ?? '';
    const expected = envSecretRaw.replace(/^['"]|['"]$/g, '');
    const providedHeader = req.headers.get('x-cron-secret');
    const providedQuery = new URL(req.url).searchParams.get('secret');
    const provided = providedHeader ?? providedQuery ?? '';
    if (!expected || provided !== expected) return new Response('forbidden', { status: 403 });
    if (!supabaseAdmin) return new Response('admin not configured', { status: 500 });

    const now = new Date();
    const today = etDate(now);
    const yesterday = etDate(new Date(now.getTime() - 24 * 60 * 60 * 1000));

    // Find crypto competition for tomorrow (scored at end of tomorrow); for test, we score today's
    const { data: comps, error: compErr } = await supabaseAdmin
        .from('competitions')
        .select('id,slug')
        .eq('category', 'crypto');
    if (compErr) {
        console.error('score competitions error', compErr);
        return new Response(compErr.message, { status: 500 });
    }

    for (const comp of comps ?? []) {
        // Compute winner by max percent change from yesterday->today
        type PriceRow = { coin_id: string; price_usd: number };
        const { data: todayRows } = await supabaseAdmin
            .from('crypto_prices_daily')
            .select('coin_id, price_usd')
            .eq('as_of_date', today);
        const { data: yRows } = await supabaseAdmin
            .from('crypto_prices_daily')
            .select('coin_id, price_usd')
            .eq('as_of_date', yesterday);
        const mapToday = new Map((todayRows as PriceRow[] | null ?? []).map((r) => [r.coin_id, Number(r.price_usd)]));
        const mapY = new Map((yRows as PriceRow[] | null ?? []).map((r) => [r.coin_id, Number(r.price_usd)]));
        let best: { coin_id: string; pct: number }[] = [];
        let bestPct = -Infinity;
        for (const [coin, priceToday] of mapToday) {
            const priceY = mapY.get(coin);
            if (!priceY || priceY <= 0) continue;
            const pct = (priceToday - priceY) / priceY;
            if (pct > bestPct) {
                bestPct = pct;
                best = [{ coin_id: coin, pct }];
            } else if (pct === bestPct) {
                best.push({ coin_id: coin, pct });
            }
        }
        // Find options for this competition
        const { data: options, error: optErr } = await supabaseAdmin
            .from('options')
            .select('id, coin_id')
            .eq('competition_id', comp.id);
        if (optErr) {
            console.error('score options error', optErr);
            return new Response(optErr.message, { status: 500 });
        }
        const coinToOption = new Map((options ?? []).map((o) => [o.coin_id as string, o.id as number]));

        // Determine winners (ties allowed)
        const winnerOptionIds: number[] = [];
        for (const b of best) {
            const oid = coinToOption.get(b.coin_id);
            if (oid) winnerOptionIds.push(oid);
        }

        // Upsert results
        if (winnerOptionIds.length > 0) {
            // Mark all options percent (optional: skip for now) and winners
            for (const [coin, priceToday] of mapToday) {
                const priceY = mapY.get(coin);
                if (!priceY || priceY <= 0) continue;
                const pct = (priceToday - priceY) / priceY;
                const oid = coinToOption.get(coin);
                if (!oid) continue;
                const { error: rErr } = await supabaseAdmin.from('results').upsert({
                    competition_id: comp.id,
                    option_id: oid,
                    percent_change: pct,
                    is_winner: winnerOptionIds.includes(oid),
                }, { onConflict: 'competition_id,option_id' });
                if (rErr) {
                    console.error('score upsert result error', rErr);
                    return new Response(rErr.message, { status: 500 });
                }
            }
            // Score guesses: 100 points for winners, 0 otherwise
            const { data: guesses } = await supabaseAdmin
                .from('guesses')
                .select('user_id, option_id')
                .eq('competition_id', comp.id);
            for (const g of guesses ?? []) {
                const points = winnerOptionIds.includes(g.option_id as number) ? 100 : 0;
                const { error: sErr } = await supabaseAdmin.from('scores').upsert({
                    user_id: g.user_id as string,
                    competition_id: comp.id,
                    points,
                }, { onConflict: 'user_id,competition_id' });
                if (sErr) {
                    console.error('score upsert score error', sErr);
                    return new Response(sErr.message, { status: 500 });
                }
            }
        }
    }

    return Response.json({ ok: true, today, yesterday });
}

export async function GET() {
    return new Response('Use POST with header x-cron-secret or ?secret=...', { status: 405 });
}


