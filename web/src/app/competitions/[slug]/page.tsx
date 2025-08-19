"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import useSWR from "swr";
import { supabase } from "@/lib/supabaseClient";
import { useCompetitionResults } from "@/hooks/use-competition-results";
import { RankingResults } from "@/components/competition/ranking-results";

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
    const [userGuess, setUserGuess] = useState<number | null>(null);
    const [loadingGuess, setLoadingGuess] = useState(true);

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

    // Fetch user's current guess
    useEffect(() => {
        if (!slug) return;
        let cancelled = false;
        (async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    if (!cancelled) {
                        setUserGuess(null);
                        setLoadingGuess(false);
                    }
                    return;
                }

                const { data: comp } = await supabase
                    .from("competitions")
                    .select("id")
                    .eq("slug", slug)
                    .single();

                if (!comp) return;

                const { data: guess } = await supabase
                    .from("guesses")
                    .select("option_id")
                    .eq("user_id", user.id)
                    .eq("competition_id", comp.id)
                    .single();

                if (!cancelled) {
                    setUserGuess(guess?.option_id || null);
                    setLoadingGuess(false);
                }
            } catch (error) {
                if (!cancelled) {
                    setUserGuess(null);
                    setLoadingGuess(false);
                }
            }
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

    // Get competition results for ended competitions
    const { results, loading: resultsLoading } = useCompetitionResults(slug || '');

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
                width={40}
                height={40}
                className="rounded-lg border border-gray-600 shadow-sm"
                sizes="40px"
                onError={() => setImgSrc(`https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=374151&color=fff&size=40`)}
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
        setUserGuess(optionId);
        setMessage("Guess submitted");
    }

    const getCompetitionStats = () => {
        const totalItems = filtered.length;
        const itemsWithPrices = filtered.filter(item => item.lastClose != null).length;
        return { totalItems, itemsWithPrices };
    };

    const { totalItems, itemsWithPrices } = getCompetitionStats();

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Hero Header Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 lg:py-16">
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <div className="container relative">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-gray-100">
                            {title || <span className="animate-pulse bg-gray-700 h-12 w-96 rounded block mx-auto"></span>}
                        </h1>
                        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            Pick the asset you think will perform best tomorrow. Real-time data from Yahoo Finance in ET timezone.
                        </p>

                        {/* Competition Stats */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-6 text-sm">
                            <div className="flex items-center gap-2 text-gray-400">
                                <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <span className="text-lg font-medium text-gray-300">{totalItems} assets available</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <div className="w-8 h-8 bg-green-900 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <span className="text-lg font-medium text-gray-300">{itemsWithPrices} with live prices</span>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="max-w-md mx-auto mt-8">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search symbols or company names..."
                                    className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* User Selection Status */}
                        {!loadingGuess && (
                            <div className="max-w-md mx-auto mt-4">
                                {userGuess ? (
                                    <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3 text-center">
                                        <div className="flex items-center justify-center gap-2 text-green-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="font-medium">You've made your selection!</span>
                                        </div>
                                        <p className="text-sm text-gray-400 mt-1">
                                            Click any stock to change your selection anytime before the deadline
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3 text-center">
                                        <div className="flex items-center justify-center gap-2 text-blue-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            <span className="font-medium">Pick your stock!</span>
                                        </div>
                                        <p className="text-sm text-gray-400 mt-1">
                                            Choose one stock you think will perform best
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Message Display */}
                    {message && (
                        <div className={`max-w-md mx-auto p-4 rounded-lg border ${message.includes("submitted")
                            ? "bg-green-900/50 border-green-600 text-green-200"
                            : "bg-red-900/50 border-red-600 text-red-200"
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
            </section>

            {/* Main Content */}
            <div className="container py-8">

                {/* Stock List */}
                <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700">
                    {/* Desktop Header */}
                    <div className="hidden md:flex items-center gap-3 px-6 py-4 bg-gray-700 border-b border-gray-600">
                        {/* Logo Space */}
                        <div className="w-10 h-10 flex-shrink-0"></div>

                        {/* Symbol */}
                        <button
                            onClick={() => toggleSort('symbol')}
                            className="min-w-0 w-20 flex-shrink-0 flex items-center text-left font-medium text-gray-300 hover:text-gray-100 transition-colors"
                        >
                            Symbol
                            <Arrow active={sortKey === 'symbol'} dir={sortDir} />
                        </button>

                        {/* Company Name */}
                        <div className="flex-1 min-w-0 font-medium text-gray-300">
                            Company
                        </div>

                        {/* Price */}
                        <button
                            onClick={() => toggleSort('price')}
                            className="text-right w-24 flex-shrink-0 flex items-center justify-end font-medium text-gray-300 hover:text-gray-100 transition-colors"
                            title="Previous closing price"
                        >
                            Price
                            <Arrow active={sortKey === 'price'} dir={sortDir} />
                        </button>

                        {/* Change % */}
                        <button
                            onClick={() => toggleSort('pct')}
                            className="text-right w-28 flex-shrink-0 flex items-center justify-end font-medium text-gray-300 hover:text-gray-100 transition-colors"
                            title="Daily change percentage from previous close"
                        >
                            Change %
                            <Arrow active={sortKey === 'pct'} dir={sortDir} />
                        </button>

                        {/* Actions */}
                        <div className="flex items-center gap-3 flex-shrink-0 font-medium text-gray-300 justify-end">
                            Action
                        </div>
                    </div>

                    {/* Stock Rows - Dark Theme */}
                    <div className="divide-y divide-gray-700">
                        {(isLoading ? Array.from({ length: 15 }) : filtered).map((it: unknown, idx: number) => {
                            const idSafe = isLoading ? null : (it as EnrichedItem).id;
                            const item = it as EnrichedItem;

                            return (
                                <div key={idSafe ?? idx} className="hover:bg-gray-700 transition-colors duration-150 group">
                                    {/* Desktop Layout */}
                                    <div className="hidden md:flex items-center gap-3 px-6 py-4">
                                        {/* Logo */}
                                        {isLoading ? (
                                            <div className="w-10 h-10 rounded-lg bg-gray-700 animate-pulse flex-shrink-0" />
                                        ) : (
                                            <div className="relative flex-shrink-0">
                                                <StockLogo src={item.logoUrl} alt={item.symbol} />
                                            </div>
                                        )}

                                        {/* Symbol */}
                                        <div className="min-w-0 w-20 flex-shrink-0">
                                            {isLoading ? (
                                                <div className="h-4 bg-gray-700 rounded w-16 animate-pulse"></div>
                                            ) : (
                                                <div className="font-mono font-semibold text-gray-100 text-sm">{item.symbol}</div>
                                            )}
                                        </div>

                                        {/* Company Name */}
                                        <div className="flex-1 min-w-0">
                                            {isLoading ? (
                                                <div className="h-3 bg-gray-700 rounded w-40 animate-pulse"></div>
                                            ) : (
                                                <div className="text-sm text-gray-400 truncate">{item.name || '—'}</div>
                                            )}
                                        </div>

                                        {/* Price */}
                                        <div className="text-right w-24 flex-shrink-0">
                                            {isLoading ? (
                                                <div className="h-4 bg-gray-700 rounded w-20 animate-pulse ml-auto"></div>
                                            ) : (
                                                <div className="font-mono text-sm font-semibold text-gray-100">
                                                    {item.lastClose ? `$${item.lastClose.toFixed(2)}` : '—'}
                                                </div>
                                            )}
                                        </div>

                                        {/* Change % */}
                                        <div className="text-right w-28 flex-shrink-0">
                                            {isLoading ? (
                                                <div className="h-4 bg-gray-700 rounded w-16 animate-pulse ml-auto"></div>
                                            ) : (
                                                <div className={`font-mono text-sm font-medium ${item.pctPrevDay == null
                                                    ? 'text-gray-500'
                                                    : item.pctPrevDay >= 0
                                                        ? 'text-green-400'
                                                        : 'text-red-400'
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
                                        <div className="flex items-center gap-3 flex-shrink-0 justify-end w-24">
                                            {isLoading ? (
                                                <>
                                                    <div className="h-8 w-8 bg-gray-700 rounded animate-pulse"></div>
                                                    <div className="h-8 w-16 bg-gray-700 rounded animate-pulse"></div>
                                                </>
                                            ) : (
                                                <>
                                                    <a
                                                        href={item.tradingViewUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-gray-500 hover:text-blue-400 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
                                                        title="View on TradingView"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </a>
                                                    <button
                                                        onClick={() => idSafe && submitGuess(idSafe)}
                                                        disabled={isLoading || (idSafe != null && loadingId === idSafe)}
                                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 hover:shadow-lg transform hover:scale-105 w-20 ${userGuess === idSafe
                                                            ? 'bg-green-600 hover:bg-green-700 text-white'
                                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                            }`}
                                                    >
                                                        {idSafe != null && loadingId === idSafe ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                <span>...</span>
                                                            </div>
                                                        ) : userGuess === idSafe ? (
                                                            <div className="flex items-center gap-2">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                <span>Picked</span>
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
                                    <div className="md:hidden px-6 py-4">
                                        {isLoading ? (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="w-12 h-12 rounded-lg bg-gray-700 animate-pulse flex-shrink-0" />
                                                    <div className="flex-1">
                                                        <div className="h-4 bg-gray-700 rounded w-20 mb-2"></div>
                                                        <div className="h-3 bg-gray-700 rounded w-32"></div>
                                                    </div>
                                                </div>
                                                <div className="h-10 w-20 bg-gray-700 rounded-lg animate-pulse"></div>
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
                                                            <div className="font-mono font-semibold text-gray-100 text-sm">
                                                                {item.symbol}
                                                            </div>
                                                            {item.pctPrevDay != null && (
                                                                <div className={`font-mono text-xs font-medium ${item.pctPrevDay >= 0
                                                                    ? 'text-green-400'
                                                                    : 'text-red-400'
                                                                    }`}>
                                                                    {item.pctPrevDay >= 0 ? '+' : ''}{item.pctPrevDay.toFixed(2)}%
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-400 truncate">
                                                            {item.name || '—'}
                                                        </div>
                                                        {item.lastClose && (
                                                            <div className="font-mono text-xs text-gray-500 mt-1">
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
                                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 w-20 hover:shadow-lg transform hover:scale-105 ${userGuess === idSafe
                                                            ? 'bg-green-600 hover:bg-green-700 text-white'
                                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                            }`}
                                                    >
                                                        {idSafe != null && loadingId === idSafe ? (
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                                                        ) : userGuess === idSafe ? (
                                                            <div className="flex items-center gap-1">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                <span>Picked</span>
                                                            </div>
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
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-100 mb-3">No assets found</h3>
                            <p className="text-gray-400 mb-6">Try adjusting your search terms to find what you&apos;re looking for.</p>
                            {query && (
                                <button
                                    onClick={() => setQuery('')}
                                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium rounded-lg transition-colors duration-200"
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Competition Results Section */}
                {results?.isEnded && (
                    <div className="mt-12">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-100 mb-2">Competition Results</h2>
                            <p className="text-gray-400">See how all stocks performed and where you ranked</p>
                        </div>

                        {resultsLoading ? (
                            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
                                <div className="animate-pulse space-y-4">
                                    <div className="h-6 bg-gray-700 rounded w-48 mx-auto"></div>
                                    <div className="h-4 bg-gray-700 rounded w-64 mx-auto"></div>
                                    <div className="grid grid-cols-4 gap-4 mt-6">
                                        {Array.from({ length: 8 }).map((_, i) => (
                                            <div key={i} className="h-12 bg-gray-700 rounded"></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <RankingResults
                                topPerformers={results.topPerformers}
                                userResult={results.userScore ? {
                                    rank: results.userScore.rank,
                                    symbol: results.userScore.symbol,
                                    points: results.userScore.points,
                                    changePercent: results.userScore.changePercent,
                                } : undefined}
                                totalParticipants={results.totalParticipants}
                                scoringRate={results.scoringRate}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

