/**
 * Competition enrichment service
 * Handles enriching competition data with financial information, logos, and metadata
 */

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export type EquityRow = {
    symbol: string;
    as_of_date: string;
    close: number;
    previous_close?: number;
    daily_change_percent?: number;
};

export interface EnrichedCompetitionItem {
    id: number;
    symbol: string;
    name: string;
    lastClose: number | null;
    pctPrevDay: number | null;
    logoUrl: string;
    tradingViewUrl: string;
}

export interface CompetitionOption {
    id: number;
    symbol: string;
    name: string;
}

export interface EnrichedCompetitionResponse {
    ok: boolean;
    items: EnrichedCompetitionItem[];
    dates?: { latest: string | null; prev: string | null };
}

/**
 * Service for enriching competition data with financial information
 */
export class CompetitionEnrichmentService {
    /**
     * Enrich competition options with financial data, logos, and metadata
     */
    async enrichCompetition(slug: string): Promise<EnrichedCompetitionResponse> {
        if (!supabaseAdmin) {
            throw new Error('Supabase admin not configured');
        }

        // Get competition details
        const { data: comp, error: cErr } = await supabaseAdmin
            .from('competitions')
            .select('id, category')
            .eq('slug', slug)
            .single();

        if (cErr || !comp) {
            throw new Error(`Competition not found: ${slug}`);
        }

        // Get competition options
        const { data: options, error: oErr } = await supabaseAdmin
            .from('options')
            .select('id, symbol, name')
            .eq('competition_id', comp.id)
            .order('symbol');

        if (oErr) {
            throw new Error(`Failed to fetch options: ${oErr.message}`);
        }

        const symbols = (options ?? []).map((o) => o.symbol.toUpperCase());

        if (symbols.length === 0) {
            return { ok: true, items: [] };
        }

        // Handle non-finance competitions with basic data
        if (comp.category !== 'finance') {
            return this.enrichNonFinanceCompetition(options ?? []);
        }

        // Handle finance competitions with full enrichment
        return this.enrichFinanceCompetition(options ?? [], symbols);
    }

    /**
     * Enrich non-finance competitions with basic metadata
     */
    private enrichNonFinanceCompetition(options: CompetitionOption[]): EnrichedCompetitionResponse {
        const items = options.map((o) => ({
            id: o.id,
            symbol: o.symbol.toUpperCase(),
            name: o.name,
            lastClose: null as number | null,
            pctPrevDay: null as number | null,
            logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(o.symbol)}&background=0D8ABC&color=fff`,
            tradingViewUrl: '',
        }));

        return { ok: true, items };
    }

    /**
     * Enrich finance competitions with full financial data
     */
    private async enrichFinanceCompetition(options: CompetitionOption[], symbols: string[]): Promise<EnrichedCompetitionResponse> {
        // Get latest trading dates
        const uniqueDates = await this.getLatestTradingDates();
        const [d0, d1] = uniqueDates;

        // Fetch price data for symbols
        const priceData = await this.getEquityPriceData(symbols, [d0, d1].filter(Boolean) as string[]);

        // Fetch exchange metadata
        const exchangeMap = await this.getExchangeMetadata();

        // Build enriched items
        const items = options.map((o) => {
            const sym = o.symbol.toUpperCase();
            const ex = exchangeMap.get(sym) || 'NASDAQ';
            const pair = priceData.get(sym) || {};
            const latest = pair.latest?.close ?? null;
            const prev = pair.prev?.close ?? null;

            // Calculate percentage change
            let pct = pair.latest?.daily_change_percent ?? null;
            if (pct === null && latest != null && prev != null && prev !== 0) {
                pct = ((latest - prev) / prev) * 100;
            }

            return {
                id: o.id,
                symbol: sym,
                name: o.name,
                lastClose: latest,
                pctPrevDay: pct,
                logoUrl: this.generateLogoUrl(sym),
                tradingViewUrl: this.generateTradingViewUrl(ex, sym),
            };
        });

        return {
            ok: true,
            items,
            dates: { latest: d0 ?? null, prev: d1 ?? null }
        };
    }

    /**
     * Get the latest 2 trading dates from the EOD table
     */
    private async getLatestTradingDates(): Promise<string[]> {
        const { data: datesRows, error: dErr } = await supabaseAdmin!
            .from('equity_prices_eod')
            .select('as_of_date')
            .order('as_of_date', { ascending: false })
            .limit(2000);

        if (dErr) {
            throw new Error(`Failed to fetch trading dates: ${dErr.message}`);
        }

        const uniqueDates: string[] = [];
        for (const r of datesRows ?? []) {
            const d = r.as_of_date as unknown as string;
            if (!uniqueDates.includes(d)) uniqueDates.push(d);
            if (uniqueDates.length >= 2) break;
        }

        return uniqueDates;
    }

    /**
     * Get equity price data for symbols and dates
     */
    private async getEquityPriceData(symbols: string[], dates: string[]): Promise<Map<string, { latest?: EquityRow; prev?: EquityRow }>> {
        const { data: eodRows, error: eErr } = await supabaseAdmin!
            .from('equity_prices_eod')
            .select('symbol, as_of_date, close, previous_close, daily_change_percent')
            .in('symbol', symbols)
            .in('as_of_date', dates);

        if (eErr) {
            throw new Error(`Failed to fetch price data: ${eErr.message}`);
        }

        const grouped = new Map<string, { latest?: EquityRow; prev?: EquityRow }>();
        const [d0, d1] = dates;

        for (const row of (eodRows ?? []) as EquityRow[]) {
            const key = row.symbol.toUpperCase();
            const entry = grouped.get(key) ?? {};
            if (row.as_of_date === d0) entry.latest = row;
            else if (row.as_of_date === d1) entry.prev = row;
            grouped.set(key, entry);
        }

        return grouped;
    }

    /**
     * Get exchange metadata for symbols
     */
    private async getExchangeMetadata(): Promise<Map<string, string>> {
        const { data: tickMeta, error: tErr } = await supabaseAdmin!
            .from('equity_tickers')
            .select('symbol, exchange');

        if (tErr) {
            throw new Error(`Failed to fetch exchange metadata: ${tErr.message}`);
        }

        return new Map((tickMeta ?? []).map((t) => [
            t.symbol.toUpperCase(),
            (t.exchange || 'NASDAQ').toUpperCase()
        ]));
    }

    /**
     * Generate logo URL for a symbol
     */
    private generateLogoUrl(symbol: string): string {
        const domainMap: Record<string, string> = {
            'GOOGL': 'alphabet.com',
            'GOOG': 'alphabet.com',
            'META': 'meta.com',
            'BRK.B': 'berkshirehathaway.com',
            'BRK.A': 'berkshirehathaway.com',
        };

        const domain = (domainMap[symbol] ?? `${symbol}.com`).toLowerCase();
        return `https://logo.clearbit.com/${domain}`;
    }

    /**
     * Generate TradingView URL for a symbol and exchange
     */
    private generateTradingViewUrl(exchange: string, symbol: string): string {
        return `https://www.tradingview.com/symbols/${encodeURIComponent(exchange)}-${encodeURIComponent(symbol)}/`;
    }
}
