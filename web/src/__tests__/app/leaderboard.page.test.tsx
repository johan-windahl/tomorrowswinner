/**
 * Test for leaderboard page
 */

import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import LeaderboardPage from '@/app/leaderboard/page';

// Mock the hooks
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@/hooks/use-leaderboard', () => ({
    useLeaderboard: jest.fn(() => ({
        leaderboard: [
            { rank: 1, username: 'TestUser', score: 100, winRate: 90, bestStreak: 5 }
        ],
        loading: false,
        error: null,
    })),
}));

describe('LeaderboardPage', () => {
    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
        });
    });

    it('renders successfully', () => {
        render(<LeaderboardPage />);

        expect(screen.getByText('Global Leaderboards')).toBeInTheDocument();
    });

    it('displays period selector', () => {
        render(<LeaderboardPage />);

        expect(screen.getByText('Today')).toBeInTheDocument();
        expect(screen.getByText('This Week')).toBeInTheDocument();
        expect(screen.getByText('All Time')).toBeInTheDocument();
    });

    it('displays leaderboard table', () => {
        render(<LeaderboardPage />);

        // Check for the table header with tooltips
        expect(screen.getByText('Score')).toBeInTheDocument();
        expect(screen.getByText('Win Rate')).toBeInTheDocument();
        expect(screen.getByText('Best Streak')).toBeInTheDocument();

        // Check for the medal icon
        expect(screen.getByText('🥇')).toBeInTheDocument();

        // Check that tooltip elements are present (they have cursor-help class)
        const tooltipElements = screen.getAllByText(/Score|Win Rate|Best Streak/);
        expect(tooltipElements.length).toBeGreaterThan(0);
    });
});
