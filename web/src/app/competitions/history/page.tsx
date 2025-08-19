"use client";
import { useCompetitions } from "@/hooks/use-competitions";
import { PageHeader } from "@/components/layout/page-header";
import { CompetitionListItem } from "@/components/competition/competition-list-item";
import { CompetitionListSkeleton } from "@/components/ui/loading-states";
import { ErrorState, EmptyState } from "@/components/ui/error-states";
import { ClockIcon } from "@/components/ui/icons";
import type { HistoricalCompetition } from "@/types/competition";

export default function CompetitionHistoryPage() {
    const { competitions, loading, error, refetch } = useCompetitions({ type: 'historical' });

    const breadcrumbs = [
        { label: 'Active Competitions', href: '/competitions' },
        { label: 'History', active: true },
    ];

    return (
        <div className="min-h-screen bg-gray-900">
            <PageHeader
                title="Competition History"
                description="Browse past prediction contests and see which assets performed best."
                breadcrumbs={breadcrumbs}
            />

            <div className="container py-12">
                {/* Loading State */}
                {loading && <CompetitionListSkeleton />}

                {/* Error State */}
                {error && (
                    <ErrorState
                        title="Failed to load history"
                        message={error}
                        onAction={refetch}
                    />
                )}

                {/* Competitions List */}
                {!loading && !error && (
                    <>
                        {competitions.length === 0 ? (
                            <EmptyState
                                title="No past competitions"
                                message="Historical data will appear here after competitions end."
                                icon={<ClockIcon size={40} className="text-gray-400" />}
                            />
                        ) : (
                            <div className="space-y-4">
                                {competitions.map((competition) => (
                                    <CompetitionListItem
                                        key={competition.id}
                                        competition={competition as HistoricalCompetition}
                                        showWinner
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
