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

        expect(screen.getByText('TestUser')).toBeInTheDocument();
        expect(screen.getByText('🥇')).toBeInTheDocument();
    });
});
