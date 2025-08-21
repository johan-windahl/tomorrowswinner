/**
 * User profile management hook
 * Handles user authentication and profile data
 */

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getUserProfile, updateUserProfile, uploadAvatarImage, deleteAvatarImage } from '@/lib/storage/avatar-storage';

export interface User {
    id: string;
    email?: string;
    displayName?: string;
    avatarUrl?: string;
    avatarType?: 'upload' | 'preset';
}

export interface UserStats {
    totalPredictions: number;
    accuracyRate: number;
    currentStreak: number;
    bestStreak: number;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    unlockedAt: string;
    icon: string;
}

export interface UserProfileUpdate {
    displayName?: string;
    avatarUrl?: string;
    avatarType?: 'upload' | 'preset';
}

export interface UseUserProfileResult {
    user: User | null;
    stats: UserStats;
    achievements: Achievement[];
    loading: boolean;
    error: string | null;
    updating: boolean;
    signOut: () => Promise<void>;
    updateProfile: (updates: UserProfileUpdate) => Promise<void>;
}

// Mock data for now
const MOCK_STATS: UserStats = {
    totalPredictions: 12,
    accuracyRate: 75,
    currentStreak: 3,
    bestStreak: 8,
};

const MOCK_ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first-win',
        title: 'First Win',
        description: 'Made your first correct prediction',
        unlockedAt: '2024-01-15',
        icon: '🏆',
    },
    {
        id: 'streak-5',
        title: 'Hot Streak',
        description: 'Correctly predicted 5 competitions in a row',
        unlockedAt: '2024-01-18',
        icon: '🔥',
    },
];

export function useUserProfile(): UseUserProfileResult {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const fetchUser = async (userId: string) => {
            try {
                // Get auth user data for email
                const { data: authData, error: authError } = await supabase.auth.getUser();
                if (authError) {
                    throw new Error(authError.message);
                }

                // Fetch profile data from database
                const profileData = await getUserProfile(userId);

                if (profileData.error) {
                    console.warn('Failed to fetch profile:', profileData.error);
                }

                if (!cancelled) {
                    setUser({
                        id: userId,
                        email: authData.user?.email ?? undefined,
                        displayName: profileData.display_name,
                        avatarUrl: profileData.avatar_url,
                        avatarType: profileData.avatar_type || 'preset',
                    });
                }
            } catch (err) {
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : 'Failed to fetch user profile';
                    setError(message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        // Get initial user state
        const getInitialUser = async () => {
            try {
                const { data, error: authError } = await supabase.auth.getUser();

                if (authError) {
                    throw new Error(authError.message);
                }

                if (!cancelled) {
                    if (data.user) {
                        await fetchUser(data.user.id);
                    } else {
                        setUser(null);
                        setLoading(false);
                    }
                }
            } catch (err) {
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : 'Failed to fetch user';
                    setError(message);
                    setLoading(false);
                }
            }
        };

        getInitialUser();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (cancelled) return;

                if (event === 'SIGNED_IN' && session?.user) {
                    setLoading(true);
                    await fetchUser(session.user.id);
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setLoading(false);
                }
            }
        );

        return () => {
            cancelled = true;
            subscription.unsubscribe();
        };
    }, []);

    const updateProfile = async (updates: UserProfileUpdate) => {
        if (!user) return;

        setUpdating(true);
        setError(null);

        try {
            // Handle avatar upload if needed
            let avatarUrl = updates.avatarUrl;
            let avatarType = updates.avatarType;

            if (updates.avatarType === 'upload' && updates.avatarUrl) {
                // Convert data URL to file and upload to Supabase Storage
                const response = await fetch(updates.avatarUrl);
                const blob = await response.blob();
                const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });

                const uploadResult = await uploadAvatarImage(file, user.id);
                if (uploadResult.error) {
                    throw new Error(uploadResult.error);
                }

                avatarUrl = uploadResult.url;
                avatarType = 'upload';
            }

            // Delete old avatar if changing from upload to preset
            if (user.avatarType === 'upload' && user.avatarUrl && avatarType === 'preset') {
                await deleteAvatarImage(user.avatarUrl);
                avatarUrl = undefined;
            }

            // Update database
            const dbUpdates: { display_name?: string; avatar_url?: string; avatar_type?: 'upload' | 'preset' } = {};
            if (updates.displayName !== undefined) {
                dbUpdates.display_name = updates.displayName;
            }
            if (avatarUrl !== undefined) {
                dbUpdates.avatar_url = avatarUrl;
            }
            if (avatarType !== undefined) {
                dbUpdates.avatar_type = avatarType;
            }

            const updateResult = await updateUserProfile(user.id, dbUpdates);
            if (updateResult.error) {
                throw new Error(updateResult.error);
            }

            // Update local state
            setUser(prev => prev ? {
                ...prev,
                displayName: updates.displayName !== undefined ? updates.displayName : prev.displayName,
                avatarUrl: avatarUrl !== undefined ? avatarUrl : prev.avatarUrl,
                avatarType: avatarType !== undefined ? avatarType : prev.avatarType,
            } : null);
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
