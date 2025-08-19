/**
 * Test for sign-in page
 */

import { render, screen } from '@testing-library/react';
import SignInPage from '@/app/auth/sign-in/page';

// Mock the hooks and components
jest.mock('@/hooks/use-auth', () => ({
    useAuth: jest.fn(() => ({
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        loading: false,
        error: null,
        success: null,
    })),
}));

jest.mock('next/link', () => {
    return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
        return <a href={href}>{children}</a>;
    };
});

describe('SignInPage', () => {
    it('renders successfully', () => {
        render(<SignInPage />);

        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
        expect(screen.getByText('Sign in to your account to start making predictions')).toBeInTheDocument();
    });

    it('displays navigation link', () => {
        render(<SignInPage />);

        expect(screen.getByText('Back to Home')).toBeInTheDocument();
    });

    it('displays form elements', () => {
        render(<SignInPage />);

        expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    });

    it('displays footer text', () => {
        render(<SignInPage />);

        expect(screen.getByText(/By signing in, you agree to our terms/)).toBeInTheDocument();
    });
});
