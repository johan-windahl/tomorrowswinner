/**
 * User profile data fetching hook
 * Handles user authentication state and profile data
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User, UserProfileUpdate } from '@/types/competition';

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
    updating: boolean;
    signOut: () => Promise<void>;
    updateProfile: (updates: UserProfileUpdate) => Promise<void>;
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
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const fetchUser = async () => {
            try {
                const { data, error: authError } = await supabase.auth.getUser();

                if (authError) {
                    throw new Error(authError.message);
                }

                if (!cancelled && data.user) {
                    // In a real app, you'd fetch additional profile data from your user profiles table
                    // For now, we'll use localStorage to persist profile updates
                    const storedProfile = localStorage.getItem(`profile_${data.user.id}`);
                    const profileData = storedProfile ? JSON.parse(storedProfile) : {};

                    setUser({
                        id: data.user.id,
                        email: data.user.email ?? undefined,
                        displayName: profileData.displayName,
                        avatarUrl: profileData.avatarUrl,
                        avatarType: profileData.avatarType || 'preset',
                    });
                } else if (!cancelled) {
                    setUser(null);
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

    const updateProfile = async (updates: UserProfileUpdate) => {
        if (!user) return;

        setUpdating(true);
        setError(null);

        try {
            // In a real app, you'd update the profile in your database
            // For now, we'll use localStorage to persist the updates
            const currentProfile = localStorage.getItem(`profile_${user.id}`);
            const profileData = currentProfile ? JSON.parse(currentProfile) : {};

            const updatedProfile = { ...profileData, ...updates };
            localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedProfile));

            // Update local state
            setUser(prev => prev ? { ...prev, ...updates } : null);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update profile';
            setError(message);
            throw err;
        } finally {
            setUpdating(false);
        }
    };

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
        updating,
        signOut,
        updateProfile,
    };
}
