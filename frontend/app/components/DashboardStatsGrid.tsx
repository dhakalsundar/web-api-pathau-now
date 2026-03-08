'use client';

import { useRouter } from 'next/navigation';
import StatCard from '@/app/components/StatCard';
import { useDashboardStats } from '@/app/hooks/useDashboardStats';

export default function DashboardStatsGrid() {
  const router = useRouter();
  const { stats, loading, error, refetch } = useDashboardStats();

  const handleCardClick = (route: string) => {
    router.push(route);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 text-center mb-8">
        <p className="text-red-700 font-semibold mb-2"> Failed to load statistics</p>
        <p className="text-red-600 text-sm mb-4">{error || 'Unknown error'}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900"> Key Metrics</h2>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition"
          title="Refresh statistics"
        >
           Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Parcels */}
        <StatCard
          icon=""
          label="Total Parcels"
          value={stats.shipments.total}
          color="amber"
          onClick={() => handleCardClick('/admin/parcels')}
        />

        {/* Delivered Parcels */}
        <StatCard
          icon=""
          label="Delivered"
          value={stats.shipments.delivered}
          color="green"
          trend={`${Math.round((stats.shipments.delivered / (stats.shipments.total || 1)) * 100) || 0}%`}
          trendPositive={true}
          onClick={() => handleCardClick('/admin/parcels?status=DELIVERED')}
        />

        {/* Pending Parcels */}
        <StatCard
          icon=""
          label="Pending"
          value={stats.shipments.pending}
          color="blue"
          onClick={() => handleCardClick('/admin/parcels?status=PENDING')}
        />

        {/* Total Users (Normal Users + Staff + Admins) */}
        <StatCard
          icon=""
          label="Total Users"
          value={stats.users.totalUsers}
          color="purple"
          onClick={() => handleCardClick('/admin/users')}
        />

        {/* Total Riders */}
        <StatCard
          icon=""
          label="Total Riders"
          value={stats.riders.total}
          color="red"
          trend={`${stats.riders.available} available`}
          trendPositive={true}
          onClick={() => handleCardClick('/admin/riders')}
        />
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
        {/* In Transit */}
        <StatCard
          icon=""
          label="In Transit"
          value={stats.shipments.inTransit}
          color="indigo"
        />

        {/* Out for Delivery */}
        <StatCard
          icon=""
          label="Out for Delivery"
          value={stats.shipments.outForDelivery}
          color="emerald"
        />

        {/* Riders Available */}
        <StatCard
          icon=""
          label="Riders Available"
          value={stats.riders.available}
          color="green"
        />

        {/* Riders Busy */}
        <StatCard
          icon=""
          label="Riders Busy"
          value={stats.riders.busy}
          color="amber"
        />
      </div>
    </div>
  );
}
