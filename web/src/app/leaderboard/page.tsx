"use client";
import { useState, useEffect } from "react";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { useAnalytics } from "@/hooks/use-analytics";
import { PageHeader } from "@/components/layout/page-header";
import { PeriodSelector } from "@/components/leaderboard/period-selector";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { LeaderboardStats } from "@/components/leaderboard/leaderboard-stats";
import { ErrorState } from "@/components/ui/error-states";
import type { TimePeriod } from "@/types/competition";

export default function LeaderboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("today");
  const { leaderboard, loading, error } = useLeaderboard(selectedPeriod);
  const { trackEngagement, trackFilter } = useAnalytics();

  // Track leaderboard view
  useEffect(() => {
    trackEngagement('leaderboard_view', selectedPeriod);
  }, [selectedPeriod, trackEngagement]);

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
    trackFilter('time_period', period);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <PageHeader
        title="Global Leaderboards"
        description="See who made the best predictions across all competitions. Rankings based on accuracy and performance."
      />

      <div className="container py-8">
        {/* Period Selector */}
        <PeriodSelector
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
        />

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Error State */}
          {error && (
            <ErrorState
              title="Failed to load leaderboard"
              message={error}
              onAction={() => window.location.reload()}
            />
          )}

          {/* Leaderboard Table */}
          {!error && (
            <>
              <LeaderboardTable
                leaderboard={leaderboard}
                loading={loading}
              />

              {/* Stats Summary */}
              <LeaderboardStats
                leaderboard={leaderboard}
                period={selectedPeriod}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}