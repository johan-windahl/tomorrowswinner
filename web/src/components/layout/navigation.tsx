"use client";

import Link from "next/link";
import { useUserProfile } from "@/hooks/use-user-profile";

export function Navigation() {
    const { user, signOut } = useUserProfile();

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Sign out failed:', error);
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-700">
            <nav className="container flex items-center justify-between py-4">
                <Link
                    className="text-xl font-bold gradient-text hover:scale-105 transition-transform duration-200"
                    href="/"
                >
                    Tomorrow&apos;s Winner
                </Link>

                <div className="hidden md:flex items-center space-x-8">
                    <Link
                        className="text-gray-300 hover:text-gray-100 font-medium transition-colors duration-200 relative group"
                        href="/competitions"
                    >
                        Competitions
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
                    </Link>
                    <Link
                        className="text-gray-300 hover:text-gray-100 font-medium transition-colors duration-200 relative group"
                        href="/leaderboard"
                    >
                        Leaderboards
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
                    </Link>
                </div>

                <div className="flex items-center space-x-3">
                    {user && (
                        <Link
                            className="text-gray-300 hover:text-gray-100 font-medium transition-colors duration-200 hidden sm:block"
                            href="/profile"
                        >
                            Profile
                        </Link>
                    )}
                    {user ? (
                        <button
                            onClick={handleSignOut}
                            className="btn btn-outline"
                        >
                            Sign Out
                        </button>
                    ) : (
                        <Link
                            className="btn btn-primary"
                            href="/auth/sign-in"
                        >
                            Sign In
                        </Link>
                    )}
                </div>
            </nav>
        </header>
    );
}
