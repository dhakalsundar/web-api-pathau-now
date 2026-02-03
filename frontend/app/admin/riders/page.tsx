'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import DataTable from '@/app/components/DataTable';
import { riderService } from '@/app/lib/services';
import Link from 'next/link';

export default function AdminRidersPage() {
  const router = useRouter();
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });

  useEffect(() => {
    fetchRiders();
  }, [filters]);

  const fetchRiders = async () => {
    try {
      setLoading(true);

      let response;
      if (filters.search) {
        response = await riderService.searchRiders(filters.search);
      } else {
        response = await riderService.getAllRiders(1, 50, filters.status ? { status: filters.status } : {});
      }

      setRiders(response.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load riders');
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: '📊', badge: 0 },
    { label: 'Shipments', href: '/admin/shipments', icon: '📦', badge: 0 },
    { label: 'Riders', href: '/admin/riders', icon: '🚴', badge: 0 },
    { label: 'Users', href: '/admin/users', icon: '👥', badge: 0 },
    { label: 'Analytics', href: '/admin/analytics', icon: '📈', badge: 0 },
  ];

  const columns = [
    { key: 'name', label: 'Name', width: '150px' },
    { key: 'phone', label: 'Phone', width: '140px' },
    { key: 'status', label: 'Status', width: '120px' },
    { key: 'assignedParcels', label: 'Parcels', width: '100px' },
    { key: 'rating', label: 'Rating', width: '100px' },
    { key: 'totalDeliveries', label: 'Deliveries', width: '100px' },
  ];

  const formattedData = riders.map((r: any) => ({
    name: r.name || '-',
    phone: r.phone || '-',
    status: r.status || 'OFFLINE',
    assignedParcels: r.assignedParcels?.length || 0,
    rating: `${(r.rating || 0).toFixed(1)}/5 ⭐`,
    totalDeliveries: r.totalDeliveries || 0,
  }));

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar items={sidebarItems} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">🚴 Riders</h1>
              <p className="text-gray-600">Manage delivery partners</p>
            </div>
            <button
              onClick={() => router.push('/admin/riders/new')}
              className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold"
            >
              + New Rider
            </button>
          </div>

          {error && (
            <div className="mb-8 bg-red-50 border-2 border-red-300 rounded-lg p-4 text-red-700 font-semibold">
              ❌ {error}
            </div>
          )}

          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Name or phone..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">All Status</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="BUSY">Busy</option>
                  <option value="OFFLINE">Offline</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ status: '', search: '' })}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <DataTable
            columns={columns}
            data={formattedData}
            actions={[
              {
                label: 'View',
                onClick: (row) => router.push(`/admin/riders/${row.name}`),
                color: 'blue',
              },
              {
                label: 'Edit',
                onClick: (row) => router.push(`/admin/riders/${row.name}/edit`),
                color: 'amber',
              },
            ]}
            isLoading={loading}
            emptyMessage="No riders found"
          />
        </div>
      </main>
    </div>
  );
}
