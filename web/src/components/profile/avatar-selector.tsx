/**
 * Avatar selector component for choosing preset avatars or uploading custom image
 */

import { useState } from 'react';
import { PRESET_AVATARS } from '@/lib/constants';

interface AvatarSelectorProps {
    currentAvatarUrl?: string;
    currentAvatarType?: 'upload' | 'preset';
    onAvatarChange: (avatarUrl: string, avatarType: 'upload' | 'preset') => void;
    onClose: () => void;
}

export function AvatarSelector({
    currentAvatarUrl,
    currentAvatarType,
    onAvatarChange,
    onClose
}: AvatarSelectorProps) {
    const [selectedTab, setSelectedTab] = useState<'presets' | 'upload'>('presets');
    const [selectedPreset, setSelectedPreset] = useState(
        currentAvatarType === 'preset' ? currentAvatarUrl : undefined
    );
    const [uploadPreview, setUploadPreview] = useState<string | null>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setUploadPreview(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePresetSelect = (avatarId: string) => {
        setSelectedPreset(avatarId);
    };

    const handleSave = () => {
        if (selectedTab === 'presets' && selectedPreset) {
            onAvatarChange(selectedPreset, 'preset');
        } else if (selectedTab === 'upload' && uploadPreview) {
            onAvatarChange(uploadPreview, 'upload');
        }
        onClose();
    };

    const renderPresetAvatar = (avatar: typeof PRESET_AVATARS[0], isSelected: boolean) => (
        <button
            key={avatar.id}
            onClick={() => handlePresetSelect(avatar.id)}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-xl transition-all duration-200 ${isSelected
                    ? `bg-gradient-to-br ${avatar.gradient} ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-800`
                    : `bg-gradient-to-br ${avatar.gradient} hover:scale-105`
                }`}
            title={avatar.name}
        >
            {avatar.emoji}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-100">Choose Avatar</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-200 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex mt-4 bg-gray-700 rounded-lg p-1">
                        <button
                            onClick={() => setSelectedTab('presets')}
                            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedTab === 'presets'
                                    ? 'bg-gray-600 text-gray-100'
                                    : 'text-gray-300 hover:text-gray-100'
                                }`}
                        >
                            Choose Avatar
                        </button>
                        <button
                            onClick={() => setSelectedTab('upload')}
                            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedTab === 'upload'
                                    ? 'bg-gray-600 text-gray-100'
                                    : 'text-gray-300 hover:text-gray-100'
                                }`}
                        >
                            Upload Photo
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-96">
                    {selectedTab === 'presets' ? (
                        <div className="grid grid-cols-5 gap-4">
                            {PRESET_AVATARS.map((avatar) =>
                                renderPresetAvatar(avatar, selectedPreset === avatar.id)
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Upload Area */}
                            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="avatar-upload"
                                />
                                <label
                                    htmlFor="avatar-upload"
                                    className="cursor-pointer block"
                                >
                                    <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-300 mb-2">Click to upload a photo</p>
                                    <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                                </label>
                            </div>

                            {/* Preview */}
                            {uploadPreview && (
                                <div className="text-center">
                                    <p className="text-gray-300 mb-2">Preview:</p>
                                    <div className="w-20 h-20 mx-auto rounded-full overflow-hidden">
                                        <img
                                            src={uploadPreview}
                                            alt="Avatar preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={
                            (selectedTab === 'presets' && !selectedPreset) ||
                            (selectedTab === 'upload' && !uploadPreview)
                        }
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                        Save Avatar
                    </button>
                </div>
            </div>
        </div>
    );
}
