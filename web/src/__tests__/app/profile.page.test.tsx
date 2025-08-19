/**
 * Test for profile page
 */

import { render, screen } from '@testing-library/react';
import ProfilePage from '@/app/profile/page';

// Mock the hooks
jest.mock('@/hooks/use-user-profile', () => ({
    useUserProfile: jest.fn(() => ({
        user: {
            id: 'test-user-id',
            email: 'test@example.com'
        },
        stats: {
            totalPredictions: 12,
            accuracyRate: 75,
            currentStreak: 3,
            bestStreak: 8,
        },
        achievements: [
            {
                id: '1',
                title: 'First Win',
                description: 'Made your first correct prediction',
                icon: '🏆',
                unlockedAt: '2024-01-15',
            }
        ],
        loading: false,
        error: null,
        signOut: jest.fn(),
    })),
}));

jest.mock('next/link', () => {
    return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
        return <a href={href}>{children}</a>;
    };
});

describe('ProfilePage', () => {
    it('renders successfully', () => {
        render(<ProfilePage />);

        expect(screen.getByText('Your Profile')).toBeInTheDocument();
        expect(screen.getByText('Manage your account and view your prediction stats')).toBeInTheDocument();
    });

    it('displays user information', () => {
        render(<ProfilePage />);

        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        expect(screen.getByText('test-user-id')).toBeInTheDocument();
    });

    it('displays user stats', () => {
        render(<ProfilePage />);

        expect(screen.getByText('12')).toBeInTheDocument(); // Total predictions
        expect(screen.getByText('75%')).toBeInTheDocument(); // Accuracy rate
        expect(screen.getByText('3 days')).toBeInTheDocument(); // Current streak
        expect(screen.getByText('8 days')).toBeInTheDocument(); // Best streak
    });

    it('displays achievements', () => {
        render(<ProfilePage />);

        expect(screen.getByText('First Win')).toBeInTheDocument();
        expect(screen.getByText('Made your first correct prediction')).toBeInTheDocument();
    });

    it('displays account management options', () => {
        render(<ProfilePage />);

        expect(screen.getByText('Delete Account')).toBeInTheDocument();
    });
});
