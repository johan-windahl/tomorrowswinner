/**
 * Avatar display component that handles both preset and uploaded avatars
 */

import { PRESET_AVATARS } from '@/lib/constants';

interface AvatarDisplayProps {
    avatarUrl?: string;
    avatarType?: 'upload' | 'preset';
    displayName?: string;
    email?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl',
};

export function AvatarDisplay({
    avatarUrl,
    avatarType = 'preset',
    displayName,
    email,
    size = 'lg',
    className = '',
}: AvatarDisplayProps) {
    const sizeClass = sizeClasses[size];

    // If it's a preset avatar, find the matching preset
    if (avatarType === 'preset' && avatarUrl) {
        const preset = PRESET_AVATARS.find(avatar => avatar.id === avatarUrl);
        if (preset) {
            return (
                <div
                    className={`${sizeClass} bg-gradient-to-br ${preset.gradient} rounded-full flex items-center justify-center font-bold text-white ${className}`}
                >
                    {preset.emoji}
                </div>
            );
        }
    }

    // If it's an uploaded image
    if (avatarType === 'upload' && avatarUrl) {
        return (
            <div className={`${sizeClass} rounded-full overflow-hidden ${className}`}>
                <img
                    src={avatarUrl}
                    alt="Profile avatar"
                    className="w-full h-full object-cover"
                />
            </div>
        );
    }

    // Fallback to initials
    const initials = getInitials(displayName, email);

    return (
        <div
            className={`${sizeClass} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-white ${className}`}
        >
            {initials}
        </div>
    );
}

function getInitials(displayName?: string, email?: string): string {
    if (displayName) {
        const names = displayName.trim().split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return displayName[0].toUpperCase();
    }

    if (email) {
        return email[0].toUpperCase();
    }

    return 'U';
}
