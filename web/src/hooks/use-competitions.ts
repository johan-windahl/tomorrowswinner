/**
 * Competition data fetching hooks
 * Centralized data fetching logic with consistent error handling
 */

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Competition, HistoricalCompetition } from '@/types/competition';

interface UseCompetitionsOptions {
    type?: 'active' | 'historical';
    limit?: number;
}

interface UseCompetitionsResult {
    competitions: Competition[] | HistoricalCompetition[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useCompetitions({
    type = 'active',
    limit = 50
}: UseCompetitionsOptions = {}): UseCompetitionsResult {
    const [competitions, setCompetitions] = useState<Competition[] | HistoricalCompetition[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCompetitions = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const now = new Date().toISOString();

            let query = supabase
                .from('competitions')
                .select('id, title, slug, category, deadline_at, evaluation_end_at')
                .order('deadline_at', { ascending: type === 'active' })
                .limit(limit);

            if (type === 'active') {
                query = query.gte('deadline_at', now); // Greater than or equal to now
            } else {
                query = query.lt('deadline_at', now); // Less than now (past competitions)
            }

            const { data, error: fetchError } = await query;

            if (fetchError) {
                throw new Error(fetchError.message);
            }

            setCompetitions(data ?? []);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch competitions';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [type, limit]);

    useEffect(() => {
        let cancelled = false;

        fetchCompetitions().then(() => {
            if (cancelled) return;
        });

        return () => {
            cancelled = true;
        };
    }, [type, limit, fetchCompetitions]);

    return {
        competitions,
        loading,
        error,
        refetch: fetchCompetitions,
    };
}

interface UseCompetitionResult {
    competition: Competition | null;
    loading: boolean;
    error: string | null;
}

export function useCompetition(slug: string): UseCompetitionResult {
    const [competition, setCompetition] = useState<Competition | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;

        let cancelled = false;

        const fetchCompetition = async () => {
            try {
                const { data, error: fetchError } = await supabase
                    .from('competitions')
                    .select('id, title, slug, category, deadline_at, start_at, evaluation_end_at, timezone')
                    .eq('slug', slug)
                    .single();

                if (fetchError) {
                    throw new Error(fetchError.message);
                }

                if (!cancelled) {
                    setCompetition(data);
                    setError(null);
                }
            } catch (err) {
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : 'Failed to fetch competition';
                    setError(message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchCompetition();

        return () => {
            cancelled = true;
        };
    }, [slug]);

    return {
        competition,
        loading,
        error,
    };
}
