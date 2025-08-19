"use client";
import Link from "next/link";
import { useUserProfile } from "@/hooks/use-user-profile";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileStats } from "@/components/profile/profile-stats";
import { AchievementsCard } from "@/components/profile/achievements-card";
import { AccountInfo } from "@/components/profile/account-info";
import { AvatarDisplay } from "@/components/profile/avatar-display";
import { LoadingSkeleton } from "@/components/ui/loading-states";
import { ErrorState } from "@/components/ui/error-states";

export default function ProfilePage() {
  const { user, stats, achievements, loading, error, updating, signOut, updateProfile } = useUserProfile();

  // Loading state with dark theme
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <PageHeader
          title={<LoadingSkeleton className="h-8 w-48 mx-auto" />}
          description=""
        />
        <div className="container py-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <LoadingSkeleton className="h-6 w-48 mb-4" />
                  <div className="space-y-4">
                    <LoadingSkeleton className="h-12 w-full" />
                    <LoadingSkeleton className="h-12 w-full" />
                    <LoadingSkeleton className="h-10 w-32" />
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <LoadingSkeleton className="h-6 w-24 mb-4" />
                  <div className="space-y-3">
                    <LoadingSkeleton className="h-4 w-full" />
                    <LoadingSkeleton className="h-4 w-full" />
                    <LoadingSkeleton className="h-4 w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <PageHeader title="Profile" description="" />
        <div className="container py-8">
          <ErrorState
            title="Failed to load profile"
            message={error}
            onAction={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  // Not authenticated state
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900">
        <PageHeader title="Profile" description="" />
        <div className="container py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-100 mb-4">Sign In Required</h1>
            <p className="text-lg text-gray-300 mb-8">You need to sign in to view your profile.</p>
            <Link href="/auth/sign-in" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main profile page
  return (
    <div className="min-h-screen bg-gray-900">
      <PageHeader
        title={
          <div className="flex flex-col items-center">
            <AvatarDisplay
              avatarUrl={user.avatarUrl}
              avatarType={user.avatarType}
              displayName={user.displayName}
              email={user.email}
              size="xl"
              className="mb-4"
            />
            <span className="gradient-text">
              {user.displayName ? `${user.displayName}'s Profile` : 'Your Profile'}
            </span>
          </div>
        }
        description="Manage your account and view your prediction stats"
      />

      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Account Info */}
            <div className="lg:col-span-2">
              <AccountInfo
                user={user}
                updating={updating}
                onProfileUpdate={updateProfile}
                onDeleteAccount={() => {
                  // In a real app, this would handle account deletion
                  console.log('Delete account requested');
                }}
              />
            </div>

            {/* Stats Sidebar */}
            <div className="space-y-6">
              <ProfileStats stats={stats} />
              <AchievementsCard
                achievements={achievements}
                onViewAll={() => {
                  // In a real app, this would navigate to achievements page
                  console.log('View all achievements');
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
