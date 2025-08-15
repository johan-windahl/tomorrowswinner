"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import useSWR from "swr";
import { supabase } from "@/lib/supabaseClient";

type EnrichedItem = {
    id: number;
    symbol: string;
    name: string | null;
    lastClose: number | null;
    pctPrevDay: number | null;
    logoUrl: string;
    tradingViewUrl: string;
};

export default function CompetitionDetailPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const [title, setTitle] = useState<string>("");
    const [message, setMessage] = useState<string | null>(null);
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const [query, setQuery] = useState<string>("");
    const [sortKey, setSortKey] = useState<'symbol' | 'price' | 'pct'>('symbol');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        if (!slug) return;
        let cancelled = false;
        (async () => {
            const { data: comp, error } = await supabase
                .from("competitions")
                .select("id,title")
                .eq("slug", slug)
                .single();
            if (error || !comp) return setMessage(error?.message ?? "Not found");
            if (!cancelled) setTitle(comp.title);
        })();
        return () => {
            cancelled = true;
        };
    }, [slug]);

    const fetcher = (url: string) => fetch(url).then((r) => r.json());
    const { data: enriched, isLoading } = useSWR<{
        ok: boolean;
        items: EnrichedItem[];
    }>(slug ? `/api/competitions/${slug}/enriched` : null, fetcher);

    const filtered = useMemo(() => {
        const items = enriched?.items ?? [];
        const list = !query.trim()
            ? items
            : items.filter(it => it.symbol.toLowerCase().includes(query.trim().toLowerCase()) || (it.name ?? "").toLowerCase().includes(query.trim().toLowerCase()));
        const factor = sortDir === 'asc' ? 1 : -1;
        return [...list].sort((a, b) => {
            if (sortKey === 'symbol') return a.symbol.localeCompare(b.symbol) * factor;
            if (sortKey === 'price') {
                const av = a.lastClose ?? -Infinity;
                const bv = b.lastClose ?? -Infinity;
                return (av - bv) * factor;
            }
            // pct
            const ap = a.pctPrevDay ?? -Infinity;
            const bp = b.pctPrevDay ?? -Infinity;
            return (ap - bp) * factor;
        });
    }, [enriched, query, sortKey, sortDir]);

    const fmtCurrency = (n: number | null) => (n == null ? "—" : `$${n.toFixed(2)}`);
    const fmtPct = (n: number | null) => (n == null ? "—" : `${n.toFixed(2)}%`);

    function toggleSort(key: 'symbol' | 'price' | 'pct') {
        if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        else { setSortKey(key); setSortDir('asc'); }
    }

    function Arrow({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
        return <span className={`ml-1 text-[10px] ${active ? 'opacity-100' : 'opacity-30'}`}>{dir === 'asc' ? '▲' : '▼'}</span>;
    }

    function StockLogo({ src, alt }: { src: string; alt: string }) {
        const [imgSrc, setImgSrc] = useState<string>(src);
        return (
            <Image
                src={imgSrc}
                alt={alt}
                width={32}
                height={32}
                className="rounded-lg border border-gray-200"
                sizes="32px"
                onError={() => setImgSrc(`https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=0D8ABC&color=fff`)}
            />
        );
    }

    async function submitGuess(optionId: number) {
        setLoadingId(optionId);
        setMessage(null);
        const { data: comp, error } = await supabase
            .from("competitions")
            .select("id,deadline_at")
            .eq("slug", slug)
            .single();
        if (error || !comp) {
            setLoadingId(null);
            return setMessage(error?.message ?? "Not found");
        }
        if (new Date() > new Date(comp.deadline_at)) {
            setLoadingId(null);
            return setMessage("Deadline passed");
        }

        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            setLoadingId(null);
            return setMessage("Not authenticated");
        }

        const { error: upsertErr } = await supabase.from("guesses").upsert(
            { user_id: user.id, competition_id: comp.id, option_id: optionId },
            { onConflict: "user_id,competition_id" }
        );
        setLoadingId(null);
        if (upsertErr) return setMessage(upsertErr.message);
        setMessage("Guess submitted");
    }

    const getCompetitionStats = () => {
        const totalItems = filtered.length;
        const itemsWithPrices = filtered.filter(item => item.lastClose != null).length;
        return { totalItems, itemsWithPrices };
    };

    const { totalItems, itemsWithPrices } = getCompetitionStats();

    return (
        <div className="container py-8">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 ">
                            {title || <span className="animate-pulse bg-gray-200  h-8 w-64 rounded block"></span>}
                        </h1>
                        <p className="text-lg text-gray-600 ">
                            Pick the stock you think will perform best tomorrow. Data in ET timezone.
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 ">
                            <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <span>{totalItems} assets available</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span>{itemsWithPrices} with live prices</span>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search symbols or company names..."
                            className="input pl-10 w-full lg:w-80"
                        />
                    </div>
                </div>

                {/* Message Display */}
                {message && (
                    <div className={`mt-4 p-4 rounded-lg border ${message.includes("submitted")
                        ? "bg-green-50  border-green-200  text-green-800 "
                        : "bg-red-50  border-red-200  text-red-800 "
                        }`}>
                        <div className="flex items-center gap-2">
                            {message.includes("submitted") ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.168 13.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            )}
                            <span className="font-medium">{message}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Stock List */}
            <div className="card overflow-hidden">
                {/* Desktop Header */}
                <div className="hidden md:grid grid-cols-[auto,1fr,auto,auto,auto] items-center gap-4 px-6 py-4 bg-gray-50  border-b border-gray-200 ">
                    <div className="w-10"></div>
                    <button
                        onClick={() => toggleSort('symbol')}
                        className="flex items-center text-left font-medium text-gray-700  hover:text-gray-900  transition-colors"
                    >
                        Symbol
                        <Arrow active={sortKey === 'symbol'} dir={sortDir} />
                    </button>
                    <button
                        onClick={() => toggleSort('price')}
                        className="flex items-center font-medium text-gray-700  hover:text-gray-900  transition-colors"
                    >
                        Price
                        <Arrow active={sortKey === 'price'} dir={sortDir} />
                    </button>
                    <button
                        onClick={() => toggleSort('pct')}
                        className="flex items-center font-medium text-gray-700  hover:text-gray-900  transition-colors"
                    >
                        Change %
                        <Arrow active={sortKey === 'pct'} dir={sortDir} />
                    </button>
                    <div className="text-right font-medium text-gray-700 ">Action</div>
                </div>

                {/* Stock Rows - Compact Design */}
                <div className="divide-y divide-gray-100 ">
                    {(isLoading ? Array.from({ length: 15 }) : filtered).map((it: unknown, idx: number) => {
                        const idSafe = isLoading ? null : (it as EnrichedItem).id;
                        const item = it as EnrichedItem;

                        return (
                            <div key={idSafe ?? idx} className="hover:bg-gray-50  transition-colors duration-150 group">
                                {/* Desktop Layout */}
                                <div className="hidden md:flex items-center gap-3 px-4 py-2.5">
                                    {/* Logo */}
                                    {isLoading ? (
                                        <div className="w-8 h-8 rounded-lg bg-gray-200  animate-pulse flex-shrink-0" />
                                    ) : (
                                        <div className="relative flex-shrink-0">
                                            <StockLogo src={item.logoUrl} alt={item.symbol} />
                                        </div>
                                    )}

                                    {/* Symbol */}
                                    <div className="min-w-0 w-16 flex-shrink-0">
                                        {isLoading ? (
                                            <div className="h-4 bg-gray-200  rounded w-12 animate-pulse"></div>
                                        ) : (
                                            <div className="font-mono font-semibold text-gray-900  text-sm">{item.symbol}</div>
                                        )}
                                    </div>

                                    {/* Company Name */}
                                    <div className="flex-1 min-w-0">
                                        {isLoading ? (
                                            <div className="h-3 bg-gray-200  rounded w-32 animate-pulse"></div>
                                        ) : (
                                            <div className="text-sm text-gray-600  truncate">{item.name || '—'}</div>
                                        )}
                                    </div>

                                    {/* Price */}
                                    <div className="text-right w-20 flex-shrink-0">
                                        {isLoading ? (
                                            <div className="h-4 bg-gray-200  rounded w-16 animate-pulse ml-auto"></div>
                                        ) : (
                                            <div className="font-mono text-sm font-semibold text-gray-900 ">
                                                {item.lastClose ? `$${item.lastClose.toFixed(2)}` : '—'}
                                            </div>
                                        )}
                                    </div>

                                    {/* Change % */}
                                    <div className="text-right w-16 flex-shrink-0">
                                        {isLoading ? (
                                            <div className="h-4 bg-gray-200  rounded w-12 animate-pulse ml-auto"></div>
                                        ) : (
                                            <div className={`font-mono text-xs font-medium ${item.pctPrevDay == null
                                                ? 'text-gray-400 
                                                : item.pctPrevDay >= 0
                                                    ? 'text-green-600 
                                                    : 'text-red-600 
                                                }`}>
                                                {item.pctPrevDay == null ? '—' : (
                                                    <>
                                                        {item.pctPrevDay >= 0 ? '+' : ''}{item.pctPrevDay.toFixed(2)}%
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        {isLoading ? (
                                            <>
                                                <div className="h-6 w-6 bg-gray-200  rounded animate-pulse"></div>
                                                <div className="h-6 w-12 bg-gray-200  rounded animate-pulse"></div>
                                            </>
                                        ) : (
                                            <>
                                                <a
                                                    href={item.tradingViewUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1 text-gray-400  hover:text-blue-600  rounded transition-colors duration-200 opacity-0 group-hover:opacity-100"
                                                    title="View on TradingView"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </a>
                                                <button
                                                    onClick={() => idSafe && submitGuess(idSafe)}
                                                    disabled={isLoading || (idSafe != null && loadingId === idSafe)}
                                                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors duration-200 disabled:opacity-50"
                                                >
                                                    {idSafe != null && loadingId === idSafe ? (
                                                        <div className="flex items-center gap-1">
                                                            <div className="w-2 h-2 border border-white border-t-transparent rounded-full animate-spin"></div>
                                                            <span>...</span>
                                                        </div>
                                                    ) : (
                                                        "Pick"
                                                    )}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Mobile Layout */}
                                <div className="md:hidden px-4 py-3">
                                    {isLoading ? (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="w-10 h-10 rounded-lg bg-gray-200  animate-pulse flex-shrink-0" />
                                                <div className="flex-1">
                                                    <div className="h-4 bg-gray-200  rounded w-16 mb-1"></div>
                                                    <div className="h-3 bg-gray-200  rounded w-24"></div>
                                                </div>
                                            </div>
                                            <div className="h-8 w-16 bg-gray-200  rounded animate-pulse"></div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            {/* Left: Logo + Info */}
                                            <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
                                                <div className="relative flex-shrink-0">
                                                    <StockLogo src={item.logoUrl} alt={item.symbol} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="font-mono font-semibold text-gray-900  text-sm">
                                                            {item.symbol}
                                                        </div>
                                                        {item.pctPrevDay != null && (
                                                            <div className={`font-mono text-xs font-medium ${item.pctPrevDay >= 0
                                                                ? 'text-green-600 
                                                                : 'text-red-600 
                                                                }`}>
                                                                {item.pctPrevDay >= 0 ? '+' : ''}{item.pctPrevDay.toFixed(2)}%
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-600  truncate">
                                                        {item.name || '—'}
                                                    </div>
                                                    {item.lastClose && (
                                                        <div className="font-mono text-xs text-gray-500  mt-0.5">
                                                            ${item.lastClose.toFixed(2)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right: Pick Button */}
                                            <div className="flex-shrink-0">
                                                <button
                                                    onClick={() => idSafe && submitGuess(idSafe)}
                                                    disabled={isLoading || (idSafe != null && loadingId === idSafe)}
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors duration-200 disabled:opacity-50 min-w-[60px]"
                                                >
                                                    {idSafe != null && loadingId === idSafe ? (
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                                                    ) : (
                                                        "Pick"
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {!isLoading && filtered.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No stocks found</h3>
                        <p className="text-gray-600">Try adjusting your search terms to find what you're looking for.</p>
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="btn btn-outline mt-4"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

