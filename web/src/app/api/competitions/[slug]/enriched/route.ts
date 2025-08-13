// no NextRequest needed here
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { jsonError, jsonOk } from '@/lib/cron';

type EquityRow = { symbol: string; as_of_date: string; close: number };

export async function GET(req: Request) {
    if (!supabaseAdmin) return jsonError(500, 'admin not configured');
    const { pathname } = new URL(req.url);
    const match = pathname.match(/\/api\/competitions\/([^/]+)\/enriched/);
    const slug = match?.[1];
    if (!slug) return jsonError(400, 'invalid path, slug missing');
    try {
        const { data: comp, error: cErr } = await supabaseAdmin
            .from('competitions')
            .select('id, category')
            .eq('slug', slug)
            .single();
        if (cErr || !comp) return jsonError(404, 'competition not found', { slug, code: cErr?.code, message: cErr?.message });

        const { data: options, error: oErr } = await supabaseAdmin
            .from('options')
            .select('id, symbol, name')
            .eq('competition_id', comp.id)
            .order('symbol');
        if (oErr) return jsonError(500, 'options select error', { code: oErr.code, message: oErr.message });

        const symbols = (options ?? []).map((o) => o.symbol.toUpperCase());
        if (symbols.length === 0) return jsonOk({ items: [] });

        if (comp.category !== 'finance') {
            // For non-finance, just return basic items
            const items = (options ?? []).map((o) => ({
                id: o.id,
                symbol: o.symbol.toUpperCase(),
                name: o.name,
                lastClose: null as number | null,
                pctPrevDay: null as number | null,
                logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(o.symbol)}&background=0D8ABC&color=fff`,
                tradingViewUrl: '',
            }));
            return jsonOk({ items });
        }

        // Determine two latest trading dates available in EOD table (global)
        const { data: datesRows, error: dErr } = await supabaseAdmin
            .from('equity_prices_eod')
            .select('as_of_date')
            .order('as_of_date', { ascending: false })
            .limit(2000); // fetch enough rows to dedupe by date
        if (dErr) return jsonError(500, 'eod dates error', { code: dErr.code, message: dErr.message });
        const uniqueDates: string[] = [];
        for (const r of datesRows ?? []) {
            const d = r.as_of_date as unknown as string;
            if (!uniqueDates.includes(d)) uniqueDates.push(d);
            if (uniqueDates.length >= 2) break;
        }
        const [d0, d1] = uniqueDates;
        // If only one or zero dates, continue gracefully: show lastClose if available, pct as null

        // Fetch closes for these symbols for two latest dates
        const { data: eodRows, error: eErr } = await supabaseAdmin
            .from('equity_prices_eod')
            .select('symbol, as_of_date, close')
            .in('symbol', symbols)
            .in('as_of_date', [d0, d1].filter(Boolean) as string[]);
        if (eErr) return jsonError(500, 'eod rows error', { code: eErr.code, message: eErr.message });

        const grouped = new Map<string, { latest?: EquityRow; prev?: EquityRow }>();
        for (const row of (eodRows ?? []) as EquityRow[]) {
            const key = row.symbol.toUpperCase();
            const entry = grouped.get(key) ?? {};
            if (row.as_of_date === d0) entry.latest = row;
            else if (row.as_of_date === d1) entry.prev = row;
            grouped.set(key, entry);
        }

        // Fetch exchanges to build TradingView URLs
        const { data: tickMeta, error: tErr } = await supabaseAdmin
            .from('equity_tickers')
            .select('symbol, exchange');
        if (tErr) return jsonError(500, 'tickers meta error', { code: tErr.code, message: tErr.message });
        const exchMap = new Map((tickMeta ?? []).map((t) => [t.symbol.toUpperCase(), (t.exchange || 'NASDAQ').toUpperCase()]));
        // Basic domain mapping for better logos
        const domainMap: Record<string, string> = {
            'GOOGL': 'alphabet.com',
            'GOOG': 'alphabet.com',
            'META': 'meta.com',
            'BRK.B': 'berkshirehathaway.com',
            'BRK.A': 'berkshirehathaway.com',
        };

        const items = (options ?? []).map((o) => {
            const sym = o.symbol.toUpperCase();
            const ex = exchMap.get(sym) || 'NASDAQ';
            const pair = grouped.get(sym) || {};
            const latest = pair.latest?.close ?? null;
            const prev = pair.prev?.close ?? null;
            const pct = latest != null && prev != null && prev !== 0 ? ((latest - prev) / prev) * 100 : null;
            const tradingViewUrl = `https://www.tradingview.com/symbols/${encodeURIComponent(ex)}-${encodeURIComponent(sym)}/`;
            const domain = (domainMap[sym] ?? `${sym}.com`).toLowerCase();
            const logoUrl = `https://logo.clearbit.com/${domain}`;
            return {
                id: o.id,
                symbol: sym,
                name: o.name,
                lastClose: latest,
                pctPrevDay: pct,
                logoUrl,
                tradingViewUrl,
            };
        });

        return jsonOk({ items, dates: { latest: d0 ?? null, prev: d1 ?? null } });
    } catch (e) {
        return jsonError(500, 'unexpected', { message: String(e) });
    }
}


