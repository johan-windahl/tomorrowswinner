/**
 * Cookie Consent Banner
 * Privacy-compliant analytics consent management
 */

'use client';

import { useState, useEffect } from 'react';
import { updateConsent, isAnalyticsEnabled } from '@/lib/analytics';

const CONSENT_KEY = 'analytics-consent';
const CONSENT_VERSION = '1.0';

export function CookieConsent() {
    const [showBanner, setShowBanner] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Don't show banner if analytics is not enabled
        if (!isAnalyticsEnabled()) return;

        // Check if user has already made a choice
        const consent = localStorage.getItem(CONSENT_KEY);
        const consentData = consent ? JSON.parse(consent) : null;

        // Show banner if no consent or old version
        if (!consentData || consentData.version !== CONSENT_VERSION) {
            setShowBanner(true);
        } else {
            // Apply stored consent
            updateConsent(consentData.granted);
        }
    }, []);

    const handleConsent = async (granted: boolean) => {
        setLoading(true);

        // Store consent
        const consentData = {
            granted,
            version: CONSENT_VERSION,
            timestamp: new Date().toISOString(),
        };
        localStorage.setItem(CONSENT_KEY, JSON.stringify(consentData));

        // Update analytics
        updateConsent(granted);

        // Hide banner
        setShowBanner(false);
        setLoading(false);
    };

    if (!showBanner || !isAnalyticsEnabled()) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700">
            <div className="container max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    {/* Content */}
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-100 mb-2">
                            Analytics & Performance
                        </h3>
                        <p className="text-sm text-gray-300 leading-relaxed">
                            We use analytics to understand how you use Tomorrow&apos;s Winner and improve your experience.
                            This helps us make better predictions features and optimize performance.
                            <br />
                            <span className="text-xs text-gray-400 mt-1 block">
                                We don&apos;t use ads or sell your data. Analytics data is anonymized and used only for improving the platform.
                            </span>
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                        <button
                            onClick={() => handleConsent(false)}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-gray-100 border border-gray-600 hover:border-gray-500 rounded-lg transition-colors disabled:opacity-50"
                        >
                            Essential Only
                        </button>
                        <button
                            onClick={() => handleConsent(true)}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                'Accept Analytics'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Hook to check current consent status
 */
export function useAnalyticsConsent() {
    const [hasConsent, setHasConsent] = useState<boolean | null>(null);

    useEffect(() => {
        const consent = localStorage.getItem(CONSENT_KEY);
        const consentData = consent ? JSON.parse(consent) : null;
        setHasConsent(consentData?.granted || false);
    }, []);

    const updateConsentStatus = (granted: boolean) => {
        const consentData = {
            granted,
            version: CONSENT_VERSION,
            timestamp: new Date().toISOString(),
        };
        localStorage.setItem(CONSENT_KEY, JSON.stringify(consentData));
        setHasConsent(granted);
        updateConsent(granted);
    };

    return {
        hasConsent,
        updateConsent: updateConsentStatus,
    };
}
