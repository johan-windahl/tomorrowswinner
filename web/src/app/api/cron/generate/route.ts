import { NextRequest } from 'next/server';
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
    return { startISO, deadlineISO, evalStartISO, evalEndISO };
}

export async function POST(req: NextRequest) {
    const envSecretRaw = process.env.CRON_SECRET ?? '';
    const expected = envSecretRaw.replace(/^['"]|['"]$/g, '');
    const providedHeader = req.headers.get('x-cron-secret');
    const providedQuery = new URL(req.url).searchParams.get('secret');
    const provided = providedHeader ?? providedQuery ?? '';
    if (!expected || provided !== expected) return new Response('forbidden', { status: 403 });
    if (!supabaseAdmin) return new Response('admin not configured', { status: 500 });

    const { startISO, deadlineISO, evalStartISO, evalEndISO } = etDatesForTomorrow();

    // Generate tomorrow crypto competition + options from top-100 coins
    const cryptoSlug = 'crypto-best-tomorrow';
    const { data: compRow, error: cErr } = await supabaseAdmin.from('competitions').upsert([
        {
            category: 'crypto',
            title: 'Crypto: best performer tomorrow',
            slug: cryptoSlug,
            start_at: startISO,
            deadline_at: deadlineISO,
            evaluation_start_at: evalStartISO,
            evaluation_end_at: evalEndISO,
            timezone: 'America/New_York',
        },
    ], { onConflict: 'slug' }).select('*').single();
    if (cErr) {
        console.error('generate upsert competition error', cErr);
        return new Response(`crypto generate error: ${cErr.message}`, { status: 500 });
    }
    const compId = compRow?.id;
    if (!compId) return new Response('missing comp id', { status: 500 });
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
    if (topErr) {
        console.error('generate select topCoins error', topErr);
        return new Response(`topCoins error: ${topErr.message}`, { status: 500 });
    }
    let topList = topCoins ?? [];
    if (!topList || topList.length === 0) {
        // Fallback: take from crypto_coins by rank
        const { data: fallback } = await supabaseAdmin
            .from('crypto_coins')
            .select('id as coin_id, rank')
            .order('rank', { ascending: true })
            .limit(100);
        topList = (fallback as any) ?? [];
        console.warn('generate: fallback to crypto_coins for options, count', topList.length);
    }
    const { data: meta } = await supabaseAdmin
        .from('crypto_coins')
        .select('id, symbol, name');
    const metaMap = new Map((meta ?? []).map((m) => [m.id, m]));
    const optionRows = (topList ?? []).map((c) => {
        const m = metaMap.get(c.coin_id as unknown as string);
        return {
            competition_id: compId,
            symbol: (m?.symbol ?? c.coin_id).toUpperCase(),
            name: m?.name ?? c.coin_id,
            coin_id: c.coin_id,
            metadata: {},
        };
    });
    // Deduplicate by (competition_id, symbol) to avoid ON CONFLICT affecting the same row twice
    const deduped: typeof optionRows = [] as any;
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
        if (optErr) {
            console.error('generate upsert options error', optErr);
            return new Response(`options upsert error: ${optErr.message}`, { status: 500 });
        }
    } else {
        console.warn('generate: no topCoins rows found for asOfET', asOfET);
    }

    // Stocks placeholder
    const stocksSlug = 'sp500-best-tomorrow';
    const { error: sErr } = await supabaseAdmin.from('competitions').upsert([
        {
            category: 'finance',
            title: 'S&P 500: best performer tomorrow',
            slug: stocksSlug,
            start_at: startISO,
            deadline_at: deadlineISO,
            evaluation_start_at: evalStartISO,
            evaluation_end_at: evalEndISO,
            timezone: 'America/New_York',
        },
    ], { onConflict: 'slug' });
    if (sErr) return new Response(`stocks generate error: ${sErr.message}`, { status: 500 });

    return Response.json({ ok: true });
}

export async function GET() {
    return new Response('Use POST with header x-cron-secret or ?secret=...', { status: 405 });
}


