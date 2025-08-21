/**
 * Google Analytics 4 (GA4) Configuration and Utilities
 * Provides type-safe analytics tracking with privacy compliance
 */

// Extend the Window interface to include gtag
declare global {
    interface Window {
        gtag: (
            command: 'config' | 'event' | 'js' | 'consent',
            targetId: string | Date | 'default' | 'update',
            config?: Record<string, unknown>
        ) => void;
        dataLayer: unknown[];
    }
}

export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;

/**
 * Initialize Google Analytics 4
 */
export const initGA4 = () => {
    if (!GA4_ID || typeof window === 'undefined') return;

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer.push(arguments);
    };

    // Configure GA4
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID, {
        // Privacy-friendly configuration
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        // Enhanced measurement
        enhanced_measurements: {
            scrolls: true,
            outbound_clicks: true,
            site_search: true,
            video_engagement: true,
            file_downloads: true,
        },
    });
};

/**
 * Track page views
 */
export const trackPageView = (url: string, title?: string) => {
    if (!GA4_ID || typeof window === 'undefined' || !window.gtag) return;

    window.gtag('config', GA4_ID, {
        page_path: url,
        page_title: title,
    });
};

/**
 * Custom event types for type safety
 */
export interface CompetitionEvent {
    event_name: 'competition_view' | 'competition_join' | 'guess_submitted';
    competition_id?: string;
    competition_category?: 'crypto' | 'finance';
    competition_title?: string;
}

export interface UserEvent {
    event_name: 'sign_up' | 'sign_in' | 'profile_update';
    method?: string;
}

export interface NavigationEvent {
    event_name: 'page_view' | 'search' | 'filter_applied';
    search_term?: string;
    filter_type?: string;
    filter_value?: string;
}

export interface EngagementEvent {
    event_name: 'leaderboard_view' | 'results_view' | 'help_accessed';
    section?: string;
    duration?: number;
}

export type AnalyticsEvent = CompetitionEvent | UserEvent | NavigationEvent | EngagementEvent;

/**
 * Track custom events with type safety
 */
export const trackEvent = (eventData: AnalyticsEvent) => {
    if (!GA4_ID || typeof window === 'undefined' || !window.gtag) return;

    const { event_name, ...parameters } = eventData;

    window.gtag('event', event_name, {
        ...parameters,
        // Add common parameters
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
    });
};

/**
 * Track competition-specific events
 */
export const trackCompetitionEvent = (
    action: 'view' | 'join' | 'guess_submitted',
    competitionData: {
        id?: string;
        category?: 'crypto' | 'finance';
        title?: string;
        slug?: string;
    }
) => {
    trackEvent({
        event_name: `competition_${action}` as CompetitionEvent['event_name'],
        competition_id: competitionData.id || competitionData.slug,
        competition_category: competitionData.category,
        competition_title: competitionData.title,
    });
};

/**
 * Track user authentication events
 */
export const trackUserEvent = (action: 'sign_up' | 'sign_in' | 'profile_update', method?: string) => {
    trackEvent({
        event_name: action,
        method,
    });
};

/**
 * Track engagement events
 */
export const trackEngagementEvent = (
    action: 'leaderboard_view' | 'results_view' | 'help_accessed',
    section?: string,
    duration?: number
) => {
    trackEvent({
        event_name: action,
        section,
        duration,
    });
};

/**
 * Track search and filtering
 */
export const trackSearchEvent = (searchTerm: string) => {
    trackEvent({
        event_name: 'search',
        search_term: searchTerm,
    });
};

export const trackFilterEvent = (filterType: string, filterValue: string) => {
    trackEvent({
        event_name: 'filter_applied',
        filter_type: filterType,
        filter_value: filterValue,
    });
};

/**
 * Utility to check if analytics is enabled
 */
export const isAnalyticsEnabled = (): boolean => {
    return !!(GA4_ID && typeof window !== 'undefined');
};

/**
 * Privacy-compliant consent management
 */
export const updateConsent = (granted: boolean) => {
    if (!GA4_ID || typeof window === 'undefined' || !window.gtag) return;

    window.gtag('consent', 'update', {
        analytics_storage: granted ? 'granted' : 'denied',
        ad_storage: 'denied', // Always deny ad storage for privacy
        ad_user_data: 'denied',
        ad_personalization: 'denied',
    });
};

/**
 * Set default consent (call before GA4 loads)
 */
export const setDefaultConsent = () => {
    if (!GA4_ID || typeof window === 'undefined') return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer.push(arguments);
    };

    window.gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        wait_for_update: 500,
    });
};
