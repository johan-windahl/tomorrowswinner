/**
 * Competition guess submission hook
 * Handles guess submission with proper error handling and loading states
 */

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface UseCompetitionGuessResult {
    submitGuess: (optionId: number) => Promise<void>;
    loading: boolean;
    error: string | null;
    success: boolean;
}

export function useCompetitionGuess(competitionSlug: string): UseCompetitionGuessResult {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const submitGuess = async (optionId: number) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Get competition details
            const { data: comp, error: compError } = await supabase
                .from('competitions')
                .select('id, deadline_at')
                .eq('slug', competitionSlug)
                .single();

            if (compError || !comp) {
                throw new Error(compError?.message ?? 'Competition not found');
            }

            // Check if deadline has passed
            if (new Date() > new Date(comp.deadline_at)) {
                throw new Error('Deadline has passed');
            }

            // Get current user
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                throw new Error('Not authenticated');
            }

            // Submit guess
            const { error: upsertError } = await supabase
                .from('guesses')
                .upsert(
                    {
                        user_id: user.id,
                        competition_id: comp.id,
                        option_id: optionId
                    },
                    { onConflict: 'user_id,competition_id' }
                );

            if (upsertError) {
                throw new Error(upsertError.message);
            }

            setSuccess(true);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to submit guess';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return {
        submitGuess,
        loading,
        error,
        success,
    };
}
