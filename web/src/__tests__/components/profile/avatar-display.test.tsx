/**
 * Test for AvatarDisplay component
 */

import { render, screen } from '@testing-library/react';
import { AvatarDisplay } from '@/components/profile/avatar-display';

describe('AvatarDisplay', () => {
    it('renders preset avatar correctly', () => {
        render(
            <AvatarDisplay
                avatarUrl="avatar-1"
                avatarType="preset"
                displayName="Test User"
                email="test@example.com"
            />
        );

        // Should show the rocket emoji from avatar-1
        expect(screen.getByText('🚀')).toBeInTheDocument();
    });

    it('renders uploaded avatar correctly', () => {
        render(
            <AvatarDisplay
                avatarUrl="data:image/png;base64,test"
                avatarType="upload"
                displayName="Test User"
                email="test@example.com"
            />
        );

        // Should show uploaded image
        const img = screen.getByAltText('Profile avatar');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'data:image/png;base64,test');
    });

    it('renders initials fallback when no avatar', () => {
        render(
            <AvatarDisplay
                displayName="Test User"
                email="test@example.com"
            />
        );

        // Should show initials TU
        expect(screen.getByText('TU')).toBeInTheDocument();
    });

    it('renders single initial for single name', () => {
        render(
            <AvatarDisplay
                displayName="Test"
                email="test@example.com"
            />
        );

        // Should show initial T
        expect(screen.getByText('T')).toBeInTheDocument();
    });

    it('renders email initial when no display name', () => {
        render(
            <AvatarDisplay
                email="test@example.com"
            />
        );

        // Should show initial T from email
        expect(screen.getByText('T')).toBeInTheDocument();
    });

    it('renders default U when no data', () => {
        render(<AvatarDisplay />);

        // Should show default U
        expect(screen.getByText('U')).toBeInTheDocument();
    });

    it('applies correct size classes', () => {
        const { container } = render(
            <AvatarDisplay size="sm" displayName="Test" />
        );

        const avatar = container.firstChild as HTMLElement;
        expect(avatar).toHaveClass('w-8', 'h-8', 'text-sm');
    });
});
