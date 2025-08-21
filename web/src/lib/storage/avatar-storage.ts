/**
 * Avatar storage utilities for Supabase Storage and database
 */

import { supabase } from '@/lib/supabaseClient';

const AVATAR_BUCKET = 'avatars';

/**
 * Create user profile if it doesn't exist
 */
async function ensureUserProfile(userId: string, email?: string): Promise<{ error?: string }> {
    try {
        // Try to get the profile first
        const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .single();

        // If profile exists, no need to create
        if (existingProfile) {
            return {};
        }

        // If no profile exists, create one
        if (fetchError && fetchError.code === 'PGRST116') {
            const handle = `user${userId.substring(0, 8)}`;
            const displayName = email ? email.split('@')[0] : 'user';

            const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                    id: userId,
                    handle: handle,
                    display_name: displayName,
                    avatar_type: 'preset'
                });

            if (insertError) {
                console.error('Failed to create profile:', insertError);
                return { error: insertError.message };
            }

            return {};
        }

        return { error: fetchError?.message || 'Failed to check profile' };
    } catch (error) {
        console.error('Error ensuring user profile:', error);
        return { error: 'Failed to create user profile' };
    }
}

/**
 * Upload avatar image to Supabase Storage
 */
export async function uploadAvatarImage(
    file: File,
    userId: string
): Promise<{ url: string; error?: string }> {
    try {
        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { url: '', error: 'User not authenticated' };
        }

        // Ensure user profile exists
        const profileResult = await ensureUserProfile(userId, user.email);
        if (profileResult.error) {
            return { url: '', error: `Profile setup failed: ${profileResult.error}` };
        }

        // Create a unique filename
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${userId}-${Date.now()}.${fileExt}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from(AVATAR_BUCKET)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            // Check for specific error types
            if (uploadError.message.includes('bucket') || uploadError.message.includes('not found')) {
                return { url: '', error: 'Avatar storage is not configured. Please contact support.' };
            }
            if (uploadError.message.includes('permission') || uploadError.message.includes('unauthorized')) {
                return { url: '', error: 'You do not have permission to upload avatars. Please contact support.' };
            }
            return { url: '', error: `Upload failed: ${uploadError.message}` };
        }

        // Get the public URL
        const { data: urlData } = supabase.storage
            .from(AVATAR_BUCKET)
            .getPublicUrl(fileName);

        return { url: urlData.publicUrl };
    } catch (error) {
        console.error('Avatar upload failed:', error);
        return { url: '', error: 'Failed to upload avatar. Please try again.' };
    }
}

/**
 * Delete avatar image from Supabase Storage
 */
export async function deleteAvatarImage(fileUrl: string): Promise<{ error?: string }> {
    try {
        // Only try to delete if it's a storage URL
        if (!fileUrl.includes('supabase.co')) {
            return {}; // Skip deletion for data URLs
        }

        // Extract filename from URL
        const urlParts = fileUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];

        if (!fileName) {
            return { error: 'Invalid file URL' };
        }

        const { error } = await supabase.storage
            .from(AVATAR_BUCKET)
            .remove([fileName]);

        if (error) {
            console.error('Delete error:', error);
            return { error: error.message };
        }

        return {};
    } catch (error) {
        console.error('Avatar deletion failed:', error);
        return { error: 'Failed to delete avatar' };
    }
}

/**
 * Update user profile in database
 */
export async function updateUserProfile(
    userId: string,
    updates: {
        display_name?: string;
        avatar_url?: string;
        avatar_type?: 'upload' | 'preset';
    }
): Promise<{ error?: string }> {
    try {
        // Ensure user profile exists before updating
        const profileResult = await ensureUserProfile(userId);
        if (profileResult.error) {
            return { error: `Profile setup failed: ${profileResult.error}` };
        }

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId);

        if (error) {
            console.error('Profile update error:', error);
            return { error: error.message };
        }

        return {};
    } catch (error) {
        console.error('Profile update failed:', error);
        return { error: 'Failed to update profile' };
    }
}

/**
 * Get user profile from database
 */
export async function getUserProfile(userId: string): Promise<{
    display_name?: string;
    avatar_url?: string;
    avatar_type?: 'upload' | 'preset';
    error?: string;
}> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('display_name, avatar_url, avatar_type')
            .eq('id', userId)
            .single();

        if (error) {
            // If no profile exists, create one and return default values
            if (error.code === 'PGRST116') {
                const profileResult = await ensureUserProfile(userId);
                if (profileResult.error) {
                    return { error: `Failed to create profile: ${profileResult.error}` };
                }

                // Return default values for newly created profile
                return {
                    display_name: undefined,
                    avatar_url: undefined,
                    avatar_type: 'preset'
                };
            }

            return { error: error.message };
        }

        return {
            display_name: data?.display_name,
            avatar_url: data?.avatar_url,
            avatar_type: data?.avatar_type || 'preset'
        };
    } catch (error) {
        console.error('Profile fetch failed:', error);
        return { error: 'Failed to fetch profile' };
    }
}
