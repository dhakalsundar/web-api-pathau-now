'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import DataTable from '@/app/components/DataTable';
import { adminService, shipmentService } from '@/app/lib/services';
import Link from 'next/link';

export default function AdminShipmentsPage() {
  const router = useRouter();
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });

  useEffect(() => {
    fetchShipments();
  }, [filters]);

  const fetchShipments = async () => {
    try {
      setLoading(true);

      let response;
      if (filters.search) {
        response = await adminService.searchAdminShipments(filters.search);
      } else {
        response = await adminService.getAllAdminShipments(1, 50, filters.status ? { status: filters.status } : {});
      }

      setShipments(response.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load shipments');
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
    { key: 'trackingNumber', label: 'Tracking', width: '140px' },
    { key: 'status', label: 'Status', width: '120px' },
    { key: 'sender', label: 'Sender', width: '150px' },
    { key: 'recipient', label: 'Recipient', width: '150px' },
    { key: 'price', label: 'Price', width: '100px' },
    { key: 'createdAt', label: 'Booked', width: '120px' },
  ];

  const formattedData = shipments.map((s: any) => ({
    trackingNumber: s.trackingNumber,
    status: s.status?.replace('_', ' '),
    sender: s.sender?.name || '-',
    recipient: s.recipient?.name || '-',
    price: `৳${s.price}`,
    createdAt: new Date(s.createdAt).toLocaleDateString(),
  }));

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar items={sidebarItems} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">📦 Shipments</h1>
              <p className="text-gray-600">Manage all parcels</p>
            </div>
            <Link
              href="/booking"
              className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold"
            >
              + New Shipment
            </Link>
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
                  placeholder="Tracking number or name..."
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
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="PICKED_UP">Picked Up</option>
                  <option value="IN_TRANSIT">In Transit</option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="FAILED">Failed</option>
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
                onClick: (row) => router.push(`/admin/shipments/${row.trackingNumber}`),
                color: 'blue',
              },
              {
                label: 'Edit',
                onClick: (row) => router.push(`/admin/shipments/${row.trackingNumber}/edit`),
                color: 'amber',
              },
            ]}
            isLoading={loading}
            emptyMessage="No shipments found"
          />
        </div>
      </main>
    </div>
  );
}
