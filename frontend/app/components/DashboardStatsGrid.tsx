'use client';

import StatCard from '@/app/components/StatCard';
import { useDashboardStats } from '@/app/hooks/useDashboardStats';

export default function DashboardStatsGrid() {
  const { stats, loading, error } = useDashboardStats();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-lg border border-gray-300 animate-pulse h-32" />
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 text-center">
        <p className="text-red-700 font-semibold">❌ Failed to load statistics</p>
        <p className="text-red-600 text-sm mt-2">{error || 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Total Shipments */}
      <StatCard
        icon="📦"
        label="Total Shipments"
        value={stats.shipments.total}
        color="amber"
      />

      {/* Delivered Shipments */}
      <StatCard
        icon="✅"
        label="Delivered"
        value={stats.shipments.delivered}
        color="green"
        trend={`${Math.round((stats.shipments.delivered / stats.shipments.total) * 100) || 0}%`}
        trendPositive={true}
      />

      {/* Pending Shipments */}
      <StatCard
        icon="⏳"
        label="Pending"
        value={stats.shipments.pending}
        color="blue"
      />

      {/* Total Users */}
      <StatCard
        icon="👥"
        label="Total Users"
        value={stats.users.totalUsers}
        color="purple"
      />

      {/* Total Riders */}
      <StatCard
        icon="🏍️"
        label="Total Riders"
        value={stats.riders.total}
        color="red"
        trend={`${stats.riders.available} available`}
        trendPositive={true}
      />
    </div>
  );
}
