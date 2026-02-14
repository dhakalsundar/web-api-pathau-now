'use client';

import { TimelineSkeleton, SkeletonLoader } from './Skeletons/SkeletonLoader';

/**
 * Loading Skeleton Component
 * Shows placeholder content while data is loading
 * Used especially on the tracking page
 */
export default function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg">
        {/* Gradient Header */}
        <div className="h-24 bg-gradient-to-r from-gray-300 to-gray-400 animate-pulse"></div>

        {/* Details Grid */}
        <div className="p-8 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <SkeletonLoader height="h-4" rounded="rounded" width="w-1/2" />
              <SkeletonLoader height="h-4" rounded="rounded" width="w-full" />
              <SkeletonLoader height="h-4" rounded="rounded" width="w-5/6" />
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Section Skeleton */}
      <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-lg">
        <SkeletonLoader height="h-6" rounded="rounded" width="w-1/3" />

        <div className="mt-8">
          <TimelineSkeleton count={5} />
        </div>
      </div>

      {/* Info Cards Skeleton */}
      <div className="grid md:grid-cols-2 gap-8">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-8">
            <SkeletonLoader height="h-6" rounded="rounded" width="w-1/3" />
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex justify-between">
                  <SkeletonLoader height="h-4" rounded="rounded" width="w-1/4" />
                  <SkeletonLoader height="h-4" rounded="rounded" width="w-1/3" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
