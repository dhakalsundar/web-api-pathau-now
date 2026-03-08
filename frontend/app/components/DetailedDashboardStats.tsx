'use client';

import StatCard from '@/app/components/StatCard';
import { useDashboardStats } from '@/app/hooks/useDashboardStats';

export default function DetailedDashboardStats() {
  const { stats, loading, error } = useDashboardStats();

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Shipments Section Skeleton */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 p-4 rounded-lg animate-pulse h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 text-center">
        <p className="text-red-700 font-semibold">Failed to load detailed statistics</p>
        <p className="text-red-600 text-sm mt-2">{error || 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Shipment Statistics */}
      <section className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📦 Shipment Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon=""
            label="Total"
            value={stats.shipments.total}
            color="amber"
          />
          <StatCard
            icon=""
            label="Pending"
            value={stats.shipments.pending}
            color="blue"
          />
          <StatCard
            icon=""
            label="Picked Up"
            value={stats.shipments.pickedUp}
            color="green"
          />
          <StatCard
            icon=""
            label="In Transit"
            value={stats.shipments.inTransit}
            color="amber"
          />
          <StatCard
            icon=""
            label="Out for Delivery"
            value={stats.shipments.outForDelivery}
            color="amber"
          />
          <StatCard
            icon=""
            label="Delivered"
            value={stats.shipments.delivered}
            color="green"
            trend={`${Math.round((stats.shipments.delivered / stats.shipments.total) * 100) || 0}%`}
            trendPositive={true}
          />
          <StatCard
            icon=""
            label="Failed"
            value={stats.shipments.failed}
            color="red"
          />
          <StatCard
            icon=""
            label="Cancelled"
            value={stats.shipments.cancelled}
            color="purple"
          />
        </div>
      </section>

      {/* Rider Statistics */}
      <section className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🏍️ Rider Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon=""
            label="Total Riders"
            value={stats.riders.total}
            color="red"
          />
          <StatCard
            icon=""
            label="Available"
            value={stats.riders.available}
            color="green"
            trend={`${Math.round((stats.riders.available / stats.riders.total) * 100) || 0}%`}
            trendPositive={true}
          />
          <StatCard
            icon="🟡"
            label="Busy"
            value={stats.riders.busy}
            color="blue"
          />
          <StatCard
            icon="🔴"
            label="Offline"
            value={stats.riders.offline}
            color="blue"
          />
        </div>
      </section>

      {/* User Statistics */}
      <section className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6"> User Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon=""
            label="Total Users"
            value={stats.users.totalUsers}
            color="purple"
          />
          <StatCard
            icon=""
            label="Customers"
            value={stats.users.totalCustomers}
            color="blue"
          />
          <StatCard
            icon=""
            label="Staff"
            value={stats.users.totalStaff}
            color="amber"
          />
          <StatCard
            icon=""
            label="Admins"
            value={stats.users.totalAdmins}
            color="green"
          />
        </div>
      </section>

      {/* Revenue Statistics */}
      <section className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6"> Revenue Statistics</h2>
        
        <StatCard
          icon=""
          label="Total Revenue"
          value={`Rs${stats.revenue.total.toLocaleString()}`}
          color="green"
          trend={`${(stats.revenue.total / stats.shipments.delivered || 0).toFixed(2)} per delivery`}
          trendPositive={true}
        />
      </section>
    </div>
  );
}
