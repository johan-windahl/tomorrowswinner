/**
 * Account information component
 */

import { useState } from 'react';
import { MessageBanner } from '@/components/ui/error-states';

interface User {
    id: string;
    email?: string;
}

interface AccountInfoProps {
    user: User;
    onDeleteAccount?: () => void;
}

export function AccountInfo({ user, onDeleteAccount }: AccountInfoProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDeleteClick = () => {
        if (showDeleteConfirm) {
            onDeleteAccount?.();
            setShowDeleteConfirm(false);
        } else {
            setShowDeleteConfirm(true);
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-gray-100 mb-6">Account Information</h2>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                    <div className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 cursor-not-allowed">
                        {user.email || "No email provided"}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Your email address cannot be changed</p>
                </div>

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
    );
}
