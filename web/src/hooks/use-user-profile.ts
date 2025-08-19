/**
 * User profile data fetching hook
 * Handles user authentication state and profile data
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface User {
    id: string;
    email?: string;
}

interface UserStats {
    totalPredictions: number;
    accuracyRate: number;
    currentStreak: number;
    bestStreak: number;
}

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt: string;
}

interface UseUserProfileResult {
    user: User | null;
    stats: UserStats;
    achievements: Achievement[];
    loading: boolean;
    error: string | null;
    signOut: () => Promise<void>;
}

// Mock data - in a real app this would come from the database
const MOCK_STATS: UserStats = {
    totalPredictions: 12,
    accuracyRate: 75,
    currentStreak: 3,
    bestStreak: 8,
};

const MOCK_ACHIEVEMENTS: Achievement[] = [
    {
        id: '1',
        title: 'First Win',
        description: 'Made your first correct prediction',
        icon: '🏆',
        unlockedAt: '2024-01-15',
    },
    {
        id: '2',
        title: 'Hot Streak',
        description: '3 correct predictions in a row',
        icon: '🔥',
        unlockedAt: '2024-01-18',
    },
];

export function useUserProfile(): UseUserProfileResult {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const fetchUser = async () => {
            try {
                const { data, error: authError } = await supabase.auth.getUser();

                if (authError) {
                    throw new Error(authError.message);
                }

                if (!cancelled) {
                    setUser(data.user ? {
                        id: data.user.id,
                        email: data.user.email ?? undefined
                    } : null);
                }
            } catch (err) {
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : 'Failed to fetch user';
                    setError(message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchUser();

        return () => {
            cancelled = true;
        };
    }, []);

    const signOut = async () => {
        try {
            const { error: signOutError } = await supabase.auth.signOut();
            if (signOutError) {
                throw new Error(signOutError.message);
            }
            setUser(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to sign out';
            setError(message);
        }
    };

    return {
        user,
        stats: MOCK_STATS,
        achievements: MOCK_ACHIEVEMENTS,
        loading,
        error,
        signOut,
    };
}
