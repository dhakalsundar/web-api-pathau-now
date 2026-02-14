'use client';

/**
 * Base Skeleton Loader Component
 * Uses Tailwind CSS animations for shimmer effect
 */
export function SkeletonLoader({ width = 'w-full', height = 'h-4', rounded = 'rounded' }) {
  return (
    <div
      className={`${width} ${height} ${rounded} bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse`}
    />
  );
}

/**
 * Table Row Skeleton - for list/table data
 */
export function TableRowSkeleton({ columnCount = 5 }) {
  return (
    <div className="border-b border-gray-200 p-4 space-y-3">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}>
        {Array(columnCount)
          .fill(0)
          .map((_, i) => (
            <SkeletonLoader key={i} height="h-4" rounded="rounded" />
          ))}
      </div>
    </div>
  );
}

/**
 * Card Skeleton - for card-based layouts
 */
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <SkeletonLoader height="h-6" rounded="rounded" width="w-1/3" />
      <SkeletonLoader height="h-4" rounded="rounded" width="w-full" />
      <SkeletonLoader height="h-4" rounded="rounded" width="w-5/6" />
      <div className="flex gap-2 pt-2">
        <SkeletonLoader height="h-8" rounded="rounded" width="w-20" />
        <SkeletonLoader height="h-8" rounded="rounded" width="w-20" />
      </div>
    </div>
  );
}

/**
 * Profile Card Skeleton - for user/rider profiles
 */
export function ProfileCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <SkeletonLoader width="w-16 h-16" rounded="rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonLoader height="h-5" rounded="rounded" width="w-1/3" />
          <SkeletonLoader height="h-4" rounded="rounded" width="w-1/4" />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="space-y-2">
              <SkeletonLoader height="h-3" rounded="rounded" width="w-1/2" />
              <SkeletonLoader height="h-5" rounded="rounded" width="w-full" />
            </div>
          ))}
      </div>
    </div>
  );
}

/**
 * List Items Skeleton - for loading multiple items
 */
export function ListItemSkeleton({ count = 3 }) {
  return (
    <>
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <SkeletonLoader height="h-4" rounded="rounded" width="w-1/3" />
                <SkeletonLoader height="h-3" rounded="rounded" width="w-1/2" />
              </div>
              <SkeletonLoader height="h-6 w-12" rounded="rounded" />
            </div>
          </div>
        ))}
    </>
  );
}

/**
 * Expandable Row Skeleton - for detailed view rows (used in tables)
 */
export function ExpandableRowSkeleton({ columnCount = 5 }) {
  return (
    <>
      {/* Summary Row */}
      <div className="border-b border-gray-200 p-4 space-y-3">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}>
          {Array(columnCount)
            .fill(0)
            .map((_, i) => (
              <SkeletonLoader key={i} height="h-4" rounded="rounded" />
            ))}
        </div>
      </div>

      {/* Expanded Detail Row */}
      <div className="bg-gray-50 border-b border-gray-200 p-8 space-y-6">
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="space-y-2">
                  <SkeletonLoader height="h-3" rounded="rounded" width="w-1/3" />
                  <SkeletonLoader height="h-4" rounded="rounded" width="w-full" />
                </div>
              ))}
          </div>

          <div className="space-y-3">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <SkeletonLoader key={i} height="h-10" rounded="rounded" width="w-full" />
              ))}
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Pagination Controls Skeleton
 */
export function PaginationSkeleton() {
  return (
    <div className="flex items-center justify-between mt-4">
      <SkeletonLoader height="h-4 w-32" rounded="rounded" />
      <div className="flex gap-2">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <SkeletonLoader key={i} height="h-9 w-9" rounded="rounded" />
          ))}
      </div>
    </div>
  );
}

/**
 * Dashboard Stats Skeleton - for stat cards
 */
export function DashboardStatsSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
            <SkeletonLoader height="h-4" rounded="rounded" width="w-1/2" />
            <SkeletonLoader height="h-8" rounded="rounded" width="w-2/3" />
            <SkeletonLoader height="h-3" rounded="rounded" width="w-1/3" />
          </div>
        ))}
    </div>
  );
}

/**
 * Timeline Skeleton - for tracking/timeline views
 */
export function TimelineSkeleton({ count = 5 }) {
  return (
    <div className="space-y-6">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <SkeletonLoader width="w-4 h-4" rounded="rounded-full" />
              {i < count - 1 && <div className="w-0.5 h-16 bg-gray-200 mt-2" />}
            </div>
            <div className="flex-1 space-y-2 pt-1">
              <SkeletonLoader height="h-4" rounded="rounded" width="w-1/3" />
              <SkeletonLoader height="h-3" rounded="rounded" width="w-full" />
              <SkeletonLoader height="h-3" rounded="rounded" width="w-2/3" />
            </div>
          </div>
        ))}
    </div>
  );
}

/**
 * Form Input Skeleton - for form fields
 */
export function FormInputSkeleton() {
  return (
    <div className="space-y-2">
      <SkeletonLoader height="h-4" rounded="rounded" width="w-1/4" />
      <SkeletonLoader height="h-10" rounded="rounded" width="w-full" />
    </div>
  );
}

/**
 * Form Complete Skeleton - multiple inputs
 */
export function FormCompleteSkeleton({ fieldCount = 4 }) {
  return (
    <div className="space-y-4">
      {Array(fieldCount)
        .fill(0)
        .map((_, i) => (
          <FormInputSkeleton key={i} />
        ))}
      <div className="pt-4 flex gap-2">
        <SkeletonLoader height="h-10" rounded="rounded" width="w-24" />
        <SkeletonLoader height="h-10" rounded="rounded" width="w-24" />
      </div>
    </div>
  );
}
