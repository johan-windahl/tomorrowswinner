/**
 * Hook for fetching competition results with ranking information
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface StockPerformance {
    rank: number;
    symbol: string;
    changePercent: number;
    points: number;
}

interface UserScore {
    points: number;
    rank: number;
    symbol: string;
    changePercent: number;
    totalStocks: number;
}

interface CompetitionResults {
    topPerformers: StockPerformance[];
    userScore?: UserScore;
    totalParticipants: number;
    scoringRate: number;
    isEnded: boolean;
}

interface UseCompetitionResultsResult {
    results: CompetitionResults | null;
    loading: boolean;
    error: string | null;
}

export function useCompetitionResults(competitionSlug: string): UseCompetitionResultsResult {
    const [results, setResults] = useState<CompetitionResults | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const fetchResults = async () => {
            try {
                // Get competition basic info
                const { data: competition, error: compError } = await supabase
                    .from('competitions')
                    .select('id, ended_at')
                    .eq('slug', competitionSlug)
                    .single();

                if (compError || !competition) {
                    throw new Error(compError?.message || 'Competition not found');
                }

                const isEnded = !!competition.ended_at;

                if (!isEnded) {
                    // Competition not ended yet
                    if (!cancelled) {
                        setResults({
                            topPerformers: [],
                            totalParticipants: 0,
                            scoringRate: 0,
                            isEnded: false,
                        });
                        setLoading(false);
                    }
                    return;
                }

                // Get results data
                const { data: resultsData, error: resultsError } = await supabase
                    .from('results')
                    .select('option_id, percent_change, is_winner, rank, options!inner(symbol)')
                    .eq('competition_id', competition.id)
                    .order('rank', { ascending: true });

                if (resultsError) {
                    throw new Error(resultsError.message);
                }

                // Get user's current session
                const { data: { user } } = await supabase.auth.getUser();
                let userScore: UserScore | undefined;

                if (user) {
                    // Get user's score and guess
                    const { data: scoreData } = await supabase
                        .from('scores')
                        .select('points, metadata')
                        .eq('competition_id', competition.id)
                        .eq('user_id', user.id)
                        .single();

                    if (scoreData?.metadata) {
                        const metadata = scoreData.metadata as Record<string, unknown>;
                        userScore = {
                            points: scoreData.points,
                            rank: typeof metadata.rank === 'number' ? metadata.rank : 0,
                            symbol: typeof metadata.symbol === 'string' ? metadata.symbol : '',
                            changePercent: typeof metadata.changePercent === 'number' ? metadata.changePercent : 0,
                            totalStocks: typeof metadata.totalStocks === 'number' ? metadata.totalStocks : 0,
                        };
                    }
                }

                // Get total participants
                const { count: totalParticipants } = await supabase
                    .from('guesses')
                    .select('*', { count: 'exact', head: true })
                    .eq('competition_id', competition.id);

                // Calculate scoring rate (users who earned points)
                const { count: scoringUsers } = await supabase
                    .from('scores')
                    .select('*', { count: 'exact', head: true })
                    .eq('competition_id', competition.id)
                    .gt('points', 0);

                const scoringRate = totalParticipants ? (scoringUsers || 0) / totalParticipants * 100 : 0;

                // Transform results data
                const topPerformers: StockPerformance[] = (resultsData || [])
                    .slice(0, 20)
                    .map((result: Record<string, unknown>) => ({
                        rank: typeof result.rank === 'number' ? result.rank : 0,
                        symbol: typeof result.options === 'object' && result.options && typeof (result.options as Record<string, unknown>).symbol === 'string' ? (result.options as Record<string, unknown>).symbol as string : '',
                        changePercent: typeof result.percent_change === 'number' ? result.percent_change : 0,
                        points: getPointsForRank(typeof result.rank === 'number' ? result.rank : 0),
                    }));

                if (!cancelled) {
                    setResults({
                        topPerformers,
                        userScore,
                        totalParticipants: totalParticipants || 0,
                        scoringRate,
                        isEnded: true,
                    });
                }
            } catch (err) {
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : 'Failed to fetch results';
                    setError(message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchResults();

        return () => {
            cancelled = true;
        };
    }, [competitionSlug]);

    return { results, loading, error };
}

// Helper function to get points for a rank (should match backend logic)
function getPointsForRank(rank: number): number {
    const RANKING_POINTS: Record<number, number> = {
        1: 100, 2: 60, 3: 40, 4: 25, 5: 20, 6: 15, 7: 12, 8: 10,
        9: 8, 10: 7, 11: 6, 12: 5, 13: 4, 14: 3, 15: 2, 16: 1
    };

    return RANKING_POINTS[rank] || 0;
}
