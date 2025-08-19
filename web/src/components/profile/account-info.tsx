/**
 * Account information component
 */

import { useState } from 'react';
import { MessageBanner } from '@/components/ui/error-states';
import { AvatarSelector } from './avatar-selector';
import { AvatarDisplay } from './avatar-display';
import type { User, UserProfileUpdate } from '@/types/competition';

interface AccountInfoProps {
    user: User;
    updating?: boolean;
    onProfileUpdate?: (updates: UserProfileUpdate) => Promise<void>;
    onDeleteAccount?: () => void;
}

export function AccountInfo({ user, updating, onProfileUpdate, onDeleteAccount }: AccountInfoProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showAvatarSelector, setShowAvatarSelector] = useState(false);
    const [editingName, setEditingName] = useState(false);
    const [displayName, setDisplayName] = useState(user.displayName || '');
    const [savingName, setSavingName] = useState(false);

    const handleDeleteClick = () => {
        if (showDeleteConfirm) {
            onDeleteAccount?.();
            setShowDeleteConfirm(false);
        } else {
            setShowDeleteConfirm(true);
        }
    };

    const handleAvatarChange = async (avatarUrl: string, avatarType: 'upload' | 'preset') => {
        try {
            await onProfileUpdate?.({ avatarUrl, avatarType });
        } catch (error) {
            console.error('Failed to update avatar:', error);
        }
    };

    const handleNameSave = async () => {
        if (!displayName.trim()) {
            setDisplayName(user.displayName || '');
            setEditingName(false);
            return;
        }

        setSavingName(true);
        try {
            await onProfileUpdate?.({ displayName: displayName.trim() });
            setEditingName(false);
        } catch (error) {
            console.error('Failed to update name:', error);
            setDisplayName(user.displayName || '');
        } finally {
            setSavingName(false);
        }
    };

    const handleNameCancel = () => {
        setDisplayName(user.displayName || '');
        setEditingName(false);
    };

    return (
        <>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-gray-100 mb-6">Account Information</h2>

                <div className="space-y-6">
                    {/* Avatar Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">Profile Picture</label>
                        <div className="flex items-center gap-4">
                            <AvatarDisplay
                                avatarUrl={user.avatarUrl}
                                avatarType={user.avatarType}
                                displayName={user.displayName}
                                email={user.email}
                                size="xl"
                            />
                            <button
                                onClick={() => setShowAvatarSelector(true)}
                                disabled={updating}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-200 text-sm font-medium rounded-lg transition-colors duration-200"
                            >
                                {updating ? 'Updating...' : 'Change Avatar'}
                            </button>
                        </div>
                    </div>

                    {/* Display Name Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                        {editingName ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Enter your display name"
                                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    maxLength={50}
                                    disabled={savingName}
                                />
                                <button
                                    onClick={handleNameSave}
                                    disabled={savingName}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors duration-200"
                                >
                                    {savingName ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={handleNameCancel}
                                    disabled={savingName}
                                    className="px-4 py-2 text-gray-400 hover:text-gray-200 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100">
                                    {user.displayName || 'No display name set'}
                                </div>
                                <button
                                    onClick={() => {
                                        setEditingName(true);
                                        setDisplayName(user.displayName || '');
                                    }}
                                    disabled={updating}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-200 text-sm font-medium rounded-lg transition-colors duration-200"
                                >
                                    Edit
                                </button>
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">This is how other users will see your name</p>
                    </div>

                    {/* Email Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                        <div className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 cursor-not-allowed">
                            {user.email || "No email provided"}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Your email address cannot be changed</p>
                    </div>

                    {/* User ID Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">User ID</label>
                        <div className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 cursor-not-allowed font-mono text-sm break-all">
                            {user.id}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Your unique identifier</p>
                    </div>

                    {showDeleteConfirm && (
                        <MessageBanner
                            message="Are you sure? This action cannot be undone."
                            type="warning"
                        />
                    )}

                    <div className="pt-4 border-t border-gray-700">
                        <button
                            onClick={handleDeleteClick}
                            className={`px-4 py-2 border rounded-lg font-medium transition-colors duration-200 ${showDeleteConfirm
                                    ? 'bg-red-600 hover:bg-red-700 text-white border-red-600'
                                    : 'text-red-400 border-red-600 hover:bg-red-900/20'
                                }`}
                        >
                            {showDeleteConfirm ? 'Confirm Delete' : 'Delete Account'}
                        </button>
                        {showDeleteConfirm && (
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="ml-3 px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Avatar Selector Modal */}
            {showAvatarSelector && (
                <AvatarSelector
                    currentAvatarUrl={user.avatarUrl}
                    currentAvatarType={user.avatarType}
                    onAvatarChange={handleAvatarChange}
                    onClose={() => setShowAvatarSelector(false)}
                />
            )}
        </>
    );
}