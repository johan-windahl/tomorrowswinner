"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type User = {
  id: string;
  email?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!cancelled) {
        setUser(data.user ? { id: data.user.id, email: data.user.email ?? undefined } : null);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-8"></div>
            <div className="card">
              <div className="card-body space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Profile</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">You need to sign in to view your profile.</p>
          <a href="/auth/sign-in" className="btn btn-primary">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Your Profile</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Manage your account and view your prediction stats</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Info */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Account Information</h2>
              </div>
              <div className="card-body space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                  <div className="input bg-gray-50 dark:bg-gray-800 cursor-not-allowed">
                    {user.email || "No email provided"}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your email address cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">User ID</label>
                  <div className="input bg-gray-50 dark:bg-gray-800 cursor-not-allowed font-mono text-sm">
                    {user.id}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your unique identifier</p>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="btn btn-outline text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your Stats</h3>
              </div>
              <div className="card-body space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Total Predictions</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Accuracy Rate</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">75%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Current Streak</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">3 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Best Streak</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">8 days</span>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Achievements</h3>
              </div>
              <div className="card-body space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                    🏆
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">First Win</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Made your first correct prediction</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    🔥
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Hot Streak</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">3 correct predictions in a row</div>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <button className="btn btn-outline text-sm">
                    View All Achievements
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
