"use client";
import { useTheme } from '@/contexts/ThemeContext';
import { useState, useEffect } from 'react';

export function ThemeToggle() {
    const { theme, setTheme, actualTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <span className="text-base">💻</span>
                <span className="hidden sm:inline text-gray-700 dark:text-gray-300">
                    System
                </span>
            </div>
        );
    }

    const themes = [
        { key: 'light' as const, label: 'Light', icon: '☀️' },
        { key: 'dark' as const, label: 'Dark', icon: '🌙' },
        { key: 'system' as const, label: 'System', icon: '💻' }
    ];

    const currentTheme = themes.find(t => t.key === theme) || themes[2];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                aria-label="Toggle theme"
                type="button"
            >
                <span className="text-base">{currentTheme.icon}</span>
                <span className="hidden sm:inline text-gray-700 dark:text-gray-300">
                    {currentTheme.label}
                </span>
                <svg
                    className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                        aria-hidden="true"
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
                        <div className="py-1">
                            {themes.map((themeOption) => (
                                <button
                                    key={themeOption.key}
                                    onClick={() => {
                                        setTheme(themeOption.key);
                                        setIsOpen(false);
                                    }}
                                    type="button"
                                    className={`flex items-center gap-3 w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 cursor-pointer ${theme === themeOption.key
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                        : 'text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    <span className="text-base">{themeOption.icon}</span>
                                    <span>{themeOption.label}</span>
                                    {theme === themeOption.key && (
                                        <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
