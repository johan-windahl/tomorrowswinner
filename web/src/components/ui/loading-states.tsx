/**
 * Reusable loading state components
 * Consistent loading skeletons and spinners
 */

import { dataUtils } from '@/lib/utils';

interface LoadingSkeletonProps {
    className?: string;
}

export function LoadingSkeleton({ className = "" }: LoadingSkeletonProps) {
    return (
        <div className={`animate-pulse bg-gray-700 rounded ${className}`} />
    );
}

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function Spinner({ size = 'md', className = "" }: SpinnerProps) {
    const sizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-5 h-5',
        lg: 'w-8 h-8',
    };

    return (
        <div className={`${sizeClasses[size]} border-2 border-white border-t-transparent rounded-full animate-spin ${className}`} />
    );
}

interface CompetitionCardSkeletonProps {
    count?: number;
}

export function CompetitionCardSkeleton({ count = 6 }: CompetitionCardSkeletonProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {dataUtils.createSkeletonArray(count).map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse border border-gray-700">
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-700 rounded w-full"></div>
                </div>
            ))}
        </div>
    );
}

interface CompetitionListSkeletonProps {
    count?: number;
}

export function CompetitionListSkeleton({ count = 8 }: CompetitionListSkeletonProps) {
    return (
        <div className="space-y-4">
            {dataUtils.createSkeletonArray(count).map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-4 bg-gray-700 rounded w-16"></div>
                            <div className="h-5 bg-gray-700 rounded w-48"></div>
                        </div>
                        <div className="h-4 bg-gray-700 rounded w-24"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

interface AssetRowSkeletonProps {
    count?: number;
    showMobile?: boolean;
}

export function AssetRowSkeleton({ count = 15, showMobile = true }: AssetRowSkeletonProps) {
    return (
        <>
            {dataUtils.createSkeletonArray(count).map((_, idx) => (
                <div key={idx} className="hover:bg-gray-700 transition-colors duration-150">
                    {/* Desktop Layout */}
                    <div className="hidden md:flex items-center gap-3 px-6 py-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-700 animate-pulse flex-shrink-0" />
                        <div className="min-w-0 w-20 flex-shrink-0">
                            <div className="h-4 bg-gray-700 rounded w-16 animate-pulse"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="h-3 bg-gray-700 rounded w-40 animate-pulse"></div>
                        </div>
                        <div className="text-right w-24 flex-shrink-0">
                            <div className="h-4 bg-gray-700 rounded w-20 animate-pulse ml-auto"></div>
                        </div>
                        <div className="text-right w-28 flex-shrink-0">
                            <div className="h-4 bg-gray-700 rounded w-16 animate-pulse ml-auto"></div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="h-8 w-8 bg-gray-700 rounded animate-pulse"></div>
                            <div className="h-8 w-16 bg-gray-700 rounded animate-pulse"></div>
                        </div>
                    </div>

                    {/* Mobile Layout */}
                    {showMobile && (
                        <div className="md:hidden px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="w-12 h-12 rounded-lg bg-gray-700 animate-pulse flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-700 rounded w-20 mb-2"></div>
                                        <div className="h-3 bg-gray-700 rounded w-32"></div>
                                    </div>
                                </div>
                                <div className="h-10 w-20 bg-gray-700 rounded-lg animate-pulse"></div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </>
    );
}

interface LeaderboardSkeletonProps {
    count?: number;
}

export function LeaderboardSkeleton({ count = 8 }: LeaderboardSkeletonProps) {
    return (
        <>
            {dataUtils.createSkeletonArray(count).map((_, i) => (
                <div key={i} className="px-4 py-3 animate-pulse">
                    <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-1 flex justify-center">
                            <div className="w-6 h-6 bg-gray-700 rounded"></div>
                        </div>
                        <div className="col-span-3 flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                            <div className="h-4 bg-gray-700 rounded w-20"></div>
                        </div>
                        <div className="col-span-2 text-center">
                            <div className="h-4 bg-gray-700 rounded w-12 mx-auto"></div>
                        </div>
                        <div className="col-span-2 text-center">
                            <div className="h-4 bg-gray-700 rounded w-12 mx-auto"></div>
                        </div>
                        <div className="col-span-2 text-center">
                            <div className="h-4 bg-gray-700 rounded w-12 mx-auto"></div>
                        </div>
                        <div className="col-span-2 text-center">
                            <div className="h-4 bg-gray-700 rounded w-12 mx-auto"></div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}
