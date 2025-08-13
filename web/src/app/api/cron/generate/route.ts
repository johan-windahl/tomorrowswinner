import { NextRequest } from 'next/server';
import { jsonError, jsonOk, readCronSecret } from '@/lib/cron';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function etParts(d: Date) {
    const tz = 'America/New_York';
    const fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZoneName: 'shortOffset',
    });
    const parts = fmt.formatToParts(d);
    const y = parts.find((p) => p.type === 'year')?.value ?? '1970';
    const m = parts.find((p) => p.type === 'month')?.value ?? '01';
    const dd = parts.find((p) => p.type === 'day')?.value ?? '01';
    const tzName = parts.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT-04';
    const match = tzName.match(/GMT([+-])(\d{1,2})/);
    const sign = match ? match[1] : '-';
    const hh = match ? match[2].padStart(2, '0') : '04';
    const offset = `${sign}${hh}:00`;
    return { y, m, dd, offset };
}

function etDatesForTomorrow() {
    const now = new Date();
    // Today ET parts and tomorrow ET date
    const today = etParts(now);
    const todayDate = new Date(`${today.y}-${today.m}-${today.dd}T00:00:00${today.offset}`);
    const tomorrowDate = new Date(todayDate.getTime() + 24 * 60 * 60 * 1000);
    const tmr = etParts(tomorrowDate);

    const startISO = `${tmr.y}-${tmr.m}-${tmr.dd}T00:00:00${tmr.offset}`;
    const evalStartISO = startISO;
    const evalEndISO = `${tmr.y}-${tmr.m}-${tmr.dd}T23:59:59${tmr.offset}`;
    const deadlineISO = `${today.y}-${today.m}-${today.dd}T22:00:00${today.offset}`;
    return { startISO, deadlineISO, evalStartISO, evalEndISO, tomorrowDate, todayDate };
}

function isWeekday(date: Date): boolean {
    const day = date.getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday
    return day >= 1 && day <= 5; // Monday to Friday
}

function formatDateForSlug(date: Date): string {
    const { y, m, dd } = etParts(date);
    return `${y}-${m}-${dd}`;
}

