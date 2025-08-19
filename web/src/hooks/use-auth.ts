/**
 * Authentication hook
 * Handles sign in, sign up, and sign out operations
 */

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface UseAuthResult {
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    loading: boolean;
    error: string | null;
    success: string | null;
}

export function useAuth(): UseAuthResult {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    };

    const signIn = async (email: string, password: string) => {
        setLoading(true);
        clearMessages();

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) {
                setError(authError.message);
            } else {
                setSuccess('Successfully signed in!');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email: string, password: string) => {
        setLoading(true);
        clearMessages();

        try {
            const { error: authError } = await supabase.auth.signUp({
                email,
                password
            });

            if (authError) {
                setError(authError.message);
            } else {
                setSuccess('Check your email to confirm your account.');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        setLoading(true);
        clearMessages();

        try {
            const { error: authError } = await supabase.auth.signOut();

            if (authError) {
                setError(authError.message);
            } else {
                setSuccess('Successfully signed out.');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return {
        signIn,
        signUp,
        signOut,
        loading,
        error,
        success,
    };
}
