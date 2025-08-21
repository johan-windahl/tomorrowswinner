/**
 * Analytics Hook
 * Provides easy-to-use analytics tracking for React components
 */

'use client';

import { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import {
    trackPageView,
    trackCompetitionEvent,
    trackUserEvent,
    trackEngagementEvent,
    trackSearchEvent,
    trackFilterEvent,
    isAnalyticsEnabled,
} from '@/lib/analytics';

export function useAnalytics() {
    const pathname = usePathname();

    // Track page views automatically
    useEffect(() => {
        if (isAnalyticsEnabled()) {
            trackPageView(pathname);
        }
    }, [pathname]);

    // Competition tracking
    const trackCompetition = useCallback((
        action: 'view' | 'join' | 'guess_submitted',
        competitionData: {
            id?: string;
            category?: 'crypto' | 'finance';
            title?: string;
            slug?: string;
        }
    ) => {
        if (isAnalyticsEnabled()) {
            trackCompetitionEvent(action, competitionData);
        }
    }, []);

    // User action tracking
    const trackUser = useCallback((
        action: 'sign_up' | 'sign_in' | 'profile_update',
        method?: string
    ) => {
        if (isAnalyticsEnabled()) {
            trackUserEvent(action, method);
        }
    }, []);

    // Engagement tracking
    const trackEngagement = useCallback((
        action: 'leaderboard_view' | 'results_view' | 'help_accessed',
        section?: string,
        duration?: number
    ) => {
        if (isAnalyticsEnabled()) {
            trackEngagementEvent(action, section, duration);
        }
    }, []);

    // Search tracking
    const trackSearch = useCallback((searchTerm: string) => {
        if (isAnalyticsEnabled()) {
            trackSearchEvent(searchTerm);
        }
    }, []);

    // Filter tracking
    const trackFilter = useCallback((filterType: string, filterValue: string) => {
        if (isAnalyticsEnabled()) {
            trackFilterEvent(filterType, filterValue);
        }
    }, []);

    return {
        trackCompetition,
        trackUser,
        trackEngagement,
        trackSearch,
        trackFilter,
        isEnabled: isAnalyticsEnabled(),
    };
}

/**
 * Hook for tracking time spent on page/component
 */
export function usePageTimeTracking(pageName: string) {
    const { trackEngagement } = useAnalytics();

    useEffect(() => {
        const startTime = Date.now();

        return () => {
            const duration = Date.now() - startTime;
            trackEngagement('results_view', pageName, Math.round(duration / 1000));
        };
    }, [pageName, trackEngagement]);
}

/**
 * Hook for tracking competition interactions
 */
export function useCompetitionTracking() {
    const { trackCompetition } = useAnalytics();

    const trackView = useCallback((competition: {
        id?: string;
        slug?: string;
        category?: 'crypto' | 'finance';
        title?: string;
    }) => {
        trackCompetition('view', competition);
    }, [trackCompetition]);

    const trackJoin = useCallback((competition: {
        id?: string;
        slug?: string;
        category?: 'crypto' | 'finance';
        title?: string;
    }) => {
        trackCompetition('join', competition);
    }, [trackCompetition]);

    const trackGuessSubmitted = useCallback((competition: {
        id?: string;
        slug?: string;
        category?: 'crypto' | 'finance';
        title?: string;
    }) => {
        trackCompetition('guess_submitted', competition);
    }, [trackCompetition]);

    return {
        trackView,
        trackJoin,
        trackGuessSubmitted,
    };
}