export async function POST(req: Request | NextRequest) {
    const auth = readCronSecret(req);
    if (!auth.ok) return jsonError(403, 'forbidden', auth);
    if (!supabaseAdmin) return jsonError(500, 'admin not configured');

    const { startISO, deadlineISO, evalStartISO, evalEndISO, tomorrowDate, todayDate } = etDatesForTomorrow();
    const tomorrowDateSlug = formatDateForSlug(tomorrowDate);

    const generatedCompetitions: string[] = [];

    // Generate crypto competition (crypto runs 24/7, so always generate)
    const cryptoSlug = `crypto-best-${tomorrowDateSlug}`;
    const { data: compRow, error: cErr } = await supabaseAdmin.from('competitions').upsert([
        {
            category: 'crypto',
            title: `Crypto: best performer ${tomorrowDateSlug}`,
            slug: cryptoSlug,
            start_at: startISO,
            deadline_at: deadlineISO,
            evaluation_start_at: evalStartISO,
            evaluation_end_at: evalEndISO,
            timezone: 'America/New_York',
        },
    ], { onConflict: 'slug' }).select('*').single();
    if (cErr) return jsonError(500, 'crypto generate upsert error', { code: cErr.code, message: cErr.message });
    const compId = compRow?.id;
    if (!compId) return new Response('missing comp id', { status: 500 });

    generatedCompetitions.push(cryptoSlug);

    const now = new Date();
    const tzFmt = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' });
    const parts = tzFmt.formatToParts(now);
    const y = parts.find(p => p.type === 'year')?.value ?? '1970';
    const m = parts.find(p => p.type === 'month')?.value ?? '01';
    const d = parts.find(p => p.type === 'day')?.value ?? '01';
    const asOfET = `${y}-${m}-${d}`;

    const { data: topCoins, error: topErr } = await supabaseAdmin
        .from('crypto_prices_daily')
        .select('coin_id, rank')
        .eq('as_of_date', asOfET)
        .order('rank', { ascending: true })
        .limit(100);
    if (topErr) return jsonError(500, 'topCoins select error', { code: topErr.code, message: topErr.message });
    let topList = topCoins ?? [];
    if (!topList || topList.length === 0) {
        // Fallback: take from crypto_coins by rank (map id -> coin_id)
        const { data: fallback } = await supabaseAdmin
            .from('crypto_coins')
            .select('id, rank')
            .order('rank', { ascending: true })
            .limit(100);
        type F = { id: string; rank: number | null };
        const fb = (fallback ?? []) as F[];
        topList = fb.map((r) => ({ coin_id: String(r.id), rank: Number(r.rank ?? 0) }));
        console.warn('generate: fallback to crypto_coins for options, count', topList.length);
    }
    const { data: meta } = await supabaseAdmin
        .from('crypto_coins')
        .select('id, symbol, name');
    const metaMap = new Map((meta ?? []).map((m) => [m.id as string, m as { id: string; symbol: string; name: string }]));
    const optionRows = (topList ?? []).map((c) => {
        const m = metaMap.get(c.coin_id);
        return {
            competition_id: compId,
            symbol: (m?.symbol ?? c.coin_id).toUpperCase(),
            name: m?.name ?? c.coin_id,
            coin_id: c.coin_id,
            metadata: {},
        };
    });
    // Deduplicate by (competition_id, symbol) to avoid ON CONFLICT affecting the same row twice
    const deduped: Array<{ competition_id: number; symbol: string; name: string; coin_id?: string; metadata: Record<string, unknown> }> = [];
    const seen = new Set<string>();
    for (const r of optionRows) {
        const key = `${r.competition_id}|${r.symbol}`;
        if (r.symbol && !seen.has(key)) {
            seen.add(key);
            deduped.push(r);
        }
    }
    if (deduped.length > 0) {
        const { error: optErr } = await supabaseAdmin.from('options').upsert(deduped, { onConflict: 'competition_id,symbol' });
        if (optErr) return jsonError(500, 'options upsert error', { code: optErr.code, message: optErr.message });
    } else {
        console.warn('generate: no topCoins rows found for asOfET', asOfET);
    }

    // Generate S&P 500 competition only on weekdays (when market is open)
    if (isWeekday(tomorrowDate)) {
        const stocksSlug = `sp500-best-${tomorrowDateSlug}`;
        const { data: finComp, error: sErr } = await supabaseAdmin.from('competitions').upsert([
            {
                category: 'finance',
                title: `S&P 500: best performer ${tomorrowDateSlug}`,
                slug: stocksSlug,
                start_at: startISO,
                deadline_at: deadlineISO,
                evaluation_start_at: evalStartISO,
                evaluation_end_at: evalEndISO,
                timezone: 'America/New_York',
            },
        ], { onConflict: 'slug' }).select('*').single();
        if (sErr) return jsonError(500, 'stocks generate error', { code: sErr.code, message: sErr.message });

        generatedCompetitions.push(stocksSlug);

        // Attach ALL tickers from equity_tickers (chunked upsert for robustness)
        const { data: tickers } = await supabaseAdmin.from('equity_tickers').select('symbol,name');
        if (finComp && tickers && tickers.length > 0) {
            const dedupFin = Array.from(new Map(tickers.map(t => [t.symbol.toUpperCase(), t])).values());
            const rows = dedupFin.map((t) => ({
                competition_id: finComp.id,
                symbol: t.symbol.toUpperCase(),
                name: t.name ?? t.symbol,
                metadata: {},
            }));
            const chunkSize = 200;
            for (let i = 0; i < rows.length; i += chunkSize) {
                const chunk = rows.slice(i, i + chunkSize);
                const { error: upErr } = await supabaseAdmin.from('options').upsert(chunk, { onConflict: 'competition_id,symbol' });
                if (upErr) return jsonError(500, 'options upsert error (finance chunk)', { code: upErr.code, message: upErr.message, chunkStart: i });
            }
        }
    }

    return jsonOk({
        generated: generatedCompetitions,
        date: tomorrowDateSlug,
        isWeekday: isWeekday(tomorrowDate)
    });
}

export async function GET() {
    return new Response('Use POST with header x-cron-secret or ?secret=...', { status: 405 });
}


