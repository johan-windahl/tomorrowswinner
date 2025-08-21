/**
 * Google Analytics 4 Component
 * Handles GA4 script loading and initialization
 */

'use client';

import Script from 'next/script';
import { GA4_ID, initGA4 } from '@/lib/analytics';

export function GoogleAnalytics() {
    // Don't render in development or if GA4_ID is not set
    if (process.env.NODE_ENV === 'development' || !GA4_ID) {
        return null;
    }

    return (
        <>
            {/* Set consent before GA4 loads */}
            <Script
                id="ga4-consent"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'analytics_storage': 'denied',
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'wait_for_update': 500
            });
          `,
                }}
            />

            {/* Load GA4 script */}
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
                strategy="afterInteractive"
                onLoad={() => {
                    initGA4();
                    // Grant consent for analytics (you can make this conditional based on user consent)
                    if (typeof window !== 'undefined' && window.gtag) {
                        window.gtag('consent', 'update', {
                            'analytics_storage': 'granted',
                        });
                    }
                }}
            />
        </>
    );
}
