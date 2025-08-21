/**
 * Authentication form component
 * Handles sign in and sign up with consistent styling
 */

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useAnalytics } from '@/hooks/use-analytics';
import { MessageBanner } from '@/components/ui/error-states';
import { Spinner } from '@/components/ui/loading-states';
import { CheckCircleIcon } from '@/components/ui/icons';
import { classUtils } from '@/lib/utils';

interface AuthFormProps {
    mode?: 'signin' | 'signup';
    onModeChange?: (mode: 'signin' | 'signup') => void;
}

export function AuthForm({ mode = 'signin', onModeChange }: AuthFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn, signUp, signOut, loading, error, success } = useAuth();
    const { trackUser } = useAnalytics();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'signin') {
            await signIn(email, password);
            // Track successful sign in
            if (!error) {
                trackUser('sign_in', 'email');
            }
        } else {
            await signUp(email, password);
            // Track successful sign up
            if (!error) {
                trackUser('sign_up', 'email');
            }
        }
    };

    const message = error || success;
    const messageType = error ? 'error' : 'success';

    return (
        <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <CheckCircleIcon size={32} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-100 mb-2">
                    {mode === 'signin' ? 'Welcome Back' : 'Join Tomorrow\'s Winner'}
                </h1>
                <p className="text-gray-300">
                    {mode === 'signin'
                        ? 'Sign in to your account to start making predictions'
                        : 'Create an account to join prediction competitions'
                    }
                </p>
            </div>

            {/* Form */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {message && (
                        <MessageBanner
                            message={message}
                            type={messageType}
                        />
                    )}

                    <div className="space-y-3">
                        <button
                            disabled={loading}
                            className={classUtils.getButtonClasses('primary')}
                            style={{ width: '100%' }}
                            type="submit"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Spinner size="sm" />
                                    {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                                </div>
                            ) : (
                                mode === 'signin' ? 'Sign In' : 'Create Account'
                            )}
                        </button>

                        <div className="flex gap-3">
                            {onModeChange && (
                                <button
                                    disabled={loading}
                                    className={`${classUtils.getButtonClasses('outline')} flex-1`}
                                    type="button"
                                    onClick={() => onModeChange(mode === 'signin' ? 'signup' : 'signin')}
                                >
                                    {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                                </button>
                            )}
                            <button
                                disabled={loading}
                                className={`${classUtils.getButtonClasses('ghost')} flex-1`}
                                type="button"
                                onClick={signOut}
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Footer */}
            <div className="text-center mt-6">
                <p className="text-sm text-gray-400">
                    {mode === 'signin' ? 'New to Tomorrow\'s Winner?' : 'Already have an account?'}{' '}
                    {onModeChange && (
                        <button
                            className="text-blue-400 font-medium hover:text-blue-300 transition-colors"
                            onClick={() => onModeChange(mode === 'signin' ? 'signup' : 'signin')}
                        >
                            {mode === 'signin' ? 'Create an account' : 'Sign in instead'}
                        </button>
                    )}
                </p>
            </div>
        </div>
    );
}
