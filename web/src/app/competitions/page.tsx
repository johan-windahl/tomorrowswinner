"use client";

import { useCompetitions } from "@/hooks/use-competitions";
import { PageHeader } from "@/components/layout/page-header";
import { CompetitionCard } from "@/components/competition/competition-card";
import { CompetitionCardSkeleton } from "@/components/ui/loading-states";
import { ErrorState, EmptyState } from "@/components/ui/error-states";
import { ChartBarIcon } from "@/components/ui/icons";
import type { Competition } from "@/types/competition";

export default function CompetitionsPage() {
  const { competitions, loading, error, refetch } = useCompetitions({ type: 'active' });

  const breadcrumbs = [
    { label: 'Active Competitions', active: true },
    { label: 'History', href: '/competitions/history' },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <PageHeader
        title="Active Competitions"
        description="Join live prediction contests and test your market knowledge against traders worldwide."
        breadcrumbs={breadcrumbs}
      />

      <div className="container py-12">
        {/* Loading State */}
        {loading && <CompetitionCardSkeleton />}

        {/* Error State */}
        {error && (
          <ErrorState
            title="Failed to load competitions"
            message={error}
            onAction={refetch}
          />
        )}

        {/* Competitions Grid */}
        {!loading && !error && (
          <>
            {competitions.length === 0 ? (
              <EmptyState
                title="No active competitions"
                message="Check back soon for new prediction contests!"
                icon={<ChartBarIcon size={40} className="text-gray-400" />}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {competitions.map((competition) => (
                  <CompetitionCard
                    key={competition.id}
                    competition={competition as Competition}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
